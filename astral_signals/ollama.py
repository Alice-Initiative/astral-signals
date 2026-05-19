from __future__ import annotations

from dataclasses import asdict, dataclass
import json
import os
from pathlib import Path
import re
import subprocess
import time
from typing import Any
from urllib import error, request

from astral_signals.config import settings


class OllamaError(RuntimeError):
    """Raised when the local Ollama runtime cannot complete a request."""


@dataclass
class PromptRecipe:
    title: str = ""
    prompt_core: str = ""
    lyrics: str = ""
    genre: str = ""
    mood: str = ""
    instruments: str = ""
    tempo_bpm: int | None = None
    key_scale: str = ""
    time_signature: str = ""
    vocal_language: str = "en"
    voice_description: str = ""
    singer_plan: str = ""
    structure: str = ""
    era: str = ""
    texture: str = ""
    alice_goal: str = ""
    hook_direction: str = ""
    chord_story: str = ""
    dynamic_arc: str = ""
    section_energy_map: str = ""
    orchestration_plan: str = ""
    transition_notes: str = ""
    voicebox_plan: str = ""
    voicebox_script: str = ""
    production_notes: str = ""
    ai_used: bool = False
    ai_model: str = ""
    ai_error: str = ""
    raw_text: str = ""

    def as_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload.pop("raw_text", None)
        return payload


def _coerce_int(value: Any, *, minimum: int, maximum: int) -> int | None:
    if value in (None, "", "null"):
        return None
    try:
        number = int(value)
    except (TypeError, ValueError):
        return None
    return max(minimum, min(maximum, number))


def _strip_code_fences(value: str) -> str:
    text = value.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z0-9_-]*\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _strip_think_blocks(value: str) -> str:
    return re.sub(r"<think>.*?</think>", "", value or "", flags=re.DOTALL | re.IGNORECASE).strip()


def _looks_like_model_commentary(line: str) -> bool:
    text = (line or "").strip()
    if not text:
        return False

    lowered = text.lower()
    commentary_prefixes = (
        "but the user",
        "but that",
        "the user said",
        "we have to ",
        "we need to ",
        "let me ",
        "let's ",
        "i'll ",
        "i will ",
        "i need to ",
        "i should ",
        "another idea",
        "to be precise",
        "we can try",
        "the problem says",
        "original lines",
        "for the chorus",
        "for the verse",
        "interpretation:",
        "final decision",
        "steps:",
        "line 1:",
        "line 2:",
        "line 3:",
        "line 4:",
    )
    if lowered.startswith(commentary_prefixes):
        return True

    commentary_tokens = (
        "the user",
        "original lines",
        "different language",
        "natural singable way",
        "assign each line",
        "i recall",
        "i think",
        "i made a mistake",
        "another approach",
        "i'll create",
        "let me look",
        "the problem says",
        "same section tags",
        "focus languages",
        "roughly the same number",
    )
    if any(token in lowered for token in commentary_tokens):
        return True

    if text.endswith(":") and len(text.split()) <= 6:
        return True

    return False


def _clean_lyric_output(value: str) -> str:
    text = _strip_think_blocks(value)
    if not text:
        return ""

    fenced_blocks = re.findall(r"```(?:[a-zA-Z0-9_-]+)?\s*(.*?)```", text, flags=re.DOTALL)
    if fenced_blocks:
        candidate = fenced_blocks[-1].strip()
        if candidate:
            text = candidate

    cleaned = _strip_code_fences(text)
    lines = cleaned.splitlines()
    first_section_index = next(
        (index for index, raw_line in enumerate(lines) if raw_line.strip().startswith("[") and raw_line.strip().endswith("]")),
        None,
    )
    if first_section_index is None:
        return cleaned

    kept_lines: list[str] = []
    for raw_line in lines[first_section_index:]:
        line = raw_line.strip()
        if not line:
            kept_lines.append("")
            continue
        if line.startswith("[") and line.endswith("]"):
            kept_lines.append(line)
            continue
        if _looks_like_model_commentary(line):
            break
        if line.startswith(("The query", "However", "This ", "Note:", "Final ", "After ", "*", "-", "•")):
            break
        kept_lines.append(line)

    return "\n".join(kept_lines).strip()


