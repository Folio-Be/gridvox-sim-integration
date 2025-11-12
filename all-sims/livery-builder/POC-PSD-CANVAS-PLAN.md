# POC: PSD Canvas Editor - Implementation Plan

**Goal:** Prove we can load AMS2 PSD templates, display layers, and enable drawing

## POC Scope (4-8 hours)

Build minimal working prototype that demonstrates:
1. Load BMW M4 GT3 PSD template with @webtoon/psd
2. Display wireframe layer as overlay
3. Draw on canvas with mouse
4. Export result to PNG

## Tech Stack

```json
{
  "dependencies": {
    "@webtoon/psd": "^0.4.0",
    "canvas": "^2.11.2"
  }
}
```

## File Structure

```
all-sims/livery-builder/poc-psd-canvas/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Main entry point
│   ├── psd-loader.ts            # Load and parse PSD
│   ├── canvas-editor.ts         # Drawing canvas logic
│   └── layer-renderer.ts        # Render PSD layers
├── templates/
│   └── AMS2_bmw_m4_gt3_template.psd  # Symlink to extracted template
└── output/
    └── .gitkeep
```

## Implementation Steps

### Step 1: Project Setup (15 min)

```bash
cd all-sims/livery-builder
mkdir -p poc-psd-canvas/src poc-psd-canvas/templates poc-psd-canvas/output
cd poc-psd-canvas

npm init -y
npm install @webtoon/psd canvas
npm install --save-dev @types/node typescript

# Create symlink to template
ln -s ../../sims/AMS2/example-templates/extracted/BMW_M4_GT3/AMS2_bmw_m4_gt3_template.psd templates/
```

### Step 2: PSD Loader (`src/psd-loader.ts`) (30 min)

```typescript
import Psd from '@webtoon/psd';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface TemplateLayer {
  name: string;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  imageData: Uint8ClampedArray | null;
}

export interface LoadedTemplate {
  width: number;
  height: number;
  layers: TemplateLayer[];
  wireframe: TemplateLayer | null;
  ao: TemplateLayer | null;
}

export async function loadPSDTemplate(psdPath: string): Promise<LoadedTemplate> {
  console.log(`Loading PSD: ${psdPath}`);
  
  const buffer = await readFile(psdPath);
  const psd = Psd.parse(buffer.buffer);
  
  console.log(`PSD Size: ${psd.width}x${psd.height}`);
  console.log(`Layers found: ${psd.layers.length}`);
  
  const layers: TemplateLayer[] = [];
  let wireframe: TemplateLayer | null = null;
  let ao: TemplateLayer | null = null;
  
  for (const layer of psd.layers) {
    console.log(`  - ${layer.name} (opacity: ${layer.opacity})`);
    
    const imageData = await layer.composite(false); // No effects
    
    const templateLayer: TemplateLayer = {
      name: layer.name,
      width: layer.width,
      height: layer.height,
      opacity: layer.opacity,
      visible: !layer.hidden,
      imageData: imageData ? new Uint8ClampedArray(imageData) : null
    };
    
    layers.push(templateLayer);
    
    // Identify special layers
    if (layer.name.toLowerCase().includes('wireframe')) {
      wireframe = templateLayer;
    } else if (layer.name.toLowerCase().includes('ambient') || 
               layer.name.toLowerCase().includes('ao')) {
      ao = templateLayer;
    }
  }
  
  return {
    width: psd.width,
    height: psd.height,
    layers,
    wireframe,
    ao
  };
}
```

### Step 3: Layer Renderer (`src/layer-renderer.ts`) (30 min)

