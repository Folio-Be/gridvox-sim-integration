"""Pydantic request/response contracts."""

from typing import Any

from pydantic import BaseModel, Field


class UploadAnalysis(BaseModel):
    view_detected: str = Field(default="", description="Detected camera angle label")
    quality_score: int = Field(default=0, ge=0, le=100)
    dominant_colors: list[str] = Field(default_factory=list)


class UploadResponse(BaseModel):
    photo_id: str
    analysis: UploadAnalysis | dict[str, Any]


class GenerateRequest(BaseModel):
    photo_id: str
    car_id: str
    options: dict[str, Any] | None = None


class GenerateResponse(BaseModel):
    job_id: str
    status: str
    websocket_url: str | None = None
    estimated_time_seconds: float | None = None
