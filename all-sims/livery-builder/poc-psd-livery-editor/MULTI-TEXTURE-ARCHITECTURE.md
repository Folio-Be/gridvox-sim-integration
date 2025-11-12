# Multi-Texture Livery Management
## Handling Complex Racing Livery Files

**Problem:** Racing sims use multiple texture files per car:
- **AMS2/ACC:** 10-15 files (body.dds, windows.dds, interior.dds, driver.dds, etc.)
- **iRacing:** 8-12 TGA files (car, decals, number, sponsor, windshield, etc.)
- **AC:** 5-10 DDS files (skin.dds, livery.dds, interior.dds, etc.)

**Challenge:** How to design liveries across multiple canvases in one interface?

---

## 🎯 Recommended Approach: Tab-Based Canvas Switcher

### Why This Works Best for Liveries

✅ **Familiar UX** - Like Photoshop's "File Tabs"  
✅ **Clear context** - Always know which texture you're editing  
✅ **Copy/paste between tabs** - Duplicate sponsors across textures  
✅ **Individual zoom/pan** - Each texture has its own viewport  
✅ **Memory efficient** - Only render active canvas  

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  SIMVOX LIVERY BUILDER                        [⚙️ Advanced] │
├─────────────────────────────────────────────────────────────┤
│  📁 Project: BMW_M4_GT3_TeamSimVox                          │
├─────────────────────────────────────────────────────────────┤
│  TEXTURE TABS:                                              │
│  [🚗 Body (4096x4096)]* [🪟 Windows (2048x2048)]            │
│  [🎨 Decals (2048x2048)] [🔢 Numbers (1024x1024)]           │
│  [👤 Driver (512x512)]   [+ Add Texture]                    │
├──────────────┬──────────────────────────────┬───────────────┤
│  LAYERS      │    ACTIVE CANVAS             │  PROPERTIES   │
│              │    (Body.dds shown)          │               │
│  Body.dds:   │                              │               │
│  ☑️ Hood     │    4096 x 4096 px            │               │
│  ☑️ Doors    │                              │               │
│  ☑️ Roof     │    [Canvas rendering]        │               │
│              │                              │               │
│  My Edits:   │    Zoom: 100%                │               │
│  📁 Sponsors │                              │               │
│    ├─ Logo1 │    📊 60 FPS                  │               │
│    └─ Logo2 │                              │               │
│  📁 Numbers  │                              │               │
│    └─ #23   │                              │               │
└──────────────┴──────────────────────────────┴───────────────┘
```

---

## 🏗️ Data Structure

### Livery Project (Multi-Canvas)

```typescript
interface LiveryProject {
  metadata: {
    name: string;               // "BMW M4 GT3 - Team SimVox"
    sim: 'AMS2' | 'ACC' | 'iRacing' | 'AC';
    car: string;                // "BMW M4 GT3"
    author: string;
    teamColors: string[];
    created: Date;
    modified: Date;
  };
  
  // Multiple textures (canvases)
  textures: LiveryTexture[];
  
  // Shared resources
  sharedAssets: {
    sponsors: SponsorLogo[];
    teamLogos: Image[];
    numberTemplates: NumberTemplate[];
  };
}

interface LiveryTexture {
  id: string;
  name: string;                 // "Body", "Windows", "Decals"
  type: 'body' | 'windows' | 'decals' | 'numbers' | 'interior' | 'driver' | 'custom';
  
  // Canvas state
  fabricCanvas: fabric.Canvas;  // Each texture has own Fabric canvas
  
  // File info
  originalFile?: {
    path: string;               // Original PSD/DDS path
    format: 'psd' | 'dds' | 'tga' | 'png';
    width: number;
    height: number;
  };
  
  // Layers (from PSD or user-added)
  layers: TextureLayer[];
  
  // Canvas settings
  viewport: {
    zoom: number;
    panX: number;
    panY: number;
  };
  
  // Export settings
  export: {
    filename: string;           // "body.dds"
    format: 'dds' | 'tga' | 'png';
    compression: 'DXT1' | 'DXT5' | 'BC7' | 'none';
  };
}

