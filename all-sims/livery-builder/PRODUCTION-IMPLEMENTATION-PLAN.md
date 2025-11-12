# SimVox Livery Builder - Production Implementation Plan
## From POC to Full Production App

**Date:** November 12, 2025  
**Status:** Moving from `poc-psd-livery-editor` to production app  
**Target Directory:** `C:\DATA\SimVox\simvox-sim-integration\all-sims\livery-builder`

---

## 📋 Executive Summary

The POC (`poc-psd-livery-editor`) has proven the technical feasibility of:
- ✅ PSD layer loading with `@webtoon/psd`
- ✅ Canvas rendering with layer caching (10-50x performance improvement)
- ✅ Tauri 2.x desktop integration
- ✅ Performance monitoring (60 FPS target achieved)

**Now transitioning to production app** with comprehensive features based on:
- Trading Paints Builder competitive analysis
- Fabric.js canvas library integration
- Voice command system architecture
- Multi-texture support for complex liveries
- Reference window and design guides
- Basic/Advanced dual-mode interface

---

## 🎯 Production App Feature Set

### Core Features (From POC Learnings)
1. **Multi-Texture Management** - Tab-based switcher for body/windows/decals/etc
2. **Fabric.js Canvas** - Professional editing with drawing tools
3. **Command System** - Undo/redo + voice integration
4. **Reference Window** - Floating inspiration images
5. **Design Guides** - Grid, wireframe, sponsor zones
6. **Dual Interface** - Basic (15 features) vs Advanced (45+ features)
7. **Racing-Specific Tools** - Sponsor library, number templates, mirror tools
8. **3D Preview** - See livery on car model (Phase 2)

### Technical Stack
- **Framework:** Tauri 2.x + React 19.1.0 + TypeScript 5.8.3
- **Canvas:** Fabric.js 6.9.0
- **File Formats:** PSD (`@webtoon/psd`), TGA (`tga-js`), DDS (custom parser)
- **Voice:** Web Speech API
- **Build:** Vite 7.0.4

---

## 📁 Project Structure (Production)

