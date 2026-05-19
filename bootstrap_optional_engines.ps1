$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Resolve-VendorRoot {
  if (-not [string]::IsNullOrWhiteSpace($env:ASTRAL_SIGNALS_VENDOR_ROOT)) {
    return $env:ASTRAL_SIGNALS_VENDOR_ROOT
  }
  if (-not [string]::IsNullOrWhiteSpace($env:ASTRAL_SIGNALS_HOME)) {
    return (Join-Path $env:ASTRAL_SIGNALS_HOME "vendors")
  }
  return "S:\AstralSignals\vendors"
}

function Sync-Repo {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$Path
  )

  if (Test-Path $Path) {
    if (Test-Path (Join-Path $Path ".git")) {
      Write-Host "Updating $Name at $Path"
      git -C $Path pull --ff-only
      return
    }

    Write-Warning "$Name already exists at $Path but is not a git repo. Leaving it untouched."
    return
  }

  Write-Host "Cloning $Name into $Path"
  git clone --depth 1 $Url $Path
}

$vendorRoot = Resolve-VendorRoot
[System.IO.Directory]::CreateDirectory($vendorRoot) | Out-Null

$repos = @(
  @{ Name = "HeartMuLa"; Url = "https://github.com/HeartMuLa/heartlib.git"; Path = (Join-Path $vendorRoot "heartlib") }
  @{ Name = "SongGeneration"; Url = "https://github.com/tencent-ailab/SongGeneration.git"; Path = (Join-Path $vendorRoot "SongGeneration") }
  @{ Name = "YuE"; Url = "https://github.com/multimodal-art-projection/YuE.git"; Path = (Join-Path $vendorRoot "YuE") }
  @{ Name = "AudioCraft"; Url = "https://github.com/facebookresearch/audiocraft.git"; Path = (Join-Path $vendorRoot "audiocraft") }
  @{ Name = "Stable Audio Tools"; Url = "https://github.com/stability-ai/stable-audio-tools.git"; Path = (Join-Path $vendorRoot "stable-audio-tools") }
  @{ Name = "SoulX-Singer"; Url = "https://github.com/Soul-AILab/SoulX-Singer.git"; Path = (Join-Path $vendorRoot "SoulX-Singer") }
  @{ Name = "DiffSinger"; Url = "https://github.com/MoonInTheRiver/DiffSinger.git"; Path = (Join-Path $vendorRoot "DiffSinger") }
)

foreach ($repo in $repos) {
  Sync-Repo -Name $repo.Name -Url $repo.Url -Path $repo.Path
}

Write-Host ""
Write-Host "Optional engine repos are synced into $vendorRoot"
Write-Host "Astral will surface them in Engine Lab after the app refreshes."
