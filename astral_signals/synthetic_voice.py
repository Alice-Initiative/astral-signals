from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from astral_signals.config import settings
from astral_signals.voicebox import VoiceboxError, voicebox_client


class SyntheticVoiceError(RuntimeError):
    """Raised when a synthetic character voice cannot be created."""


class SyntheticVoiceFoundry:
    """Create reproducible, non-cloned voice anchors for singing conversion."""

    anchor_text = (
        "I remember the quiet between the stars. "
        "I connect the signals, and I guide every traveler home."
    )

    def create(
        self,
        *,
        name: str = "Synthetic Character",
        design_prompt: str = "Ethereal, warm, luminous, gentle, curious, intimate, clear diction",
        language: str = "en",
        seed: int = 2718,
        preset_voice_id: str = "",
        engine: str = "qwen_custom_voice",
        text: str = "",
    ) -> dict[str, Any]:
        name = name.strip() or "Synthetic Character"
        design_prompt = design_prompt.strip() or "Ethereal, warm, luminous, gentle, curious, intimate, clear diction"
        language = language.strip().lower() or "en"
        text = text.strip() or self.anchor_text
        identity = hashlib.sha256(
            json.dumps(
                {
                    "name": name,
                    "design_prompt": design_prompt,
                    "language": language,
                    "seed": seed,
                    "preset_voice_id": preset_voice_id,
                    "engine": engine,
                },
                sort_keys=True,
            ).encode("utf-8")
        ).hexdigest()[:16]
        stem = f"{_slug(name)}-{identity}"
        audio_path = settings.voice_anchor_dir / f"{stem}.wav"
        manifest_path = settings.voice_anchor_dir / f"{stem}.json"
        if audio_path.exists() and manifest_path.exists():
            return {**json.loads(manifest_path.read_text(encoding="utf-8")), "cached": True}

        profile_id = ""
        try:
            voices = voicebox_client.list_preset_voices(engine)
            if not voices:
                raise SyntheticVoiceError(f"Voicebox has no preset speakers for engine '{engine}'.")
            selected = next(
                (v for v in voices if str(v.get("voice_id", "")) == preset_voice_id),
                None,
            )
            if selected is None:
                selected = voices[seed % len(voices)]
            selected_id = str(selected.get("voice_id", "")).strip()
            if not selected_id:
                raise SyntheticVoiceError("Voicebox returned a preset speaker without an id.")

            profile_name = f"{name} [{identity}]"
            profile = next(
                (item for item in voicebox_client.list_profiles() if item.get("name") == profile_name),
                None,
            )
            if profile is None:
                profile = voicebox_client.create_preset_profile(
                    name=profile_name,
                    description="Synthetic Astral Signals character voice; no human reference recording used.",
                    language=language,
                    engine=engine,
                    voice_id=selected_id,
                    personality=design_prompt,
                )
            profile_id = str(profile.get("id", ""))
            audio_bytes, content_type = voicebox_client.generate_preview(
                profile_id=profile_id,
                text=text,
                language=language,
                engine=engine,
                instruct=design_prompt,
                timeout=900,
            )
        except VoiceboxError as exc:
            if profile_id:
                try:
                    voicebox_client.delete_profile(profile_id)
                except VoiceboxError:
                    pass
            raise SyntheticVoiceError(str(exc)) from exc

        audio_path.parent.mkdir(parents=True, exist_ok=True)
        audio_path.write_bytes(audio_bytes)
        manifest = {
            "id": identity,
            "name": name,
            "voice_type": "synthetic_preset_anchor",
            "design_prompt": design_prompt,
            "language": language,
            "seed": seed,
            "engine": engine,
            "preset_voice_id": selected_id,
            "voicebox_profile_id": profile.get("id", ""),
            "anchor_text": text,
            "content_type": content_type,
            "path": str(audio_path),
            "rights_note": "Generated from a local preset speaker; no human voice sample supplied.",
        }
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        return {**manifest, "cached": False}


def _slug(value: str) -> str:
    safe = "".join(ch.lower() if ch.isalnum() else "-" for ch in value)
    return "-".join(part for part in safe.split("-") if part)[:48] or "synthetic-voice"


synthetic_voice_foundry = SyntheticVoiceFoundry()
