# Performance Optimization Notes

## Current Performance Issues
- **Every layer is composited on every render** (very slow)
- No caching of rendered layers
- All layers rendered regardless of viewport
- Full canvas repaint on every toggle

## Optimization Strategies (Ordered by Impact)

### 1. **Layer Caching** (HIGHEST IMPACT) ⭐⭐⭐⭐⭐
**Problem**: Currently calling `layer.composite()` loads ALL layer pixels every time the PSD loads.
**Solution**: Cache each layer as an `OffscreenCanvas` or `HTMLCanvasElement` after first render.

```typescript
interface CachedLayer {
  name: string;
  canvas: HTMLCanvasElement;  // Pre-rendered layer
  width: number;
  height: number;
  left: number;
  top: number;
  visible: boolean;
  dirty: boolean;  // Mark when needs re-render
}
```

**Expected Gain**: 10-50x faster rendering (only composite once, reuse cached canvas)

### 2. **Lazy Loading** (HIGH IMPACT) ⭐⭐⭐⭐
**Problem**: Loading all 50+ layers on file open takes 5-10 seconds.
**Solution**: Only load visible layers initially, load others on-demand.

```typescript
// Load only first 5 visible layers
const initialLayers = psd.layers.slice(0, 5);

// Load rest in background with requestIdleCallback
requestIdleCallback(() => loadRemainingLayers());
```

**Expected Gain**: 3-5x faster initial load

### 3. **Viewport Culling** (MEDIUM IMPACT) ⭐⭐⭐
**Problem**: Rendering layers outside visible canvas area.
**Solution**: Skip rendering layers completely outside viewport bounds.

```typescript
function isLayerInViewport(layer: LayerData, zoom: number, pan: Point): boolean {
  const layerBounds = {
    left: layer.left * zoom + pan.x,
    top: layer.top * zoom + pan.y,
    right: (layer.left + layer.width) * zoom + pan.x,
    bottom: (layer.top + layer.height) * zoom + pan.y
  };
  
  return !(layerBounds.right < 0 || 
           layerBounds.left > canvasWidth ||
           layerBounds.bottom < 0 ||
           layerBounds.top > canvasHeight);
}
```

**Expected Gain**: 2-3x faster with zoom/pan

### 4. **Level of Detail (LOD)** (MEDIUM IMPACT) ⭐⭐⭐
**Problem**: Rendering full 4K layer pixels when zoomed out.
**Solution**: Create mipmap levels (full, 1/2, 1/4, 1/8 resolution).

```typescript
interface LayerLOD {
  full: HTMLCanvasElement;      // 4096x4096
  half: HTMLCanvasElement;      // 2048x2048
  quarter: HTMLCanvasElement;   // 1024x1024
  eighth: HTMLCanvasElement;    // 512x512
}

function getAppropriateL OD(zoom: number): HTMLCanvasElement {
  if (zoom >= 1.0) return lod.full;
  if (zoom >= 0.5) return lod.half;
  if (zoom >= 0.25) return lod.quarter;
  return lod.eighth;
}
```

**Expected Gain**: 4-16x faster when zoomed out

### 5. **Dirty Rectangle Optimization** (LOW IMPACT) ⭐⭐
**Problem**: Redrawing entire canvas when only one layer changed.
**Solution**: Track dirty regions and only clear/redraw affected areas.

```typescript
let dirtyRect = { x: 0, y: 0, width: 0, height: 0 };

function markLayerDirty(layer: LayerData) {
  dirtyRect = expandRect(dirtyRect, {
    x: layer.left,
    y: layer.top,
    width: layer.width,
    height: layer.height
  });
}

function renderDirtyRegion(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(dirtyRect.x, dirtyRect.y, dirtyRect.width, dirtyRect.height);
  // Only render layers intersecting dirtyRect
}
```

**Expected Gain**: 1.5-2x faster on layer toggle

### 6. **WebGL Acceleration** (VERY HIGH IMPACT - FUTURE) ⭐⭐⭐⭐⭐
**Problem**: CPU canvas compositing is slow for 50+ layers.
**Solution**: Use WebGL to composite layers on GPU.