```typescript
import { Canvas, createCanvas, CanvasRenderingContext2D } from 'canvas';
import { TemplateLayer } from './psd-loader';

export function createCanvasFromLayer(layer: TemplateLayer): Canvas {
  const canvas = createCanvas(layer.width, layer.height);
  const ctx = canvas.getContext('2d');
  
  if (layer.imageData) {
    const imageData = ctx.createImageData(layer.width, layer.height);
    imageData.data.set(layer.imageData);
    ctx.putImageData(imageData, 0, 0);
  }
  
  return canvas;
}

export function renderLayerStack(
  canvas: Canvas,
  layers: TemplateLayer[],
  includeWireframe: boolean = true
): void {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (const layer of layers) {
    if (!layer.visible || !layer.imageData) continue;
    
    // Skip wireframe unless requested
    if (layer.name.toLowerCase().includes('wireframe') && !includeWireframe) {
      continue;
    }
    
    ctx.globalAlpha = layer.opacity;
    
    const layerCanvas = createCanvasFromLayer(layer);
    ctx.drawImage(layerCanvas, 0, 0);
  }
  
  ctx.globalAlpha = 1.0;
}

export function applyWireframeOverlay(
  canvas: Canvas,
  wireframe: TemplateLayer | null,
  opacity: number = 0.3
): void {
  if (!wireframe || !wireframe.imageData) return;
  
  const ctx = canvas.getContext('2d');
  const wireframeCanvas = createCanvasFromLayer(wireframe);
  
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(wireframeCanvas, 0, 0);
  
  ctx.globalAlpha = 1.0;
  ctx.globalCompositeOperation = 'source-over';
}
```

### Step 4: Canvas Editor (`src/canvas-editor.ts`) (45 min)

```typescript
import { Canvas, createCanvas } from 'canvas';
import { writeFile } from 'fs/promises';
import { TemplateLayer } from './psd-loader';

export class LiveryCanvasEditor {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private drawingCanvas: Canvas; // Separate layer for user drawing
  
  constructor(width: number, height: number) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    this.drawingCanvas = createCanvas(width, height);
  }
  
  /**
   * Set base color/texture
   */
  setBase(color: string): void {
    const ctx = this.drawingCanvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
  }
  
  /**
   * Draw rectangle (simple test)
   */
  drawRect(x: number, y: number, width: number, height: number, color: string): void {
    const ctx = this.drawingCanvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }
  
  /**
   * Draw circle (simple test)
   */
  drawCircle(x: number, y: number, radius: number, color: string): void {
    const ctx = this.drawingCanvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Add text
   */
  drawText(text: string, x: number, y: number, fontSize: number, color: string): void {
    const ctx = this.drawingCanvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(text, x, y);
  }
  
  /**
   * Composite final image with wireframe overlay
   */
  composite(wireframe: TemplateLayer | null, ao: TemplateLayer | null): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 1. Draw user's livery
    this.ctx.drawImage(this.drawingCanvas, 0, 0);
    
    // 2. Apply ambient occlusion (multiply for depth)
    if (ao && ao.imageData) {
      const aoCanvas = createCanvas(ao.width, ao.height);
      const aoCtx = aoCanvas.getContext('2d');
      const imageData = aoCtx.createImageData(ao.width, ao.height);
      imageData.data.set(ao.imageData);
      aoCtx.putImageData(imageData, 0, 0);
      
      this.ctx.globalAlpha = 0.4;
      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.drawImage(aoCanvas, 0, 0);
    }
    
    // 3. Overlay wireframe (guide only)
    if (wireframe && wireframe.imageData) {
      const wfCanvas = createCanvas(wireframe.width, wireframe.height);
      const wfCtx = wfCanvas.getContext('2d');
      const imageData = wfCtx.createImageData(wireframe.width, wireframe.height);
      imageData.data.set(wireframe.imageData);
      wfCtx.putImageData(imageData, 0, 0);
      
      this.ctx.globalAlpha = 0.2;
      this.ctx.globalCompositeOperation = 'overlay';
      this.ctx.drawImage(wfCanvas, 0, 0);
    }
    
    this.ctx.globalAlpha = 1.0;
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  /**
   * Export to PNG
   */
  async exportPNG(outputPath: string): Promise<void> {
    const buffer = this.canvas.toBuffer('image/png');
    await writeFile(outputPath, buffer);
    console.log(`Exported to: ${outputPath}`);
  }
  
  getCanvas(): Canvas {
    return this.canvas;
  }
}
```

### Step 5: Main Entry Point (`src/index.ts`) (30 min)

