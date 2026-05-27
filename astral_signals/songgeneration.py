from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from astral_signals.config import resolve_venv_binary, settings

SONGGENERATION_MODEL_LIBRARY: list[dict[str, Any]] = [
    {
        "id": "songgeneration_base",
        "label": "SongGeneration Base",
        "directory": "songgeneration_base",
        "description": "Chinese-first 2m30s model with the lightest checkpoint footprint.",
        "max_duration_seconds": 150,
        "languages": ["zh"],
        "experimental": True,
        "verified_local": False,
    },
    {
        "id": "songgeneration_base_new",
        "label": "SongGeneration Base New",
        "directory": "songgeneration_base_new",
        "description": "English and Chinese song model with the friendliest 16GB footprint.",
        "max_duration_seconds": 150,
        "languages": ["en", "zh"],
        "experimental": True,
        "verified_local": False,
    },
    {
        "id": "songgeneration_base_full",
        "label": "SongGeneration Base Full",
        "directory": "songgeneration_base_full",
        "description": "Longer-form base checkpoint for up to 4m30s songs when VRAM allows it.",
        "max_duration_seconds": 240,
        "languages": ["en", "zh"],
        "experimental": True,
        "verified_local": False,
    },
    {
        "id": "songgeneration_large",
        "label": "SongGeneration Large",
        "directory": "songgeneration_large",
        "description": "Higher-end long-form checkpoint that typically wants more than 16GB VRAM.",
        "max_duration_seconds": 240,
        "languages": ["en", "zh"],
        "experimental": True,
        "verified_local": False,
    },
    {
        "id": "songgeneration_v2_large",
        "label": "SongGeneration v2 Large",
        "directory": "songgeneration_v2_large",
        "description": "Newest multilingual LeVo 2 checkpoint, but realistically a bigger-GPU experiment on Windows.",
        "max_duration_seconds": 240,
        "languages": ["en", "zh", "es", "ja"],
        "experimental": True,
        "verified_local": True,
    },
]


class SongGenerationError(RuntimeError):
    """Raised when the local SongGeneration backend cannot complete a request."""


