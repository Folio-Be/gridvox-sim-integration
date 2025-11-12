# SimVox Livery Builder - Feature Analysis & UI Proposal
## Tailored Interface for Racing Livery Design

**Date:** November 12, 2025  
**Goal:** Create intuitive livery editor with Basic (beginner) and Advanced (pro) modes

---

## 📊 Complete Fabric.js Feature Analysis

### All Available Features from Fabric.js

| # | Feature | Livery Relevance | Basic Mode | Advanced Mode | Priority |
|---|---------|------------------|------------|---------------|----------|
| 1 | **Free Drawing (Brush)** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 2 | **Shapes (Rect, Circle, Triangle, Polygon)** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 3 | **Text (IText)** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 4 | **Image Import** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 5 | **Layer Visibility Toggle** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 6 | **Undo/Redo** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 7 | **Color Picker** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 8 | **Object Selection** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 9 | **Move/Resize/Rotate** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 10 | **Opacity Control** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | CRITICAL |
| 11 | **Copy & Paste** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | HIGH |
| 12 | **Grouping Objects** | ⭐⭐⭐⭐ | ❌ | ✅ | HIGH |
| 13 | **Alignment Tools** | ⭐⭐⭐⭐ | ❌ | ✅ | HIGH |
| 14 | **Stroke Width** | ⭐⭐⭐⭐ | ✅ | ✅ | HIGH |
| 15 | **Stroke Color** | ⭐⭐⭐⭐ | ✅ | ✅ | HIGH |
| 16 | **Fill Patterns** | ⭐⭐⭐⭐ | ❌ | ✅ | HIGH |
| 17 | **Blend Modes** | ⭐⭐⭐⭐ | ❌ | ✅ | HIGH |
| 18 | **Drop Shadows** | ⭐⭐⭐⭐ | ❌ | ✅ | HIGH |
| 19 | **Eraser Tool** | ⭐⭐⭐⭐ | ✅ | ✅ | HIGH |
| 20 | **Spray Brush** | ⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 21 | **Pattern Brush** | ⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 22 | **Gradients (Linear, Radial)** | ⭐⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 23 | **Image Filters (Brightness, Contrast, Saturation)** | ⭐⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 24 | **Text on Path** | ⭐⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 25 | **Custom Fonts** | ⭐⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 26 | **Zoom & Pan** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | MEDIUM |
| 27 | **Grid/Rulers** | ⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 28 | **Clipping/Masking** | ⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 29 | **Polygon Drawing** | ⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 30 | **Polygon Point Editing** | ⭐⭐⭐ | ❌ | ✅ | MEDIUM |
| 31 | **Filters (Blur, Pixelate, etc)** | ⭐⭐⭐ | ❌ | ✅ | LOW |
| 32 | **Animations** | ⭐⭐ | ❌ | ✅ | LOW |
| 33 | **SVG Import** | ⭐⭐⭐ | ❌ | ✅ | LOW |
| 34 | **PDF Import** | ⭐⭐ | ❌ | ✅ | LOW |
| 35 | **Video Elements** | ⭐ | ❌ | ❌ | IGNORE |
| 36 | **Object Intersection** | ⭐⭐ | ❌ | ✅ | LOW |
| 37 | **Superscript/Subscript** | ⭐ | ❌ | ✅ | LOW |
| 38 | **Dynamic Patterns** | ⭐⭐ | ❌ | ✅ | LOW |

---

## 🎯 Feature Categorization for Livery Design

### CRITICAL (Must-Have - Racing Essentials)
*These features are absolutely essential for designing racing liveries*

1. **Free Drawing Brush** - For custom stripes, accents, details
2. **Shapes** - Rectangles, circles for sponsor logos, number plates
3. **Text** - Driver names, team names, sponsors, car numbers
4. **Image Import** - Team logos, sponsor logos, brand decals
5. **Layer Management** - Toggle PSD layers (windows, doors, hood, etc)
6. **Color Picker** - Team colors, sponsor colors
7. **Object Manipulation** - Move, resize, rotate logos/text
8. **Opacity** - Transparency for decals, overlays
9. **Selection** - Select and edit individual elements
10. **Undo/Redo** - Essential for any editor

### HIGH Priority (Professional Touch)
*Features that make liveries look professional*

11. **Copy & Paste** - Duplicate sponsor logos across car
12. **Grouping** - Group multiple elements (logo + text)
13. **Alignment** - Align sponsors, center numbers
14. **Stroke Control** - Outlines for text/shapes
15. **Fill Patterns** - Carbon fiber, metallic textures
16. **Blend Modes** - Multiply/overlay for realistic decals
17. **Drop Shadows** - Make decals pop off the car
18. **Eraser** - Remove unwanted parts
19. **Gradients** - Fading colors, metallic effects

