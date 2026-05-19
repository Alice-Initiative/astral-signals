from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from astral_signals.config import settings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Astral worker for SongGeneration / LeVo 2")
    parser.add_argument("--repo-dir", required=True)
    parser.add_argument("--ckpt-path", required=True)
    parser.add_argument("--input-jsonl", required=True)
    parser.add_argument("--save-dir", required=True)
    parser.add_argument("--idx", required=True)
    parser.add_argument(
        "--generate-type",
        default="mixed",
        choices=["mixed", "separate", "vocal", "bgm"],
    )
    parser.add_argument("--use-flash-attn", action="store_true")
    parser.add_argument("--low-mem", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_dir = Path(args.repo_dir).resolve()
    save_dir = Path(args.save_dir).resolve()
    generate_script = repo_dir / "generate.py"
    env = os.environ.copy()

    pythonpath_parts = [
        str(repo_dir / "codeclm" / "tokenizer"),
        str(repo_dir),
        str(repo_dir / "codeclm" / "tokenizer" / "Flow1dVAE"),
    ]
    existing_pythonpath = env.get("PYTHONPATH", "").strip()
    if existing_pythonpath:
        pythonpath_parts.append(existing_pythonpath)

    env.update(
        {
            "PYTHONDONTWRITEBYTECODE": "1",
            "TRANSFORMERS_CACHE": str(settings.cache_dir),
            "HF_HOME": str(settings.cache_dir),
            "HF_HUB_CACHE": str(settings.cache_dir),
            "OMP_NUM_THREADS": "1",
            "MKL_NUM_THREADS": "1",
            "CUDA_LAUNCH_BLOCKING": "0",
            "PYTHONPATH": os.pathsep.join(pythonpath_parts),
        }
    )

    command = [
        sys.executable,
        str(generate_script),
        "--ckpt_path",
        str(Path(args.ckpt_path).resolve()),
        "--input_jsonl",
        str(Path(args.input_jsonl).resolve()),
        "--save_dir",
        str(save_dir),
        "--generate_type",
        args.generate_type,
    ]
    if args.use_flash_attn:
        command.append("--use_flash_attn")
    if args.low_mem:
        command.append("--low_mem")

    result = subprocess.run(
        command,
        cwd=str(repo_dir),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        sys.stderr.write(result.stderr or "")
        sys.stdout.write(result.stdout or "")
        return result.returncode

    audio_dir = save_dir / "audios"
    stem = args.idx
    track_map = {
        "mixed": audio_dir / f"{stem}.flac",
        "vocals": audio_dir / f"{stem}_vocal.flac",
        "instrumental": audio_dir / f"{stem}_bgm.flac",
    }
    payload = {
        "sample_rate": 48000,
        "stdout": result.stdout.strip(),
        "tracks": {
            key: str(path)
            for key, path in track_map.items()
            if path.exists()
        },
    }
    print(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
