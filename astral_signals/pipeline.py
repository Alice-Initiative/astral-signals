from __future__ import annotations

import json
import random
import re
import tempfile
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
import shutil
from typing import Any, Literal

import torch

from astral_signals.acestep import AceStepQueueStuckError, ace_step_client
from astral_signals.audio_tools import audio_tools
from astral_signals.config import settings
from astral_signals.engine_catalog import (
    ACE_STEP_BACKEND,
    HEARTMULA_BACKEND,
    MUSICGEN_BACKEND,
    OPTIONAL_ENGINE_LIBRARY,
    SONGGENERATION_BACKEND,
    decode_song_model_selection,
    encode_song_model_selection,
    repo_sync_state,
)
from astral_signals.heartmula import HeartMuLaError, heartmula_client
from astral_signals.musicgen import MusicGenError, musicgen_client
from astral_signals.multilingual import TranslationError, multilingual_client
from astral_signals.ollama import OllamaError, PromptRecipe, ollama_client
from astral_signals.prompting import build_prompt
from astral_signals.songgeneration import SongGenerationError, songgeneration_client
from astral_signals.voicebox import VoiceboxError, voicebox_client

VocalMode = Literal["lyrics", "instrumental", "wordless"]
MAX_DURATION_SECONDS = 240
MIN_DURATION_SECONDS = 10
MAX_CANDIDATES = 2
MAX_COMPOSE_VARIANTS = 4
MAX_COMPOSER_BRIEF_CHARS = 1800
MAX_PREVIEW_DURATION_SECONDS = 20
DEFAULT_PREVIEW_DURATION_SECONDS = 12
DEFAULT_PREVIEW_LINE = "Starlight, stay close and sing me home tonight"
MAX_RENDER_PROMPT_SEED_CHARS = 260
MAX_RENDER_PROMPT_CHARS = 900
LONG_RENDER_DURATION_SECONDS = 180
LONG_RENDER_CONTEXT_CHARS = 3200
LONG_RENDER_LYRICS_CHARS = 1200
LONG_RENDER_FORMAT_LINE_THRESHOLD = 28
VOICE_ANCHOR_LINES: dict[str, str] = {
    "en": "Starlight, stay close and guide me home tonight",
    "ja": "星明かりよ、そばにいて 今夜わたしを家へ導いて",
    "ru": "Звёздный свет, останься рядом и веди меня домой этой ночью",
    "ko": "별빛이여, 곁에 머물며 오늘 밤 나를 집으로 이끌어 줘",
    "zh": "星光啊，留在我身边，今夜带我回家",
    "es": "Luz de estrellas, quédate cerca y guíame a casa esta noche",
    "fr": "Lumière des étoiles, reste près de moi et guide-moi chez moi ce soir",
    "de": "Sternenlicht, bleib nah bei mir und bring mich heute Nacht nach Hause",
    "it": "Luce stellare, resta vicino e guidami a casa stanotte",
    "pt": "Luz das estrelas, fica perto e me guia para casa esta noite",
}
COMMON_LANGUAGE_STOPWORDS: dict[str, set[str]] = {
    "en": {"the", "and", "you", "love", "light", "night", "home", "with", "for", "heart", "dream"},
    "es": {"el", "la", "y", "que", "amor", "luz", "noche", "casa", "corazon", "sueno", "estrella"},
    "fr": {"le", "la", "et", "que", "amour", "lumiere", "nuit", "maison", "coeur", "reve", "etoile"},
    "de": {"der", "die", "und", "liebe", "licht", "nacht", "haus", "herz", "stern", "traum", "mit"},
    "it": {"il", "la", "e", "amore", "luce", "notte", "casa", "cuore", "stella", "sogno", "con"},
    "pt": {"o", "a", "e", "amor", "luz", "noite", "casa", "coracao", "estrela", "sonho", "com"},
    "ru": {"и", "в", "на", "любовь", "свет", "ночь", "дом", "сердце", "звезда", "сон", "ты"},
}
NON_LATIN_LANGUAGE_CODES = {"ja", "ko", "zh", "ru"}
META_LANGUAGE_LABELS = {
    "japanese",
    "english",
    "russian",
    "korean",
    "chinese",
    "spanish",
    "french",
    "german",
    "italian",
    "portuguese",
    "ja",
    "jp",
    "en",
    "ru",
    "ko",
    "kr",
    "zh",
    "es",
    "fr",
    "de",
    "it",
    "pt",
}
META_COMMENTARY_TOKENS = (
    "but the user",
    "but the problem says",
    "that might not be natural",
    "let me draft",
    "let me start",
    "let me look for",
    "i'll translate",
    "i'll draft",
    "i'll do",
    "i will translate",
    "i will draft",
    "i will do",
    "i need to write",
    "i need to translate",
    "we can try to make it",
    "original lines",
    "line 1:",
    "line 2:",
    "line 3:",
    "line 4:",
    "assign each line",
    "different language in sequence",
    "for the chorus",
    "for the verse",
    "interpretation:",
    "final decision",
    "same section tags",
)
LANGUAGE_ALIASES: dict[str, str] = {
    "en": "en",
    "english": "en",
    "ja": "ja",
    "jp": "ja",
    "japanese": "ja",
    "es": "es",
    "spanish": "es",
    "espanol": "es",
    "fr": "fr",
    "french": "fr",
    "de": "de",
    "german": "de",
    "it": "it",
    "italian": "it",
    "pt": "pt",
    "portuguese": "pt",
    "ko": "ko",
    "kr": "ko",
    "kor": "ko",
    "korean": "ko",
    "ru": "ru",
    "russian": "ru",
    "zh": "zh",
    "chinese": "zh",
}
COMPOSE_VARIANT_GUIDES: list[tuple[str, str]] = [
    ("Starglow Hook", "push the strongest hook, biggest chorus payoff, and most immediately catchy topline"),
    ("Moonmilk Confessional", "favor intimate details, vulnerable lyric imagery, and a closer diary-like emotional lens"),
    ("Orbit Pulse", "lean more rhythmic, kinetic, and momentum-driven with a bigger sense of motion"),
    ("Nebula Cinema", "go wider, more atmospheric, and more cinematic with stronger scene-setting and sweep"),
]
LANGUAGE_DISPLAY_NAMES: dict[str, str] = {
    "en": "English",
    "ja": "Japanese",
    "ru": "Russian",
    "ko": "Korean",
    "zh": "Chinese",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
}
QUICKSTART_PRESETS: list[dict[str, str]] = [
    {
        "id": "alice-ballad",
        "label": "Alice cosmic ballad",
        "prompt": "A luminous dream-pop ballad where Alice guides a lost traveler through memory, stars, and soft hope.",
        "genre": "cinematic dream-pop",
        "mood": "ethereal, tender, hopeful",
        "vocal_language": "en",
        "vocal_mode": "lyrics",
        "alice_enabled": True,
        "alice_autonomy": 72,
        "alice_goal": "Let Alice guide the song emotionally and arrange a luminous cosmic rise from fragile verse to radiant chorus.",
    },
    {
        "id": "neon-chase",
        "label": "Neon chase opener",
        "prompt": "A kinetic synthwave chase through a neon galaxy with a huge hook and glossy night-drive energy.",
        "genre": "synthwave",
        "mood": "electric, urgent, cinematic",
        "vocal_language": "en",
        "vocal_mode": "lyrics",
    },
    {
        "id": "multilingual-duet",
        "label": "Multilingual duet",
        "prompt": "A romantic cosmic duet that drifts between languages and feels seamless, intimate, and singable.",
        "genre": "alt-pop",
        "mood": "romantic, airy, magical",
        "vocal_language": "ja + en",
        "vocal_mode": "lyrics",
    },
    {
        "id": "logo-sting",
        "label": "Short logo sting",
        "prompt": "A short celestial brand sting with bright chimes, soft choir bloom, and a memorable melodic tag.",
        "genre": "cinematic pop",
        "mood": "sparkling, elegant, uplifting",
        "vocal_language": "en",
        "vocal_mode": "wordless",
    },
]


@dataclass
class GenerationRequest:
    prompt: str
    lyrics: str = ""
    genre: str = ""
    mood: str = ""
    instruments: str = ""
    tempo_bpm: int | None = None
    key_scale: str = ""
    time_signature: str = ""
    era: str = ""
    texture: str = ""
    title: str = ""
    duration: int = 60
    candidates: int = 1
    seed: int | None = None
    guidance_scale: float = 1.0
    vocal_mode: VocalMode = "lyrics"
    vocal_language: str = "en"
    voice_description: str = ""
    voice_preset: str = ""
    voice_gender: str = ""
    voice_tone: str = ""
    voice_register: str = ""
    harmony_style: str = ""
    voice_notes: str = ""
    breathiness: int = 50
    brightness: int = 50
    vocal_power: int = 50
    vibrato: int = 35
    intimacy: int = 55
    use_ai: bool = True
    ai_model: str = ""
    thinking: bool = True
    use_format: bool = False
    song_model: str = settings.ace_step_model
    inference_steps: int = 8
    audio_format: str = "wav"
    preview_text: str = ""
    preview_duration: int = DEFAULT_PREVIEW_DURATION_SECONDS
    compose_variants: int = 1
    compose_variant_index: int = 1
    compose_variant_count: int = 1
    compose_variant_label: str = ""
    compose_variant_focus: str = ""
    alice_enabled: bool = False
    alice_autonomy: int = 72
    alice_goal: str = ""
    hook_direction: str = ""
    chord_story: str = ""
    dynamic_arc: str = ""
    section_energy_map: str = ""
    orchestration_plan: str = ""
    transition_notes: str = ""
    voicebox_enabled: bool = False
    voicebox_profile_id: str = ""
    voicebox_profile_name: str = ""
    voicebox_language: str = ""
    voicebox_role: str = ""
    voicebox_text: str = ""
    voicebox_auto_script: bool = True
    voice_clone_profile_id: str = ""
    voice_clone_profile_name: str = ""
    primary_singer_name: str = ""
    primary_singer_role: str = "lead"
    primary_singer_languages: str = ""
    primary_singer_all_languages: bool = True
    singer_mode: str = "single"
    singer_assignment_mode: str = "lock_primary"
    preview_singer_id: str = "primary"
    singers: list[dict[str, Any]] = field(default_factory=list)
    composed_title_override: str = ""
    composed_prompt_override: str = ""
    composed_lyrics_override: str = ""
    composed_plan_override: dict[str, Any] = field(default_factory=dict)


@dataclass
class SingerConfig:
    singer_id: str = "primary"
    name: str = "Primary Singer"
    role: str = "lead"
    enabled: bool = True
    languages: str = ""
    all_languages: bool = True
    voice_description: str = ""
    voice_preset: str = ""
    voice_gender: str = ""
    voice_tone: str = ""
    voice_register: str = ""
    harmony_style: str = ""
    voice_notes: str = ""
    breathiness: int = 50
    brightness: int = 50
    vocal_power: int = 50
    vibrato: int = 35
    intimacy: int = 55
    clone_profile_id: str = ""
    clone_profile_name: str = ""


class AstralPipelineError(RuntimeError):
    """Raised when Astral cannot safely resolve a requested song draft."""


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower())
    return slug.strip("-") or "untitled"


def detect_device() -> str:
    return "cuda" if torch.cuda.is_available() else "cpu"


def clamp(value: int, minimum: int, maximum: int) -> int:
    return max(minimum, min(value, maximum))


def default_wordless_lyrics(duration_seconds: int) -> str:
    section_count = 2 if duration_seconds < 75 else 3
    sections = [
        ("[Intro]", "Ooh, ahh, ohh"),
        ("[Verse]", "Ooh ahh, ooh ahh, ahh"),
        ("[Chorus]", "Ohh, ohh, aah, ooh"),
        ("[Bridge]", "Ahh ooh, ahh ooh"),
        ("[Outro]", "Ooh, ahh"),
    ]
    lines: list[str] = []
    for heading, phrase in sections[: section_count + 2]:
        lines.append(heading)
        lines.append(phrase)
        lines.append("")
    return "\n".join(lines).strip()


def describe_slider(value: int, *, labels: tuple[str, str, str]) -> str:
    if value <= 33:
        return labels[0]
    if value <= 66:
        return labels[1]
    return labels[2]


def _coerce_bool(value: Any, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"1", "true", "yes", "on"}:
            return True
        if lowered in {"0", "false", "no", "off", ""}:
            return False
    return default


def _coerce_slider(value: Any, *, default: int) -> int:
    try:
        return clamp(int(value), 0, 100)
    except (TypeError, ValueError):
        return default


def _normalize_singer_mode(value: str) -> str:
    mode = (value or "").strip().lower()
    if mode in {"multiple", "multi"}:
        return "multiple"
    return "single"


def _normalize_singer_assignment_mode(value: str) -> str:
    mode = (value or "").strip().lower()
    if mode in {"manual_by_language", "manual", "manual-language"}:
        return "manual_by_language"
    if mode in {"composer_by_language", "composer", "auto"}:
        return "composer_by_language"
    return "lock_primary"


def _canonicalize_optional_language_request(value: str) -> str:
    return canonicalize_language_request((value or "").strip())


def _build_singer_voice_description(singer: SingerConfig) -> str:
    clone_profile_name = singer.clone_profile_name.strip()
    clone_reference_note = (
        f"singing tone inspired by cloned voice profile {clone_profile_name}"
        if clone_profile_name
        else ""
    )

    if singer.voice_description.strip():
        base_description = singer.voice_description.strip()
        if clone_reference_note and clone_profile_name.lower() not in base_description.lower():
            return f"{base_description}, {clone_reference_note}"
        return base_description

    has_explicit_voice_shape = any(
        [
            singer.voice_preset.strip(),
            singer.voice_gender.strip(),
            singer.voice_tone.strip(),
            singer.voice_register.strip(),
            singer.harmony_style.strip(),
            singer.voice_notes.strip(),
            singer.breathiness != 50,
            singer.brightness != 50,
            singer.vocal_power != 50,
            singer.vibrato != 35,
            singer.intimacy != 55,
            clone_profile_name,
        ]
    )
    if not has_explicit_voice_shape:
        return ""

    parts: list[str] = []
    if singer.voice_preset.strip():
        parts.append(f"{singer.voice_preset.strip()} preset")
    if singer.voice_gender.strip():
        parts.append(f"{singer.voice_gender.strip()} lead")
    if singer.voice_tone.strip():
        parts.append(f"{singer.voice_tone.strip()} tone")
    if singer.voice_register.strip():
        parts.append(f"{singer.voice_register.strip()} register")
    if singer.harmony_style.strip():
        parts.append(f"{singer.harmony_style.strip()} harmonies")

    tonal_bits = [
        f"{describe_slider(singer.breathiness, labels=('clean', 'airy', 'breathy'))} delivery",
        f"{describe_slider(singer.brightness, labels=('dark', 'balanced', 'shimmering'))} top end",
        f"{describe_slider(singer.vocal_power, labels=('intimate', 'steady', 'powerful'))} projection",
        f"{describe_slider(singer.vibrato, labels=('nearly straight tone', 'gentle vibrato', 'lush vibrato'))}",
        f"{describe_slider(singer.intimacy, labels=('distant', 'close', 'whisper-close'))} mic feel",
    ]
    parts.extend(tonal_bits)

    if singer.voice_notes.strip():
        parts.append(singer.voice_notes.strip())
    if clone_reference_note:
        parts.append(clone_reference_note)

    return ", ".join(part for part in parts if part).strip(", ")


def _build_primary_singer(request: GenerationRequest) -> SingerConfig:
    resolved_languages = _canonicalize_optional_language_request(request.primary_singer_languages)
    if not resolved_languages and not request.primary_singer_all_languages:
        resolved_languages = _canonicalize_optional_language_request(request.vocal_language)

    return SingerConfig(
        singer_id="primary",
        name=request.primary_singer_name.strip() or "Primary Singer",
        role=request.primary_singer_role.strip() or "lead",
        enabled=True,
        languages=resolved_languages,
        all_languages=bool(request.primary_singer_all_languages),
        voice_description=request.voice_description.strip(),
        voice_preset=request.voice_preset.strip(),
        voice_gender=request.voice_gender.strip(),
        voice_tone=request.voice_tone.strip(),
        voice_register=request.voice_register.strip(),
        harmony_style=request.harmony_style.strip(),
        voice_notes=request.voice_notes.strip(),
        breathiness=_coerce_slider(request.breathiness, default=50),
        brightness=_coerce_slider(request.brightness, default=50),
        vocal_power=_coerce_slider(request.vocal_power, default=50),
        vibrato=_coerce_slider(request.vibrato, default=35),
        intimacy=_coerce_slider(request.intimacy, default=55),
        clone_profile_id=request.voice_clone_profile_id.strip(),
        clone_profile_name=request.voice_clone_profile_name.strip(),
    )


def _normalize_additional_singer(entry: dict[str, Any], *, fallback_id: str, fallback_name: str) -> SingerConfig:
    return SingerConfig(
        singer_id=str(entry.get("singer_id") or fallback_id).strip() or fallback_id,
        name=str(entry.get("name") or fallback_name).strip() or fallback_name,
        role=str(entry.get("role") or "").strip(),
        enabled=_coerce_bool(entry.get("enabled"), True),
        languages=_canonicalize_optional_language_request(str(entry.get("languages") or "")),
        all_languages=_coerce_bool(entry.get("all_languages"), False),
        voice_description=str(entry.get("voice_description") or "").strip(),
        voice_preset=str(entry.get("voice_preset") or "").strip(),
        voice_gender=str(entry.get("voice_gender") or "").strip(),
        voice_tone=str(entry.get("voice_tone") or "").strip(),
        voice_register=str(entry.get("voice_register") or "").strip(),
        harmony_style=str(entry.get("harmony_style") or "").strip(),
        voice_notes=str(entry.get("voice_notes") or "").strip(),
        breathiness=_coerce_slider(entry.get("breathiness"), default=50),
        brightness=_coerce_slider(entry.get("brightness"), default=50),
        vocal_power=_coerce_slider(entry.get("vocal_power"), default=50),
        vibrato=_coerce_slider(entry.get("vibrato"), default=35),
        intimacy=_coerce_slider(entry.get("intimacy"), default=55),
        clone_profile_id=str(entry.get("clone_profile_id") or "").strip(),
        clone_profile_name=str(entry.get("clone_profile_name") or "").strip(),
    )


def resolve_singer_configs(request: GenerationRequest) -> list[SingerConfig]:
    singers = [_build_primary_singer(request)]
    if _normalize_singer_mode(request.singer_mode) != "multiple":
        return singers

    for index, entry in enumerate(request.singers or [], start=2):
        if not isinstance(entry, dict):
            continue
        singer = _normalize_additional_singer(
            entry,
            fallback_id=f"singer-{index}",
            fallback_name=f"Singer {index}",
        )
        if singer.enabled:
            singers.append(singer)
    return singers


def _find_singer_config(request: GenerationRequest, singer_id: str | None = None) -> SingerConfig:
    singers = resolve_singer_configs(request)
    target_id = (singer_id or "").strip().lower()
    for singer in singers:
        if singer.singer_id.strip().lower() == target_id:
            return singer
    return singers[0]


def _describe_singer_language_scope(singer: SingerConfig, global_languages: str) -> str:
    if singer.all_languages:
        if global_languages:
            return f"all requested languages ({global_languages})"
        return "all requested languages"
    if singer.languages:
        return singer.languages
    return global_languages or "the assigned language blend"


def display_language_name(language_code: str) -> str:
    normalized = normalize_language_code(language_code)
    if not normalized:
        return "Unspecified"
    return LANGUAGE_DISPLAY_NAMES.get(normalized, normalized.upper())


