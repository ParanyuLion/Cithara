import uuid

from songs.clients.base import SongGeneratorStrategy, GenerationRequest, GenerationResult

# Minimal single-frame silent MP3 (MPEG1, Layer3, 128kbps, 44100Hz, Mono — 417 bytes)
_SILENT_MP3 = bytes([0xFF, 0xFB, 0x90, 0xC0]) + bytes(413)


class MockSongGeneratorStrategy(SongGeneratorStrategy):
    """
    Offline, deterministic song generation strategy for development and testing.

    Does not call any external API. Returns a silent MP3 file and a generated
    task_id so the rest of the system behaves identically to the real Suno flow.
    """

    MOCK_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

    def generate(self, request: GenerationRequest) -> GenerationResult:
        task_id = f"mock-{uuid.uuid4().hex}"
        return GenerationResult(
            task_id=task_id,
            audio_url=self.MOCK_AUDIO_URL,
            audio_content=_SILENT_MP3,
        )
