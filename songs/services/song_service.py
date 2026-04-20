import logging
import urllib.parse

import requests
from django.core.files.base import ContentFile

from songs.models import Song, Status
from songs.repositories import SongRepository
from songs.clients import get_generator_strategy, GenerationRequest

logger = logging.getLogger(__name__)


class SongService:
    """Business logic layer — orchestrates repositories and external clients."""

    def __init__(self):
        self.repository = SongRepository()
        self.generator = get_generator_strategy()

    # ── Queries ───────────────────────────────────────────────────────────────

    def list_songs(self):
        return self.repository.find_all()

    def list_songs_by_creator(self, user):
        """Return all non-deleted songs belonging to the given user."""
        return self.repository.find_all_by_creator(user)

    def get_song(self, song_id: int) -> Song | None:
        return self.repository.find_by_id(song_id)

    # ── Commands ──────────────────────────────────────────────────────────────

    def create_song(
        self,
        title: str,
        genre: str,
        mood: str,
        ocasion: str,
        singer_voice: str,
        creator,
        prompt: str = None,
        prompt_mode: str = 'lyric',
    ) -> Song:
        """
        Persist a new Song as PENDING, submit it to SUNO for generation,
        and return immediately with GENERATING status.

        SUNO will call back our /songs/suno-callback/ endpoint when done.
        Raises ValidationError if any field value is invalid.
        """
        song = Song(
            title=title,
            genre=genre,
            mood=mood,
            ocasion=ocasion,
            singer_voice=singer_voice,
            creator=creator,
            prompt=prompt,
            prompt_mode=prompt_mode,
            status=Status.PENDING,
        )
        song = self.repository.save(song)
        song = self.generate_song(song)
        return song

    def generate_song(self, song: Song) -> Song:
        """
        Submit the song to the active generation strategy.

        - Suno strategy: returns immediately with GENERATING status;
          completion is handled via the /songs/suno-callback/ webhook.
        - Mock strategy: completes synchronously with a placeholder audio URL.

        Never raises — sets status to FAILED on any error.
        """
        try:
            if song.prompt_mode == 'lyric':
                prompt = song.prompt or ''
                request = GenerationRequest(
                    prompt=prompt,
                    style=song.genre,
                    title=song.title,
                    custom_mode=True,
                )
            else:
                base_prompt = self._build_prompt(song)
                prompt = f"{base_prompt}. {song.prompt}" if song.prompt else base_prompt
                request = GenerationRequest(
                    prompt=prompt,
                    custom_mode=False,
                )
            result = self.generator.generate(request)

            if result.audio_url:
                logger.info("Synchronous generation for song %d, audio_url=%s", song.id, result.audio_url)
                audio_file = ContentFile(result.audio_content, name=f"{result.task_id}.mp3") if result.audio_content else None
                return self.repository.update_status(
                    song, Status.COMPLETED,
                    suno_task_id=result.task_id,
                    shareable_link=result.audio_url,
                    audio_file=audio_file,
                )

            return self.repository.update_status(
                song, Status.GENERATING, suno_task_id=result.task_id
            )
        except Exception as e:
            logger.exception("Song generation failed for song %d: %s", song.id, e)
            return self.repository.update_status(song, Status.FAILED, failure_reason=str(e))

    def handle_suno_callback(self, task_id: str, callback_type: str, tracks: list) -> bool:
        """
        Process a SUNO callback. Returns True if a matching song was found and updated.

        ``callback_type`` values: "text" | "first" | "complete" | "error"
        ``tracks``       : list of track dicts from the callback payload's data array.
        """
        song = self.repository.find_by_suno_task_id(task_id)
        if song is None:
            logger.warning("SUNO callback for unknown taskId: %s", task_id)
            return False

        if callback_type == "complete" and tracks:
            logger.info("Song %d SUNO complete callback tracks count=%d", song.id, len(tracks))
            for i, track in enumerate(tracks):
                logger.info(
                    "Song %d track[%d]: audio_url=%s stream_audio_url=%s duration=%s",
                    song.id, i,
                    track.get("audio_url", ""),
                    track.get("stream_audio_url", ""),
                    track.get("duration", "unknown"),
                )
            try:
                track = tracks[0]
                audio_url = track.get("audio_url", "")
                image_url = track.get("image_url") or None
                audio_file = self._download_audio(audio_url)
                self.repository.update_status(
                    song, Status.COMPLETED,
                    shareable_link=audio_url,
                    audio_file=audio_file,
                    cover_image_url=image_url,
                )
                logger.info("Song %d completed via SUNO callback", song.id)
            except Exception as e:
                logger.exception("Failed to download audio for song %d: %s", song.id, e)
                self.repository.update_status(song, Status.FAILED, failure_reason=f"Audio download failed: {e}")
        elif callback_type == "error":
            self.repository.update_status(song, Status.FAILED, failure_reason="Suno reported a generation error")
            logger.warning("Song %d failed via SUNO callback", song.id)
        else:
            # "text" or "first" — intermediate progress, ignore
            logger.debug("Song %d intermediate callback: %s", song.id, callback_type)

        return True

    def delete_song(self, song_id: int) -> Song | None:
        song = self.repository.find_by_id_including_deleted(song_id)
        if song is None:
            return None
        if song.deleted_at is not None:
            raise ValueError("Song already deleted")
        return self.repository.soft_delete(song)

    def update_song_status(self, song_id: int, status: str) -> Song | None:
        song = self.repository.find_by_id(song_id)
        if song is None:
            return None
        song.status = status
        song.full_clean()
        return self.repository.update_status(song, status)

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _build_prompt(self, song: Song) -> str:
        return (
            f"Title: {song.title}. "
            f"A {song.genre} song with a {song.mood} mood, "
            f"suitable for {song.ocasion}, "
            f"sung by a {song.singer_voice} voice"
        )

    def _download_audio(self, url: str) -> ContentFile:
        """Download an audio file from a URL and return a Django ContentFile."""
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        filename = urllib.parse.urlparse(url).path.split("/")[-1] or "song.mp3"
        return ContentFile(response.content, name=filename)
