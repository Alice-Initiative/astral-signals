# Hermes YuE2 Remote Lane

This branch adds a Linux-friendly remote song engine for a Hermes bot using a YuE2-3B deployment such as `hermes-yue2` on Modal. Astral does not download YuE2 weights or require a local GPU.

## Configure

Set these variables on the Linux bot or Astral host:

```bash
export ASTRAL_SIGNALS_YUE2_ENDPOINT="https://your-hermes-endpoint.example.com"
export ASTRAL_SIGNALS_YUE2_TOKEN="optional-bearer-token"
export ASTRAL_SIGNALS_YUE2_TIMEOUT=3600
```

Select `yue2-modal::YuE2-3B` as the song model, or send that value as `song_model` in a generation request.

## Endpoint contract

Astral sends a JSON `POST` containing `model`, `prompt`, `lyrics`, `genre`, `mood`, `instruments`, `language`, `duration_seconds`, and `seed`.

The endpoint may return audio bytes (`audio/wav` or another `audio/*` content type), or JSON containing either:

```json
{"audio_base64": "..."}
```

or:

```json
{"audio_url": "https://..."}
```

The Hermes bot owns the Modal deployment and authentication. Astral only calls the configured HTTPS endpoint and writes the returned audio into its normal output session, manifest, and publication record.
