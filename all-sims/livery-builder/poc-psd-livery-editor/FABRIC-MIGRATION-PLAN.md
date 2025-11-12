# Fabric.js Migration Plan
## From POC to Production Livery Editor

---

## 🎯 Why Fabric.js?

### Decision Matrix

| Feature | Custom Canvas | KonvaJS | **Fabric.js** |
|---------|---------------|---------|---------------|
| PSD Layer Rendering | ✅ Done | ✅ Good | ✅ Best |
| Drawing Tools | ❌ Need to build | ⚠️ Basic | ✅ **Professional** |
| Image Editing | ❌ Need to build | ⚠️ Limited | ✅ **Built for this** |
| Filters (Brightness, etc) | ❌ Need to build | ❌ Manual | ✅ **WebGL filters** |
| Layer Blending | ❌ Need to build | ⚠️ Manual | ✅ **Built-in** |
| Zoom/Pan | ❌ Need to build | ✅ Good | ✅ **Good** |
| Bundle Size | ✅ 0KB | ⚠️ 90KB | ⚠️ 300KB |
| Performance | ✅ Fast (cached) | ✅ Fast | ✅ **Fast (WebGL)** |

**Winner: Fabric.js** - Already has everything we need for a livery editor.

### What We Get

✅ **Drawing Tools (Free)**
- Brush (PencilBrush, SprayBrush, CircleBrush)
- Shapes (Rectangle, Circle, Triangle, Polygon)
- Text with custom fonts
- Eraser
- Selection/move/resize/rotate

✅ **Image Editing (Free)**
- Brightness, Contrast, Saturation
- Blur, Sharpen
- Color filters (Sepia, Grayscale, Invert)
- WebGL acceleration

✅ **Layer Management (Free)**
- Layer blending modes (multiply, screen, overlay, etc.)
- Layer opacity
- Layer clipping/masking
- Group layers

✅ **Proven Patterns (Free)**
- 28k+ GitHub stars
- Battle-tested in production apps
- All patterns documented in OPEN-SOURCE-CODE-PATTERNS.md

---

## 📋 Migration Phases

### Phase 1: Foundation (Week 1)
**Goal:** Replace custom canvas with Fabric.js, keep all current features working.

#### Tasks:
1. **Install Fabric.js**
   ```bash
   npm install fabric
   ```

2. **Create FabricCanvas.tsx** (new component)
   - Replace `<canvas>` with `new fabric.Canvas()`
   - Keep PSD loading logic
   - Convert layers to `fabric.Image` objects
   - Apply caching patterns from OPEN-SOURCE-CODE-PATTERNS.md

3. **Migrate layer visibility**
   - Use `fabricObject.visible = true/false`
   - Apply dirty flag pattern (Pattern 2)

4. **Test performance**
   - Should be equal or better than current
   - FPS counter should show <16ms renders

**Reference:** OPEN-SOURCE-CODE-PATTERNS.md Section 2 (Dirty Flag System)

---

### Phase 2: Drawing Tools (Week 2)
**Goal:** Add brush, shapes, text, eraser.

#### Tasks:
1. **Brush tool**
   ```typescript
   canvas.isDrawingMode = true;
   canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
   canvas.freeDrawingBrush.width = 5;
   canvas.freeDrawingBrush.color = '#FF0000';
   ```

2. **Shape tools**
   ```typescript
   const rect = new fabric.Rect({
     left: 100, top: 100,
     fill: 'red', width: 50, height: 50
   });
   canvas.add(rect);
   ```

3. **Text tool**
   ```typescript
   const text = new fabric.IText('Click to edit', {
     left: 100, top: 100,
     fontFamily: 'Arial', fontSize: 20
   });
   canvas.add(text);
   ```

4. **Eraser tool**
   ```typescript
   canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
   ```

**Reference:** Fabric.js docs + OPEN-SOURCE-CODE-PATTERNS.md Section 5 (Object Caching)

---

### Phase 3: Advanced Features (Week 3)
**Goal:** Zoom, pan, filters, blending modes.

#### Tasks:
1. **Zoom/Pan**
   ```typescript
   // Mouse wheel zoom
   canvas.on('mouse:wheel', (opt) => {
     const delta = opt.e.deltaY;
     let zoom = canvas.getZoom();
     zoom *= 0.999 ** delta;
     canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
   });
   
   // Pan (middle mouse drag)
   canvas.on('mouse:down', (opt) => {
     if (opt.e.button === 1) { // Middle button
       canvas.isDragging = true;
       canvas.selection = false;
     }
   });
   ```

