import uuid

from songs.clients.base import SongGeneratorStrategy, GenerationRequest, GenerationResult


class MockSongGeneratorStrategy(SongGeneratorStrategy):
    """
    Offline, deterministic song generation strategy for development and testing.

    Does not call any external API. Returns a fixed placeholder audio URL
    and a generated task_id so the rest of the system behaves identically
    to the real Suno flow.
    """

    MOCK_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

    def generate(self, request: GenerationRequest) -> GenerationResult:
        task_id = f"mock-{uuid.uuid4().hex}"
        return GenerationResult(task_id=task_id, audio_url=self.MOCK_AUDIO_URL)