interface TextureLayer {
  id: string;
  name: string;
  type: 'psd-layer' | 'user-added' | 'sponsor' | 'number' | 'text' | 'shape';
  visible: boolean;
  locked: boolean;
  
  // Reference to Fabric.js object
  fabricObject?: fabric.Object;
  
  // PSD layer data (if applicable)
  psdLayer?: {
    originalIndex: number;
    blendMode: string;
    opacity: number;
  };
}
```

---

## 🎨 Implementation Examples

### 1. Tab-Based Canvas Switcher (RECOMMENDED)

```typescript
function LiveryEditor() {
  const [project, setProject] = useState<LiveryProject>();
  const [activeTextureId, setActiveTextureId] = useState<string>();
  
  const activeTexture = project?.textures.find(t => t.id === activeTextureId);
  
  return (
    <div className="livery-editor">
      {/* Texture Tabs */}
      <div className="texture-tabs">
        {project?.textures.map(texture => (
          <TextureTab
            key={texture.id}
            texture={texture}
            active={texture.id === activeTextureId}
            onClick={() => setActiveTextureId(texture.id)}
          />
        ))}
        <button onClick={addNewTexture}>+ Add Texture</button>
      </div>
      
      <div className="editor-layout">
        {/* Layer Panel (shows active texture's layers) */}
        <LayerPanel 
          layers={activeTexture?.layers || []}
          onLayerToggle={toggleLayer}
        />
        
        {/* Canvas (only renders active texture) */}
        <CanvasArea>
          {activeTexture && (
            <FabricCanvas 
              texture={activeTexture}
              onUpdate={updateTexture}
            />
          )}
        </CanvasArea>
        
        {/* Properties Panel */}
        <PropertiesPanel 
          selectedObject={selectedObject}
        />
      </div>
    </div>
  );
}

