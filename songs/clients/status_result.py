class StatusResult:
    def __init__(self, status: str, audio_url: str | None = None,
                 shareable_link: str | None = None, image_url: str | None = None):
        self.status = status
        self.audio_url = audio_url
        self.shareable_link = shareable_link
        self.image_url = image_url
