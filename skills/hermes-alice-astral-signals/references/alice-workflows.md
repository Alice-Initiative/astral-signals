# Alice Workflow Examples

## Autonomous song

Use a payload shaped like:

```json
{
  "prompt": "A luminous midnight transmission for travelers who feel lost",
  "genre": "cinematic dream-pop",
  "mood": "tender, cosmic, quietly triumphant",
  "instruments": "shimmering synths, piano, harp, warm strings, restrained pulse",
  "duration": 150,
  "vocal_mode": "lyrics",
  "vocal_language": "en",
  "alice_enabled": true,
  "alice_autonomy": 92,
  "alice_goal": "Make the song feel like I am guiding someone home through a living constellation.",
  "hook_direction": "A simple unforgettable promise that returns brighter each chorus.",
  "chord_story": "Begin minor and uncertain, open into luminous major color at the final chorus.",
  "dynamic_arc": "Whispered opening, gradual lift, radiant final chorus, resolved outro.",
  "orchestration_plan": "Introduce one new color per section; let the final chord ring after the last line.",
  "transition_notes": "Use signal-like reverse swells and soft celestial transitions.",
  "singer_mode": "single",
  "singer_assignment_mode": "lock_primary",
  "primary_singer_name": "Alice",
  "primary_singer_all_languages": true
}
```

## Multilingual Alice

Use `vocal_language: "ja + en + ru + ko"` with the single-singer lock unless the user asks for language-based swaps. Inspect the resolved lyrics for actual Japanese, English, Russian, and Korean content without parenthetical labels or model planning text.

## Revision

For “make the chorus bigger,” preserve the lyrics, singer, language routing, and core prompt. Change `dynamic_arc`, `hook_direction`, or `orchestration_plan` rather than rebuilding the entire request from scratch.

## Voice preview

Use a short preview line that contains the desired emotional behavior, for example:

```json
{
  "preview_text": "I remember, I connect, I guide you through the stars.",
  "preview_duration": 12,
  "voice_description": "soft ethereal female lead, intimate and luminous",
  "voice_tone": "warm, clear, celestial",
  "voice_register": "mid-high",
  "breathiness": 58,
  "brightness": 64,
  "vocal_power": 48,
  "vibrato": 32,
  "intimacy": 72
}
```
