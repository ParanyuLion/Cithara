from songs.clients.generation_request import GenerationRequest
from songs.clients.generation_result import GenerationResult
from songs.clients.status_result import StatusResult
from songs.clients.song_generator_strategy import SongGeneratorStrategy
from songs.clients.mock_song_generator_strategy import MockSongGeneratorStrategy
from songs.clients.suno_client import SunoClient
from songs.clients.suno_song_generator_strategy import SunoSongGeneratorStrategy


def get_generator_strategy() -> SongGeneratorStrategy:
    from django.conf import settings

    strategy = getattr(settings, "GENERATOR_STRATEGY", "suno").lower()

    if strategy == "mock":
        return MockSongGeneratorStrategy()

    return SunoSongGeneratorStrategy()


__all__ = [
    "SongGeneratorStrategy",
    "GenerationRequest",
    "GenerationResult",
    "StatusResult",
    "MockSongGeneratorStrategy",
    "SunoClient",
    "SunoSongGeneratorStrategy",
    "get_generator_strategy",
]