```
livery-builder/
├── app/                           # Production app (NEW)
│   ├── src/
│   │   ├── core/                  # Core systems
│   │   │   ├── command/          # Command pattern (undo/redo)
│   │   │   │   ├── Command.ts
│   │   │   │   ├── CommandHistory.ts
│   │   │   │   ├── commands/
│   │   │   │   │   ├── MoveObjectCommand.ts
│   │   │   │   │   ├── AddImageCommand.ts
│   │   │   │   │   ├── ChangeColorCommand.ts
│   │   │   │   │   └── CompositeCommand.ts
│   │   │   ├── texture/          # Multi-texture management
│   │   │   │   ├── LiveryProject.ts
│   │   │   │   ├── LiveryTexture.ts
│   │   │   │   ├── TextureManager.ts
│   │   │   │   └── TextureType.ts
│   │   │   ├── voice/            # Voice command system
│   │   │   │   ├── VoiceCommandManager.ts
│   │   │   │   ├── VoiceCommandParser.ts
│   │   │   │   ├── ContinuousVoiceController.ts
│   │   │   │   └── VoiceFeedback.ts
│   │   │   └── parsers/          # File format parsers
│   │   │       ├── psd/
│   │   │       ├── tga/
│   │   │       └── dds/
│   │   ├── components/           # UI Components
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── TextureTabs.tsx
│   │   │   │   ├── ToolbarPanel.tsx
│   │   │   │   ├── LayerPanel.tsx
│   │   │   │   ├── PropertiesPanel.tsx
│   │   │   │   └── CanvasArea.tsx
│   │   │   ├── canvas/
│   │   │   │   ├── FabricCanvas.tsx
│   │   │   │   ├── GridOverlay.tsx
│   │   │   │   ├── WireframeOverlay.tsx
│   │   │   │   └── SponsorZonesOverlay.tsx
│   │   │   ├── reference/
│   │   │   │   ├── ReferenceWindow.tsx
│   │   │   │   ├── ReferenceImageCard.tsx
│   │   │   │   └── FullscreenImageView.tsx
│   │   │   ├── tools/
│   │   │   │   ├── BasicToolbar.tsx
│   │   │   │   ├── AdvancedToolbar.tsx
│   │   │   │   ├── ColorPicker.tsx
│   │   │   │   └── ModeToggle.tsx
│   │   │   ├── racing/
│   │   │   │   ├── SponsorLibrary.tsx
│   │   │   │   ├── NumberTemplates.tsx
│   │   │   │   ├── MirrorTools.tsx
│   │   │   │   ├── TeamColorPresets.tsx
│   │   │   │   └── PSDQuickActions.tsx
│   │   │   └── voice/
│   │   │       ├── VoiceIndicator.tsx
│   │   │       ├── VoiceCommandHistory.tsx
│   │   │       └── VoiceSettings.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useFabricCanvas.ts
│   │   │   ├── useCommandHistory.ts
│   │   │   ├── useVoiceCommands.ts
│   │   │   ├── useTextureManager.ts
│   │   │   └── useReferenceWindow.ts
│   │   ├── types/                # TypeScript types
│   │   │   ├── livery.ts
│   │   │   ├── command.ts
│   │   │   ├── voice.ts
│   │   │   └── fabric.d.ts
│   │   ├── utils/                # Utilities
│   │   │   ├── canvas.ts
│   │   │   ├── export.ts
│   │   │   └── sponsorLibrary.ts
│   │   ├── styles/               # Global styles
│   │   │   ├── main.css
│   │   │   └── theme.css
│   │   ├── App.tsx               # Main app
│   │   └── main.tsx              # Entry point
│   ├── src-tauri/                # Tauri backend
│   │   ├── src/
│   │   │   └── main.rs
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── poc-psd-livery-editor/        # POC (REFERENCE ONLY)
│   └── [existing POC files]
│
├── examples/                      # Trading Paints analysis
├── sims/                          # Car templates
└── docs/                          # Documentation (NEW)
    ├── ARCHITECTURE.md
    ├── VOICE-COMMANDS.md
    ├── FEATURE-SPEC.md
    └── UI-DESIGN.md
```

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1-2)** 🏗️

#### Goals
- Set up production app structure
- Migrate Fabric.js canvas from POC
- Implement command system foundation
- Basic multi-texture support

#### Tasks

**1.1 Project Setup** (Day 1)
- [ ] Create `app/` directory in parent folder
- [ ] Initialize Tauri 2.x + React + TypeScript project
- [ ] Install dependencies: `fabric`, `@webtoon/psd`, `tga-js`
- [ ] Copy working POC code as reference
- [ ] Set up TypeScript path aliases
- [ ] Configure Vite for production builds

**Commands:**
```bash
cd "C:\DATA\SimVox\simvox-sim-integration\all-sims\livery-builder"
npm create tauri-app@latest app
cd app
npm install fabric @webtoon/psd tga-js
npm install -D @types/node
```

**1.2 Core Architecture** (Day 2-3)
- [ ] Create `Command` interface and base classes
- [ ] Implement `CommandHistory` with undo/redo stack
- [ ] Create `LiveryProject` and `LiveryTexture` types
- [ ] Build `TextureManager` for multi-texture handling
- [ ] Set up TypeScript types for Fabric.js extensions

**Files:**
```typescript
// src/core/command/Command.ts
interface Command {
  type: string;
  execute(): void;
  undo(): void;
  redo(): void;
  timestamp: Date;
}

// src/core/texture/LiveryProject.ts
interface LiveryProject {
  metadata: ProjectMetadata;
  textures: LiveryTexture[];
  sharedAssets: SharedAssets;
}
```

**1.3 Fabric.js Canvas Integration** (Day 4-5)
- [ ] Create `FabricCanvas.tsx` component
- [ ] Migrate PSD loading logic to work with Fabric.js
- [ ] Convert PSD layers to `fabric.Image` objects
- [ ] Implement basic layer visibility toggle
- [ ] Test performance with AMS2 4096x4096 PSDs

