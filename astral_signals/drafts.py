from __future__ import annotations

from datetime import datetime
import json
from pathlib import Path
import re
from typing import Any

from astral_signals.config import settings


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower())
    return slug.strip("-") or "draft"


class DraftStore:
    def __init__(self, root_dir: Path) -> None:
        self.root_dir = root_dir
        self.root_dir.mkdir(parents=True, exist_ok=True)

    def _path_for(self, draft_id: str) -> Path:
        return self.root_dir / f"{draft_id}.json"

    def list_drafts(self) -> list[dict[str, Any]]:
        records: list[dict[str, Any]] = []
        for path in sorted(self.root_dir.glob("*.json"), reverse=True):
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                continue

            records.append(
                {
                    "id": str(payload.get("id", path.stem)),
                    "name": str(payload.get("name", path.stem)),
                    "updated_at": str(payload.get("updated_at", "")),
                    "created_at": str(payload.get("created_at", "")),
                    "title": str(payload.get("payload", {}).get("title", "")),
                    "prompt_preview": str(payload.get("payload", {}).get("prompt", ""))[:140],
                }
            )
        return records

    def load_draft(self, draft_id: str) -> dict[str, Any]:
        path = self._path_for(draft_id)
        if not path.exists():
            raise FileNotFoundError(f"Draft not found: {draft_id}")
        return json.loads(path.read_text(encoding="utf-8"))

    def save_draft(
        self,
        *,
        name: str,
        payload: dict[str, Any],
        draft_id: str | None = None,
    ) -> dict[str, Any]:
        existing = None
        resolved_id = draft_id or f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{_slugify(name)[:48]}"
        path = self._path_for(resolved_id)
        if path.exists():
            existing = json.loads(path.read_text(encoding="utf-8"))

        now = datetime.now().isoformat(timespec="seconds")
        record = {
            "id": resolved_id,
            "name": name.strip() or "Untitled Draft",
            "created_at": (existing or {}).get("created_at", now),
            "updated_at": now,
            "payload": payload,
        }
        path.write_text(json.dumps(record, indent=2), encoding="utf-8")
        return record

    def delete_draft(self, draft_id: str) -> None:
        path = self._path_for(draft_id)
        if path.exists():
            path.unlink()


draft_store = DraftStore(settings.drafts_dir)
