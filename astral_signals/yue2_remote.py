from __future__ import annotations

import base64
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from astral_signals.config import settings


class YuE2RemoteError(RuntimeError):
    """Raised when the configured Hermes YuE2 endpoint cannot render a song."""


class YuE2RemoteClient:
    def status(self) -> dict[str, object]:
        configured = bool(settings.yue2_endpoint)
        return {
            "configured": configured,
            "ready": configured,
            "endpoint": settings.yue2_endpoint,
            "requires_cuda": False,
            "remote": True,
            "label": "YuE2-3B · Hermes Modal",
        }

    def generate(self, *, payload: dict[str, object], output_path: Path) -> dict[str, object]:
        if not settings.yue2_endpoint:
            raise YuE2RemoteError(
                "YuE2 remote rendering is not configured. Set ASTRAL_SIGNALS_YUE2_ENDPOINT "
                "to the HTTPS Hermes YuE2 Modal endpoint."
            )

        headers = {"Content-Type": "application/json", "Accept": "application/json, audio/wav, audio/flac"}
        if settings.yue2_token:
            headers["Authorization"] = f"Bearer {settings.yue2_token}"
        request = Request(
            settings.yue2_endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        try:
            with urlopen(request, timeout=settings.yue2_timeout_seconds) as response:
                content_type = response.headers.get("Content-Type", "")
                body = response.read()
        except (HTTPError, URLError, TimeoutError) as exc:
            raise YuE2RemoteError(f"Hermes YuE2 request failed: {exc}") from exc

        output_path.parent.mkdir(parents=True, exist_ok=True)
        if "audio/" in content_type:
            output_path.write_bytes(body)
        else:
            try:
                result = json.loads(body.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise YuE2RemoteError("Hermes YuE2 returned neither audio bytes nor JSON.") from exc
            audio_b64 = str(result.get("audio_base64") or result.get("audio_b64") or "").strip()
            if audio_b64:
                output_path.write_bytes(base64.b64decode(audio_b64))
            else:
                audio_url = str(result.get("audio_url") or result.get("url") or "").strip()
                if not audio_url:
                    raise YuE2RemoteError("Hermes YuE2 JSON did not include audio_base64 or audio_url.")
                with urlopen(Request(audio_url, headers={"Accept": "audio/*"}), timeout=settings.yue2_timeout_seconds) as audio_response:
                    output_path.write_bytes(audio_response.read())

        if not output_path.exists() or output_path.stat().st_size == 0:
            raise YuE2RemoteError("Hermes YuE2 returned an empty audio result.")
        return {"path": str(output_path), "remote": True, "content_type": content_type}


yue2_remote_client = YuE2RemoteClient()
