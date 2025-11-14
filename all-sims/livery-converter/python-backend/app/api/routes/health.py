"""Health endpoints to support monitoring."""

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check() -> dict[str, str]:
    """Return a static payload that signals availability."""
    return {"status": "ok"}