**Files:**
```tsx
// src/components/canvas/FabricCanvas.tsx
export function FabricCanvas({ texture }: { texture: LiveryTexture }) {
  const canvasRef = useRef<fabric.Canvas>();
  
  useEffect(() => {
    // Initialize Fabric canvas
    canvasRef.current = new fabric.Canvas('canvas');
    
    // Load texture layers
    loadTextureToCanvas(texture, canvasRef.current);
  }, [texture]);
}
```

**1.4 Basic UI Layout** (Day 6-7)
- [ ] Create main layout with 3-panel design (layers, canvas, properties)
- [ ] Implement texture tab switcher (top bar)
- [ ] Add basic toolbar (select, move, zoom)
- [ ] Create layer panel with checkbox toggles
- [ ] Add FPS counter from POC

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [🚗 Body] [🪟 Windows] [🎨 Decals]  [⚙️ Advanced] │
├──────────┬──────────────────────────┬───────────────┤
│ LAYERS   │    CANVAS                │  PROPERTIES   │
│          │                          │               │
│ ☑️ Hood  │    [Fabric canvas]       │  Position X:  │
│ ☑️ Doors │                          │  Position Y:  │
│ ☑️ Roof  │    4096x4096            │  Width:       │
│          │                          │  Height:      │
│          │    📊 60 FPS             │               │
└──────────┴──────────────────────────┴───────────────┘
```

**Deliverable:** Working app that can load PSDs into Fabric.js canvas with multi-texture tabs

---

### **Phase 2: Basic Mode Features (Week 3-4)** 🎨

#### Goals
- Implement 15 Basic Mode features
- Add reference window
- Grid/wireframe overlays
- Sponsor zones guidance

#### Tasks

**2.1 Basic Drawing Tools** (Day 1-2)
- [ ] Free drawing brush
- [ ] Shapes (rectangle, circle, triangle)
- [ ] Text tool (IText)
- [ ] Image import (drag & drop)
- [ ] Eraser tool

**Commands Created:**
```typescript
class AddShapeCommand implements Command {
  execute() { canvas.add(new fabric.Rect({...})); }
  undo() { canvas.remove(this.shape); }
}
```

**2.2 Object Manipulation** (Day 3)
- [ ] Move/resize/rotate (built-in Fabric.js)
- [ ] Copy & paste
- [ ] Delete object
- [ ] Opacity slider
- [ ] Bring to front/send to back

**2.3 Color System** (Day 4)
- [ ] Color picker component
- [ ] Fill color
- [ ] Stroke color
- [ ] Stroke width slider
- [ ] Team color presets (Red Bull, Mercedes, Ferrari)

**2.4 Reference Window** (Day 5-6)
- [ ] Floating draggable window (using `react-rnd`)
- [ ] Add/remove reference images
- [ ] Opacity control per image
- [ ] Fullscreen view
- [ ] Grid layout for multiple references

**Component:**
```tsx
// src/components/reference/ReferenceWindow.tsx
<Rnd position={position} size={size}>
  <div className="reference-window">
    <ReferenceImageCard image={ref1} />
    <ReferenceImageCard image={ref2} />
    <button onClick={addReference}>+ Add</button>
  </div>
