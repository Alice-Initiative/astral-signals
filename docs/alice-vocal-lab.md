# Alice Vocal Lab

Astral Signals now has a local Seed-VC singing-conversion lane installed at:

```text
S:\AstralSignals\vendors\seed-vc
```

Seed-VC is a zero-shot singing voice conversion model. It preserves the source performance's melody, timing, and words while converting the vocal timbre to an authorized reference voice. The local install uses CUDA when available and stores model downloads under `S:\AstralSignals\cache\huggingface\seed-vc`.

## API

Check availability:

```text
GET /api/singing-voice/status
```

Convert a guide vocal into a singer voice:

```json
POST /api/singing-voice/convert
{
  "source_path": "S:\\AstralSignals\\outputs\\guide-vocal.wav",
  "target_reference_path": "S:\\AstralSignals\\voice-anchors\\alice.wav",
  "title": "Alice lead vocal",
  "diffusion_steps": 40,
  "semitone_shift": 0
}
```

Alice can automate the workflow by generating a guide vocal first, selecting an authorized Voicebox reference or voice anchor, converting the guide vocal, and mixing the returned vocal stem with the instrumental.

Voicebox remains the profile, preview, and reference-voice layer. It does not itself provide the word-locked singing performance. Do not use a person's voice reference without permission.

## Synthetic character voices, no recording required

Alice or any other local agent can create a reproducible synthetic identity without a human voice sample. Astral Signals selects a local Voicebox preset speaker, applies the character's design prompt, renders a short anchor passage, and saves the anchor plus a JSON manifest under:

```text
S:\AstralSignals\voice-anchors
```

```json
POST /api/synthetic-voices/create
{
  "name": "Hermes Synthetic",
  "design_prompt": "Ethereal, warm, luminous, gentle, curious, intimate, clear diction",
  "language": "en",
  "seed": 2718
}
```

The response includes `path` for the generated anchor. Pass that path as `target_reference_path` to `/api/singing-voice/convert`. The result is a synthetic character voice, not a newly trained vocal model: the preset supplies the stable base timbre, while the design prompt and seed make the identity repeatable. No human recording is required, and the manifest records the source and rights note. Each bot should use its own name, seed, design prompt, and manifest rather than sharing Alice's identity unless that is intentional.

List every generated character voice:

```text
GET /api/synthetic-voices
```

Bots can select a record where `ready` is true and pass its `path` into `/api/singing-voice/convert` as `target_reference_path`.