2. **Filters**
   ```typescript
   const image = canvas.getObjects()[0] as fabric.Image;
   image.filters = [
     new fabric.Image.filters.Brightness({ brightness: 0.2 }),
     new fabric.Image.filters.Contrast({ contrast: 0.1 })
   ];
   image.applyFilters();
   canvas.requestRenderAll();
   ```

3. **Blending modes**
   ```typescript
   fabricObject.globalCompositeOperation = 'multiply'; // or 'screen', 'overlay', etc.
   ```

4. **Enable viewport culling**
   ```typescript
   canvas.skipOffscreen = true; // Pattern 4 from OPEN-SOURCE-CODE-PATTERNS.md
   ```

**Reference:** OPEN-SOURCE-CODE-PATTERNS.md Section 4 (Viewport Culling)

---

### Phase 4: Performance Tuning (Week 4)
**Goal:** Photoshop-level performance with large PSDs.

#### Tasks:
1. **Implement cache size limits**
   - Pattern 3 from OPEN-SOURCE-CODE-PATTERNS.md
   - Cap cache at 4096x4096 (AMS2 PSD size)
   - Adjust zoom when capping

2. **Lazy loading**
   - Load first 10 layers immediately
   - Queue rest with `requestIdleCallback`
   - Show loading progress

3. **Group optimization**
   - Pattern 5 from OPEN-SOURCE-CODE-PATTERNS.md
   - Don't cache groups with shadows
   - Smart caching decisions

4. **Batch rendering**
   - Pattern 7 from OPEN-SOURCE-CODE-PATTERNS.md
   - Queue multiple changes
   - Render once per frame

**Reference:** OPEN-SOURCE-CODE-PATTERNS.md Sections 3, 5, 7

---

## 🔧 Code Migration Strategy

### Current Architecture
```
LiveryCanvas.tsx (Custom Canvas)
├── PSD Loading (@webtoon/psd)
├── Layer Caching (HTMLCanvasElement[])
├── Rendering (ctx.drawImage)
└── Performance Monitoring (render time, FPS)
```

### Target Architecture
```
FabricCanvas.tsx (Fabric.js Canvas)
├── PSD Loading (@webtoon/psd) ✅ Keep
├── Layer Objects (fabric.Image[]) ✅ Replace
├── Rendering (fabric.Canvas.renderAll) ✅ Replace
├── Drawing Tools (fabric.PencilBrush, etc.) ✅ Add
├── Filters (fabric.Image.filters) ✅ Add
├── Zoom/Pan (canvas.zoomToPoint) ✅ Add
└── Performance Monitoring (render time, FPS) ✅ Keep
```

### What We Keep
1. ✅ **PSD loading logic** - Works perfectly
2. ✅ **Layer list UI** - Just wire to Fabric objects
3. ✅ **Performance monitoring** - Adapt to Fabric events
4. ✅ **Export functionality** - `canvas.toDataURL()`

### What We Replace
1. ❌ **Custom canvas rendering** → `fabric.Canvas.renderAll()`
2. ❌ **Manual caching** → Fabric's automatic caching
3. ❌ **ctx.drawImage loops** → Fabric's object rendering

### What We Add
1. ✅ **Drawing toolbar** - Brush, shapes, text, eraser
2. ✅ **Color picker** - For tools
3. ✅ **Filter controls** - Brightness, contrast sliders
4. ✅ **Zoom controls** - Buttons + mouse wheel
5. ✅ **Blending mode dropdown** - Per layer

---

## 📊 Expected Performance

### Current (Custom Canvas)
| Metric | Before Caching | After Caching |
|--------|----------------|---------------|
| Layer Toggle | 500ms | ~50ms |
| Load 50 layers | 8-12s | 8-12s |
| FPS | ~2 FPS | ~20 FPS |

### Target (Fabric.js)
| Metric | Expected | Notes |
|--------|----------|-------|
| Layer Toggle | **<16ms** | Dirty flag + cache |
| Load 50 layers | **2-3s** | Lazy loading |
| FPS | **60 FPS** | Viewport culling + WebGL |
| Drawing | **<5ms** | Hardware accelerated |
| Filters | **<10ms** | WebGL shaders |

### Photoshop Comparison
| Feature | Photoshop | Our Target | Gap |
|---------|-----------|------------|-----|
| Layer Toggle | <10ms | <16ms | ✅ Close |
| Brush Latency | <5ms | <10ms | ⚠️ Acceptable |
| Zoom/Pan | Instant | <16ms | ✅ Close |
| Filter Apply | <50ms | <50ms | ✅ Match |

