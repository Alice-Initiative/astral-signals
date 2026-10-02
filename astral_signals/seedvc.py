from __future__ import annotations

import os
from pathlib import Path
import subprocess
from typing import Any

from astral_signals.config import resolve_venv_binary, settings


class SeedVCError(RuntimeError):
    """Raised when local Seed-VC singing conversion cannot complete."""


class SeedVCClient:
    @property
    def python_binary(self) -> Path:
        return resolve_venv_binary(settings.seedvc_venv, "python")

    @property
    def inference_script(self) -> Path:
        return settings.seedvc_repo / "inference.py"

    def status(self) -> dict[str, object]:
        ready = self.python_binary.exists() and self.inference_script.exists()
        return {
            "ready": ready,
            "label": "Seed-VC singing conversion",
            "repo_dir": str(settings.seedvc_repo),
            "requires_cuda": True,
            "cuda_available": self._cuda_available() if ready else False,
            "capabilities": ["zero-shot singing voice conversion", "voice identity", "vocal stem"],
        }

    def _cuda_available(self) -> bool:
        try:
            result = subprocess.run(
                [str(self.python_binary), "-c", "import torch; print(torch.cuda.is_available())"],
                capture_output=True,
                text=True,
                timeout=30,
                check=False,
            )
            return result.stdout.strip().lower() == "true"
        except Exception:
            return False

    def convert(
        self,
        *,
        source_path: Path,
        target_reference_path: Path,
        output_path: Path,
        diffusion_steps: int = 40,
        semitone_shift: int = 0,
    ) -> dict[str, Any]:
        status = self.status()
        if not status["ready"]:
            raise SeedVCError(f"Seed-VC is not installed at {settings.seedvc_repo}.")
        if not status["cuda_available"]:
            raise SeedVCError("Seed-VC singing conversion requires CUDA on this machine.")
        for path, label in ((source_path, "source singing"), (target_reference_path, "target voice reference")):
            if not path.is_file():
                raise SeedVCError(f"{label} file not found: {path}")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        env = os.environ.copy()
        env["HF_HOME"] = str(settings.cache_dir)
        env["HF_HUB_CACHE"] = str(settings.cache_dir / "seed-vc")
        command = [
            str(self.python_binary),
            str(self.inference_script),
            "--source", str(source_path),
            "--target", str(target_reference_path),
            "--output", str(output_path),
            "--diffusion-steps", str(max(4, int(diffusion_steps))),
            "--f0-condition", "True",
            "--semi-tone-shift", str(int(semitone_shift)),
            "--fp16", "True",
        ]
        try:
            result = subprocess.run(
                command,
                cwd=str(settings.seedvc_repo),
                env=env,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=settings.seedvc_timeout_seconds,
                check=False,
            )
        except subprocess.TimeoutExpired as exc:
            raise SeedVCError(f"Seed-VC timed out after {settings.seedvc_timeout_seconds}s.") from exc
        if result.returncode != 0:
            raise SeedVCError(
                "Seed-VC singing conversion failed. "
                f"STDERR: {result.stderr.strip() or '<empty>'} "
                f"STDOUT: {result.stdout.strip() or '<empty>'}"
            )
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise SeedVCError(f"Seed-VC completed without creating {output_path}.")
        return {"path": str(output_path), "model": "seed-uvit-whisper-base", "diffusion_steps": diffusion_steps}


seedvc_client = SeedVCClient()
