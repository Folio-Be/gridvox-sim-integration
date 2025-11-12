# Missing Features Analysis
## Comparing SimVox Feature List vs Trading Paints Builder

**Date:** November 12, 2025  
**Purpose:** Identify gaps between our Fabric.js feature plan and Trading Paints Builder capabilities

---

## 🔍 Trading Paints Features We MISSED

### 1. ⭐⭐⭐⭐⭐ CRITICAL: **Reference Window / Image Overlay**

**What Trading Paints Has:**
- "Painting guides" - Grid overlays, wireframes, sponsor-placement blocks
- Visual guides for where sponsors should go
- Wireframe mode to see car structure

**What We're Missing:**
```typescript
// Reference Window Feature
interface ReferenceWindow {
  type: 'floating' | 'overlay' | 'split-screen';
  content: ReferenceContent[];
  opacity: number;
  lockPosition: boolean;
  alwaysOnTop: boolean;
}

interface ReferenceContent {
  type: 'image' | 'grid' | 'wireframe' | 'sponsor-zones';
  source?: string;  // Image URL/path
  visible: boolean;
  opacity: number;
}
```

**Why It Matters for Racing:**
- Reference photos of real cars for inspiration
- Team livery guidelines (sponsor placement rules)
- Grid overlays for precise alignment
- Wireframe to understand car panels
- Multiple reference images side-by-side

**Implementation Priority:** **CRITICAL**

---

### 2. ⭐⭐⭐⭐⭐ CRITICAL: **Grid & Guide System**

**What Trading Paints Has:**
- Toggle-able grid overlays
- Snap-to-grid functionality
- Guide lines for alignment

**What We Have:**
- Grid/Rulers listed as "MEDIUM" priority (❌ in Basic Mode)

**Gap:** Grid is CRITICAL, not medium! Every racing livery needs precise alignment.

**Fix:** Move Grid/Rulers to CRITICAL tier, add to Basic Mode

---

### 3. ⭐⭐⭐⭐⭐ CRITICAL: **Sponsor Placement Zones**

**What Trading Paints Has:**
- Pre-defined sponsor zones overlay
- Visual guides showing where logos should go
- Common placement areas highlighted

**What We're Missing:**
```typescript
interface SponsorZone {
  id: string;
  name: string;           // "Front Fender", "Hood", "Roof", "Door"
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  recommended: boolean;   // Is this a prime sponsor location?
  category: 'primary' | 'secondary' | 'tertiary';
}

// Racing-specific sponsor placement
const commonSponsorZones: SponsorZone[] = [
  { name: "Hood Center", category: "primary" },
  { name: "Front Fender", category: "primary" },
  { name: "Door Upper", category: "primary" },
  { name: "Roof", category: "secondary" },
  { name: "Rear Quarter Panel", category: "secondary" },
  { name: "Wing", category: "tertiary" },
];
```

**Why It Matters:**
- Beginners don't know where sponsors should go
- Racing regulations often dictate placement zones
- Helps maintain professional look

**Implementation Priority:** **HIGH** (should be in Basic Mode)

---

### 4. ⭐⭐⭐⭐⭐ CRITICAL: **Wireframe/Outline Mode**

**What Trading Paints Has:**
- Wireframe mode showing car structure
- Panel boundaries visible
- Helps understand car geometry

**What We're Missing:**
- Wireframe overlay option
- Panel edge visualization

**Why It Matters:**
- Understand where doors/hood/fenders separate
- Avoid placing logos across panel gaps
- See car structure underneath paint

**Implementation Priority:** **CRITICAL**

---

### 5. ⭐⭐⭐⭐ HIGH: **Real-time 3D Preview (Sim Preview)**

**What Trading Paints Has:**
- "Sim Preview" - Integration with iRacing 3D viewer
- See livery on actual 3D car model
- Rotate car in 3D while editing

**What We Have:**
- Not mentioned in feature list at all

**Gap:** This is HUGE differentiator. Must have for production.

```typescript
interface SimPreview {
  sim: 'AMS2' | 'ACC' | 'iRacing' | 'AC';
  carModel: string;
  rotation: { x: number; y: number; z: number };
  lighting: 'studio' | 'track' | 'garage';
  viewMode: '2d-canvas' | '3d-preview' | 'split';
}

// Live sync between 2D canvas and 3D model
function syncCanvasTo3DModel(canvas: fabric.Canvas, model: ThreeJS.Mesh) {
  const texture = canvas.toDataURL();
  model.material.map = new THREE.TextureLoader().load(texture);
  model.material.needsUpdate = true;
}
```

