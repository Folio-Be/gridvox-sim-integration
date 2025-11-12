# POC: PSD Livery Editor - SimVox Tauri Implementation

**Following SimVox POC Structure** (Tauri + React + Vite)

## Overview

This POC demonstrates loading AMS2 PSD templates in a Tauri desktop app and enabling browser-based canvas editing.

## Tech Stack (SimVox Standard)

- **Framework:** Tauri 2.x
- **Frontend:** React 19 + TypeScript
- **Build:** Vite 7.x
- **Canvas:** HTML5 Canvas API + @webtoon/psd

## Project Structure

```
poc-psd-livery-editor/
├── package.json                # React + Tauri dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── index.html                  # Entry point
├── src/                        # React frontend
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # Styles
│   ├── components/
│   │   ├── PSDLoader.tsx       # PSD file loader
│   │   ├── LiveryCanvas.tsx    # Canvas editor
│   │   └── LayerPanel.tsx      # Layer visibility controls
│   └── lib/
│       ├── psd-parser.ts       # @webtoon/psd wrapper
│       └── canvas-tools.ts     # Drawing utilities
├── src-tauri/                  # Tauri backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       └── lib.rs              # Rust commands for file I/O
└── templates/                   # Symlink to extracted PSDs
    └── AMS2/
```

## Key Differences from Node.js POC

### 1. Browser-Based PSD Loading
```typescript
// @webtoon/psd works in browser with ArrayBuffer from file input
import Psd from '@webtoon/psd';

const handleFileUpload = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const psd = Psd.parse(arrayBuffer);
  
  // Extract layers
  for (const layer of psd.layers) {
    const pixels = await layer.composite();
    renderToCanvas(pixels, layer.width, layer.height);
  }
};
```

### 2. HTML5 Canvas (No node-canvas needed)
```typescript
// Native browser canvas
const canvas = document.createElement('canvas');
canvas.width = 4096;
canvas.height = 4096;
const ctx = canvas.getContext('2d')!;

// Draw user livery
ctx.fillStyle = '#FF0000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

### 3. Tauri File System Access
```rust
// src-tauri/src/lib.rs
#[tauri::command]
async fn load_template(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_png(path: String, data: Vec<u8>) -> Result<(), String> {
    std::fs::write(path, data).map_err(|e| e.to_string())
}
```

## Dependencies

### package.json
```json
{
  "name": "poc-psd-livery-editor",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-opener": "^2",
    "@tauri-apps/plugin-dialog": "^2",
    "@webtoon/psd": "^0.4.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "@tauri-apps/cli": "^2"
  }
}
```

### Cargo.toml additions
```toml
[dependencies]
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
```

## Implementation Steps

### 1. Create Project
```bash
cd C:\DATA\SimVox\simvox-sim-integration\all-sims\livery-builder
npm create tauri-app@latest poc-psd-livery-editor
# Select: React, TypeScript, npm
```

### 2. Install Dependencies
```bash
cd poc-psd-livery-editor
npm install @webtoon/psd
npm install @tauri-apps/plugin-dialog @tauri-apps/plugin-fs
```

### 3. Configure Tauri Permissions
```json
// src-tauri/tauri.conf.json
{
  "permissions": [
    "core:default",
    "dialog:default",
    "fs:allow-read",
    "fs:allow-write"
  ]
}
```

### 4. Create Components

#### PSDLoader.tsx
```typescript
import { open } from '@tauri-apps/plugin-dialog';
import Psd from '@webtoon/psd';

export function PSDLoader({ onLoad }: { onLoad: (psd: any) => void }) {
  const handleLoad = async () => {
    const selected = await open({
      filters: [{ name: 'PSD Files', extensions: ['psd'] }]
    });
    
    if (selected) {
      const response = await fetch(`file://${selected}`);
      const arrayBuffer = await response.arrayBuffer();
      const psd = Psd.parse(arrayBuffer);
      onLoad(psd);
    }
  };
  
  return <button onClick={handleLoad}>Load PSD Template</button>;
}
```

#### LiveryCanvas.tsx
```typescript
import { useRef, useEffect } from 'react';

