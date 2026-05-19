# Astral Signals

Astral Signals is a local "idea to full song" studio for Windows. It keeps composition, rendering, drafts, voice previews, stem splitting, and cloned speech on your machine while letting you work at two depths:

- `Quickstart`: describe the song, choose a voice lane, pick a model, render
- `Studio`: route singers by language, preview voices, clone speech, split stems, remix, orchestrate with Alice, and tune the runtime

The app is designed around local privacy first. Heavy assets default to `S:\AstralSignals`, but every path is overrideable with environment variables.

## What Astral can do

- Compose a full song plan and lyrics locally with Ollama
- Render full songs with ACE-Step
- Render fast instrumental or wordless sketches with MusicGen
- Render lyrical songs with an experimental HeartMuLa adapter
- Keep one singer locked across multiple languages, or route several singers intentionally
- Use a cloned speech profile as a low-strength timbre anchor for locked-singer renders
- Preview a singer before a full render
- Let `Alice Lab` art-direct hook shape, harmony motion, dynamic arc, orchestration, and transitions
- Let Alice generate and audition optional cloned `Voicebox` speech cues for intros, bridges, or outros
- Save named drafts plus browser autosave
- Split vocals and instrumentals, remix stems, and build lyric timing maps
- Show a live engine catalog in the UI so users can choose installed composer/song engines without editing code

## Current local stack

- `Composer`: Ollama
- `Primary song engine`: ACE-Step 1.5
- `Secondary sketch engine`: MusicGen
- `Stem-native alternate engine`: SongGeneration / LeVo 2
- `Experimental alternate song engine`: HeartMuLa OSS 3B
- `Speech clone / preview`: Voicebox
- `Stem tools`: local separation/remix utilities

## Models

Astral now reads installed local models dynamically:

- `Composer models` come from your live Ollama catalog
- `Live song engines` come from ACE-Step plus Astral's built-in MusicGen catalog
- `Optional engine labs` are discovered from vendored repos on disk

That means users can install more local composer models and Astral will expose them in the UI automatically. On this machine, Astral currently sees:

- `qwen3:4b`
- `qwen3.5:9b`
- `qwen3-vl:8b`

Astral also now surfaces these song-engine options:

- `ACE-Step`
- `MusicGen Small`
- `MusicGen Medium`
- `SongGeneration Base New` (experimental on this Windows path)
- `HeartMuLa OSS 3B` (experimental on this Windows path)

And the `Engine Lab` can catalog vendored optional repos for:

- `HeartMuLa`
- `SongGeneration / LeVo 2`
- `YuE`
- `AudioCraft / JASCO`
- `Stable Audio Tools`
- `SoulX-Singer`
- `DiffSinger`

Astral still defaults to `qwen3:4b` because it is fast and reliable for structured song planning, but users can switch to a heavier model from the UI when they want better writing depth.

## Platform note

The main local workflow is currently tuned for:

- `Windows`
- `Python 3.11+`
- `NVIDIA CUDA`

It may run elsewhere, but this repo is not yet packaged as a polished cross-platform installer.

## Quick start

1. Clone the repo.
2. Install Astral in editable mode:

```powershell
python -m pip install -e .
```

3. Launch the app:

```powershell
python -m astral_signals.server
```

4. Open:

```text
http://127.0.0.1:7860
```

## One-command Windows launch

For the current `S:`-first setup, use:

```powershell
.\launch_astral_signals.ps1
```

That launcher now respects environment variables that are already set, so a GitHub user can point Astral at a different drive or different local installs without editing the script.

## Optional engine repo sync

To vendor the heavier optional engine repos onto your local storage drive:

```powershell
.\bootstrap_optional_engines.ps1
```

That script shallow-clones the official repos into `S:\AstralSignals\vendors` so Astral can surface them in `Engine Lab` even before their full runtime adapters are finished.

## HeartMuLa bootstrap

To stage the experimental HeartMuLa backend locally:

```powershell
.\bootstrap_heartmula_backend.ps1
```

That script creates a dedicated vendor venv, installs the minimal HeartMuLa runtime, and downloads the required checkpoints into `S:\AstralSignals\models\heartmula\ckpt`.

## SongGeneration bootstrap

To stage the experimental SongGeneration / LeVo 2 backend locally:

```powershell
.\bootstrap_songgeneration_backend.ps1
```

That script creates a dedicated vendor venv, applies the Windows compatibility dependency overrides Astral needs, downloads the shared runtime assets into `S:\AstralSignals\models\songgeneration\runtime`, and pulls the default `songgeneration_v2_large` checkpoint into `S:\AstralSignals\models\songgeneration`.

## Configuration

Copy `.env.example` and adapt the paths if needed. Astral reads environment variables directly, so you can also set them in PowerShell before launch.

Important variables:

- `ASTRAL_SIGNALS_HOME`
- `ASTRAL_SIGNALS_OLLAMA_BIN`
- `ASTRAL_SIGNALS_OLLAMA_MODELS`
- `ASTRAL_SIGNALS_ACE_STEP_REPO`
- `ASTRAL_SIGNALS_ACE_STEP_API`
- `ASTRAL_SIGNALS_ACE_STEP_CHECKPOINTS`
- `ASTRAL_SIGNALS_VOICEBOX_REPO`
- `ASTRAL_SIGNALS_SONGGENERATION_REPO`
- `ASTRAL_SIGNALS_SONGGENERATION_RUNTIME`
- `ASTRAL_SIGNALS_SONGGENERATION_MODELS`
- `ASTRAL_SIGNALS_SONGGENERATION_MODEL`