**Implementation Priority:** **CRITICAL** (Phase 2)

---

### 6. ⭐⭐⭐⭐ HIGH: **View Rotation (3D View Control)**

**What Trading Paints Has:**
- Full 360° rotation around car
- Work on side, front, rear, top views
- Seamless view switching

**What We Have:**
- Zoom & Pan only (2D canvas)
- No 3D rotation mentioned

**Gap:** For multi-texture workflow, need to see different car angles

**Implementation Priority:** **HIGH** (with 3D preview)

---

### 7. ⭐⭐⭐⭐ HIGH: **Vector Graphics Library**

**What Trading Paints Has:**
- "Hundreds of original vector graphics"
- Patterns, logos, fictional brands
- Drag-and-drop library

**What We Have:**
- "Sponsor Library" in racing-specific features ✅
- But no mention of generic patterns/shapes library

**Gap:** Need built-in library of:
- Racing stripes patterns
- Geometric patterns
- Decorative elements
- Flag graphics

```typescript
interface GraphicsLibrary {
  categories: LibraryCategory[];
}

interface LibraryCategory {
  name: string;
  items: LibraryItem[];
}

interface LibraryItem {
  id: string;
  name: string;
  type: 'pattern' | 'logo' | 'shape' | 'decoration';
  format: 'svg' | 'png';
  thumbnail: string;
  tags: string[];
}

// Example categories
const libraryCategories = [
  "Racing Stripes",
  "Geometric Patterns",
  "Sponsor Logos (Fictional)",
  "Flags & Emblems",
  "Numbers & Digits",
  "Textures (Carbon, Metal)",
  "Decorative Elements"
];
```

**Implementation Priority:** **HIGH**

---

### 8. ⭐⭐⭐⭐ HIGH: **Finish/Material System**

**What Trading Paints Has:**
- Chrome finish
- Flat/matte finish
- Metallic finish
- Spec map generation

**What We're Missing:**
- No material/finish system in feature list
- No spec map support

**Racing Importance:**
- Gloss vs matte paint
- Metallic vs flat colors
- Chrome accents
- Carbon fiber texture

```typescript
interface MaterialSystem {
  finishType: 'chrome' | 'metallic' | 'flat' | 'gloss' | 'carbon';
  roughness: number;      // 0 = mirror, 1 = matte
  metalness: number;      // 0 = plastic, 1 = metal
  specularMap?: string;   // For advanced reflections
}

// Per-layer material
class LiveryLayer {
  material: MaterialSystem;
  
  applyFinish(finish: MaterialSystem) {
    // Generate spec map for sim export
    // Apply visual preview in editor
  }
}
```

**Implementation Priority:** **HIGH** (Phase 3)

---

### 9. ⭐⭐⭐ MEDIUM: **Base Paint Patterns (iRacing)**

**What Trading Paints Has:**
- "iRacing's layered Base Paint patterns"
- Pre-made car paint schemes
- Template starting points

**What We're Missing:**
- Car template library
- Pre-made base paint schemes

**SimVox Equivalent:**
- Need library of car templates per sim
- Base livery templates to start from

```typescript
interface CarTemplate {
  sim: 'AMS2' | 'ACC' | 'iRacing';
  car: string;
  baseTextures: {
    body: string;
    windows: string;
    decals: string;
  };
  previewImage: string;
}

interface BasePaintScheme {
  name: string;
  description: string;
  colors: string[];
  patterns: 'stripes' | 'solid' | 'two-tone' | 'complex';
  thumbnail: string;
}
```

**Implementation Priority:** **MEDIUM**

---

### 10. ⭐⭐⭐ MEDIUM: **Collaboration Features**

**What Trading Paints Has:**
- Project sharing
- Real-time collaboration
- Multi-user editing
- Live change watching

**What We're Missing:**
- No collaboration in feature list
- No real-time sync

**Gap:** This is modern UX expectation (Google Docs, Figma)

**Implementation Priority:** **MEDIUM** (Phase 3+)

---

### 11. ⭐⭐⭐ MEDIUM: **Cloud Storage & Project Management**

**What Trading Paints Has:**
- Cloud-based project storage
- Save/load from anywhere
- Project history (implied)

