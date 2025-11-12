# GridVox AI Livery Designer Backend

Minimal FastAPI service scaffold that mirrors the research architecture. The app exposes placeholder endpoints so the desktop client can integrate early while the ML components are under construction.

## Quick Start

```powershell
# Create venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run the API (reload optional for dev)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Structure

- `app/api/routes` – FastAPI routers (`upload`, `generate`, `health`).
- `app/schemas` – Pydantic contracts shared across routes.
- `app/services` – Placeholder for image preprocessing, UV generation, export logic.
- `app/models` – ML model wrappers (AUV-Net, fallback architectures).
- `app/utils` – GPU utilities, logging helpers, path management.

The skeleton intentionally avoids importing the existing POC modules so that the livery designer remains self-contained.
