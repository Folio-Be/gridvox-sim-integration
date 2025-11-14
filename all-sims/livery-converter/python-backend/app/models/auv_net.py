"""Wrapper around AUV-Net style architecture (placeholder)."""

from typing import Any


class AUVNetModel:
    """Stub for loading and running the neural UV correspondence network."""

    def __init__(self, model_path: str) -> None:
        self.model_path = model_path
        self._model: Any | None = None

    def load(self) -> None:
        """Load network weights (to be implemented)."""
        self._model = f"loaded:{self.model_path}"

    def infer(self, image_bytes: bytes) -> dict[str, Any]:
        """Run inference and return placeholder UV map."""
        if self._model is None:
            raise RuntimeError("Model not loaded")
        return {"uv_map": [], "metadata": {"source": self.model_path}}