</Rnd>
```

**2.5 Design Guides** (Day 7-8)
- [ ] Grid overlay (toggle + spacing control)
- [ ] Wireframe overlay (load from car templates)
- [ ] Sponsor placement zones (GT3, F1, NASCAR presets)
- [ ] Snap-to-grid functionality

**Overlays:**
```tsx
// Toggles in UI
<Checkbox onChange={setGridEnabled}>Show Grid</Checkbox>
<Checkbox onChange={setWireframeEnabled}>Show Wireframe</Checkbox>
<Checkbox onChange={setSponsorZonesEnabled}>Show Sponsor Zones</Checkbox>
```

**2.6 Undo/Redo UI** (Day 9)
- [ ] Undo button (Ctrl+Z)
- [ ] Redo button (Ctrl+Y)
- [ ] Command history panel (show last 10 actions)
- [ ] Visual feedback (disabled when stack empty)

**Deliverable:** Basic Mode fully functional - beginners can design simple liveries

---

### **Phase 3: Advanced Mode Features (Week 5-6)** ⚙️

#### Goals
- Unlock all 45+ Advanced Mode features
- Add professional tools
- Racing-specific features

#### Tasks

**3.1 Advanced Drawing** (Day 1-2)
- [ ] Spray brush
- [ ] Pattern brush
- [ ] Polygon drawing & editing
- [ ] Text on path
- [ ] Custom fonts support

**3.2 Advanced Styling** (Day 3-4)
- [ ] Gradients (linear, radial)
- [ ] Blend modes (multiply, overlay, screen)
- [ ] Drop shadows
- [ ] Image filters (brightness, contrast, saturation, blur)
- [ ] Clipping/masking

**3.3 Layout Tools** (Day 5)
- [ ] Grouping objects
- [ ] Alignment tools (left, center, right, top, middle, bottom)
- [ ] Distribution tools
- [ ] Grid & rulers with measurements
- [ ] Rotate to angle input

**3.4 Racing-Specific Features** (Day 6-8)
- [ ] **Sponsor Library**
  - Load logos (Pirelli, Shell, Red Bull, Michelin, etc.)
  - Drag & drop to canvas
  - Search & filter
  - Custom upload

- [ ] **Racing Number Templates**
  - GT3 style (large block numbers)
  - F1 style (rounded)
  - NASCAR style (angled)
  - One-click apply

- [ ] **Mirror/Symmetry Tools**
  - "Copy left to right" button
  - Live symmetry mode
  - Flip horizontal/vertical

- [ ] **Team Color Presets**
  - Red Bull (navy + red)
  - Mercedes (silver + teal)
  - Ferrari (red + yellow)
  - Apply to all objects

- [ ] **PSD Quick Actions**
  - Hide Windows layer
  - Body-only mode
  - Toggle shadows
  - Reset to template

**3.5 Mode Toggle** (Day 9-10)
- [ ] Basic/Advanced mode switcher (top-right)
- [ ] Show/hide advanced tools
- [ ] Remember user preference
- [ ] Smooth UI transition

**UI:**
```tsx
<div className="mode-toggle">
  <button onClick={() => setMode('basic')} className={mode === 'basic' ? 'active' : ''}>
    🎯 Basic
  </button>
  <button onClick={() => setMode('advanced')} className={mode === 'advanced' ? 'active' : ''}>
    ⚙️ Advanced
  </button>
