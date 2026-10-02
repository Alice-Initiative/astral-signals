---
name: astral-signals-linux-bots
description: Control a Windows-hosted Astral Signals music studio from a Linux bot over HTTP, including synthetic voices, multilingual singers, rendering, conversion, and mixing.
metadata:
  short-description: Linux bot integration for Astral Signals
---

# Astral Signals for Linux Bots

The Linux bot is a remote controller. Astral Signals remains on the Windows host and uses that machine's GPU, Voicebox, Seed-VC, model storage, and output folders. Connect to the operator-provided LAN or Tailscale URL, for example `http://100.x.x.x:7860`. Never assume the Linux filesystem can see Windows paths.

## Discover the host

```bash
BASE_URL="http://<operator-provided-host>:7860"
curl -fsS "$BASE_URL/api/health"
curl -fsS "$BASE_URL/api/system"
curl -fsS "$BASE_URL/api/catalog"
curl -fsS "$BASE_URL/api/synthetic-voices"
```

Use only engines reported available by `/api/catalog`. A Linux bot does not need CUDA, YuE, Voicebox, or Seed-VC installed locally when Astral Signals exposes the corresponding host service.

## Create or reuse a voice

Reuse a ready synthetic voice from `/api/synthetic-voices`. Otherwise create one with:

```bash
curl -fsS -X POST "$BASE_URL/api/synthetic-voices/create" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Captain Luna Synthetic","design_prompt":"Bright, calm, playful cosmic guide","language":"en","seed":4312}'
```

The returned `path` is a Windows host path. Never rewrite it as `/mnt/s/...`; send it unchanged in a later Astral API request. Keep the returned manifest fields in the bot's publication record.

## Multilingual production

- Default to one locked singer across every requested language.
- Set `singer_mode` to `multiple` only when the user wants distinct singers.
- Use `manual_by_language` for an exact singer map or `composer_by_language` for deliberate creative casting.
- Put requested codes in `vocal_language`, for example `ja + en + ru + ko`.
- Require clean lyrics. Reject commentary, language labels, translation instructions, or model reasoning inside the lyric sheet.

## Rendering and singing conversion

1. Call `POST /api/compose` for a complete lyric and arrangement plan.
2. Inspect `resolved_lyrics` and the plan before rendering.
3. Call `POST /api/generate` with a catalog-supported full-song engine.
4. For a locked synthetic singer, call `POST /api/singing-voice/convert` using the guide-vocal path and the selected synthetic voice `path`.
5. Use `/api/stems/remix` or `/api/mix/render` to combine the converted vocals and instrumental.

Never report success until a completed manifest and an actual audio path or URL exist. Preserve the full lyric sheet, engine, voice identity, seed, design prompt, language map, and output paths.