```typescript
// Each layer becomes a WebGL texture
const texture = gl.createTexture();
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layerCanvas);

// Composite with GPU blend modes
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
```

**Expected Gain**: 10-100x faster layer compositing
**Complexity**: HIGH - requires WebGL renderer

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Add layer caching with `HTMLCanvasElement`
2. ✅ Implement lazy loading (load first 10 layers)
3. ✅ Add `dirty` flag to skip re-rendering unchanged layers

### Phase 2: Medium Effort (4-6 hours)
4. Add viewport culling with zoom/pan support
5. Implement dirty rectangle tracking
6. Add background worker for layer loading

### Phase 3: Advanced (1-2 days)
7. Implement LOD/mipmap generation
8. Add WebGL compositor option
9. Implement tile-based rendering for huge PSDs

---

## Real-World Performance Targets

| Scenario | Current | Target | Photoshop |
|----------|---------|--------|-----------|
| **Open PSD (50 layers)** | 8-12s | <2s | <1s |
| **Toggle layer** | 500ms | <50ms | <16ms |
| **Zoom/pan** | 300ms | <16ms | <16ms |
| **Initial render** | 5s | <500ms | <200ms |

---

## Code Example: Optimized Layer Caching

```typescript
interface CachedLayerData {
  name: string;
  canvas: HTMLCanvasElement | null;  // Cached rendering
  width: number;
  height: number;
  left: number;
  top: number;
  visible: boolean;
  dirty: boolean;  // Needs re-render
  loaded: boolean;  // Pixels loaded from PSD
}

const [layers, setLayers] = useState<CachedLayerData[]>([]);

// Load layers lazily
useEffect(() => {
  if (!psd) return;

  const initLayers = psd.layers.map(layer => ({
    name: layer.name,
    canvas: null,
    width: layer.width,
    height: layer.height,
    left: layer.left,
    top: layer.top,
    visible: true,
    dirty: true,
    loaded: false
  }));

  setLayers(initLayers);

  // Load first 10 layers immediately
  loadLayerBatch(initLayers.slice(0, 10));

  // Load rest in background
  requestIdleCallback(() => {
    loadLayerBatch(initLayers.slice(10));
  });
}, [psd]);

async function loadLayerBatch(layersToLoad: CachedLayerData[]) {
  for (const layer of layersToLoad) {
    const pixels = await psd.layers[layer.index].composite(false);
    
    // Cache layer as canvas
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(layer.width, layer.height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    
    layer.canvas = canvas;
    layer.loaded = true;
    layer.dirty = false;
  }
}

// Render only changed layers
function renderLivery(ctx: CanvasRenderingContext2D) {
  // Clear background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, psd.width, psd.height);

  // Render from bottom to top
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    
    if (!layer.visible || !layer.canvas) continue;
    
    // Use cached canvas - FAST!
    ctx.drawImage(layer.canvas, layer.left, layer.top);
  }
}
```

---

## Tools for Performance Monitoring

```typescript
// Add to component
const [renderTime, setRenderTime] = useState(0);

function renderLivery(ctx: CanvasRenderingContext2D) {
  const start = performance.now();
  
  // ... rendering code ...
  
  const end = performance.now();
  setRenderTime(end - start);
}

// Display in UI
<p>Render time: {renderTime.toFixed(1)}ms ({(1000/renderTime).toFixed(0)} FPS)</p>
```

---

## References

- **fabric.js object caching**: https://github.com/fabricjs/fabric.js/blob/main/CHANGELOG.md#170
- **@webtoon/psd benchmarks**: https://webtoon.github.io/psd/benchmark/
- **WebGL compositing**: https://github.com/fabricjs/fabric.js/tree/main/src/filters/WebGLFilterBackend.ts
- **GIMP tile architecture**: Uses 64x64 pixel tiles with copy-on-write
- **Photopea**: Browser-based Photoshop clone (proprietary but very fast)

---

## Next Steps

1. Implement layer caching (see code example above)
2. Add performance monitor to UI
3. Profile with Chrome DevTools Performance tab
4. Measure before/after with large PSDs (50+ layers)
5. Consider WebGL backend if still slow
