from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import math
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


@dataclass
class MixTrack:
    path: Path
    label: str
    role: str
    gain_db: float = 0.0
    pan: float = 0.0
    mute: bool = False
    solo: bool = False
    start_seconds: float = 0.0
    trim_in_seconds: float = 0.0
    trim_out_seconds: float = 0.0
    fade_in_seconds: float = 0.0
    fade_out_seconds: float = 0.0


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

    def mix_assist(
        self,
        *,
        tracks: list[dict[str, Any]],
        title: str = "",
    ) -> dict[str, Any]:
        prepared = [self._coerce_mix_track(track, index) for index, track in enumerate(tracks)]
        if not prepared:
            raise AudioToolsError("Add at least one track before asking Alice to shape the mix.")

        suggestions = [self._suggest_mix_track(track, index) for index, track in enumerate(prepared)]
        center_count = sum(1 for item in suggestions if abs(item.pan) < 10)
        wide_count = sum(1 for item in suggestions if abs(item.pan) >= 18)

        return {
            "title": title.strip() or "Mix Lab session",
            "summary": (
                f"Alice Mix Assist centered {center_count} anchor track"
                f"{'' if center_count == 1 else 's'} and widened {wide_count} support layer"
                f"{'' if wide_count == 1 else 's'} so the lead stays clear while the arrangement opens around it."
            ),
            "tracks": [self._serialize_mix_track(track) for track in suggestions],
        }

    def inspect_mix_track(
        self,
        *,
        audio_path: str,
        label: str = "",
        role: str = "",
    ) -> dict[str, Any]:
        path = self._resolve_audio_path(audio_path)
        samples, sample_rate = self._load_audio(path)
        resolved_role = self._infer_mix_role(explicit_role=role.strip(), label=label.strip(), path=path)
        peak = float(np.max(np.abs(samples))) if samples.size else 0.0
        return {
            "path": str(path),
            "label": label.strip() or path.stem,
            "role": resolved_role,
            "duration_seconds": round(samples.shape[0] / float(sample_rate), 2),
            "sample_rate": int(sample_rate),
            "channels": int(samples.shape[1] if samples.ndim > 1 else 1),
            "peak": round(peak, 4),
        }

    def render_mix_session(
        self,
        *,
        tracks: list[dict[str, Any]],
        title: str = "",
        normalize_output: bool = True,
    ) -> dict[str, Any]:
        prepared = [self._coerce_mix_track(track, index) for index, track in enumerate(tracks)]
        if not prepared:
            raise AudioToolsError("Add at least one track to Mix Lab before bouncing the session.")

        active_tracks = [track for track in prepared if not track.mute]
        if any(track.solo for track in prepared):
            active_tracks = [track for track in active_tracks if track.solo]

        if not active_tracks:
            raise AudioToolsError("No active tracks remain. Turn off mute or choose at least one solo track.")

        sample_rates: list[int] = []
        loaded_tracks: list[tuple[MixTrack, torch.Tensor, int]] = []
        for track in active_tracks:
            samples, sample_rate = self._load_audio(track.path)
            sample_rates.append(sample_rate)
            loaded_tracks.append((track, torch.from_numpy(samples.T.copy()), sample_rate))

        target_sample_rate = max(sample_rates) if sample_rates else TARGET_STEM_SAMPLE_RATE
        staged_tracks: list[dict[str, Any]] = []
        target_length = 0

        for track, waveform, sample_rate in loaded_tracks:
            if sample_rate != target_sample_rate:
                waveform = F.resample(waveform, sample_rate, target_sample_rate)
                sample_rate = target_sample_rate

            waveform = self._trim_waveform(track=track, waveform=waveform, sample_rate=sample_rate)
            waveform = self._apply_fades(track=track, waveform=waveform, sample_rate=sample_rate)
            waveform = self._apply_pan_and_gain(waveform, gain_db=track.gain_db, pan=track.pan)

            offset_frames = max(0, int(round(track.start_seconds * sample_rate)))
            target_length = max(target_length, offset_frames + waveform.shape[-1])
            staged_tracks.append(
                {
                    "track": track,
                    "waveform": waveform,
                    "offset_frames": offset_frames,
                }
            )

        mixed = torch.zeros(2, target_length, dtype=torch.float32)
        for item in staged_tracks:
            waveform = item["waveform"]
            start = item["offset_frames"]
            end = start + waveform.shape[-1]
            mixed[:, start:end] += waveform

        peak_before = float(mixed.abs().max().item()) if mixed.numel() else 0.0
        normalize_applied = False
        if normalize_output and peak_before > 1e-6:
            ceiling = 0.98
            if peak_before > ceiling:
                mixed = mixed / peak_before * ceiling
                normalize_applied = True
        elif peak_before > 0.995:
            mixed = mixed / peak_before * 0.995

        peak_after = float(mixed.abs().max().item()) if mixed.numel() else 0.0

        label = title.strip() or "mix-lab-session"
        job_dir = self._create_output_dir("mixlab", label)
        output_path = job_dir / "mixdown.wav"
        sf.write(output_path, mixed.transpose(0, 1).cpu().numpy(), target_sample_rate, subtype="FLOAT")

        mix_tracks = [item["track"] for item in staged_tracks]
        return {
            "job_dir": str(job_dir),
            "path": str(output_path),
            "url": _path_to_url(output_path),
            "sample_rate": target_sample_rate,
            "duration_seconds": round(target_length / float(target_sample_rate), 2),
            "normalize_output": normalize_output,
            "normalize_applied": normalize_applied,
            "peak_before": round(peak_before, 4),
            "peak_after": round(peak_after, 4),
            "track_count": len(prepared),
            "active_track_count": len(mix_tracks),
            "summary": self._mix_session_summary(mix_tracks, normalize_applied),
            "tracks": [self._serialize_mix_track(track) for track in mix_tracks],
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
            relative = Path(value.removeprefix("/outputs/"))
            value = str(settings.output_dir.joinpath(*relative.parts))
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

    def _coerce_mix_track(self, payload: dict[str, Any], index: int) -> MixTrack:
        path = self._resolve_audio_path(str(payload.get("path", "")))
        label = str(payload.get("label", "")).strip() or path.stem or f"Track {index + 1}"
        role = self._infer_mix_role(
            explicit_role=str(payload.get("role", "")).strip(),
            label=label,
            path=path,
        )
        return MixTrack(
            path=path,
            label=label,
            role=role,
            gain_db=self._clamp_number(payload.get("gain_db"), -24.0, 24.0),
            pan=self._clamp_number(payload.get("pan"), -100.0, 100.0),
            mute=bool(payload.get("mute", False)),
            solo=bool(payload.get("solo", False)),
            start_seconds=self._clamp_number(payload.get("start_seconds"), 0.0, 1200.0),
            trim_in_seconds=self._clamp_number(payload.get("trim_in_seconds"), 0.0, 1200.0),
            trim_out_seconds=self._clamp_number(payload.get("trim_out_seconds"), 0.0, 1200.0),
            fade_in_seconds=self._clamp_number(payload.get("fade_in_seconds"), 0.0, 30.0),
            fade_out_seconds=self._clamp_number(payload.get("fade_out_seconds"), 0.0, 30.0),
        )

    def _clamp_number(self, value: Any, minimum: float, maximum: float) -> float:
        try:
            parsed = float(value)
        except (TypeError, ValueError):
            parsed = minimum if minimum > 0 else 0.0
        return max(minimum, min(maximum, parsed))

    def _infer_mix_role(self, *, explicit_role: str, label: str, path: Path) -> str:
        if explicit_role and explicit_role != "auto":
            return explicit_role

        value = f"{label} {path.stem}".lower()
        if any(token in value for token in ("lead vocal", "vocals", "vocal", "lead")):
            return "vocals"
        if any(token in value for token in ("harmony", "harm", "backing vocal", "backing")):
            return "harmony"
        if any(token in value for token in ("double", "adlib", "ad-lib")):
            return "doubles"
        if "drum" in value or "kick" in value or "snare" in value:
            return "drums"
        if "bass" in value or "sub" in value:
            return "bass"
        if "pad" in value:
            return "pad"
        if "fx" in value or "sfx" in value or "effect" in value:
            return "fx"
        if "ambience" in value or "atmo" in value or "atmos" in value:
            return "ambience"
        if "guitar" in value:
            return "guitar"
        if "piano" in value or "keys" in value:
            return "piano"
        if "synth" in value or "arp" in value:
            return "synth"
        if "melody" in value or "hook" in value:
            return "melody"
        if "spoken" in value or "narrat" in value:
            return "spoken"
        if "instrumental" in value or "music" in value or "mix" in value:
            return "instrumental"
        return "other"

    def _suggest_mix_track(self, track: MixTrack, index: int) -> MixTrack:
        role = track.role
        direction = -1 if index % 2 == 0 else 1
        overrides: dict[str, float] = {
            "gain_db": 0.0,
            "pan": 0.0,
            "fade_in_seconds": track.fade_in_seconds,
            "fade_out_seconds": track.fade_out_seconds,
        }

        if role in {"vocals", "spoken"}:
            overrides["gain_db"] = 1.5 if role == "vocals" else -0.5
            overrides["pan"] = 0.0
        elif role in {"harmony", "doubles"}:
            overrides["gain_db"] = -2.5 if role == "harmony" else -3.2
            overrides["pan"] = 28.0 * direction
        elif role == "drums":
            overrides["gain_db"] = -1.5
            overrides["pan"] = 0.0
        elif role == "bass":
            overrides["gain_db"] = -2.5
            overrides["pan"] = 0.0
        elif role in {"instrumental", "piano", "guitar"}:
            overrides["gain_db"] = -3.5
            overrides["pan"] = 0.0 if role == "instrumental" else 12.0 * direction
        elif role in {"synth", "melody"}:
            overrides["gain_db"] = -2.0 if role == "melody" else -3.0
            overrides["pan"] = 14.0 * direction
        elif role in {"pad", "ambience"}:
            overrides["gain_db"] = -5.5 if role == "pad" else -7.0
            overrides["pan"] = 24.0 * direction
        elif role == "fx":
            overrides["gain_db"] = -7.5
            overrides["pan"] = 36.0 * direction
            overrides["fade_in_seconds"] = max(track.fade_in_seconds, 0.08)
            overrides["fade_out_seconds"] = max(track.fade_out_seconds, 0.12)
        else:
            overrides["gain_db"] = -3.0
            overrides["pan"] = 8.0 * direction

        track.gain_db = round(overrides["gain_db"], 2)
        track.pan = round(overrides["pan"], 2)
        track.fade_in_seconds = round(float(overrides["fade_in_seconds"]), 2)
        track.fade_out_seconds = round(float(overrides["fade_out_seconds"]), 2)
        return track

    def _trim_waveform(
        self,
        *,
        track: MixTrack,
        waveform: torch.Tensor,
        sample_rate: int,
    ) -> torch.Tensor:
        start = int(round(track.trim_in_seconds * sample_rate))
        end = waveform.shape[-1] - int(round(track.trim_out_seconds * sample_rate))
        end = max(start + 1, end)
        trimmed = waveform[:, start:end]
        if trimmed.shape[-1] <= 1:
            raise AudioToolsError(
                f"{track.label} trimmed down to silence. Reduce trim-in or trim-out before bouncing the mix."
            )
        return trimmed

    def _apply_fades(
        self,
        *,
        track: MixTrack,
        waveform: torch.Tensor,
        sample_rate: int,
    ) -> torch.Tensor:
        total_frames = waveform.shape[-1]
        if total_frames <= 1:
            return waveform

        fade_in_frames = min(total_frames, int(round(track.fade_in_seconds * sample_rate)))
        fade_out_frames = min(total_frames, int(round(track.fade_out_seconds * sample_rate)))

        if fade_in_frames > 1:
            waveform[:, :fade_in_frames] *= torch.linspace(0.0, 1.0, fade_in_frames, dtype=waveform.dtype)
        if fade_out_frames > 1:
            waveform[:, -fade_out_frames:] *= torch.linspace(1.0, 0.0, fade_out_frames, dtype=waveform.dtype)

        return waveform

    def _apply_pan_and_gain(
        self,
        waveform: torch.Tensor,
        *,
        gain_db: float,
        pan: float,
    ) -> torch.Tensor:
        gain = _db_to_gain(gain_db)
        pan_norm = max(-1.0, min(1.0, pan / 100.0))
        angle = (pan_norm + 1.0) * (math.pi / 4.0)
        left_gain = math.cos(angle)
        right_gain = math.sin(angle)
        stereo = waveform.clone()
        stereo[0] *= gain * left_gain
        stereo[1] *= gain * right_gain
        return stereo

    def _serialize_mix_track(self, track: MixTrack) -> dict[str, Any]:
        return {
            "path": str(track.path),
            "label": track.label,
            "role": track.role,
            "gain_db": round(track.gain_db, 2),
            "pan": round(track.pan, 2),
            "mute": track.mute,
            "solo": track.solo,
            "start_seconds": round(track.start_seconds, 3),
            "trim_in_seconds": round(track.trim_in_seconds, 3),
            "trim_out_seconds": round(track.trim_out_seconds, 3),
            "fade_in_seconds": round(track.fade_in_seconds, 3),
            "fade_out_seconds": round(track.fade_out_seconds, 3),
        }

    def _mix_session_summary(self, tracks: list[MixTrack], normalize_applied: bool) -> str:
        roles = [track.role for track in tracks]
        lead_count = sum(1 for role in roles if role in {"vocals", "spoken"})
        support_count = sum(1 for role in roles if role in {"harmony", "doubles", "pad", "fx", "ambience"})
        low_end_count = sum(1 for role in roles if role in {"bass", "drums"})
        bits = [
            f"{len(tracks)} active track{'' if len(tracks) == 1 else 's'}",
            f"{lead_count} lead-focused layer{'' if lead_count == 1 else 's'}",
            f"{support_count} support texture{'' if support_count == 1 else 's'}",
            f"{low_end_count} rhythm or low-end anchor{'' if low_end_count == 1 else 's'}",
        ]
        summary = "Mix Lab bounced a session with " + ", ".join(bits) + "."
        if normalize_applied:
            summary += " A safety normalize pass kept the bounce from clipping."
        return summary

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
