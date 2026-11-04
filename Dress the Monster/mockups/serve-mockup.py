"""Squidly local-dev server with the CORS headers Squidly requires.

Usage:
    python mockups/serve-mockup.py            # serve the mockup as index.html
    python mockups/serve-mockup.py --game     # serve the real game (index.html untouched)
    python mockups/serve-mockup.py --port 5501 --host 127.0.0.1
"""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MOCKUP_PATH = "/mockups/game-mode-mockup.html"


class CorsHandler(SimpleHTTPRequestHandler):
    rewrite_index = True

    def _rewrite_index(self):
        if self.rewrite_index and self.path.split("?", 1)[0] in ("/", "/index.html"):
            self.path = MOCKUP_PATH

    def do_GET(self):
        self._rewrite_index()
        super().do_GET()

    def do_HEAD(self):
        self._rewrite_index()
        super().do_HEAD()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def end_headers(self):
        # Squidly fetches the app cross-origin; no-store avoids stale files while iterating.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--game", action="store_true", help="serve the real index.html instead of the mockup")
    parser.add_argument("--port", type=int, default=5501)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    CorsHandler.rewrite_index = not args.game
    handler = partial(CorsHandler, directory=str(ROOT))
    with ThreadingHTTPServer((args.host, args.port), handler) as server:
        target = "real index.html" if args.game else MOCKUP_PATH
        print(f"Serving {ROOT}")
        print(f"  http://{args.host}:{args.port}/  ({target}, CORS enabled)")
        print("Ctrl+C to stop")
        server.serve_forever()


if __name__ == "__main__":
    main()
