"""Livery generation orchestration endpoints."""

from fastapi import APIRouter

from app.schemas.requests import GenerateRequest, GenerateResponse

router = APIRouter(prefix="/generate-livery", tags=["generation"])


@router.post("", response_model=GenerateResponse, status_code=202)
async def generate_livery(payload: GenerateRequest) -> GenerateResponse:
    """Create a placeholder background job and return stub identifiers."""
    return GenerateResponse(
        job_id="job-placeholder",
        status="processing",
        websocket_url="ws://127.0.0.1:1471/ws/job-placeholder",
        estimated_time_seconds=30.0,
    )
