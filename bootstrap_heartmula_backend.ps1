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
Set-IfMissing "ASTRAL_SIGNALS_VENDOR_ROOT" "$env:ASTRAL_SIGNALS_HOME\vendors"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_REPO" "$env:ASTRAL_SIGNALS_VENDOR_ROOT\heartlib"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_VENV" "$env:ASTRAL_SIGNALS_HEARTMULA_REPO\.venv"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_CKPT" "$env:ASTRAL_SIGNALS_HOME\models\heartmula\ckpt"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_MODEL" "HeartMuLa-oss-3B-happy-new-year"
Set-IfMissing "ASTRAL_SIGNALS_HEARTMULA_VERSION" "3B"
Set-IfMissing "HF_HOME" "$env:ASTRAL_SIGNALS_HOME\cache\huggingface"
Set-IfMissing "HF_HUB_CACHE" "$env:ASTRAL_SIGNALS_HOME\cache\huggingface"

[System.IO.Directory]::CreateDirectory($env:ASTRAL_SIGNALS_HEARTMULA_REPO) | Out-Null
[System.IO.Directory]::CreateDirectory($env:ASTRAL_SIGNALS_HEARTMULA_CKPT) | Out-Null

if (-not (Test-Path (Join-Path $env:ASTRAL_SIGNALS_HEARTMULA_REPO ".git"))) {
  throw "HeartMuLa repo not found at $env:ASTRAL_SIGNALS_HEARTMULA_REPO. Run .\\bootstrap_optional_engines.ps1 first."
}

if (-not (Test-Path (Join-Path $env:ASTRAL_SIGNALS_HEARTMULA_VENV "Scripts\\python.exe"))) {
  python -m venv --system-site-packages $env:ASTRAL_SIGNALS_HEARTMULA_VENV
}

$heartPython = Join-Path $env:ASTRAL_SIGNALS_HEARTMULA_VENV "Scripts\\python.exe"
& $heartPython -m pip install --upgrade pip setuptools wheel
& $heartPython -m pip install -e $env:ASTRAL_SIGNALS_HEARTMULA_REPO --no-deps
& $heartPython -m pip install torchtune==0.4.0 torchao==0.9.0 vector-quantize-pytorch==1.27.15

@'
from huggingface_hub import snapshot_download
from pathlib import Path
import os

ckpt_root = Path(os.environ["ASTRAL_SIGNALS_HEARTMULA_CKPT"])
snapshot_download(
    repo_id="HeartMuLa/HeartMuLaGen",
    local_dir=str(ckpt_root),
    local_dir_use_symlinks=False,
)
snapshot_download(
    repo_id="HeartMuLa/HeartMuLa-oss-3B-happy-new-year",
    local_dir=str(ckpt_root / "HeartMuLa-oss-3B"),
    local_dir_use_symlinks=False,
)
snapshot_download(
    repo_id="HeartMuLa/HeartCodec-oss-20260123",
    local_dir=str(ckpt_root / "HeartCodec-oss"),
    local_dir_use_symlinks=False,
)
print(f"HeartMuLa checkpoints ready at {ckpt_root}")
'@ | python -

Write-Host ""
Write-Host "HeartMuLa backend is staged."
Write-Host "Repo: $env:ASTRAL_SIGNALS_HEARTMULA_REPO"
Write-Host "Venv: $env:ASTRAL_SIGNALS_HEARTMULA_VENV"
Write-Host "Checkpoints: $env:ASTRAL_SIGNALS_HEARTMULA_CKPT"