**What We're Missing:**
- No mention of cloud storage
- Desktop app = local files only?

**Decision Needed:**
- Hybrid: Local files + optional cloud sync?
- Full cloud: All projects stored online?
- Tauri advantage: Can do both!

```typescript
interface ProjectStorage {
  mode: 'local' | 'cloud' | 'hybrid';
  localPath?: string;
  cloudSync?: {
    provider: 'AWS S3' | 'Azure Blob' | 'Google Cloud';
    autoSync: boolean;
    lastSynced: Date;
  };
}
```

**Implementation Priority:** **MEDIUM**

---

### 12. ⭐⭐ LOW: **Showroom / Community Gallery**

**What Trading Paints Has:**
- Showroom submission
- Community gallery
- Share designs publicly

**What We're Missing:**
- No community features

**SimVox Opportunity:**
- Integrate with existing SimVox community
- Livery marketplace
- Social sharing

**Implementation Priority:** **LOW** (Post-MVP)

---

## 📋 Updated Feature Priority List

### NEW Critical Features (Add to Basic Mode)

| Feature | Why Critical | Trading Paints Has | We Planned |
|---------|--------------|-------------------|-----------|
| **Reference Window** | View inspiration while designing | ✅ | ❌ MISSING |
| **Grid Overlays** | Precise alignment | ✅ | ⚠️ Was "Medium" |
| **Wireframe Mode** | See car structure | ✅ | ❌ MISSING |
| **Sponsor Zones** | Beginner guidance | ✅ | ❌ MISSING |

### NEW High-Priority Features (Add to Advanced Mode)

| Feature | Racing Importance | Trading Paints Has | We Planned |
|---------|------------------|-------------------|-----------|
| **3D Preview** | See livery on car model | ✅ | ❌ MISSING |
| **View Rotation** | Work on all car angles | ✅ | ❌ MISSING |
| **Graphics Library** | Pre-made patterns/logos | ✅ | ⚠️ Partial (sponsors only) |
| **Material System** | Chrome/metallic/matte | ✅ | ❌ MISSING |

---

## 🎨 Reference Window Implementation

### UI Design

```
┌─────────────────────────────────────────────────────────────┐
│  SIMVOX LIVERY BUILDER                        [⚙️ Advanced] │
├─────────────────────────────────────────────────────────────┤
│  [🖼️ Reference]  [🚗 Body]  [🪟 Windows]  [🎨 Decals]      │
├──────────────┬──────────────────────────────┬───────────────┤
│  LAYERS      │    CANVAS                    │  REFERENCE    │
│              │                              │  ┌──────────┐ │
│  ☑️ Hood     │    [Main editing canvas]     │  │ Photo 1  │ │
│  ☑️ Doors    │                              │  │          │ │
│  ☑️ Roof     │    4096x4096                 │  └──────────┘ │
│              │                              │  ┌──────────┐ │
│  My Edits:   │    Zoom: 100%                │  │ Photo 2  │ │
│  📁 Sponsors │                              │  │          │ │
│              │    [Grid overlay toggle]     │  └──────────┘ │
│              │    [Wireframe toggle]        │               │
│              │    [Zones toggle]            │  + Add Ref   │
└──────────────┴──────────────────────────────┴───────────────┘
```

### Floating Reference Window (Alternative)

