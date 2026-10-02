---
name: astral-signals-windows-bots
description: Use a Windows-hosted Astral Signals installation as a local full-song studio from any bot that can make HTTP requests.
metadata:
  short-description: Windows Astral Signals bot integration
---

# Astral Signals for Windows Bots

Astral Signals runs on the Windows host and owns the GPU, Voicebox, Seed-VC, model caches, renders, and output files. The bot is a controller, not the renderer. Use the operator-provided base URL, such as `http://100.x.x.x:7860` over Tailscale or `http://192.168.x.x:7860` on LAN. Never guess the address.

## Startup checks

Call `GET /api/health`, `GET /api/system`, `GET /api/catalog`, and `GET /api/synthetic-voices` before a creative task. If the host reports an active long render, inspect its manifest before starting another one.

## Synthetic voices

Reuse a ready record from `/api/synthetic-voices`. To create a new character voice:

```json
POST /api/synthetic-voices/create
{
  "name": "Hermes Synthetic",
  "design_prompt": "Clear, warm, curious, emotionally present",
  "language": "en",
  "seed": 2718
}
```

The response contains a Windows host path under `S:\AstralSignals\voice-anchors`. Do not try to open that path on the bot machine; pass it back to Astral Signals as a host-side path. Save the returned manifest details with the song record.

## Full song workflow

1. Compose with `POST /api/compose` when lyrics, arrangement, language routing, or Alice autonomy are needed.
2. Validate `resolved_lyrics`; reject model notes, language labels, translation commentary, or missing sections.
3. Keep one singer locked across languages unless multiple singers are explicitly requested.
4. Render with `POST /api/generate` and the selected catalog engine.
5. For stronger vocal identity, generate a guide vocal, then call `POST /api/singing-voice/convert` with the guide path and synthetic anchor path.
6. Mix the converted vocal stem with the instrumental using the stem and mix endpoints.

For multilingual songs, put language codes in `vocal_language` such as `ja + en + ru + ko`. Lyrics must contain clean singable text, not labels like `(Japanese)` or `Line 1: Russian`.

## Windows safety

- Treat all returned paths as Windows-host paths.
- Never delete model caches or `S:\AstralSignals\voice-anchors` without explicit approval.
- Do not put tokens, credentials, or private machine paths into prompts or Git commits.
- Return audio URLs, host paths, the manifest path, engine, voice identity, and language map.
