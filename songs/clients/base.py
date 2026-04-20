from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class GenerationRequest:
    """Input passed to any song generation strategy."""
    prompt: str
    style: str = None
    title: str = None
    custom_mode: bool = False


@dataclass
class GenerationResult:
    """Output returned by any song generation strategy."""
    task_id: str
    audio_url: str | None = None
    audio_content: bytes | None = None


class StatusResult:
    """Normalised status returned by get_status()."""

    def __init__(self, status: str, audio_url: str | None = None, shareable_link: str | None = None):
        self.status = status           # "PENDING" | "SUCCESS" | "FAILED"
        self.audio_url = audio_url
        self.shareable_link = shareable_link


class SongGeneratorStrategy(ABC):
    """Abstract strategy interface for song generation."""

    @abstractmethod
    def generate(self, request: GenerationRequest) -> GenerationResult:
        """
        Submit a song generation request.

        Returns a GenerationResult containing a task_id that can be used
        to track or retrieve the generation later.
        Raises an exception on failure.
        """

    @abstractmethod
    def get_status(self, task_id: str) -> StatusResult:
        """
        Check the status of a previously submitted generation task.

        Returns a StatusResult with status "PENDING", "SUCCESS", or "FAILED".
        Raises an exception on failure.
        """