```typescript
function FloatingReferenceWindow() {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [opacity, setOpacity] = useState(0.9);
  const [alwaysOnTop, setAlwaysOnTop] = useState(true);
  
  return (
    <Rnd
      position={position}
      size={size}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, pos) => {
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition(pos);
      }}
      style={{
        background: 'rgba(15, 15, 35, 0.95)',
        border: '2px solid #667eea',
        borderRadius: '12px',
        zIndex: alwaysOnTop ? 9999 : 100,
        opacity
      }}
    >
      <div className="reference-window">
        <div className="reference-header">
          <h3>📸 Reference Images</h3>
          <div className="controls">
            <label>
              Opacity: 
              <input 
                type="range" 
                min="0.3" 
                max="1" 
                step="0.1" 
                value={opacity}
                onChange={e => setOpacity(parseFloat(e.target.value))}
              />
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={alwaysOnTop}
                onChange={e => setAlwaysOnTop(e.target.checked)}
              />
              Always on Top
            </label>
            <button onClick={onClose}>✕</button>
          </div>
        </div>
        
        <div className="reference-images" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.5rem',
          padding: '1rem',
          overflowY: 'auto',
          height: 'calc(100% - 60px)'
        }}>
          {references.map(ref => (
            <ReferenceImageCard 
              key={ref.id}
              image={ref}
              onRemove={() => removeReference(ref.id)}
              onSetOpacity={opacity => updateReferenceOpacity(ref.id, opacity)}
            />
          ))}
          
          <button 
            className="add-reference-btn"
            onClick={addReferenceImage}
            style={{
              border: '2px dashed #667eea',
              borderRadius: '8px',
              minHeight: '120px',
              cursor: 'pointer'
            }}
          >
            + Add Image
          </button>
        </div>
      </div>
    </Rnd>
  );
}

function ReferenceImageCard({ image, onRemove, onSetOpacity }: ReferenceImageCardProps) {
  const [opacity, setOpacity] = useState(image.opacity || 1);
  const [viewMode, setViewMode] = useState<'thumbnail' | 'fullscreen'>('thumbnail');
  
  return (
    <div className="reference-card">
      <img 
        src={image.url} 
        alt={image.name}
        style={{ 
          width: '100%', 
          height: 'auto',
          opacity,
          cursor: 'pointer',
          borderRadius: '4px'
        }}
        onClick={() => setViewMode('fullscreen')}
      />
      
      <div className="card-controls">
        <input 
          type="range"
          min="0.3"
          max="1"
          step="0.1"
          value={opacity}
          onChange={e => {
            const newOpacity = parseFloat(e.target.value);
            setOpacity(newOpacity);
            onSetOpacity(newOpacity);
          }}
          style={{ width: '100%' }}
        />
        
        <div className="buttons">
          <button onClick={() => setViewMode('fullscreen')} title="Fullscreen">
            🔍
          </button>
          <button onClick={onRemove} title="Remove">
            🗑️
          </button>
        </div>
      </div>
      
      {viewMode === 'fullscreen' && (
        <FullscreenImageView 
          image={image}
          onClose={() => setViewMode('thumbnail')}
        />
      )}
    </div>
  );
}
```

### Grid Overlay

```typescript
function GridOverlay({ canvas, enabled, spacing = 50, color = '#667eea' }: GridOverlayProps) {
  useEffect(() => {
    if (!enabled || !canvas) return;
    
    // Draw grid on canvas overlay
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Vertical lines
    for (let x = 0; x <= width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    
  }, [canvas, enabled, spacing, color]);
  
  return null;
}

// UI Control
function GridControl() {
  const [gridEnabled, setGridEnabled] = useState(false);
  const [gridSpacing, setGridSpacing] = useState(50);
  
  return (
    <div className="grid-control">
      <label>
        <input 
          type="checkbox"
          checked={gridEnabled}
          onChange={e => setGridEnabled(e.target.checked)}
        />
        Show Grid
      </label>
      
      {gridEnabled && (
        <label>
          Spacing:
          <input 
            type="number"
            value={gridSpacing}
            onChange={e => setGridSpacing(parseInt(e.target.value))}
            min={10}
            max={200}
            step={10}
          />
          px
        </label>
      )}
    </div>
  );
}
```

### Wireframe Overlay

```typescript
interface WireframeOverlay {
  panels: CarPanel[];
  visible: boolean;
  color: string;
  lineWidth: number;
}

interface CarPanel {
  name: string;        // "Hood", "Door (Driver)", "Fender (Front Right)"
  points: Point[];     // Panel boundary vertices
  type: 'body' | 'window' | 'wheel' | 'accessory';
}

function WireframeLayer({ panels, visible, color = '#00ff00', lineWidth = 2 }: WireframeLayerProps) {
  if (!visible) return null;
  
  return (
    <svg 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {panels.map(panel => (
        <g key={panel.name}>
          {/* Panel outline */}
          <polyline
            points={panel.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth={lineWidth}
            strokeDasharray="5,5"
          />
          
          {/* Panel label */}
          <text
            x={getCenterX(panel.points)}
            y={getCenterY(panel.points)}
            fill={color}
            fontSize="12px"
            textAnchor="middle"
            style={{ userSelect: 'none' }}
          >
            {panel.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

// AMS2 example: Load wireframe from car template
async function loadCarWireframe(sim: string, car: string): Promise<CarPanel[]> {
  const response = await fetch(`/api/wireframes/${sim}/${car}.json`);
  return response.json();
}
```

