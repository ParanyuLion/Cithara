from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class GenerationRequest:
    """Input passed to any song generation strategy."""
    prompt: str
    style: str = None
    title: str = None


@dataclass
class GenerationResult:
    """Output returned by any song generation strategy."""
    task_id: str


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
