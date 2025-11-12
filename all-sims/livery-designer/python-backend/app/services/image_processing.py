"""Image pre-processing utilities."""

from PIL import Image
from io import BytesIO


def load_image(image_bytes: bytes) -> Image.Image:
    """Load an image from raw bytes for downstream processing."""
    return Image.open(BytesIO(image_bytes)).convert("RGB")
