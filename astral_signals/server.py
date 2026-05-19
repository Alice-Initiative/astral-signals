from __future__ import annotations

from pathlib import Path
from typing import Literal

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from astral_signals.config import settings
from astral_signals.drafts import draft_store
from astral_signals.audio_tools import AudioToolsError, audio_tools
from astral_signals.pipeline import AstralPipelineError, GenerationRequest, runtime
from astral_signals.voicebox import VoiceboxError


class SingerPayload(BaseModel):
    singer_id: str = Field(min_length=1, max_length=40)
    name: str = Field(default="", max_length=120)
    enabled: bool = True
    role: str = Field(default="", max_length=80)
    languages: str = Field(default="", max_length=120)
    all_languages: bool = False
    voice_description: str = Field(default="", max_length=1200)
    clone_profile_id: str = Field(default="", max_length=160)
    clone_profile_name: str = Field(default="", max_length=160)
    voice_preset: str = Field(default="", max_length=120)
    voice_gender: str = Field(default="", max_length=80)
    voice_tone: str = Field(default="", max_length=120)
    voice_register: str = Field(default="", max_length=120)
    harmony_style: str = Field(default="", max_length=120)
    voice_notes: str = Field(default="", max_length=800)
    breathiness: int = Field(default=50, ge=0, le=100)
    brightness: int = Field(default=50, ge=0, le=100)
    vocal_power: int = Field(default=50, ge=0, le=100)
    vibrato: int = Field(default=35, ge=0, le=100)
    intimacy: int = Field(default=55, ge=0, le=100)


class GeneratePayload(BaseModel):
    prompt: str = Field(min_length=3, max_length=6000)
    lyrics: str = Field(default="", max_length=16000)
    genre: str = Field(default="", max_length=240)
    mood: str = Field(default="", max_length=240)
    instruments: str = Field(default="", max_length=400)
    tempo_bpm: int | None = Field(default=None, ge=40, le=220)
    key_scale: str = Field(default="", max_length=120)
    time_signature: str = Field(default="", max_length=40)
    vocal_language: str = Field(default="en", max_length=120)
    voice_description: str = Field(default="", max_length=1200)
    voice_clone_profile_id: str = Field(default="", max_length=160)
    voice_clone_profile_name: str = Field(default="", max_length=160)
    voice_preset: str = Field(default="", max_length=120)
    voice_gender: str = Field(default="", max_length=80)
    voice_tone: str = Field(default="", max_length=120)
    voice_register: str = Field(default="", max_length=120)
    harmony_style: str = Field(default="", max_length=120)
    voice_notes: str = Field(default="", max_length=800)
    breathiness: int = Field(default=50, ge=0, le=100)
    brightness: int = Field(default=50, ge=0, le=100)
    vocal_power: int = Field(default=50, ge=0, le=100)
    vibrato: int = Field(default=35, ge=0, le=100)
    intimacy: int = Field(default=55, ge=0, le=100)
    era: str = Field(default="", max_length=240)
    texture: str = Field(default="", max_length=400)
    title: str = Field(default="", max_length=200)
    duration: int = Field(default=60, ge=10, le=240)
    candidates: int = Field(default=1, ge=1, le=2)
    seed: int | None = Field(default=None, ge=1, le=2_147_483_647)
    guidance_scale: float = Field(default=1.0, ge=0.5, le=10.0)
    vocal_mode: Literal["lyrics", "instrumental", "wordless"] = "lyrics"
    use_ai: bool = True
    ai_model: str = Field(default="", max_length=120)
    thinking: bool = True
    use_format: bool = False
    song_model: str = Field(default="", max_length=160)
    inference_steps: int = Field(default=8, ge=4, le=40)
    audio_format: Literal["wav", "mp3", "flac", "wav32", "aac", "opus"] = "wav"
    preview_text: str = Field(default="", max_length=600)
    preview_duration: int = Field(default=12, ge=10, le=20)
    compose_variants: int = Field(default=1, ge=1, le=4)
    alice_enabled: bool = False
    alice_autonomy: int = Field(default=72, ge=0, le=100)
    alice_goal: str = Field(default="", max_length=1200)
    hook_direction: str = Field(default="", max_length=1200)
    chord_story: str = Field(default="", max_length=1200)
    dynamic_arc: str = Field(default="", max_length=1200)
    section_energy_map: str = Field(default="", max_length=1600)
    orchestration_plan: str = Field(default="", max_length=2000)
    transition_notes: str = Field(default="", max_length=1200)
    voicebox_enabled: bool = False
    voicebox_profile_id: str = Field(default="", max_length=160)
    voicebox_profile_name: str = Field(default="", max_length=160)
    voicebox_language: str = Field(default="", max_length=120)
    voicebox_role: str = Field(default="", max_length=160)
    voicebox_text: str = Field(default="", max_length=2000)
    voicebox_auto_script: bool = True
    primary_singer_name: str = Field(default="", max_length=120)
    primary_singer_role: str = Field(default="lead", max_length=80)
    primary_singer_languages: str = Field(default="", max_length=120)
    primary_singer_all_languages: bool = True
    singer_mode: Literal["single", "multiple"] = "single"
    singer_assignment_mode: Literal["lock_primary", "manual_by_language", "composer_by_language"] = "lock_primary"
    preview_singer_id: str = Field(default="primary", max_length=40)
    singers: list[SingerPayload] = Field(default_factory=list)