### MEDIUM Priority (Creative Freedom)
*Advanced features for experienced designers*

20. **Text on Path** - Curved text (e.g., along hood edge)
21. **Custom Fonts** - Team/sponsor branded fonts
22. **Image Filters** - Adjust sponsor logo colors to match livery
23. **Zoom & Pan** - Work on fine details
24. **Grid/Rulers** - Precise alignment
25. **Spray Brush** - Weathering, dirt effects
26. **Pattern Brush** - Custom texture application
27. **Clipping/Masking** - Advanced layer effects
28. **Polygon Tools** - Custom shapes for unique designs

### LOW Priority (Nice-to-Have)
*Expert features for special cases*

29. **Advanced Filters** - Blur, pixelate (rarely needed)
30. **Animations** - Preview livery rotating (future feature)
31. **SVG Import** - Vector sponsor logos
32. **Object Intersection** - Boolean operations
33. **PDF Import** - Import sponsor brand guidelines

### IGNORE (Not Relevant)
*Features that don't apply to livery design*

34. **Video Elements** - Not needed for static liveries
35. **Superscript/Subscript** - Not used in racing graphics

---

## 🎨 Proposed Interface Modes

### Basic Mode (Beginner-Friendly)
**Target Users:** First-time designers, casual racers, quick edits

**Philosophy:** "Instagram-simple" - Big buttons, minimal options, can't mess up

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  SIMVOX LIVERY BUILDER - BASIC MODE        [⚙️ Advanced]│
├─────────────────────────────────────────────────────────┤
│  📁 Open PSD   💾 Save   ⏪ Undo   ⏩ Redo              │
├─────────────────────────────────────────────────────────┤
│  🖌️ Brush   ⬜ Rectangle   ⭕ Circle   📝 Text   🖼️ Logo│
│  🎨 [Color]   📏 Size: [═══●═══]   🗑️ Delete           │
├──────────────────┬──────────────────────────────────────┤
│  LAYERS          │                                      │
│  ☑️ Hood         │         [CANVAS AREA]                │
│  ☑️ Doors        │                                      │
│  ☑️ Roof         │      4096 x 4096 px                  │
│  ☑️ Side Skirts  │                                      │
│  ☐️ Windows      │         📊 60 FPS                    │
│                  │                                      │
│  + Add Layer     │                                      │
└──────────────────┴──────────────────────────────────────┘
```

**Features Included (15 total):**
- ✅ Brush (single size)
- ✅ Rectangle, Circle, Triangle
- ✅ Text (basic fonts only)
- ✅ Image import (logos)
- ✅ Color picker (simple)
- ✅ Layer toggle
- ✅ Move/Resize/Rotate (drag handles)
- ✅ Opacity slider
- ✅ Delete
- ✅ Undo/Redo
- ✅ Copy/Paste
- ✅ Zoom (mouse wheel only)
- ✅ Stroke width slider
- ✅ Stroke color
- ✅ Eraser

**Hidden/Simplified:**
- No blend modes (automatic)
- No filters
- No advanced text (no path, no custom fonts)
- No patterns
- No gradients
- No grouping (auto-handled)
- No alignment tools (snap-to-grid automatic)

### Advanced Mode (Pro Designer)
**Target Users:** Experienced designers, league livery creators, perfectionists

**Philosophy:** "Photoshop-like" - Full control, all options visible, keyboard shortcuts

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  SIMVOX LIVERY BUILDER - ADVANCED MODE          [⚙️ Basic]      │
├─────────────────────────────────────────────────────────────────┤
│  📁 File  ✏️ Edit  🎨 Object  🖼️ Layer  🔧 View  📐 Arrange     │
├─────────────────────────────────────────────────────────────────┤
│ TOOLS                                                            │
│ ↖️ Select   🖱️ Pan   🔍 Zoom                                    │
│ 🖌️ Brush   🎨 Spray   🧩 Pattern   🧹 Eraser                    │
│ ⬜ Rect   ⭕ Circle   🔺 Triangle   ⬟ Polygon   ✏️ Freehand     │
│ 📝 Text   🌀 Text-on-Path   🖼️ Image   📐 Line                 │
├──────────────────┬──────────────────────────┬───────────────────┤
│  LAYERS          │    [CANVAS AREA]         │  PROPERTIES       │
│  📁 Sponsors     │                          │  ┌─────────────┐  │
│    ├─ Logo 1    │    4096 x 4096 px        │  │ Rectangle   │  │
│    └─ Logo 2    │                          │  └─────────────┘  │
│  📁 Numbers      │    Grid: ☑️ Rulers: ☑️   │  X: [  100  ]    │
│    └─ #23       │    Zoom: 100%            │  Y: [  100  ]    │
│  ☑️ Hood         │                          │  W: [  200  ]    │
│  ☑️ Doors        │    📊 60 FPS             │  H: [  100  ]    │
│  ☑️ Roof         │    ⏱️ 12ms               │                  │
│                  │                          │  Fill: [🎨]      │
│  + Add Layer     │                          │  Stroke: [🎨]    │
│  🗂️ Group        │                          │  Width: [═══●═] │
│  ⬆️⬇️ Order      │                          │  Opacity: 100%   │
│                  │                          │                  │
│                  │                          │  Blend: [Normal▼]│
│                  │                          │  Shadow: ☑️      │
│                  │                          │  ├─ Blur: [5px]  │
│                  │                          │  └─ Color: [⚫]  │
│                  │                          │                  │
│                  │                          │  🔄 Rotate: 0°   │
│                  │                          │  📐 Skew: 0°     │
│                  │                          │                  │
│                  │                          │  ⭐ Effects      │
│                  │                          │  └─ + Add Filter │
└──────────────────┴──────────────────────────┴───────────────────┘
```

