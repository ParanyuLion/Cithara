from abc import ABC, abstractmethod

from songs.clients.generation_request import GenerationRequest
from songs.clients.generation_result import GenerationResult
from songs.clients.status_result import StatusResult


class SongGeneratorStrategy(ABC):

    @abstractmethod
    def generate(self, request: GenerationRequest) -> GenerationResult:
        ...

    @abstractmethod
    def get_status(self, task_id: str) -> StatusResult:
        ...