def _singer_language_codes(singer: SingerConfig) -> list[str]:
    return extract_requested_languages(singer.languages)


def _select_singer_for_language(
    candidates: list[SingerConfig],
    *,
    assignment_counts: dict[str, int],
    singer_order: dict[str, int],
    last_singer_id: str,
    prefer_swaps: bool,
) -> SingerConfig:
    if len(candidates) == 1:
        return candidates[0]

    return sorted(
        candidates,
        key=lambda singer: (
            1 if prefer_swaps and last_singer_id and singer.singer_id == last_singer_id else 0,
            assignment_counts.get(singer.singer_id, 0),
            1 if prefer_swaps and singer.singer_id == "primary" else 0,
            singer_order.get(singer.singer_id, 999),
            singer.name.lower(),
        ),
    )[0]


def resolve_singer_language_assignments(request: GenerationRequest) -> list[dict[str, str]]:
    singers = resolve_singer_configs(request)
    primary = singers[0]
    requested_languages = extract_requested_languages(
        _canonicalize_optional_language_request(request.vocal_language) or "en"
    )
    if not requested_languages:
        requested_languages = ["en"]

    singer_mode = _normalize_singer_mode(request.singer_mode)
    assignment_mode = _normalize_singer_assignment_mode(request.singer_assignment_mode)
    if singer_mode != "multiple" or len(singers) == 1 or assignment_mode == "lock_primary":
        return [
            {
                "language": language_code,
                "language_name": display_language_name(language_code),
                "singer_id": primary.singer_id,
                "singer_name": primary.name,
                "role": primary.role or "lead",
                "coverage_source": "locked_primary",
            }
            for language_code in requested_languages
        ]

    singer_order = {singer.singer_id: index for index, singer in enumerate(singers)}
    assignment_counts: dict[str, int] = {}
    last_singer_id = ""
    assignments: list[dict[str, str]] = []
    prefer_swaps = len(requested_languages) > 1 and len(singers) > 1

    for language_code in requested_languages:
        exact_matches = [
            singer for singer in singers if language_code in _singer_language_codes(singer)
        ]
        all_language_matches = [
            singer
            for singer in singers
            if singer.all_languages and singer.singer_id not in {item.singer_id for item in exact_matches}
        ]
        fallback_matches = [
            singer
            for singer in singers
            if singer.singer_id
            not in {item.singer_id for item in exact_matches + all_language_matches}
        ]

        coverage_source = "fallback"
        candidate_tiers = [
            ("listed_language", exact_matches),
            ("all_languages", all_language_matches),
            ("fallback", fallback_matches),
        ]
        chosen_singer = primary
        for tier_name, tier_candidates in candidate_tiers:
            if not tier_candidates:
                continue
            chosen_singer = _select_singer_for_language(
                tier_candidates,
                assignment_counts=assignment_counts,
                singer_order=singer_order,
                last_singer_id=last_singer_id,
                prefer_swaps=prefer_swaps,
            )
            coverage_source = tier_name
            break

        assignment_counts[chosen_singer.singer_id] = assignment_counts.get(chosen_singer.singer_id, 0) + 1
        last_singer_id = chosen_singer.singer_id
        assignments.append(
            {
                "language": language_code,
                "language_name": display_language_name(language_code),
                "singer_id": chosen_singer.singer_id,
                "singer_name": chosen_singer.name,
                "role": chosen_singer.role or "lead",
                "coverage_source": coverage_source,
            }
        )

    return assignments


def compose_singer_swap_direction(
    request: GenerationRequest,
    assignments: list[dict[str, str]] | None = None,
) -> str:
    resolved_assignments = assignments or resolve_singer_language_assignments(request)
    if len(resolved_assignments) <= 1:
        return ""

    unique_singer_ids = {item["singer_id"] for item in resolved_assignments}
    if len(unique_singer_ids) <= 1:
        return ""

    handoff_bits = [
        f"{item['language_name']} lines belong to {item['singer_name']}"
        for item in resolved_assignments
    ]
    return (
        "Singer handoff map: "
        + "; ".join(handoff_bits)
        + ". Switch singers cleanly whenever the lyric language changes, keep the assigned singer stable through consecutive lines in that language, and avoid collapsing them into one generic lead."
    )


def compose_voice_description(request: GenerationRequest, singer_id: str | None = None) -> str:
    target_singer = _find_singer_config(request, singer_id)
    if singer_id:
        return _build_singer_voice_description(target_singer)

    singers = resolve_singer_configs(request)
    assignment_mode = _normalize_singer_assignment_mode(request.singer_assignment_mode)
    if _normalize_singer_mode(request.singer_mode) != "multiple" or len(singers) == 1 or assignment_mode == "lock_primary":
        return _build_singer_voice_description(singers[0])

    roster_bits: list[str] = []
    for singer in singers:
        description = _build_singer_voice_description(singer)
        if not description:
            continue
        role = singer.role.strip() or ("lead" if singer.singer_id == "primary" else "support")
        roster_bits.append(f"{singer.name} ({role}): {description}")

    return "; ".join(roster_bits) or _build_singer_voice_description(singers[0])


def compose_singer_plan(request: GenerationRequest, recipe_singer_plan: str = "") -> str:
    singers = resolve_singer_configs(request)
    primary = singers[0]
    primary_name = primary.name.strip() or "Primary Singer"
    primary_description = _build_singer_voice_description(primary)
    global_languages = _canonicalize_optional_language_request(request.vocal_language) or "en"
    is_multilingual = is_multi_language_request(global_languages)
    singer_mode = _normalize_singer_mode(request.singer_mode)
    assignment_mode = _normalize_singer_assignment_mode(request.singer_assignment_mode)
    language_assignments = resolve_singer_language_assignments(request)

    if singer_mode != "multiple" or len(singers) == 1:
        stable_note = f"Keep {primary_name} as the same lead singer across the whole song."
        if is_multilingual:
            stable_note = f"Keep {primary_name} as the same lead singer across every section and language change."
        if primary_description:
            stable_note += f" Lead voice: {primary_description}."
        return stable_note

    if assignment_mode == "lock_primary":
        locked_note = f"Keep {primary_name} as the consistent lead singer across every section and language change."
        if primary_description:
            locked_note += f" Lead voice: {primary_description}."
        locked_note += " Other configured singers may add light support harmonies only if helpful, but they should not replace the lead."
        return locked_note

    language_owner_bits = [
        f"{item['language_name']}: {item['singer_name']}"
        for item in language_assignments
    ]
    swap_note = compose_singer_swap_direction(request, assignments=language_assignments)

    if assignment_mode == "manual_by_language":
        plan = "Use multiple singers with fixed language assignments. "
    else:
        plan = "Use multiple singers with explicit language handoffs. "
    plan += "Language owners: " + "; ".join(language_owner_bits) + "."
    if swap_note:
        plan += f" {swap_note}"

    recipe_note = recipe_singer_plan.strip()
    if recipe_note and recipe_note not in plan:
        plan += f" Composer note: {recipe_note}"
    return plan


def _primary_singer_is_locked(request: GenerationRequest) -> bool:
    singers = resolve_singer_configs(request)
    return (
        _normalize_singer_mode(request.singer_mode) != "multiple"
        or len(singers) == 1
        or _normalize_singer_assignment_mode(request.singer_assignment_mode) == "lock_primary"
    )


def compose_voice_lock_direction(request: GenerationRequest) -> str:
    singers = resolve_singer_configs(request)
    if not singers:
        return ""

    primary = singers[0]
    primary_name = primary.name.strip() or "Primary Singer"
    requested_languages = _canonicalize_optional_language_request(request.vocal_language) or "en"
    multilingual = is_multi_language_request(requested_languages)
    clone_name = primary.clone_profile_name.strip()

    if _primary_singer_is_locked(request):
        lock_note = (
            f"Keep {primary_name} as one unmistakable lead singer across every section."
            if not multilingual
            else f"Keep {primary_name} as one unmistakable lead singer across every section and language change."
        )
        lock_note += (
            " Do not morph the lead timbre, accent, age, mic distance, or gender presentation between verses, choruses, ad-libs, or harmonies."
        )
        lock_note += " Support harmonies may appear, but the main lead must stay the same person from first line to last."
        if clone_name:
            lock_note += f" Use cloned voice profile {clone_name} as the timbre anchor."
        return lock_note

    language_assignments = resolve_singer_language_assignments(request)
    unique_singers = {item["singer_id"] for item in language_assignments}
    if len(unique_singers) > 1:
        return (
            "When singers hand off between languages or sections, keep each assigned singer timbrally stable inside their own block and avoid blending them into one generic lead."
        )
    return ""


def build_singer_brief(request: GenerationRequest) -> dict[str, Any]:
    singers = resolve_singer_configs(request)
    global_languages = _canonicalize_optional_language_request(request.vocal_language) or "en"
    language_assignments = resolve_singer_language_assignments(request)
    return {
        "singer_mode": _normalize_singer_mode(request.singer_mode),
        "singer_assignment_mode": _normalize_singer_assignment_mode(request.singer_assignment_mode),
        "preview_singer_id": request.preview_singer_id.strip() or "primary",
        "singer_plan": compose_singer_plan(request),
        "voice_lock_direction": compose_voice_lock_direction(request),
        "singer_language_assignments": language_assignments,
        "singer_swap_direction": compose_singer_swap_direction(request, assignments=language_assignments),
        "singers": [
            {
                "id": singer.singer_id,
                "name": singer.name,
                "role": singer.role,
                "languages": _describe_singer_language_scope(singer, global_languages),
                "all_languages": singer.all_languages,
                "voice_description": _build_singer_voice_description(singer),
                "clone_profile_name": singer.clone_profile_name,
            }
            for singer in singers
        ],
    }


def extract_first_lyric_line(lyrics: str) -> str:
    for raw_line in lyrics.splitlines():
        line = raw_line.strip()
        if not line or (line.startswith("[") and line.endswith("]")):
            continue
        return line
    return ""


def build_preview_lyrics(request: GenerationRequest, preview_text: str) -> str:
    candidate_text = preview_text.strip() or extract_first_lyric_line(request.lyrics) or DEFAULT_PREVIEW_LINE
    if request.vocal_mode == "wordless" and not preview_text.strip():
        return "[Preview]\nOoh, ahh, starlight glow\nOhh, carry me home"

    if "[" in candidate_text and "]" in candidate_text:
        return candidate_text

    lines = [line.strip() for line in candidate_text.splitlines() if line.strip()]
    if not lines:
        lines = [DEFAULT_PREVIEW_LINE]

    if len(lines) == 1:
        lines.append(lines[0])

    return "[Preview]\n" + "\n".join(lines[:4])


def build_preview_prompt(request: GenerationRequest, voice_description: str, singer_name: str = "") -> str:
    seed_prompt = request.prompt.strip() or "Cotton candy cosmic vocal spotlight"
    singer_focus = singer_name.strip() or "the selected singer"
    focus_note = f" Spotlight {singer_focus} with this voice profile: {voice_description}." if voice_description else ""
    return (
        f"{seed_prompt}. Short voice preview only: the singer enters immediately, the arrangement stays light, "
        "the lead vocal stays front and center, there is no long intro, and the accompaniment stays simple and supportive."
        f"{focus_note}"
    )


def compact_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def truncate_text(value: str, limit: int) -> str:
    text = compact_whitespace(value)
    if len(text) <= limit:
        return text
    clipped = text[: max(0, limit - 3)].rstrip(" ,;:-")
    return f"{clipped}..."


