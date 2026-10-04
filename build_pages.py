"""Generate GitHub Pages entry files without requiring FastAPI."""
import json
from pathlib import Path

from tracks import presentation_data

ROOT = Path(__file__).resolve().parent


def build():
    data = presentation_data()
    (ROOT / "index.html").write_bytes((ROOT / "static/index.html").read_bytes())
    (ROOT / "slides.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (ROOT / ".nojekyll").touch()
    print("GitHub Pages files generated: " + ", ".join(
        f"{track['name']} {len(track['slides'])} slides" for track in data["tracks"].values()
    ))


if __name__ == "__main__":
    build()
