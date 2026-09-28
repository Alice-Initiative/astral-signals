# Astral Signals API Reference

Base URL: the operator-provided Astral host, commonly `http://HOST:7860`.

## Discovery

| Method | Path | Use |
| --- | --- | --- |
| GET | `/api/health` | Confirm the service is reachable |
| GET | `/api/system` | Device, engine runtime, storage, and active backend status |
| GET | `/api/catalog` | Composer models, song engines, defaults, capabilities |

## Composition and rendering

`POST /api/compose` and `POST /api/generate` accept the same core `GeneratePayload`. Important fields:

```json
{
  "prompt": "A cinematic dream-pop song about finding a signal home",
  "lyrics": "",
  "genre": "dream-pop",
  "mood": "tender, cosmic, hopeful",
  "instruments": "shimmering synths, piano, strings, restrained drums",
  "duration": 120,
  "vocal_mode": "lyrics",
  "vocal_language": "ja + en",
  "use_ai": true,
  "alice_enabled": true,
  "alice_autonomy": 72,
  "singer_mode": "single",
  "singer_assignment_mode": "lock_primary",
  "primary_singer_all_languages": true,
  "song_model": "",
  "audio_format": "wav"
}
```

The payload also supports `tempo_bpm`, `key_scale`, `time_signature`, `era`, `texture`, voice tuning fields, `voice_clone_profile_id`, `compose_variants`, singer arrays, and Alice controls. Use the catalog to choose a valid `song_model`; an empty value lets Astral use its default.

`POST /api/compose-batch` accepts the same payload and uses `compose_variants` from 1 to 4.

`POST /api/generate-compare` compares available render engines. It can be expensive; prefer it when the user explicitly wants alternatives.

Responses contain resolved title/prompt/lyrics, a plan, track records, and usually `manifest_path`. Track records expose `path`, `url`, and metadata. The `url` is served by Astral; the local `path` exists on the Astral host.

## Voice

`POST /api/voice-preview` accepts a GeneratePayload with `preview_text`, `preview_duration`, singer/voice fields, and optional clone profile data.

`GET /api/voice-clone/profiles` lists profiles.

`POST /api/voice-clone/profiles` creates a profile with `name`, `description`, `language`, `sample_audio_path`, `reference_text`, `default_engine`, and `personality`.

`POST /api/voice-clone/profiles/{profile_id}/samples` adds `sample_audio_path` and `reference_text`.

`POST /api/voice-clone/preview` accepts `profile_id`, `text`, `language`, `engine`, and `title`.

## Stems, mixing, and alignment

`POST /api/stems/separate`:

```json
{"audio_path":"S:/AstralSignals/outputs/session/song.wav","title":"song stems"}
```

`POST /api/stems/remix` accepts `vocals_path`, `instrumental_path`, optional gain values, and `title`.

`POST /api/mix/assist` and `POST /api/mix/render` accept a `tracks` array. Each track can use `path`, `label`, `role`, `gain_db`, `pan`, `mute`, `solo`, `start_seconds`, `trim_in_seconds`, `trim_out_seconds`, `fade_in_seconds`, and `fade_out_seconds`.

`POST /api/mix/inspect` accepts `audio_path`, `label`, and `role`.

`POST /api/alignment` accepts `audio_path`, `lyrics`, optional `tempo_bpm` and `time_signature`, and `mode` of `lyrics_to_audio` or `audio_to_lyrics`.

## Errors

HTTP 400 means Astral rejected the request or a backend could not complete it. Read the `detail` string and correct the payload; do not retry an unchanged long render repeatedly. HTTP 404 on `/info` or `/config` is not an Astral failure; those are not Astral endpoints.
