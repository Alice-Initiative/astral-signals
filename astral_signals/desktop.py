from __future__ import annotations

import argparse
import ctypes
import socket
import threading
import time
from typing import Any
from urllib.error import URLError
from urllib.request import urlopen
import webbrowser

import uvicorn

from astral_signals.config import settings
from astral_signals.server import app, main as server_main

APP_TITLE = "Astral Signals"
APP_WIDTH = 1600
APP_HEIGHT = 1040
APP_MIN_WIDTH = 1220
APP_MIN_HEIGHT = 820
APP_STARTUP_TIMEOUT_SECONDS = 30.0
APP_USER_MODEL_ID = "AliceInitiative.AstralSignals"


def desktop_icon_path() -> str | None:
    icon_path = settings.static_dir / "astral-signals-icon.ico"
    if icon_path.is_file():
        return str(icon_path)
    return None


def set_windows_app_user_model_id() -> None:
    if not hasattr(ctypes, "windll"):
        return
    try:
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(APP_USER_MODEL_ID)
    except Exception:
        return


def base_url() -> str:
    return f"http://{settings.host}:{settings.port}"


def health_url() -> str:
    return f"{base_url()}/api/health"


def is_port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((host, port)) == 0


def is_astral_server_alive() -> bool:
    try:
        with urlopen(health_url(), timeout=1.5) as response:
            return response.status == 200
    except URLError:
        return False


def wait_for_astral_server(timeout_seconds: float = APP_STARTUP_TIMEOUT_SECONDS) -> None:
    deadline = time.time() + timeout_seconds
    last_error: Exception | None = None
    while time.time() < deadline:
        try:
            with urlopen(health_url(), timeout=1.5) as response:
                if response.status == 200:
                    return
        except Exception as exc:  # pragma: no cover - network edge
            last_error = exc
        time.sleep(0.25)
    if last_error is not None:
        raise RuntimeError(
            f"Astral Signals could not start its local app server within {timeout_seconds:.0f}s."
        ) from last_error
    raise RuntimeError(
        f"Astral Signals could not start its local app server within {timeout_seconds:.0f}s."
    )


class ManagedUvicornServer:
    def __init__(self) -> None:
        self._thread: threading.Thread | None = None
        self._server: uvicorn.Server | None = None
        self.started_here = False

    def start(self) -> None:
        if is_astral_server_alive():
            self.started_here = False
            return

        if is_port_open(settings.host, settings.port):
            raise RuntimeError(
                f"Port {settings.port} is already in use, but it does not appear to be an Astral Signals server."
            )

        self.started_here = True
        self._thread = threading.Thread(target=self._run_server, name="AstralSignalsDesktopServer", daemon=True)
        self._thread.start()
        wait_for_astral_server()

    def stop(self) -> None:
        if not self.started_here:
            return
        if self._server is not None:
            self._server.should_exit = True
        if self._thread is not None:
            self._thread.join(timeout=10)

    def _run_server(self) -> None:
        config = uvicorn.Config(
            app=app,
            host=settings.host,
            port=settings.port,
            reload=False,
            access_log=False,
            log_level="warning",
        )
        self._server = uvicorn.Server(config)
        self._server.install_signal_handlers = lambda: None
        self._server.run()


def require_webview() -> Any:
    try:
        import webview
    except ImportError as exc:  # pragma: no cover - dependency edge
        raise SystemExit(
            "Astral Signals desktop mode needs pywebview. Run `python -m pip install -e .` to install desktop dependencies."
        ) from exc
    return webview


def open_browser_mode() -> None:
    if is_astral_server_alive():
        webbrowser.open(base_url())
        return

    timer = threading.Timer(1.2, lambda: webbrowser.open(base_url()))
    timer.daemon = True
    timer.start()
    server_main()


def open_server_only_mode() -> None:
    server_main()


def run_smoke_test() -> None:
    require_webview()
    managed_server = ManagedUvicornServer()
    managed_server.start()
    try:
        print(f"Desktop runtime ready at {base_url()}")
    finally:
        managed_server.stop()


def open_desktop_window() -> None:
    webview = require_webview()
    set_windows_app_user_model_id()
    managed_server = ManagedUvicornServer()
    managed_server.start()
    try:
        webview.create_window(
            APP_TITLE,
            base_url(),
            width=APP_WIDTH,
            height=APP_HEIGHT,
            min_size=(APP_MIN_WIDTH, APP_MIN_HEIGHT),
            background_color="#0b0918",
            text_select=True,
        )
        webview.start(icon=desktop_icon_path())
    finally:
        managed_server.stop()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="astral-signals-app")
    parser.add_argument("--browser", action="store_true", help="Launch the local browser fallback instead of the desktop window.")
    parser.add_argument("--server-only", action="store_true", help="Run only the local FastAPI server.")
    parser.add_argument("--smoke-test", action="store_true", help="Verify desktop dependencies and managed server startup without opening a window.")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.smoke_test:
        run_smoke_test()
        return
    if args.server_only:
        open_server_only_mode()
        return
    if args.browser:
        open_browser_mode()
        return
    open_desktop_window()


if __name__ == "__main__":
    main()
