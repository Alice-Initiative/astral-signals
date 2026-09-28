@echo off
setlocal
cd /d "%~dp0"

set "ASTRAL_SIGNALS_HOST=0.0.0.0"
set "ASTRAL_SIGNALS_ACCESS_HOST=127.0.0.1"
set "ASTRAL_SIGNALS_PORT=7860"

echo Starting Astral Signals in network mode...
echo Local UI: http://127.0.0.1:7860
echo LAN API/UI: use this host's LAN address on port 7860
echo Tailscale API/UI: use this host's Tailscale address on port 7860
echo.

powershell -NoExit -ExecutionPolicy Bypass -Command "& { Set-Location '%~dp0'; $env:ASTRAL_SIGNALS_HOST='0.0.0.0'; $env:ASTRAL_SIGNALS_ACCESS_HOST='127.0.0.1'; $env:ASTRAL_SIGNALS_PORT='7860'; .\\launch_astral_signals.ps1 -ServerOnly }"