// Texture Tab Component
function TextureTab({ texture, active, onClick }: TextureTabProps) {
  const icon = {
    'body': '🚗',
    'windows': '🪟',
    'decals': '🎨',
    'numbers': '🔢',
    'interior': '🪑',
    'driver': '👤',
    'custom': '📄'
  }[texture.type];
  
  return (
    <button 
      className={`texture-tab ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#2a2a3e',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px 8px 0 0',
        border: active ? '2px solid #667eea' : 'none',
        cursor: 'pointer'
      }}
    >
      <span>{icon} {texture.name}</span>
      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
        {texture.originalFile?.width}x{texture.originalFile?.height}
      </span>
    </button>
  );
}
```

### 2. Cross-Texture Operations

```typescript
// Copy sponsor from Body to Decals texture
function copySponsorAcrossTextures(sponsor: fabric.Object, fromTexture: string, toTexture: string) {
  const sourceCanvas = project.textures.find(t => t.id === fromTexture)?.fabricCanvas;
  const targetCanvas = project.textures.find(t => t.id === toTexture)?.fabricCanvas;
  
  if (!sourceCanvas || !targetCanvas) return;
  
  // Clone object and add to target canvas
  sponsor.clone((cloned: fabric.Object) => {
    targetCanvas.add(cloned);
    targetCanvas.requestRenderAll();
    
    // Show toast: "Sponsor copied to Decals"
    toast.success(`Copied to ${toTexture}`);
  });
}

// UI for cross-texture copy
function SponsorContextMenu({ sponsor }: { sponsor: fabric.Object }) {
  return (
    <ContextMenu>
      <MenuItem onClick={() => duplicateObject(sponsor)}>Duplicate</MenuItem>
      <MenuItem>Copy to...</MenuItem>
      <SubMenu>
        <MenuItem onClick={() => copySponsorAcrossTextures(sponsor, activeTexture, 'body')}>
          🚗 Body
        </MenuItem>
        <MenuItem onClick={() => copySponsorAcrossTextures(sponsor, activeTexture, 'decals')}>
          🎨 Decals
        </MenuItem>
        <MenuItem onClick={() => copySponsorAcrossTextures(sponsor, activeTexture, 'windows')}>
          🪟 Windows
        </MenuItem>
      </SubMenu>
    </ContextMenu>
  );
}
```

### 3. Texture Navigator (Thumbnail View)

```typescript
// Quick overview of all textures
function TextureNavigator({ project, onSelectTexture }: TextureNavigatorProps) {
  return (
    <div className="texture-navigator" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '1rem',
      borderRadius: '12px',
      display: 'flex',
      gap: '0.5rem'
    }}>
      <h4>Textures</h4>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {project.textures.map(texture => (
          <TextureThumbnail
            key={texture.id}
            texture={texture}
            onClick={() => onSelectTexture(texture.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TextureThumbnail({ texture, onClick }: TextureThumbnailProps) {
  // Generate thumbnail from canvas
  const thumbnail = texture.fabricCanvas.toDataURL({
    format: 'png',
    quality: 0.5,
    multiplier: 0.1 // 10% size for thumbnail
  });
  
  return (
    <div 
      className="texture-thumbnail"
      onClick={onClick}
      style={{
        width: '80px',
        height: '80px',
        cursor: 'pointer',
        border: '2px solid #667eea',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      <img src={thumbnail} alt={texture.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ fontSize: '0.65rem', textAlign: 'center', padding: '0.25rem' }}>
        {texture.name}
      </div>
    </div>
  );
}
```

---

## 🔄 Alternative Approaches (Considered)

### ❌ Approach 1: Everything on One Giant Canvas
```
Problem: Textures have different resolutions (4096x4096 body + 512x512 driver)
Problem: Can't zoom individual textures independently
Problem: Confusing UX - what am I editing?
Verdict: Too complex, not intuitive
```

### ⚠️ Approach 2: Side-by-Side Canvases
```
┌──────────────┬──────────────┬──────────────┐
│  Body Canvas │ Decals Canvas│ Windows Canvas│
│  4096x4096   │  2048x2048   │  2048x2048   │
└──────────────┴──────────────┴──────────────┘

Problem: Need huge monitor (3+ canvases at once)
Problem: Can't see details (too zoomed out)
Verdict: Only works for dual/triple monitor setups
```

### ⚠️ Approach 3: Tree View with Canvas Switcher
```
├─ 🚗 Body.dds
├─ 🪟 Windows.dds
│  ├─ Windshield
│  └─ Side Windows
├─ 🎨 Decals.dds
└─ 🔢 Numbers.dds

Problem: Too many clicks to switch textures
Problem: Tree can get very deep
Verdict: Good for file management, bad for editing workflow
```

---

## ✅ Recommended: Hybrid Approach

### Tab Switcher (Primary) + Quick Navigator (Secondary)

**For Active Editing:**
- Tab-based switcher at top
- One canvas at a time, full screen
- Click tab to switch textures

**For Cross-Texture Work:**
- Floating thumbnail navigator (bottom-right)
- Drag & drop between thumbnails
- Right-click sponsor → "Copy to Decals"

**For Organization:**
- Collapsible tree view in layer panel
- Group by texture type
- Filter by layer type (sponsors, numbers, etc)

---

## 🎯 Racing-Specific Features

### 1. Template Detection

```typescript
// Auto-detect common racing livery structure
function detectLiveryStructure(files: File[]): TextureType[] {
  const detected: TextureType[] = [];
  
  // Common patterns
  const patterns = {
    body: /body|main|skin|car/i,
    windows: /window|glass|windshield/i,
    decals: /decal|sponsor|logo/i,
    numbers: /number|digit|plate/i,
    interior: /interior|cockpit|cabin/i,
    driver: /driver|pilot|helmet/i
  };
  
  files.forEach(file => {
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(file.name)) {
        detected.push({ type, file });
        break;
      }
    }
  });
  
  return detected;
}

// UI: Auto-organize imported files
<ImportDialog>
  <p>Detected livery structure:</p>
  <ul>
    {detectedTextures.map(t => (
      <li key={t.type}>
        {getIcon(t.type)} {t.type}: {t.file.name}
        <select value={t.type} onChange={e => reassignType(t, e.target.value)}>
          <option value="body">Body</option>
          <option value="windows">Windows</option>
          <option value="decals">Decals</option>
        </select>
      </li>
    ))}
  </ul>
</ImportDialog>
```

### 2. Sponsor Sync

```typescript
// Keep sponsors consistent across textures
function SponsorSyncPanel() {
  const [syncEnabled, setSyncEnabled] = useState(true);
  
  // When sponsor is added to Body, auto-add to Decals too
  useEffect(() => {
    if (!syncEnabled) return;
    
    canvas.on('object:added', (e) => {
      if (e.target?.type === 'sponsor') {
        // Ask user if they want to copy to other textures
        showSyncDialog(e.target);
      }
    });
  }, [syncEnabled]);
  
  return (
    <Panel>
      <Checkbox checked={syncEnabled} onChange={setSyncEnabled}>
        🔄 Auto-sync sponsors across textures
      </Checkbox>
      
      {syncEnabled && (
        <div>
          <p>When adding sponsors, also add to:</p>
          <Checkbox>🎨 Decals</Checkbox>
          <Checkbox>🪟 Windows</Checkbox>
          <Checkbox>🔢 Numbers</Checkbox>
        </div>
      )}
    </Panel>
  );
}
```

### 3. Preview: All Textures Combined

```typescript
// Show how all textures look together
function LiveryPreview({ project }: { project: LiveryProject }) {
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d');
  
  if (previewMode === '2d') {
    return (
      <div className="livery-preview-2d" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        padding: '1rem'
      }}>
        {project.textures.map(texture => (
          <div key={texture.id} className="texture-preview">
            <h4>{texture.name}</h4>
            <img 
              src={texture.fabricCanvas.toDataURL()} 
              alt={texture.name}
              style={{ width: '100%', border: '1px solid #667eea' }}
            />
          </div>
        ))}
      </div>
    );
  }
  
  // Future: 3D car model with textures applied
  return (
    <div className="livery-preview-3d">
      <p>3D Preview (Coming Soon)</p>
      <p>Will show car model with all textures applied</p>
    </div>
  );
}
```

---

## 📱 Mobile/Tablet Considerations

### Tablet (iPad)
```typescript
// Swipe between textures
function MobileTextureSwiper({ textures, activeIndex, onIndexChange }) {
  return (
    <Swiper
      initialSlide={activeIndex}
      onSlideChange={e => onIndexChange(e.activeIndex)}
    >
      {textures.map(texture => (
        <SwiperSlide key={texture.id}>
          <FabricCanvas texture={texture} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// Texture dots indicator
<div className="texture-indicators">
  {textures.map((t, i) => (
    <span 
      key={t.id}
      className={i === activeIndex ? 'active' : ''}
      onClick={() => onIndexChange(i)}
    >
      •
    </span>
  ))}
</div>
```

---

## 🚀 Implementation Phases

### Phase 1: Single Canvas (Current POC)
- ✅ Load one PSD
- ✅ Layer visibility
- ✅ Basic editing

### Phase 2: Multi-Texture Support (Week 2-3)
- ✅ Tab-based texture switcher
- ✅ Load multiple PSDs/DDS
- ✅ Individual canvas per texture
- ✅ Save/load project structure

### Phase 3: Cross-Texture Features (Week 4)
- ✅ Copy objects between textures
- ✅ Sponsor sync
- ✅ Thumbnail navigator
- ✅ Export all textures at once

### Phase 4: Advanced Features (Week 5-6)
- ✅ 2D preview (all textures grid)
- ✅ 3D preview (car model)
- ✅ Template detection
- ✅ Batch operations

---

## ✅ Final Recommendation

### Primary UX: **Tab-Based Switcher**

**Why:**
1. ✅ **Familiar** - Like Photoshop, VS Code, browsers
2. ✅ **Efficient** - One click to switch textures
3. ✅ **Clear** - Always know what you're editing
4. ✅ **Scalable** - Works with 5 or 50 textures

**Secondary:** Floating thumbnail navigator for quick jumps

**Data Structure:** Multi-texture LiveryProject with shared assets

**Key Features:**
- Copy/paste between textures
- Sponsor sync across textures
- Preview all textures together
- Export project as zip (all textures)

Ready to implement the multi-texture architecture?