export function LiveryCanvas({ 
  psd, 
  wireframe, 
  ao 
}: { 
  psd: any; 
  wireframe: any; 
  ao: any;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !psd) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = psd.width;
    canvas.height = psd.height;
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Base color
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // AO layer
    if (ao) {
      const imageData = new ImageData(
        new Uint8ClampedArray(ao),
        psd.width,
        psd.height
      );
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = 'multiply';
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Wireframe overlay
    if (wireframe) {
      const imageData = new ImageData(
        new Uint8ClampedArray(wireframe),
        psd.width,
        psd.height
      );
      ctx.globalAlpha = 0.2;
      ctx.globalCompositeOperation = 'overlay';
      ctx.putImageData(imageData, 0, 0);
    }
    
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  }, [psd, wireframe, ao]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
```

#### App.tsx
```typescript
import { useState } from 'react';
import { PSDLoader } from './components/PSDLoader';
import { LiveryCanvas } from './components/LiveryCanvas';
import './App.css';

function App() {
  const [psd, setPsd] = useState<any>(null);
  const [wireframe, setWireframe] = useState<any>(null);
  const [ao, setAo] = useState<any>(null);
  
  const handlePSDLoad = async (loadedPsd: any) => {
    setPsd(loadedPsd);
    
    // Extract special layers
    for (const layer of loadedPsd.layers) {
      const pixels = await layer.composite(false);
      
      if (layer.name.toLowerCase().includes('wireframe')) {
        setWireframe(pixels);
      } else if (layer.name.toLowerCase().includes('ambient') ||
                 layer.name.toLowerCase().includes('ao')) {
        setAo(pixels);
      }
    }
  };
  
  return (
    <div className="container">
      <h1>SimVox Livery Editor POC</h1>
      
      <PSDLoader onLoad={handlePSDLoad} />
      
      {psd && (
        <div className="editor">
          <div className="info">
            <p>Template: {psd.width}x{psd.height}</p>
            <p>Layers: {psd.layers.length}</p>
          </div>
          
          <LiveryCanvas 
            psd={psd}
            wireframe={wireframe}
            ao={ao}
          />
        </div>
      )}
    </div>
  );
}

export default App;
```

## Running the POC

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Expected Behavior

1. **Launch:** Tauri app opens with "Load PSD Template" button
2. **Load:** Click button → file picker → select BMW_M4_GT3 PSD
3. **Parse:** @webtoon/psd extracts 10 layers
4. **Display:** Canvas shows red base + AO depth + wireframe overlay
5. **Size:** 4096x4096 template scaled to fit window

## Next Steps (Post-POC)

1. **Drawing Tools:**
   - Brush tool with size/color picker
   - Shape tools (rect, circle, line)
   - Text tool with font selection

2. **Layer Management:**
   - Toggle wireframe/AO visibility
   - User layer stack (base, patterns, decals)
   - Undo/redo

3. **Export:**
   - Save as PNG
   - Convert to DDS (via Python backend or WASM)

4. **Template Library:**
   - Pre-load all 4 AMS2 templates
   - Multi-template editing (body + wheels + numberplate)

## Advantages of Tauri Approach

✅ **Native file picker** (no command-line file paths)
✅ **Browser canvas API** (no node-canvas compilation)
✅ **@webtoon/psd works natively** (pure JavaScript, no Node.js bindings)
✅ **Hot reload** during development (Vite)
✅ **Small binary** (~5MB vs Electron's 100MB+)
✅ **Desktop app UX** (window chrome, native menus)

## Notes

- **@webtoon/psd** supports WebAssembly acceleration in browser
- **Canvas API** is faster than node-canvas for real-time drawing
- **Tauri** file system is sandboxed - use plugins for access
- **React** state management handles layer visibility/opacity
- **Vite** provides instant HMR for rapid iteration
