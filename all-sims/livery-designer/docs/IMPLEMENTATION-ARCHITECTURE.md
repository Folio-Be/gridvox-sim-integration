# Implementation Architecture

**Project:** GridVox AI Livery Designer
**Purpose:** Technical implementation patterns, architectural decisions, and code organization
**Last Updated:** January 11, 2025

---

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Module Structure](#module-structure)
3. [Data Flow](#data-flow)
4. [API Layer Design](#api-layer-design)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Architecture](#deployment-architecture)

---

## System Architecture Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Tauri Desktop App                          │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Frontend (React)                        │  │
│  │  ┌──────────────┬──────────────┬──────────────────────────┤  │
│  │  │  Components  │  State Mgmt  │  Three.js 3D Renderer   │  │
│  │  │  (Screens)   │  (Zustand)   │  (Car Preview)          │  │
│  │  └──────────────┴──────────────┴──────────────────────────┤  │
│  │                                                            │  │
│  │                    HTTP Client (Axios)                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↕ IPC                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  Tauri Backend (Rust)                      │  │
│  │  - File system access                                      │  │
│  │  - Game install detection                                  │  │
│  │  - DDS/TGA export (via subprocess)                        │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌──────────────────────────────────────────────────────────────────┐
│               Python Backend (FastAPI)                            │
│                                                                    │
│  ┌──────────────┬───────────────┬─────────────┬────────────────┐ │
│  │  REST API    │  WebSocket    │  AUV-Net    │  Model Cache   │ │
│  │  (FastAPI)   │  (Progress)   │  Inference  │  (GPU VRAM)    │ │
│  └──────────────┴───────────────┴─────────────┴────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↕ File I/O
┌──────────────────────────────────────────────────────────────────┐
│                       Local File System                           │
│  - Trained models (AUV-Net weights per car)                      │
│  - User projects (.gvox files)                                   │
│  - Exported liveries (DDS/TGA)                                   │
│  - Temporary render cache                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Module Structure

### Frontend (React + TypeScript)

```
src/
├── main.tsx                      # Vite entry point
├── App.tsx                       # Main app with routing
├── components/
│   ├── screens/                  # Full-page screens
│   │   ├── UploadScreen.tsx     # Photo upload
│   │   ├── CarSelectionScreen.tsx  # Car picker
│   │   ├── GenerationScreen.tsx    # AI processing with progress
│   │   ├── PreviewScreen.tsx       # 3D preview + review
│   │   ├── EditorScreen.tsx        # 2D UV editor
│   │   └── ExportScreen.tsx        # Export settings
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Toast.tsx
│   ├── three/                    # Three.js components
│   │   ├── CarViewer.tsx        # 3D car model viewer
│   │   ├── OrbitControls.tsx    # Camera controls
│   │   └── LightingSetup.tsx    # Scene lighting
│   └── AppShell.tsx             # Desktop app chrome
├── hooks/                        # Custom React hooks
│   ├── useWebSocket.ts          # WebSocket connection
│   ├── useCarModels.ts          # Car data fetching
│   └── useFileUpload.ts         # File upload logic
├── stores/                       # State management (Zustand)
│   ├── appStore.ts              # Global app state
│   ├── projectStore.ts          # Current project state
│   └── uiStore.ts               # UI state (modals, toasts)
├── services/                     # API clients
│   ├── apiClient.ts             # Axios instance
│   ├── liveryService.ts         # Livery generation API
│   └── exportService.ts         # Export API
├── types/                        # TypeScript types
│   ├── api.types.ts             # API request/response types
│   ├── livery.types.ts          # Livery data types
│   └── car.types.ts             # Car model types
└── utils/                        # Utility functions
    ├── fileUtils.ts             # File handling
    ├── colorUtils.ts            # Color conversion
    └── validation.ts            # Input validation
```

### Backend (Python + FastAPI)

```
python-backend/
├── main.py                       # FastAPI app entry point
├── api/
│   ├── routes/
│   │   ├── upload.py            # POST /api/upload-photo
│   │   ├── generate.py          # POST /api/generate-livery
│   │   ├── export.py            # POST /api/export
│   │   └── websocket.py         # WebSocket /ws/{job_id}
│   ├── middleware/
│   │   ├── cors.py              # CORS config
│   │   ├── error_handler.py    # Global error handler
│   │   └── rate_limit.py        # Rate limiting (future)
│   └── dependencies.py          # Dependency injection
├── models/
│   ├── auv_net.py               # AUV-Net model wrapper
│   ├── model_manager.py         # Model loading/caching
│   └── inference.py             # Inference pipeline
├── services/
│   ├── image_processing.py      # Image preprocessing
│   ├── uv_generation.py         # UV texture generation
│   ├── dds_export.py            # DDS file creation
│   ├── tga_export.py            # TGA file creation
│   └── quality_scorer.py        # Quality metrics
├── schemas/                      # Pydantic models
│   ├── requests.py              # API request schemas
│   ├── responses.py             # API response schemas
│   └── config.py                # Config schemas
├── utils/
│   ├── gpu_utils.py             # GPU detection/management
│   ├── file_utils.py            # File I/O helpers
│   └── logging_config.py        # Logging setup
├── data/
│   ├── car_models.json          # Car metadata database
│   └── simulator_mappings.json  # Simulator-specific mappings
└── tests/                        # Unit tests
    ├── test_auv_net.py
    ├── test_export.py
    └── test_api.py
```

### Tauri Backend (Rust)

```
src-tauri/
├── main.rs                       # Tauri app entry
├── lib.rs                        # Library root
├── commands/                     # Tauri commands (IPC)
│   ├── fs_commands.rs           # File system operations
│   ├── game_detection.rs        # Detect AMS2/iRacing paths
│   └── export_commands.rs       # DDS/TGA export helpers
├── utils/
│   ├── registry.rs              # Windows registry access
│   └── paths.rs                 # Path resolution
└── build.rs                      # Build script
```

---

## Data Flow

### User Journey: Photo → Livery → Export

```
1. UPLOAD PHOTO
   ┌──────────────────────────────────────────────────────────┐
   │ User: Drags photo into upload zone                        │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend: Validates file (size, format)                   │
   │ - Check file size < 20MB                                  │
   │ - Check format is JPG/PNG/HEIC                           │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend → Backend: POST /api/upload-photo               │
   │ Request: multipart/form-data with photo file             │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Backend: Analyze photo                                    │
   │ - Detect view angle (side, front, rear)                  │
   │ - Assess lighting quality                                 │
   │ - Extract dominant colors                                 │
   │ - Generate quality score (0-100)                          │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Backend → Frontend: Response with analysis               │
   │ { photo_id, view: "side_45", quality: 87, warnings: [] } │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend: Display analysis + "Continue" button           │
   └──────────────────────────────────────────────────────────┘

2. SELECT CAR
   ┌──────────────────────────────────────────────────────────┐
   │ User: Selects car model (e.g., Porsche 992 GT3 R)       │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend: Loads 3D preview model                         │
   │ - Fetch GLB model from /assets/cars/porsche_992.glb     │
   │ - Display rotating preview in Three.js viewport          │
   └──────────────────────────────────────────────────────────┘

3. AI GENERATION
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend → Backend: POST /api/generate-livery            │
   │ { photo_id, car_id, options: {quality: "high"} }        │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Backend: Create async job                                │
   │ - Generate job_id                                         │
   │ - Return: { job_id, websocket_url }                      │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend: Connect to WebSocket                           │
   │ ws://localhost:1472/ws/{job_id}                          │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Backend: Run inference pipeline                          │
   │ Step 1: Load AUV-Net model for car (2s)                  │
   │   → WebSocket: {status: "loading_model", progress: 0.1} │
   │ Step 2: Preprocess photo (1s)                            │
   │   → WebSocket: {status: "preprocessing", progress: 0.2} │
   │ Step 3: Run AUV-Net inference (25s)                      │
   │   → WebSocket: {status: "generating", progress: 0.3-0.9}│
   │ Step 4: Post-process UV texture (2s)                     │
   │   → WebSocket: {status: "finalizing", progress: 0.95}   │
   │ Step 5: Generate quality metrics (1s)                    │
   │   → WebSocket: {status: "complete", progress: 1.0,      │
   │                 result_id, quality_score: 89}            │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend: Display result                                  │
   │ - Fetch UV texture and apply to 3D model                 │
   │ - Show side-by-side comparison (photo | 3D preview)      │
   │ - Display quality score with metrics breakdown           │
   └──────────────────────────────────────────────────────────┘

4. REVIEW & ADJUST (Optional)
   ┌──────────────────────────────────────────────────────────┐
   │ User: Clicks "Adjust Logo Position"                      │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend: Open 2D UV editor                              │
   │ - Load UV texture into Canvas                            │
   │ - User drags logo 20px to right                          │
   │ - Local state update (instant preview)                   │
   └──────────────────────────────────────────────────────────┘

5. EXPORT
   ┌──────────────────────────────────────────────────────────┐
   │ User: Clicks "Export for AMS2"                           │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend → Backend: POST /api/export                     │
   │ { result_id, simulator: "ams2", number: 42 }            │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Backend: Export pipeline                                  │
   │ 1. Generate mipmaps (2s)                                 │
   │ 2. Compress to BC3/DXT5 (3s)                             │
   │ 3. Create DDS file (1s)                                  │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Backend → Tauri: IPC call to install file               │
   │ { dds_path, car_id, team_id }                            │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Tauri: Detect AMS2 path + copy file                     │
   │ Documents\AMS2\UserData\CustomLiveries\{car}\{team}\    │
   └───────────────────────┬──────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Frontend: Success message                                 │
   │ "Livery installed! Restart AMS2 to see it."             │
   └──────────────────────────────────────────────────────────┘
```

---

## API Layer Design

### REST Endpoints

#### 1. Upload Photo

```typescript
// Request
POST /api/upload-photo
Content-Type: multipart/form-data

FormData {
  photo: File (JPG/PNG/HEIC, max 20MB)
}

// Response (200 OK)
{
  "photo_id": "abc123xyz",
  "analysis": {
    "view_detected": "side_view_45deg",
    "lighting_quality": "good",
    "car_detected": true,
    "confidence": 0.87,
    "quality_score": 85,
    "dominant_colors": ["#FF6B00", "#0066CC"],
    "warnings": []
  },
  "preview_url": "/uploads/abc123xyz_preview.jpg"
}

// Error (400 Bad Request)
{
  "error": "FileToolargeError",
  "message": "Photo exceeds 20MB limit (actual: 25.3MB)",
  "max_size_mb": 20
}
```

#### 2. Generate Livery

```typescript
// Request
POST /api/generate-livery
Content-Type: application/json

{
  "photo_id": "abc123xyz",
  "car_id": "porsche_992_gt3_r",
  "options": {
    "quality": "high",  // "draft" | "high" | "ultra"
    "multi_view_fusion": false,
    "color_boost": 1.0  // 0.5-1.5
  }
}

// Response (202 Accepted)
{
  "job_id": "job_456def",
  "status": "processing",
  "estimated_time_seconds": 30,
  "websocket_url": "ws://localhost:1472/ws/job_456def"
}

// WebSocket Messages (Progress Updates)
{
  "job_id": "job_456def",
  "status": "loading_model",    // "loading_model" | "preprocessing" | "generating" | "finalizing" | "complete" | "error"
  "progress": 0.10,               // 0.0-1.0
  "message": "Loading AUV-Net model for Porsche 992 GT3 R..."
}

// WebSocket Final Message
{
  "job_id": "job_456def",
  "status": "complete",
  "progress": 1.0,
  "result_id": "result_789ghi",
  "quality_metrics": {
    "accuracy_score": 89,
    "semantic_accuracy": 92,
    "color_accuracy": 87
  },
  "generation_time_seconds": 28.3
}
```

#### 3. Get Result

```typescript
// Request
GET /api/results/{result_id}

// Response (200 OK)
{
  "result_id": "result_789ghi",
  "car_id": "porsche_992_gt3_r",
  "generated_at": "2025-01-11T14:32:00Z",
  "quality_metrics": {
    "accuracy_score": 89,
    "semantic_accuracy": 92,
    "color_accuracy": 87
  },
  "files": {
    "uv_texture": "/results/result_789ghi_texture.png",  // 2048×2048 PNG
    "preview_3d": "/results/result_789ghi_preview.jpg",  // 1920×1080 render
    "preview_grid": "/results/result_789ghi_8angles.jpg" // 8-angle comparison
  }
}
```

#### 4. Export Livery

```typescript
// Request
POST /api/export
Content-Type: application/json

{
  "result_id": "result_789ghi",
  "export_options": {
    "simulator": "automobilista2",  // "automobilista2" | "iracing" | "acc" | "lmu"
    "format": "dds",                 // "dds" | "tga"
    "resolution": 2048,              // 1024 | 2048 | 4096
    "mipmaps": true,
    "compression": "BC3",            // "BC3" | "BC1"
    "auto_install": true,            // Copy to game folder
    "car_number": 42,                // Optional
    "driver_name": "A. Rodriguez"    // Optional
  }
}

// Response (200 OK)
{
  "export_id": "export_101abc",
  "files_created": [
    "C:/Users/Alex/Documents/Automobilista 2/UserData/CustomLiveries/porsche_992_gt3_r/GVX/body2.dds"
  ],
  "download_url": "/exports/export_101abc.zip",
  "file_size_mb": 2.7,
  "instructions": "Restart Automobilista 2 to see your livery. Select GVX team in car customization."
}

// Error (500 Internal Server Error)
{
  "error": "ExportError",
  "message": "Failed to detect AMS2 installation path",
  "help": "Verify AMS2 is installed via Steam or Epic Games"
}
```

---

## State Management

### Zustand Stores

#### App Store (Global State)

```typescript
// stores/appStore.ts

import create from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // User preferences
  theme: 'dark' | 'light';
  simulator: 'ams2' | 'iracing' | 'acc' | 'lmu';

  // Settings
  quality_preset: 'draft' | 'high' | 'ultra';
  auto_export: boolean;

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setSimulator: (sim: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      simulator: 'ams2',
      quality_preset: 'high',
      auto_export: true,

      setTheme: (theme) => set({ theme }),
      setSimulator: (simulator) => set({ simulator }),
    }),
    {
      name: 'gridvox-app-storage',  // localStorage key
    }
  )
);
```

#### Project Store (Current Livery Project)

```typescript
// stores/projectStore.ts

interface ProjectState {
  // Current project data
  projectId: string | null;
  photoId: string | null;
  carId: string | null;
  resultId: string | null;

  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generationStatus: string;

  // Quality metrics
  qualityScore: number | null;

  // Actions
  startGeneration: (photoId: string, carId: string) => void;
  updateProgress: (progress: number, status: string) => void;
  setResult: (resultId: string, qualityScore: number) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectId: null,
  photoId: null,
  carId: null,
  resultId: null,
  isGenerating: false,
  generationProgress: 0,
  generationStatus: '',
  qualityScore: null,

  startGeneration: (photoId, carId) =>
    set({
      photoId,
      carId,
      isGenerating: true,
      generationProgress: 0,
      generationStatus: 'Initializing...',
    }),

  updateProgress: (progress, status) =>
    set({ generationProgress: progress, generationStatus: status }),

  setResult: (resultId, qualityScore) =>
    set({
      resultId,
      qualityScore,
      isGenerating: false,
      generationProgress: 1.0,
      generationStatus: 'Complete!',
    }),

  resetProject: () =>
    set({
      projectId: null,
      photoId: null,
      carId: null,
      resultId: null,
      isGenerating: false,
      generationProgress: 0,
      generationStatus: '',
      qualityScore: null,
    }),
}));
```

---

## Error Handling

### Backend Error Types

```python
# api/exceptions.py

class GridVoxException(Exception):
    """Base exception for GridVox errors."""
    def __init__(self, message: str, error_code: str, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

class PhotoAnalysisError(GridVoxException):
    """Photo analysis failed (no car detected, poor quality, etc.)."""
    pass

class ModelLoadError(GridVoxException):
    """Failed to load AI model (missing weights, CUDA error, etc.)."""
    pass

class InferenceError(GridVoxException):
    """Inference failed (OOM, corrupted input, timeout)."""
    pass

class ExportError(GridVoxException):
    """Export failed (DDS compression error, file write error, etc.)."""
    pass

class GameNotFoundError(GridVoxException):
    """Game installation not detected."""
    pass

# Global error handler
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(GridVoxException)
async def gridvox_exception_handler(request: Request, exc: GridVoxException):
    return JSONResponse(
        status_code=500,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )
```

### Frontend Error Handling

```typescript
// services/apiClient.ts

import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:1472/api',
  timeout: 300000,  // 5 minutes (for slow inference)
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as any;

      // Display user-friendly error toast
      toast.error(data.message || 'An error occurred', {
        description: data.details?.help || '',
        action: data.details?.action ? {
          label: 'Learn More',
          onClick: () => window.open(data.details.action.url)
        } : undefined
      });

      // Log to console for debugging
      console.error('[API Error]', {
        endpoint: error.config?.url,
        status: error.response.status,
        code: data.error,
        message: data.message,
        details: data.details
      });
    } else if (error.request) {
      // Backend not responding
      toast.error('Cannot connect to GridVox backend', {
        description: 'Ensure Python backend is running on port 1472',
        action: {
          label: 'Troubleshoot',
          onClick: () => window.open('/help/backend-connection')
        }
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Testing Strategy

### Unit Tests (Python Backend)

```python
# tests/test_auv_net.py

import pytest
import torch
from models.auv_net import AUVNetModel
from PIL import Image
import numpy as np

@pytest.fixture
def auv_net_model():
    """Load AUV-Net model for testing."""
    model = AUVNetModel.load("models/porsche_992_gt3_r.pth", device="cpu")
    return model

def test_inference_output_shape(auv_net_model):
    """Test that model outputs correct UV texture shape."""
    # Create dummy input (1024×1024 RGB)
    input_image = torch.randn(1, 3, 1024, 1024)

    with torch.no_grad():
        output = auv_net_model(input_image)

    # Expected output: (1, 3, 2048, 2048) - UV texture
    assert output.shape == (1, 3, 2048, 2048), f"Expected (1, 3, 2048, 2048), got {output.shape}"

def test_inference_quality_on_real_photo(auv_net_model):
    """Test inference quality on known good photo."""
    # Load test photo
    test_photo_path = "tests/fixtures/porsche_side_view.jpg"
    photo = Image.open(test_photo_path)

    # Run inference
    uv_texture = auv_net_model.generate(photo)

    # Quality checks
    assert uv_texture.shape == (2048, 2048, 3), "Output shape incorrect"
    assert uv_texture.dtype == np.uint8, "Output should be uint8"
    assert uv_texture.min() >= 0 and uv_texture.max() <= 255, "Values out of range"
    assert uv_texture.std() > 20, "Output has too low variance (likely blank)"

def test_batch_inference_consistency(auv_net_model):
    """Test that same input produces same output (deterministic)."""
    input_image = torch.randn(1, 3, 1024, 1024)

    with torch.no_grad():
        output1 = auv_net_model(input_image)
        output2 = auv_net_model(input_image)

    # Outputs should be identical (model is deterministic)
    assert torch.allclose(output1, output2, atol=1e-6), "Model is not deterministic"
```

### Integration Tests

```python
# tests/test_api.py

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_upload_photo_success():
    """Test successful photo upload."""
    with open("tests/fixtures/porsche_side_view.jpg", "rb") as f:
        response = client.post(
            "/api/upload-photo",
            files={"photo": ("test.jpg", f, "image/jpeg")}
        )

    assert response.status_code == 200
    data = response.json()
    assert "photo_id" in data
    assert data["analysis"]["quality_score"] > 50  # At least 50/100

def test_generate_livery_e2e():
    """End-to-end test: upload → generate → export."""
    # 1. Upload photo
    with open("tests/fixtures/porsche_side_view.jpg", "rb") as f:
        upload_response = client.post(
            "/api/upload-photo",
            files={"photo": ("test.jpg", f, "image/jpeg")}
        )
    photo_id = upload_response.json()["photo_id"]

    # 2. Generate livery
    generate_response = client.post(
        "/api/generate-livery",
        json={
            "photo_id": photo_id,
            "car_id": "porsche_992_gt3_r",
            "options": {"quality": "draft"}  # Use draft for faster test
        }
    )
    assert generate_response.status_code == 202
    job_id = generate_response.json()["job_id"]

    # 3. Poll for completion (simplified, real test would use WebSocket)
    import time
    for _ in range(60):  # Max 60 seconds
        result_response = client.get(f"/api/jobs/{job_id}")
        if result_response.json()["status"] == "complete":
            result_id = result_response.json()["result_id"]
            break
        time.sleep(1)
    else:
        pytest.fail("Generation timed out after 60 seconds")

    # 4. Export
    export_response = client.post(
        "/api/export",
        json={
            "result_id": result_id,
            "export_options": {
                "simulator": "automobilista2",
                "format": "dds",
                "auto_install": False  # Don't install during test
            }
        }
    )
    assert export_response.status_code == 200
    assert "download_url" in export_response.json()
```

---

## Deployment Architecture

### Local Desktop App Deployment

```
User Installation:
1. Download GridVox installer (.msi for Windows)
2. Run installer (installs to C:\Program Files\GridVox)
3. First launch:
   - Tauri app starts (port 1470)
   - Python backend auto-starts in background (port 1472)
   - Downloads initial car models (~500MB per car)

Files Installed:
C:\Program Files\GridVox\
├── GridVox.exe                      # Tauri executable
├── resources\
│   ├── frontend\                    # React build
│   │   ├── index.html
│   │   └── assets\
│   └── backend\                     # Python backend
│       ├── python.exe               # Bundled Python interpreter
│       ├── main.exe                 # PyInstaller bundle
│       └── models\                  # AI model weights
│           ├── porsche_992_gt3_r.pth (500MB)
│           ├── mclaren_720s_gt3.pth (500MB)
│           └── bmw_m4_gt3.pth (500MB)
└── updater.exe                      # Auto-updater

Total Install Size: ~3GB (app + 3 car models)
```

### Auto-Update Strategy

```
Update Flow:
1. On app launch, check GitHub Releases API:
   GET https://api.github.com/repos/GridVox/livery-designer/releases/latest

2. Compare version:
   Current: v0.1.0
   Latest:  v0.2.0

3. If outdated:
   - Show toast: "GridVox v0.2.0 available. Update now?"
   - User clicks "Update"
   - Download update (5MB delta, not full 3GB)
   - Install silently in background
   - Restart app

Update Channels:
- Stable: Production releases (default)
- Beta: Early access features (opt-in)
- Dev: Nightly builds (developers only)
```

---

**Last Updated:** January 11, 2025
**Status:** ✅ Implementation architecture complete → Ready for development
**Next:** Begin Phase 1 implementation following this architecture
