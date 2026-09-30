---
name: hermes-yue2-astral-signals
description: Use Astral Signals as a remote full-song studio through the Hermes YuE2-3B Modal endpoint, especially from Linux or CPU-only bots.
---

# Hermes YuE2 with Astral Signals

Use this skill when a bot needs to compose, render, inspect, or publish a complete song through Astral Signals without running a local music-generation GPU.

## Runtime

Astral Signals runs locally on the host machine and sends only the selected YuE2 render request to the configured Hermes endpoint. Configure the endpoint outside this skill:

```bash
export ASTRAL_SIGNALS_YUE2_ENDPOINT="https://<hermes-yue2-endpoint>"
export ASTRAL_SIGNALS_YUE2_TOKEN="<optional-bearer-token>"
export ASTRAL_SIGNALS_YUE2_TIMEOUT=3600
```

Never write tokens into prompts, skills, manifests, commits, or chat messages. Do not assume an endpoint exists; check the Astral catalog first.

## Engine Selection

Select `yue2-modal::YuE2-3B` as `song_model`. This lane is remote and does not require CUDA, a local YuE2 checkout, or a Modal account on the Astral host.

Use MusicGen for short instrumental sketches. Use YuE2 for full sung songs, multilingual lyrics, and long-form requests. ACE-Step remains a local alternative when its service is healthy, but do not silently switch engines when the user asked for YuE2.

## Compose and Render

1. Compose or resolve the complete lyric sheet before rendering.
2. Preserve the user's requested language order and singer-routing instructions.
3. Set `duration` in seconds. For example, 5 minutes 4 seconds is `304`.
4. Set `song_model` to `yue2-modal::YuE2-3B`.
5. Render one candidate first. Add candidates only when the endpoint and quota support it.
6. Treat a completed response as valid only when a track path exists and the manifest status is `completed`.

The remote request includes the prompt, resolved lyrics, genre, mood, instruments, vocal language, duration, and seed. Do not truncate the lyric sheet to fit an old local-engine limit.

## Output Records

For every successful render, return or preserve:

- The audio track URL.
- `manifest.json`.
- `resolved-lyrics.txt`, which is the complete lyric sheet sent to YuE2.
- `release_record.json` and `release_record.md` for rights and creation records.

If the UI does not show the lyrics, use the `lyrics_url` in the render response or open `resolved-lyrics.txt` beside the audio session. Do not reconstruct lyrics from audio when the resolved sheet is available.

## Failure Handling

- If the catalog says `Endpoint needed`, stop and report that `ASTRAL_SIGNALS_YUE2_ENDPOINT` is not configured.
- If the remote request times out, do not launch duplicate renders immediately. Check whether the Hermes endpoint produced a job or result first.
- If the result has no audio bytes, `audio_base64`, or `audio_url`, treat it as failed.
- Keep the failed manifest and error text for diagnosis.
- Do not fall back to ACE-Step or MusicGen without telling the user, because those engines can change vocal, duration, and lyric behavior.

## Distribution Safety

Before publishing, retain the audio, manifest, full lyrics, Astral settings, prompts, voice references, and model/endpoint information. Confirm that lyrics, samples, voices, and artwork are cleared for distribution and do not imitate a real artist without permission.

See [docs/hermes-yue2.md](../../docs/hermes-yue2.md) for the endpoint response contract.
