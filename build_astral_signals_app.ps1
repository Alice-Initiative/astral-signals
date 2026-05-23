[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$buildRoot = $env:ASTRAL_SIGNALS_HOME
if ([string]::IsNullOrWhiteSpace($buildRoot)) {
  $buildRoot = "S:\AstralSignals"
}
$desktopBuildRoot = Join-Path $buildRoot "desktop-app"
$distPath = Join-Path $desktopBuildRoot "dist"
$workPath = Join-Path $desktopBuildRoot "build"
$shortcutPath = Join-Path $desktopBuildRoot "Astral Signals.lnk"

[System.IO.Directory]::CreateDirectory($distPath) | Out-Null
[System.IO.Directory]::CreateDirectory($workPath) | Out-Null

python -m pip install -e .
if ($LASTEXITCODE -ne 0) { throw "Editable install failed." }
python -m pip install pyinstaller
if ($LASTEXITCODE -ne 0) { throw "PyInstaller install failed." }

pyinstaller --noconfirm --clean --distpath $distPath --workpath $workPath astral_signals_desktop.spec
if ($LASTEXITCODE -ne 0) { throw "Desktop app build failed." }

$exePath = Join-Path $distPath "AstralSignals.exe"
if (-not (Test-Path -LiteralPath $exePath)) {
  throw "Desktop build finished without producing $exePath"
}

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = $distPath
$shortcut.IconLocation = "$exePath,0"
$shortcut.Description = "Astral Signals desktop app"
$shortcut.Save()

Write-Host ""
Write-Host "Astral Signals desktop build complete:" -ForegroundColor Cyan
Write-Host "  $exePath"
Write-Host "  $shortcutPath"