### Sponsor Placement Zones

```typescript
function SponsorZonesOverlay({ zones, visible, onZoneClick }: SponsorZonesProps) {
  if (!visible) return null;
  
  return (
    <div className="sponsor-zones-overlay">
      {zones.map(zone => (
        <div
          key={zone.id}
          className={`sponsor-zone ${zone.category}`}
          style={{
            position: 'absolute',
            left: zone.bounds.x,
            top: zone.bounds.y,
            width: zone.bounds.width,
            height: zone.bounds.height,
            border: zone.recommended ? '3px solid #00ff00' : '2px dashed #667eea',
            background: 'rgba(102, 126, 234, 0.1)',
            cursor: 'pointer',
            pointerEvents: 'all'
          }}
          onClick={() => onZoneClick(zone)}
        >
          <div className="zone-label" style={{
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            borderRadius: '4px'
          }}>
            {zone.name}
            {zone.recommended && ' ⭐'}
          </div>
        </div>
      ))}
    </div>
  );
}

// Example zones for GT3 car
const gt3SponsorZones: SponsorZone[] = [
  {
    id: 'hood-center',
    name: 'Hood Center',
    bounds: { x: 1800, y: 800, width: 500, height: 300 },
    recommended: true,
    category: 'primary'
  },
  {
    id: 'front-fender-left',
    name: 'Front Fender (Driver)',
    bounds: { x: 400, y: 1200, width: 400, height: 200 },
    recommended: true,
    category: 'primary'
  },
  {
    id: 'door-upper',
    name: 'Door Upper',
    bounds: { x: 1200, y: 1500, width: 600, height: 250 },
    recommended: true,
    category: 'primary'
  },
  {
    id: 'roof',
    name: 'Roof',
    bounds: { x: 1600, y: 400, width: 800, height: 400 },
    recommended: false,
    category: 'secondary'
  },
  {
    id: 'rear-quarter',
    name: 'Rear Quarter Panel',
    bounds: { x: 2800, y: 1400, width: 500, height: 300 },
    recommended: false,
    category: 'secondary'
  },
  {
    id: 'wing',
    name: 'Rear Wing',
    bounds: { x: 3200, y: 600, width: 400, height: 150 },
    recommended: false,
    category: 'tertiary'
  }
];
```

---

## ✅ Action Items

### Immediate (Add to Current Feature List)

1. **Reference Window** - Add to CRITICAL tier, Basic Mode
2. **Grid Overlays** - Move from MEDIUM to CRITICAL, add to Basic Mode
3. **Wireframe Mode** - Add to CRITICAL tier, Basic Mode
4. **Sponsor Zones** - Add to HIGH tier, Basic Mode
5. **Graphics Library** - Expand beyond sponsors, add to HIGH tier

### Phase 2 (Production Features)

6. **3D Preview** - Add to CRITICAL tier, Advanced Mode
7. **View Rotation** - With 3D preview
8. **Material System** - Add to HIGH tier, Advanced Mode
9. **Base Templates** - Car templates per sim

### Phase 3 (Advanced Features)

10. **Real-time Collaboration** - Multi-user editing
11. **Cloud Storage** - Hybrid local + cloud sync
12. **Community Gallery** - SimVox livery marketplace

---

## 📊 Updated Feature Count

**Before:**
- Basic Mode: 15 features
- Advanced Mode: 38 features
- Racing-Specific: 5 features
- **Total: 43 features**

**After (with Trading Paints gaps filled):**
- Basic Mode: 19 features (+4: Reference Window, Grid, Wireframe, Zones)
- Advanced Mode: 45 features (+7: 3D Preview, Rotation, Graphics Library expanded, Materials, Templates, Collaboration, Cloud)
- Racing-Specific: 5 features (unchanged)
- **Total: 50 features**

---

## 🎯 Conclusion

Trading Paints Builder revealed critical gaps in our planning:

1. ✅ **Reference Window** - Essential for beginners looking at inspiration
2. ✅ **Grid/Wireframe/Zones** - Alignment and guidance tools
3. ✅ **3D Preview** - Game-changer for livery design
4. ✅ **Graphics Library** - Pre-made patterns save time
5. ✅ **Material System** - Gloss/matte/chrome for realism

These aren't "nice-to-haves" - they're **table stakes** for a competitive livery editor in 2025.

**Next Step:** Update LIVERY-EDITOR-FEATURES.md with these additions.
