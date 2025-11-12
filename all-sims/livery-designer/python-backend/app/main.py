"""FastAPI entry point for the GridVox AI Livery Designer backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, generation, upload

app = FastAPI(title="GridVox AI Livery Designer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(upload.router, prefix="/api")
app.include_router(generation.router, prefix="/api")


@app.get("/")
async def root() -> dict[str, str]:
    """Basic heartbeat for smoke testing."""
    return {"status": "ok", "service": "gridvox-livery-designer"}
