from __future__ import annotations

import re
from typing import Iterable


def _clean_parts(parts: Iterable[str]) -> list[str]:
    cleaned: list[str] = []
    for part in parts:
        item = part.strip()
        if item:
            cleaned.append(item)
    return cleaned


def _split_language_request(vocal_language: str) -> list[str]:
    raw = (vocal_language or "").strip()
    if not raw:
        return []
    return [part.strip() for part in re.split(r"\s*(?:,|/|\+|&|\band\b)\s*", raw, flags=re.IGNORECASE) if part.strip()]


def build_prompt(
    *,
    prompt: str,
    genre: str = "",
    mood: str = "",
    instruments: str = "",
    tempo_bpm: int | None = None,
    key_scale: str = "",
    time_signature: str = "",
    vocal_language: str = "",
    era: str = "",
    texture: str = "",
    voice_description: str = "",
    singer_direction: str = "",
    alice_goal: str = "",
    hook_direction: str = "",
    chord_story: str = "",
    dynamic_arc: str = "",
    section_energy_map: str = "",
    orchestration_plan: str = "",
    transition_notes: str = "",
    voicebox_plan: str = "",
    production_notes: str = "",
    vocal_mode: str = "lyrics",
) -> str:
    requested_languages = _split_language_request(vocal_language)
    is_multilingual = len(requested_languages) > 1
    descriptors = _clean_parts(
        [
            prompt,
            f"genre: {genre}" if genre else "",
            f"mood: {mood}" if mood else "",
            f"instruments: {instruments}" if instruments else "",
            f"tempo: {tempo_bpm} BPM" if tempo_bpm else "",
            f"key: {key_scale}" if key_scale else "",
            f"time signature: {time_signature}" if time_signature else "",
            f"{'vocal language blend' if is_multilingual else 'vocal language'}: {vocal_language}" if vocal_language else "",
            f"era influence: {era}" if era else "",
            f"texture: {texture}" if texture else "",
            f"lead voice: {voice_description}" if voice_description else "",
            f"singer routing: {singer_direction}" if singer_direction else "",
            f"alice goal: {alice_goal}" if alice_goal else "",
            f"hook direction: {hook_direction}" if hook_direction else "",
            f"chord story: {chord_story}" if chord_story else "",
            f"dynamic arc: {dynamic_arc}" if dynamic_arc else "",
            f"section energy: {section_energy_map}" if section_energy_map else "",
            f"orchestration: {orchestration_plan}" if orchestration_plan else "",
            f"transitions: {transition_notes}" if transition_notes else "",
            f"voicebox cue: {voicebox_plan}" if voicebox_plan else "",
            f"production notes: {production_notes}" if production_notes else "",
        ]
    )

    if vocal_mode == "instrumental":
        descriptors.append("full instrumental performance, no sung vocals, no spoken word")
    elif vocal_mode == "wordless":
        descriptors.append("wordless lead vocals with vowel sounds, no intelligible lyrics")
    else:
        descriptors.append("full song with expressive lead vocals and clear topline delivery")
        if vocal_language:
            if is_multilingual:
                descriptors.append(f"the sung lyrics should intentionally blend {vocal_language} with natural code-switching")
            else:
                descriptors.append(f"the sung lyrics should be performed in {vocal_language}")
        singer_direction_lower = (singer_direction or "").lower()
        singer_swap_requested = any(
            token in singer_direction_lower
            for token in ("language owners", "handoff map", "use multiple singers", "different singers")
        )
        if singer_swap_requested and is_multilingual:
            descriptors.append("the singer should swap cleanly at language boundaries according to the routing above")

    normalized: list[str] = []
    for descriptor in descriptors:
        piece = descriptor.strip()
        if piece.endswith((".", "!", "?")):
            normalized.append(piece)
        else:
            normalized.append(f"{piece}.")

    return " ".join(normalized)