def _coerce_lyric_output(value: Any) -> str:
    if isinstance(value, list):
        chunks: list[str] = []
        for item in value:
            if isinstance(item, str):
                text = item.strip()
            elif isinstance(item, dict):
                text = str(item.get("lyrics") or item.get("text") or item.get("content") or "").strip()
            else:
                text = str(item or "").strip()
            if text:
                chunks.append(text)
        return _clean_lyric_output("\n\n".join(chunks))

    if isinstance(value, dict):
        nested = value.get("lyrics") or value.get("text") or value.get("content") or ""
        return _coerce_lyric_output(nested)

    return _clean_lyric_output(str(value or "").strip())


def _extract_first_lyric_line(value: str) -> str:
    cleaned = _strip_code_fences(value)
    for raw_line in cleaned.splitlines():
        line = raw_line.strip().strip('"')
        if not line:
            continue
        lowered = line.lower()
        if lowered.startswith(("the phrase ", "translation:", "final answer:", "**final answer**")):
            continue
        if line.startswith(("-", "*")):
            continue
        return line
    return ""


def _extract_json_object(text: str) -> dict[str, Any]:
    cleaned = _strip_code_fences(text)
    decoder = json.JSONDecoder()

    candidates = [cleaned]
    first_brace = cleaned.find("{")
    if first_brace != -1:
        candidates.append(cleaned[first_brace:])

    for candidate in candidates:
        try:
            parsed, _ = decoder.raw_decode(candidate)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            continue

    raise OllamaError("Ollama returned text without a usable JSON object.")


