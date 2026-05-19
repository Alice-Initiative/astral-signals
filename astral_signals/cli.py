from __future__ import annotations

import argparse
import json

from astral_signals.config import settings
from astral_signals.pipeline import GenerationRequest, runtime


def add_shared_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--lyrics", default="")
    parser.add_argument("--genre", default="")
    parser.add_argument("--mood", default="")
    parser.add_argument("--instruments", default="")
    parser.add_argument("--tempo-bpm", type=int, default=None)
    parser.add_argument("--key-scale", default="")
    parser.add_argument("--time-signature", default="")
    parser.add_argument("--vocal-language", default="en")
    parser.add_argument("--voice", dest="voice_description", default="")
    parser.add_argument("--era", default="")
    parser.add_argument("--texture", default="")
    parser.add_argument("--title", default="")
    parser.add_argument(
        "--vocal-mode",
        choices=["lyrics", "instrumental", "wordless"],
        default="lyrics",
    )
    parser.add_argument("--ai-model", default=settings.ollama_model)
    parser.add_argument("--no-ai", action="store_true")
    parser.add_argument(
        "--thinking",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Use ACE-Step's 5Hz LM for more structured generation when available.",
    )
    parser.add_argument(
        "--use-format",
        action=argparse.BooleanOptionalAction,
        default=False,
        help="Let ACE-Step format caption and lyrics before generation.",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="astral-signals")
    subcommands = parser.add_subparsers(dest="command", required=True)

    compose_parser = subcommands.add_parser("compose", help="Build an AI-assisted song plan.")
    add_shared_arguments(compose_parser)

    generate_parser = subcommands.add_parser("generate", help="Generate local songs.")
    add_shared_arguments(generate_parser)
    generate_parser.add_argument(
        "--song-model",
        default=settings.ace_step_model,
        help="Song engine selection, e.g. acestep-v15-turbo, musicgen::facebook/musicgen-small, or songgeneration::songgeneration_base_new",
    )
    generate_parser.add_argument("--duration", type=int, default=60)
    generate_parser.add_argument("--candidates", type=int, default=1)
    generate_parser.add_argument("--seed", type=int, default=None)
    generate_parser.add_argument("--guidance-scale", type=float, default=1.0)
    generate_parser.add_argument("--inference-steps", type=int, default=8)
    generate_parser.add_argument(
        "--audio-format",
        choices=["wav", "mp3", "flac", "wav32", "aac", "opus"],
        default="wav",
    )

    subcommands.add_parser("system", help="Show runtime details.")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "system":
        print(json.dumps(runtime.system_status(), indent=2))
        return

    request = GenerationRequest(
        prompt=args.prompt,
        lyrics=args.lyrics,
        genre=args.genre,
        mood=args.mood,
        instruments=args.instruments,
        tempo_bpm=args.tempo_bpm,
        key_scale=args.key_scale,
        time_signature=args.time_signature,
        vocal_language=args.vocal_language,
        voice_description=args.voice_description,
        era=args.era,
        texture=args.texture,
        title=args.title,
        vocal_mode=args.vocal_mode,
        use_ai=not args.no_ai,
        ai_model=args.ai_model,
        thinking=args.thinking,
        use_format=args.use_format,
    )

    if args.command == "compose":
        print(json.dumps(runtime.compose_request(request), indent=2))
        return

    request.song_model = args.song_model
    request.duration = args.duration
    request.candidates = args.candidates
    request.seed = args.seed
    request.guidance_scale = args.guidance_scale
    request.inference_steps = args.inference_steps
    request.audio_format = args.audio_format

    result = runtime.generate_batch(request)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
