"""Generate GitHub Pages entry files without requiring FastAPI."""
import json
from pathlib import Path

from content import SLIDES, speaker_metadata

ROOT = Path(__file__).resolve().parent


def build():
    data = {
        "title": "삼성 AI 포럼 2026",
        "speakers": speaker_metadata(),
        "slides": SLIDES,
    }
    (ROOT / "index.html").write_bytes((ROOT / "static/index.html").read_bytes())
    (ROOT / "slides.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (ROOT / ".nojekyll").touch()
    print(f"GitHub Pages files generated: {len(SLIDES)} slides")


if __name__ == "__main__":
    build()