**Goal:** 80-90% of Photoshop performance (good enough for sim racers).

---

## 🚀 Implementation Order

### Sprint 1 (Foundation)
```typescript
// 1. Install Fabric.js
npm install fabric

// 2. Create basic Fabric canvas
import { Canvas } from 'fabric';

const canvas = new Canvas('canvas-element', {
  width: psd.width,
  height: psd.height,
  backgroundColor: '#FFFFFF'
});

// 3. Convert PSD layers to Fabric images
for (const psdLayer of psd.layers) {
  const pixels = await psdLayer.composite(false);
  const image = new fabric.Image(canvasElement, {
    left: psdLayer.left,
    top: psdLayer.top,
    selectable: false, // Not draggable yet
    evented: false     // No events yet
  });
  
  // Apply caching (Pattern 1)
  image.objectCaching = true;
  canvas.add(image);
}

// 4. Layer visibility
const toggleLayer = (index: number) => {
  const obj = canvas.item(index);
  obj.visible = !obj.visible;
  canvas.requestRenderAll(); // Batch render (Pattern 7)
};
```

### Sprint 2 (Drawing Tools)
```typescript
// Brush tool
const enableBrush = () => {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.width = 5;
  canvas.freeDrawingBrush.color = selectedColor;
};

// Shape tool
const addRectangle = () => {
  const rect = new fabric.Rect({
    left: 100, top: 100, fill: selectedColor,
    width: 100, height: 100
  });
  canvas.add(rect);
};

// Text tool
const addText = () => {
  const text = new fabric.IText('Team Name', {
    left: 100, top: 100,
    fontFamily: 'Arial Black',
    fontSize: 48,
    fill: selectedColor
  });
  canvas.add(text);
};
```

### Sprint 3 (Advanced Features)
```typescript
// Zoom/Pan
canvas.on('mouse:wheel', (opt) => {
  const delta = opt.e.deltaY;
  let zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.1) zoom = 0.1;
  canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
});

// Filters
const applyBrightness = (value: number) => {
  const activeObj = canvas.getActiveObject() as fabric.Image;
  if (!activeObj) return;
  
  activeObj.filters = [
    new fabric.Image.filters.Brightness({ brightness: value })
  ];
  activeObj.applyFilters();
  canvas.requestRenderAll();
};

// Blending mode
const setBlendMode = (mode: string) => {
  const activeObj = canvas.getActiveObject();
  if (activeObj) {
    activeObj.globalCompositeOperation = mode;
    canvas.requestRenderAll();
  }
};
```

### Sprint 4 (Performance)
```typescript
// Cache size limits (Pattern 3)
fabric.Object.prototype.objectCaching = true;
fabric.config.configure({
  perfLimitSizeTotal: 10000000, // 10M pixels max
  maxCacheSideLimit: 4096,      // AMS2 PSD size
  minCacheSideLimit: 256
});

// Viewport culling (Pattern 4)
canvas.skipOffscreen = true;

// Lazy loading (Pattern from research)
const lazyLoadLayers = async () => {
  const firstBatch = psdLayers.slice(0, 10);
  const restBatch = psdLayers.slice(10);
  
  // Load first 10 immediately
  for (const layer of firstBatch) {
    await loadLayerToCanvas(layer);
  }
  
  // Queue rest
  requestIdleCallback(() => {
    for (const layer of restBatch) {
      loadLayerToCanvas(layer);
    }
  });
};
```

---

## 🎨 UI Updates Needed

### New Toolbar Components