class DraftSavePayload(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    draft_id: str | None = Field(default=None, max_length=160)
    payload: GeneratePayload


class StemSplitPayload(BaseModel):
    audio_path: str = Field(min_length=3, max_length=4000)
    title: str = Field(default="", max_length=200)


class StemRemixPayload(BaseModel):
    vocals_path: str = Field(min_length=3, max_length=4000)
    instrumental_path: str = Field(min_length=3, max_length=4000)
    vocals_gain_db: float = Field(default=0.0, ge=-18.0, le=18.0)
    instrumental_gain_db: float = Field(default=0.0, ge=-18.0, le=18.0)
    title: str = Field(default="", max_length=200)


class AlignmentPayload(BaseModel):
    audio_path: str = Field(min_length=3, max_length=4000)
    lyrics: str = Field(default="", max_length=16000)
    tempo_bpm: int | None = Field(default=None, ge=40, le=220)
    time_signature: str = Field(default="", max_length=40)
    mode: Literal["lyrics_to_audio", "audio_to_lyrics"] = "lyrics_to_audio"


class VoiceCloneProfilePayload(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    language: str = Field(default="en", max_length=40)
    sample_audio_path: str = Field(default="", max_length=4000)
    reference_text: str = Field(default="", max_length=2000)
    default_engine: str = Field(default="", max_length=60)
    personality: str = Field(default="", max_length=2000)


class VoiceCloneSamplePayload(BaseModel):
    sample_audio_path: str = Field(min_length=3, max_length=4000)
    reference_text: str = Field(min_length=1, max_length=2000)


class VoiceClonePreviewPayload(BaseModel):
    profile_id: str = Field(min_length=1, max_length=160)
    text: str = Field(min_length=1, max_length=2000)
    language: str = Field(default="en", max_length=40)
    engine: str = Field(default="", max_length=60)
    title: str = Field(default="", max_length=200)


app = FastAPI(title="Astral Signals")
app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")
app.mount("/outputs", StaticFiles(directory=settings.output_dir), name="outputs")


@app.middleware("http")
async def disable_browser_cache(request: Request, call_next):
    response = await call_next(request)
    if request.url.path == "/" or request.url.path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/system")
def system() -> dict[str, object]:
    return runtime.system_status()


@app.get("/api/catalog")
def catalog() -> dict[str, object]:
    return runtime.app_catalog()


@app.get("/api/drafts")
def list_drafts() -> dict[str, object]:
    return {"drafts": draft_store.list_drafts()}


@app.get("/api/drafts/{draft_id}")
def load_draft(draft_id: str) -> dict[str, object]:
    try:
        return draft_store.load_draft(draft_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/drafts")
def save_draft(payload: DraftSavePayload) -> dict[str, object]:
    return draft_store.save_draft(
        name=payload.name,
        draft_id=payload.draft_id,
        payload=payload.payload.model_dump(),
    )


@app.delete("/api/drafts/{draft_id}")
def delete_draft(draft_id: str) -> dict[str, bool]:
    draft_store.delete_draft(draft_id)
    return {"ok": True}


@app.post("/api/generate")
async def generate(payload: GeneratePayload) -> dict[str, object]:
    request = GenerationRequest(**payload.model_dump())
    try:
        return await run_in_threadpool(runtime.generate_batch, request)
    except AstralPipelineError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/generate-compare")
async def generate_compare(payload: GeneratePayload) -> dict[str, object]:
    request = GenerationRequest(**payload.model_dump())
    try:
        return await run_in_threadpool(runtime.generate_compare_batch, request)
    except AstralPipelineError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/compose")
async def compose(payload: GeneratePayload) -> dict[str, object]:
    request = GenerationRequest(**payload.model_dump())
    try:
        return await run_in_threadpool(runtime.compose_request, request)
    except AstralPipelineError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/compose-batch")
async def compose_batch(payload: GeneratePayload) -> dict[str, object]:
    request = GenerationRequest(**payload.model_dump())
    try:
        return await run_in_threadpool(runtime.compose_batch_request, request)
    except AstralPipelineError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/voice-preview")
async def voice_preview(payload: GeneratePayload) -> dict[str, object]:
    request = GenerationRequest(**payload.model_dump())
    try:
        return await run_in_threadpool(runtime.preview_voice, request)
    except AstralPipelineError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/alice-voicebox-preview")
async def alice_voicebox_preview(payload: GeneratePayload) -> dict[str, object]:
    request = GenerationRequest(**payload.model_dump())
    try:
        return await run_in_threadpool(runtime.preview_alice_voicebox, request)
    except (AstralPipelineError, VoiceboxError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/voice-clone/profiles")
async def list_voice_clone_profiles() -> dict[str, object]:
    try:
        profiles = await run_in_threadpool(runtime.list_voice_clone_profiles)
        return {"profiles": profiles}
    except VoiceboxError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/voice-clone/profiles")
async def create_voice_clone_profile(payload: VoiceCloneProfilePayload) -> dict[str, object]:
    try:
        return await run_in_threadpool(
            runtime.create_voice_clone_profile,
            name=payload.name,
            description=payload.description,
            language=payload.language,
            sample_audio_path=payload.sample_audio_path,
            reference_text=payload.reference_text,
            default_engine=payload.default_engine,
            personality=payload.personality,
        )
    except VoiceboxError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/voice-clone/profiles/{profile_id}/samples")
async def add_voice_clone_sample(profile_id: str, payload: VoiceCloneSamplePayload) -> dict[str, object]:
    try:
        return await run_in_threadpool(
            runtime.add_voice_clone_sample,
            profile_id=profile_id,
            sample_audio_path=payload.sample_audio_path,
            reference_text=payload.reference_text,
        )
    except VoiceboxError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/voice-clone/preview")
async def preview_cloned_voice(payload: VoiceClonePreviewPayload) -> dict[str, object]:
    try:
        return await run_in_threadpool(
            runtime.preview_cloned_voice,
            profile_id=payload.profile_id,
            text=payload.text,
            language=payload.language,
            engine=payload.engine,
            title=payload.title,
        )
    except VoiceboxError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/stems/separate")
async def separate_stems(payload: StemSplitPayload) -> dict[str, object]:
    try:
        return await run_in_threadpool(
            audio_tools.separate_mix,
            audio_path=payload.audio_path,
            title=payload.title,
        )
    except AudioToolsError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/stems/remix")
async def remix_stems(payload: StemRemixPayload) -> dict[str, object]:
    try:
        return await run_in_threadpool(
            audio_tools.remix_stems,
            vocals_path=payload.vocals_path,
            instrumental_path=payload.instrumental_path,
            vocals_gain_db=payload.vocals_gain_db,
            instrumental_gain_db=payload.instrumental_gain_db,
            title=payload.title,
        )
    except AudioToolsError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/alignment")
async def align_arrangement(payload: AlignmentPayload) -> dict[str, object]:
    try:
        return await run_in_threadpool(
            audio_tools.match_lyrics_to_audio,
            audio_path=payload.audio_path,
            lyrics=payload.lyrics,
            tempo_bpm=payload.tempo_bpm,
            time_signature=payload.time_signature,
            mode=payload.mode,
        )
    except AudioToolsError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/")
def index() -> FileResponse:
    return FileResponse(Path(settings.static_dir) / "index.html")


def main() -> None:
    uvicorn.run(
        "astral_signals.server:app",
        host=settings.host,
        port=settings.port,
        reload=False,
    )


if __name__ == "__main__":
    main()
