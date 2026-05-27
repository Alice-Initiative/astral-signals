[CmdletBinding()]
param(
  [switch]$Browser,
  [switch]$ServerOnly
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Set-IfMissing {
  param(
    [string]$Name,
    [string]$Value
  )

  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($Name, "Process"))) {
    Set-Item -Path "Env:$Name" -Value $Value
  }
}

Set-IfMissing "ASTRAL_SIGNALS_HOME" "S:\AstralSignals"
Set-IfMissing "ASTRAL_SIGNALS_HOST" "127.0.0.1"
Set-IfMissing "ASTRAL_SIGNALS_ACCESS_HOST" "127.0.0.1"
Set-IfMissing "ASTRAL_SIGNALS_PORT" "7860"
Set-IfMissing "ASTRAL_SIGNALS_VENDOR_ROOT" "$env:ASTRAL_SIGNALS_HOME\vendors"
Set-IfMissing "ASTRAL_SIGNALS_OLLAMA_BIN" "S:\Ollama\app\ollama.exe"
Set-IfMissing "ASTRAL_SIGNALS_OLLAMA_MODELS" "S:\Ollama\.ollama\models"
Set-IfMissing "ASTRAL_SIGNALS_OLLAMA_HOST" "http://127.0.0.1:11435"
Set-IfMissing "ASTRAL_SIGNALS_OLLAMA_MODEL" "qwen3:4b"
Set-IfMissing "ASTRAL_SIGNALS_MUSICGEN_MODEL" "facebook/musicgen-small"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_REPO" "S:\AstralSignals\vendors\ACE-Step-1.5"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_API" "S:\AstralSignals\vendors\ACE-Step-1.5\.venv\Scripts\acestep-api.exe"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_HOST" "http://127.0.0.1:8001"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_MODEL" "acestep-v15-turbo"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_LM_MODEL" "acestep-5Hz-lm-1.7B"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_STARTUP_TIMEOUT" "150"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_SERVER_TIMEOUT" "10800"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_DISABLE_THINKING_AFTER" "120"
Set-IfMissing "ACESTEP_TASK_TIMEOUT_SECONDS" "10800"
Set-IfMissing "ASTRAL_SIGNALS_ACE_STEP_CHECKPOINTS" "$env:ASTRAL_SIGNALS_HOME\models\ace-step"
Set-IfMissing "ASTRAL_SIGNALS_VOICEBOX_REPO" "S:\AstralSignals\vendors\voicebox"
Set-IfMissing "ASTRAL_SIGNALS_VOICEBOX_HOST" "http://127.0.0.1:17493"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_REPO" "$env:ASTRAL_SIGNALS_VENDOR_ROOT\heartlib"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_VENV" "$env:ASTRAL_SIGNALS_HEARTMULA_REPO\.venv"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_CKPT" "$env:ASTRAL_SIGNALS_HOME\models\heartmula\ckpt"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_MODEL" "HeartMuLa-oss-3B-happy-new-year"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_VERSION" "3B"
Set-IfMissing "ASTRAL_SIGNALS_SONGGENERATION_REPO" "$env:ASTRAL_SIGNALS_VENDOR_ROOT\SongGeneration"
Set-IfMissing "ASTRAL_SIGNALS_SONGGENERATION_RUNTIME" "$env:ASTRAL_SIGNALS_HOME\models\songgeneration\runtime"
Set-IfMissing "ASTRAL_SIGNALS_SONGGENERATION_MODELS" "$env:ASTRAL_SIGNALS_HOME\models\songgeneration"
Set-IfMissing "ASTRAL_SIGNALS_SONGGENERATION_MODEL" "songgeneration_v2_large"
Set-IfMissing "ASTRAL_SIGNALS_YUE_REPO" "$env:ASTRAL_SIGNALS_VENDOR_ROOT\YuE"
Set-IfMissing "ASTRAL_SIGNALS_AUDIOCRAFT_REPO" "$env:ASTRAL_SIGNALS_VENDOR_ROOT\audiocraft"
Set-IfMissing "ASTRAL_SIGNALS_STABLE_AUDIO_REPO" "$env:ASTRAL_SIGNALS_VENDOR_ROOT\stable-audio-tools"
Set-IfMissing "ASTRAL_SIGNALS_SOULX_REPO" "$env:ASTRAL_SIGNALS_VENDOR_ROOT\SoulX-Singer"
Set-IfMissing "ASTRAL_SIGNALS_DIFFSINGER_REPO" "$env:ASTRAL_SIGNALS_VENDOR_ROOT\DiffSinger"
Set-IfMissing "VOICEBOX_MODELS_DIR" "$env:ASTRAL_SIGNALS_HOME\cache\huggingface\voicebox-hf"
Set-IfMissing "HF_HUB_CACHE" "$env:ASTRAL_SIGNALS_HOME\cache\huggingface\voicebox-hf"
Set-IfMissing "HF_HOME" "$env:ASTRAL_SIGNALS_HOME\cache\huggingface"
Set-IfMissing "TRANSFORMERS_CACHE" "$env:ASTRAL_SIGNALS_HOME\cache\huggingface\voicebox-hf"
Set-IfMissing "TEMP" "$env:ASTRAL_SIGNALS_HOME\cache\tmp"
Set-IfMissing "TMP" "$env:ASTRAL_SIGNALS_HOME\cache\tmp"

$desktopExe = Join-Path $env:ASTRAL_SIGNALS_HOME "desktop-app\dist\AstralSignals.exe"

[System.IO.Directory]::CreateDirectory($env:VOICEBOX_MODELS_DIR) | Out-Null
[System.IO.Directory]::CreateDirectory($env:HF_HOME) | Out-Null
[System.IO.Directory]::CreateDirectory($env:TEMP) | Out-Null

if ($Browser -and $ServerOnly) {
  throw "Choose either -Browser or -ServerOnly, not both."
}

if ($ServerOnly) {
  python -m astral_signals.desktop --server-only
}
elseif ($Browser) {
  python -m astral_signals.desktop --browser
}
else {
  if (Test-Path -LiteralPath $desktopExe) {
    & $desktopExe
  }
  else {
    python -m astral_signals.desktop
  }
}
