from __future__ import annotations

from dataclasses import dataclass
import os
from pathlib import Path
import sys

PACKAGE_ROOT = Path(__file__).resolve().parent
if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
    PROJECT_ROOT = Path(sys._MEIPASS)
    STATIC_DIR = PROJECT_ROOT / "astral_signals" / "static"
else:
    PROJECT_ROOT = PACKAGE_ROOT.parent
    STATIC_DIR = PACKAGE_ROOT / "static"
DEFAULT_STORAGE_ROOT = Path(os.getenv("ASTRAL_SIGNALS_HOME", r"S:\AstralSignals"))
DEFAULT_VENDOR_ROOT = Path(os.getenv("ASTRAL_SIGNALS_VENDOR_ROOT", str(DEFAULT_STORAGE_ROOT / "vendors")))
DEFAULT_OLLAMA_BIN = Path(os.getenv("ASTRAL_SIGNALS_OLLAMA_BIN", r"S:\Ollama\app\ollama.exe"))
DEFAULT_OLLAMA_MODELS = Path(os.getenv("ASTRAL_SIGNALS_OLLAMA_MODELS", r"S:\Ollama\.ollama\models"))
DEFAULT_OLLAMA_HOST = os.getenv("ASTRAL_SIGNALS_OLLAMA_HOST", "http://127.0.0.1:11435").rstrip("/")
DEFAULT_OLLAMA_MODEL = os.getenv("ASTRAL_SIGNALS_OLLAMA_MODEL", "qwen3:4b")
DEFAULT_OLLAMA_TIMEOUT = int(os.getenv("ASTRAL_SIGNALS_OLLAMA_TIMEOUT", "240"))
DEFAULT_MUSICGEN_MODEL = os.getenv("ASTRAL_SIGNALS_MUSICGEN_MODEL", "facebook/musicgen-small")
DEFAULT_TRANSLATION_MODEL = os.getenv(
    "ASTRAL_SIGNALS_TRANSLATION_MODEL",
    "facebook/nllb-200-distilled-600M",
)
DEFAULT_ACE_STEP_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_ACE_STEP_REPO", r"S:\AstralSignals\vendors\ACE-Step-1.5")
)
DEFAULT_ACE_STEP_API = Path(
    os.getenv(
        "ASTRAL_SIGNALS_ACE_STEP_API",
        str(DEFAULT_ACE_STEP_REPO / ".venv" / "Scripts" / "acestep-api.exe"),
    )
)
DEFAULT_ACE_STEP_HOST = os.getenv("ASTRAL_SIGNALS_ACE_STEP_HOST", "http://127.0.0.1:8001").rstrip("/")
DEFAULT_ACE_STEP_MODEL = os.getenv("ASTRAL_SIGNALS_ACE_STEP_MODEL", "acestep-v15-turbo")
DEFAULT_ACE_STEP_LM_MODEL = os.getenv("ASTRAL_SIGNALS_ACE_STEP_LM_MODEL", "acestep-5Hz-lm-1.7B")
DEFAULT_ACE_STEP_LONG_LYRIC_LM_MODEL = os.getenv(
    "ASTRAL_SIGNALS_ACE_STEP_LONG_LYRIC_LM_MODEL",
    "acestep-5Hz-lm-0.6B",
)
DEFAULT_ACE_STEP_TIMEOUT = int(os.getenv("ASTRAL_SIGNALS_ACE_STEP_TIMEOUT", "2400"))
DEFAULT_ACE_STEP_STARTUP_TIMEOUT = int(os.getenv("ASTRAL_SIGNALS_ACE_STEP_STARTUP_TIMEOUT", "150"))
DEFAULT_ACE_STEP_SERVER_TIMEOUT = int(os.getenv("ASTRAL_SIGNALS_ACE_STEP_SERVER_TIMEOUT", "10800"))
DEFAULT_ACE_STEP_DISABLE_THINKING_AFTER = int(
    os.getenv("ASTRAL_SIGNALS_ACE_STEP_DISABLE_THINKING_AFTER", "120")
)
DEFAULT_ACE_STEP_QUEUE_PATIENCE = int(os.getenv("ASTRAL_SIGNALS_ACE_STEP_QUEUE_PATIENCE", "180"))
DEFAULT_ACE_STEP_CHECKPOINTS = Path(
    os.getenv(
        "ASTRAL_SIGNALS_ACE_STEP_CHECKPOINTS",
        str(DEFAULT_STORAGE_ROOT / "models" / "ace-step"),
    )
)
DEFAULT_VOICEBOX_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_VOICEBOX_REPO", r"S:\AstralSignals\vendors\voicebox")
)
DEFAULT_VOICEBOX_HOST = os.getenv("ASTRAL_SIGNALS_VOICEBOX_HOST", "http://127.0.0.1:17493").rstrip("/")
DEFAULT_HEARTMULA_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_HEARTMULA_REPO", str(DEFAULT_VENDOR_ROOT / "heartlib"))
)
DEFAULT_HEARTMULA_VENV = Path(
    os.getenv(
        "ASTRAL_SIGNALS_HEARTMULA_VENV",
        str(DEFAULT_HEARTMULA_REPO / ".venv"),
    )
)
DEFAULT_HEARTMULA_CKPT = Path(
    os.getenv(
        "ASTRAL_SIGNALS_HEARTMULA_CKPT",
        str(DEFAULT_STORAGE_ROOT / "models" / "heartmula" / "ckpt"),
    )
)
DEFAULT_HEARTMULA_MODEL = os.getenv(
    "ASTRAL_SIGNALS_HEARTMULA_MODEL",
    "HeartMuLa-oss-3B-happy-new-year",
)
DEFAULT_HEARTMULA_VERSION = os.getenv("ASTRAL_SIGNALS_HEARTMULA_VERSION", "3B")
DEFAULT_SONGGENERATION_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_SONGGENERATION_REPO", str(DEFAULT_VENDOR_ROOT / "SongGeneration"))
)
DEFAULT_SONGGENERATION_VENV = Path(
    os.getenv(
        "ASTRAL_SIGNALS_SONGGENERATION_VENV",
        str(DEFAULT_SONGGENERATION_REPO / ".venv"),
    )
)
DEFAULT_SONGGENERATION_RUNTIME = Path(
    os.getenv(
        "ASTRAL_SIGNALS_SONGGENERATION_RUNTIME",
        str(DEFAULT_STORAGE_ROOT / "models" / "songgeneration" / "runtime"),
    )
)
DEFAULT_SONGGENERATION_MODELS = Path(
    os.getenv(
        "ASTRAL_SIGNALS_SONGGENERATION_MODELS",
        str(DEFAULT_STORAGE_ROOT / "models" / "songgeneration"),
    )
)
DEFAULT_SONGGENERATION_MODEL = os.getenv(
    "ASTRAL_SIGNALS_SONGGENERATION_MODEL",
    "songgeneration_v2_large",
)
DEFAULT_SONGGENERATION_TIMEOUT = int(
    os.getenv("ASTRAL_SIGNALS_SONGGENERATION_TIMEOUT", "7200")
)
DEFAULT_SONGGENERATION_LOW_MEM = os.getenv(
    "ASTRAL_SIGNALS_SONGGENERATION_LOW_MEM",
    "true",
).strip().lower() in {"1", "true", "yes", "on"}
DEFAULT_SONGGENERATION_USE_FLASH_ATTN = os.getenv(
    "ASTRAL_SIGNALS_SONGGENERATION_USE_FLASH_ATTN",
    "false",
).strip().lower() in {"1", "true", "yes", "on"}
DEFAULT_YUE_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_YUE_REPO", str(DEFAULT_VENDOR_ROOT / "YuE"))
)
DEFAULT_AUDIOCRAFT_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_AUDIOCRAFT_REPO", str(DEFAULT_VENDOR_ROOT / "audiocraft"))
)
DEFAULT_STABLE_AUDIO_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_STABLE_AUDIO_REPO", str(DEFAULT_VENDOR_ROOT / "stable-audio-tools"))
)
DEFAULT_SOULX_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_SOULX_REPO", str(DEFAULT_VENDOR_ROOT / "SoulX-Singer"))
)
DEFAULT_DIFFSINGER_REPO = Path(
    os.getenv("ASTRAL_SIGNALS_DIFFSINGER_REPO", str(DEFAULT_VENDOR_ROOT / "DiffSinger"))
)
DEFAULT_VOICE_CLONE_ANCHOR_STRENGTH = float(
    os.getenv("ASTRAL_SIGNALS_VOICE_CLONE_ANCHOR_STRENGTH", "0.18")
)


