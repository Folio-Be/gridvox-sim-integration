"""
AMS2 AI Livery Designer - Python Backend
FastAPI server for AI image processing and generation

Port: 8002 (to avoid conflicts with POC-08 on 8001)
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import sys
import os
import torch

# Add services to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'services'))

# Import services (will create these)
# from services.image_processor import ImageProcessor
# from services.ai_generator import AIGenerator
# from services.dds_exporter import DDSExporter

app = FastAPI(title="AMS2 AI Livery Designer Backend", version="0.1.0")

# Enable CORS for Tauri frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify Tauri's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Check GPU availability
def check_gpu():
    """Check if CUDA GPU is available"""
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9  # GB
        return {
            "available": True,
            "name": gpu_name,
            "memory_gb": round(gpu_memory, 2),
            "cuda_version": torch.version.cuda
        }
    return {"available": False}

@app.get("/")
async def root():
    """Root endpoint with API documentation"""
    return {
        "message": "AMS2 AI Livery Designer Backend",
        "version": "0.1.0",
        "status": "POC Phase 1",
        "endpoints": {
            "health": "/health",
            "gpu_info": "/gpu-info",
            "process_image": "/api/process-image (Week 5-6)",
            "generate_livery": "/api/generate-livery (Week 5-6)",
            "export_dds": "/api/export-dds (Week 5-6)"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    gpu_info = check_gpu()
    return {
        "status": "ok",
        "gpu_available": gpu_info["available"],
        "service": "AMS2 AI Livery Designer"
    }

@app.get("/gpu-info")
async def gpu_info():
    """Get detailed GPU information"""
    return check_gpu()

# Placeholder endpoints for Week 5-6 implementation
@app.post("/api/process-image")
async def process_image(file: UploadFile = File(...)):
    """Process uploaded image (background removal, preprocessing)"""
    return JSONResponse(
        status_code=501,
        content={"error": "Not implemented yet", "phase": "Week 5-6"}
    )

@app.post("/api/generate-livery")
async def generate_livery():
    """Generate livery using SDXL + ControlNet"""
    return JSONResponse(
        status_code=501,
        content={"error": "Not implemented yet", "phase": "Week 5-6"}
    )

@app.post("/api/export-dds")
async def export_dds():
    """Export generated livery as DDS file"""
    return JSONResponse(
        status_code=501,
        content={"error": "Not implemented yet", "phase": "Week 5-6"}
    )

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("=" * 60)
    print("AMS2 AI Livery Designer - Python Backend")
    print("=" * 60)
    
    # Check GPU
    gpu_info = check_gpu()
    if gpu_info["available"]:
        print(f"✅ GPU: {gpu_info['name']}")
        print(f"✅ VRAM: {gpu_info['memory_gb']} GB")
        print(f"✅ CUDA: {gpu_info['cuda_version']}")
    else:
        print("⚠️  No GPU detected - AI generation will be slow")
    
    print("=" * 60)
    print(f"Server running on http://127.0.0.1:8002")
    print("=" * 60)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8002,  # Using 8002 to avoid conflict with POC-08 (8001)
        log_level="info"
    )