```typescript
// ToolbarComponent.tsx
<div className="toolbar">
  {/* Drawing Tools */}
  <button onClick={() => setTool('select')} className={tool === 'select' ? 'active' : ''}>
    ↖️ Select
  </button>
  <button onClick={() => setTool('brush')} className={tool === 'brush' ? 'active' : ''}>
    🖌️ Brush
  </button>
  <button onClick={() => setTool('rectangle')} className={tool === 'rectangle' ? 'active' : ''}>
    ⬜ Rectangle
  </button>
  <button onClick={() => setTool('circle')} className={tool === 'circle' ? 'active' : ''}>
    ⭕ Circle
  </button>
  <button onClick={() => setTool('text')} className={tool === 'text' ? 'active' : ''}>
    📝 Text
  </button>
  <button onClick={() => setTool('eraser')} className={tool === 'eraser' ? 'active' : ''}>
    🧹 Eraser
  </button>
  
  {/* Color Picker */}
  <input 
    type="color" 
    value={selectedColor} 
    onChange={(e) => setSelectedColor(e.target.value)}
  />
  
  {/* Brush Size */}
  <input 
    type="range" 
    min="1" 
    max="50" 
    value={brushSize} 
    onChange={(e) => setBrushSize(parseInt(e.target.value))}
  />
  <span>{brushSize}px</span>
</div>

// FilterPanel.tsx
<div className="filter-panel">
  <h3>Adjustments</h3>
  
  <label>
    Brightness
    <input 
      type="range" 
      min="-1" 
      max="1" 
      step="0.01"
      value={brightness}
      onChange={(e) => applyBrightness(parseFloat(e.target.value))}
    />
  </label>
  
  <label>
    Contrast
    <input 
      type="range" 
      min="-1" 
      max="1" 
      step="0.01"
      value={contrast}
      onChange={(e) => applyContrast(parseFloat(e.target.value))}
    />
  </label>
  
  <label>
    Saturation
    <input 
      type="range" 
      min="-1" 
      max="1" 
      step="0.01"
      value={saturation}
      onChange={(e) => applySaturation(parseFloat(e.target.value))}
    />
  </label>
</div>

// BlendModeSelector.tsx
<select value={blendMode} onChange={(e) => setBlendMode(e.target.value)}>
  <option value="source-over">Normal</option>
  <option value="multiply">Multiply</option>
  <option value="screen">Screen</option>
  <option value="overlay">Overlay</option>
  <option value="darken">Darken</option>
  <option value="lighten">Lighten</option>
  <option value="color-dodge">Color Dodge</option>
  <option value="color-burn">Color Burn</option>
</select>
```

---

## 📚 References

### Essential Reading
1. **OPEN-SOURCE-CODE-PATTERNS.md** - Our battle-tested pattern guide
2. **Fabric.js Docs** - http://fabricjs.com/docs/
3. **Fabric.js Demos** - http://fabricjs.com/demos/
4. **LIVE-DEMOS.md** - Playable performance examples
5. **PERFORMANCE-NOTES.md** - Optimization strategies

### Code Examples
- **Brush tool:** http://fabricjs.com/freedrawing
- **Filters:** http://fabricjs.com/image-filters
- **Zoom/Pan:** http://fabricjs.com/controls-customization
- **Caching:** OPEN-SOURCE-CODE-PATTERNS.md Section 2

---

## ⚠️ Migration Risks

### Potential Issues

1. **Bundle size increase**
   - Current: ~50KB (just @webtoon/psd)
   - After: ~350KB (+300KB Fabric.js)
   - Mitigation: Tree-shaking, lazy load Fabric

2. **Learning curve**
   - Fabric.js API is different from raw Canvas
   - Mitigation: Reference OPEN-SOURCE-CODE-PATTERNS.md

3. **Breaking changes**
   - Current layer system needs refactor
   - Mitigation: Keep old code in `LiveryCanvas.legacy.tsx` until migration complete

4. **Performance regression**
   - Fabric.js adds abstraction overhead
   - Mitigation: Use patterns from OPEN-SOURCE-CODE-PATTERNS.md, enable viewport culling

### Rollback Plan

If Fabric.js doesn't work:
1. Keep `LiveryCanvas.tsx` (current implementation)
2. Build drawing tools manually using raw Canvas API
3. Implement filters using WebGL shaders manually
4. ⚠️ This will take 3-6 months instead of 3-4 weeks

**Verdict:** Fabric.js is worth it. Saves ~5 months of development.

---

## ✅ Success Criteria

Migration is successful when:

1. ✅ **All current features work** - Layer visibility, export, performance monitoring
2. ✅ **Drawing tools implemented** - Brush, shapes, text, eraser
3. ✅ **Filters work** - Brightness, contrast, saturation
4. ✅ **Zoom/pan smooth** - 60 FPS at all zoom levels
5. ✅ **Performance matches target** - <16ms render, 60 FPS
6. ✅ **Large PSD loads fast** - BMW M4 GT3 template <3s load
7. ✅ **Bundle size acceptable** - <500KB total

---

## 🎯 Next Steps

1. **Review this plan** - Any concerns?
2. **Start Phase 1** - Install Fabric.js, create FabricCanvas.tsx
3. **Test early** - Load single PSD layer with Fabric
4. **Iterate** - Keep what works, fix what doesn't

**Ready to start?** Let's begin with Phase 1: Foundation.
