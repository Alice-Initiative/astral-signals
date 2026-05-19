from __future__ import annotations

import threading
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf
import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration, set_seed

from astral_signals.config import settings
from astral_signals.engine_catalog import MUSICGEN_MODEL_OPTIONS

MUSICGEN_MAX_DURATION_SECONDS = 30
MUSICGEN_TOKENS_PER_SECOND = 50.1


class MusicGenError(RuntimeError):
    """Raised when the local MusicGen backend cannot complete a request."""


class MusicGenClient:
    def __init__(self) -> None:
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._lock = threading.Lock()
        self._model_id = ""
        self._processor: Any | None = None
        self._model: MusicgenForConditionalGeneration | None = None

    def is_available(self) -> bool:
        return True

    def list_models(self) -> list[dict[str, Any]]:
        return [dict(model) for model in MUSICGEN_MODEL_OPTIONS]

    def status(self) -> dict[str, Any]:
        return {
            "available": True,
            "device": self.device,
            "loaded_model": self._model_id,
            "max_duration_seconds": MUSICGEN_MAX_DURATION_SECONDS,
            "models": self.list_models(),
        }

    def _resolve_model_id(self, model_id: str) -> str:
        requested = (model_id or "").strip() or settings.musicgen_model
        known = {item["id"] for item in MUSICGEN_MODEL_OPTIONS}
        if requested not in known:
            raise MusicGenError(
                f"Unsupported MusicGen model '{requested}'. Choose one of: {', '.join(sorted(known))}."
            )
        return requested

    def _load(self, model_id: str) -> tuple[Any, MusicgenForConditionalGeneration]:
        resolved = self._resolve_model_id(model_id)
        with self._lock:
            if self._model is not None and self._processor is not None and self._model_id == resolved:
                return self._processor, self._model

            dtype = torch.float16 if self.device == "cuda" else torch.float32
            try:
                processor = AutoProcessor.from_pretrained(resolved)
                model = MusicgenForConditionalGeneration.from_pretrained(
                    resolved,
                    dtype=dtype,
                )
            except Exception as exc:
                raise MusicGenError(f"Could not load MusicGen model '{resolved}': {exc}") from exc

            model.to(self.device)
            model.eval()
            self._processor = processor
            self._model = model
            self._model_id = resolved
            return processor, model

    def generate(
        self,
        *,
        prompt: str,
        output_path: Path,
        duration_seconds: int,
        model_id: str,
        seed: int,
        guidance_scale: float,
        audio_format: str,
    ) -> dict[str, Any]:
        text_prompt = (prompt or "").strip()
        if not text_prompt:
            raise MusicGenError("MusicGen needs a text prompt.")

        processor, model = self._load(model_id)
        duration_seconds = max(1, min(int(duration_seconds), MUSICGEN_MAX_DURATION_SECONDS))
        max_new_tokens = max(64, min(1503, int(round(duration_seconds * MUSICGEN_TOKENS_PER_SECOND))))
        resolved_guidance = guidance_scale if guidance_scale > 1.0 else 3.0

        set_seed(int(seed))
        try:
            inputs = processor(text=[text_prompt], padding=True, return_tensors="pt")
            tensor_inputs = {
                key: value.to(self.device) if hasattr(value, "to") else value
                for key, value in inputs.items()
            }
            with torch.inference_mode():
                audio_values = model.generate(
                    **tensor_inputs,
                    do_sample=True,
                    guidance_scale=resolved_guidance,
                    max_new_tokens=max_new_tokens,
                )
        except Exception as exc:
            raise MusicGenError(f"MusicGen could not generate audio: {exc}") from exc

        sample = audio_values[0].detach().cpu()
        samples = sample.transpose(0, 1).numpy().astype(np.float32, copy=False)
        sampling_rate = int(model.config.audio_encoder.sampling_rate)
        saved_path = self._write_audio(
            output_path=output_path,
            samples=samples,
            sample_rate=sampling_rate,
            audio_format=audio_format,
        )
        if self.device == "cuda":
            torch.cuda.empty_cache()

        return {
            "path": str(saved_path),
            "sample_rate": sampling_rate,
            "duration_seconds": round(samples.shape[0] / float(sampling_rate), 2),
            "guidance_scale": resolved_guidance,
            "model_id": self._model_id,
        }

    def _write_audio(
        self,
        *,
        output_path: Path,
        samples: np.ndarray,
        sample_rate: int,
        audio_format: str,
    ) -> Path:
        lowered = (audio_format or "wav").strip().lower()
        path = output_path
        subtype = "PCM_16"

        if lowered in {"wav", ""}:
            path = output_path.with_suffix(".wav")
        elif lowered == "wav32":
            path = output_path.with_suffix(".wav")
            subtype = "FLOAT"
        elif lowered == "flac":
            path = output_path.with_suffix(".flac")
        else:
            raise MusicGenError(
                "MusicGen currently exports wav, wav32, or flac in Astral. "
                f"Requested format '{audio_format}' is not supported by this backend yet."
            )

        try:
            sf.write(path, samples, sample_rate, subtype=subtype)
        except Exception as exc:
            raise MusicGenError(f"Could not save MusicGen audio to {path}: {exc}") from exc
        return path


musicgen_client = MusicGenClient()
