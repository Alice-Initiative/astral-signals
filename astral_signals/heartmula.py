from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

from astral_signals.config import resolve_venv_binary, settings


class HeartMuLaError(RuntimeError):
    """Raised when the local HeartMuLa backend cannot complete a request."""


class HeartMuLaClient:
    def __init__(self) -> None:
        self.repo_dir = settings.heartmula_repo
        self.venv_dir = settings.heartmula_venv
        self.ckpt_dir = settings.heartmula_ckpt_dir
        self.default_model = settings.heartmula_model
        self.default_version = settings.heartmula_version

    @property
    def python_binary(self) -> Path:
        return resolve_venv_binary(self.venv_dir, "python")

    @property
    def worker_script(self) -> Path:
        return settings.project_root / "astral_signals" / "heartmula_worker.py"

    def _checkpoint_ready(self) -> bool:
        return (
            (self.ckpt_dir / "gen_config.json").is_file()
            and (self.ckpt_dir / "tokenizer.json").is_file()
            and (self.ckpt_dir / f"HeartMuLa-oss-{self.default_version}").exists()
            and (self.ckpt_dir / "HeartCodec-oss").exists()
        )

    def is_ready(self) -> bool:
        return self.repo_dir.exists() and self.python_binary.exists() and self._checkpoint_ready()

    def status(self) -> dict[str, Any]:
        return {
            "repo_present": self.repo_dir.exists(),
            "venv_present": self.python_binary.exists(),
            "checkpoints_present": self._checkpoint_ready(),
            "repo_dir": str(self.repo_dir),
            "python_binary": str(self.python_binary),
            "ckpt_dir": str(self.ckpt_dir),
            "default_model": self.default_model,
            "default_version": self.default_version,
            "ready": self.is_ready(),
        }

    def list_models(self) -> list[dict[str, Any]]:
        return [
            {
                "id": self.default_model,
                "label": "HeartMuLa OSS 3B",
                "description": "Lyrics-first full-song backend with strong multilingual control.",
                "verified_local": True,
            }
        ]

    def ensure_ready(self) -> None:
        if not self.repo_dir.exists():
            raise HeartMuLaError(
                f"HeartMuLa repo is missing at {self.repo_dir}. Sync the optional engines repo bundle first."
            )
        if not self.python_binary.exists():
            raise HeartMuLaError(
                f"HeartMuLa venv is missing at {self.python_binary}. Install the HeartMuLa backend in that repo first."
            )
        if not self._checkpoint_ready():
            raise HeartMuLaError(
                f"HeartMuLa checkpoints are missing in {self.ckpt_dir}. Download or point Astral at the checkpoints first."
            )
        if not self.worker_script.exists():
            raise HeartMuLaError(f"HeartMuLa worker script is missing at {self.worker_script}.")

    def generate(
        self,
        *,
        lyrics_path: Path,
        tags_path: Path,
        output_path: Path,
        duration_seconds: int,
        guidance_scale: float,
        temperature: float = 1.0,
        topk: int = 50,
    ) -> dict[str, Any]:
        self.ensure_ready()

        command = [
            str(self.python_binary),
            str(self.worker_script),
            "--model-path",
            str(self.ckpt_dir),
            "--version",
            self.default_version,
            "--lyrics",
            str(lyrics_path),
            "--tags",
            str(tags_path),
            "--save-path",
            str(output_path),
            "--max-audio-length-ms",
            str(max(10, int(duration_seconds)) * 1000),
            "--topk",
            str(topk),
            "--temperature",
            str(temperature),
            "--cfg-scale",
            str(guidance_scale if guidance_scale > 0 else 1.5),
            "--lazy-load",
        ]

        timeout_seconds = max(1800, duration_seconds * 60)
        try:
            result = subprocess.run(
                command,
                cwd=str(settings.project_root),
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout_seconds,
            )
        except subprocess.TimeoutExpired as exc:
            raise HeartMuLaError(
                f"HeartMuLa timed out after {timeout_seconds}s on this local run. "
                "The backend is staged, but this Windows/16GB path is still experimental. "
                f"Partial stdout: {(exc.stdout or '').strip() or '<empty>'} "
                f"Partial stderr: {(exc.stderr or '').strip() or '<empty>'}"
            ) from exc
        if result.returncode != 0:
            raise HeartMuLaError(
                "HeartMuLa generation failed. "
                f"STDERR: {result.stderr.strip() or '<empty>'} "
                f"STDOUT: {result.stdout.strip() or '<empty>'}"
            )

        payload = None
        for line in reversed([line.strip() for line in result.stdout.splitlines() if line.strip()]):
            if line.startswith("{") and line.endswith("}"):
                try:
                    payload = json.loads(line)
                    break
                except json.JSONDecodeError:
                    continue
        if payload is None:
            raise HeartMuLaError(
                "HeartMuLa completed without returning a valid JSON payload. "
                f"STDOUT: {result.stdout.strip() or '<empty>'}"
            )
        if not Path(str(payload.get("path") or output_path)).exists():
            raise HeartMuLaError(
                f"HeartMuLa did not produce the expected audio file at {payload.get('path') or output_path}."
            )
        return payload


heartmula_client = HeartMuLaClient()