class OllamaClient:
    def __init__(self) -> None:
        self.base_url = settings.ollama_host
        self.default_model = settings.ollama_model
        self.binary = settings.ollama_binary
        self.models_dir = settings.ollama_models_dir
        self.timeout = settings.ollama_timeout_seconds

    def _request_json(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        *,
        timeout: int | None = None,
    ) -> dict[str, Any]:
        data = None
        headers = {"Content-Type": "application/json"}
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")

        req = request.Request(f"{self.base_url}{path}", data=data, headers=headers, method=method)
        try:
            with request.urlopen(req, timeout=timeout or self.timeout) as response:
                body = response.read().decode("utf-8")
                if not body:
                    return {}
                return json.loads(body)
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise OllamaError(f"Ollama returned HTTP {exc.code}: {detail}") from exc
        except error.URLError as exc:
            raise OllamaError(f"Could not reach Ollama at {self.base_url}: {exc.reason}") from exc
        except TimeoutError as exc:
            raise OllamaError(f"Ollama timed out after {timeout or self.timeout}s.") from exc

    def ensure_server(self) -> None:
        if self._is_healthy():
            return

        if not self.binary.exists():
            raise OllamaError(f"Ollama binary not found at {self.binary}.")

        if not self.models_dir.exists():
            raise OllamaError(f"Ollama model directory not found at {self.models_dir}.")

        env = os.environ.copy()
        env["OLLAMA_HOST"] = self.base_url
        env["OLLAMA_MODELS"] = str(self.models_dir)

        creationflags = 0
        if hasattr(subprocess, "CREATE_NO_WINDOW"):
            creationflags |= subprocess.CREATE_NO_WINDOW
        if hasattr(subprocess, "DETACHED_PROCESS"):
            creationflags |= subprocess.DETACHED_PROCESS

        subprocess.Popen(
            [str(self.binary), "serve"],
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creationflags,
        )

        deadline = time.time() + 20
        while time.time() < deadline:
            if self._is_healthy():
                return
            time.sleep(1)

        raise OllamaError("Astral Signals could not start its dedicated Ollama server.")

    def _is_healthy(self) -> bool:
        try:
            self._request_json("GET", "/api/tags", timeout=2)
            return True
        except OllamaError:
            return False

    def list_models(self) -> list[dict[str, Any]]:
        self.ensure_server()
        tags = self._request_json("GET", "/api/tags", timeout=10).get("models", [])
        models: list[dict[str, Any]] = []
        for item in tags:
            if not isinstance(item, dict):
                continue
            details = item.get("details", {}) or {}
            models.append(
                {
                    "name": str(item.get("name", "")).strip(),
                    "family": str(details.get("family", "")).strip(),
                    "parameter_size": str(details.get("parameter_size", "")).strip(),
                    "quantization": str(details.get("quantization_level", "")).strip(),
                    "format": str(details.get("format", "")).strip(),
                    "modified_at": str(item.get("modified_at", "")).strip(),
                    "size": int(item.get("size", 0) or 0),
                }
            )
        return [model for model in models if model["name"]]

    def status(self) -> dict[str, Any]:
        try:
            self.ensure_server()
            models = self.list_models()
            available_models = [item.get("name", "") for item in models]
            return {
                "available": True,
                "host": self.base_url,
                "binary": str(self.binary),
                "models_dir": str(self.models_dir),
                "default_model": self.default_model,
                "available_models": available_models,
                "models": models,
            }
        except OllamaError as exc:
            return {
                "available": False,
                "host": self.base_url,
                "binary": str(self.binary),
                "models_dir": str(self.models_dir),
                "default_model": self.default_model,
                "error": str(exc),
                "available_models": [],
                "models": [],
            }

    def compose_recipe(self, user_brief: dict[str, Any], model_name: str | None = None) -> PromptRecipe:
        self.ensure_server()
        active_model = model_name or self.default_model
        prompt = self._build_prompt(user_brief)
        candidate_text = self._generate_text(
            prompt,
            model_name=active_model,
            temperature=0.2,
            allow_thinking_fallback=True,
        )
        if not candidate_text:
            raise OllamaError("Ollama returned an empty composition result.")

        data = _extract_json_object(candidate_text)
        return PromptRecipe(
            title=str(data.get("title", "")).strip(),
            prompt_core=str(data.get("prompt_core") or data.get("music_prompt") or "").strip(),
            lyrics=_coerce_lyric_output(data.get("lyrics", "")),
            genre=str(data.get("genre", "")).strip(),
            mood=str(data.get("mood", "")).strip(),
            instruments=str(data.get("instruments", "")).strip(),
            tempo_bpm=_coerce_int(data.get("tempo_bpm"), minimum=40, maximum=220),
            key_scale=str(data.get("key_scale") or data.get("keyscale") or "").strip(),
            time_signature=str(data.get("time_signature") or data.get("timesignature") or "").strip(),
            vocal_language=str(data.get("vocal_language") or data.get("language") or "en").strip() or "en",
            voice_description=str(data.get("voice_description", "")).strip(),
            singer_plan=str(data.get("singer_plan") or data.get("voice_plan") or "").strip(),
            structure=str(data.get("structure", "")).strip(),
            era=str(data.get("era", "")).strip(),
            texture=str(data.get("texture", "")).strip(),
            alice_goal=str(data.get("alice_goal") or data.get("creative_goal") or "").strip(),
            hook_direction=str(data.get("hook_direction") or data.get("hook_focus") or "").strip(),
            chord_story=str(data.get("chord_story") or data.get("chord_direction") or "").strip(),
            dynamic_arc=str(data.get("dynamic_arc") or "").strip(),
            section_energy_map=str(data.get("section_energy_map") or data.get("energy_map") or "").strip(),
            orchestration_plan=str(data.get("orchestration_plan") or data.get("arrangement_notes") or "").strip(),
            transition_notes=str(data.get("transition_notes") or "").strip(),
            voicebox_plan=str(data.get("voicebox_plan") or "").strip(),
            voicebox_script=str(data.get("voicebox_script") or data.get("spoken_script") or "").strip(),
            production_notes=str(data.get("production_notes", "")).strip(),
            ai_used=True,
            ai_model=active_model,
            raw_text=candidate_text,
        )

    def adapt_lyrics_to_language(
        self,
        lyrics: str,
        *,
        target_language: str,
        model_name: str | None = None,
    ) -> str:
        self.ensure_server()
        active_model = model_name or self.default_model
        prompt = (
            "You adapt song lyrics for Astral Signals. "
            "Translate or rewrite the lyrics into the requested target language while keeping the same section tags, "
            "overall meaning, emotional tone, and singable structure. "
            "Preserve bracketed tags like [Verse] and [Chorus] exactly. "
            "If multiple target languages are listed, intentionally blend all of them in a natural singable way and do not collapse the output to only one language. "
            "Do not leave stray words, phrases, or full lines in any other language unless they are bracketed section tags. "
            "Never annotate the lyrics with parenthetical labels like (Japanese), (English), (Russian), or (Korean). "
            "Never mention language names, translation notes, analysis, or self-critique inside the lyric body. "
            "If the target language is Japanese, use natural Japanese script in the lyric lines and avoid English or romaji. "
            "Keep line breaks. Do not explain anything. Output only the adapted lyrics.\n\n"
            f"Target language request: {target_language}\n\n"
            "Lyrics:\n"
            f"{lyrics}"
        )
        adapted = self._generate_text(
            prompt,
            model_name=active_model,
            temperature=0.15,
            timeout=max(self.timeout, 420),
        )
        cleaned = _clean_lyric_output(adapted)
        if not cleaned:
            raise OllamaError("Ollama returned an empty lyric adaptation.")
        return cleaned

    def rewrite_multilingual_lyrics_naturally(
        self,
        lyrics: str,
        *,
        target_language: str,
        model_name: str | None = None,
    ) -> str:
        self.ensure_server()
        active_model = model_name or self.default_model
        prompt = (
            "You repair bad multilingual song lyrics for Astral Signals. "
            "The current draft has become a translation list or language parade. "
            "Rewrite it into one natural singable song that still uses every requested language somewhere in the lyrics. "
            "Do not translate the same line into multiple languages in sequence. "
            "Do not make a four-line block where each line says the same thing in a different language. "
            "Each lyric line should advance the song instead of repeating the same semantic line in another language. "
            "Keep section tags like [Verse], [Chorus], [Bridge], and [Outro]. "
            "Never annotate lines with labels like (Japanese), (English), (Russian), or (Korean). "
            "Do not explain anything. Output lyrics only.\n\n"
            f"Target language request: {target_language}\n\n"
            "Current lyrics:\n"
            f"{lyrics}"
        )
        rewritten = self._generate_text(
            prompt,
            model_name=active_model,
            temperature=0.2,
            timeout=max(self.timeout, 420),
        )
        cleaned = _clean_lyric_output(rewritten)
        if not cleaned:
            raise OllamaError("Ollama returned an empty multilingual rewrite.")
        return cleaned

    def rewrite_multilingual_section(
        self,
        section_text: str,
        *,
        target_language: str,
        focus_languages: list[str] | None = None,
        model_name: str | None = None,
    ) -> str:
        self.ensure_server()
        active_model = model_name or self.default_model
        focus_text = " + ".join(focus_languages or [])
        prompt = (
            "You rewrite one song section for Astral Signals as natural multilingual lyrics. "
            "Preserve the section tag exactly and keep roughly the same number of lyric lines. "
            "Use fluid code-switching that sounds like one real song, not a translation exercise. "
            "Do not translate the same line into multiple languages in sequence. "
            "Do not make a line-by-line language carousel. "
            "Most lines should use one language or a smooth phrase swap, not language labels or explanations. "
            "Every focus language must visibly appear somewhere in this section. "
            "If the section has two or more lyric lines, make sure the focus languages are distributed across them naturally. "
            "Never annotate lines with labels like (Japanese), (English), (Russian), or (Korean). "
            "Output lyrics only.\n\n"
            f"Song-wide requested language blend: {target_language}\n"
            f"Section focus languages: {focus_text or target_language}\n\n"
            "Section to rewrite:\n"
            f"{section_text}"
        )
        rewritten = self._generate_text(
            prompt,
            model_name=active_model,
            temperature=0.2,
            timeout=max(self.timeout, 300),
        )
        cleaned = _clean_lyric_output(rewritten)
        if not cleaned:
            raise OllamaError("Ollama returned an empty multilingual section rewrite.")
        return cleaned

    def adapt_lyric_line_to_language(
        self,
        line: str,
        *,
        target_language: str,
        model_name: str | None = None,
    ) -> str:
        self.ensure_server()
        active_model = model_name or self.default_model
        prompt = (
            "You repair a single song lyric line for Astral Signals. "
            "Translate the line into the requested target language while keeping the original meaning, emotional tone, "
            "and singable cadence. "
            "If the line already mostly matches the target language, only translate the stray foreign words or phrases. "
            "Return exactly one lyric line with no section tag, no explanation, and no surrounding quotes. "
            "Do not define words, do not annotate pronunciation, and do not add bullet points. "
            "If the target language is Japanese, use natural Japanese script and avoid English or romaji.\n\n"
            f"Target language: {target_language}\n"
            f"Lyric line: {line}"
        )
        adapted = self._generate_text(prompt, model_name=active_model, temperature=0.1)
        cleaned = _extract_first_lyric_line(_strip_think_blocks(adapted))
        if not cleaned:
            raise OllamaError("Ollama returned an empty repaired lyric line.")
        return cleaned

    def generate_lyrics(
        self,
        lyric_brief: dict[str, Any],
        *,
        model_name: str | None = None,
    ) -> str:
        self.ensure_server()
        active_model = model_name or self.default_model
        prompt = (
            "You write complete singable song lyrics for Astral Signals. "
            "Output lyrics only, with section tags like [Verse], [Chorus], [Bridge], and [Outro]. "
            "Do not explain anything. Do not return JSON. Do not add prose before or after the lyrics. "
            "If vocal_language is provided, the lyrics must be in that language. "
            "If multiple vocal languages are requested, the lyrics must intentionally use all requested languages in the actual lyric lines. "
            "When four languages are requested, all four must visibly appear somewhere in the finished lyrics. "
            "Do not collapse a multilingual request into only English or only one language. "
            "Never annotate lines with labels like (Japanese), (English), (Russian), or (Korean). "
            "Do not mention which language a line is using. "
            "Do not include planning notes, commentary, or critique. "
            "Keep the lyrics natural, singable, and emotionally coherent. "
            "Honor any provided title, genre, mood, instruments, structure, and voice direction.\n\n"
            f"Lyric brief JSON:\n{json.dumps(lyric_brief, indent=2, ensure_ascii=False)}"
        )
        generated = self._generate_text(
            prompt,
            model_name=active_model,
            temperature=0.35,
            timeout=max(self.timeout, 420),
        )
        cleaned = _clean_lyric_output(generated)
        if not cleaned:
            raise OllamaError("Ollama returned an empty lyric generation result.")
        return cleaned

    def _generate_text(
        self,
        prompt: str,
        *,
        model_name: str | None = None,
        temperature: float = 0.2,
        allow_thinking_fallback: bool = False,
        timeout: int | None = None,
        think: bool = False,
    ) -> str:
        active_model = model_name or self.default_model
        body = self._request_json(
            "POST",
            "/api/generate",
            {
                "model": active_model,
                "prompt": prompt,
                "stream": False,
                "think": think,
                "options": {
                    "temperature": temperature,
                    "top_p": 0.9,
                },
            },
            timeout=timeout,
        )
        response_text = str(body.get("response", "") or "").strip()
        thinking_text = str(body.get("thinking", "") or "").strip()
        if response_text:
            return response_text
        if allow_thinking_fallback:
            return thinking_text
        return ""

    def _build_prompt(self, user_brief: dict[str, Any]) -> str:
        variant_index = int(user_brief.get("compose_variant_index") or 1)
        variant_count = int(user_brief.get("compose_variant_count") or 1)
        variant_label = str(user_brief.get("compose_variant_label") or "").strip()
        variant_focus = str(user_brief.get("compose_variant_focus") or "").strip()
        multilingual_song = bool(user_brief.get("multilingual_song"))
        alice_enabled = bool(user_brief.get("alice_enabled"))
        voicebox_enabled = bool(user_brief.get("voicebox_enabled"))
        variant_instructions = ""
        if variant_count > 1:
            bits = [
                f"You are composing variant {variant_index} of {variant_count}",
                f"named {variant_label}" if variant_label else "",
                "from the same source brief",
            ]
            variant_instructions = " ".join(part for part in bits if part)
            variant_instructions += ". Make this take meaningfully different from its sibling variants in hook writing, lyric imagery, arrangement arc, and emotional framing while still honoring the same core brief. "
            if variant_focus:
                variant_instructions += f"Variant focus: {variant_focus}. "

        return (
            "You are the Astral Signals composer layer. "
            "Turn the user's rough music idea into a compact full-song plan for a local Suno-style workflow. "
            "Return valid JSON only with these keys: "
            "title, prompt_core, lyrics, genre, mood, instruments, tempo_bpm, key_scale, time_signature, "
            "vocal_language, voice_description, singer_plan, structure, era, texture, alice_goal, hook_direction, "
            "chord_story, dynamic_arc, section_energy_map, orchestration_plan, transition_notes, voicebox_plan, "
            "voicebox_script, production_notes. "
            "Rules: prompt_core should be 2-4 vivid sentences about the whole song arrangement, vocal tone, "
            "and production arc only. "
            "Do not mention JSON, analysis, or explanations. "
            "Respect any explicit user fields and only infer what is missing. "
            'If vocal_mode is instrumental, set lyrics to "[Instrumental]". '
            "If vocal_mode is wordless, write only vowel-based non-lexical lines with section tags. "
            "If vocal_mode is lyrics and the user did not supply lyrics, you must write complete singable lyrics "
            "with section tags and the lyrics field must not be blank. "
            "If vocal_language is provided, the lyrics must be written in that language and the vocal_language field must match it. "
            "If multiple vocal languages are requested, the lyrics must intentionally use that full language blend with natural code-switching or section-by-section swapping. "
            "Every requested language must visibly appear somewhere in the finished lyrics. "
            "Do not collapse a multilingual request into a single language. "
            "Do not turn the song into a translation list or language parade where the same line appears once in each language. "
            "Do not cycle mechanically through one language per line just to satisfy the blend. "
            "If singer_mode is single or singer_assignment_mode is lock_primary, keep one stable singer identity across all languages instead of changing the singer when the language changes. "
            "If singer_assignment_mode is manual_by_language, respect the provided singer roster and their language coverage in singer_plan. "
            "If singer_assignment_mode is composer_by_language, use singer_plan to assign different singers to languages or sections only when that helps the song, and keep each chosen singer identity stable once assigned. "
            "If singer_language_assignments are present, treat them as hard routing instructions for language ownership and make singer_plan match them. "
            "If singer_swap_direction is present, follow it directly so the singer changes happen on language boundaries instead of staying on one generic voice. "
            "singer_plan should be 1-3 concise sentences describing which singer handles which languages or sections. "
            "alice_goal should summarize the artistic mission in one sentence. "
            "hook_direction should be one concise sentence about how the chorus or melodic hook should land. "
            "chord_story should describe the harmony motion or emotional chord behavior in one sentence. "
            "dynamic_arc should describe how intensity rises and falls across the song in one sentence. "
            "section_energy_map should be a compact section-by-section energy guide like 'Verse 1 intimate, Chorus huge, Bridge suspended'. "
            "orchestration_plan should be 2-4 concise phrases covering arrangement, instrumentation layers, and production moments. "
            "transition_notes should describe risers, drops, handoffs, or scene changes in one concise sentence. "
            "If voicebox_enabled is true, voicebox_plan should explain where the spoken cue fits and voicebox_script should be 1-3 short spoken lines only, with no stage directions. "
            "If voicebox_enabled is false, leave voicebox_plan and voicebox_script blank. "
            "Never place voicebox lines, spoken-word placeholders, narration markers, or parenthetical cue labels inside the lyrics field. "
            "Never annotate lyric lines with labels like (Japanese), (English), (Russian), or (Korean). "
            "Never mention language names inside the lyrics. "
            "Never include planning notes, reasoning, critique, or explanations in the lyrics field. "
            "Do not leave mixed-language lyric lines or stray untranslated words unless the user explicitly asked for code-switching or a language blend. "
            "If the user already supplied lyrics and vocal_language differs from the current lyric language, translate or adapt the lyrics into the requested vocal_language while preserving section tags, meaning, and singability. "
            "If the user already supplied lyrics for a multilingual request, adapt them into a natural mixed-language version that uses all requested languages while preserving meaning and singability. "
            "If the user already supplied lyrics and they already match vocal_language, preserve the wording and only clean formatting lightly. "
            "Use song section tags like [Intro], [Verse], [Chorus], [Bridge], [Outro] when lyrics are present. "
            "Keep genre, mood, instruments, era, texture, voice_description, and structure concise. "
            "tempo_bpm must be an integer from 40 to 220 or null. "
            f"{'Alice autonomy is enabled, so feel free to make stronger arrangement, dynamic, and hook decisions while still respecting explicit user constraints. ' if alice_enabled else ''}"
            f"{'This song should include an optional Voicebox-spoken layer, so plan a short cue that can be cloned as speech. ' if voicebox_enabled else ''}"
            f"{'This request is explicitly multilingual. Make the language blend visible in the actual lyric lines. ' if multilingual_song else ''}"
            f"{variant_instructions}\n\n"
            f"User brief JSON:\n{json.dumps(user_brief, indent=2)}"
        )


ollama_client = OllamaClient()
