from dataclasses import dataclass


@dataclass
class GenerationRequest:
    prompt: str
    style: str = None
    title: str = None
    custom_mode: bool = False