</div>
```

**Deliverable:** Advanced Mode complete - pros can create complex liveries

---

### **Phase 4: Voice Commands (Week 7)** 🎤

#### Goals
- Implement voice recognition
- Command parsing
- Continuous commands

#### Tasks

**4.1 Voice Recognition Setup** (Day 1-2)
- [ ] Integrate Web Speech API
- [ ] Create `VoiceCommandManager`
- [ ] Add microphone permission handling
- [ ] Voice indicator UI (listening/idle)

**4.2 Command Parsing** (Day 3-4)
- [ ] `VoiceCommandParser` class
- [ ] Parse move commands ("move the number decal left")
- [ ] Parse add commands ("insert a Red Bull logo on layer 5")
- [ ] Parse color commands ("make the background red")
- [ ] Parse undo/redo ("undo last action")

**4.3 Continuous Commands** (Day 5-6)
- [ ] `ContinuousVoiceController`
- [ ] Start continuous move ("move left")
- [ ] Stop command ("stop")
- [ ] Update position in real-time
- [ ] Add final state to history

**4.4 Voice Feedback** (Day 7)
- [ ] Text-to-speech responses
- [ ] Command confirmation ("Done: moved number decal left")
- [ ] Error messages ("Sorry, I couldn't find that object")
- [ ] Voice command history panel

**Usage Example:**
```typescript
// User says: "move the number decal left"
voiceManager.on('transcript', async (text) => {
  const command = await parser.parse(text);
  if (command) {
    history.execute(command);
    voiceFeedback.speak(`Done: ${command.voicePhrase}`);
  }
});
```

**Deliverable:** Voice commands working - hands-free livery design

---

### **Phase 5: Import/Export (Week 8)** 💾

#### Goals
- Support all sim formats
- Project save/load
- Multi-resolution export

#### Tasks

**5.1 File Format Support** (Day 1-3)
- [ ] PSD import (existing from POC)
- [ ] TGA import (existing from POC)
- [ ] DDS import (implement parser)
- [ ] PNG/JPG import
- [ ] SVG import

**5.2 Project Management** (Day 4-5)
- [ ] Save project as JSON (.simvox format)
- [ ] Load project from file
- [ ] Auto-save every 5 minutes
- [ ] Recent projects list
- [ ] Project templates library

**Project Format:**
```json
{
  "version": "1.0",
  "metadata": {
    "name": "BMW M4 GT3 - Team SimVox",
    "sim": "AMS2",
    "car": "BMW M4 GT3",
    "created": "2025-11-12T10:00:00Z"
  },
  "textures": [
    {
      "name": "Body",
      "type": "body",
      "layers": [...]
    }
  ],
  "commandHistory": [...]
}
```

**5.3 Export System** (Day 6-8)
- [ ] Export to PNG (single texture or all)
- [ ] Export to DDS (with compression settings)
- [ ] Export to TGA (for LMU)
- [ ] Export to PSD (preserve layers)
- [ ] Multi-resolution export (4096, 2048, 1024)
- [ ] Batch export all textures

**Export UI:**
```tsx
<ExportDialog>
  <Select label="Format">
    <option>PNG</option>
    <option>DDS (DXT5)</option>
    <option>TGA</option>
    <option>PSD</option>
  </Select>
  <Select label="Resolution">
    <option>4096x4096</option>
    <option>2048x2048</option>
    <option>1024x1024</option>
  </Select>
  <Checkbox>Export all textures</Checkbox>
  <Button onClick={exportLivery}>Export</Button>
