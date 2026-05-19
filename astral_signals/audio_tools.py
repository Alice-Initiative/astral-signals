from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import re
from typing import Any

import numpy as np
from scipy.signal import find_peaks
import soundfile as sf
import torch
import torchaudio
import torchaudio.functional as F

from astral_signals.config import settings

TARGET_STEM_SAMPLE_RATE = 44100


class AudioToolsError(RuntimeError):
    """Raised when local audio tools cannot complete a request."""


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower())
    return slug.strip("-") or "audio-job"


def _db_to_gain(value: float) -> float:
    return float(10 ** (value / 20.0))


def _coerce_stereo(samples: np.ndarray) -> np.ndarray:
    if samples.ndim == 1:
        samples = np.stack([samples, samples], axis=1)
    if samples.shape[1] == 1:
        samples = np.repeat(samples, 2, axis=1)
    if samples.shape[1] > 2:
        samples = samples[:, :2]
    return samples.astype(np.float32, copy=False)


def _parse_time_signature(value: str) -> int:
    match = re.match(r"^\s*(\d+)\s*/\s*(\d+)\s*$", value or "")
    if not match:
        return 4
    return max(1, min(12, int(match.group(1))))


def _path_to_url(path: Path) -> str:
    try:
        relative = path.relative_to(settings.output_dir)
    except ValueError:
        return ""
    return "/outputs/" + "/".join(relative.parts)


def _line_weight(value: str) -> float:
    words = max(1, len(re.findall(r"[A-Za-z0-9']+", value)))
    characters = max(1, len(value.strip()))
    return words * 0.95 + characters / 42.0


@dataclass
class LyricsSection:
    label: str
    lines: list[str]