```typescript
import { join } from 'path';
import { loadPSDTemplate } from './psd-loader';
import { LiveryCanvasEditor } from './canvas-editor';

async function main() {
  console.log('='.repeat(80));
  console.log('PSD Canvas Editor POC');
  console.log('='.repeat(80));
  console.log();
  
  // 1. Load PSD template
  const templatePath = join(__dirname, '../templates/AMS2_bmw_m4_gt3_template.psd');
  const template = await loadPSDTemplate(templatePath);
  
  console.log(`\nLoaded template: ${template.width}x${template.height}`);
  console.log(`Layers: ${template.layers.length}`);
  console.log(`Wireframe layer: ${template.wireframe ? 'Found' : 'Not found'}`);
  console.log(`AO layer: ${template.ao ? 'Found' : 'Not found'}`);
  console.log();
  
  // 2. Create editor
  const editor = new LiveryCanvasEditor(template.width, template.height);
  
  // 3. Set base color
  editor.setBase('#FF0000'); // Red base
  
  // 4. Draw some test elements
  editor.drawRect(500, 500, 800, 400, '#FFFFFF'); // White rectangle
  editor.drawCircle(1200, 700, 150, '#000000'); // Black circle
  editor.drawText('BMW M4 GT3', 600, 650, 72, '#000000'); // Text
  editor.drawText('#42', 1100, 750, 120, '#FFFFFF'); // Car number
  
  // 5. Composite with wireframe and AO
  editor.composite(template.wireframe, template.ao);
  
  // 6. Export to PNG
  const outputPath = join(__dirname, '../output/test-livery.png');
  await editor.exportPNG(outputPath);
  
  console.log('✅ POC Complete!');
  console.log(`View output: ${outputPath}`);
}

main().catch(console.error);
```

### Step 6: Package Configuration (`package.json`)

```json
{
  "name": "livery-builder-poc",
  "version": "1.0.0",
  "description": "POC for PSD-based livery editor",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "npm run build && node dist/index.js",
    "clean": "rm -rf dist output/*"
  },
  "dependencies": {
    "@webtoon/psd": "^0.4.0",
    "canvas": "^2.11.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Step 7: TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Testing the POC

```bash
# Build and run
npm start

# Expected output:
# ================================================================================
# PSD Canvas Editor POC
# ================================================================================
# 
# Loading PSD: .../AMS2_bmw_m4_gt3_template.psd
# PSD Size: 4096x4096
# Layers found: 10
#   - WIREFRAME (opacity: 1)
#   - AMBIENT OCCLUSION (opacity: 1)
#   - DECAL ZONES (opacity: 1)
#   - YOUR LIVERY HERE (opacity: 1)
#   ...
# 
# Loaded template: 4096x4096
# Layers: 10
# Wireframe layer: Found
# AO layer: Found
# 
# Exported to: .../output/test-livery.png
# ✅ POC Complete!
```

## Validation Checklist

- [ ] PSD loads without errors
- [ ] Wireframe layer extracted successfully
- [ ] AO layer extracted successfully
- [ ] Red base color visible in output
- [ ] White rectangle drawn correctly
- [ ] Black circle drawn correctly
- [ ] Text rendered (BMW M4 GT3 and #42)
- [ ] Wireframe visible as semi-transparent overlay
- [ ] AO creates depth/shadow effect
- [ ] Output PNG is 4096x4096
- [ ] Output PNG opens in image viewer

## Next Steps After POC

If POC succeeds:

1. **Web version** - Port to HTML5 Canvas in browser
2. **Interactive UI** - Add mouse drawing tools
3. **Layer management** - Toggle wireframe/AO on/off
4. **DDS export** - Integrate Python backend
5. **Template library** - Support all 4 AMS2 templates

## Estimated Timeline

- **POC Development:** 4-6 hours
- **Testing & Debugging:** 1-2 hours
- **Total:** ~8 hours for working proof-of-concept

## Success Criteria

✅ POC is successful if:
1. BMW M4 GT3 PSD loads
2. Output PNG shows red livery with white/black elements
3. Wireframe is visible as guide overlay
4. AO creates realistic depth
5. No errors during execution
