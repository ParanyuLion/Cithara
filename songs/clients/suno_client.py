import requests
from django.conf import settings

# sunoapi.org status values
_TERMINAL_SUCCESS = "SUCCESS"
_TERMINAL_FAILURES = {
    "CREATE_TASK_FAILED",
    "GENERATE_AUDIO_FAILED",
    "CALLBACK_EXCEPTION",
    "SENSITIVE_WORD_ERROR",
}


class SunoClient:
    """HTTP client for the sunoapi.org music generation API."""

    def __init__(self):
        self.base_url = getattr(
            settings, "SUNO_API_BASE_URL", "https://api.sunoapi.org"
        ).rstrip("/")
        api_key = getattr(settings, "SUNO_API_KEY", "")
        self._headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        self._model = getattr(settings, "SUNO_MODEL", "V4")
        self._callback_url = getattr(settings, "SUNO_CALLBACK_URL", "")

    def generate(self, prompt: str, style: str = None, title: str = None) -> str:
        """
        Submit a music generation request.

        Returns the ``taskId`` string to use for polling.
        Raises ``requests.HTTPError`` on non-2xx responses.
        """
        custom_mode = bool(style and title)
        payload = {
            "customMode": custom_mode,
            "instrumental": False,
            "model": self._model,
            "prompt": prompt,
        }
        if custom_mode:
            payload["style"] = style
            payload["title"] = title
        if self._callback_url:
            payload["callBackUrl"] = self._callback_url

        response = requests.post(
            f"{self.base_url}/api/v1/generate",
            json=payload,
            headers=self._headers,
            timeout=30,
        )
        response.raise_for_status()
        body = response.json()
        import logging; logging.getLogger(__name__).debug("SUNO generate response: %s", body)
        data = body.get("data")
        if not data:
            raise ValueError(f"SUNO generate returned no data: {body}")
        task_id = data.get("taskId")
        if not task_id:
            raise ValueError(f"SUNO generate returned no taskId: {body}")
        return task_id

    def get_status(self, task_id: str) -> dict:
        """
        Poll for generation status.

        Returns a normalised dict::

            {
                "status": "PENDING" | "SUCCESS" | "FAILED",
                "audio_url": str | None,
                "shareable_link": str | None,
            }

        Raises ``requests.HTTPError`` on non-2xx responses.
        """
        response = requests.get(
            f"{self.base_url}/api/v1/generate/record-info",
            params={"taskId": task_id},
            headers=self._headers,
            timeout=30,
        )
        response.raise_for_status()
        body = response.json()
        data = body.get("data", {})
        raw_status = data.get("status", "")

        if raw_status == _TERMINAL_SUCCESS:
            suno_data = data.get("response", {}).get("sunoData", [])
            audio_url = suno_data[0].get("audioUrl", "") if suno_data else ""
            shareable_link = suno_data[0].get("streamAudioUrl", "") or audio_url
            return {"status": "SUCCESS", "audio_url": audio_url, "shareable_link": shareable_link}

        if raw_status in _TERMINAL_FAILURES:
            return {"status": "FAILED", "audio_url": None, "shareable_link": None}

        return {"status": "PENDING", "audio_url": None, "shareable_link": None}
