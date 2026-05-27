#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

export ASTRAL_SIGNALS_HOME="${ASTRAL_SIGNALS_HOME:-$HOME/AstralSignals}"
export ASTRAL_SIGNALS_HOST="${ASTRAL_SIGNALS_HOST:-127.0.0.1}"
export ASTRAL_SIGNALS_ACCESS_HOST="${ASTRAL_SIGNALS_ACCESS_HOST:-127.0.0.1}"
export ASTRAL_SIGNALS_PORT="${ASTRAL_SIGNALS_PORT:-7860}"
export ASTRAL_SIGNALS_VENDOR_ROOT="${ASTRAL_SIGNALS_VENDOR_ROOT:-$ASTRAL_SIGNALS_HOME/vendors}"

PYTHON_BIN="${PYTHON_BIN:-}"
if [[ -z "$PYTHON_BIN" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
  else
    PYTHON_BIN="python"
  fi
fi

exec "$PYTHON_BIN" -m astral_signals.desktop "$@"
