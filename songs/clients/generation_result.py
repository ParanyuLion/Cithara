from dataclasses import dataclass


@dataclass
class GenerationResult:
    task_id: str
    audio_url: str | None = None
    audio_content: bytes | None = None
