from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import time
from typing import Any
from urllib import error, parse, request
from datetime import datetime

from astral_signals.config import settings

POLL_INTERVAL_SECONDS = 2.0


class AceStepError(RuntimeError):
    """Raised when the local ACE-Step runtime cannot complete a request."""


class AceStepQueueStuckError(AceStepError):
    """Raised when a submitted task never leaves the backend queue."""


def _creation_flags() -> int:
    flags = 0
    if hasattr(subprocess, "CREATE_NO_WINDOW"):
        flags |= subprocess.CREATE_NO_WINDOW
    if hasattr(subprocess, "DETACHED_PROCESS"):
        flags |= subprocess.DETACHED_PROCESS
    return flags


class AceStepClient:
    def __init__(self) -> None:
        self.base_url = settings.ace_step_host
        self.repo_dir = settings.ace_step_repo
        self.api_binary = settings.ace_step_api_binary
        self.checkpoints_dir = settings.ace_step_checkpoints_dir
        self.default_model = settings.ace_step_model
        self.default_lm_model = settings.ace_step_lm_model
        self.timeout = settings.ace_step_timeout_seconds
        self.startup_timeout = settings.ace_step_startup_timeout_seconds
        self.queue_patience = settings.ace_step_queue_patience_seconds
        self.log_dir = settings.logs_dir
        self.output_dir = settings.output_dir

    def _request_json(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        *,
        timeout: int = 30,
    ) -> dict[str, Any]:
        data = None
        headers = {"Content-Type": "application/json"}
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")

        req = request.Request(f"{self.base_url}{path}", data=data, headers=headers, method=method)
        try:
            with request.urlopen(req, timeout=timeout) as response:
                body = response.read().decode("utf-8")
                return json.loads(body) if body else {}
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise AceStepError(f"ACE-Step returned HTTP {exc.code}: {detail}") from exc
        except error.URLError as exc:
            raise AceStepError(f"Could not reach ACE-Step at {self.base_url}: {exc.reason}") from exc
        except TimeoutError as exc:
            raise AceStepError(f"ACE-Step timed out after {timeout}s.") from exc
        except OSError as exc:
            raise AceStepError(f"Could not communicate with ACE-Step at {self.base_url}: {exc}") from exc

    def _health_payload(self) -> dict[str, Any] | None:
        try:
            return self._request_json("GET", "/health", timeout=3)
        except Exception:
            return None

    def _stats_payload(self) -> dict[str, Any] | None:
        try:
            return self._request_json("GET", "/v1/stats", timeout=5)
        except Exception:
            return None

    def _listening_server_pids(self) -> list[int]:
        parsed = parse.urlparse(self.base_url)
        host = (parsed.hostname or "127.0.0.1").lower()
        port = parsed.port or 8001
        try:
            completed = subprocess.run(
                ["netstat", "-ano", "-p", "tcp"],
                capture_output=True,
                text=True,
                timeout=10,
                check=False,
            )
        except Exception:
            return []

        pids: list[int] = []
        port_suffix = f":{port}"
        for raw_line in completed.stdout.splitlines():
            line = raw_line.strip()
            if not line or "LISTENING" not in line.upper():
                continue
            parts = line.split()
            if len(parts) < 5:
                continue
            local_address = parts[1].lower()
            state = parts[3].upper()
            if state != "LISTENING":
                continue
            if not local_address.endswith(port_suffix):
                continue
            if host not in {"0.0.0.0", "::", "::1"}:
                local_host = local_address.rsplit(":", 1)[0].strip("[]")
                if local_host not in {host, "0.0.0.0", "::", "::1"}:
                    continue
            try:
                pid = int(parts[-1])
            except ValueError:
                continue
            if pid not in pids:
                pids.append(pid)
        return pids

    def stop_server(self) -> None:
        pids = self._listening_server_pids()
        if not pids:
            return

        for pid in pids:
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/T", "/F"],
                capture_output=True,
                text=True,
                timeout=20,
                creationflags=_creation_flags(),
                check=False,
            )

        deadline = time.time() + 30
        while time.time() < deadline:
            if self._health_payload() is None:
                return
            time.sleep(1)

    def restart_server(self, requested_lm_model: str | None = None) -> None:
        self.stop_server()
        self.ensure_server(requested_lm_model=requested_lm_model)

    def _active_manifest_records(self) -> list[dict[str, Any]]:
        active_records: list[dict[str, Any]] = []
        for manifest_path in sorted(self.output_dir.glob("*/manifest.json"), key=lambda path: path.stat().st_mtime, reverse=True):
            try:
                payload = json.loads(manifest_path.read_text(encoding="utf-8"))
            except Exception:
                continue

            status = str(payload.get("status", "")).strip().lower()
            if status not in {"pending", "running"}:
                continue

            timeout_seconds = int(payload.get("timeout_seconds", self.timeout) or self.timeout)
            submitted_at_raw = (
                str(payload.get("submitted_at", "")).strip()
                or str(payload.get("failed_at", "")).strip()
                or str(payload.get("completed_at", "")).strip()
            )
            started_at = None
            if submitted_at_raw:
                try:
                    started_at = datetime.fromisoformat(submitted_at_raw)
                except ValueError:
                    started_at = None
            if started_at is None:
                started_at = datetime.fromtimestamp(manifest_path.stat().st_mtime)

            age_seconds = max(0.0, time.time() - started_at.timestamp())
            if age_seconds <= timeout_seconds + 600:
                active_records.append(
                    {
                        "path": str(manifest_path),
                        "title": str(payload.get("title", "")).strip() or manifest_path.parent.name,
                        "task_id": str(payload.get("task_id", "")).strip(),
                        "status": status,
                        "age_seconds": age_seconds,
                        "timeout_seconds": timeout_seconds,
                    }
                )
        return active_records

    def _ensure_queue_ready(self, requested_lm_model: str | None = None) -> None:
        stats_payload = self._stats_payload()
        if not stats_payload:
            return

        data = stats_payload.get("data", {}) or {}
        job_stats = data.get("jobs", {}) or {}
        active_jobs = int(job_stats.get("queued", 0) or 0) + int(job_stats.get("running", 0) or 0)
        queue_size = int(data.get("queue_size", 0) or 0)
        if active_jobs <= 0 and queue_size <= 0:
            return

        active_manifests = self._active_manifest_records()
        if active_manifests:
            titles = ", ".join(record["title"] for record in active_manifests[:3])
            raise AceStepError(
                "ACE-Step already has an active Astral render in progress. "
                f"Wait for it to finish or clear it before starting another song. Active session(s): {titles}"
            )

        self.restart_server(requested_lm_model=requested_lm_model)

    def ensure_server(self, requested_lm_model: str | None = None) -> None:
        requested_model = (requested_lm_model or "").strip() or self.default_lm_model
        health_payload = self._health_payload()
        if health_payload is not None:
            health_data = health_payload.get("data", {}) or {}
            loaded_lm_model = str(health_data.get("loaded_lm_model", "") or "").strip()
            if loaded_lm_model and loaded_lm_model != requested_model:
                self.restart_server(requested_lm_model=requested_model)
            return

        if not self.repo_dir.exists():
            raise AceStepError(f"ACE-Step repo not found at {self.repo_dir}.")
        if not self.api_binary.exists():
            raise AceStepError(f"ACE-Step API binary not found at {self.api_binary}.")

        parsed = parse.urlparse(self.base_url)
        host = parsed.hostname or "127.0.0.1"
        port = parsed.port or 8001

        env = os.environ.copy()
        env["ACESTEP_CHECKPOINTS_DIR"] = str(self.checkpoints_dir)
        env["ACESTEP_CONFIG_PATH"] = self.default_model
        env["ACESTEP_LM_MODEL_PATH"] = requested_model
        env["ACESTEP_LM_BACKEND"] = env.get("ACESTEP_LM_BACKEND", "vllm")
        env["ACESTEP_INIT_LLM"] = env.get("ACESTEP_INIT_LLM", "auto")
        env["ACESTEP_NO_INIT"] = "true"
        env["ACESTEP_TASK_TIMEOUT_SECONDS"] = str(settings.ace_step_server_timeout_seconds)
        env["ACESTEP_API_HOST"] = host
        env["ACESTEP_API_PORT"] = str(port)

        stdout_log = self.log_dir / "ace-step-api.log"
        stderr_log = self.log_dir / "ace-step-api.err.log"
        command = [
            str(self.api_binary),
            "--host",
            host,
            "--port",
            str(port),
            "--lm-model-path",
            requested_model,
            "--no-init",
        ]

        with stdout_log.open("ab") as stdout_stream, stderr_log.open("ab") as stderr_stream:
            subprocess.Popen(
                command,
                cwd=str(self.repo_dir),
                env=env,
                stdout=stdout_stream,
                stderr=stderr_stream,
                creationflags=_creation_flags(),
            )

        deadline = time.time() + self.startup_timeout
        while time.time() < deadline:
            if self._health_payload() is not None:
                return
            time.sleep(1)

        raise AceStepError(
            f"Astral Signals could not start its ACE-Step song server within {self.startup_timeout}s."
        )

    def status(self) -> dict[str, Any]:
        health_payload = self._health_payload()
        return {
            "available": self.repo_dir.exists() and self.api_binary.exists(),
            "running": health_payload is not None,
            "host": self.base_url,
            "repo_dir": str(self.repo_dir),
            "api_binary": str(self.api_binary),
            "checkpoints_dir": str(self.checkpoints_dir),
            "default_model": self.default_model,
            "default_lm_model": self.default_lm_model,
            "health": (health_payload or {}).get("data", {}),
        }

    def list_models(self) -> list[dict[str, Any]]:
        self.ensure_server()
        payload = self._request_json("GET", "/v1/models", timeout=20)
        items = payload.get("data", [])
        models: list[dict[str, Any]] = []
        if not isinstance(items, list):
            return models
        for item in items:
            if not isinstance(item, dict):
                continue
            models.append(
                {
                    "id": str(item.get("id", "")).strip(),
                    "name": str(item.get("name", "")).strip(),
                    "description": str(item.get("description", "")).strip(),
                    "input_modalities": item.get("input_modalities", []) or [],
                    "output_modalities": item.get("output_modalities", []) or [],
                    "context_length": int(item.get("context_length", 0) or 0),
                }
            )
        return [model for model in models if model["id"]]

    def query_task(self, task_id: str) -> dict[str, Any]:
        payload = self._request_json("POST", "/query_result", {"task_id_list": [task_id]}, timeout=60)
        items = payload.get("data", [])
        if isinstance(items, list) and items:
            return items[0]
        return {"task_id": task_id, "status": 0, "result": "[]", "progress_text": ""}

    def decode_audio_path(self, file_url: str) -> str:
        if not file_url:
            return ""
        parsed = parse.urlparse(file_url)
        if parsed.path != "/v1/audio":
            return ""
        encoded_path = parse.parse_qs(parsed.query).get("path", [""])[0]
        return parse.unquote(encoded_path)

    def _parse_records(self, result_raw: str) -> list[dict[str, Any]]:
        try:
            data = json.loads(result_raw or "[]")
        except json.JSONDecodeError as exc:
            raise AceStepError(f"ACE-Step returned malformed result JSON: {result_raw}") from exc

        if not isinstance(data, list):
            raise AceStepError(f"ACE-Step returned an unexpected result payload: {data}")

        records: list[dict[str, Any]] = []
        for index, item in enumerate(data, start=1):
            if not isinstance(item, dict):
                continue
            file_url = str(item.get("file", "")).strip()
            records.append(
                {
                    "candidate": index,
                    "file_url": file_url,
                    "audio_path": self.decode_audio_path(file_url),
                    "prompt": str(item.get("prompt", "")).strip(),
                    "lyrics": str(item.get("lyrics", "")).strip(),
                    "metas": item.get("metas", {}) or {},
                    "error": str(item.get("error", "")).strip(),
                }
            )
        return records

    def _failure_message(self, item: dict[str, Any]) -> str:
        try:
            parsed = self._parse_records(str(item.get("result", "[]")))
        except AceStepError:
            parsed = []

        for record in parsed:
            if record.get("error"):
                return str(record["error"])

        progress_text = str(item.get("progress_text", "")).strip()
        if progress_text:
            return progress_text
        return "ACE-Step generation failed. The backend may have stalled or hit its server-side task timeout."

    def start_song_generation(self, payload: dict[str, Any]) -> str:
        requested_lm_model = str(payload.get("lm_model_path", "") or "").strip() or None
        self.ensure_server(requested_lm_model=requested_lm_model)
        self._ensure_queue_ready(requested_lm_model=requested_lm_model)
        response = self._request_json("POST", "/release_task", payload, timeout=300)
        data = response.get("data", {})
        task_id = str(data.get("task_id", "")).strip()
        if not task_id:
            raise AceStepError(f"ACE-Step did not return a task id: {response}")
        return task_id

    def wait_for_song(
        self,
        task_id: str,
        *,
        timeout_seconds: int | None = None,
    ) -> dict[str, Any]:
        deadline = time.time() + (timeout_seconds or self.timeout)
        last_progress_text = ""
        queued_since = time.time()
        while time.time() < deadline:
            item = self.query_task(task_id)
            status = int(item.get("status", 0))
            progress_text = str(item.get("progress_text", "")).strip()
            if progress_text:
                last_progress_text = progress_text
            try:
                result_data = json.loads(str(item.get("result", "[]")) or "[]")
            except json.JSONDecodeError:
                result_data = []

            stage = ""
            progress_value = 0.0
            if isinstance(result_data, list) and result_data and isinstance(result_data[0], dict):
                stage = str(result_data[0].get("stage", "")).strip().lower()
                try:
                    progress_value = float(result_data[0].get("progress", 0.0) or 0.0)
                except (TypeError, ValueError):
                    progress_value = 0.0

            if status == 1:
                records = self._parse_records(str(item.get("result", "[]")))
                return {
                    "task_id": task_id,
                    "records": records,
                    "progress_text": progress_text,
                }
            if status == 2:
                raise AceStepError(self._failure_message(item))
            if stage == "queued" and progress_value <= 0.0:
                if time.time() - queued_since > self.queue_patience:
                    raise AceStepQueueStuckError(
                        f"ACE-Step task stayed queued for more than {self.queue_patience}s. "
                        f"Task id: {task_id}."
                    )
            else:
                queued_since = time.time()
            time.sleep(POLL_INTERVAL_SECONDS)

        progress_suffix = f" Last progress: {last_progress_text}" if last_progress_text else ""
        raise AceStepError(
            f"ACE-Step job timed out after {timeout_seconds or self.timeout}s. Task id: {task_id}.{progress_suffix}"
        )

    def generate_song(
        self,
        payload: dict[str, Any],
        *,
        timeout_seconds: int | None = None,
    ) -> dict[str, Any]:
        task_id = self.start_song_generation(payload)
        return self.wait_for_song(task_id, timeout_seconds=timeout_seconds)

    def download_audio(self, file_url: str, destination: Path) -> None:
        absolute_url = file_url if file_url.startswith("http") else f"{self.base_url}{file_url}"
        try:
            with request.urlopen(absolute_url, timeout=120) as response:
                destination.write_bytes(response.read())
        except error.URLError as exc:
            raise AceStepError(f"Could not download ACE-Step audio from {file_url}: {exc.reason}") from exc


ace_step_client = AceStepClient()
