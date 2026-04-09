import logging

from songs.models import Song, Status
from songs.repositories import SongRepository
from songs.clients import SunoClient

logger = logging.getLogger(__name__)


class SongService:
    """Business logic layer — orchestrates repositories and external clients."""

    def __init__(self):
        self.repository = SongRepository()
        self.suno_client = SunoClient()

    # ── Queries ───────────────────────────────────────────────────────────────

    def list_songs(self):
        return self.repository.find_all()

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
            status=Status.PENDING,
        )
        song = self.repository.save(song)
        song = self.generate_song(song)
        return song

    def generate_song(self, song: Song) -> Song:
        """
        Submit the song to SUNO. Returns immediately with GENERATING status.
        The actual completion is handled via the SUNO callback.
        Never raises — sets status to FAILED on any error.
        """
        try:
            prompt = song.prompt or self._build_prompt(song)
            task_id = self.suno_client.generate(
                prompt=prompt,
                style=song.genre,
                title=song.title,
            )
            return self.repository.update_status(
                song, Status.GENERATING, suno_task_id=task_id
            )
        except Exception as e:
            logger.exception("SUNO generation failed for song %d: %s", song.id, e)
            return self.repository.update_status(song, Status.FAILED)

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
            audio_url = tracks[0].get("audio_url", "")
            self.repository.update_status(
                song, Status.COMPLETED,
                audio_url=audio_url,
                shareable_link=audio_url,
            )
            logger.info("Song %d completed via SUNO callback", song.id)
        elif callback_type == "error":
            self.repository.update_status(song, Status.FAILED)
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
            f"A {song.genre} song with a {song.mood} mood, "
            f"suitable for {song.ocasion}, "
            f"sung by a {song.singer_voice} voice"
        )
