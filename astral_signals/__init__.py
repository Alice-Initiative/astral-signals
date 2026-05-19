"""Astral Signals local music generation pipeline."""

from __future__ import annotations

import os
from pathlib import Path


_storage_root = Path(os.getenv("ASTRAL_SIGNALS_HOME", r"S:\AstralSignals"))
_hf_home = _storage_root / "cache" / "hf-home"
_hf_hub_cache = _storage_root / "cache" / "huggingface"
_torch_home = _storage_root / "cache" / "torch"

os.environ.setdefault("HF_HOME", str(_hf_home))
os.environ.setdefault("HF_HUB_CACHE", str(_hf_hub_cache))
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
os.environ.setdefault("TORCH_HOME", str(_torch_home))

__all__ = ["__version__"]

__version__ = "0.1.0"
