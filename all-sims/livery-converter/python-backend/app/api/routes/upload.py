"""Upload endpoints for user-provided reference images."""

from fastapi import APIRouter, File, UploadFile

from app.schemas.requests import UploadResponse

router = APIRouter(prefix="/upload-photo", tags=["upload"])


@router.post("", response_model=UploadResponse)
async def upload_photo(photo: UploadFile = File(...)) -> UploadResponse:
    """Handle initial photo ingestion and return placeholder metadata."""
    return UploadResponse(
        photo_id="placeholder-photo-id",
        analysis={
            "view_detected": "unknown",
            "quality_score": 0,
            "dominant_colors": [],
        },
    )