**Features Included (ALL 38):**
- ✅ All Basic Mode features +
- ✅ Spray Brush, Pattern Brush
- ✅ Polygon drawing & editing
- ✅ Text on path
- ✅ Custom fonts
- ✅ Gradients (linear, radial)
- ✅ Blend modes (15+ options)
- ✅ Drop shadows
- ✅ Image filters (brightness, contrast, saturation, blur, etc)
- ✅ Clipping/masking
- ✅ Grouping
- ✅ Alignment tools (left, center, right, top, middle, bottom)
- ✅ Grid & rulers
- ✅ Advanced zoom & pan
- ✅ Fill patterns (carbon fiber, metallic)
- ✅ SVG import
- ✅ PDF import
- ✅ Polygon point editing
- ✅ Object intersection
- ✅ Animations (preview)
- ✅ Keyboard shortcuts
- ✅ Precise position/size inputs
- ✅ Layer folders/groups
- ✅ Layer blending
- ✅ Transform controls (skew, flip)

---

## 🎯 Livery-Specific Features (Custom)

### Team/Sponsor Library
**Relevance:** ⭐⭐⭐⭐⭐

```typescript
// Pre-loaded sponsor logos
interface SponsorLibrary {
  categories: {
    tireManufacturers: Logo[]; // Pirelli, Michelin, Goodyear
    fuelSponsors: Logo[];      // Shell, Mobil, Castrol
    automotive: Logo[];        // Red Bull, Monster, Mobil 1
    teamLogos: Logo[];         // User's saved team logos
  };
}

// Quick-add from library (drag & drop)
<SponsorPanel>
  <Category name="Tire Manufacturers">
    <Logo src="pirelli.png" draggable />
    <Logo src="michelin.png" draggable />
  </Category>
</SponsorPanel>
```

### Racing Number Templates
**Relevance:** ⭐⭐⭐⭐⭐

```typescript
// Pre-designed number plate styles
interface NumberTemplate {
  id: string;
  name: string; // "GT3 Style", "Formula 1", "NASCAR"
  preview: string;
  config: {
    font: string;
    strokeWidth: number;
    backgroundColor: string;
    shape: 'circle' | 'rectangle' | 'custom';
  };
}

// One-click number application
<NumberTemplates>
  <Template name="GT3 Style" onClick={applyToLivery} />
  <Template name="F1 Style" onClick={applyToLivery} />
</NumberTemplates>
```

### Symmetry Tools (Racing-Specific)
**Relevance:** ⭐⭐⭐⭐⭐

```typescript
// Mirror left-to-right (common in racing)
const mirrorSideToSide = () => {
  canvas.getObjects()
    .filter(obj => obj.left < canvas.width / 2)
    .forEach(obj => {
      const mirrored = obj.clone();
      mirrored.left = canvas.width - obj.left;
      mirrored.flipX = true;
      canvas.add(mirrored);
    });
};

// Apply to both sides button
<SymmetryTools>
  <Button onClick={mirrorSideToSide}>
    Mirror to Other Side
  </Button>
</SymmetryTools>
```

### Color Scheme Presets (Racing Teams)
**Relevance:** ⭐⭐⭐⭐⭐