@dataclass(frozen=True)
class Settings:
    project_root: Path = PROJECT_ROOT
    storage_root: Path = DEFAULT_STORAGE_ROOT
    output_dir: Path = DEFAULT_STORAGE_ROOT / "outputs"
    drafts_dir: Path = DEFAULT_STORAGE_ROOT / "drafts"
    analysis_dir: Path = DEFAULT_STORAGE_ROOT / "analysis"
    cache_dir: Path = DEFAULT_STORAGE_ROOT / "cache" / "huggingface"
    torch_cache_dir: Path = DEFAULT_STORAGE_ROOT / "cache" / "torch"
    logs_dir: Path = DEFAULT_STORAGE_ROOT / "logs"
    static_dir: Path = STATIC_DIR
    host: str = "127.0.0.1"
    port: int = 7860
    vendor_root: Path = DEFAULT_VENDOR_ROOT
    ollama_binary: Path = DEFAULT_OLLAMA_BIN
    ollama_models_dir: Path = DEFAULT_OLLAMA_MODELS
    ollama_host: str = DEFAULT_OLLAMA_HOST
    ollama_model: str = DEFAULT_OLLAMA_MODEL
    ollama_timeout_seconds: int = DEFAULT_OLLAMA_TIMEOUT
    musicgen_model: str = DEFAULT_MUSICGEN_MODEL
    translation_model: str = DEFAULT_TRANSLATION_MODEL
    ace_step_repo: Path = DEFAULT_ACE_STEP_REPO
    ace_step_api_binary: Path = DEFAULT_ACE_STEP_API
    ace_step_host: str = DEFAULT_ACE_STEP_HOST
    ace_step_model: str = DEFAULT_ACE_STEP_MODEL
    ace_step_lm_model: str = DEFAULT_ACE_STEP_LM_MODEL
    ace_step_long_lyric_lm_model: str = DEFAULT_ACE_STEP_LONG_LYRIC_LM_MODEL
    ace_step_timeout_seconds: int = DEFAULT_ACE_STEP_TIMEOUT
    ace_step_startup_timeout_seconds: int = DEFAULT_ACE_STEP_STARTUP_TIMEOUT
    ace_step_server_timeout_seconds: int = DEFAULT_ACE_STEP_SERVER_TIMEOUT
    ace_step_disable_thinking_after_seconds: int = DEFAULT_ACE_STEP_DISABLE_THINKING_AFTER
    ace_step_queue_patience_seconds: int = DEFAULT_ACE_STEP_QUEUE_PATIENCE
    ace_step_checkpoints_dir: Path = DEFAULT_ACE_STEP_CHECKPOINTS
    voicebox_repo: Path = DEFAULT_VOICEBOX_REPO
    voicebox_host: str = DEFAULT_VOICEBOX_HOST
    heartmula_repo: Path = DEFAULT_HEARTMULA_REPO
    heartmula_venv: Path = DEFAULT_HEARTMULA_VENV
    heartmula_ckpt_dir: Path = DEFAULT_HEARTMULA_CKPT
    heartmula_model: str = DEFAULT_HEARTMULA_MODEL
    heartmula_version: str = DEFAULT_HEARTMULA_VERSION
    songgeneration_repo: Path = DEFAULT_SONGGENERATION_REPO
    songgeneration_venv: Path = DEFAULT_SONGGENERATION_VENV
    songgeneration_runtime_dir: Path = DEFAULT_SONGGENERATION_RUNTIME
    songgeneration_models_dir: Path = DEFAULT_SONGGENERATION_MODELS
    songgeneration_model: str = DEFAULT_SONGGENERATION_MODEL
    songgeneration_timeout_seconds: int = DEFAULT_SONGGENERATION_TIMEOUT
    songgeneration_low_mem: bool = DEFAULT_SONGGENERATION_LOW_MEM
    songgeneration_use_flash_attn: bool = DEFAULT_SONGGENERATION_USE_FLASH_ATTN
    yue_repo: Path = DEFAULT_YUE_REPO
    audiocraft_repo: Path = DEFAULT_AUDIOCRAFT_REPO
    stable_audio_repo: Path = DEFAULT_STABLE_AUDIO_REPO
    soulx_repo: Path = DEFAULT_SOULX_REPO
    diffsinger_repo: Path = DEFAULT_DIFFSINGER_REPO
    voice_anchor_dir: Path = DEFAULT_STORAGE_ROOT / "voice-anchors"
    voice_clone_anchor_strength: float = DEFAULT_VOICE_CLONE_ANCHOR_STRENGTH


settings = Settings()
settings.storage_root.mkdir(parents=True, exist_ok=True)
settings.vendor_root.mkdir(parents=True, exist_ok=True)
settings.output_dir.mkdir(parents=True, exist_ok=True)
settings.drafts_dir.mkdir(parents=True, exist_ok=True)
settings.analysis_dir.mkdir(parents=True, exist_ok=True)
settings.cache_dir.mkdir(parents=True, exist_ok=True)
settings.torch_cache_dir.mkdir(parents=True, exist_ok=True)
settings.logs_dir.mkdir(parents=True, exist_ok=True)
settings.ace_step_checkpoints_dir.mkdir(parents=True, exist_ok=True)
settings.voice_anchor_dir.mkdir(parents=True, exist_ok=True)
settings.heartmula_ckpt_dir.mkdir(parents=True, exist_ok=True)
settings.songgeneration_runtime_dir.mkdir(parents=True, exist_ok=True)
settings.songgeneration_models_dir.mkdir(parents=True, exist_ok=True)
