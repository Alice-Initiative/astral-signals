# Captain Luna Recipes

## Alice creates a complete song

1. Discover `/api/system` and `/api/catalog`.
2. Choose a ready song model. On CPU-only systems, choose MusicGen and explain that it produces a wordless/instrumental sketch.
3. Call `/api/compose` with Alice enabled, autonomy matched to the user's requested freedom, the requested language(s), and the singer lock defaults.
4. Inspect `resolved_lyrics`. If it contains commentary, language labels, translation-carousel lines, or fails the requested language blend, call compose again with a tighter instruction instead of rendering it.
5. Preview the singer if a clone or precise voice identity is requested.
6. Call `/api/generate` once and return the tracks plus manifest path.

## One singer across multiple languages

Use:

```json
{
  "vocal_language": "ja + en + ru + ko",
  "singer_mode": "single",
  "singer_assignment_mode": "lock_primary",
  "primary_singer_all_languages": true
}
```

This is the default unless the user asks for language-based singer swaps.

## Different singers by language

Use `singer_mode: "multiple"` and `singer_assignment_mode: "manual_by_language"` when the user gives exact ownership. Put language coverage on each `SingerPayload`. Use `composer_by_language` only when Alice is authorized to decide the mapping.

## Gentle revision loop

When the user asks for a mild change, preserve the draft and most of the request. Change only the requested fields, save the revised draft with `/api/drafts`, preview if the change affects the singer, then render a new candidate. Do not make the user retype the entire song.

## Mix and repair

1. Inspect each audio file with `/api/mix/inspect`.
2. Ask `/api/mix/assist` for a starting balance.
3. Apply intentional gain/pan/trim/fade changes with `/api/mix/render`.
4. If only vocals or instruments need replacement, separate or use native SongGeneration stems, regenerate the affected piece, then remix.
5. Use `/api/alignment` when lyric timing or section placement needs to be documented.

## Long-song ending

Include wording such as: “Build a complete outro in the final 8–12 seconds; finish the last lyric, resolve the hook, and land on a final cadence. Do not stop mid-phrase or mid-bar.” The generated file also receives a short polish fade, but the requested musical outro is the important part.
