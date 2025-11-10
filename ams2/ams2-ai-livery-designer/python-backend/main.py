# Python Backend Placeholder
# FastAPI server for AI processing will be implemented in Week 5-6

"""
AMS2 AI Livery Designer - Python Backend
FastAPI server for AI image processing and generation

Port: 8002 (to avoid conflicts with POC-08 on 8001)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AMS2 AI Livery Designer Backend", version="0.1.0")

# Enable CORS for Tauri frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "AMS2 AI Livery Designer Backend",
        "version": "0.1.0",
        "status": "POC Phase 1",
        "endpoints": {
            "health": "/health",
            "process_image": "/api/process-image (TODO)",
            "generate_livery": "/api/generate-livery (TODO)",
            "export_dds": "/api/export-dds (TODO)"
        }
    }

@app.get("/health")
async def health():
    return {"status": "ok", "gpu_available": False}  # TODO: Check CUDA

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8002,  # Using 8002 to avoid conflict with POC-08 (8001)
        log_level="info"
    )
