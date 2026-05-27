"""Astral Signals local music generation pipeline."""

from __future__ import annotations

import os
from pathlib import Path


def _default_storage_root() -> Path:
    configured = (os.getenv("ASTRAL_SIGNALS_HOME") or "").strip()
    if configured:
        return Path(configured).expanduser()
    if os.name == "nt":
        return Path(r"S:\AstralSignals")
    return Path.home() / "AstralSignals"


_storage_root = _default_storage_root()
_hf_home = _storage_root / "cache" / "hf-home"
_hf_hub_cache = _storage_root / "cache" / "huggingface"
_torch_home = _storage_root / "cache" / "torch"

os.environ.setdefault("HF_HOME", str(_hf_home))
os.environ.setdefault("HF_HUB_CACHE", str(_hf_hub_cache))
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
os.environ.setdefault("TORCH_HOME", str(_torch_home))

__all__ = ["__version__"]

__version__ = "0.1.0"
