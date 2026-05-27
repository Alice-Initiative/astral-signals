from __future__ import annotations

import json
import mimetypes
import os
from pathlib import Path
import subprocess
import time
from typing import Any
from uuid import uuid4
from urllib import error, request
from urllib.parse import urlparse

from astral_signals.config import resolve_venv_binary, settings


class VoiceboxError(RuntimeError):
    """Raised when the local Voicebox runtime cannot be reached."""


class VoiceboxClient:
    def __init__(self) -> None:
        self.base_url = settings.voicebox_host
        self.repo_dir = settings.voicebox_repo
        self.backend_python = resolve_venv_binary(self.repo_dir / "backend" / "venv", "python")
        self.data_dir = settings.storage_root / "voicebox-data"
        self.models_dir = settings.cache_dir / "voicebox-hf"
        self.temp_dir = settings.storage_root / "cache" / "tmp"
        parsed = urlparse(self.base_url)
        self.host = parsed.hostname or "127.0.0.1"
        self.port = parsed.port or 17493

    def _request(
        self,
        method: str,
        path: str,
        *,
        data: bytes | None = None,
        headers: dict[str, str] | None = None,
        timeout: int = 4,
    ) -> tuple[bytes, dict[str, str]]:
        req = request.Request(
            f"{self.base_url}{path}",
            data=data,
            headers=headers or {},
            method=method,
        )
        try:
            with request.urlopen(req, timeout=timeout) as response:
                return response.read(), dict(response.headers.items())
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise VoiceboxError(f"Voicebox returned HTTP {exc.code}: {detail}") from exc
        except error.URLError as exc:
            raise VoiceboxError(f"Could not reach Voicebox at {self.base_url}: {exc.reason}") from exc

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        payload: dict[str, Any] | None = None,
        timeout: int = 4,
    ) -> Any:
        body = None
        headers: dict[str, str] = {}
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"

        raw, _headers = self._request(method, path, data=body, headers=headers, timeout=timeout)
        text = raw.decode("utf-8")
        return json.loads(text) if text else {}

    def _is_healthy(self) -> bool:
        try:
            payload = self._request_json("GET", "/health", timeout=3)
            return str(payload.get("status", "")).lower() == "healthy"
        except VoiceboxError:
            return False

    def ensure_server(self) -> None:
        if self._is_healthy():
            return

        if not self.backend_python.exists():
            raise VoiceboxError(f"Voicebox backend Python was not found at {self.backend_python}.")

        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        env = os.environ.copy()
        env["VOICEBOX_MODELS_DIR"] = str(self.models_dir)
        env["HF_HUB_CACHE"] = str(self.models_dir)
        env["HF_HOME"] = str(self.models_dir.parent)
        env["TRANSFORMERS_CACHE"] = str(self.models_dir)
        env["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
        env["TEMP"] = str(self.temp_dir)
        env["TMP"] = str(self.temp_dir)

        creationflags = 0
        if hasattr(subprocess, "CREATE_NO_WINDOW"):
            creationflags |= subprocess.CREATE_NO_WINDOW
        if hasattr(subprocess, "DETACHED_PROCESS"):
            creationflags |= subprocess.DETACHED_PROCESS

        subprocess.Popen(
            [
                str(self.backend_python),
                "-m",
                "backend.main",
                "--host",
                self.host,
                "--port",
                str(self.port),
                "--data-dir",
                str(self.data_dir),
            ],
            cwd=str(self.repo_dir),
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creationflags,
        )

        deadline = time.time() + 25
        while time.time() < deadline:
            if self._is_healthy():
                return
            time.sleep(1)

        raise VoiceboxError("Astral Signals could not start the Voicebox backend.")

    def _encode_multipart(
        self,
        *,
        fields: dict[str, str],
        file_field: str,
        file_path: Path,
    ) -> tuple[bytes, str]:
        boundary = f"----AstralSignalsVoicebox{uuid4().hex}"
        parts: list[bytes] = []

        for name, value in fields.items():
            parts.extend(
                [
                    f"--{boundary}\r\n".encode("utf-8"),
                    f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"),
                    str(value).encode("utf-8"),
                    b"\r\n",
                ]
            )

        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        parts.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                (
                    f'Content-Disposition: form-data; name="{file_field}"; filename="{file_path.name}"\r\n'
                ).encode("utf-8"),
                f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"),
                file_path.read_bytes(),
                b"\r\n",
                f"--{boundary}--\r\n".encode("utf-8"),
            ]
        )
        return b"".join(parts), boundary

    def list_profiles(self) -> list[dict[str, Any]]:
        self.ensure_server()
        payload = self._request_json("GET", "/profiles", timeout=10)
        return payload if isinstance(payload, list) else []

    def get_profile(self, profile_id: str) -> dict[str, Any]:
        self.ensure_server()
        payload = self._request_json("GET", f"/profiles/{profile_id}", timeout=10)
        if not isinstance(payload, dict):
            raise VoiceboxError(f"Voicebox returned an invalid profile payload for {profile_id}.")
        return payload

    def create_profile(
        self,
        *,
        name: str,
        description: str = "",
        language: str = "en",
        default_engine: str = "",
        personality: str = "",
    ) -> dict[str, Any]:
        self.ensure_server()
        payload = self._request_json(
            "POST",
            "/profiles",
            payload={
                "name": name,
                "description": description or None,
                "language": language or "en",
                "voice_type": "cloned",
                "default_engine": default_engine or None,
                "personality": personality or None,
            },
            timeout=20,
        )
        if not isinstance(payload, dict):
            raise VoiceboxError("Voicebox returned an invalid profile creation response.")
        return payload

    def add_profile_sample(
        self,
        profile_id: str,
        *,
        sample_audio_path: Path,
        reference_text: str,
    ) -> dict[str, Any]:
        self.ensure_server()
        multipart_body, boundary = self._encode_multipart(
            fields={"reference_text": reference_text},
            file_field="file",
            file_path=sample_audio_path,
        )
        payload, _headers = self._request(
            "POST",
            f"/profiles/{profile_id}/samples",
            data=multipart_body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            timeout=120,
        )
        text = payload.decode("utf-8")
        parsed = json.loads(text) if text else {}
        if not isinstance(parsed, dict):
            raise VoiceboxError("Voicebox returned an invalid sample upload response.")
        return parsed

    def stream_preview(
        self,
        *,
        profile_id: str,
        text: str,
        language: str = "en",
        engine: str = "",
    ) -> tuple[bytes, str]:
        self.ensure_server()
        payload, headers = self._request(
            "POST",
            "/generate/stream",
            data=json.dumps(
                {
                    "profile_id": profile_id,
                    "text": text,
                    "language": language or "en",
                    **({"engine": engine} if engine else {}),
                }
            ).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            timeout=240,
        )
        return payload, headers.get("Content-Type", "audio/wav")

    def generate_preview(
        self,
        *,
        profile_id: str,
        text: str,
        language: str = "en",
        engine: str = "",
        timeout: int = 600,
    ) -> tuple[bytes, str]:
        self.ensure_server()
        payload = self._request_json(
            "POST",
            "/generate",
            payload={
                "profile_id": profile_id,
                "text": text,
                "language": language or "en",
                **({"engine": engine} if engine else {}),
            },
            timeout=30,
        )
        generation_id = str(payload.get("id", "") or "").strip()
        if not generation_id:
            raise VoiceboxError("Voicebox returned a generation without an id.")

        deadline = time.time() + timeout
        while time.time() < deadline:
            record = self._request_json("GET", f"/history/{generation_id}", timeout=10)
            status = str(record.get("status", "") or "").strip().lower()
            if status == "completed":
                audio_bytes, headers = self._request("GET", f"/audio/{generation_id}", timeout=60)
                return audio_bytes, headers.get("Content-Type", "audio/wav")
            if status == "failed":
                raise VoiceboxError(str(record.get("error") or "Voicebox generation failed."))
            time.sleep(3)

        raise VoiceboxError(f"Voicebox preview generation timed out after {timeout}s.")

    def status(self) -> dict[str, Any]:
        try:
            self.ensure_server()
            payload = self.list_profiles()
            profile_count = len(payload) if isinstance(payload, list) else 0
            return {
                "repo_present": self.repo_dir.exists(),
                "running": True,
                "host": self.base_url,
                "models_dir": str(self.models_dir),
                "profile_count": profile_count,
            }
        except VoiceboxError as exc:
            return {
                "repo_present": self.repo_dir.exists(),
                "running": False,
                "host": self.base_url,
                "models_dir": str(self.models_dir),
                "profile_count": 0,
                "error": str(exc),
            }


voicebox_client = VoiceboxClient()