## Default storage layout

By default, Astral uses:

- `Home`: `S:\AstralSignals`
- `Outputs`: `S:\AstralSignals\outputs`
- `Drafts`: `S:\AstralSignals\drafts`
- `Caches`: `S:\AstralSignals\cache`
- `Voice anchors`: `S:\AstralSignals\voice-anchors`

The repo itself can live anywhere. Only the heavy runtime assets need the larger drive.

## App workflow

### Quickstart

Use Quickstart when you want the shortest path to a finished song:

- pick a preset or type a brief
- choose a composer model
- choose a song engine
- set vocal mode, language, and duration
- render

Quickstart is happy on `ACE-Step` for full sung songs or `MusicGen` for fast instrumental/wordless ideation.

If you switch to `SongGeneration`, Astral will try to return the full mix plus native vocal and instrumental stems in one pass.

If you switch to `HeartMuLa`, treat it as an experimental alternate full-song lane on Windows rather than the default production path.

### Studio

Use Studio when you want deeper control:

- paste or compose lyrics manually
- let Alice act as a stronger co-producer with adjustable autonomy
- direct hook writing, chord movement, dynamic arc, and orchestration notes
- preview optional Voicebox narration cues with a selected clone profile
- map singers by language
- preview voices before rendering
- build cloned speech profiles
- split stems and remix them
- run lyric timing alignment
- tune render behavior for long-form songs

## Voice system

Astral has two different voice layers:

- `Song voice`: ACE-Step singing, guided by voice shaping, singer routing, lyrics, and optional clone anchoring
- `Speech clone`: Voicebox cloned speech profiles for previews, spoken voice work, and Alice Lab cue auditioning

That distinction is intentional. Astral stays honest about what is true singing synthesis versus cloned speech guidance.

## Long-song behavior

Astral has extra runtime logic for long renders so they do not fail silently:

- writes manifests immediately
- records task ids and effective settings
- uses safer ACE-Step runtime strategies for long mapped-lyrics jobs
- can use a low-strength clone reference anchor for singer consistency

If a song fails, check the session `manifest.json` in the output folder first.

## CLI

System status:

```powershell
astral-signals system
```

Compose a plan:

```powershell
astral-signals compose `
  --prompt "a cosmic alt-pop anthem about rebuilding after the storm" `
  --genre "cinematic alt-pop" `
  --vocal-language "en"
```

Generate a song:

```powershell
astral-signals generate `
  --prompt "an ethereal dream-pop ballad sung by a luminous cosmic guide" `
  --genre "dream-pop" `
  --mood "tender, celestial, hopeful" `
  --song-model "acestep-v15-turbo" `
  --ai-model "qwen3:4b" `
  --duration 60
```

Generate a fast instrumental sketch with MusicGen:

```powershell
astral-signals generate `
  --prompt "sparkling cotton-candy space pop with glossy synth pulses and comet-tail drums" `
  --song-model "musicgen::facebook/musicgen-small" `
  --vocal-mode wordless `
  --duration 20
```

Generate an experimental lyrical pass with HeartMuLa:

```powershell
astral-signals generate `
  --prompt "a luminous cosmic pop ballad sung by a guide through the stars" `
  --lyrics "[Verse]..." `
  --song-model "heartmula::HeartMuLa-oss-3B-happy-new-year" `
  --duration 30
```

Generate an experimental stem-native song with SongGeneration:

```powershell
astral-signals generate `
  --prompt "a glossy alt-pop anthem with native vocal and instrumental stems" `
  --lyrics "[Verse]..." `
  --song-model "songgeneration::songgeneration_v2_large" `
  --duration 60
```

## Repo layout

- `astral_signals/pipeline.py`: core runtime, prompts, manifests, singer routing, and generation
- `astral_signals/server.py`: FastAPI app and local API
- `astral_signals/acestep.py`: ACE-Step launcher and client
- `astral_signals/musicgen.py`: local MusicGen sketch backend
- `astral_signals/songgeneration.py`: SongGeneration / LeVo 2 subprocess adapter
- `astral_signals/heartmula.py`: HeartMuLa subprocess adapter
- `astral_signals/heartmula_worker.py`: isolated worker entrypoint for HeartMuLa generation
- `astral_signals/engine_catalog.py`: engine metadata and selection helpers
- `astral_signals/ollama.py`: Ollama composition client
- `astral_signals/static/index.html`: web UI
- `astral_signals/static/app.js`: frontend logic
- `astral_signals/static/styles.css`: frontend styling
- `bootstrap_optional_engines.ps1`: optional repo sync for the larger engine ecosystem
- `bootstrap_heartmula_backend.ps1`: HeartMuLa environment + checkpoint bootstrap

## Roadmap notes

Good next upgrades after this pass:

- per-singer acoustic anchors for true multi-singer swaps
- better packaged dependency bootstrap for first-time GitHub users
- live adapters for SongGeneration and YuE
- stronger local install checks in the UI