class SongGenerationClient:
    def __init__(self) -> None:
        self.repo_dir = settings.songgeneration_repo
        self.venv_dir = settings.songgeneration_venv
        self.runtime_dir = settings.songgeneration_runtime_dir
        self.models_dir = settings.songgeneration_models_dir
        self.default_model = settings.songgeneration_model
        self.default_timeout_seconds = settings.songgeneration_timeout_seconds
        self.low_mem = settings.songgeneration_low_mem
        self.use_flash_attn = settings.songgeneration_use_flash_attn

    @property
    def python_binary(self) -> Path:
        return resolve_venv_binary(self.venv_dir, "python")

    @property
    def worker_script(self) -> Path:
        return settings.project_root / "astral_signals" / "songgeneration_worker.py"

    @property
    def runtime_ckpt_dir(self) -> Path:
        return self.runtime_dir / "ckpt"

    @property
    def runtime_third_party_dir(self) -> Path:
        return self.runtime_dir / "third_party"

    def _runtime_ready(self) -> bool:
        return (
            (self.runtime_ckpt_dir).exists()
            and (self.runtime_third_party_dir).exists()
            and (self.repo_dir / "tools" / "new_auto_prompt.pt").exists()
        )

    def _resolve_model_spec(self, model_id: str) -> dict[str, Any]:
        normalized = (model_id or self.default_model).strip() or self.default_model
        for spec in SONGGENERATION_MODEL_LIBRARY:
            if spec["id"] == normalized or spec["directory"] == normalized:
                return spec
        return SONGGENERATION_MODEL_LIBRARY[1]

    def _model_dir(self, model_id: str) -> Path:
        spec = self._resolve_model_spec(model_id)
        return self.models_dir / str(spec["directory"])

    def _model_ready(self, model_id: str) -> bool:
        model_dir = self._model_dir(model_id)
        return (model_dir / "config.yaml").is_file() and (model_dir / "model.pt").is_file()

    def _runtime_asset_targets(self) -> list[tuple[Path, Path]]:
        return [
            (self.runtime_ckpt_dir, self.repo_dir / "ckpt"),
            (self.runtime_third_party_dir, self.repo_dir / "third_party"),
        ]

    def _ensure_runtime_links(self) -> None:
        for source, target in self._runtime_asset_targets():
            if not source.exists():
                continue
            if target.exists():
                continue
            try:
                target.symlink_to(source, target_is_directory=True)
            except OSError:
                if target.exists():
                    continue

    def is_ready(self) -> bool:
        return (
            self.repo_dir.exists()
            and self.python_binary.exists()
            and self._runtime_ready()
            and any(self._model_ready(spec["id"]) for spec in SONGGENERATION_MODEL_LIBRARY)
        )

    def status(self) -> dict[str, Any]:
        available_models = self.list_models()
        return {
            "repo_present": self.repo_dir.exists(),
            "venv_present": self.python_binary.exists(),
            "runtime_present": self._runtime_ready(),
            "repo_dir": str(self.repo_dir),
            "python_binary": str(self.python_binary),
            "runtime_dir": str(self.runtime_dir),
            "models_dir": str(self.models_dir),
            "default_model": self.default_model,
            "low_mem": self.low_mem,
            "use_flash_attn": self.use_flash_attn,
            "available_models": available_models,
            "ready": bool(available_models) and self.repo_dir.exists() and self.python_binary.exists() and self._runtime_ready(),
        }

    def list_models(self) -> list[dict[str, Any]]:
        models: list[dict[str, Any]] = []
        for spec in SONGGENERATION_MODEL_LIBRARY:
            if not self._model_ready(str(spec["id"])):
                continue
            models.append(
                {
                    "id": str(spec["id"]),
                    "label": str(spec["label"]),
                    "description": str(spec["description"]),
                    "max_duration_seconds": int(spec["max_duration_seconds"]),
                    "languages": list(spec["languages"]),
                    "experimental": bool(spec["experimental"]),
                    "verified_local": bool(spec.get("verified_local", False)),
                }
            )
        models.sort(key=lambda item: (item.get("id") != self.default_model, str(item.get("label") or item.get("id") or "")))
        return models

    def ensure_ready(self, model_id: str) -> None:
        if not self.repo_dir.exists():
            raise SongGenerationError(
                f"SongGeneration repo is missing at {self.repo_dir}. Sync the optional engines repo bundle first."
            )
        if not self.python_binary.exists():
            raise SongGenerationError(
                f"SongGeneration venv is missing at {self.python_binary}. Install the SongGeneration backend in that repo first."
            )
        if not self._runtime_ready():
            raise SongGenerationError(
                f"SongGeneration runtime assets are missing in {self.runtime_dir}. Download or point Astral at the runtime assets first."
            )
        if not self.worker_script.exists():
            raise SongGenerationError(f"SongGeneration worker script is missing at {self.worker_script}.")
        if not self._model_ready(model_id):
            spec = self._resolve_model_spec(model_id)
            raise SongGenerationError(
                f"SongGeneration checkpoint '{spec['id']}' is missing in {self._model_dir(model_id)}. "
                "Download that checkpoint or point Astral at an installed SongGeneration model first."
            )
        self._ensure_runtime_links()

    def model_metadata(self, model_id: str) -> dict[str, Any]:
        spec = self._resolve_model_spec(model_id)
        metadata = dict(spec)
        metadata["path"] = str(self._model_dir(model_id))
        return metadata

    def generate(
        self,
        *,
        model_id: str,
        lyrics_text: str,
        descriptions: str,
        save_dir: Path,
        idx: str,
        generate_type: str,
        prompt_audio_path: str = "",
        auto_prompt_audio_type: str = "",
        timeout_seconds: int | None = None,
    ) -> dict[str, Any]:
        self.ensure_ready(model_id)
        input_jsonl = save_dir / "songgeneration-input.jsonl"
        item: dict[str, Any] = {
            "idx": idx,
            "gt_lyric": lyrics_text,
            "descriptions": descriptions,
        }
        if prompt_audio_path.strip():
            item["prompt_audio_path"] = prompt_audio_path.strip()
        elif auto_prompt_audio_type.strip():
            item["auto_prompt_audio_type"] = auto_prompt_audio_type.strip()
        input_jsonl.write_text(json.dumps(item, ensure_ascii=False) + "\n", encoding="utf-8")

        command = [
            str(self.python_binary),
            str(self.worker_script),
            "--repo-dir",
            str(self.repo_dir),
            "--ckpt-path",
            str(self._model_dir(model_id)),
            "--input-jsonl",
            str(input_jsonl),
            "--save-dir",
            str(save_dir),
            "--idx",
            idx,
            "--generate-type",
            generate_type,
        ]
        if self.low_mem:
            command.append("--low-mem")
        if self.use_flash_attn:
            command.append("--use-flash-attn")

        timeout = timeout_seconds or self.default_timeout_seconds
        try:
            result = subprocess.run(
                command,
                cwd=str(settings.project_root),
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout,
            )
        except subprocess.TimeoutExpired as exc:
            raise SongGenerationError(
                f"SongGeneration timed out after {timeout}s on this local run. "
                f"Partial stdout: {(exc.stdout or '').strip() or '<empty>'} "
                f"Partial stderr: {(exc.stderr or '').strip() or '<empty>'}"
            ) from exc

        if result.returncode != 0:
            raise SongGenerationError(
                "SongGeneration generation failed. "
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
            raise SongGenerationError(
                "SongGeneration completed without returning a valid JSON payload. "
                f"STDOUT: {result.stdout.strip() or '<empty>'}"
            )
        tracks = payload.get("tracks") or {}
        if not tracks:
            raise SongGenerationError(
                "SongGeneration did not produce any audio tracks in the expected output folder."
            )
        return payload


songgeneration_client = SongGenerationClient()
