param(
    [ValidateSet("songgeneration_base", "songgeneration_base_new", "songgeneration_base_full", "songgeneration_large", "songgeneration_v2_large")]
    [string]$ModelId = "songgeneration_v2_large"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Join-Path $RepoRoot "astral_signals"

function Get-EnvOrDefault([string]$Name, [string]$Default) {
    $item = Get-Item -Path "Env:$Name" -ErrorAction SilentlyContinue
    if ($item -and $item.Value -and $item.Value.Trim()) {
        return $item.Value
    }
    return $Default
}

$VendorRepo = Get-EnvOrDefault "ASTRAL_SIGNALS_SONGGENERATION_REPO" "S:\AstralSignals\vendors\SongGeneration"
$VenvDir = Get-EnvOrDefault "ASTRAL_SIGNALS_SONGGENERATION_VENV" (Join-Path $VendorRepo ".venv")
$RuntimeDir = Get-EnvOrDefault "ASTRAL_SIGNALS_SONGGENERATION_RUNTIME" "S:\AstralSignals\models\songgeneration\runtime"
$ModelsDir = Get-EnvOrDefault "ASTRAL_SIGNALS_SONGGENERATION_MODELS" "S:\AstralSignals\models\songgeneration"

$ModelMap = @{
    "songgeneration_base" = @{
        Repo = "lglg666/SongGeneration-base"
        Dir = "songgeneration_base"
    }
    "songgeneration_base_new" = @{
        Repo = "lglg666/SongGeneration-base-new"
        Dir = "songgeneration_base_new"
    }
    "songgeneration_base_full" = @{
        Repo = "lglg666/SongGeneration-base-full"
        Dir = "songgeneration_base_full"
    }
    "songgeneration_large" = @{
        Repo = "lglg666/SongGeneration-large"
        Dir = "songgeneration_large"
    }
    "songgeneration_v2_large" = @{
        Repo = "lglg666/SongGeneration-v2-large"
        Dir = "songgeneration_v2_large"
    }
}

if (-not (Test-Path $VendorRepo)) {
    throw "SongGeneration repo not found at $VendorRepo. Run .\bootstrap_optional_engines.ps1 first."
}

New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null
New-Item -ItemType Directory -Force -Path $ModelsDir | Out-Null

if (-not (Test-Path $VenvDir)) {
    python -m venv $VenvDir
}

$Python = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $Python)) {
    throw "Expected SongGeneration Python at $Python"
}

& $Python -m pip install --upgrade pip setuptools wheel
& $Python -m pip install torch==2.6.0 torchaudio==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu124
& $Python -m pip install -r (Join-Path $VendorRepo "requirements.txt")
& $Python -m pip install -r (Join-Path $VendorRepo "requirements_nodeps.txt") --no-deps
& $Python -m pip install huggingface-hub==0.25.2
& $Python -m pip install hydra-core==1.3.2 omegaconf==2.3.0 antlr4-python3-runtime==4.9.3 setuptools==80.9.0

$RuntimeDownload = @"
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id="lglg666/SongGeneration-Runtime",
    local_dir=r"$RuntimeDir",
    local_dir_use_symlinks=False,
    resume_download=True,
)
"@
$RuntimeDownload | & $Python -

$ModelRepo = $ModelMap[$ModelId].Repo
$ModelDir = Join-Path $ModelsDir $ModelMap[$ModelId].Dir
New-Item -ItemType Directory -Force -Path $ModelDir | Out-Null
$ModelDownload = @"
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id=r"$ModelRepo",
    local_dir=r"$ModelDir",
    local_dir_use_symlinks=False,
    resume_download=True,
)
"@
$ModelDownload | & $Python -

$RepoCkpt = Join-Path $VendorRepo "ckpt"
$RepoThirdParty = Join-Path $VendorRepo "third_party"
$RuntimeCkpt = Join-Path $RuntimeDir "ckpt"
$RuntimeThirdParty = Join-Path $RuntimeDir "third_party"

foreach ($Pair in @(
    @{ Target = $RepoCkpt; Source = $RuntimeCkpt },
    @{ Target = $RepoThirdParty; Source = $RuntimeThirdParty }
)) {
    if (Test-Path $Pair.Target) {
        Remove-Item -LiteralPath $Pair.Target -Force -Recurse
    }
    New-Item -ItemType Junction -Path $Pair.Target -Target $Pair.Source | Out-Null
}

Write-Host "SongGeneration backend staged."
Write-Host "Repo: $VendorRepo"
Write-Host "Venv: $VenvDir"
Write-Host "Runtime: $RuntimeDir"
Write-Host "Model: $ModelId -> $ModelDir"
