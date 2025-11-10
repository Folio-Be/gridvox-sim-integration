"""
AMS2 Track Generator - Python Backend
FastAPI server for track generation processing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="AMS2 Track Generator API",
    description="Backend API for 3D track generation from telemetry",
    version="1.0.0"
)

# Configure CORS for Tauri frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify Tauri's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "AMS2 Track Generator API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/api/tracks")
async def list_tracks():
    """List available generated tracks"""
    return {"tracks": []}

if __name__ == "__main__":
    print("🚀 Starting AMS2 Track Generator API...")
    print("📍 Server running at: http://127.0.0.1:8000")
    print("📖 API docs available at: http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)
