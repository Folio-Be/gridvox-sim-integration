# Implementation Guide - Step by Step

This guide provides the exact commands and files to create the AMS2 Track Generator standalone app.

## Prerequisites

- Node.js 18+
- Rust (for Tauri)
- Python 3.x
- Windows Build Tools (for C++ addon)

---

## Phase 1: Project Setup

### Step 1.1: Update package.json

Replace the current `package.json` with:

```json
{
  "name": "@SimVox.ai/ams2-telemetry-track-generator",
  "version": "1.0.0",
  "description": "Generate 3D track models from AMS2 telemetry using the 3-run mapping approach",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "generate": "tsx scripts/generate-track.ts",
    "validate": "tsx scripts/validate-track.ts",
    "optimize": "tsx scripts/optimize-gltf.ts",
    "enrich": "tsx scripts/enrich-track.ts"
  },
  "keywords": [
    "ams2",
    "automobilista-2",
    "telemetry",
    "track-generation",
    "3d-modeling",
    "gltf",
    "three.js",
    "tauri",
    "desktop-app"
  ],
  "author": "SimVox.ai",
  "license": "MIT",
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-opener": "^2",
    "@tauri-apps/plugin-dialog": "^2",
    "@gltf-transform/core": "^4.0.0",
    "@gltf-transform/extensions": "^4.0.0",
    "@gltf-transform/functions": "^4.0.0",
    "three": "^0.160.0",
    "node-addon-api": "^7.1.0",
    "eventemitter3": "^5.0.1",
    "lucide-react": "^0.263.1",
    "sonner": "^1.4.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@types/node": "^20.10.0",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-react": "^4.6.0",
    "@tauri-apps/cli": "^2",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "tsx": "^4.7.0",
    "node-gyp": "^10.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 1.2: Install dependencies

```bash
npm install
```

### Step 1.3: Copy Tauri structure from POC-06

Copy these directories/files from `C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-06-tauri-integration\SimVox.ai-poc06\`:

```bash
# Copy src-tauri directory (Rust backend)
cp -r "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-06-tauri-integration\SimVox.ai-poc06\src-tauri" ./

# Copy config files
cp "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-06-tauri-integration\SimVox.ai-poc06\vite.config.ts" ./
cp "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-06-tauri-integration\SimVox.ai-poc06\tsconfig.node.json" ./
cp "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-06-tauri-integration\SimVox.ai-poc06\index.html" ./

# Copy public directory
cp -r "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-06-tauri-integration\SimVox.ai-poc06\public" ./
```

### Step 1.4: Update tsconfig.json

Replace `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Phase 2: Copy Telemetry Components from POC-02

### Step 2.1: Copy native addon

```bash
# Create native directory
mkdir -p src/native

# Copy C++ shared memory reader
cp "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-02-direct-memory\src\native\shared_memory.cc" src/native/

# Copy binding.gyp
cp "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-02-direct-memory\binding.gyp" ./
```

### Step 2.2: Copy TypeScript telemetry library

```bash
# Create lib directory
mkdir -p src/lib

# Copy types
cp "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-02-direct-memory\src\lib\types.ts" src/lib/

# Copy EventDetector system
cp "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-02-direct-memory\src\lib\EventDetector.ts" src/lib/

# Copy detectors directory
cp -r "C:\DATA\SimVox.ai\simvox-desktop\pocs\poc-02-direct-memory\src\lib\detectors" src/lib/
```

---

## Phase 3: Set Up Python Backend

### Step 3.1: Create python-backend directory

```bash
mkdir -p python-backend/services
mkdir -p python-backend/routers
mkdir -p python-backend/models
```

### Step 3.2: Create requirements.txt

`python-backend/requirements.txt`:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
numpy>=1.24.0
```

### Step 3.3: Create main.py

`python-backend/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="AMS2 Track Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

---

## Phase 4: Create React App Structure

### Step 4.1: Create src directory structure

```bash
mkdir -p src/components/ui
mkdir -p src/components/screens
mkdir -p src/lib/alignment
mkdir -p src/lib/detection
mkdir -p src/lib/geometry
mkdir -p src/lib/export
mkdir -p src/styles
```

### Step 4.2: Create main entry point

`src/main.tsx`:
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 4.3: Create main App component

`src/App.tsx`:
```typescript
import { useState } from "react";
import "./App.css";

type Screen = "welcome" | "setup" | "instructions" | "recording" | "processing" | "preview" | "export";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");

  return (
    <div className="app">
      <h1>SimVox.ai Track Generator</h1>
      <p>Current screen: {currentScreen}</p>
    </div>
  );
}

export default App;
```

### Step 4.4: Create styles

`src/App.css`:
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-card: #1a1a1a;
  --bg-nested: #0d0d0d;
  --border: #333333;
  --border-hover: #555555;
  --text-primary: #e0e0e0;
  --text-secondary: #aaaaaa;
  --text-muted: #666666;
  --accent-success: #51cf66;
  --accent-error: #ff6b6b;
  --accent-warning: #ffd43b;
  --accent-info: #339af0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 15.2px;
}

.app {
  min-height: 100vh;
  padding: 2rem;
}
```

`src/styles/index.css`:
```css
@import url('./App.css');

html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
```

---

## Phase 5: Test Basic Setup

### Step 5.1: Test Vite dev server

```bash
npm run dev
```

Should open browser at http://localhost:1420

### Step 5.2: Test Tauri (requires Rust)

```bash
npm run tauri dev
```

Should open desktop window.

---

## Next Steps

After basic setup works:

1. **Implement Welcome Screen** - First real UI component
2. **Add telemetry connection** - Test POC-02 integration
3. **Build recording workflow** - Live telemetry capture
4. **Implement processing pipeline** - Alignment + generation
5. **Add 3D viewer** - Three.js integration
6. **Export functionality** - glTF output

---

## File Checklist

After Phase 1-4, you should have:

```
ams2-telemetry-track-generator/
├── package.json ✅
├── vite.config.ts ✅
├── tsconfig.json ✅
├── tsconfig.node.json ✅
├── index.html ✅
├── binding.gyp ✅
├── src/
│   ├── main.tsx ✅
│   ├── App.tsx ✅
│   ├── App.css ✅
│   ├── styles/
│   │   └── index.css ✅
│   ├── native/
│   │   └── shared_memory.cc ✅
│   ├── lib/
│   │   ├── types.ts ✅
│   │   ├── EventDetector.ts ✅
│   │   └── detectors/ ✅
│   └── components/
│       ├── ui/
│       └── screens/
├── src-tauri/ ✅
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs
│       └── lib.rs
├── python-backend/
│   ├── main.py ✅
│   ├── requirements.txt ✅
│   ├── services/
│   ├── routers/
│   └── models/
├── public/ ✅
├── docs/
├── scripts/
└── telemetry-data/
```

---

## Troubleshooting

### Rust not installed
```bash
# Install from https://rustup.rs/
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Tauri CLI issues
```bash
npm install -g @tauri-apps/cli
```

### Python backend won't start
```bash
cd python-backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python main.py
```

### C++ addon build fails
```bash
# Install Windows Build Tools
npm install --global windows-build-tools

# Or manually install Visual Studio Build Tools
# https://visualstudio.microsoft.com/downloads/
```

---

**This guide will be updated as implementation progresses.**
