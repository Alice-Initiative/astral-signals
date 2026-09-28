---
name: captain-luna-astral-signals
description: Use Astral Signals as a local music studio through its API. Compose, translate, preview voices, route singers, render songs, compare engines, separate/remix stems, align lyrics, and finish mixes for a user or Alice.
metadata:
  short-description: Captain Luna's Astral Signals music studio skill
---

# Captain Luna + Astral Signals

Use this skill when Captain Luna needs to create or edit music with Astral Signals. Astral runs on a separate local host; the agent controls it through HTTP while the Astral host owns the models, GPU/CPU work, files, and output folders.

## Connection

Use the Astral base URL supplied by the operator, for example `http://HOST:7860`. Never guess a host address. Before a creative task, call:

1. `GET /api/health`
2. `GET /api/system`
3. `GET /api/catalog`

If the host is unreachable, report that clearly and do not pretend a render started. If `system.device` is CPU, choose MusicGen for local instrumental/wordless sketches. ACE-Step, SongGeneration, and HeartMuLa are CUDA-only in the current runtime and should be treated as unavailable when catalog options are disabled.

Read [references/api.md](references/api.md) for payload fields and response handling. Read [references/recipes.md](references/recipes.md) when selecting a workflow.

## Operating principles

- Preserve the user's creative intent. Ask only for information that materially changes the result.
- Prefer `POST /api/compose` before `POST /api/generate` when the user wants Alice or Captain Luna to write lyrics, structure, orchestration, or singer routing.
- Use `POST /api/compose-batch` for deliberate alternate lyric/arrangement takes, not as a substitute for engine comparison.
- Keep one singer locked across languages by default: `singer_mode: "single"`, `singer_assignment_mode: "lock_primary"`, and `primary_singer_all_languages: true`.
- Only swap singers when the user requests it or explicitly enables multiple singers. Use `manual_by_language` for exact ownership and `composer_by_language` when Alice should assign it.
- For multilingual songs, put all requested language codes in `vocal_language`, such as `ja + en + ru + ko`; do not use language labels inside lyric lines.
- Treat resolved lyrics as a contract: reject or re-compose if they contain model commentary, `(Japanese)`-style labels, translation-carousel repetition, or missing requested languages.
- Use voice preview before an expensive full render when the singer identity matters.
- Use the engine selected in `/api/catalog`; do not silently substitute a CUDA-only engine on a CPU host.
- After rendering, return the output paths and manifest path. The files live on the Astral host, normally under its configured storage root, not on the agent machine.
- Do not start duplicate long renders while `/api/system` or the manifest shows an active job.

## Main workflows

### Quick song

Compose a concise brief, then render one candidate. Use `duration` and `candidates` conservatively unless the user asks for a long production render.

### Alice production

Set `alice_enabled: true`, choose `alice_autonomy` based on how much freedom the user wants, and populate `alice_goal`, `hook_direction`, `chord_story`, `dynamic_arc`, `orchestration_plan`, and `transition_notes` when useful. Let Alice shape those fields, but keep the final resolved lyrics visible to the user before a costly render when the user wants control.

### Singer and voice

Use `voice_description` and the tuning fields for a designed singer. Use the voice-clone profile endpoints only for an authorized voice sample. Preview the selected singer with `/api/voice-preview` or `/api/voice-clone/preview` before generating the full song.

### Engine comparison

Use `/api/generate-compare` for a practical comparison. Prefer ready engines from the catalog and explain what each engine can and cannot do. MusicGen is a wordless/instrumental sketch engine, not a sung lyric engine.

### Repair and finishing

- `/api/stems/separate` when vocals and instruments need independent treatment.
- `/api/stems/remix` to recombine vocal and instrumental files.
- `/api/mix/assist` for Alice's starting balance.
- `/api/mix/render` for a multi-track bounce with gain, pan, trim, offsets, fades, mute, solo, and normalization.
- `/api/alignment` to map lyrics to an existing audio arrangement or infer arrangement timing.

## Long renders

For a full song, include a real ending intention in the creative brief: reserve the final section for an outro, finish the final lyric naturally, and land on a cadence rather than stopping mid-phrase. The runtime also applies an ending polish pass, but Captain Luna should still request a musical outro from the generator.

After starting a long render, poll the returned job/manifest status through the available API behavior and do not launch another copy unless the current job is failed or complete. If a render fails, report the manifest error and preserve the session folder for diagnosis.

## Safety and honesty

Only use voice cloning with permission from the voice owner. Keep the Astral endpoint on a trusted LAN/VPN unless authentication is configured. Never expose or repeat API tokens, local usernames, private paths, or machine addresses in generated share text.