def extract_render_prompt_seed(value: str) -> str:
    text = value or ""
    one_line_match = re.search(
        r"one-line prompt version:\s*(.+)",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if one_line_match:
        candidate = one_line_match.group(1).strip().splitlines()[0].strip()
        if candidate:
            return truncate_text(candidate, MAX_RENDER_PROMPT_SEED_CHARS)

    for chunk in re.split(r"(?:\n\s*\n|[.!?])", text):
        candidate = compact_whitespace(chunk)
        if candidate:
            return truncate_text(candidate, MAX_RENDER_PROMPT_SEED_CHARS)

    return truncate_text(text, MAX_RENDER_PROMPT_SEED_CHARS)


def build_render_prompt_payload(
    request: GenerationRequest,
    plan: dict[str, Any],
    display_prompt: str,
) -> str:
    seed_prompt = extract_render_prompt_seed(
        str(plan.get("prompt_core") or request.prompt or display_prompt)
    ) or "Ethereal cinematic vocal song"
    vocal_language = canonicalize_language_request(
        str(plan.get("vocal_language") or request.vocal_language or "en")
    ) or "en"
    voice_description = truncate_text(str(plan.get("voice_description") or ""), 150)
    singer_plan = truncate_text(str(plan.get("singer_plan") or ""), 180)
    voice_lock_direction = truncate_text(
        str(plan.get("voice_lock_direction") or compose_voice_lock_direction(request) or ""),
        240,
    )
    hook_direction = truncate_text(str(plan.get("hook_direction") or request.hook_direction or ""), 120)
    chord_story = truncate_text(str(plan.get("chord_story") or request.chord_story or ""), 120)
    dynamic_arc = truncate_text(str(plan.get("dynamic_arc") or request.dynamic_arc or ""), 140)
    orchestration_plan = truncate_text(str(plan.get("orchestration_plan") or request.orchestration_plan or ""), 180)
    transition_notes = truncate_text(str(plan.get("transition_notes") or request.transition_notes or ""), 150)
    section_energy_map = truncate_text(str(plan.get("section_energy_map") or request.section_energy_map or ""), 160)

    descriptors = [
        seed_prompt,
        f"genre: {truncate_text(str(plan.get('genre') or request.genre or ''), 90)}"
        if (plan.get("genre") or request.genre)
        else "",
        f"mood: {truncate_text(str(plan.get('mood') or request.mood or ''), 90)}"
        if (plan.get("mood") or request.mood)
        else "",
        f"instruments: {truncate_text(str(plan.get('instruments') or request.instruments or ''), 130)}"
        if (plan.get("instruments") or request.instruments)
        else "",
        f"tempo: {plan.get('tempo_bpm')} BPM" if plan.get("tempo_bpm") else "",
        f"key: {truncate_text(str(plan.get('key_scale') or request.key_scale or ''), 60)}"
        if (plan.get("key_scale") or request.key_scale)
        else "",
        f"time signature: {truncate_text(str(plan.get('time_signature') or request.time_signature or ''), 20)}"
        if (plan.get("time_signature") or request.time_signature)
        else "",
        f"vocal language blend: {vocal_language}" if is_multi_language_request(vocal_language) else f"vocal language: {vocal_language}",
        f"voice: {voice_description}" if voice_description else "",
        f"singer routing: {singer_plan}" if singer_plan else "",
        f"voice lock: {voice_lock_direction}" if voice_lock_direction else "",
        f"hook direction: {hook_direction}" if hook_direction else "",
        f"chord story: {chord_story}" if chord_story else "",
        f"dynamic arc: {dynamic_arc}" if dynamic_arc else "",
        f"orchestration: {orchestration_plan}" if orchestration_plan else "",
        f"section energy: {section_energy_map}" if section_energy_map else "",
        f"transitions: {transition_notes}" if transition_notes else "",
    ]

    if request.vocal_mode == "instrumental":
        descriptors.append("instrumental only, no sung vocals")
    elif request.vocal_mode == "wordless":
        descriptors.append("wordless lead vocal textures, no intelligible lyrics")
    else:
        descriptors.append("clear sung lead vocals, keep the provided lyrics front and center")
        if is_multi_language_request(vocal_language):
            descriptors.append("natural multilingual phrasing across the requested language blend")

    joined = ". ".join(part for part in descriptors if part).strip()
    if joined and not joined.endswith("."):
        joined += "."
    return truncate_text(joined, MAX_RENDER_PROMPT_CHARS)


def _sanitize_heartmula_tag(value: str) -> str:
    cleaned = slugify(value).replace("-", "_").strip("_")
    return cleaned[:48]


def build_heartmula_tags(request: GenerationRequest, plan: dict[str, Any]) -> str:
    raw_parts: list[str] = []
    for source in [
        str(plan.get("genre") or request.genre or ""),
        str(plan.get("mood") or request.mood or ""),
        str(plan.get("instruments") or request.instruments or ""),
        str(plan.get("texture") or request.texture or ""),
        str(plan.get("era") or request.era or ""),
        str(plan.get("hook_direction") or request.hook_direction or ""),
        str(plan.get("orchestration_plan") or request.orchestration_plan or ""),
    ]:
        if not source:
            continue
        raw_parts.extend(re.split(r"[,/;\n]+", source))

    sanitized = [
        _sanitize_heartmula_tag(part)
        for part in raw_parts
        if _sanitize_heartmula_tag(part)
    ]
    deduped = dedupe_preserve_order(sanitized)
    if not deduped:
        fallback = [
            "pop",
            "cinematic",
            "vocal" if request.vocal_mode != "instrumental" else "instrumental",
        ]
        deduped = fallback
    return ",".join(deduped[:12])


def _sanitize_songgeneration_tag(value: str) -> str:
    cleaned = compact_whitespace(value).strip().lower()
    cleaned = re.sub(r"[\[\]{}()]+", " ", cleaned)
    cleaned = re.sub(r"[^0-9a-zA-Z\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af/&+\- ]+", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" ,.-")
    return cleaned[:72]


def build_songgeneration_descriptions(request: GenerationRequest, plan: dict[str, Any]) -> str:
    raw_parts: list[str] = []
    for source in [
        request.voice_gender,
        request.voice_preset,
        request.voice_tone,
        request.voice_register,
        str(plan.get("genre") or request.genre or ""),
        str(plan.get("mood") or request.mood or ""),
        str(plan.get("instruments") or request.instruments or ""),
        str(plan.get("texture") or request.texture or ""),
        str(plan.get("era") or request.era or ""),
    ]:
        if not source:
            continue
        raw_parts.extend(re.split(r"[,/;\n]+", str(source)))

    if request.vocal_mode == "instrumental":
        raw_parts.append("instrumental")
    else:
        raw_parts.append("vocal")

    sanitized = [
        _sanitize_songgeneration_tag(part)
        for part in raw_parts
        if _sanitize_songgeneration_tag(part)
    ]
    deduped = dedupe_preserve_order(sanitized)
    if not deduped:
        deduped = [
            "pop",
            "cinematic",
            "instrumental" if request.vocal_mode == "instrumental" else "vocal",
        ]
    return ", ".join(deduped[:14])


def _songgeneration_section_tag(label: str, *, has_lyrics: bool) -> str:
    lowered = compact_whitespace(label).lower()
    if "outro" in lowered:
        return "verse" if has_lyrics else "outro-medium"
    if "intro" in lowered:
        return "verse" if has_lyrics else "intro-medium"
    if "bridge" in lowered:
        return "bridge"
    if "chorus" in lowered or "hook" in lowered or "refrain" in lowered:
        return "chorus"
    if "inst" in lowered or "instrument" in lowered or "solo" in lowered or "break" in lowered:
        return "verse" if has_lyrics else "inst-medium"
    if "pre" in lowered or "verse" in lowered:
        return "verse"
    return "verse" if has_lyrics else "inst-medium"


def _normalize_songgeneration_line(line: str) -> str:
    text = compact_whitespace(line)
    if not text:
        return ""
    replacements = {
        "，": ",",
        "。": ".",
        "！": "!",
        "？": "?",
        "；": ";",
        "：": ":",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.strip(";")
    if text and text[-1] not in ".!?":
        text += "."
    return text


def build_songgeneration_lyrics(request: GenerationRequest, lyrics_text: str, duration_seconds: int) -> str:
    if request.vocal_mode == "instrumental":
        return "[intro-medium] ; [inst-medium] ; [outro-medium]"

    source_lyrics = lyrics_text.strip() or default_wordless_lyrics(duration_seconds)
    sections: list[tuple[str, list[str]]] = []
    current_label = "verse"
    current_lines: list[str] = []

    for raw_line in source_lyrics.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        match = re.match(r"^\[(.+?)\]\s*$", line)
        if match:
            if current_lines or sections:
                sections.append((current_label, current_lines))
            current_label = match.group(1)
            current_lines = []
            continue
        current_lines.append(line)

    if current_lines:
        sections.append((current_label, current_lines))

    if not sections:
        fallback_lines = [line.strip() for line in source_lyrics.splitlines() if line.strip()]
        if fallback_lines:
            sections.append(("verse", fallback_lines))

    rendered_sections: list[str] = []
    for label, lines in sections:
        tag = _songgeneration_section_tag(label, has_lyrics=bool(lines))
        if tag in {"intro-medium", "inst-medium", "outro-medium"} and not lines:
            rendered_sections.append(f"[{tag}]")
            continue

        normalized_lines = [_normalize_songgeneration_line(line) for line in lines]
        normalized_lines = [line for line in normalized_lines if line]
        if not normalized_lines and request.vocal_mode == "wordless":
            normalized_lines = [
                _normalize_songgeneration_line("ooh ahh ooh"),
                _normalize_songgeneration_line("aah ooh aah"),
            ]
        if not normalized_lines:
            rendered_sections.append(f"[{tag}]")
            continue

        rendered_sections.append(f"[{tag}] {' '.join(normalized_lines)}")

    return " ; ".join(rendered_sections) if rendered_sections else "[verse] Starlight guides me home."


def compose_alice_goal_summary(request: GenerationRequest) -> str:
    goal = compact_whitespace(request.alice_goal)
    if goal:
        return goal

    fallback_bits = [
        compact_whitespace(request.hook_direction),
        compact_whitespace(request.dynamic_arc),
        compact_whitespace(request.orchestration_plan),
    ]
    return next((bit for bit in fallback_bits if bit), "")


def resolve_voicebox_language(request: GenerationRequest, vocal_language: str = "") -> str:
    explicit = canonicalize_language_request(request.voicebox_language.strip())
    if explicit and not is_multi_language_request(explicit):
        return explicit

    requested = extract_requested_languages(
        explicit or canonicalize_language_request(vocal_language or request.vocal_language or "en")
    )
    if not requested:
        return "en"
    return select_pivot_language(requested)


def normalize_language_code(value: str) -> str:
    text = (value or "").strip().lower().replace("_", "-")
    if not text:
        return ""
    if text in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[text]

    prefix = text.split("-", 1)[0]
    return LANGUAGE_ALIASES.get(prefix, prefix)


def extract_requested_languages(value: str) -> list[str]:
    raw = (value or "").strip()
    if not raw:
        return []

    parts = re.split(r"\s*(?:,|/|\+|&|\band\b)\s*", raw, flags=re.IGNORECASE)
    languages: list[str] = []
    for part in parts:
        normalized = normalize_language_code(part)
        if normalized and normalized not in languages:
            languages.append(normalized)
    return languages


def canonicalize_language_request(value: str) -> str:
    raw = (value or "").strip()
    languages = extract_requested_languages(raw)
    if languages:
        return " + ".join(languages)
    return raw


def is_multi_language_request(value: str) -> bool:
    return len(extract_requested_languages(value)) > 1


def select_pivot_language(requested_languages: list[str]) -> str:
    if "en" in requested_languages:
        return "en"
    return requested_languages[0] if requested_languages else "en"


def append_ai_note(existing_note: str, next_note: str) -> str:
    current = existing_note.strip()
    addition = next_note.strip()
    if not addition:
        return current
    if not current:
        return addition
    if addition in current:
        return current
    return f"{current} {addition}"


def detect_lyrics_language(lyrics: str) -> str:
    text = lyrics.strip()
    if not text:
        return ""

    if re.search(r"[\u3040-\u30ff]", text):
        return "ja"
    if re.search(r"[\uac00-\ud7af]", text):
        return "ko"
    if re.search(r"[\u0400-\u04ff]", text):
        return "ru"
    if re.search(r"[\u4e00-\u9fff]", text):
        return "zh"

    words = re.findall(r"[a-zA-Z\u00c0-\u017f']+", text.lower())
    if not words:
        return ""

    scores: dict[str, int] = {}
    word_set = set(words)
    for language_code, stopwords in COMMON_LANGUAGE_STOPWORDS.items():
        scores[language_code] = sum(1 for token in word_set if token in stopwords)

    best_language = max(scores, key=scores.get)
    if scores[best_language] >= 2:
        return best_language

    if re.fullmatch(r"[\x00-\x7f\s\[\]\-,'!.?;:()]+", text):
        return "en"
    return ""


def strip_section_tag_lines(lyrics: str) -> str:
    kept_lines: list[str] = []
    for raw_line in lyrics.splitlines():
        line = raw_line.strip()
        if line.startswith("[") and line.endswith("]"):
            continue
        kept_lines.append(raw_line)
    return "\n".join(kept_lines).strip()


def strip_voicebox_cue_lines(lyrics: str) -> str:
    cleaned_lines: list[str] = []
    for raw_line in lyrics.splitlines():
        line = raw_line.strip()
        lowered = line.lower()
        if lowered.startswith("(voicebox:") or lowered.startswith("(spoken:") or lowered.startswith("(narration:"):
            continue
        if lowered.startswith("voicebox:") or lowered.startswith("spoken cue:") or lowered.startswith("narration cue:"):
            continue
        if re.fullmatch(r"\([^)]{1,40}\)", line):
            continue
        softened = re.sub(r"^\((?:whispered|spoken|softly|breathy|narration|voicebox)\)\s*", "", raw_line, flags=re.IGNORECASE)
        cleaned_lines.append(softened)
    return "\n".join(cleaned_lines).strip()


def has_target_language_contamination(lyrics: str, target_language: str) -> bool:
    requested_languages = extract_requested_languages(target_language)
    if len(requested_languages) != 1:
        return False

    target = requested_languages[0]
    if not lyrics.strip() or target == "en":
        return False

    lyric_body = strip_section_tag_lines(lyrics)
    if not lyric_body:
        return False

    if target in NON_LATIN_LANGUAGE_CODES:
        return bool(re.search(r"\b[A-Za-z][A-Za-z']*\b", lyric_body))

    words = re.findall(r"[a-zA-Z\u00c0-\u017f']+", lyric_body.lower())
    if not words:
        return False

    word_set = set(words)
    english_hits = sum(1 for token in word_set if token in COMMON_LANGUAGE_STOPWORDS["en"])
    target_hits = sum(1 for token in word_set if token in COMMON_LANGUAGE_STOPWORDS.get(target, set()))
    return english_hits >= 2 and english_hits > target_hits


def line_has_latin_words(line: str) -> bool:
    return bool(re.search(r"\b[A-Za-z][A-Za-z']*\b", line))


def uses_language_marker(lyrics: str, language_code: str, requested_languages: list[str] | None = None) -> bool:
    text = strip_section_tag_lines(lyrics)
    if not text:
        return False

    if language_code == "ja":
        return bool(re.search(r"[\u3040-\u30ff\u4e00-\u9fff]", text))
    if language_code == "ko":
        return bool(re.search(r"[\uac00-\ud7af]", text))
    if language_code == "ru":
        return bool(re.search(r"[\u0400-\u04ff]", text))
    if language_code == "zh":
        return bool(re.search(r"[\u4e00-\u9fff]", text))

    if language_code in COMMON_LANGUAGE_STOPWORDS:
        if language_code == "en" and requested_languages and any(
            code in NON_LATIN_LANGUAGE_CODES for code in requested_languages if code != "en"
        ):
            return line_has_latin_words(text)

        words = re.findall(r"[a-zA-Z\u00c0-\u017f']+", text.lower())
        if not words:
            return False
        word_set = set(words)
        hits = sum(1 for token in word_set if token in COMMON_LANGUAGE_STOPWORDS[language_code])
        threshold = 1 if requested_languages and len(requested_languages) > 1 else 2
        return hits >= threshold

    return detect_lyrics_language(text) == language_code


def lyrics_match_requested_language_mix(lyrics: str, target_language: str) -> bool:
    requested_languages = extract_requested_languages(target_language)
    if not lyrics.strip() or not requested_languages:
        return False

    if len(requested_languages) == 1:
        detected = detect_lyrics_language(lyrics)
        if detected:
            return detected == requested_languages[0]
        return requested_languages[0] == "en"

    matched_languages = [code for code in requested_languages if uses_language_marker(lyrics, code, requested_languages=requested_languages)]
    return len(matched_languages) == len(requested_languages)


def lyrics_have_language_labels(lyrics: str) -> bool:
    if not lyrics.strip():
        return False

    for match in re.finditer(r"\(([^()]{2,30})\)", lyrics):
        label = match.group(1).strip().lower()
        normalized = normalize_language_code(label)
        if normalized in META_LANGUAGE_LABELS or label in META_LANGUAGE_LABELS:
            return True

    for raw_line in lyrics.splitlines():
        line = raw_line.strip().lower()
        if not line or (line.startswith("[") and line.endswith("]")):
            continue
        if any(f"({label})" in line for label in META_LANGUAGE_LABELS):
            return True
    return False


def lyrics_have_meta_commentary(lyrics: str) -> bool:
    if not lyrics.strip():
        return False

    for raw_line in lyrics.splitlines():
        line = raw_line.strip().lower()
        if not line or (line.startswith("[") and line.endswith("]")):
            continue
        if any(token in line for token in META_COMMENTARY_TOKENS):
            return True
    return False


def lyrics_have_meta_artifacts(lyrics: str) -> bool:
    return lyrics_have_language_labels(lyrics) or lyrics_have_meta_commentary(lyrics)


def primary_line_language(line: str, requested_languages: list[str]) -> str:
    matches = [code for code in requested_languages if uses_language_marker(line, code, requested_languages=requested_languages)]
    if len(matches) == 1:
        return matches[0]
    detected = detect_lyrics_language(line)
    if detected in requested_languages:
        return detected
    return ""


def lyrics_look_like_translation_carousel(lyrics: str, target_language: str) -> bool:
    requested_languages = extract_requested_languages(target_language)
    if len(requested_languages) < 3 or not lyrics.strip():
        return False

    section_lines: list[str] = []
    for raw_line in lyrics.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("[") and line.endswith("]"):
            section_lines = []
            continue

        section_lines.append(line)
        if len(section_lines) < len(requested_languages):
            continue

        window = section_lines[-len(requested_languages):]
        line_languages = [primary_line_language(item, requested_languages) for item in window]
        if not all(line_languages):
            continue
        if len(set(line_languages)) != len(requested_languages):
            continue
        if set(line_languages) == set(requested_languages):
            return True

    return False


def should_use_ai_lyrics_override(
    *,
    user_lyrics: str,
    target_language: str,
    ai_lyrics: str,
) -> bool:
    requested_languages = extract_requested_languages(target_language)
    if not user_lyrics.strip() or not ai_lyrics.strip() or not requested_languages:
        return False

    if len(requested_languages) > 1:
        return lyrics_match_requested_language_mix(ai_lyrics, target_language) and not lyrics_match_requested_language_mix(
            user_lyrics,
            target_language,
        )

    target = requested_languages[0]

    source_language = detect_lyrics_language(user_lyrics)
    ai_language = detect_lyrics_language(ai_lyrics)
    if source_language and source_language != target and ai_language == target:
        return True

    if target not in {"", "en"} and ai_language == target:
        return True

    return False


def needs_lyric_language_adaptation(lyrics: str, target_language: str) -> bool:
    requested_languages = extract_requested_languages(target_language)
    if not lyrics.strip() or not requested_languages:
        return False

    if len(requested_languages) > 1:
        return not lyrics_match_requested_language_mix(lyrics, target_language)

    target = requested_languages[0]
    source = detect_lyrics_language(lyrics)
    if not source:
        return target != "en"
    return source != target


def lyrics_need_language_cleanup(lyrics: str, target_language: str) -> bool:
    requested_languages = extract_requested_languages(target_language)
    if not lyrics.strip() or not requested_languages:
        return False
    if lyrics_have_meta_artifacts(lyrics):
        return True
    if lyrics_look_like_translation_carousel(lyrics, target_language):
        return True
    if needs_lyric_language_adaptation(lyrics, target_language):
        return True
    return has_target_language_contamination(lyrics, target_language)


def pick_compose_variant_profile(index: int, total: int) -> tuple[str, str]:
    if total <= 1:
        return ("Primary Take", "")
    guide = COMPOSE_VARIANT_GUIDES[index % len(COMPOSE_VARIANT_GUIDES)]
    return guide


def parse_lyric_sections(lyrics: str) -> list[tuple[str, list[str]]]:
    sections: list[tuple[str, list[str]]] = []
    current_tag = "[Verse]"
    current_lines: list[str] = []
    saw_explicit_tag = False

    for raw_line in lyrics.splitlines():
        line = raw_line.strip()
        if line.startswith("[") and line.endswith("]"):
            if current_lines or saw_explicit_tag:
                sections.append((current_tag, current_lines))
            current_tag = line
            current_lines = []
            saw_explicit_tag = True
            continue
        if line:
            current_lines.append(line)

    if current_lines or saw_explicit_tag:
        sections.append((current_tag, current_lines))

    if not sections and lyrics.strip():
        sections.append((current_tag, [line.strip() for line in lyrics.splitlines() if line.strip()]))

    return sections


def render_lyric_sections(sections: list[tuple[str, list[str]]]) -> str:
    blocks: list[str] = []
    for tag, lines in sections:
        block_lines = [tag]
        block_lines.extend(line for line in lines if line.strip())
        blocks.append("\n".join(block_lines).strip())
    return "\n\n".join(block for block in blocks if block).strip()


def requested_languages_present(lyrics: str, target_language: str) -> list[str]:
    requested_languages = extract_requested_languages(target_language)
    return [
        code
        for code in requested_languages
        if uses_language_marker(lyrics, code, requested_languages=requested_languages)
    ]


def section_focus_languages(
    requested_languages: list[str],
    section_index: int,
    total_sections: int,
    section_tag: str,
) -> list[str]:
    if len(requested_languages) <= 2:
        return requested_languages

    lowered_tag = section_tag.lower()
    if "chorus" in lowered_tag and "en" in requested_languages:
        anchor_index = requested_languages.index("en")
    else:
        anchor_index = section_index % len(requested_languages)

    focus = [
        requested_languages[anchor_index],
        requested_languages[(anchor_index + 1) % len(requested_languages)],
    ]
    if total_sections > 3 and section_index == total_sections - 1:
        focus.append(requested_languages[(anchor_index + 2) % len(requested_languages)])
    deduped: list[str] = []
    for code in focus:
        if code not in deduped:
            deduped.append(code)
    return deduped


def dedupe_preserve_order(values: list[str]) -> list[str]:
    deduped: list[str] = []
    for value in values:
        if value and value not in deduped:
            deduped.append(value)
    return deduped


def rotate_languages(values: list[str], start_index: int) -> list[str]:
    if not values:
        return []
    offset = start_index % len(values)
    return values[offset:] + values[:offset]


def allocate_language_blocks(line_count: int, languages: list[str]) -> list[list[str]]:
    ordered = dedupe_preserve_order(languages)[:3]
    if not ordered:
        return []
    if len(ordered) == 1 or line_count <= 1:
        return [[ordered[0]] for _ in range(line_count)]

    if len(ordered) == 2:
        first_count = min(line_count - 1, max(1, round(line_count * 0.6)))
        counts = [first_count, line_count - first_count]
    else:
        first_count = max(1, round(line_count * 0.5))
        second_count = max(1, round(line_count * 0.3))
        third_count = max(1, line_count - first_count - second_count)
        counts = [first_count, second_count, third_count]
        while sum(counts) > line_count:
            for index in range(len(counts) - 1, -1, -1):
                if counts[index] > 1 and sum(counts) > line_count:
                    counts[index] -= 1
        while sum(counts) < line_count:
            counts[0] += 1

    plan: list[list[str]] = []
    for language_code, count in zip(ordered, counts):
        plan.extend([[language_code]] * count)
    while len(plan) < line_count:
        plan.append([ordered[-1]])
    return plan[:line_count]


def build_section_language_plan(
    requested_languages: list[str],
    section_index: int,
    total_sections: int,
    section_tag: str,
    line_count: int,
    pivot_language: str,
) -> list[list[str]]:
    if not requested_languages:
        return []

    rotated = rotate_languages(requested_languages, section_index)
    focus_languages = section_focus_languages(
        requested_languages,
        section_index,
        total_sections,
        section_tag,
    )
    lowered_tag = section_tag.lower()

    if "chorus" in lowered_tag:
        anchor = pivot_language if pivot_language in requested_languages else rotated[0]
        accents = [code for code in rotated if code != anchor]
        ordered = dedupe_preserve_order([anchor, *accents])
        plan = allocate_language_blocks(line_count, ordered[:3])
        if line_count >= 1 and accents:
            plan[0] = [anchor, accents[0]]
        if line_count >= 2:
            plan[-1] = [anchor]
        if line_count >= 4 and len(accents) > 1:
            plan[-2] = [accents[1]]
        return plan

    ordered = dedupe_preserve_order([*focus_languages, *rotated])[:3]
    plan = allocate_language_blocks(line_count, ordered)
    if "bridge" in lowered_tag and line_count >= 1 and len(ordered) > 1:
        plan[0] = ordered[:2]
    return plan


def split_line_phrases(line: str) -> tuple[list[str], list[str]]:
    parts = re.findall(r"[^,;:]+|[,;:]\s*", line)
    phrases: list[str] = []
    separators: list[str] = []
    for part in parts:
        if re.fullmatch(r"[,;:]\s*", part):
            separators.append(part)
            continue
        text = part.strip()
        if text:
            phrases.append(text)
    return phrases, separators


def build_phrase_language_schedule(segment_count: int, language_plan: list[str]) -> list[str]:
    ordered = dedupe_preserve_order(language_plan)
    if not ordered:
        return []
    if len(ordered) == 1 or segment_count <= 1:
        return [ordered[0]] * segment_count

    schedule = [ordered[index] if index < len(ordered) else ordered[0] for index in range(segment_count)]
    if segment_count >= 3 and len(ordered) == 2:
        schedule[-1] = ordered[0]
    return schedule


def render_translated_phrases(phrases: list[str], separators: list[str]) -> str:
    if not phrases:
        return ""
    output = phrases[0]
    for index in range(1, len(phrases)):
        separator = separators[index - 1] if index - 1 < len(separators) else ", "
        output += f"{separator}{phrases[index]}"
    return output.strip()


class AstralRuntime:
    def __init__(self) -> None:
        self.device = detect_device()

    def _resolve_generation_composition(self, request: GenerationRequest) -> dict[str, object]:
        if request.composed_plan_override or request.composed_prompt_override or request.composed_lyrics_override:
            return {
                "resolved_title": request.composed_title_override.strip() or request.title.strip() or request.prompt.strip(),
                "resolved_prompt": request.composed_prompt_override,
                "resolved_lyrics": request.composed_lyrics_override,
                "plan": dict(request.composed_plan_override),
            }
        return self.compose_request(request)

    def _build_compare_request(
        self,
        request: GenerationRequest,
        *,
        composition: dict[str, object],
        song_model: str,
    ) -> GenerationRequest:
        compare_request = GenerationRequest(**asdict(request))
        plan = dict(composition.get("plan") or {})
        compare_request.song_model = song_model
        compare_request.use_ai = False
        compare_request.candidates = 1
        compare_request.prompt = str(plan.get("prompt_core") or request.prompt)
        compare_request.lyrics = str(composition.get("resolved_lyrics") or "")
        compare_request.genre = str(plan.get("genre") or request.genre)
        compare_request.mood = str(plan.get("mood") or request.mood)
        compare_request.instruments = str(plan.get("instruments") or request.instruments)
        compare_request.tempo_bpm = int(plan["tempo_bpm"]) if plan.get("tempo_bpm") not in {None, ""} else request.tempo_bpm
        compare_request.key_scale = str(plan.get("key_scale") or request.key_scale)
        compare_request.time_signature = str(plan.get("time_signature") or request.time_signature)
        compare_request.vocal_language = str(plan.get("vocal_language") or request.vocal_language)
        compare_request.era = str(plan.get("era") or request.era)
        compare_request.texture = str(plan.get("texture") or request.texture)
        compare_request.title = str(composition.get("resolved_title") or request.title or request.prompt)
        compare_request.voice_description = str(plan.get("voice_description") or request.voice_description)
        compare_request.composed_title_override = str(composition.get("resolved_title") or "")
        compare_request.composed_prompt_override = str(composition.get("resolved_prompt") or "")
        compare_request.composed_lyrics_override = str(composition.get("resolved_lyrics") or "")
        compare_request.composed_plan_override = plan
        return compare_request

    def _eligible_compare_targets(self, request: GenerationRequest) -> list[dict[str, Any]]:
        catalog = self.app_catalog()
        targets: list[dict[str, Any]] = []
        selected_backend, _ = decode_song_model_selection(request.song_model)
        preferred_backends = {ACE_STEP_BACKEND, MUSICGEN_BACKEND}
        if selected_backend in {SONGGENERATION_BACKEND, HEARTMULA_BACKEND}:
            preferred_backends.add(selected_backend)
        for card in catalog.get("engine_catalog", []):
            if card.get("kind") != "render" or not card.get("ready") or not card.get("select_value"):
                continue
            backend_id = str(card.get("id") or "")
            if backend_id not in preferred_backends:
                continue
            if request.vocal_mode == "instrumental" and backend_id == HEARTMULA_BACKEND:
                continue
            targets.append(
                {
                    "engine_id": backend_id,
                    "engine_label": str(card.get("label") or backend_id),
                    "song_model": str(card.get("select_value") or ""),
                    "status": str(card.get("status") or ""),
                    "status_label": str(card.get("status_label") or ""),
                }
            )
        return targets

    def app_catalog(self) -> dict[str, object]:
        composer_models: list[dict[str, Any]] = []
        ace_song_models: list[dict[str, Any]] = []
        composer_error = ""
        ace_song_error = ""
        musicgen_error = ""

        try:
            composer_models = ollama_client.list_models()
        except OllamaError as exc:
            composer_error = str(exc)

        try:
            ace_song_models = ace_step_client.list_models()
        except AceStepError as exc:
            ace_song_error = str(exc)

        musicgen_models: list[dict[str, Any]] = []
        try:
            musicgen_models = musicgen_client.list_models()
        except MusicGenError as exc:
            musicgen_error = str(exc)

        heartmula_status = heartmula_client.status()
        heartmula_models = heartmula_client.list_models()
        songgeneration_status = songgeneration_client.status()
        songgeneration_models = songgeneration_client.list_models()

        composer_model_options = [
            {
                "id": model.get("name") or settings.ollama_model,
                "label": model.get("name") or settings.ollama_model,
                "description": " ".join(
                    bit
                    for bit in [
                        str(model.get("parameter_size") or "").strip(),
                        str(model.get("family") or "").strip(),
                        str(model.get("quantization") or "").strip(),
                    ]
                    if bit
                ).strip()
                or "Local Ollama composer model",
            }
            for model in composer_models
        ]
        if not composer_model_options:
            composer_model_options = [
                {
                    "id": settings.ollama_model,
                    "label": settings.ollama_model,
                    "description": "Configured default Ollama composer model",
                }
            ]

        ace_song_model_options = [
            {
                "id": encode_song_model_selection(
                    ACE_STEP_BACKEND,
                    str(model.get("id") or model.get("name") or settings.ace_step_model),
                ),
                "label": f"ACE-Step · {model.get('name') or model.get('id') or settings.ace_step_model}",
                "description": model.get("description") or "Full-song vocals, lyrics, and multilingual rendering.",
                "backend": ACE_STEP_BACKEND,
                "status": "ready" if not ace_song_error else "configured",
                "capabilities": "lyrics, multilingual, singer routing, long form",
                "disabled": False,
            }
            for model in ace_song_models
        ]
        if not ace_song_model_options:
            ace_song_model_options = [
                {
                    "id": encode_song_model_selection(ACE_STEP_BACKEND, settings.ace_step_model),
                    "label": f"ACE-Step · {settings.ace_step_model}",
                    "description": "Configured default ACE-Step song engine.",
                    "backend": ACE_STEP_BACKEND,
                    "status": "configured",
                    "capabilities": "lyrics, multilingual, singer routing, long form",
                    "disabled": False,
                }
            ]

        musicgen_song_model_options = [
            {
                "id": encode_song_model_selection(MUSICGEN_BACKEND, str(model.get("id") or settings.musicgen_model)),
                "label": f"MusicGen · {model.get('label') or model.get('id') or settings.musicgen_model}",
                "description": model.get("description")
                or "Fast local instrumental and wordless sketch engine.",
                "backend": MUSICGEN_BACKEND,
                "status": "ready" if not musicgen_error else "configured",
                "capabilities": "instrumental, wordless, fast sketch",
                "disabled": False,
            }
            for model in musicgen_models
        ]

        heartmula_song_model_options = [
            {
                "id": encode_song_model_selection(HEARTMULA_BACKEND, str(model.get("id") or settings.heartmula_model)),
                "label": f"HeartMuLa · {model.get('label') or settings.heartmula_model}",
                "description": (
                    (model.get("description") or "Lyrics-first full-song backend with strong multilingual control. Current Windows adapter is experimental.")
                    + (
                        " Astral has already finished a local proof render with this backend on this machine."
                        if model.get("verified_local")
                        else ""
                    )
                ),
                "backend": HEARTMULA_BACKEND,
                "status": "experimental" if heartmula_status.get("ready") else "configured",
                "capabilities": "lyrics, multilingual, arrangement control",
                "disabled": not bool(heartmula_status.get("venv_present") and heartmula_status.get("checkpoints_present")),
                "verified_local": bool(model.get("verified_local")),
            }
            for model in heartmula_models
        ]

        songgeneration_song_model_options = []
        for model in songgeneration_models:
            verified_local = bool(model.get("verified_local"))
            label = f"SongGeneration · {model.get('label') or settings.songgeneration_model}"
            if not verified_local:
                label += " [Unverified here]"
            description = model.get("description") or "Dual-track lyrics-to-song backend with native vocal and instrumental stems."
            description += (
                " Astral has already finished a local proof render with this checkpoint on this machine."
                if verified_local
                else " This checkpoint is cataloged and selectable, but Astral has not finished a local proof render with it on this machine yet."
            )
            songgeneration_song_model_options.append(
                {
                    "id": encode_song_model_selection(
                        SONGGENERATION_BACKEND,
                        str(model.get("id") or settings.songgeneration_model),
                    ),
                    "label": label,
                    "description": description,
                    "backend": SONGGENERATION_BACKEND,
                    "status": "experimental",
                    "capabilities": "lyrics, stems, dual-track, long form",
                    "disabled": not bool(songgeneration_status.get("venv_present") and songgeneration_status.get("runtime_present")),
                    "verified_local": verified_local,
                }
            )

        optional_song_options = []
        engine_catalog: list[dict[str, Any]] = [
            {
                "id": ACE_STEP_BACKEND,
                "label": "ACE-Step 1.5",
                "kind": "render",
                "ready": True,
                "status": "ready" if not ace_song_error else "configured",
                "status_label": "Ready" if not ace_song_error else "Configured",
                "description": "Astral's current full-song singing engine with lyric-following, multilingual prompting, and singer routing.",
                "best_for": "Main sung song renders, locked-singer multilingual songs, and long-form lyric maps.",
                "limitations": "Single engine path today; stem-native dual-track generation still needs another backend.",
                "capabilities": ["lyrics", "multilingual", "singer routing", "long form"],
                "repo_dir": str(settings.ace_step_repo),
                "models": ace_song_model_options,
                "select_value": ace_song_model_options[0]["id"],
                "next_step": "Ready to render now.",
            },
            {
                "id": MUSICGEN_BACKEND,
                "label": "MusicGen",
                "kind": "render",
                "ready": True,
                "status": "ready" if not musicgen_error else "configured",
                "status_label": "On-demand",
                "description": "Fast local backing-track and wordless sketch engine from Hugging Face/AudioCraft.",
                "best_for": "Instrumental beds, logo stings, arrangement sketches, and quick wordless cue passes.",
                "limitations": "No true sung lyric-following path; use ACE-Step for real lyrical vocals.",
                "capabilities": ["instrumental", "wordless", "fast sketch", "local download"],
                "repo_dir": str(settings.cache_dir),
                "models": musicgen_song_model_options,
                "select_value": musicgen_song_model_options[0]["id"] if musicgen_song_model_options else "",
                "next_step": "First use downloads weights into the S: cache automatically.",
            },
            {
                "id": SONGGENERATION_BACKEND,
                "label": "SongGeneration / LeVo 2",
                "kind": "render",
                "ready": bool(songgeneration_status.get("ready")),
                "status": "experimental" if songgeneration_status.get("ready") else "configured" if songgeneration_status.get("venv_present") else "repo-synced" if songgeneration_status.get("repo_present") else "not-installed",
                "status_label": (
                    "Experimental"
                    if songgeneration_status.get("ready")
                    else "Weights missing"
                    if songgeneration_status.get("venv_present")
                    else "Backend staged"
                    if songgeneration_status.get("repo_present")
                    else "Not cloned"
                ),
                "description": "Stem-native lyrics-to-song backend that can emit the full mix plus separate vocals and accompaniment in one render.",
                "best_for": "Alternative sung renders when you want native vocal and instrumental stems instead of post-splitting.",
                "limitations": "Current Astral adapter is experimental on Windows and happiest with the lighter SongGeneration checkpoints.",
                "capabilities": ["lyrics", "stems", "dual-track", "full song"],
                "repo_dir": str(settings.songgeneration_repo),
                "repo_url": "https://github.com/tencent-ailab/SongGeneration",
                "models": songgeneration_song_model_options,
                "select_value": songgeneration_song_model_options[0]["id"] if songgeneration_song_model_options else "",
                "next_step": (
                    "Try it as an experimental stem-native backend now. If it bogs down, switch back to ACE-Step for the main production render."
                    if songgeneration_status.get("ready")
                    else "Run bootstrap_songgeneration_backend.ps1 to install the backend venv, runtime assets, and a checkpoint."
                ),
            },
            {
                "id": HEARTMULA_BACKEND,
                "label": "HeartMuLa",
                "kind": "render",
                "ready": bool(heartmula_status.get("ready")),
                "status": "experimental" if heartmula_status.get("ready") else "configured" if heartmula_status.get("venv_present") else "repo-synced" if heartmula_status.get("repo_present") else "not-installed",
                "status_label": (
                    "Experimental"
                    if heartmula_status.get("ready")
                    else "Weights missing"
                    if heartmula_status.get("venv_present")
                    else "Backend staged"
                    if heartmula_status.get("repo_present")
                    else "Not cloned"
                ),
                "description": "Lyrics-first full-song backend with stronger multilingual control and tag-driven arrangement cues.",
                "best_for": "Alternative sung full-song renders when you want another lyrics-focused engine beside ACE-Step.",
                "limitations": "Current Astral adapter is lyric-song only, and the Windows + 16GB path is still experimental even after checkpoints are installed.",
                "capabilities": ["lyrics", "multilingual", "tag control", "full song"],
                "repo_dir": str(settings.heartmula_repo),
                "repo_url": "https://github.com/HeartMuLa/heartlib",
                "models": heartmula_song_model_options,
                "select_value": heartmula_song_model_options[0]["id"] if heartmula_song_model_options else "",
                "next_step": (
                    "Astral has finished a local smoke render with HeartMuLa on this machine, but it still stays marked experimental while we learn its longer-form behavior."
                    if heartmula_status.get("ready")
                    else "Run bootstrap_heartmula_backend.ps1 to install the backend venv and download checkpoints."
                ),
            },
        ]

        for engine in OPTIONAL_ENGINE_LIBRARY:
            if str(engine["id"]) in {HEARTMULA_BACKEND, SONGGENERATION_BACKEND}:
                continue
            status, status_label = repo_sync_state(Path(engine["repo_dir"]))
            ready = False
            card = {
                "id": str(engine["id"]),
                "label": str(engine["label"]),
                "kind": str(engine["kind"]),
                "ready": ready,
                "status": status,
                "status_label": status_label,
                "description": str(engine["description"]),
                "best_for": str(engine["best_for"]),
                "limitations": str(engine["limitations"]),
                "capabilities": list(engine["capabilities"]),
                "repo_dir": str(engine["repo_dir"]),
                "repo_url": str(engine["repo_url"]),
                "models": [],
                "select_value": encode_song_model_selection(str(engine["id"]), "default"),
                "next_step": str(engine["next_step"]),
            }
            engine_catalog.append(card)
            if engine["kind"] == "render":
                optional_song_options.append(
                    {
                        "id": card["select_value"],
                        "label": f"{card['label']} [Setup required]",
                        "description": f"{card['description']} {card['next_step']}",
                        "backend": card["id"],
                        "status": card["status"],
                        "capabilities": ", ".join(card["capabilities"]),
                        "disabled": True,
                    }
                )

        song_model_options = [
            *ace_song_model_options,
            *musicgen_song_model_options,
            *songgeneration_song_model_options,
            *heartmula_song_model_options,
            *optional_song_options,
        ]

        return {
            "defaults": {
                "composer_model": settings.ollama_model,
                "song_model": encode_song_model_selection(ACE_STEP_BACKEND, settings.ace_step_model),
                "storage_root": str(settings.storage_root),
            },
            "composer_models": composer_model_options,
            "song_models": song_model_options,
            "engine_catalog": engine_catalog,
            "quickstart_presets": QUICKSTART_PRESETS,
            "advanced_song_lm_modes": [
                {
                    "id": settings.ace_step_lm_model,
                    "label": "ACE-Step lyric/detail LM",
                    "description": "Heavier lyric-planning path for detailed structure and stronger composition guidance.",
                },
                {
                    "id": settings.ace_step_long_lyric_lm_model,
                    "label": "ACE-Step long-song reliability LM",
                    "description": "Lighter long-form lyric planner Astral uses when a full song needs more stability.",
                },
            ],
            "voicebox_engines": [
                {"id": "", "label": "Auto", "description": "Let Voicebox choose the best available backend."},
                {"id": "chatterbox_turbo", "label": "Chatterbox Turbo", "description": "Fastest local cloned speech engine."},
                {"id": "chatterbox", "label": "Chatterbox", "description": "Higher-fidelity cloned speech when you can wait a bit longer."},
                {"id": "qwen", "label": "Qwen", "description": "Fallback local cloned speech engine."},
            ],
            "alice_lab_profiles": [
                {
                    "id": "gentle-producer",
                    "label": "Gentle producer",
                    "description": "Alice nudges the song with tasteful structure help but stays close to your brief.",
                    "autonomy": 38,
                },
                {
                    "id": "bold-arranger",
                    "label": "Bold arranger",
                    "description": "Alice takes stronger control over hooks, transitions, and orchestration moves.",
                    "autonomy": 72,
                },
                {
                    "id": "full-orchestrator",
                    "label": "Full orchestrator",
                    "description": "Alice aggressively art-directs the arrangement, dynamics, and scene changes.",
                    "autonomy": 92,
                },
            ],
            "distribution": {
                "launcher_defaults_to_s_drive": True,
                "works_without_s_drive_if_env_is_set": True,
                "recommended_python": "3.11+",
                "platform_note": "Primary local workflow is currently tuned for Windows + NVIDIA CUDA.",
            },
            "errors": {
                "composer_models": composer_error,
                "song_models": ace_song_error or musicgen_error,
                "ace_step_models": ace_song_error,
                "musicgen_models": musicgen_error,
            },
        }

    def system_status(self) -> dict[str, object]:
        gpu_name = torch.cuda.get_device_name(0) if self.device == "cuda" else None
        return {
            "device": self.device,
            "gpu_name": gpu_name,
            "cuda_available": torch.cuda.is_available(),
            "storage_root": str(settings.storage_root),
            "output_dir": str(settings.output_dir),
            "cache_dir": str(settings.cache_dir),
            "default_song_model": settings.ace_step_model,
            "max_duration_seconds": MAX_DURATION_SECONDS,
            "recommended_candidates": MAX_CANDIDATES,
            "ace_step": ace_step_client.status(),
            "musicgen": musicgen_client.status(),
            "songgeneration": songgeneration_client.status(),
            "heartmula": heartmula_client.status(),
            "ollama": ollama_client.status(),
            "multilingual": multilingual_client.status(),
            "voicebox": voicebox_client.status(),
            "audio_tools": audio_tools.status(),
            "engine_catalog": self.app_catalog().get("engine_catalog", []),
        }

    def _create_session_dir(self, title: str) -> Path:
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        label = slugify(title)[:48]
        session_dir = settings.output_dir / f"{timestamp}-{label}"
        session_dir.mkdir(parents=True, exist_ok=True)
        return session_dir

    def list_voice_clone_profiles(self) -> list[dict[str, object]]:
        return voicebox_client.list_profiles()

    def create_voice_clone_profile(
        self,
        *,
        name: str,
        description: str,
        language: str,
        sample_audio_path: str = "",
        reference_text: str = "",
        default_engine: str = "",
        personality: str = "",
    ) -> dict[str, object]:
        profile = voicebox_client.create_profile(
            name=name.strip(),
            description=description.strip(),
            language=language.strip() or "en",
            default_engine=default_engine.strip(),
            personality=personality.strip(),
        )
        sample = None
        if sample_audio_path.strip():
            sample = self.add_voice_clone_sample(
                profile_id=str(profile["id"]),
                sample_audio_path=sample_audio_path,
                reference_text=reference_text,
            )["sample"]
            profile = voicebox_client.get_profile(str(profile["id"]))

        return {
            "profile": profile,
            "sample": sample,
            "profiles": voicebox_client.list_profiles(),
        }

    def add_voice_clone_sample(
        self,
        *,
        profile_id: str,
        sample_audio_path: str,
        reference_text: str,
    ) -> dict[str, object]:
        sample_path = Path(sample_audio_path.strip()).expanduser()
        if not sample_path.exists() or not sample_path.is_file():
            raise VoiceboxError(f"Reference audio file not found: {sample_path}")
        if not reference_text.strip():
            raise VoiceboxError("Reference text is required for voice cloning samples.")

        sample = voicebox_client.add_profile_sample(
            profile_id,
            sample_audio_path=sample_path,
            reference_text=reference_text.strip(),
        )
        profile = voicebox_client.get_profile(profile_id)
        return {"sample": sample, "profile": profile}

    def preview_cloned_voice(
        self,
        *,
        profile_id: str,
        text: str,
        language: str = "en",
        engine: str = "",
        title: str = "",
    ) -> dict[str, object]:
        if not text.strip():
            raise VoiceboxError("Preview text is required for cloned voice previews.")

        profile = voicebox_client.get_profile(profile_id)
        resolved_language = language.strip() or str(profile.get("language") or "en")
        resolved_engine = engine.strip()
        try:
            payload, content_type = voicebox_client.stream_preview(
                profile_id=profile_id,
                text=text.strip(),
                language=resolved_language,
                engine=resolved_engine,
            )
        except VoiceboxError as exc:
            needs_generation_fallback = "not downloaded yet" in str(exc).lower() or "use /generate to trigger a download" in str(exc).lower()
            if not needs_generation_fallback:
                raise
            payload, content_type = voicebox_client.generate_preview(
                profile_id=profile_id,
                text=text.strip(),
                language=resolved_language,
                engine=resolved_engine,
            )

        preview_title = title.strip() or f"{profile.get('name', 'voice-clone')} clone preview"
        session_dir = self._create_session_dir(preview_title)
        extension = ".wav" if "wav" in content_type.lower() else ".bin"
        output_path = session_dir / f"voice-clone-preview{extension}"
        output_path.write_bytes(payload)

        return {
            "profile": profile,
            "text": text.strip(),
            "path": str(output_path),
            "url": f"/outputs/{session_dir.name}/{output_path.name}",
            "session_dir": str(session_dir),
            "content_type": content_type,
            "engine": resolved_engine or profile.get("default_engine") or "qwen",
        }

    def preview_alice_voicebox(self, request: GenerationRequest) -> dict[str, object]:
        profile_id = request.voicebox_profile_id.strip() or request.voice_clone_profile_id.strip()
        if not profile_id:
            raise AstralPipelineError("Choose a Voicebox clone profile for Alice before previewing a spoken cue.")

        recipe = self._resolve_recipe(request)
        script = request.voicebox_text.strip()
        if request.voicebox_auto_script or not script:
            script = recipe.voicebox_script.strip() or script
        if not script:
            goal = compose_alice_goal_summary(request) or recipe.alice_goal.strip() or request.prompt.strip()
            script = truncate_text(goal, 160) or "I remember, I connect, I guide."

        language = resolve_voicebox_language(request, recipe.vocal_language or request.vocal_language)
        title_bits = [
            request.title.strip() or recipe.title.strip() or "Astral Signals",
            request.voicebox_role.strip() or "voicebox cue",
        ]
        preview = self.preview_cloned_voice(
            profile_id=profile_id,
            text=script,
            language=language,
            title=" ".join(bit for bit in title_bits if bit).strip(),
        )
        preview["voicebox_plan"] = recipe.voicebox_plan.strip()
        preview["voicebox_script"] = script
        preview["alice_goal"] = recipe.alice_goal.strip()
        preview["orchestration_plan"] = recipe.orchestration_plan.strip()
        preview["dynamic_arc"] = recipe.dynamic_arc.strip()
        preview["voicebox_language"] = language
        return preview

    def _voice_anchor_extension(self, content_type: str) -> str:
        lowered = (content_type or "").lower()
        if "wav" in lowered:
            return ".wav"
        if "mpeg" in lowered or "mp3" in lowered:
            return ".mp3"
        if "ogg" in lowered or "opus" in lowered:
            return ".opus"
        if "flac" in lowered:
            return ".flac"
        return ".wav"

    def _voice_anchor_cache_base(self, profile_id: str, profile_name: str, language_code: str) -> str:
        profile_key = slugify(f"{profile_id}-{profile_name}")[:64] or "voice-anchor"
        language_key = normalize_language_code(language_code) or "en"
        return f"{profile_key}-{language_key}-voice-anchor"

    def _select_voice_anchor_language(self, request: GenerationRequest, singer: SingerConfig, profile: dict[str, Any]) -> str:
        profile_language = normalize_language_code(str(profile.get("language") or ""))
        if profile_language:
            return profile_language

        singer_languages = _singer_language_codes(singer)
        if singer_languages:
            return singer_languages[0]

        requested_languages = extract_requested_languages(
            _canonicalize_optional_language_request(request.vocal_language) or "en"
        )
        if requested_languages:
            return select_pivot_language(requested_languages)
        return "en"

    def _build_voice_anchor_text(self, language_code: str) -> str:
        normalized = normalize_language_code(language_code) or "en"
        return VOICE_ANCHOR_LINES.get(normalized, VOICE_ANCHOR_LINES["en"])

    def _stage_audio_reference_for_ace_step(self, source_path: str) -> str:
        source = Path(source_path).expanduser()
        if not source.exists() or not source.is_file():
            raise VoiceboxError(f"Voice anchor file not found: {source}")

        staged_dir = Path(tempfile.gettempdir()) / "astral-signals-voice-anchors"
        staged_dir.mkdir(parents=True, exist_ok=True)
        target = staged_dir / source.name
        shutil.copy2(source, target)
        return str(target)

    def _ensure_voice_anchor_reference(self, request: GenerationRequest) -> dict[str, object] | None:
        if not _primary_singer_is_locked(request):
            return None
        if request.vocal_mode == "instrumental":
            return None

        primary = resolve_singer_configs(request)[0]
        profile_id = primary.clone_profile_id.strip()
        if not profile_id:
            return None

        profile = voicebox_client.get_profile(profile_id)
        profile_name = str(profile.get("name") or primary.clone_profile_name or primary.name or "voice-clone").strip()
        anchor_language = self._select_voice_anchor_language(request, primary, profile)
        anchor_text = self._build_voice_anchor_text(anchor_language)
        anchor_engine = str(profile.get("default_engine") or "").strip()
        cache_base = self._voice_anchor_cache_base(profile_id, profile_name, anchor_language)

        existing_files = sorted(
            [
                path
                for path in settings.voice_anchor_dir.glob(f"{cache_base}.*")
                if path.is_file() and path.stat().st_size > 1024
            ],
            key=lambda path: path.stat().st_mtime,
            reverse=True,
        )
        if existing_files:
            return {
                "path": str(existing_files[0]),
                "profile_id": profile_id,
                "profile_name": profile_name,
                "language": anchor_language,
                "text": anchor_text,
                "engine": anchor_engine or profile.get("default_engine") or "default",
                "cached": True,
            }

        try:
            payload, content_type = voicebox_client.stream_preview(
                profile_id=profile_id,
                text=anchor_text,
                language=anchor_language,
                engine=anchor_engine,
            )
        except VoiceboxError as exc:
            needs_generation_fallback = (
                "not downloaded yet" in str(exc).lower()
                or "use /generate to trigger a download" in str(exc).lower()
            )
            if not needs_generation_fallback:
                raise
            payload, content_type = voicebox_client.generate_preview(
                profile_id=profile_id,
                text=anchor_text,
                language=anchor_language,
                engine=anchor_engine,
            )

        extension = self._voice_anchor_extension(content_type)
        output_path = settings.voice_anchor_dir / f"{cache_base}{extension}"
        output_path.write_bytes(payload)

        meta_path = settings.voice_anchor_dir / f"{cache_base}.json"
        meta_path.write_text(
            json.dumps(
                {
                    "profile_id": profile_id,
                    "profile_name": profile_name,
                    "language": anchor_language,
                    "text": anchor_text,
                    "engine": anchor_engine or profile.get("default_engine") or "default",
                    "content_type": content_type,
                    "path": str(output_path),
                },
                indent=2,
            ),
            encoding="utf-8",
        )

        return {
            "path": str(output_path),
            "profile_id": profile_id,
            "profile_name": profile_name,
            "language": anchor_language,
            "text": anchor_text,
            "engine": anchor_engine or profile.get("default_engine") or "default",
            "cached": False,
        }

    def compose_request(self, request: GenerationRequest) -> dict[str, object]:
        recipe = self._resolve_recipe(request)
        resolved_lyrics = self._resolve_lyrics(recipe, request)
        singer_assignments = resolve_singer_language_assignments(request)
        resolved_singer_plan = compose_singer_plan(request, recipe.singer_plan)
        voice_lock_direction = compose_voice_lock_direction(request)
        singer_swap_direction = compose_singer_swap_direction(request, assignments=singer_assignments)
        if request.vocal_mode == "lyrics" and resolved_lyrics.strip():
            target_language = canonicalize_language_request(recipe.vocal_language or request.vocal_language or "en")
            if lyrics_have_meta_artifacts(resolved_lyrics):
                raise AstralPipelineError(
                    "Astral blocked this compose result because the lyrics still contain model notes or language labels instead of clean singable lines."
                )
            if lyrics_look_like_translation_carousel(resolved_lyrics, target_language):
                raise AstralPipelineError(
                    "Astral blocked this compose result because the lyrics turned into a translation carousel instead of a natural multilingual song."
                )
            if lyrics_need_language_cleanup(resolved_lyrics, target_language):
                raise AstralPipelineError(
                    "Astral blocked this compose result because the resolved lyrics still do not satisfy the requested vocal language setting."
                )
        effective_production_notes = recipe.production_notes
        if singer_swap_direction:
            effective_production_notes = append_ai_note(effective_production_notes, singer_swap_direction)
        resolved_prompt = build_prompt(
            prompt=recipe.prompt_core or request.prompt,
            genre=recipe.genre,
            mood=recipe.mood,
            instruments=recipe.instruments,
            tempo_bpm=recipe.tempo_bpm,
            key_scale=recipe.key_scale,
            time_signature=recipe.time_signature,
            vocal_language=recipe.vocal_language,
            era=recipe.era,
            texture=recipe.texture,
            voice_description=recipe.voice_description,
            singer_direction=resolved_singer_plan,
            alice_goal=recipe.alice_goal,
            hook_direction=recipe.hook_direction,
            chord_story=recipe.chord_story,
            dynamic_arc=recipe.dynamic_arc,
            section_energy_map=recipe.section_energy_map,
            orchestration_plan=recipe.orchestration_plan,
            transition_notes=recipe.transition_notes,
            voicebox_plan=recipe.voicebox_plan,
            production_notes=effective_production_notes,
            vocal_mode=request.vocal_mode,
        )
        recipe.lyrics = resolved_lyrics
        recipe.singer_plan = resolved_singer_plan
        recipe.production_notes = effective_production_notes
        plan = recipe.as_dict()
        plan["voice_lock_direction"] = voice_lock_direction
        plan["singer_language_assignments"] = singer_assignments
        plan["singer_swap_direction"] = singer_swap_direction
        plan["alice_enabled"] = bool(request.alice_enabled)
        plan["alice_autonomy"] = int(clamp(request.alice_autonomy, 0, 100))
        plan["voicebox_enabled"] = bool(request.voicebox_enabled)
        if request.voicebox_profile_name.strip():
            plan["voicebox_profile_name"] = request.voicebox_profile_name.strip()
        elif request.voice_clone_profile_name.strip():
            plan["voicebox_profile_name"] = request.voice_clone_profile_name.strip()
        if request.voicebox_profile_id.strip():
            plan["voicebox_profile_id"] = request.voicebox_profile_id.strip()
        elif request.voice_clone_profile_id.strip():
            plan["voicebox_profile_id"] = request.voice_clone_profile_id.strip()
        resolved_voicebox_language = resolve_voicebox_language(request, recipe.vocal_language)
        if resolved_voicebox_language:
            plan["voicebox_language"] = resolved_voicebox_language
        return {
            "resolved_title": recipe.title or request.title or request.prompt.strip(),
            "resolved_prompt": resolved_prompt,
            "resolved_lyrics": resolved_lyrics,
            "plan": plan,
        }

    def compose_batch_request(self, request: GenerationRequest) -> dict[str, object]:
        variant_count = clamp(request.compose_variants, 1, MAX_COMPOSE_VARIANTS)
        variants: list[dict[str, object]] = []

        for index in range(variant_count):
            variant_label, variant_focus = pick_compose_variant_profile(index, variant_count)
            variant_request = GenerationRequest(**asdict(request))
            variant_request.compose_variants = 1
            variant_request.compose_variant_index = index + 1
            variant_request.compose_variant_count = variant_count
            variant_request.compose_variant_label = variant_label
            variant_request.compose_variant_focus = variant_focus

            composed = self.compose_request(variant_request)
            composed["variant_index"] = index + 1
            composed["variant_label"] = variant_label
            composed["variant_focus"] = variant_focus
            variants.append(composed)

        return {
            "variant_count": variant_count,
            "variants": variants,
            "requested_title": request.title.strip() or request.prompt.strip(),
        }

    def generate_batch(self, request: GenerationRequest) -> dict[str, object]:
        return self._run_generation(request)

    def generate_compare_batch(self, request: GenerationRequest) -> dict[str, object]:
        composition = self._resolve_generation_composition(request)
        targets = self._eligible_compare_targets(request)
        if not targets:
            raise AstralPipelineError(
                "Astral could not find any ready local song engines to compare right now."
            )

        runtime_notes: list[str] = []
        selected_backend, _ = decode_song_model_selection(request.song_model)
        if request.candidates > 1:
            runtime_notes.append(
                "Astral compare mode forces one candidate per engine so the side-by-side pass stays practical."
            )
        if selected_backend not in {SONGGENERATION_BACKEND, HEARTMULA_BACKEND}:
            runtime_notes.append(
                "Astral compare mode starts with the practical ready engines on this machine. Select SongGeneration or HeartMuLa in the engine picker first if you want to include that experimental backend in the compare pass."
            )

        engine_results: list[dict[str, object]] = []
        for target in targets:
            compare_request = self._build_compare_request(
                request,
                composition=composition,
                song_model=str(target["song_model"]),
            )
            try:
                result = self._run_generation(compare_request)
                engine_results.append(
                    {
                        **target,
                        "ok": True,
                        "error": "",
                        "result": result,
                    }
                )
            except Exception as exc:
                engine_results.append(
                    {
                        **target,
                        "ok": False,
                        "error": str(exc),
                        "result": {},
                    }
                )

        completed_count = sum(1 for item in engine_results if item.get("ok"))
        failed_count = len(engine_results) - completed_count
        if not completed_count:
            raise AstralPipelineError(
                "Astral tried every ready local engine in compare mode, but none completed successfully."
            )

        return {
            "compare_mode": True,
            "requested_title": request.title.strip() or request.prompt.strip(),
            "resolved_title": composition["resolved_title"],
            "resolved_prompt": composition["resolved_prompt"],
            "resolved_lyrics": composition["resolved_lyrics"],
            "plan": composition["plan"],
            "engines": engine_results,
            "completed_count": completed_count,
            "failed_count": failed_count,
            "runtime_notes": runtime_notes,
        }

    def preview_voice(self, request: GenerationRequest) -> dict[str, object]:
        preview_singer = _find_singer_config(request, request.preview_singer_id or "primary")
        voice_description = compose_voice_description(request, preview_singer.singer_id)
        preview_request = GenerationRequest(**asdict(request))
        preview_request.primary_singer_name = preview_singer.name
        preview_request.primary_singer_role = preview_singer.role
        preview_request.primary_singer_languages = preview_singer.languages
        preview_request.primary_singer_all_languages = preview_singer.all_languages
        preview_request.voice_description = preview_singer.voice_description
        preview_request.voice_preset = preview_singer.voice_preset
        preview_request.voice_gender = preview_singer.voice_gender
        preview_request.voice_tone = preview_singer.voice_tone
        preview_request.voice_register = preview_singer.voice_register
        preview_request.harmony_style = preview_singer.harmony_style
        preview_request.voice_notes = preview_singer.voice_notes
        preview_request.breathiness = preview_singer.breathiness
        preview_request.brightness = preview_singer.brightness
        preview_request.vocal_power = preview_singer.vocal_power
        preview_request.vibrato = preview_singer.vibrato
        preview_request.intimacy = preview_singer.intimacy
        preview_request.voice_clone_profile_id = preview_singer.clone_profile_id
        preview_request.voice_clone_profile_name = preview_singer.clone_profile_name
        preview_request.singer_mode = "single"
        preview_request.singer_assignment_mode = "lock_primary"
        preview_request.preview_singer_id = "primary"
        preview_request.singers = []
        selected_backend, _ = decode_song_model_selection(request.song_model)
        if selected_backend != ACE_STEP_BACKEND:
            preview_request.song_model = encode_song_model_selection(ACE_STEP_BACKEND, settings.ace_step_model)
        preview_request.use_ai = False
        preview_request.candidates = 1
        preview_request.duration = clamp(
            request.preview_duration,
            MIN_DURATION_SECONDS,
            MAX_PREVIEW_DURATION_SECONDS,
        )
        preview_request.title = (request.title.strip() or preview_singer.name.strip() or "Astral Voice") + " Voice Preview"
        preview_request.prompt = build_preview_prompt(request, voice_description, preview_singer.name)
        preview_request.lyrics = build_preview_lyrics(request, request.preview_text)
        preview_request.voice_description = voice_description
        if preview_request.vocal_mode == "instrumental":
            preview_request.vocal_mode = "lyrics"

        result = self._run_generation(preview_request)
        result["preview_text"] = preview_request.lyrics
        result["preview_duration"] = preview_request.duration
        result["is_preview"] = True
        result["voice_description"] = voice_description
        result["preview_singer_name"] = preview_singer.name
        return result

    def _repair_mixed_language_lines(
        self,
        lyrics: str,
        *,
        target_language: str,
        model_name: str | None = None,
    ) -> str:
        repaired_lines: list[str] = []
        for raw_line in lyrics.splitlines():
            line = raw_line.strip()
            if not line or (line.startswith("[") and line.endswith("]")):
                repaired_lines.append(raw_line)
                continue

            if line_has_latin_words(raw_line):
                repaired_lines.append(
                    ollama_client.adapt_lyric_line_to_language(
                        raw_line,
                        target_language=target_language,
                        model_name=model_name,
                    ).strip()
                )
            else:
                repaired_lines.append(raw_line)

        return "\n".join(repaired_lines).strip()

    def _rewrite_multilingual_lyrics_linewise(
        self,
        lyrics: str,
        *,
        target_language: str,
        model_name: str | None = None,
    ) -> str:
        requested_languages = extract_requested_languages(target_language)
        if len(requested_languages) < 2:
            return lyrics.strip()

        rebuilt_lines: list[str] = []
        lyric_line_index = 0
        for raw_line in lyrics.splitlines():
            line = raw_line.strip()
            if not line:
                rebuilt_lines.append("")
                continue
            if line.startswith("[") and line.endswith("]"):
                rebuilt_lines.append(line)
                continue

            assigned_language = requested_languages[lyric_line_index % len(requested_languages)]
            rebuilt_lines.append(
                ollama_client.adapt_lyric_line_to_language(
                    line,
                    target_language=assigned_language,
                    model_name=model_name,
                ).strip()
            )
            lyric_line_index += 1

        return "\n".join(rebuilt_lines).strip()

    def _localize_recipe_lyrics(self, recipe: PromptRecipe, request: GenerationRequest) -> PromptRecipe:
        if request.vocal_mode != "lyrics" or not recipe.lyrics.strip():
            return recipe

        raw_target_language = canonicalize_language_request(request.vocal_language.strip() or recipe.vocal_language.strip())
        requested_languages = extract_requested_languages(raw_target_language)
        if not requested_languages:
            return recipe

        has_meta_artifacts = lyrics_have_meta_artifacts(recipe.lyrics)
        looks_like_translation_carousel = lyrics_look_like_translation_carousel(recipe.lyrics, raw_target_language)
        needs_full_adaptation = (
            needs_lyric_language_adaptation(recipe.lyrics, raw_target_language)
            or has_meta_artifacts
            or looks_like_translation_carousel
        )
        needs_mixed_cleanup = has_target_language_contamination(recipe.lyrics, raw_target_language)
        if not needs_full_adaptation and not needs_mixed_cleanup:
            return recipe

        try:
            if needs_full_adaptation:
                if looks_like_translation_carousel and is_multi_language_request(raw_target_language):
                    recipe.lyrics = ollama_client.rewrite_multilingual_lyrics_naturally(
                        recipe.lyrics,
                        target_language=raw_target_language,
                        model_name=request.ai_model.strip() or None,
                    )
                else:
                    recipe.lyrics = ollama_client.adapt_lyrics_to_language(
                        recipe.lyrics,
                        target_language=raw_target_language,
                        model_name=request.ai_model.strip() or None,
                    ).strip()

                if is_multi_language_request(raw_target_language) and lyrics_look_like_translation_carousel(
                    recipe.lyrics,
                    raw_target_language,
                ):
                    recipe.lyrics = ollama_client.rewrite_multilingual_lyrics_naturally(
                        recipe.lyrics,
                        target_language=raw_target_language,
                        model_name=request.ai_model.strip() or None,
                    )

                if is_multi_language_request(raw_target_language) and not lyrics_match_requested_language_mix(
                    recipe.lyrics,
                    raw_target_language,
                ):
                    recipe.lyrics = self._rewrite_multilingual_lyrics_linewise(
                        recipe.lyrics,
                        target_language=raw_target_language,
                        model_name=request.ai_model.strip() or None,
                    )
            else:
                recipe.lyrics = self._repair_mixed_language_lines(
                    recipe.lyrics,
                    target_language=raw_target_language,
                    model_name=request.ai_model.strip() or None,
                )
                if is_multi_language_request(raw_target_language) and lyrics_look_like_translation_carousel(
                    recipe.lyrics,
                    raw_target_language,
                ):
                    recipe.lyrics = ollama_client.rewrite_multilingual_lyrics_naturally(
                        recipe.lyrics,
                        target_language=raw_target_language,
                        model_name=request.ai_model.strip() or None,
                    )
                if is_multi_language_request(raw_target_language) and not lyrics_match_requested_language_mix(
                    recipe.lyrics,
                    raw_target_language,
                ):
                    recipe.lyrics = self._rewrite_multilingual_lyrics_linewise(
                        recipe.lyrics,
                        target_language=raw_target_language,
                        model_name=request.ai_model.strip() or None,
                    )
            recipe.vocal_language = raw_target_language
            recipe.ai_error = append_ai_note(
                recipe.ai_error,
                (
                    f"Astral cleaned and shaped the lyrics into the requested language blend: {raw_target_language}."
                    if is_multi_language_request(raw_target_language)
                    else f"Astral polished the lyrics into {raw_target_language}."
                ),
            )
        except OllamaError as exc:
            if is_multi_language_request(raw_target_language):
                try:
                    recipe.lyrics = ollama_client.rewrite_multilingual_lyrics_naturally(
                        recipe.lyrics,
                        target_language=raw_target_language,
                        model_name=request.ai_model.strip() or None,
                    )
                    recipe.vocal_language = raw_target_language
                    recipe.ai_error = append_ai_note(
                        recipe.ai_error,
                        f"Astral fell back to a natural multilingual rewrite for {raw_target_language} after the full cleanup pass stalled.",
                    )
                    return recipe
                except OllamaError as fallback_exc:
                    recipe.ai_error = append_ai_note(
                        recipe.ai_error,
                        f"Astral tried to localize the lyrics for {raw_target_language}, but both the full cleanup pass and the multilingual rewrite fallback failed: {fallback_exc}",
                    )
                    return recipe

            recipe.ai_error = append_ai_note(
                recipe.ai_error,
                f"Astral tried to localize the lyrics for {raw_target_language}, but the cleanup pass failed: {exc}",
            )

        return recipe

    def _build_lyric_fallback_brief(self, recipe: PromptRecipe, request: GenerationRequest) -> dict[str, object]:
        singer_brief = build_singer_brief(request)
        return {
            "title": recipe.title or request.title.strip(),
            "prompt": recipe.prompt_core or request.prompt.strip(),
            "genre": recipe.genre or request.genre.strip(),
            "mood": recipe.mood or request.mood.strip(),
            "instruments": recipe.instruments or request.instruments.strip(),
            "tempo_bpm": recipe.tempo_bpm or request.tempo_bpm,
            "key_scale": recipe.key_scale or request.key_scale.strip(),
            "time_signature": recipe.time_signature or request.time_signature.strip(),
            "vocal_language": canonicalize_language_request(request.vocal_language.strip() or recipe.vocal_language.strip() or "en"),
            "voice_description": recipe.voice_description,
            "singer_plan": compose_singer_plan(request, recipe.singer_plan),
            "structure": recipe.structure,
            "era": recipe.era or request.era.strip(),
            "texture": recipe.texture or request.texture.strip(),
            "duration_seconds": request.duration,
            "vocal_mode": request.vocal_mode,
            "singer_mode": singer_brief["singer_mode"],
            "singer_assignment_mode": singer_brief["singer_assignment_mode"],
            "singer_language_assignments": singer_brief["singer_language_assignments"],
            "singer_swap_direction": singer_brief["singer_swap_direction"],
            "singers": singer_brief["singers"],
            "alice_enabled": request.alice_enabled,
            "alice_autonomy": clamp(request.alice_autonomy, 0, 100),
            "alice_goal": recipe.alice_goal or request.alice_goal.strip(),
            "hook_direction": recipe.hook_direction or request.hook_direction.strip(),
            "chord_story": recipe.chord_story or request.chord_story.strip(),
            "dynamic_arc": recipe.dynamic_arc or request.dynamic_arc.strip(),
            "section_energy_map": recipe.section_energy_map or request.section_energy_map.strip(),
            "orchestration_plan": recipe.orchestration_plan or request.orchestration_plan.strip(),
            "transition_notes": recipe.transition_notes or request.transition_notes.strip(),
            "voicebox_enabled": request.voicebox_enabled,
            "voicebox_role": request.voicebox_role.strip(),
            "voicebox_language": resolve_voicebox_language(request, recipe.vocal_language),
            "voicebox_plan": recipe.voicebox_plan,
            "voicebox_script": request.voicebox_text.strip() or recipe.voicebox_script,
        }

    def _finalize_manual_recipe(self, recipe: PromptRecipe, request: GenerationRequest) -> PromptRecipe:
        recipe = self._ensure_lyric_mode_has_lyrics(recipe, request)
        recipe = self._localize_recipe_lyrics(recipe, request)
        target_language = canonicalize_language_request(request.vocal_language.strip() or recipe.vocal_language.strip())
        if is_multi_language_request(target_language):
            recipe = self._ensure_natural_multilingual_lyrics(recipe, request)
        return recipe

    def _build_pivot_lyric_brief(
        self,
        recipe: PromptRecipe,
        request: GenerationRequest,
        *,
        pivot_language: str,
    ) -> dict[str, object]:
        brief = self._build_lyric_fallback_brief(recipe, request)
        brief["vocal_language"] = pivot_language
        return brief

    def _ensure_multilingual_base_lyrics(
        self,
        recipe: PromptRecipe,
        request: GenerationRequest,
        *,
        target_language: str,
        model_name: str | None = None,
    ) -> str:
        requested_languages = extract_requested_languages(target_language)
        pivot_language = select_pivot_language(requested_languages)
        candidate = (request.lyrics.strip() or recipe.lyrics.strip()).strip()

        if candidate:
            candidate_language = detect_lyrics_language(candidate)
            if (
                lyrics_have_meta_artifacts(candidate)
                or lyrics_look_like_translation_carousel(candidate, target_language)
                or (candidate_language and candidate_language != pivot_language)
            ):
                return ollama_client.adapt_lyrics_to_language(
                    candidate,
                    target_language=pivot_language,
                    model_name=model_name,
                ).strip()
            return candidate

        return ollama_client.generate_lyrics(
            self._build_pivot_lyric_brief(recipe, request, pivot_language=pivot_language),
            model_name=model_name,
        ).strip()

    def _inject_missing_languages(
        self,
        lyrics: str,
        *,
        target_language: str,
        model_name: str | None = None,
        source_lyrics: str | None = None,
        source_language: str | None = None,
    ) -> str:
        requested_languages = extract_requested_languages(target_language)
        missing_languages = [
            code for code in requested_languages if code not in requested_languages_present(lyrics, target_language)
        ]
        if not missing_languages:
            return lyrics

        sections = parse_lyric_sections(lyrics)
        source_sections = parse_lyric_sections(source_lyrics or lyrics)
        line_slots: list[tuple[int, int]] = []
        for section_index, (_tag, lines) in enumerate(sections):
            for line_index, line in enumerate(lines):
                if line.strip():
                    line_slots.append((section_index, line_index))

        if not line_slots:
            return lyrics

        pivot_language = source_language or select_pivot_language(requested_languages)
        reversed_slots = list(reversed(line_slots))
        for offset, language_code in enumerate(missing_languages):
            section_index, line_index = reversed_slots[offset % len(reversed_slots)]
            original_line = sections[section_index][1][line_index]
            if section_index < len(source_sections) and line_index < len(source_sections[section_index][1]):
                original_line = source_sections[section_index][1][line_index]

            if multilingual_client.supports_languages([pivot_language, language_code]):
                sections[section_index][1][line_index] = self._translate_line_with_plan(
                    original_line,
                    source_language=pivot_language,
                    language_plan=[language_code],
                ).strip()
                continue

            sections[section_index][1][line_index] = ollama_client.adapt_lyric_line_to_language(
                original_line,
                target_language=language_code,
                model_name=model_name,
            ).strip()

        return render_lyric_sections(sections)

    def _translate_line_with_plan(
        self,
        line: str,
        *,
        source_language: str,
        language_plan: list[str],
    ) -> str:
        cleaned_line = line.strip()
        if not cleaned_line:
            return ""

        plan = dedupe_preserve_order(language_plan) or [source_language]
        if len(plan) == 1:
            return multilingual_client.translate_text(
                cleaned_line,
                source_language=source_language,
                target_language=plan[0],
                max_new_tokens=max(32, len(cleaned_line.split()) * 4),
            )

        phrases, separators = split_line_phrases(cleaned_line)
        if len(phrases) < 2:
            return multilingual_client.translate_text(
                cleaned_line,
                source_language=source_language,
                target_language=plan[0],
                max_new_tokens=max(32, len(cleaned_line.split()) * 4),
            )

        schedule = build_phrase_language_schedule(len(phrases), plan)
        translated_phrases: list[str] = []
        for phrase, language_code in zip(phrases, schedule):
            translated_phrases.append(
                multilingual_client.translate_text(
                    phrase,
                    source_language=source_language,
                    target_language=language_code,
                    max_new_tokens=max(24, len(phrase.split()) * 4),
                )
            )
        return render_translated_phrases(translated_phrases, separators)

    def _rewrite_multilingual_sections(
        self,
        base_lyrics: str,
        *,
        target_language: str,
        model_name: str | None = None,
    ) -> str:
        requested_languages = extract_requested_languages(target_language)
        sections = parse_lyric_sections(base_lyrics)
        if not sections:
            return base_lyrics.strip()

        pivot_language = select_pivot_language(requested_languages)
        if multilingual_client.supports_languages([pivot_language, *requested_languages]):
            rewritten_sections: list[tuple[str, list[str]]] = []
            total_sections = len(sections)
            for section_index, (section_tag, lines) in enumerate(sections):
                if not lines:
                    rewritten_sections.append((section_tag, lines))
                    continue

                line_plan = build_section_language_plan(
                    requested_languages,
                    section_index,
                    total_sections,
                    section_tag,
                    len(lines),
                    pivot_language,
                )
                translated_lines: list[str] = []
                for line_index, line in enumerate(lines):
                    plan = line_plan[line_index] if line_index < len(line_plan) else [pivot_language]
                    translated_lines.append(
                        self._translate_line_with_plan(
                            line,
                            source_language=pivot_language,
                            language_plan=plan,
                        ).strip()
                    )
                rewritten_sections.append((section_tag, translated_lines))

            combined = render_lyric_sections(rewritten_sections)
            return self._inject_missing_languages(
                combined,
                target_language=target_language,
                model_name=model_name,
                source_lyrics=base_lyrics,
                source_language=pivot_language,
            ).strip()

        rewritten_sections: list[tuple[str, list[str]]] = []
        total_sections = len(sections)
        for section_index, (section_tag, lines) in enumerate(sections):
            if not lines:
                rewritten_sections.append((section_tag, lines))
                continue

            focus_languages = section_focus_languages(
                requested_languages,
                section_index,
                total_sections,
                section_tag,
            )
            section_text = "\n".join([section_tag, *lines]).strip()
            rewritten_text = ollama_client.rewrite_multilingual_section(
                section_text,
                target_language=target_language,
                focus_languages=focus_languages,
                model_name=model_name,
            )
            parsed_sections = parse_lyric_sections(rewritten_text)
            if parsed_sections:
                rewritten_sections.extend(parsed_sections)
            else:
                rewritten_sections.append((section_tag, lines))

        combined = render_lyric_sections(rewritten_sections)
        return self._inject_missing_languages(
            combined,
            target_language=target_language,
            model_name=model_name,
            source_lyrics=base_lyrics,
            source_language=select_pivot_language(requested_languages),
        ).strip()

    def _ensure_natural_multilingual_lyrics(
        self,
        recipe: PromptRecipe,
        request: GenerationRequest,
    ) -> PromptRecipe:
        if request.vocal_mode != "lyrics":
            return recipe

        target_language = canonicalize_language_request(request.vocal_language.strip() or recipe.vocal_language.strip())
        if not is_multi_language_request(target_language):
            return recipe

        if (
            request.lyrics.strip()
            and not lyrics_have_meta_artifacts(request.lyrics)
            and not lyrics_look_like_translation_carousel(request.lyrics, target_language)
            and lyrics_match_requested_language_mix(request.lyrics, target_language)
        ):
            recipe.lyrics = request.lyrics.strip()
            recipe.vocal_language = target_language
            return recipe

        model_name = request.ai_model.strip() or None
        try:
            base_lyrics = self._ensure_multilingual_base_lyrics(
                recipe,
                request,
                target_language=target_language,
                model_name=model_name,
            )
            rewritten = self._rewrite_multilingual_sections(
                base_lyrics,
                target_language=target_language,
                model_name=model_name,
            )
            if lyrics_have_meta_artifacts(rewritten) or lyrics_look_like_translation_carousel(
                rewritten,
                target_language,
            ):
                rewritten = ollama_client.rewrite_multilingual_lyrics_naturally(
                    base_lyrics,
                    target_language=target_language,
                    model_name=model_name,
                )
                rewritten = self._inject_missing_languages(
                    rewritten,
                    target_language=target_language,
                    model_name=model_name,
                )

            recipe.lyrics = rewritten.strip()
            recipe.vocal_language = target_language
            recipe.ai_error = append_ai_note(
                recipe.ai_error,
                f"Astral rebuilt the lyrics as a section-guided multilingual song for smoother code-switching across {target_language}.",
            )
        except (OllamaError, TranslationError) as exc:
            recipe.ai_error = append_ai_note(
                recipe.ai_error,
                f"Astral tried a section-guided multilingual rewrite for {target_language}, but the fallback builder failed: {exc}",
            )
        finally:
            multilingual_client.release()

        return recipe

    def _ensure_lyric_mode_has_lyrics(self, recipe: PromptRecipe, request: GenerationRequest) -> PromptRecipe:
        if request.vocal_mode != "lyrics" or recipe.lyrics.strip() or not request.use_ai:
            return recipe

        try:
            recipe.lyrics = ollama_client.generate_lyrics(
                self._build_lyric_fallback_brief(recipe, request),
                model_name=request.ai_model.strip() or None,
            ).strip()
            recipe.vocal_language = canonicalize_language_request(
                request.vocal_language.strip() or recipe.vocal_language.strip() or "en"
            )
            recipe.ai_error = append_ai_note(
                recipe.ai_error,
                "Astral generated dedicated fallback lyrics because the full composer did not return singable lyrics in time.",
            )
        except OllamaError as exc:
            recipe.ai_error = append_ai_note(
                recipe.ai_error,
                f"Astral could not backfill lyrics after the composer stalled: {exc}",
            )

        return recipe

    def _resolve_generation_runtime_strategy(
        self,
        request: GenerationRequest,
        *,
        duration: int,
        candidates: int,
        prompt_text: str,
        lyrics_text: str,
    ) -> tuple[bool, bool, bool, bool, str, list[str]]:
        effective_thinking = bool(request.thinking)
        effective_use_format = bool(request.use_format)
        effective_use_cot_caption = True
        effective_use_cot_language = True
        effective_lm_model_path = ""
        runtime_notes: list[str] = []
        combined_context_chars = len(prompt_text) + len(lyrics_text)
        lyric_line_count = len([line for line in lyrics_text.splitlines() if line.strip()])
        lyric_fidelity_mode = (
            request.vocal_mode == "lyrics"
            and bool(request.lyrics.strip())
            and bool(lyrics_text.strip())
            and candidates == 1
            and duration >= LONG_RENDER_DURATION_SECONDS
        )
        long_render_context = (
            duration >= LONG_RENDER_DURATION_SECONDS
            and request.vocal_mode == "lyrics"
            and (
                combined_context_chars >= LONG_RENDER_CONTEXT_CHARS
                or len(lyrics_text) >= LONG_RENDER_LYRICS_CHARS
            )
        )

        if lyric_fidelity_mode:
            effective_use_format = False
            effective_use_cot_caption = False
            effective_use_cot_language = False
            effective_lm_model_path = settings.ace_step_long_lyric_lm_model
            runtime_notes.append(
                "Astral switched this long mapped-lyrics render to the lighter ACE-Step 0.6B lyric-planning LM, disabled format mode, and disabled CoT caption/language helpers so the backend stays closer to your pasted lyric map."
            )
            if effective_thinking:
                runtime_notes.append(
                    "Astral kept ACE-Step thinking enabled for this long mapped-lyrics render so the model can stay on its stronger lyric-following path instead of falling back to the looser text2music path."
                )
            else:
                runtime_notes.append(
                    "ACE-Step thinking is off for this render because you disabled it manually, so Astral can only preserve lyric fidelity up to the non-thinking path."
                )

        if not effective_thinking:
            return (
                effective_thinking,
                effective_use_format,
                effective_use_cot_caption,
                effective_use_cot_language,
                effective_lm_model_path,
                runtime_notes,
            )

        if long_render_context and not lyric_fidelity_mode:
            effective_thinking = False
            runtime_notes.append(
                "Astral disabled ACE-Step thinking for this long multilingual lyric render because the original prompt and lyric context were large enough to stall the LM planning pass on 240s jobs."
            )

        if effective_thinking:
            disable_reasons: list[str] = []
            if duration >= settings.ace_step_disable_thinking_after_seconds:
                disable_reasons.append(f"{duration}s duration")

            multi_candidate_threshold = max(60, settings.ace_step_disable_thinking_after_seconds - 30)
            if candidates > 1 and duration >= multi_candidate_threshold:
                disable_reasons.append(f"{candidates}-candidate batch")

            if disable_reasons:
                joined_reasons = ", ".join(disable_reasons)
                if request.vocal_mode == "lyrics" and candidates == 1:
                    runtime_notes.append(
                        "Astral kept ACE-Step thinking enabled for this lyrics render "
                        f"despite {joined_reasons} so the LM can keep planning sung toplines and vocal structure."
                    )
                else:
                    effective_thinking = False
                    runtime_notes.append(
                        "Astral disabled ACE-Step thinking for this render "
                        f"({joined_reasons}) so full-song jobs stay on the faster, more reliable whole-song path."
                    )

        if effective_use_format and request.vocal_mode == "lyrics" and (
            duration >= settings.ace_step_disable_thinking_after_seconds
            or lyric_line_count >= LONG_RENDER_FORMAT_LINE_THRESHOLD
            or combined_context_chars >= LONG_RENDER_CONTEXT_CHARS
        ):
            effective_use_format = False
            runtime_notes.append(
                "Astral disabled ACE-Step format mode for this long lyric render because the lyrics are already structured and the extra LM formatting pass can stall full-song jobs."
            )

        return (
            effective_thinking,
            effective_use_format,
            effective_use_cot_caption,
            effective_use_cot_language,
            effective_lm_model_path,
            runtime_notes,
        )

    def _run_generation(self, request: GenerationRequest) -> dict[str, object]:
        backend_id, _ = decode_song_model_selection(request.song_model)
        if backend_id == MUSICGEN_BACKEND:
            return self._run_musicgen_generation(request)
        if backend_id == SONGGENERATION_BACKEND:
            return self._run_songgeneration_generation(request)
        if backend_id == HEARTMULA_BACKEND:
            return self._run_heartmula_generation(request)
        if backend_id != ACE_STEP_BACKEND:
            raise AstralPipelineError(
                f"The '{backend_id}' backend is cataloged in Astral, but a live runner is not wired yet. "
                "Use ACE-Step, MusicGen, SongGeneration, or HeartMuLa for now, or finish bootstrapping that engine first."
            )
        return self._run_ace_step_generation(request)

    def _run_musicgen_generation(self, request: GenerationRequest) -> dict[str, object]:
        duration = clamp(request.duration, MIN_DURATION_SECONDS, 30)
        candidates = clamp(request.candidates, 1, MAX_CANDIDATES)
        _, resolved_song_model = decode_song_model_selection(request.song_model)
        composition = self._resolve_generation_composition(request)
        prompt_text = str(composition["resolved_prompt"])
        lyrics_text = str(composition["resolved_lyrics"])
        resolved_title = str(composition["resolved_title"])
        plan = dict(composition["plan"])
        runtime_notes: list[str] = []

        effective_vocal_mode = request.vocal_mode
        if request.vocal_mode == "lyrics":
            effective_vocal_mode = "wordless"
            runtime_notes.append(
                "MusicGen does not follow full sung lyric maps, so Astral converted this run to a wordless-vocal sketch. "
                "Use ACE-Step when you need actual lyrical singing."
            )
            if lyrics_text.strip():
                runtime_notes.append(
                    "Astral kept your lyrics in the draft and plan, but the MusicGen render itself did not use them."
                )

        if request.duration > duration:
            runtime_notes.append(
                f"MusicGen is limited to about 30 seconds, so Astral shortened this render from {request.duration}s to {duration}s."
            )

        resolved_audio_format = (request.audio_format or "wav").strip().lower()
        if resolved_audio_format in {"mp3", "aac", "opus"}:
            runtime_notes.append(
                f"MusicGen currently exports lossless wav/flac in Astral, so '{request.audio_format}' was saved as wav instead."
            )
            resolved_audio_format = "wav"

        render_request = GenerationRequest(**asdict(request))
        render_request.vocal_mode = effective_vocal_mode
        render_prompt_text = build_render_prompt_payload(render_request, plan, prompt_text)
        if effective_vocal_mode == "instrumental":
            render_prompt_text = f"{render_prompt_text} Instrumental only."
        elif effective_vocal_mode == "wordless":
            render_prompt_text = f"{render_prompt_text} Wordless vocal textures only, no intelligible lyrics."

        if request.guidance_scale <= 1.0:
            runtime_notes.append(
                "Astral raised MusicGen guidance to 3.0 for this render because that backend tracks text prompts better with stronger CFG."
            )

        if runtime_notes:
            plan["runtime_notes"] = runtime_notes
            plan["ai_error"] = append_ai_note(str(plan.get("ai_error", "")), " ".join(runtime_notes))

        session_seed = request.seed if request.seed is not None else random.randint(1, 2_147_483_647)
        session_dir = self._create_session_dir(resolved_title)
        manifest_path = session_dir / "manifest.json"
        manifest = {
            "status": "pending",
            "title": resolved_title,
            "timestamp": datetime.now().strftime("%Y%m%d-%H%M%S"),
            "request": asdict(request),
            "plan": plan,
            "resolved_prompt": prompt_text,
            "render_prompt": render_prompt_text,
            "resolved_lyrics": lyrics_text,
            "device": self.device,
            "engine": MUSICGEN_BACKEND,
            "task_id": "",
            "progress_text": "",
            "payload": {
                "prompt": render_prompt_text,
                "model": resolved_song_model or settings.musicgen_model,
                "audio_duration": duration,
                "batch_size": candidates,
                "audio_format": resolved_audio_format,
            },
            "tracks": [],
            "timeout_seconds": max(900, duration * candidates * 12),
            "effective_settings": {
                "vocal_mode": effective_vocal_mode,
                "requested_vocal_mode": request.vocal_mode,
                "guidance_scale": request.guidance_scale if request.guidance_scale > 1.0 else 3.0,
                "audio_format": resolved_audio_format,
            },
            "runtime_notes": runtime_notes,
            "error": "",
        }
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

        results: list[dict[str, object]] = []
        try:
            for index in range(candidates):
                candidate_seed = session_seed + index
                output_stub = session_dir / f"candidate-{index + 1:02d}-seed-{candidate_seed}"
                record = musicgen_client.generate(
                    prompt=render_prompt_text,
                    output_path=output_stub,
                    duration_seconds=duration,
                    model_id=resolved_song_model or settings.musicgen_model,
                    seed=candidate_seed,
                    guidance_scale=request.guidance_scale,
                    audio_format=resolved_audio_format,
                )
                output_path = Path(str(record["path"]))
                results.append(
                    {
                        "candidate": index + 1,
                        "seed": candidate_seed,
                        "path": str(output_path),
                        "url": f"/outputs/{session_dir.name}/{output_path.name}",
                        "source_url": "",
                        "metas": {
                            "sample_rate": record["sample_rate"],
                            "duration_seconds": record["duration_seconds"],
                            "guidance_scale": record["guidance_scale"],
                            "model_id": record["model_id"],
                        },
                    }
                )
        except Exception as exc:
            manifest["status"] = "failed"
            manifest["failed_at"] = datetime.now().isoformat()
            manifest["error"] = str(exc)
            manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            raise

        manifest["status"] = "completed"
        manifest["completed_at"] = datetime.now().isoformat()
        manifest["tracks"] = results
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

        return {
            "session_dir": str(session_dir),
            "manifest_path": str(manifest_path),
            "resolved_title": resolved_title,
            "resolved_prompt": prompt_text,
            "resolved_lyrics": lyrics_text,
            "plan": plan,
            "device": self.device,
            "task_id": "",
            "tracks": results,
        }

    def _run_songgeneration_generation(self, request: GenerationRequest) -> dict[str, object]:
        if request.candidates > 1:
            raise AstralPipelineError(
                "SongGeneration is currently wired for one candidate at a time in Astral so it can keep stems and manifests tidy."
            )

        _, resolved_song_model = decode_song_model_selection(request.song_model)
        resolved_song_model = resolved_song_model or settings.songgeneration_model
        model_metadata = songgeneration_client.model_metadata(resolved_song_model)
        model_max_duration = int(model_metadata.get("max_duration_seconds", MAX_DURATION_SECONDS))
        duration = clamp(request.duration, MIN_DURATION_SECONDS, min(MAX_DURATION_SECONDS, model_max_duration))
        composition = self._resolve_generation_composition(request)
        prompt_text = str(composition["resolved_prompt"])
        lyrics_text = str(composition["resolved_lyrics"]).strip()
        resolved_title = str(composition["resolved_title"])
        plan = dict(composition["plan"])
        runtime_notes: list[str] = []

        if request.vocal_mode == "lyrics" and not lyrics_text:
            raise AstralPipelineError(
                "SongGeneration needs singable lyrics. Compose the song first or paste lyrics before generating."
            )
        if request.vocal_mode == "lyrics" and lyrics_have_meta_artifacts(lyrics_text):
            requested_languages = canonicalize_language_request(plan.get("vocal_language", "") or request.vocal_language or "en")
            raise AstralPipelineError(
                "Astral blocked this SongGeneration render because the lyric draft still contains model notes or language labels "
                f"instead of clean singable lines. Requested vocal language setting: {requested_languages}."
            )
        if request.vocal_mode == "lyrics":
            requested_languages = canonicalize_language_request(plan.get("vocal_language", "") or request.vocal_language or "en")
            if lyrics_need_language_cleanup(lyrics_text, requested_languages):
                raise AstralPipelineError(
                    "Astral blocked this SongGeneration render because the resolved lyrics still do not satisfy the requested vocal language setting. "
                    f"Requested vocal language setting: {requested_languages}."
                )
            if lyrics_look_like_translation_carousel(lyrics_text, requested_languages):
                raise AstralPipelineError(
                    "Astral blocked this SongGeneration render because the resolved lyrics turned into a translation carousel instead of a natural multilingual song. "
                    f"Requested vocal language setting: {requested_languages}."
                )

        requested_format = (request.audio_format or "wav").strip().lower()
        if requested_format not in {"flac", ""}:
            runtime_notes.append(
                f"SongGeneration currently saves flac in Astral, so '{request.audio_format}' was written as flac instead."
            )
        if request.duration > duration:
            runtime_notes.append(
                f"{model_metadata.get('label', 'SongGeneration')} is safer at about {duration}s on this machine, so Astral shortened this render from {request.duration}s to {duration}s."
            )

        supported_languages = set(model_metadata.get("languages") or [])
        requested_languages = extract_requested_languages(plan.get("vocal_language", "") or request.vocal_language or "en")
        unsupported_languages = [code for code in requested_languages if supported_languages and code not in supported_languages]
        if unsupported_languages:
            runtime_notes.append(
                f"{model_metadata.get('label', 'This SongGeneration checkpoint')} mainly supports {', '.join(sorted(supported_languages))}, so Astral kept the render live but language fidelity may drift for {', '.join(unsupported_languages)}."
            )

        songgeneration_lyrics = build_songgeneration_lyrics(request, lyrics_text, duration)
        songgeneration_descriptions = build_songgeneration_descriptions(request, plan)
        generation_type = "bgm" if request.vocal_mode == "instrumental" else "separate"
        if generation_type == "separate":
            runtime_notes.append(
                "Astral used SongGeneration's separate mode so this render should return the full mix plus native vocal and instrumental stems."
            )
        if request.vocal_mode == "wordless":
            runtime_notes.append(
                "SongGeneration does not have a dedicated wordless mode in Astral yet, so Astral converted your wordless request into a singable syllable map."
            )

        if runtime_notes:
            plan["runtime_notes"] = runtime_notes
            plan["ai_error"] = append_ai_note(str(plan.get("ai_error", "")), " ".join(runtime_notes))

        render_prompt_text = build_render_prompt_payload(request, plan, prompt_text)
        session_seed = request.seed if request.seed is not None else random.randint(1, 2_147_483_647)
        session_dir = self._create_session_dir(resolved_title)
        manifest_path = session_dir / "manifest.json"
        lyrics_path = session_dir / "songgeneration-lyrics.txt"
        tags_path = session_dir / "songgeneration-tags.txt"
        job_dir = session_dir / "_songgeneration"
        job_dir.mkdir(parents=True, exist_ok=True)
        lyrics_path.write_text(songgeneration_lyrics, encoding="utf-8")
        tags_path.write_text(songgeneration_descriptions, encoding="utf-8")

        timeout_seconds = max(settings.songgeneration_timeout_seconds, duration * 90)
        manifest = {
            "status": "pending",
            "title": resolved_title,
            "timestamp": datetime.now().strftime("%Y%m%d-%H%M%S"),
            "request": asdict(request),
            "plan": plan,
            "resolved_prompt": prompt_text,
            "render_prompt": render_prompt_text,
            "resolved_lyrics": lyrics_text,
            "songgeneration_lyrics": songgeneration_lyrics,
            "device": self.device,
            "engine": SONGGENERATION_BACKEND,
            "task_id": "",
            "progress_text": "",
            "payload": {
                "lyrics_path": str(lyrics_path),
                "tags_path": str(tags_path),
                "model": resolved_song_model,
                "generation_type": generation_type,
                "audio_duration": duration,
                "low_mem": settings.songgeneration_low_mem,
                "use_flash_attn": settings.songgeneration_use_flash_attn,
            },
            "tracks": [],
            "timeout_seconds": timeout_seconds,
            "effective_settings": {
                "audio_format": "flac",
                "description_tags": songgeneration_descriptions,
                "model_id": resolved_song_model,
                "model_label": model_metadata.get("label", resolved_song_model),
                "generation_type": generation_type,
                "low_mem": settings.songgeneration_low_mem,
                "use_flash_attn": settings.songgeneration_use_flash_attn,
            },
            "runtime_notes": runtime_notes,
            "error": "",
        }
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

        try:
            record = songgeneration_client.generate(
                model_id=resolved_song_model,
                lyrics_text=songgeneration_lyrics,
                descriptions=songgeneration_descriptions,
                save_dir=job_dir,
                idx=f"candidate-01-seed-{session_seed}",
                generate_type=generation_type,
                timeout_seconds=timeout_seconds,
            )
        except SongGenerationError as exc:
            manifest["status"] = "failed"
            manifest["failed_at"] = datetime.now().isoformat()
            manifest["error"] = str(exc)
            manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            raise AstralPipelineError(str(exc)) from exc

        track_specs = [
            ("mixed", "Full mix", "mix"),
            ("vocals", "Lead vocals", "vocals"),
            ("instrumental", "Instrumental", "instrumental"),
        ]
        results: list[dict[str, object]] = []
        for role, label, suffix in track_specs:
            source = str((record.get("tracks") or {}).get(role) or "").strip()
            if not source:
                continue
            source_path = Path(source)
            if not source_path.exists():
                continue
            final_name = (
                f"candidate-01-seed-{session_seed}.flac"
                if role == "mixed"
                else f"candidate-01-seed-{session_seed}-{suffix}.flac"
            )
            final_path = session_dir / final_name
            shutil.move(str(source_path), str(final_path))
            results.append(
                {
                    "candidate": 1,
                    "seed": session_seed,
                    "label": label,
                    "role": role,
                    "path": str(final_path),
                    "url": f"/outputs/{session_dir.name}/{final_path.name}",
                    "source_url": "",
                    "metas": {
                        "sample_rate": record.get("sample_rate", 48000),
                        "duration_seconds": duration,
                        "model_id": resolved_song_model,
                        "model_label": model_metadata.get("label", resolved_song_model),
                        "generation_type": generation_type,
                    },
                }
            )

        if not results:
            manifest["status"] = "failed"
            manifest["failed_at"] = datetime.now().isoformat()
            manifest["error"] = "SongGeneration finished without any surfaced track files."
            manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            raise AstralPipelineError("SongGeneration finished without any surfaced track files.")

        manifest["status"] = "completed"
        manifest["completed_at"] = datetime.now().isoformat()
        manifest["tracks"] = results
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

        return {
            "session_dir": str(session_dir),
            "manifest_path": str(manifest_path),
            "resolved_title": resolved_title,
            "resolved_prompt": prompt_text,
            "resolved_lyrics": lyrics_text,
            "plan": plan,
            "device": self.device,
            "task_id": "",
            "tracks": results,
        }

    def _run_heartmula_generation(self, request: GenerationRequest) -> dict[str, object]:
        duration = clamp(request.duration, MIN_DURATION_SECONDS, MAX_DURATION_SECONDS)
        if request.candidates > 1:
            raise AstralPipelineError("HeartMuLa is currently wired for one candidate at a time in Astral.")
        if request.vocal_mode == "instrumental":
            raise AstralPipelineError(
                "HeartMuLa's current Astral adapter is lyric-song only. Use MusicGen for instrumentals."
            )

        _, resolved_song_model = decode_song_model_selection(request.song_model)
        composition = self._resolve_generation_composition(request)
        prompt_text = str(composition["resolved_prompt"])
        lyrics_text = str(composition["resolved_lyrics"]).strip()
        resolved_title = str(composition["resolved_title"])
        plan = dict(composition["plan"])

        if not lyrics_text:
            raise AstralPipelineError(
                "HeartMuLa needs singable lyrics. Compose the song first or paste lyrics before generating."
            )

        runtime_notes: list[str] = []
        requested_format = (request.audio_format or "wav").strip().lower()
        if requested_format not in {"wav", "flac", "wav32", ""}:
            runtime_notes.append(
                f"HeartMuLa currently saves wav in Astral, so '{request.audio_format}' was written as wav instead."
            )
        if request.vocal_mode == "wordless":
            runtime_notes.append(
                "HeartMuLa is still a lyrics-first backend, so Astral sent your wordless syllable map as lyric content."
            )
        runtime_notes.append(
            "Astral used a steadier HeartMuLa sampling preset on this machine to favor completion reliability over extra randomness."
        )

        session_seed = request.seed if request.seed is not None else random.randint(1, 2_147_483_647)
        session_dir = self._create_session_dir(resolved_title)
        manifest_path = session_dir / "manifest.json"
        lyrics_path = session_dir / "heartmula-lyrics.txt"
        tags_path = session_dir / "heartmula-tags.txt"
        output_path = session_dir / f"candidate-01-seed-{session_seed}.wav"
        heartmula_tags = build_heartmula_tags(request, plan)
        lyrics_path.write_text(lyrics_text, encoding="utf-8")
        tags_path.write_text(heartmula_tags, encoding="utf-8")

        if runtime_notes:
            plan["runtime_notes"] = runtime_notes
            plan["ai_error"] = append_ai_note(str(plan.get("ai_error", "")), " ".join(runtime_notes))

        render_prompt_text = build_render_prompt_payload(request, plan, prompt_text)
        manifest = {
            "status": "pending",
            "title": resolved_title,
            "timestamp": datetime.now().strftime("%Y%m%d-%H%M%S"),
            "request": asdict(request),
            "plan": plan,
            "resolved_prompt": prompt_text,
            "render_prompt": render_prompt_text,
            "resolved_lyrics": lyrics_text,
            "device": self.device,
            "engine": HEARTMULA_BACKEND,
            "task_id": "",
            "progress_text": "",
            "payload": {
                "lyrics_path": str(lyrics_path),
                "tags_path": str(tags_path),
                "model": resolved_song_model or settings.heartmula_model,
                "version": settings.heartmula_version,
                "audio_duration": duration,
                "cfg_scale": max(0.1, request.guidance_scale),
            },
            "tracks": [],
            "timeout_seconds": max(2400, duration * 90),
            "effective_settings": {
                "audio_format": "wav",
                "tag_string": heartmula_tags,
                "cfg_scale": max(0.1, request.guidance_scale),
                "temperature": 0.95,
                "topk": 32,
            },
            "runtime_notes": runtime_notes,
            "error": "",
        }
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

        try:
            record = heartmula_client.generate(
                lyrics_path=lyrics_path,
                tags_path=tags_path,
                output_path=output_path,
                duration_seconds=duration,
                guidance_scale=max(0.1, request.guidance_scale),
                temperature=0.95,
                topk=32,
            )
        except HeartMuLaError as exc:
            manifest["status"] = "failed"
            manifest["failed_at"] = datetime.now().isoformat()
            manifest["error"] = str(exc)
            manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            raise AstralPipelineError(str(exc)) from exc

        results = [
            {
                "candidate": 1,
                "seed": session_seed,
                "path": str(output_path),
                "url": f"/outputs/{session_dir.name}/{output_path.name}",
                "source_url": "",
                "metas": {
                    "sample_rate": record.get("sample_rate", 48000),
                    "duration_seconds": duration,
                    "model_id": resolved_song_model or settings.heartmula_model,
                    "version": record.get("version", settings.heartmula_version),
                    "tags": heartmula_tags,
                },
            }
        ]

        manifest["status"] = "completed"
        manifest["completed_at"] = datetime.now().isoformat()
        manifest["tracks"] = results
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

        return {
            "session_dir": str(session_dir),
            "manifest_path": str(manifest_path),
            "resolved_title": resolved_title,
            "resolved_prompt": prompt_text,
            "resolved_lyrics": lyrics_text,
            "plan": plan,
            "device": self.device,
            "task_id": "",
            "tracks": results,
        }

    def _run_ace_step_generation(self, request: GenerationRequest) -> dict[str, object]:
        duration = clamp(request.duration, MIN_DURATION_SECONDS, MAX_DURATION_SECONDS)
        candidates = clamp(request.candidates, 1, MAX_CANDIDATES)
        composition = self.compose_request(request)
        prompt_text = str(composition["resolved_prompt"])
        lyrics_text = str(composition["resolved_lyrics"])
        resolved_title = str(composition["resolved_title"])
        plan = dict(composition["plan"])
        render_prompt_text = build_render_prompt_payload(request, plan, prompt_text)
        (
            effective_thinking,
            effective_use_format,
            effective_use_cot_caption,
            effective_use_cot_language,
            effective_lm_model_path,
            runtime_notes,
        ) = self._resolve_generation_runtime_strategy(
            request,
            duration=duration,
            candidates=candidates,
            prompt_text=render_prompt_text,
            lyrics_text=lyrics_text,
        )
        voice_anchor: dict[str, object] | None = None
        try:
            voice_anchor = self._ensure_voice_anchor_reference(request)
        except VoiceboxError as exc:
            runtime_notes.append(
                "Astral could not prepare the locked singer clone anchor for this render, so it fell back to prompt-only voice locking. "
                f"Voicebox said: {exc}"
            )
        if voice_anchor:
            try:
                staged_anchor_path = self._stage_audio_reference_for_ace_step(str(voice_anchor["path"]))
                voice_anchor["submitted_path"] = staged_anchor_path
                runtime_notes.append(
                    "Astral added a low-strength cloned voice reference anchor to help keep the lead singer timbre stable through the whole render."
                )
            except VoiceboxError as exc:
                runtime_notes.append(
                    "Astral found a clone anchor but could not stage it for ACE-Step, so it fell back to prompt-only voice locking. "
                    f"Voicebox said: {exc}"
                )
                voice_anchor = None
        if runtime_notes:
            plan["runtime_notes"] = runtime_notes
            plan["ai_error"] = append_ai_note(str(plan.get("ai_error", "")), " ".join(runtime_notes))
        plan["render_prompt"] = render_prompt_text
        plan["render_prompt_chars"] = len(render_prompt_text)
        if voice_anchor:
            plan["voice_anchor"] = voice_anchor

        if request.vocal_mode == "lyrics" and not lyrics_text.strip():
            requested_languages = canonicalize_language_request(plan.get("vocal_language", "") or request.vocal_language or "en")
            raise AstralPipelineError(
                "Astral could not resolve singable lyrics for this render. "
                f"The requested vocal language setting was {requested_languages}. "
                "Compose the song again, wait for the AI lyric pass to finish, or paste lyrics manually before generating."
            )
        if request.vocal_mode == "lyrics" and lyrics_have_meta_artifacts(lyrics_text):
            requested_languages = canonicalize_language_request(plan.get("vocal_language", "") or request.vocal_language or "en")
            raise AstralPipelineError(
                "Astral blocked this render because the lyric draft still contains model notes or language labels "
                f"instead of clean singable lines. Requested vocal language setting: {requested_languages}."
            )
        if request.vocal_mode == "lyrics":
            requested_languages = canonicalize_language_request(plan.get("vocal_language", "") or request.vocal_language or "en")
            if lyrics_need_language_cleanup(lyrics_text, requested_languages):
                raise AstralPipelineError(
                    "Astral blocked this render because the resolved lyrics still do not satisfy the requested vocal language setting. "
                    f"Requested vocal language setting: {requested_languages}."
                )
            if lyrics_look_like_translation_carousel(lyrics_text, requested_languages):
                raise AstralPipelineError(
                    "Astral blocked this render because the resolved lyrics turned into a translation carousel instead of a natural multilingual song. "
                    f"Requested vocal language setting: {requested_languages}."
                )

        session_seed = request.seed if request.seed is not None else random.randint(1, 2_147_483_647)
        seed_values = [session_seed + index for index in range(candidates)]
        session_dir = self._create_session_dir(resolved_title)
        manifest_path = session_dir / "manifest.json"
        _, resolved_song_model = decode_song_model_selection(request.song_model)

        payload = {
            "prompt": render_prompt_text,
            "lyrics": lyrics_text,
            "thinking": effective_thinking,
            "use_format": effective_use_format,
            "model": resolved_song_model or settings.ace_step_model,
            "bpm": plan.get("tempo_bpm"),
            "key_scale": plan.get("key_scale", ""),
            "time_signature": plan.get("time_signature", ""),
            "vocal_language": plan.get("vocal_language", "") or request.vocal_language or "en",
            "inference_steps": request.inference_steps,
            "guidance_scale": request.guidance_scale,
            "use_random_seed": False,
            "seed": ",".join(str(seed) for seed in seed_values) if len(seed_values) > 1 else seed_values[0],
            "audio_duration": duration,
            "batch_size": candidates,
            "audio_format": request.audio_format,
            "lm_model_path": effective_lm_model_path or None,
            "use_cot_caption": effective_use_cot_caption,
            "use_cot_language": effective_use_cot_language,
        }
        if voice_anchor:
            payload["reference_audio_path"] = str(voice_anchor["submitted_path"])
            payload["audio_cover_strength"] = settings.voice_clone_anchor_strength

        timeout_multiplier = 18
        if effective_thinking:
            timeout_multiplier = 24 if request.vocal_mode == "lyrics" else 22
        timeout_seconds = max(settings.ace_step_timeout_seconds, duration * candidates * timeout_multiplier)
        manifest = {
            "status": "pending",
            "title": resolved_title,
            "timestamp": datetime.now().strftime("%Y%m%d-%H%M%S"),
            "request": asdict(request),
            "plan": plan,
            "resolved_prompt": prompt_text,
            "render_prompt": render_prompt_text,
            "resolved_lyrics": lyrics_text,
            "device": self.device,
            "engine": "ace-step",
            "task_id": "",
            "progress_text": "",
            "payload": payload,
            "tracks": [],
            "timeout_seconds": timeout_seconds,
            "effective_settings": {
                "thinking": effective_thinking,
                "requested_thinking": bool(request.thinking),
                "use_format": effective_use_format,
                "requested_use_format": bool(request.use_format),
                "use_cot_caption": effective_use_cot_caption,
                "use_cot_language": effective_use_cot_language,
                "lm_model_path": effective_lm_model_path or settings.ace_step_lm_model,
                "voice_anchor_enabled": bool(voice_anchor),
                "voice_anchor_strength": settings.voice_clone_anchor_strength if voice_anchor else 0.0,
            },
            "runtime_notes": runtime_notes,
            "voice_anchor": voice_anchor or {},
            "error": "",
        }
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

        generation: dict[str, Any] | None = None
        recovery_notes: list[str] = []
        last_error: Exception | None = None
        for attempt_index in range(2):
            try:
                task_id = ace_step_client.start_song_generation(payload)
                manifest["status"] = "running"
                manifest["submitted_at"] = datetime.now().isoformat()
                manifest["task_id"] = task_id
                if recovery_notes:
                    manifest["recovery_notes"] = recovery_notes
                manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
                generation = ace_step_client.wait_for_song(task_id, timeout_seconds=timeout_seconds)
                break
            except AceStepQueueStuckError as exc:
                last_error = exc
                if attempt_index == 0:
                    recovery_note = (
                        "Astral detected a stuck ACE-Step queue, restarted the song server, "
                        "and resubmitted the render once."
                    )
                    recovery_notes.append(recovery_note)
                    manifest["status"] = "recovering"
                    manifest["error"] = str(exc)
                    manifest["recovery_notes"] = recovery_notes
                    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
                    plan["runtime_notes"] = [*plan.get("runtime_notes", []), recovery_note]
                    plan["ai_error"] = append_ai_note(str(plan.get("ai_error", "")), recovery_note)
                    try:
                        ace_step_client.restart_server()
                    except Exception as restart_exc:
                        last_error = restart_exc
                        break
                    continue
                break
            except Exception as exc:
                last_error = exc
                break

        if generation is None:
            manifest["status"] = "failed"
            manifest["failed_at"] = datetime.now().isoformat()
            manifest["error"] = str(last_error or "ACE-Step generation failed.")
            manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            raise last_error or AstralPipelineError("ACE-Step generation failed.")

        results: list[dict[str, object]] = []
        try:
            for index, record in enumerate(generation["records"], start=1):
                candidate_seed = seed_values[min(index - 1, len(seed_values) - 1)]
                output_suffix = request.audio_format if request.audio_format else "wav"
                output_name = f"candidate-{index:02d}-seed-{candidate_seed}.{output_suffix}"
                output_path = session_dir / output_name

                source_path = Path(str(record.get("audio_path", "")))
                if source_path.exists():
                    shutil.copy2(source_path, output_path)
                else:
                    ace_step_client.download_audio(str(record.get("file_url", "")), output_path)

                results.append(
                    {
                        "candidate": index,
                        "seed": candidate_seed,
                        "path": str(output_path),
                        "url": f"/outputs/{session_dir.name}/{output_name}",
                        "source_url": record.get("file_url", ""),
                        "metas": record.get("metas", {}),
                    }
                )
        except Exception as exc:
            manifest["status"] = "failed"
            manifest["failed_at"] = datetime.now().isoformat()
            manifest["task_id"] = generation.get("task_id", "")
            manifest["progress_text"] = generation.get("progress_text", "")
            manifest["error"] = str(exc)
            manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            raise

        manifest["status"] = "completed"
        manifest["completed_at"] = datetime.now().isoformat()
        manifest["task_id"] = generation["task_id"]
        manifest["progress_text"] = generation["progress_text"]
        manifest["tracks"] = results
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

        return {
            "session_dir": str(session_dir),
            "manifest_path": str(manifest_path),
            "resolved_title": resolved_title,
            "resolved_prompt": prompt_text,
            "resolved_lyrics": lyrics_text,
            "plan": plan,
            "device": self.device,
            "task_id": generation["task_id"],
            "tracks": results,
        }

    def _resolve_recipe(self, request: GenerationRequest) -> PromptRecipe:
        resolved_voice_description = compose_voice_description(request)
        resolved_singer_plan = compose_singer_plan(request)
        resolved_language_request = canonicalize_language_request(request.vocal_language.strip() or "en") or "en"
        multilingual_request = is_multi_language_request(resolved_language_request)
        manual_recipe = PromptRecipe(
            title=request.title.strip(),
            prompt_core=request.prompt.strip(),
            lyrics=request.lyrics.strip(),
            genre=request.genre.strip(),
            mood=request.mood.strip(),
            instruments=request.instruments.strip(),
            tempo_bpm=request.tempo_bpm,
            key_scale=request.key_scale.strip(),
            time_signature=request.time_signature.strip(),
            vocal_language=resolved_language_request,
            voice_description=resolved_voice_description,
            singer_plan=resolved_singer_plan,
            era=request.era.strip(),
            texture=request.texture.strip(),
            alice_goal=compose_alice_goal_summary(request),
            hook_direction=request.hook_direction.strip(),
            chord_story=request.chord_story.strip(),
            dynamic_arc=request.dynamic_arc.strip(),
            section_energy_map=request.section_energy_map.strip(),
            orchestration_plan=request.orchestration_plan.strip(),
            transition_notes=request.transition_notes.strip(),
            voicebox_plan=request.voicebox_role.strip(),
            voicebox_script=request.voicebox_text.strip(),
            ai_used=False,
            ai_model=request.ai_model.strip() or settings.ollama_model,
        )

        if not request.use_ai:
            return manual_recipe

        wants_language_adaptation = needs_lyric_language_adaptation(
            request.lyrics,
            resolved_language_request,
        )

        combined_brief_size = len(request.prompt.strip()) + len(request.lyrics.strip())
        if combined_brief_size > MAX_COMPOSER_BRIEF_CHARS:
            if wants_language_adaptation and not multilingual_request:
                try:
                    manual_recipe.lyrics = ollama_client.adapt_lyrics_to_language(
                        request.lyrics,
                        target_language=resolved_language_request,
                        model_name=request.ai_model.strip() or None,
                    )
                    manual_recipe.ai_error = (
                        "Prompt too long for the full composer, so Astral kept your manual brief and translated the lyrics only."
                    )
                except OllamaError as exc:
                    manual_recipe.ai_error = (
                        "Prompt too long for the full composer, and Astral could not complete the lyric translation: "
                        f"{exc}"
                    )
            else:
                manual_recipe.ai_error = (
                    "Prompt too long for the local composer, so Astral used your manual brief directly."
                )
            return self._finalize_manual_recipe(manual_recipe, request)

        user_brief = {
            "prompt": request.prompt,
            "lyrics": request.lyrics,
            "title": request.title,
            "genre": request.genre,
            "mood": request.mood,
            "instruments": request.instruments,
            "tempo_bpm": request.tempo_bpm,
            "key_scale": request.key_scale,
            "time_signature": request.time_signature,
            "vocal_language": resolved_language_request,
            "voice_description": resolved_voice_description,
            "singer_plan": resolved_singer_plan,
            "era": request.era,
            "texture": request.texture,
            "vocal_mode": request.vocal_mode,
            "duration_seconds": request.duration,
            "alice_enabled": request.alice_enabled,
            "alice_autonomy": clamp(request.alice_autonomy, 0, 100),
            "alice_goal": request.alice_goal,
            "hook_direction": request.hook_direction,
            "chord_story": request.chord_story,
            "dynamic_arc": request.dynamic_arc,
            "section_energy_map": request.section_energy_map,
            "orchestration_plan": request.orchestration_plan,
            "transition_notes": request.transition_notes,
            "voicebox_enabled": request.voicebox_enabled,
            "voicebox_role": request.voicebox_role,
            "voicebox_language": resolve_voicebox_language(request, resolved_language_request),
            "voicebox_script": request.voicebox_text,
            "voicebox_auto_script": request.voicebox_auto_script,
        }
        user_brief.update(build_singer_brief(request))
        if request.voicebox_profile_name.strip():
            user_brief["voicebox_profile_name"] = request.voicebox_profile_name.strip()
        elif request.voice_clone_profile_name.strip():
            user_brief["voicebox_profile_name"] = request.voice_clone_profile_name.strip()
        if is_multi_language_request(request.vocal_language):
            user_brief["multilingual_song"] = True
            user_brief["language_blend"] = extract_requested_languages(request.vocal_language)
        if request.compose_variant_count > 1:
            user_brief["compose_variant_index"] = request.compose_variant_index
            user_brief["compose_variant_count"] = request.compose_variant_count
            user_brief["compose_variant_label"] = request.compose_variant_label
            user_brief["compose_variant_focus"] = request.compose_variant_focus

        try:
            ai_recipe = ollama_client.compose_recipe(user_brief, model_name=request.ai_model.strip() or None)
        except OllamaError as exc:
            if wants_language_adaptation and not multilingual_request:
                try:
                    manual_recipe.lyrics = ollama_client.adapt_lyrics_to_language(
                        request.lyrics,
                        target_language=resolved_language_request,
                        model_name=request.ai_model.strip() or None,
                    )
                    manual_recipe.ai_error = (
                        f"Full composition fell back to manual settings, but Astral still translated the lyrics: {exc}"
                    )
                except OllamaError:
                    manual_recipe.ai_error = str(exc)
            else:
                manual_recipe.ai_error = str(exc)
            return self._finalize_manual_recipe(manual_recipe, request)

        ai_recipe = self._ensure_lyric_mode_has_lyrics(ai_recipe, request)
        ai_recipe = self._localize_recipe_lyrics(ai_recipe, request)

        prefer_ai_lyrics = should_use_ai_lyrics_override(
            user_lyrics=request.lyrics,
            target_language=request.vocal_language,
            ai_lyrics=ai_recipe.lyrics,
        )

        prefer_ai_singer_plan = _normalize_singer_assignment_mode(request.singer_assignment_mode) == "composer_by_language"
        merged_recipe = PromptRecipe(
            title=manual_recipe.title or ai_recipe.title,
            prompt_core=ai_recipe.prompt_core or manual_recipe.prompt_core,
            lyrics=ai_recipe.lyrics if prefer_ai_lyrics else (manual_recipe.lyrics or ai_recipe.lyrics),
            genre=manual_recipe.genre or ai_recipe.genre,
            mood=manual_recipe.mood or ai_recipe.mood,
            instruments=manual_recipe.instruments or ai_recipe.instruments,
            tempo_bpm=manual_recipe.tempo_bpm or ai_recipe.tempo_bpm,
            key_scale=manual_recipe.key_scale or ai_recipe.key_scale,
            time_signature=manual_recipe.time_signature or ai_recipe.time_signature,
            vocal_language=manual_recipe.vocal_language or ai_recipe.vocal_language,
            voice_description=manual_recipe.voice_description or ai_recipe.voice_description,
            singer_plan=(
                ai_recipe.singer_plan
                if prefer_ai_singer_plan and ai_recipe.singer_plan
                else manual_recipe.singer_plan or ai_recipe.singer_plan
            ),
            structure=ai_recipe.structure,
            era=manual_recipe.era or ai_recipe.era,
            texture=manual_recipe.texture or ai_recipe.texture,
            alice_goal=manual_recipe.alice_goal or ai_recipe.alice_goal,
            hook_direction=manual_recipe.hook_direction or ai_recipe.hook_direction,
            chord_story=manual_recipe.chord_story or ai_recipe.chord_story,
            dynamic_arc=manual_recipe.dynamic_arc or ai_recipe.dynamic_arc,
            section_energy_map=manual_recipe.section_energy_map or ai_recipe.section_energy_map,
            orchestration_plan=manual_recipe.orchestration_plan or ai_recipe.orchestration_plan,
            transition_notes=manual_recipe.transition_notes or ai_recipe.transition_notes,
            voicebox_plan=manual_recipe.voicebox_plan or ai_recipe.voicebox_plan,
            voicebox_script=manual_recipe.voicebox_script or ai_recipe.voicebox_script,
            production_notes=ai_recipe.production_notes,
            ai_used=ai_recipe.ai_used,
            ai_model=ai_recipe.ai_model,
            ai_error=ai_recipe.ai_error,
            raw_text=ai_recipe.raw_text,
        )

        merged_recipe = self._ensure_natural_multilingual_lyrics(merged_recipe, request)
        return merged_recipe

    def _resolve_lyrics(self, recipe: PromptRecipe, request: GenerationRequest) -> str:
        if request.vocal_mode == "instrumental":
            return "[Instrumental]"
        if recipe.lyrics.strip():
            return strip_voicebox_cue_lines(recipe.lyrics).strip()
        if request.vocal_mode == "wordless":
            return default_wordless_lyrics(request.duration)
        return ""


runtime = AstralRuntime()