```typescript
// Quick team color application
interface TeamColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  sponsor: string;
}

const teamPresets: TeamColorScheme[] = [
  { name: 'Red Bull Racing', primary: '#0600EF', secondary: '#DC0000', accent: '#FCD700', sponsor: '#FFFFFF' },
  { name: 'Mercedes AMG', primary: '#00D2BE', secondary: '#000000', accent: '#C0C0C0', sponsor: '#FFFFFF' },
  { name: 'Ferrari', primary: '#DC0000', secondary: '#FFF200', accent: '#FFFFFF', sponsor: '#000000' },
];

<ColorSchemeSelector>
  {teamPresets.map(scheme => (
    <SchemeButton colors={scheme} onClick={() => applyScheme(scheme)} />
  ))}
</ColorSchemeSelector>
```

### PSD Layer Quick Actions (Sim-Specific)
**Relevance:** ⭐⭐⭐⭐⭐

```typescript
// Common racing livery workflows
interface QuickActions {
  hideAllWindows: () => void;       // Hide all glass for painting
  showOnlyBody: () => void;         // Focus on body panels
  toggleShadows: () => void;        // Show/hide car shadows
  resetToBasePaint: () => void;     // Start fresh
  previewIn3D: () => void;          // Open in sim (future)
}

<QuickActionsPanel>
  <Action icon="🪟" onClick={hideAllWindows}>Hide Windows</Action>
  <Action icon="🚗" onClick={showOnlyBody}>Body Only</Action>
  <Action icon="🌓" onClick={toggleShadows}>Toggle Shadows</Action>
  <Action icon="🔄" onClick={resetToBasePaint}>Reset Paint</Action>
</QuickActionsPanel>
```

---

## 🎛️ Mode Switching UI

### Toggle Design

```typescript
function ModeToggle() {
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
  
  return (
    <div className="mode-toggle" style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '0.5rem',
      borderRadius: '8px'
    }}>
      <button 
        className={mode === 'basic' ? 'active' : ''}
        onClick={() => setMode('basic')}
      >
        🎯 Basic
      </button>
      <button 
        className={mode === 'advanced' ? 'active' : ''}
        onClick={() => setMode('advanced')}
      >
        ⚙️ Advanced
      </button>
      
      {mode === 'basic' && (
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          ✨ Simple tools for quick edits
        </p>
      )}
      
      {mode === 'advanced' && (
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          🔧 Full control, all features unlocked
        </p>
      )}
    </div>
  );
}
```

---

## 📱 Responsive Layouts

### Desktop (1920x1080+)
```
┌──────────────┬─────────────────────┬──────────────┐
│   TOOLS      │      CANVAS         │  PROPERTIES  │
│   (200px)    │      (1320px)       │   (400px)    │
│              │                     │              │
│   Toolbar    │   4096x4096 PSD     │   Selected   │
│   Brushes    │   with zoom/pan     │   Object     │
│   Shapes     │                     │   Details    │
│   Text       │                     │              │
├──────────────┤                     │              │
│   LAYERS     │                     │              │
│   (200px)    │                     │              │
│              │                     │              │
│   PSD Layers │                     │              │
│   + Objects  │                     │              │
└──────────────┴─────────────────────┴──────────────┘
```

### Laptop (1366x768)
```
┌─────────────────────────────────────────────────────┐
│            TOOLBAR (Compact)                        │
├──────────────┬──────────────────────────────────────┤
│   LAYERS     │         CANVAS                       │
│   (250px)    │         (1116px)                     │
│              │                                      │
│   Collapsed  │      Zoom to fit                     │
│   by default │                                      │
│              │                                      │
│   [Expand]   │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
       (Properties panel opens as overlay when selecting)
```

### Tablet (iPad)
```
┌─────────────────────────────────────────┐
│    TOOLBAR (Icon-only)                  │
├─────────────────────────────────────────┤
│                                         │
│          CANVAS (Full Screen)           │
│                                         │
│          Touch gestures:                │
│          - 2 finger zoom                │
│          - 2 finger pan                 │
│          - Tap to select                │
│                                         │
│                                         │
└─────────────────────────────────────────┘
    (Panels slide in from edges)
```

---

## 🎨 Visual Design System (SimVox Theme)

### Color Palette

```typescript
const simvoxTheme = {
  // Primary brand colors
  primary: '#667eea',        // SimVox purple
  primaryDark: '#5568d3',
  primaryLight: '#8599f5',
  
  // Accent colors
  accent: '#764ba2',         // Deep purple
  accentGlow: '#f093fb',     // Pink highlight
  
  // UI colors
  background: '#0f0f23',     // Dark navy
  surface: '#1a1a2e',        // Slightly lighter
  surfaceLight: '#2a2a3e',   // Hover state
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#a0a0b0',
  textMuted: '#707080',
  
  // Status colors
  success: '#3fb950',        // Green (60 FPS)
  warning: '#d29922',        // Yellow (30-60 FPS)
  error: '#f85149',          // Red (<30 FPS)
  
  // Tool colors
  brush: '#4ecdc4',
  shape: '#ff6b6b',
  text: '#ffe66d',
  image: '#95e1d3',
};
```

