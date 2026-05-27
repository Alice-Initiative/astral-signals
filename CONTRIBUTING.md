# Contributing to Astral Signals

Thanks for helping improve Astral Signals.

## Before you start

- The main local workflow is most polished on `Windows + NVIDIA CUDA`, but the app should still launch cleanly in CPU-only mode on supported platforms
- Heavy assets are expected to live outside the repo, typically under your chosen `ASTRAL_SIGNALS_HOME`
- Please avoid committing local caches, outputs, logs, or downloaded model weights

## Local setup

```powershell
python -m pip install -e .
.\launch_astral_signals.ps1
```

```bash
python -m pip install -e .
./launch_astral_signals.sh
```

Fallback modes:

```powershell
.\launch_astral_signals.ps1 -Browser
.\launch_astral_signals.ps1 -ServerOnly
```

```bash
./launch_astral_signals.sh --browser
./launch_astral_signals.sh --server-only
```

Optional backends:

```powershell
.\bootstrap_optional_engines.ps1
.\bootstrap_songgeneration_backend.ps1
.\bootstrap_heartmula_backend.ps1
```

On Linux, install those optional repos and their venvs manually, then point Astral at them with the relevant `ASTRAL_SIGNALS_*` environment variables.

## Contribution guidelines

- Keep changes local-first and privacy-aware
- Prefer defaults that are friendly to smaller single-GPU systems when practical
- Keep CPU-only fallback paths honest: if a backend really needs CUDA, disable it clearly instead of letting it fail late
- Be explicit about experimental backends in UI copy and docs
- If you change frontend behavior, verify it in the desktop app window and, when needed, the browser fallback at `http://127.0.0.1:7860`
- If you add or tune a backend, record whether it is only staged or actually locally verified

## Pull requests

Helpful PRs usually include:

- A short explanation of the user-facing goal
- Notes on any engine-specific limitations
- Verification details such as a smoke render, UI check, or CLI command used

## License note

By contributing code, you agree that your contributions are released under the repository's MIT License. Upstream model weights and third-party backends may still carry their own separate licenses and terms.
