from songs.clients.base import SongGeneratorStrategy, GenerationRequest, GenerationResult
from songs.clients.suno_client import SunoClient


class SunoSongGeneratorStrategy(SongGeneratorStrategy):
    """
    Song generation strategy that calls the sunoapi.org external API.

    Delegates to SunoClient for all HTTP communication.
    Requires SUNO_API_KEY and SUNO_CALLBACK_URL to be set in settings / .env.
    """

    def __init__(self):
        self._client = SunoClient()

    def generate(self, request: GenerationRequest) -> GenerationResult:
        task_id = self._client.generate(
            prompt=request.prompt,
            style=request.style,
            title=request.title,
        )
        return GenerationResult(task_id=task_id)
