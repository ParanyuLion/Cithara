from songs.clients.base import SongGeneratorStrategy, GenerationRequest, GenerationResult, StatusResult
from songs.clients.mock_strategy import MockSongGeneratorStrategy
from songs.clients.suno_client import SunoClient
from songs.clients.suno_strategy import SunoSongGeneratorStrategy


def get_generator_strategy() -> SongGeneratorStrategy:
    """
    Factory that returns the active generation strategy based on the
    GENERATOR_STRATEGY Django setting (set via the environment variable
    of the same name).

    Supported values:
        mock  — MockSongGeneratorStrategy (no external API, safe for dev/test)
        suno  — SunoSongGeneratorStrategy (calls sunoapi.org)

    Defaults to "suno" if the setting is absent or unrecognised.
    """
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
