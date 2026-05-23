# Contributing to Astral Signals

Thanks for helping improve Astral Signals.

## Before you start

- The main local workflow is currently tuned for `Windows + NVIDIA CUDA`
- Heavy assets are expected to live outside the repo, usually under `S:\AstralSignals`
- Please avoid committing local caches, outputs, logs, or downloaded model weights

## Local setup

```powershell
python -m pip install -e .
.\launch_astral_signals.ps1
```

Fallback modes:

```powershell
.\launch_astral_signals.ps1 -Browser
.\launch_astral_signals.ps1 -ServerOnly
```

Optional backends:

```powershell
.\bootstrap_optional_engines.ps1
.\bootstrap_songgeneration_backend.ps1
.\bootstrap_heartmula_backend.ps1
```

## Contribution guidelines

- Keep changes local-first and privacy-aware
- Prefer defaults that are friendly to smaller single-GPU systems when practical
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
