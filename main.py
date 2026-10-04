from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from tracks import SLIDES, presentation_data

ROOT = Path(__file__).resolve().parent
app = FastAPI(title="SAIF 2026 · 팀 공유 브리핑")
app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")


@app.get("/")
def index():
    return FileResponse(ROOT / "static" / "index.html", headers={"Cache-Control": "no-cache"})


@app.get("/api/slides")
@app.get("/slides.json")
def slides():
    return presentation_data()


@app.get("/health")
def health():
    return {"status": "ok", "slides": len(SLIDES)}
