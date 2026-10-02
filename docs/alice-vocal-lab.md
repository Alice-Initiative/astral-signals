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