</ExportDialog>
```

**Deliverable:** Complete import/export for all major sim formats

---

### **Phase 6: Polish & Performance (Week 9-10)** ✨

#### Goals
- Optimize performance
- Add tutorials
- Responsive design
- Final UX polish

#### Tasks

**6.1 Performance Optimization** (Day 1-3)
- [ ] Implement viewport culling (Fabric.js `skipOffscreen`)
- [ ] Layer caching (from POC learnings)
- [ ] Lazy loading (first 10 layers, rest on demand)
- [ ] Canvas resolution scaling for low-end devices
- [ ] Memory management (clear cache when switching textures)
- [ ] Target: 60 FPS with 50+ layers

**6.2 Tutorials & Onboarding** (Day 4-5)
- [ ] First-time user tutorial (tooltips)
- [ ] Template library (pre-made liveries)
- [ ] Example projects
- [ ] Keyboard shortcuts reference
- [ ] Video tutorials (record with OBS)

**6.3 Responsive Design** (Day 6-7)
- [ ] Desktop layout (1920x1080)
- [ ] Laptop layout (1366x768)
- [ ] Tablet layout (iPad)
- [ ] Minimum window size enforcement

**6.4 Final Polish** (Day 8-10)
- [ ] SimVox theme colors (#667eea purple)
- [ ] Icon design (custom SVGs)
- [ ] Loading states & spinners
- [ ] Error handling & user feedback
- [ ] Accessibility (keyboard navigation)
- [ ] Dark mode support
- [ ] App icon & splash screen

**Deliverable:** Production-ready app with excellent UX

---

## 📊 Feature Tracking

### Basic Mode Features (15)
- [ ] 1. Free Drawing Brush
- [ ] 2. Shapes (Rectangle, Circle, Triangle)
- [ ] 3. Text (IText)
- [ ] 4. Image Import
- [ ] 5. Layer Visibility Toggle
- [ ] 6. Undo/Redo
- [ ] 7. Color Picker
- [ ] 8. Object Selection
- [ ] 9. Move/Resize/Rotate
- [ ] 10. Opacity Control
- [ ] 11. Copy & Paste
- [ ] 12. Stroke Width/Color
- [ ] 13. Eraser
- [ ] 14. Zoom & Pan
- [ ] 15. Delete Object

### Advanced Mode Features (+30 more = 45 total)
- [ ] 16. Spray Brush
- [ ] 17. Pattern Brush
- [ ] 18. Polygon Drawing & Editing
- [ ] 19. Text on Path
- [ ] 20. Custom Fonts
- [ ] 21. Gradients (Linear, Radial)
- [ ] 22. Blend Modes
- [ ] 23. Drop Shadows
- [ ] 24. Image Filters
- [ ] 25. Clipping/Masking
- [ ] 26. Grouping
- [ ] 27. Alignment Tools
- [ ] 28. Distribution Tools
- [ ] 29. Grid & Rulers
- [ ] 30. SVG Import
- [ ] ... (see LIVERY-EDITOR-FEATURES.md for complete list)

### Racing-Specific Features (5)
- [ ] 1. Sponsor Library
- [ ] 2. Racing Number Templates
- [ ] 3. Mirror/Symmetry Tools
- [ ] 4. Team Color Presets
- [ ] 5. PSD Quick Actions

### Missing Features from Trading Paints (12)
- [ ] 1. Reference Window ⭐⭐⭐⭐⭐
- [ ] 2. Grid Overlays ⭐⭐⭐⭐⭐
- [ ] 3. Wireframe Mode ⭐⭐⭐⭐⭐
- [ ] 4. Sponsor Placement Zones ⭐⭐⭐⭐⭐
- [ ] 5. 3D Preview ⭐⭐⭐⭐⭐ (Phase 7)
- [ ] 6. View Rotation (with 3D preview)
- [ ] 7. Graphics Library (patterns, decorations)
- [ ] 8. Material System (chrome, metallic, matte)
- [ ] 9. Base Templates (car template library)
- [ ] 10. Real-time Collaboration (Phase 8)
- [ ] 11. Cloud Storage (Phase 8)
- [ ] 12. Community Gallery (Phase 8)

### Voice Commands (Core)
- [ ] Move commands ("move left", "move up")
- [ ] Add commands ("insert Red Bull logo")
- [ ] Color commands ("make background red")
- [ ] Continuous commands ("move left until I say stop")
- [ ] Undo/Redo ("undo", "redo")
- [ ] Macro commands ("apply team colors")

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Command system (execute, undo, redo)
- [ ] Voice command parser
- [ ] Texture manager
- [ ] File parsers (PSD, TGA, DDS)

### Integration Tests
- [ ] Fabric.js canvas integration
- [ ] Multi-texture switching
- [ ] Import/export workflows
- [ ] Voice + command system

### Performance Tests
- [ ] 4096x4096 PSD with 50+ layers (target: 60 FPS)
- [ ] Switching between 5 textures (target: <100ms)
- [ ] Undo/redo stack with 100 commands (target: instant)
- [ ] Voice recognition latency (target: <200ms)

### User Testing
- [ ] First-time user onboarding
- [ ] Basic Mode usability (non-designers)
- [ ] Advanced Mode workflow (professional designers)
- [ ] Voice command accuracy

---

## 📚 Documentation Required

### Developer Docs
- [ ] `docs/ARCHITECTURE.md` - System overview
- [ ] `docs/COMMAND-PATTERN.md` - Command system details
- [ ] `docs/VOICE-INTEGRATION.md` - Voice command guide
- [ ] `docs/TEXTURE-MANAGEMENT.md` - Multi-texture architecture
- [ ] `docs/FABRIC-INTEGRATION.md` - Fabric.js usage patterns

### User Docs
- [ ] `docs/USER-GUIDE.md` - Getting started
- [ ] `docs/KEYBOARD-SHORTCUTS.md` - Shortcut reference
- [ ] `docs/VOICE-COMMANDS.md` - Voice command examples
- [ ] `docs/EXPORT-GUIDE.md` - Export for each sim
- [ ] `docs/FAQ.md` - Common questions

---

## 🎨 UI Design Specification

### Visual Design System
```typescript
// SimVox Theme
const colors = {
  primary: '#667eea',      // SimVox purple
  accent: '#764ba2',       // Deep purple
  background: '#0f0f23',   // Dark navy
  surface: '#1a1a2e',      // Lighter navy
  text: '#ffffff',         // White
  textSecondary: '#a0a0b0', // Gray
  success: '#3fb950',      // Green (60 FPS)
  warning: '#d29922',      // Yellow (30-60 FPS)
  error: '#f85149',        // Red (<30 FPS)
  border: '#2a2a3e',       // Border gray
};