class AudioTools:
    def __init__(self) -> None:
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._stem_model: torch.nn.Module | None = None
        self._stem_sources: list[str] = []

    def status(self) -> dict[str, Any]:
        return {
            "available": True,
            "device": self.device,
            "drafts_dir": str(settings.drafts_dir),
            "analysis_dir": str(settings.analysis_dir),
            "stem_model_ready": self._stem_model is not None,
            "stem_sample_rate": TARGET_STEM_SAMPLE_RATE,
        }

    def separate_mix(
        self,
        *,
        audio_path: str,
        title: str = "",
        chunk_seconds: int = 12,
        overlap_seconds: float = 1.0,
    ) -> dict[str, Any]:
        input_path = self._resolve_audio_path(audio_path)
        samples, sample_rate = self._load_audio(input_path)
        waveform = torch.from_numpy(samples.T.copy())
        if sample_rate != TARGET_STEM_SAMPLE_RATE:
            waveform = F.resample(waveform, sample_rate, TARGET_STEM_SAMPLE_RATE)

        model = self._get_stem_model()
        separated = self._separate_in_chunks(
            waveform,
            model=model,
            chunk_seconds=chunk_seconds,
            overlap_seconds=overlap_seconds,
            sample_rate=TARGET_STEM_SAMPLE_RATE,
        )

        if sample_rate != TARGET_STEM_SAMPLE_RATE:
            separated = F.resample(
                separated.reshape(-1, separated.shape[-1]),
                TARGET_STEM_SAMPLE_RATE,
                sample_rate,
            ).reshape(separated.shape[0], separated.shape[1], -1)

        stem_map = {
            source: separated[index].transpose(0, 1).numpy()
            for index, source in enumerate(self._stem_sources)
        }
        instrumental = stem_map["drums"] + stem_map["bass"] + stem_map["other"]
        label = title.strip() or input_path.stem
        job_dir = self._create_output_dir("stems", label)

        stem_files: dict[str, dict[str, str]] = {}
        for source, stem_audio in stem_map.items():
            stem_path = job_dir / f"{source}.wav"
            sf.write(stem_path, stem_audio, sample_rate, subtype="FLOAT")
            stem_files[source] = {
                "path": str(stem_path),
                "url": _path_to_url(stem_path),
            }

        vocals_path = job_dir / "vocals.wav"
        instrumental_path = job_dir / "instrumental.wav"
        sf.write(vocals_path, stem_map["vocals"], sample_rate, subtype="FLOAT")
        sf.write(instrumental_path, instrumental, sample_rate, subtype="FLOAT")

        return {
            "job_dir": str(job_dir),
            "input_path": str(input_path),
            "vocals": {"path": str(vocals_path), "url": _path_to_url(vocals_path)},
            "instrumental": {
                "path": str(instrumental_path),
                "url": _path_to_url(instrumental_path),
            },
            "stems": stem_files,
            "sample_rate": sample_rate,
            "duration_seconds": round(samples.shape[0] / float(sample_rate), 2),
        }

    def remix_stems(
        self,
        *,
        vocals_path: str,
        instrumental_path: str,
        vocals_gain_db: float = 0.0,
        instrumental_gain_db: float = 0.0,
        title: str = "",
    ) -> dict[str, Any]:
        vocals_file = self._resolve_audio_path(vocals_path)
        instrumental_file = self._resolve_audio_path(instrumental_path)

        vocals, vocals_sr = self._load_audio(vocals_file)
        instrumental, instrumental_sr = self._load_audio(instrumental_file)

        vocals_tensor = torch.from_numpy(vocals.T.copy())
        instrumental_tensor = torch.from_numpy(instrumental.T.copy())
        if vocals_sr != instrumental_sr:
            instrumental_tensor = F.resample(instrumental_tensor, instrumental_sr, vocals_sr)
            instrumental_sr = vocals_sr

        target_length = max(vocals_tensor.shape[-1], instrumental_tensor.shape[-1])
        vocals_tensor = self._pad_to_length(vocals_tensor, target_length)
        instrumental_tensor = self._pad_to_length(instrumental_tensor, target_length)

        mixed = (
            vocals_tensor * _db_to_gain(vocals_gain_db)
            + instrumental_tensor * _db_to_gain(instrumental_gain_db)
        )

        peak = float(mixed.abs().max().item()) if mixed.numel() else 0.0
        if peak > 0.99:
            mixed = mixed / peak * 0.99

        label = title.strip() or f"{vocals_file.stem}-remix"
        job_dir = self._create_output_dir("remix", label)
        output_path = job_dir / "remixed-song.wav"
        sf.write(output_path, mixed.transpose(0, 1).cpu().numpy(), vocals_sr, subtype="FLOAT")

        return {
            "job_dir": str(job_dir),
            "path": str(output_path),
            "url": _path_to_url(output_path),
            "sample_rate": vocals_sr,
            "duration_seconds": round(target_length / float(vocals_sr), 2),
            "vocals_gain_db": vocals_gain_db,
            "instrumental_gain_db": instrumental_gain_db,
        }

    def match_lyrics_to_audio(
        self,
        *,
        lyrics: str,
        audio_path: str,
        tempo_bpm: int | None = None,
        time_signature: str = "",
        mode: str = "lyrics_to_audio",
    ) -> dict[str, Any]:
        input_path = self._resolve_audio_path(audio_path)
        samples, sample_rate = self._load_audio(input_path)
        duration_seconds = samples.shape[0] / float(sample_rate)
        beats_per_bar = _parse_time_signature(time_signature)
        sections = self._parse_sections(lyrics)
        energy_curve = self._energy_curve(samples, sample_rate)
        candidate_times = self._boundary_candidates(energy_curve["times"], energy_curve["energy"])

        if sections:
            section_map, line_map = self._align_sections(
                sections=sections,
                duration_seconds=duration_seconds,
                boundary_candidates=candidate_times,
                tempo_bpm=tempo_bpm,
                beats_per_bar=beats_per_bar,
            )
            summary = self._alignment_summary(
                sections=section_map,
                line_map=line_map,
                duration_seconds=duration_seconds,
                tempo_bpm=tempo_bpm,
                mode=mode,
            )
        else:
            section_map = self._infer_sections_from_audio(
                duration_seconds=duration_seconds,
                candidate_times=candidate_times,
                energy=energy_curve["energy"],
            )
            line_map = []
            summary = (
                "No lyrics were provided, so Astral mapped the arrangement from the audio energy arc and "
                "suggested likely verse and chorus zones."
            )

        return {
            "audio_path": str(input_path),
            "duration_seconds": round(duration_seconds, 2),
            "tempo_bpm": tempo_bpm,
            "time_signature": time_signature or "4/4",
            "mode": mode,
            "summary": summary,
            "sections": section_map,
            "lines": line_map,
            "energy_peaks": [round(value, 2) for value in candidate_times[:18]],
        }

    def _resolve_audio_path(self, audio_path: str) -> Path:
        value = (audio_path or "").strip()
        if not value:
            raise AudioToolsError("Audio path is required.")
        if value.startswith("/outputs/"):
            value = str(settings.output_dir / value.removeprefix("/outputs/").replace("/", "\\"))
        path = Path(value)
        if not path.exists():
            raise AudioToolsError(f"Audio file not found: {path}")
        return path

    def _load_audio(self, path: Path) -> tuple[np.ndarray, int]:
        try:
            samples, sample_rate = sf.read(path, always_2d=True, dtype="float32")
        except RuntimeError as exc:
            raise AudioToolsError(f"Could not read audio file: {path}") from exc
        return _coerce_stereo(samples), int(sample_rate)

    def _get_stem_model(self) -> torch.nn.Module:
        if self._stem_model is None:
            bundle = torchaudio.pipelines.HDEMUCS_HIGH_MUSDB
            model = bundle.get_model().to(self.device)
            model.eval()
            self._stem_model = model
            self._stem_sources = list(getattr(model, "sources", ["drums", "bass", "other", "vocals"]))
        return self._stem_model

    def _separate_in_chunks(
        self,
        waveform: torch.Tensor,
        *,
        model: torch.nn.Module,
        chunk_seconds: int,
        overlap_seconds: float,
        sample_rate: int,
    ) -> torch.Tensor:
        total_frames = waveform.shape[-1]
        chunk_frames = max(sample_rate * 6, int(chunk_seconds * sample_rate))
        overlap_frames = int(max(0.25, overlap_seconds) * sample_rate)

        if total_frames <= chunk_frames:
            with torch.inference_mode():
                return model(waveform.unsqueeze(0).to(self.device))[0].detach().cpu()

        step = max(sample_rate, chunk_frames - (overlap_frames * 2))
        source_count = len(self._stem_sources)
        output = torch.zeros(source_count, waveform.shape[0], total_frames, dtype=torch.float32)
        weights = torch.zeros(1, 1, total_frames, dtype=torch.float32)

        for start in range(0, total_frames, step):
            end = min(total_frames, start + chunk_frames)
            is_first = start == 0
            is_last = end >= total_frames
            chunk = waveform[:, start:end]
            valid_length = chunk.shape[-1]
            if valid_length < chunk_frames:
                chunk = torch.nn.functional.pad(chunk, (0, chunk_frames - valid_length))

            with torch.inference_mode():
                predicted = model(chunk.unsqueeze(0).to(self.device))[0].detach().cpu()[:, :, :valid_length]

            weight = torch.ones(valid_length, dtype=torch.float32)
            fade = min(overlap_frames, max(0, valid_length // 2))
            if fade > 1 and not is_first:
                weight[:fade] = torch.linspace(0.0, 1.0, fade)
            if fade > 1 and not is_last:
                weight[-fade:] = torch.linspace(1.0, 0.0, fade)

            output[:, :, start:end] += predicted * weight.view(1, 1, -1)
            weights[:, :, start:end] += weight.view(1, 1, -1)

            if is_last:
                break

        return output / weights.clamp_min(1e-6)

    def _pad_to_length(self, waveform: torch.Tensor, target_length: int) -> torch.Tensor:
        if waveform.shape[-1] >= target_length:
            return waveform[:, :target_length]
        return torch.nn.functional.pad(waveform, (0, target_length - waveform.shape[-1]))

    def _create_output_dir(self, prefix: str, label: str) -> Path:
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        output_dir = settings.output_dir / f"{timestamp}-{prefix}-{_slugify(label)[:48]}"
        output_dir.mkdir(parents=True, exist_ok=True)
        return output_dir

    def _parse_sections(self, lyrics: str) -> list[LyricsSection]:
        lines = [line.rstrip() for line in lyrics.splitlines()]
        sections: list[LyricsSection] = []
        current_label = "Verse"
        current_lines: list[str] = []

        for raw_line in lines:
            line = raw_line.strip()
            if not line:
                continue
            tag_match = re.fullmatch(r"\[(.+?)\]", line)
            if tag_match:
                if current_lines:
                    sections.append(LyricsSection(label=current_label, lines=current_lines))
                current_label = tag_match.group(1).strip() or "Section"
                current_lines = []
                continue
            current_lines.append(line)

        if current_lines:
            sections.append(LyricsSection(label=current_label, lines=current_lines))

        return sections

    def _energy_curve(self, samples: np.ndarray, sample_rate: int) -> dict[str, np.ndarray]:
        mono = np.mean(np.abs(samples), axis=1)
        frame_length = min(max(2048, sample_rate // 8), max(2048, len(mono)))
        hop_length = max(512, frame_length // 4)
        if len(mono) <= frame_length:
            energy = np.array([float(np.sqrt(np.mean(np.square(mono))) + 1e-8)], dtype=np.float32)
            times = np.array([len(mono) / (2 * sample_rate)], dtype=np.float32)
            return {"times": times, "energy": energy}

        values: list[float] = []
        centers: list[float] = []
        for start in range(0, len(mono) - frame_length + 1, hop_length):
            frame = mono[start : start + frame_length]
            values.append(float(np.sqrt(np.mean(np.square(frame))) + 1e-8))
            centers.append((start + frame_length / 2) / sample_rate)

        energy = np.asarray(values, dtype=np.float32)
        smooth_width = max(3, min(21, len(energy) // 12 or 3))
        kernel = np.ones(smooth_width, dtype=np.float32) / smooth_width
        smoothed = np.convolve(energy, kernel, mode="same")
        return {"times": np.asarray(centers, dtype=np.float32), "energy": smoothed}

    def _boundary_candidates(self, times: np.ndarray, energy: np.ndarray) -> list[float]:
        if len(times) < 4:
            return [float(value) for value in times]
        novelty = np.abs(np.diff(energy, prepend=energy[0]))
        distance = max(1, len(novelty) // 10)
        prominence = float(np.percentile(novelty, 72)) if len(novelty) > 4 else float(np.max(novelty))
        peaks, _ = find_peaks(novelty, distance=distance, prominence=max(1e-6, prominence / 2))
        return [float(times[index]) for index in peaks]

    def _align_sections(
        self,
        *,
        sections: list[LyricsSection],
        duration_seconds: float,
        boundary_candidates: list[float],
        tempo_bpm: int | None,
        beats_per_bar: int,
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        weights = [sum(_line_weight(line) for line in section.lines) + 1.0 for section in sections]
        total_weight = sum(weights) or float(len(sections))
        boundaries = [0.0]
        elapsed = 0.0

        for index, weight in enumerate(weights[:-1], start=1):
            elapsed += duration_seconds * (weight / total_weight)
            snapped = self._snap_boundary(elapsed, boundary_candidates, tempo_bpm, beats_per_bar)
            previous = boundaries[-1]
            minimum_gap = max(4.0, duration_seconds * 0.06)
            boundaries.append(max(previous + minimum_gap, min(duration_seconds - minimum_gap, snapped)))

        boundaries.append(duration_seconds)
        boundaries = sorted(boundaries)

        section_map: list[dict[str, Any]] = []
        line_map: list[dict[str, Any]] = []
        for index, section in enumerate(sections):
            start = boundaries[index]
            end = boundaries[index + 1]
            bar_seconds = (60.0 / tempo_bpm) * beats_per_bar if tempo_bpm else None
            bars = round((end - start) / bar_seconds, 1) if bar_seconds else None
            section_map.append(
                {
                    "label": section.label,
                    "start_seconds": round(start, 2),
                    "end_seconds": round(end, 2),
                    "bars": bars,
                    "line_count": len(section.lines),
                }
            )

            line_weights = [_line_weight(line) for line in section.lines] or [1.0]
            line_total = sum(line_weights) or float(len(line_weights))
            cursor = start
            for line, weight in zip(section.lines, line_weights):
                span = (end - start) * (weight / line_total)
                line_end = min(end, cursor + span)
                line_map.append(
                    {
                        "section": section.label,
                        "line": line,
                        "start_seconds": round(cursor, 2),
                        "end_seconds": round(line_end, 2),
                    }
                )
                cursor = line_end

        return section_map, line_map

    def _snap_boundary(
        self,
        target_seconds: float,
        boundary_candidates: list[float],
        tempo_bpm: int | None,
        beats_per_bar: int,
    ) -> float:
        snapped = target_seconds
        if boundary_candidates:
            nearest = min(boundary_candidates, key=lambda value: abs(value - target_seconds))
            if abs(nearest - target_seconds) <= max(4.0, target_seconds * 0.15):
                snapped = nearest

        if tempo_bpm:
            bar_seconds = (60.0 / tempo_bpm) * beats_per_bar
            snapped = round(snapped / bar_seconds) * bar_seconds

        return max(0.0, snapped)

    def _alignment_summary(
        self,
        *,
        sections: list[dict[str, Any]],
        line_map: list[dict[str, Any]],
        duration_seconds: float,
        tempo_bpm: int | None,
        mode: str,
    ) -> str:
        total_lines = max(1, len(line_map))
        words = sum(len(re.findall(r"[A-Za-z0-9']+", str(item["line"]))) for item in line_map)
        words_per_second = words / max(1.0, duration_seconds)
        density = "airy" if words_per_second < 1.9 else "balanced" if words_per_second < 3.0 else "dense"
        chorus_sections = [item for item in sections if "chorus" in str(item["label"]).lower()]
        chorus_hint = (
            f" Chorus zones span about {sum(item['end_seconds'] - item['start_seconds'] for item in chorus_sections):.1f}s."
            if chorus_sections
            else ""
        )
        bpm_hint = f" At {tempo_bpm} BPM, the map is bar-aligned." if tempo_bpm else ""
        if mode == "audio_to_lyrics":
            return (
                f"The audio arc suggests a {density} topline. Astral mapped {total_lines} lyric lines onto the "
                f"arrangement so you can rewrite around the instrumental energy.{chorus_hint}{bpm_hint}"
            )
        return (
            f"The lyric map feels {density} for this arrangement. Astral aligned {total_lines} lines across "
            f"{len(sections)} song sections so you can check whether the words sit naturally on the music.{chorus_hint}{bpm_hint}"
        )

    def _infer_sections_from_audio(
        self,
        *,
        duration_seconds: float,
        candidate_times: list[float],
        energy: np.ndarray,
    ) -> list[dict[str, Any]]:
        boundaries = [0.0]
        filtered = [value for value in candidate_times if 4.0 <= value <= max(4.0, duration_seconds - 4.0)]
        boundaries.extend(filtered[:4])
        boundaries.append(duration_seconds)
        boundaries = sorted(set(round(value, 2) for value in boundaries))
        while len(boundaries) < 5:
            boundaries.insert(-1, round(duration_seconds * (len(boundaries) - 1) / 4, 2))
            boundaries = sorted(set(boundaries))

        labels = ["Intro", "Verse", "Chorus", "Bridge", "Outro", "Final Chorus"]
        sections: list[dict[str, Any]] = []
        for index in range(len(boundaries) - 1):
            label = labels[min(index, len(labels) - 1)]
            start = boundaries[index]
            end = boundaries[index + 1]
            sections.append(
                {
                    "label": label,
                    "start_seconds": round(start, 2),
                    "end_seconds": round(end, 2),
                    "bars": None,
                    "line_count": 0,
                }
            )
        return sections


audio_tools = AudioTools()
