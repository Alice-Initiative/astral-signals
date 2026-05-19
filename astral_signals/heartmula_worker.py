from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch

from heartlib import HeartMuLaGenPipeline


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-path", required=True)
    parser.add_argument("--version", default="3B")
    parser.add_argument("--lyrics", required=True)
    parser.add_argument("--tags", required=True)
    parser.add_argument("--save-path", required=True)
    parser.add_argument("--max-audio-length-ms", type=int, default=120_000)
    parser.add_argument("--topk", type=int, default=50)
    parser.add_argument("--temperature", type=float, default=1.0)
    parser.add_argument("--cfg-scale", type=float, default=1.5)
    parser.add_argument("--lazy-load", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    save_path = Path(args.save_path)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    torch.set_float32_matmul_precision("high")

    print("HeartMuLa worker: loading pipeline.", flush=True)

    pipe = HeartMuLaGenPipeline.from_pretrained(
        args.model_path,
        device={
            "mula": torch.device("cuda" if torch.cuda.is_available() else "cpu"),
            "codec": torch.device("cuda" if torch.cuda.is_available() else "cpu"),
        },
        dtype={
            "mula": torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            "codec": torch.float32,
        },
        version=args.version,
        lazy_load=args.lazy_load,
    )
    print("HeartMuLa worker: pipeline ready.", flush=True)
    with torch.no_grad():
        print("HeartMuLa worker: generation started.", flush=True)
        pipe(
            {"lyrics": args.lyrics, "tags": args.tags},
            max_audio_length_ms=args.max_audio_length_ms,
            save_path=str(save_path),
            topk=args.topk,
            temperature=args.temperature,
            cfg_scale=args.cfg_scale,
        )
    print("HeartMuLa worker: generation finished.", flush=True)

    print(
        json.dumps(
            {
                "path": str(save_path),
                "sample_rate": 48000,
                "version": args.version,
            }
        )
    )


if __name__ == "__main__":
    main()