const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
};

const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};
```

### Layout Specs
```
Desktop (1920x1080):
- Texture Tabs: 60px height
- Toolbar: 200px width (Basic) / 250px width (Advanced)
- Canvas: Flexible (fills remaining space)
- Properties: 300px width (Advanced only)
- Layer Panel: 250px width

Laptop (1366x768):
- Texture Tabs: 50px height
- Toolbar: 180px width
- Canvas: Flexible
- Properties: Collapsible
- Layer Panel: 200px width
```

---

## 🚦 Success Criteria

### Phase 1 (Foundation)
✅ App loads PSDs into Fabric.js canvas  
✅ Multi-texture tabs switch correctly  
✅ Command system undo/redo works  
✅ 60 FPS with 4096x4096 textures  

### Phase 2 (Basic Mode)
✅ 15 Basic Mode features functional  
✅ Reference window floating and draggable  
✅ Grid/wireframe/zones overlays working  
✅ Beginners can design simple liveries  

### Phase 3 (Advanced Mode)
✅ 45+ Advanced Mode features unlocked  
✅ Racing-specific tools (sponsor library, numbers, mirror)  
✅ Professionals can create complex liveries  

### Phase 4 (Voice)
✅ Voice commands recognized with >90% accuracy  
✅ Continuous commands ("move left until stop")  
✅ Voice feedback confirms actions  

### Phase 5 (Import/Export)
✅ Support PSD, TGA, DDS, PNG formats  
✅ Save/load projects (.simvox)  
✅ Export for AMS2, ACC, AC, iRacing, LMU  

### Phase 6 (Polish)
✅ Tutorials for first-time users  
✅ Responsive design (desktop, laptop, tablet)  
✅ Professional SimVox branding  
✅ Production-ready quality  

---

## 🎯 Next Immediate Actions

### 1. **Update this checklist** as we design UI (CURRENT)
   - Review and refine based on UI mockups
   - Prioritize features
   - Adjust timeline

### 2. **Design Full UI** (Next task)
   - Create detailed mockups for each screen
   - Define component hierarchy
   - Specify interactions

### 3. **Start Phase 1** (After UI design)
   - Set up production app structure
   - Begin Fabric.js migration

---

## 📝 Notes & Decisions

### From POC Learnings
- Layer caching is essential (10-50x speedup)
- FPS counter helps validate performance
- PSD layers can have complex blend modes (need Fabric.js)
- 4096x4096 textures are common in AMS2

### Architecture Decisions
- **Fabric.js** over custom canvas (saves 12+ weeks)
- **Command Pattern** for undo/redo (enables voice)
- **Tab-based** multi-texture (familiar UX)
- **Floating** reference window (non-blocking)

### Future Considerations (Phase 7+)
- 3D Preview with Three.js
- Real-time collaboration with WebSockets
- Cloud storage with AWS S3
- Community gallery with SimVox backend
- Mobile app with React Native

---

**Last Updated:** November 12, 2025  
**Status:** Ready to begin UI design phase  
**Est. Timeline:** 10 weeks to production-ready app
