from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from content import SLIDES, SPEAKERS

ROOT = Path(__file__).resolve().parent
app = FastAPI(title="SAIF 2026 · 팀 공유 브리핑")
app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")


@app.get("/")
def index():
    return FileResponse(ROOT / "static" / "index.html", headers={"Cache-Control": "no-cache"})


@app.get("/api/slides")
def slides():
    return {"title": "삼성 AI 포럼 2026", "speakers": [
        {"id": i + 1, "name": name, "topic": topic}
        for i, (name, topic) in enumerate(SPEAKERS)
    ], "slides": SLIDES}


@app.get("/health")
def health():
    return {"status": "ok", "slides": len(SLIDES)}
