from __future__ import annotations

import re

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from astral_signals.config import settings

NLLB_LANGUAGE_CODES: dict[str, str] = {
    "en": "eng_Latn",
    "ja": "jpn_Jpan",
    "ko": "kor_Hang",
    "ru": "rus_Cyrl",
    "es": "spa_Latn",
    "fr": "fra_Latn",
    "de": "deu_Latn",
    "it": "ita_Latn",
    "pt": "por_Latn",
    "zh": "zho_Hans",
}


class TranslationError(RuntimeError):
    """Raised when the local translation runtime cannot satisfy a request."""


def _clean_translation_text(value: str) -> str:
    text = (value or "").strip().strip('"').strip("'")
    text = text.replace("\r", " ").replace("\n", " ")
    text = re.sub(r"\s+([,;:.!?])", r"\1", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


class MultilingualClient:
    def __init__(self) -> None:
        self.model_id = settings.translation_model
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._tokenizer = None
        self._model = None

    def supports_language(self, language_code: str) -> bool:
        return language_code in NLLB_LANGUAGE_CODES

    def supports_languages(self, language_codes: list[str]) -> bool:
        return bool(language_codes) and all(self.supports_language(code) for code in language_codes)

    def status(self) -> dict[str, object]:
        return {
            "available": True,
            "model": self.model_id,
            "device": self.device,
            "loaded": self._model is not None,
            "supported_languages": sorted(NLLB_LANGUAGE_CODES),
        }

    def release(self) -> None:
        self._model = None
        self._tokenizer = None
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    def translate_text(
        self,
        text: str,
        *,
        source_language: str,
        target_language: str,
        max_new_tokens: int = 128,
    ) -> str:
        source = source_language.strip().lower()
        target = target_language.strip().lower()
        cleaned = _clean_translation_text(text)
        if not cleaned or source == target:
            return cleaned
        if not self.supports_languages([source, target]):
            raise TranslationError(f"Astral cannot translate {source} -> {target} with the local multilingual engine.")

        self._ensure_model()
        tokenizer = self._tokenizer
        model = self._model
        if tokenizer is None or model is None:
            raise TranslationError("Astral could not load the local multilingual engine.")

        try:
            tokenizer.src_lang = NLLB_LANGUAGE_CODES[source]
            encoded = tokenizer(cleaned, return_tensors="pt", truncation=True, max_length=256)
            encoded = {key: value.to(self.device) for key, value in encoded.items()}
            forced_bos_token_id = tokenizer.convert_tokens_to_ids(NLLB_LANGUAGE_CODES[target])
            with torch.inference_mode():
                generated = model.generate(
                    **encoded,
                    forced_bos_token_id=forced_bos_token_id,
                    max_new_tokens=max(24, max_new_tokens),
                    num_beams=4,
                    no_repeat_ngram_size=3,
                    repetition_penalty=1.05,
                )
            decoded = tokenizer.batch_decode(generated, skip_special_tokens=True)[0]
            translated = _clean_translation_text(decoded)
            if not translated:
                raise TranslationError(f"Astral received an empty translation for {source} -> {target}.")
            return translated
        except RuntimeError as exc:
            if "out of memory" in str(exc).lower() and self.device == "cuda":
                self.release()
                self.device = "cpu"
                return self.translate_text(
                    cleaned,
                    source_language=source,
                    target_language=target,
                    max_new_tokens=max_new_tokens,
                )
            raise TranslationError(f"Astral could not translate {source} -> {target}: {exc}") from exc

    def _ensure_model(self) -> None:
        if self._tokenizer is not None and self._model is not None:
            return

        model_kwargs = {}
        if self.device == "cuda":
            model_kwargs["dtype"] = torch.float16

        try:
            self._tokenizer = AutoTokenizer.from_pretrained(self.model_id)
            self._model = AutoModelForSeq2SeqLM.from_pretrained(self.model_id, **model_kwargs)
            self._model.to(self.device)
            self._model.eval()
        except Exception as exc:  # noqa: BLE001
            self.release()
            raise TranslationError(f"Astral could not load the multilingual model {self.model_id}: {exc}") from exc


multilingual_client = MultilingualClient()