### Component Styling

```typescript
// SimVox Button
const SimVoxButton = styled.button`
  background: linear-gradient(135deg, ${simvoxTheme.primary} 0%, ${simvoxTheme.accent} 100%);
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
  }
  
  &.active {
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

// SimVox Tool Icon
const SimVoxToolIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${simvoxTheme.surface};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${simvoxTheme.surfaceLight};
    transform: scale(1.1);
  }
  
  &.active {
    background: ${simvoxTheme.primary};
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  }
`;
```

---

## 🚀 Implementation Priority

### Phase 1: Basic Mode (Week 1-2)
**Goal:** Functional livery editor for beginners

1. ✅ PSD loading (keep existing)
2. ✅ Layer visibility toggle (keep existing)
3. ✅ Fabric.js canvas integration
4. ✅ Basic toolbar (brush, shapes, text, image)
5. ✅ Color picker
6. ✅ Move/resize/rotate
7. ✅ Undo/redo
8. ✅ Export PNG

**Result:** Beginner-friendly editor ready for testing

### Phase 2: Racing-Specific Features (Week 3)
**Goal:** Make it feel like a LIVERY editor, not generic photo editor

1. ✅ Sponsor library panel
2. ✅ Racing number templates
3. ✅ Mirror/symmetry tools
4. ✅ Team color presets
5. ✅ PSD quick actions (hide windows, body only, etc)

**Result:** Tailored for racing livery workflows

### Phase 3: Advanced Mode (Week 4)
**Goal:** Professional tools for experienced designers

1. ✅ Advanced toolbar (spray, pattern, polygon)
2. ✅ Properties panel (precise controls)
3. ✅ Blend modes
4. ✅ Drop shadows
5. ✅ Image filters
6. ✅ Text on path
7. ✅ Gradients
8. ✅ Grouping & alignment
9. ✅ Grid & rulers

**Result:** Pro-level livery design tool

### Phase 4: Polish & Performance (Week 5-6)
**Goal:** Photoshop-level UX

1. ✅ Keyboard shortcuts
2. ✅ Responsive layouts (desktop, laptop, tablet)
3. ✅ Performance optimization (viewport culling, lazy load)
4. ✅ Animations & transitions
5. ✅ Tutorial tooltips
6. ✅ Templates library

**Result:** Production-ready SimVox Livery Builder

---

## 📋 Feature Comparison Table

| Feature | Photoshop | Figma | SimVox Basic | SimVox Advanced |
|---------|-----------|-------|--------------|-----------------|
| PSD Support | ✅ | ❌ | ✅ | ✅ |
| Free Drawing | ✅ | ⚠️ | ✅ | ✅ |
| Shapes | ✅ | ✅ | ✅ (3) | ✅ (6+) |
| Text | ✅ | ✅ | ✅ | ✅ + Path |
| Layers | ✅ | ✅ | ✅ | ✅ + Groups |
| Filters | ✅ | ❌ | ❌ | ✅ |
| Blend Modes | ✅ | ✅ | ❌ | ✅ |
| Racing-Specific | ❌ | ❌ | ✅ | ✅ |
| Sponsor Library | ❌ | ❌ | ✅ | ✅ |
| Number Templates | ❌ | ❌ | ✅ | ✅ |
| Mirror Tools | ❌ | ✅ | ✅ | ✅ |
| Team Colors | ❌ | ❌ | ✅ | ✅ |
| Browser-Based | ❌ | ✅ | ✅ | ✅ |
| Offline (Tauri) | ❌ | ❌ | ✅ | ✅ |

**SimVox Advantage:** Only livery editor with PSD support + racing-specific tools + offline capability.

---

## ✅ Summary

### Basic Mode = 15 Features (Beginner-Friendly)
Focus: Quick edits, simple tools, can't mess up

### Advanced Mode = 38 Features (Professional)
Focus: Full control, Photoshop-like power

### Racing-Specific = 5 Custom Features (Unique)
- Sponsor library
- Racing number templates
- Mirror/symmetry tools
- Team color presets
- PSD quick actions

### Total: 43 Features (38 Fabric.js + 5 Custom)

**Next Step:** Should I start implementing the Basic Mode UI first?
