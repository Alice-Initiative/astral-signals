from __future__ import annotations

from pathlib import Path
from typing import Any

from astral_signals.config import settings

ACE_STEP_BACKEND = "ace-step"
MUSICGEN_BACKEND = "musicgen"
HEARTMULA_BACKEND = "heartmula"
SONGGENERATION_BACKEND = "songgeneration"

MUSICGEN_MODEL_OPTIONS: list[dict[str, str]] = [
    {
        "id": "facebook/musicgen-small",
        "label": "MusicGen Small",
        "description": "Fast local instrumental and wordless sketch engine.",
    },
    {
        "id": "facebook/musicgen-medium",
        "label": "MusicGen Medium",
        "description": "Richer local backing-track engine for fuller arrangements.",
    },
]

OPTIONAL_ENGINE_LIBRARY: list[dict[str, Any]] = [
    {
        "id": HEARTMULA_BACKEND,
        "label": "HeartMuLa",
        "kind": "render",
        "repo_dir": settings.heartmula_repo,
        "repo_url": "https://github.com/HeartMuLa/heartlib",
        "description": "Lyrics-to-song engine with stronger reference-audio and controllable generation goals.",
        "best_for": "Full songs with lyrics, multilingual work, and reference-audio-guided direction.",
        "limitations": "Astral can launch it locally now, but the Windows + 16GB path is still experimental.",
        "capabilities": ["lyrics", "multilingual", "reference audio", "arrangement control"],
        "next_step": "Treat it as an alternate experimental render lane beside ACE-Step.",
    },
    {
        "id": SONGGENERATION_BACKEND,
        "label": "SongGeneration / LeVo 2",
        "kind": "render",
        "repo_dir": settings.songgeneration_repo,
        "repo_url": "https://github.com/tencent-ailab/SongGeneration",
        "description": "Commercial-grade lyrics-to-song research stack with mixed and dual-track generation.",
        "best_for": "Separate vocal and accompaniment outputs, long full songs, and stem-oriented workflows.",
        "limitations": "Very CUDA-heavy, and Astral's current Windows adapter is still experimental.",
        "capabilities": ["lyrics", "stems", "dual-track", "multilingual"],
        "next_step": "Run the SongGeneration bootstrap to install its venv, runtime assets, and a compatible checkpoint.",
    },
    {
        "id": "yue",
        "label": "YuE",
        "kind": "render",
        "repo_dir": settings.yue_repo,
        "repo_url": "https://github.com/multimodal-art-projection/YuE",
        "description": "Open lyrics-to-song stack focused on full-length song generation.",
        "best_for": "Long structured song generation when you want another open lyrics backend in the lab.",
        "limitations": "Resource-hungry and not yet adapted to Astral's Windows launcher path.",
        "capabilities": ["lyrics", "full song", "multilingual"],
        "next_step": "Keep the repo ready so Astral can gain a YuE adapter later without changing the UI again.",
    },
    {
        "id": "jasco",
        "label": "AudioCraft JASCO",
        "kind": "specialist",
        "repo_dir": settings.audiocraft_repo,
        "repo_url": "https://github.com/facebookresearch/audiocraft",
        "description": "Control-oriented AudioCraft path for chord, drum, and melody guidance.",
        "best_for": "Alice orchestration lab work, harmonic planning, and controlled instrumental experiments.",
        "limitations": "Not a full drop-in Suno-style render backend by itself.",
        "capabilities": ["instrumental", "chord control", "drum control", "melody control"],
        "next_step": "Vendored via AudioCraft so the orchestration lab can target it in a later pass.",
    },
    {
        "id": "stable-audio-tools",
        "label": "Stable Audio Tools",
        "kind": "specialist",
        "repo_dir": settings.stable_audio_repo,
        "repo_url": "https://github.com/stability-ai/stable-audio-tools",
        "description": "Texture, sting, ambience, and audio-design stack.",
        "best_for": "Intro beds, fx swells, brand stings, and production candy for Alice.",
        "limitations": "Not a direct lyrics-to-full-song backend in Astral yet.",
        "capabilities": ["instrumental", "sound design", "stings", "ambience"],
        "next_step": "Use it later as a production-color engine beside the main song backends.",
    },
    {
        "id": "soulx-singer",
        "label": "SoulX-Singer",
        "kind": "specialist",
        "repo_dir": settings.soulx_repo,
        "repo_url": "https://github.com/Soul-AILab/SoulX-Singer",
        "description": "Singer identity and cross-lingual vocal specialist.",
        "best_for": "Singer locking, vocal replacement, and stronger cross-language vocalist identity.",
        "limitations": "Not wired as a live Astral render path yet.",
        "capabilities": ["singing voice", "cross-lingual", "voice identity"],
        "next_step": "Use it later as a voice-focused lane beside the main song engines.",
    },
    {
        "id": "diffsinger",
        "label": "DiffSinger",
        "kind": "specialist",
        "repo_dir": settings.diffsinger_repo,
        "repo_url": "https://github.com/MoonInTheRiver/DiffSinger",
        "description": "Classic controllable singing-synthesis toolkit.",
        "best_for": "Manual singing synthesis experiments, melody-led singing, and editor-style vocal work.",
        "limitations": "More of a singing toolkit than a one-click full-song backend.",
        "capabilities": ["singing voice", "control", "vocal editing"],
        "next_step": "Keep it vendored for future precision vocal editing tools.",
    },
]


def encode_song_model_selection(backend_id: str, model_id: str) -> str:
    backend = (backend_id or ACE_STEP_BACKEND).strip() or ACE_STEP_BACKEND
    model = (model_id or "").strip()
    return f"{backend}::{model}" if model else backend


def decode_song_model_selection(value: str) -> tuple[str, str]:
    raw = (value or "").strip()
    if not raw:
        return ACE_STEP_BACKEND, settings.ace_step_model
    if "::" in raw:
        backend, model = raw.split("::", 1)
        backend = (backend or ACE_STEP_BACKEND).strip() or ACE_STEP_BACKEND
        return backend, model.strip()
    if raw.startswith("facebook/musicgen"):
        return MUSICGEN_BACKEND, raw
    if raw.startswith("songgeneration"):
        return SONGGENERATION_BACKEND, raw
    if raw.startswith("acestep"):
        return ACE_STEP_BACKEND, raw
    return ACE_STEP_BACKEND, raw


def repo_sync_state(repo_dir: Path) -> tuple[str, str]:
    if repo_dir.exists():
        return "repo-synced", "Repo synced"
    return "not-installed", "Not cloned"
