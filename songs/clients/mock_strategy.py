import logging
import threading
import time
import uuid
from pathlib import Path

from django.core.files.base import ContentFile

from songs.clients.base import SongGeneratorStrategy, GenerationRequest, GenerationResult, StatusResult

logger = logging.getLogger(__name__)

_MOCK_MP3_PATH = Path(__file__).resolve().parents[2] / "mockSong.MP3"
_MOCK_DELAY_SECONDS = 15


def _complete_after_delay(task_id: str) -> None:
    time.sleep(_MOCK_DELAY_SECONDS)
    try:
        from songs.repositories.song_repository import SongRepository
        from songs.models import Status

        repo = SongRepository()
        song = repo.find_by_suno_task_id(task_id)
        if song is None:
            logger.warning("Mock delayed completion: no song found for task_id=%s", task_id)
            return

        audio_content = _MOCK_MP3_PATH.read_bytes() if _MOCK_MP3_PATH.exists() else b""
        audio_file = ContentFile(audio_content, name=f"{task_id}.mp3")
        repo.update_status(
            song,
            Status.COMPLETED,
            shareable_link="mock://local/mockSong.MP3",
            audio_file=audio_file,
        )
        logger.info("Mock strategy: song %d completed after %ds delay", song.id, _MOCK_DELAY_SECONDS)
    except Exception:
        logger.exception("Mock strategy: error during delayed completion for task_id=%s", task_id)


class MockSongGeneratorStrategy(SongGeneratorStrategy):
    """
    Offline song generation strategy for development and testing.

    Returns GENERATING status immediately, then completes after 15 seconds
    using mockSong.MP3 from the repo root.
    """

    def generate(self, request: GenerationRequest) -> GenerationResult:
        task_id = f"mock-{uuid.uuid4().hex}"
        t = threading.Thread(target=_complete_after_delay, args=(task_id,), daemon=True)
        t.start()
        return GenerationResult(task_id=task_id)

    def get_status(self, task_id: str) -> StatusResult:
        from songs.repositories.song_repository import SongRepository
        from songs.models import Status

        song = SongRepository().find_by_suno_task_id(task_id)
        if song and song.status == Status.COMPLETED:
            return StatusResult(status="SUCCESS", audio_url="mock://local/mockSong.MP3")
        return StatusResult(status="PENDING")
