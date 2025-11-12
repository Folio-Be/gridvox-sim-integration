# SimVox Livery Builder - Complete UI Design Prompt
## For Google Stitch AI & Figma Make

**Project:** SimVox Livery Builder - Production Application  
**Purpose:** Generate complete, production-ready UI designs for all screens  
**Target Platform:** Desktop application (Tauri 2.x + React)  
**Design System:** Based on existing SimVox Product UI (see style conformity requirements)

---

## 🎨 CRITICAL: SimVox Design System (MUST FOLLOW)

### **Color Palette** (Dark Mode - MANDATORY)

```css
/* Background Colors */
--color-bg-base: #0B0F14;          /* Main app background - deep navy black */
--color-bg-surface: #121826;       /* Panels, cards, sidebar - lighter navy */
--color-bg-overlay: #0F172A;       /* Modals, dropdowns - mid navy */

/* Text Colors */
--color-fg-primary: #E5E7EB;       /* Main text - light gray */
--color-fg-secondary: #9CA3AF;     /* Secondary text - medium gray */

/* Brand Colors */
--color-brand-primary: #22D3EE;    /* SimVox cyan - primary actions */
--color-brand-secondary: #14B8A6;  /* Teal - secondary actions */

/* Status Colors */
--color-status-success: #22C55E;   /* Green - success, 60 FPS */
--color-status-warning: #F59E0B;   /* Amber - warning, 30-60 FPS */
--color-status-danger: #EF4444;    /* Red - error, <30 FPS */

/* Borders */
--color-border: #1F2937;           /* All borders, dividers */
```

### **Typography**

```css
/* Font Family */
font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;

/* Font Sizes */
--text-12: 0.75rem;     /* 12px - labels, captions */
--text-14: 0.875rem;    /* 14px - body text, buttons */
--text-16: 1rem;        /* 16px - default body */
--text-20: 1.25rem;     /* 20px - section headers */
--text-24: 1.5rem;      /* 24px - panel titles */
--text-32: 2rem;        /* 32px - page titles */
--text-48: 3rem;        /* 48px - hero text */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.4;
--line-height-relaxed: 1.5;
```

### **Spacing System**

```css
--space-2: 0.125rem;    /* 2px */
--space-4: 0.25rem;     /* 4px */
--space-8: 0.5rem;      /* 8px */
--space-12: 0.75rem;    /* 12px */
--space-16: 1rem;       /* 16px */
--space-24: 1.5rem;     /* 24px */
--space-32: 2rem;       /* 32px */
--space-48: 3rem;       /* 48px */
--space-64: 4rem;       /* 64px */
```

### **Border Radius**

```css
--radius-4: 0.25rem;    /* 4px - small elements */
--radius-8: 0.5rem;     /* 8px - buttons, inputs */
--radius-12: 0.75rem;   /* 12px - cards */
--radius-16: 1rem;      /* 16px - panels */
```

### **Shadows (Elevation)**

```css
--elevation-0: none;
--elevation-1: 0 2px 8px rgba(0, 0, 0, 0.20);   /* Buttons */
--elevation-2: 0 6px 20px rgba(0, 0, 0, 0.24);  /* Dropdowns */
--elevation-3: 0 12px 32px rgba(0, 0, 0, 0.28); /* Modals */
```

### **UI Component Patterns**

#### **Buttons**
```
Primary Button:
- Background: #22D3EE (cyan)
- Text: #0B0F14 (dark)
- Border Radius: 8px
- Padding: 12px 24px
- Font: 14px medium
- Hover: Lighten 10%
- Active: Scale 0.98

Secondary Button:
- Background: #121826 (surface)
- Text: #E5E7EB (primary)
- Border: 1px solid #1F2937
- Border Radius: 8px
- Padding: 12px 24px
- Hover: Background #0F172A

Ghost Button:
- Background: transparent
- Text: #9CA3AF (secondary)
- Hover: Background rgba(34, 211, 238, 0.1)
```

#### **Input Fields**
```
Background: #121826
Border: 1px solid #1F2937
Border Radius: 8px
Padding: 10px 12px
Font: 14px normal
Text Color: #E5E7EB
Placeholder: #9CA3AF
Focus: Border #22D3EE, outline glow
```

#### **Panels/Cards**
```
Background: #121826
Border: 1px solid #1F2937
Border Radius: 12px
Padding: 24px
Shadow: elevation-1
```

#### **Icons**
```
Library: Lucide React
Size: 20px (default), 16px (small), 24px (large)
Color: #9CA3AF (secondary) or #22D3EE (primary when active)
Stroke Width: 2px
```

---

## 📐 Screen Layouts to Design

### **Screen 1: Main Editor (Primary Screen) - MOST IMPORTANT**

**Purpose:** Main livery editing workspace with multi-texture support

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Windows Title Bar (32px height)                                   │
│  [SimVox Livery Builder]                          [- □ ✕]          │
├─────────────────────────────────────────────────────────────────────┤
│  Menu Bar (28px height)                                             │
│  File  Edit  View  Livery  Tools  Help                            │
├─────────────────────────────────────────────────────────────────────┤
│  Texture Tabs Bar (56px height)                                     │
│  [🚗 Body 4096×4096] [🪟 Windows 2048×2048] [🎨 Decals 2048×2048] │
│  [+ Add Texture]                           [🎯 Basic Mode ▼]       │
├──────────────┬──────────────────────────────────────┬───────────────┤
│   TOOLBAR    │         CANVAS AREA                  │  PROPERTIES   │
│   (200px)    │         (flexible)                   │  (300px)      │
│              │                                      │               │
│  🎯 Basic    │  ┌─────────────────────────────┐   │  Selected:    │
│  Mode        │  │                             │   │  [None]       │
│              │  │                             │   │               │
│  🔍 Select   │  │                             │   │  Position     │
│  ✏️ Brush    │  │     FABRIC.JS CANVAS       │   │  X: [____]    │
│  ◼️ Rectangle│  │                             │   │  Y: [____]    │
│  ⭕ Circle   │  │     (Livery Texture)        │   │               │
│  📐 Triangle │  │                             │   │  Size         │
│  🔤 Text     │  │                             │   │  W: [____]    │
│  🖼️ Image    │  │                             │   │  H: [____]    │
│  ⚪ Eraser   │  │                             │   │               │
│  ───────     │  └─────────────────────────────┘   │  Transform    │
│  🎨 Color    │                                     │  Rotation:    │
│  ─ Stroke    │  Zoom: [100% ▼]  Grid: [☑]        │  [____]°      │
│  👁️ Opacity  │  Wireframe: [☑]  Zones: [☐]       │               │
│  ───────     │                                     │  Opacity:     │
│  ↩️ Undo     │  📊 Performance: 60 FPS 🟢         │  [====|---]   │
│  ↪️ Redo     │                                     │  100%         │
│              │                                     │               │
│              │                                     │  [Delete]     │
├──────────────┴──────────────────────────────────────┴───────────────┤
│   LAYER PANEL (200px height)                                        │
│   Layers  │  History  │  Assets                                    │
│   ─────────────────────────────────────────────────────────         │
│   PSD Layers (Body.psd)                                             │
│   ☑️ Hood          👁️ 🔒                                           │
│   ☑️ Doors         👁️ 🔒                                           │
│   ☑️ Fenders       👁️ 🔒                                           │
│   ☑️ Roof          👁️ 🔒                                           │
│   ─────────────────────────                                         │
│   My Edits                                                          │
│   📁 Sponsors                                                       │
│     ├─ Red Bull Logo                                                │
│     └─ Pirelli Logo                                                 │
│   📁 Numbers                                                        │
│     └─ #23                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Component Specifications:**

**Windows Title Bar (32px):**
- Background: #0B0F14
- Border Bottom: 1px solid #1F2937
- App Name: "SimVox Livery Builder" (14px medium, #E5E7EB)
- Window Controls: Minimize, Maximize, Close (right-aligned)
- Icon: SimVox logo (20×20px, cyan #22D3EE)

**Menu Bar (28px):**
- Background: #121826
- Border Bottom: 1px solid #1F2937
- Menu Items: "File Edit View Livery Tools Help" (14px normal, #E5E7EB)
- Hover: Background #0F172A
- Active: Text #22D3EE

**Texture Tabs Bar (56px):**
- Background: #121826
- Border Bottom: 1px solid #1F2937
- Tabs: Rounded top corners (8px), active tab has cyan top border (3px #22D3EE)
- Tab Content: Icon (20px) + Name (14px medium) + Resolution (12px secondary)
- Active Tab: Background #0F172A
- Inactive Tabs: Background #121826, hover #0F172A
- "+ Add Texture" button: Ghost style, cyan text
- Mode Toggle: "🎯 Basic Mode ▼" button (top-right), dropdown menu

**Toolbar Panel (200px width):**
- Background: #121826
- Border Right: 1px solid #1F2937
- Padding: 16px
- Section Headers: "Basic Mode" (12px semibold, #9CA3AF, uppercase)
- Tool Buttons: 40×40px, icon 20px, border-radius 8px
  - Default: Background transparent, icon #9CA3AF
  - Hover: Background rgba(34, 211, 238, 0.1), icon #22D3EE
  - Active: Background #22D3EE, icon #0B0F14
- Dividers: 1px solid #1F2937, 16px margin
- Color Picker: Round swatch 32×32px with current color
- Stroke Width: Slider with visual preview
- Opacity Slider: 0-100% with percentage label

**Canvas Area (flexible width/height):**
- Background: #0B0F14 (darker than panels for canvas contrast)
- Fabric.js Canvas: Centered, actual texture dimensions
- Canvas Border: 1px solid #22D3EE (subtle glow)
- Controls Below Canvas:
  - Zoom Dropdown: "100% ▼" (14px, background #121826)
  - Grid Toggle: Checkbox "Grid" with cyan check when active
  - Wireframe Toggle: Checkbox "Wireframe"
  - Sponsor Zones Toggle: Checkbox "Zones"
  - All controls: 32px height, border-radius 8px
- Performance HUD (bottom-right):
  - "📊 Performance: 60 FPS 🟢" (12px)
  - Color-coded: Green ≥60, Yellow 30-60, Red <30

**Properties Panel (300px width):**
- Background: #121826
- Border Left: 1px solid #1F2937
- Padding: 24px
- Section Headers: "Selected", "Position", "Size", "Transform", "Opacity" (12px semibold, #9CA3AF, uppercase)
- Input Fields: 
  - Background #0F172A
  - Border 1px solid #1F2937
  - Text 14px, #E5E7EB
  - Width 100%
  - Height 36px
  - Border-radius 8px
- Labels: 14px normal, #9CA3AF, margin-bottom 8px
- Delete Button: Full width, danger red (#EF4444)

**Layer Panel (200px height, bottom):**
- Background: #121826
- Border Top: 1px solid #1F2937
- Tabs: "Layers", "History", "Assets" (14px, same style as main tabs)
- Layer List:
  - Checkbox: Cyan when checked
  - Layer Name: 14px, #E5E7EB, truncate with ellipsis
  - Icons: Eye (visibility), Lock (20px, #9CA3AF)
  - Hover: Background #0F172A
  - Folders: Collapsible with chevron icon
- Scrollbar: Thin style, 8px width, #1F2937 track, #22D3EE thumb

---

### **Screen 2: Advanced Mode (Same layout, more tools)**

**Changes from Basic Mode:**

**Toolbar Panel (250px width - wider):**
- Additional Tools Section:
  ```
  ⚙️ ADVANCED MODE
  
  Drawing:
  💨 Spray Brush
  🎨 Pattern Brush
  ⬡ Polygon
  ↗️ Text on Path
  
  Effects:
  🌈 Gradients
  ⚡ Blend Modes
  💧 Drop Shadow
  🔧 Filters
  ✂️ Clipping Mask
  
  Layout:
  📦 Group
  ⬌ Align
  📏 Distribute
  📐 Grid & Rulers
  
  Racing:
  🏁 Sponsor Library
  🔢 Number Templates
  🪞 Mirror Tools
  🎨 Team Colors
  ⚡ PSD Actions
  ```

**Properties Panel (400px width - wider):**
- Additional Sections:
  - "Blend Mode" dropdown (Multiply, Overlay, Screen, etc.)
  - "Gradient" controls (Type, Angle, Color Stops)
  - "Shadow" controls (Offset X/Y, Blur, Color)
  - "Filters" section (Brightness, Contrast, Saturation sliders)
  - "Stroke" section (Width, Color, Dash Pattern)

---

### **Screen 3: Reference Window (Floating Modal)**

**Purpose:** Display inspiration images while designing

**Layout:**
```
┌────────────────────────────────────────────┐
│  📸 Reference Images           [- □ ✕]     │ (Title Bar: 32px)
├────────────────────────────────────────────┤
│  Controls:                                 │
│  Opacity: [====|---] 90%  ☑️ Always on Top │ (40px height)
├────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Image 1  │  │ Image 2  │  │ Image 3  │ │
│  │          │  │          │  │          │ │
│  │ [Car     │  │ [Detail  │  │ [Color   │ │
│  │  Ref]    │  │  Shot]   │  │  Scheme] │ │
│  │          │  │          │  │          │ │
│  │ 🗑️ 🔍    │  │ 🗑️ 🔍    │  │ 🗑️ 🔍    │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  + Add Reference Image               │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**Specifications:**
- Window: 500×700px (default), resizable, draggable
- Background: #121826 with rgba(0,0,0,0.95) backdrop
- Border: 1px solid #22D3EE (cyan glow)
- Border Radius: 12px
- Shadow: elevation-3
- Grid Layout: 2-3 columns, auto rows
- Image Cards:
  - Background: #0F172A
  - Border: 1px solid #1F2937
  - Border Radius: 8px
  - Padding: 8px
  - Image: Object-fit contain, max-height 200px
  - Label: 12px, #9CA3AF, truncate
  - Action Icons: Delete (trash), Fullscreen (zoom) - 16px, bottom-right
  - Hover: Border #22D3EE
- Add Button: Dashed border, cyan, full width, 48px height
- Opacity Slider: Range 30-100%, updates window transparency
- Always on Top: Checkbox, keeps window above canvas

---

### **Screen 4: Sponsor Library (Sidebar Panel)**

**Purpose:** Drag & drop sponsor logos

**Layout:**
```
┌─────────────────────────────────────────┐
│  🏁 Sponsor Library              [✕]    │ (Header: 48px)
├─────────────────────────────────────────┤
│  [Search sponsors...]          [Filter]│ (Search: 40px)
├─────────────────────────────────────────┤
│  Categories:                            │
│  [All] [Tire] [Fuel] [Auto] [Custom]   │ (Tabs: 36px)
├─────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │Pirelli│ │Micheln│ │ Shell │         │ (Grid: Auto)
│  │ [🏎️] │ │ [🏎️] │ │ [⛽]  │         │
│  └───────┘ └───────┘ └───────┘         │
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │RedBull│ │Monster│ │Castrol│         │
│  │ [🥤] │ │ [🥤] │ │ [⛽]  │         │
│  └───────┘ └───────┘ └───────┘         │
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │Mobil 1│ │  DHL  │ │Sparco │         │
│  │ [⛽]  │ │ [📦]  │ │ [👔]  │         │
│  └───────┘ └───────┘ └───────┘         │
│                                         │
│  [+ Upload Custom Logo]                 │ (Button: 40px)
└─────────────────────────────────────────┘
```

**Specifications:**
- Panel Width: 350px (slides in from right)
- Background: #121826
- Border Left: 1px solid #1F2937
- Search Bar:
  - Background: #0F172A
  - Icon: Search (16px, left, #9CA3AF)
  - Placeholder: "Search sponsors..." (14px, #9CA3AF)
  - Border Radius: 8px
  - Height: 40px
- Category Tabs:
  - Horizontal scroll if needed
  - Active: Background #22D3EE, text #0B0F14
  - Inactive: Background #0F172A, text #9CA3AF
  - Border Radius: 20px (pill shape)
  - Padding: 8px 16px
- Logo Grid:
  - Grid: 3 columns, gap 12px
  - Cards: 100×100px
    - Background: #0F172A
    - Border: 1px solid #1F2937
    - Border Radius: 8px
    - Logo: Centered, max 80×80px, object-fit contain
    - Name: 10px, #E5E7EB, bottom overlay
    - Hover: Border #22D3EE, cursor grab
    - Dragging: Cursor grabbing, opacity 0.7
- Upload Button:
  - Full width
  - Dashed border #22D3EE
  - Background transparent
  - Icon + text: "+ Upload Custom Logo"
  - Hover: Background rgba(34, 211, 238, 0.1)

---

### **Screen 5: Grid & Wireframe Overlays (Canvas Overlays)**

**Grid Overlay:**
```
Visual Specification:
- Lines: 1px solid rgba(34, 211, 238, 0.3) (cyan, 30% opacity)
- Spacing: Configurable (default 50px)
- Pattern: Vertical and horizontal lines
- Major lines every 10: 2px wide, 50% opacity
- Z-index: Above canvas, below objects
- Toggle: Checkbox in canvas controls
```

**Wireframe Overlay:**
```
Visual Specification:
- Panel Outlines: 2px dashed #22C55E (green, racing theme)
- Panel Labels: 12px semibold, #22C55E, background rgba(0,0,0,0.7)
- Common Panels: Hood, Doors, Fenders, Roof, Wing, Bumpers
- Label Position: Center of each panel
- Toggle: Checkbox in canvas controls
- Z-index: Above grid, below objects
```

**Sponsor Zones Overlay:**
```
Visual Specification:
- Zone Boxes: 
  - Recommended: 3px solid #22C55E (green), background rgba(34, 197, 94, 0.1)
  - Optional: 2px dashed #F59E0B (amber), background rgba(245, 158, 11, 0.05)
- Zone Labels: 
  - Text: 14px semibold, zone name + ⭐ (if recommended)
  - Background: rgba(0,0,0,0.8)
  - Padding: 8px
  - Border Radius: 4px
  - Position: Top-left of zone
- Common Zones:
  - Hood Center ⭐
  - Front Fender (Left/Right) ⭐
  - Door Upper ⭐
  - Roof
  - Rear Quarter Panel
  - Wing
- Click Zone: Auto-place sponsor at zone center
- Toggle: Checkbox in canvas controls
```

---

### **Screen 6: Voice Command Interface**

**Voice Indicator (Always Visible - Top Right):**
```
┌─────────────────────────────────┐
│  🎤 Voice Commands    [●]       │ (When Active)
│  Listening...                   │
│  "Move the number decal left"   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🎤 Voice Commands    [○]       │ (When Idle)
│  Click to activate              │
└─────────────────────────────────┘
```

**Voice Command Panel (Expandable):**
```
┌──────────────────────────────────────────┐
│  🎤 Voice Commands            [- □ ✕]    │
├──────────────────────────────────────────┤
│  Status: ● Listening                     │
│  ─────────────────────────────────────   │
│  Last Command:                           │
│  "Move the number decal left"            │
│  ✅ Done                                 │
│  ─────────────────────────────────────   │
│  Command History:                        │
│  ✅ "Insert Red Bull logo on layer 5"   │
│  ✅ "Make background blue"               │
│  ✅ "Add circle shape"                   │
│  ─────────────────────────────────────   │
│  Available Commands:                     │
│  • "Move [object] [direction]"           │
│  • "Insert [sponsor] logo"               │
│  • "Make [object] [color]"               │
│  • "Add [shape]"                         │
│  • "Undo" / "Redo"                       │
│  • "Stop" (for continuous commands)      │
│  ─────────────────────────────────────   │
│  [Start Listening] [Stop] [Settings]     │
└──────────────────────────────────────────┘
```

**Specifications:**
- Indicator (Compact):
  - Position: Fixed top-right, 250×60px
  - Background: #121826
  - Border: 2px solid #22D3EE (when active), #1F2937 (when idle)
  - Border Radius: 12px
  - Icon: Microphone 20px
  - Status Dot: 8px, pulsing animation when listening
  - Text: Current voice transcript (14px, #E5E7EB)
- Panel (Expanded):
  - Width: 400px, Height: 600px
  - Position: Fixed right side, slide in animation
  - Background: #121826
  - Border Left: 1px solid #1F2937
  - Status: Listening indicator with pulsing dot
  - Last Command: 16px bold, #22D3EE
  - Confirmation: ✅ icon + "Done" (14px, #22C55E)
  - History List:
    - Items: 14px, #E5E7EB
    - Status Icons: ✅ (success), ❌ (failed), ⏳ (processing)
    - Hover: Background #0F172A
  - Available Commands:
    - List: 12px, #9CA3AF
    - Bullets: Cyan dots
  - Buttons: Primary style (Start Listening), secondary (Stop, Settings)

---

### **Screen 7: Racing Number Templates (Modal)**

**Purpose:** Quick-apply racing number styles

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  🔢 Racing Number Templates            [✕]        │ (Header: 56px)
├────────────────────────────────────────────────────┤
│  Choose your racing number style:                 │ (Subtitle: 32px)
├────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   GT3 Style │ │   F1 Style  │ │ NASCAR Style│ │
│  │             │ │             │ │             │ │
│  │     #23     │ │     #23     │ │     #23     │ │ (Preview Cards)
│  │             │ │             │ │             │ │
│  │ [Block font]│ │ [Rounded]   │ │ [Angled]    │ │
│  │ [Bold]      │ │ [Sleek]     │ │ [Classic]   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Rally Style │ │ Custom Font │ │  Outline    │ │
│  │             │ │             │ │             │ │
│  │     #23     │ │     #23     │ │     #23     │ │
│  │             │ │             │ │             │ │
│  │ [Retro]     │ │ [Your Font] │ │ [Bordered]  │ │
│  │ [Wide]      │ │ [Upload]    │ │ [3D Effect] │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
├────────────────────────────────────────────────────┤
│  Number: [23  ▼]  Color: [⚫] [⚪]  Size: [L ▼]   │ (Controls: 64px)
├────────────────────────────────────────────────────┤
│  [Cancel]                        [Apply to Canvas]│ (Actions: 56px)
└────────────────────────────────────────────────────┘
```

**Specifications:**
- Modal: 900×700px, centered
- Background: #121826
- Border: 1px solid #1F2937
- Border Radius: 16px
- Shadow: elevation-3
- Header:
  - Icon: #23 symbol (24px, #22D3EE)
  - Title: "Racing Number Templates" (24px semibold, #E5E7EB)
  - Close button: X icon (24px, #9CA3AF, top-right)
- Subtitle: 16px, #9CA3AF, margin-bottom 24px
- Template Cards:
  - Grid: 3 columns, gap 16px
  - Size: 260×200px each
  - Background: #0F172A
  - Border: 2px solid #1F2937
  - Border Radius: 12px
  - Number Preview: Large rendering of "#23" in that style
  - Style Labels: 12px tags (14px, #9CA3AF, background #121826, border-radius 4px)
  - Hover: Border #22D3EE, cursor pointer
  - Selected: Border #22D3EE (3px), background #0F172A
- Controls Bar:
  - Number Input: Dropdown, 1-999, 48px height
  - Color Pickers: Two swatches (foreground, background), 36×36px circles
  - Size Dropdown: S, M, L, XL options
  - Spacing: 16px gap between controls
- Action Buttons:
  - Cancel: Secondary style, left-aligned
  - Apply: Primary style (#22D3EE), right-aligned
  - Both: 48px height, padding 12px 32px

---

### **Screen 8: Team Color Presets (Dropdown Menu)**

**Purpose:** One-click apply team livery colors

**Layout:**
```
┌─────────────────────────────────────┐
│  🎨 Team Color Presets              │ (Header)
├─────────────────────────────────────┤
│  ┌────────────────────────────────┐ │
│  │ 🔵🔴 Red Bull Racing           │ │ (Item)
│  │ Navy Blue + Red + Yellow       │ │
│  │ [▰▰▰▰▰▰] (Color bar)           │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ ⚪🔵 Mercedes-AMG Petronas     │ │
│  │ Silver + Teal + White          │ │
│  │ [▰▰▰▰▰▰]                       │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🔴 Scuderia Ferrari            │ │
│  │ Red + Yellow + White           │ │
│  │ [▰▰▰▰▰▰]                       │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🟠🔵 McLaren Racing            │ │
│  │ Papaya Orange + Blue           │ │
│  │ [▰▰▰▰▰▰]                       │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🟢 Aston Martin Aramco         │ │
│  │ Racing Green + Lime            │ │
│  │ [▰▰▰▰▰▰]                       │ │
│  └────────────────────────────────┘ │
│  ───────────────────────────────── │
│  [+ Create Custom Preset]          │ (Action)
└─────────────────────────────────────┘
```

**Specifications:**
- Dropdown: 320px width, max-height 500px
- Background: #121826
- Border: 1px solid #1F2937
- Border Radius: 12px
- Shadow: elevation-2
- Header:
  - Text: "🎨 Team Color Presets" (14px semibold, #E5E7EB)
  - Padding: 12px 16px
  - Border Bottom: 1px solid #1F2937
- Preset Items:
  - Padding: 12px 16px
  - Team Logo: Emoji or small icon (20px)
  - Team Name: 14px semibold, #E5E7EB
  - Color Description: 12px, #9CA3AF
  - Color Bar: Horizontal gradient with all team colors, 4px height, border-radius 2px, margin-top 8px
  - Hover: Background #0F172A, cursor pointer
  - Click: Apply colors to selected object or entire livery
- Create Custom:
  - Full width button
  - Dashed border #22D3EE
  - Text: "+ Create Custom Preset" (14px, #22D3EE)
  - Hover: Background rgba(34, 211, 238, 0.1)

---

### **Screen 9: PSD Quick Actions (Panel)**

**Purpose:** Fast operations on PSD layers

**Layout:**
```
┌─────────────────────────────────────┐
│  ⚡ PSD Quick Actions               │ (Header)
├─────────────────────────────────────┤
│  ┌────────────────────────────────┐ │
│  │ 🚫 Hide Windows                │ │ (Button)
│  │ Hide all window glass layers   │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🚗 Body Only Mode              │ │
│  │ Show only body panels          │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 💡 Toggle Shadows              │ │
│  │ Show/hide shadow layers        │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🎨 Reset to Template           │ │
│  │ Restore original PSD state     │ │
│  └────────────────────────────────┘ │
│  ───────────────────────────────── │
│  ┌────────────────────────────────┐ │
│  │ 📦 Export Visible Layers       │ │
│  │ Export only visible to PNG     │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🔄 Flatten All Edits           │ │
│  │ Merge user edits into PSD      │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Specifications:**
- Panel: 280px width
- Background: #121826
- Border: 1px solid #1F2937
- Border Radius: 12px
- Padding: 16px
- Header:
  - Text: "⚡ PSD Quick Actions" (14px semibold, #E5E7EB)
  - Margin Bottom: 12px
- Action Buttons:
  - Full width, 56px height each
  - Background: #0F172A
  - Border: 1px solid #1F2937
  - Border Radius: 8px
  - Padding: 12px
  - Icon: 20px, left-aligned, #22D3EE
  - Title: 14px semibold, #E5E7EB
  - Description: 12px, #9CA3AF
  - Hover: Border #22D3EE, background lighten
  - Click: Instant action + visual feedback (button scale 0.98)
  - Margin Bottom: 8px
- Divider: 1px solid #1F2937, margin 16px 0

---

### **Screen 10: Export Dialog (Modal)**

**Purpose:** Export livery in various formats

**Layout:**
```
┌───────────────────────────────────────────────────┐
│  💾 Export Livery                      [✕]       │ (Header: 56px)
├───────────────────────────────────────────────────┤
│  Export Settings                                  │ (Section: 24px)
├───────────────────────────────────────────────────┤
│  Format:                                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  │PNG │ │DDS │ │TGA │ │PSD │ │All │            │ (Format Tabs)
│  └────┘ └────┘ └────┘ └────┘ └────┘            │
│                                                   │
│  Resolution:                                      │
│  ○ 4096 × 4096 (Original)                        │ (Radio Buttons)
│  ○ 2048 × 2048 (Half)                            │
│  ○ 1024 × 1024 (Quarter)                         │
│  ◉ Custom: [____] × [____]                       │
│                                                   │
│  DDS Compression: (if DDS selected)              │
│  [DXT5 (RGBA) ▼]                                 │ (Dropdown)
│                                                   │
│  Textures to Export:                             │
│  ☑️ Body (4096×4096)                             │ (Checkboxes)
│  ☑️ Windows (2048×2048)                          │
│  ☑️ Decals (2048×2048)                           │
│  ☐ Numbers (1024×1024)                           │
│                                                   │
│  Export Options:                                 │
│  ☑️ Include alpha channel                        │
│  ☐ Flatten layers                                │
│  ☑️ Export metadata (JSON)                       │
│                                                   │
│  Export Location:                                │
│  [C:\Users\...\Liveries\BMW_M4_GT3_TeamSimVox]   │ (Path Input)
│  [Browse...]                                     │
│                                                   │
├───────────────────────────────────────────────────┤
│  Preview:                                         │ (Preview: 200px)
│  ┌──────────────────────────────────────────────┐│
│  │                                              ││
│  │        [Thumbnail of Body texture]           ││
│  │                                              ││
│  └──────────────────────────────────────────────┘│
│  Estimated file size: 48.2 MB                    │
├───────────────────────────────────────────────────┤
│  [Cancel]                              [Export]  │ (Actions: 64px)
└───────────────────────────────────────────────────┘
```

**Specifications:**
- Modal: 700×800px, centered
- Background: #121826
- Border: 1px solid #1F2937
- Border Radius: 16px
- Shadow: elevation-3
- Header: Same style as other modals
- Format Tabs:
  - Horizontal, same style as texture tabs
  - Active: Background #22D3EE, text #0B0F14
- Radio Buttons:
  - Cyan when selected
  - 14px text, #E5E7EB
  - 16px spacing between options
- Checkboxes:
  - Same style as layer panel
  - Cyan check, 20×20px
- Dropdowns:
  - Background #0F172A
  - Border 1px solid #1F2937
  - 40px height, full width
  - Arrow icon right-aligned
- Path Input:
  - Same style as other inputs
  - Browse button: Secondary style
- Preview:
  - Background: #0F172A
  - Border: 1px solid #1F2937
  - Center image, object-fit contain
  - Max height: 200px
- File Size: 12px, #9CA3AF, margin-top 8px
- Action Buttons:
  - Cancel: Secondary, left
  - Export: Primary (#22D3EE), right, with download icon
  - Progress bar appears on export (cyan, indeterminate)

---

## 🎯 Design Deliverables Required

### **For Each Screen, Provide:**

1. **Full-Resolution Mockup** (1920×1080px minimum)
   - All UI elements visible
   - Realistic content (sample livery, logos, text)
   - Dark mode colors exactly as specified

2. **Component Specifications**
   - Exact pixel dimensions
   - Spacing values
   - Color codes (hex)
   - Font sizes and weights
   - Border radius values
   - Shadow values

3. **Interaction States**
   - Default state
   - Hover state
   - Active/Selected state
   - Disabled state (if applicable)
   - Loading state (if applicable)

4. **Responsive Variants** (if different from desktop)
   - 1366×768 (laptop)
   - Collapsed sidebar states
   - Panel minimized states

5. **Animation Specifications**
   - Transition durations (default 150ms)
   - Easing functions (cubic-bezier)
   - Transform properties
   - Opacity changes

---

## 📐 Layout Grid System

**Use 8px Grid System:**
- All spacing in multiples of 8px (8, 16, 24, 32, 48, 64)
- Smaller increments (4px) only for fine-tuning
- Component heights in 8px increments (32, 40, 48, 56, 64)

**Breakpoints:**
```
Desktop: 1920×1080 (primary)
Laptop: 1366×768
Minimum: 1280×720
```

---

## 🔤 Typography Hierarchy

```
Page Titles: 32px bold, #E5E7EB, line-height 1.2
Panel Titles: 24px semibold, #E5E7EB, line-height 1.2
Section Headers: 20px semibold, #E5E7EB, line-height 1.4
Subsection Headers: 16px medium, #9CA3AF, uppercase, letter-spacing 0.5px
Body Text: 14px normal, #E5E7EB, line-height 1.5
Secondary Text: 14px normal, #9CA3AF, line-height 1.5
Captions: 12px normal, #9CA3AF, line-height 1.4
Labels: 12px semibold, #9CA3AF, uppercase, letter-spacing 0.5px
```

---

## 🎨 Icon Guidelines

**Use Lucide React Icons:**
- Default size: 20px
- Small size: 16px
- Large size: 24px
- Stroke width: 2px
- Color: #9CA3AF (inactive), #22D3EE (active/hover)

**Common Icons Needed:**
```
Navigation: Home, BookOpen, Radio, Users, Archive, ShoppingBag, Settings
Tools: Pencil, Square, Circle, Triangle, Type, Image, Eraser
Actions: Upload, Download, Save, Trash2, Copy, Clipboard
Media: Play, Pause, RotateCcw (undo), RotateCw (redo)
UI: ChevronLeft, ChevronRight, ChevronDown, X, Menu, Search
Racing: Flag, Trophy, Target, Zap, Eye, EyeOff, Lock, Unlock
```

---

## 🎬 Animation Guidelines

**Micro-interactions:**
```
Button Hover: Transform scale(1.02), 150ms ease-out
Button Click: Transform scale(0.98), 100ms ease-in
Panel Slide: Transform translateX(), 250ms ease-out
Modal Open: Opacity 0→1, scale 0.95→1, 200ms ease-out
Tab Switch: Opacity fade 150ms + slide 200ms
Voice Listening: Pulse animation 1s infinite
```

**Loading States:**
```
Spinner: Cyan (#22D3EE), 32px diameter, 2px stroke
Progress Bar: Cyan fill, 4px height, rounded ends, indeterminate animation
Skeleton: Background #0F172A, shimmer effect #121826→#1F2937→#121826
```

---

## 🖼️ Asset Requirements

**Images to Include in Mockups:**

1. **Sample Car Livery:**
   - BMW M4 GT3 body texture (4096×4096)
   - Visible: Hood, doors, fenders with basic paint

2. **Sponsor Logos:**
   - Pirelli, Michelin, Shell, Mobil 1, Red Bull, Monster, Castrol, DHL, Sparco
   - Vector format preferred, PNG acceptable
   - Transparent backgrounds

3. **Reference Images:**
   - Real car photos (GT3 cars)
   - Detail shots
   - Color scheme inspiration

4. **Racing Numbers:**
   - Large "#23" in various styles
   - Block, rounded, angled fonts

5. **Team Colors Preview:**
   - Red Bull: Navy (#1E3A8A) + Red (#DC2626) + Yellow (#FACC15)
   - Mercedes: Silver (#D1D5DB) + Teal (#14B8A6) + White (#FFFFFF)
   - Ferrari: Red (#EF4444) + Yellow (#FACC15) + White (#FFFFFF)
   - McLaren: Papaya Orange (#FB923C) + Blue (#3B82F6)
   - Aston Martin: Racing Green (#22C55E) + Lime (#84CC16)

---

## ✅ Quality Checklist

Before submitting, verify:

- [ ] **Colors:** All colors match SimVox design tokens exactly (no deviation)
- [ ] **Typography:** Inter font used, correct sizes/weights
- [ ] **Spacing:** All spacing in 8px increments (or 4px for fine-tuning)
- [ ] **Borders:** 1px solid #1F2937 (unless highlighted)
- [ ] **Radius:** 8px (buttons/inputs), 12px (cards), 16px (panels)
- [ ] **Icons:** Lucide React, 20px default, correct stroke width
- [ ] **Shadows:** Elevation-1/2/3 as specified
- [ ] **Contrast:** Text readable on all backgrounds (WCAG AA minimum)
- [ ] **Alignment:** Pixel-perfect alignment, no fuzzy edges
- [ ] **Consistency:** Same components styled identically across screens
- [ ] **Realism:** Use real content, not placeholder "Lorem ipsum"
- [ ] **States:** Show hover/active states clearly
- [ ] **Responsive:** Works at 1920×1080 and 1366×768

---

## 📤 Export Format

**Figma Deliverables:**
1. **Figma File (.fig)** with all screens in organized frames
2. **Component Library** with reusable UI components
3. **Design Tokens** as Figma styles (colors, text styles, effects)
4. **Prototype Links** for interactive flows

**Image Exports:**
1. **PNG** - Each screen at 2x resolution (3840×2160)
2. **SVG** - All icons individually
3. **PDF** - Complete design spec document

**Developer Handoff:**
1. **CSS Variables** - All design tokens as CSS custom properties
2. **Component Props** - TypeScript interfaces for each component
3. **Asset Pack** - All images, icons, fonts in organized folders

---

## 🚀 Priority Screens (Design These First)

1. **Screen 1: Main Editor** (CRITICAL) - This is the primary workspace
2. **Screen 3: Reference Window** (HIGH) - Key differentiator
3. **Screen 4: Sponsor Library** (HIGH) - Racing-specific feature
4. **Screen 6: Voice Command Interface** (HIGH) - Unique selling point
5. **Screen 2: Advanced Mode** (MEDIUM) - Extension of Screen 1
6. **Screen 7: Number Templates** (MEDIUM) - Racing-specific
7. **Screen 10: Export Dialog** (MEDIUM) - Essential workflow
8. **Screen 8: Team Colors** (LOW) - Can use existing dropdown patterns
9. **Screen 9: PSD Actions** (LOW) - Simple action list
10. **Screen 5: Overlays** (LOW) - Canvas overlays, minimal UI

---

## 🎯 Success Criteria

**The designs are successful if:**

1. ✅ **Brand Consistency:** Matches SimVox product UI design exactly
2. ✅ **Dark Mode:** All backgrounds dark (#0B0F14, #121826), no light elements
3. ✅ **Racing Theme:** Feels like professional motorsport software
4. ✅ **Professional:** Looks like Photoshop/Figma quality, not a prototype
5. ✅ **Unique:** Voice commands and racing features are visually prominent
6. ✅ **Usable:** Clear hierarchy, easy to navigate, no clutter
7. ✅ **Scalable:** Components work at different sizes/states
8. ✅ **Accessible:** Good contrast, readable text, clear affordances
9. ✅ **Developer-Ready:** Specs are precise enough to implement directly
10. ✅ **Realistic:** Uses real car images, sponsor logos, actual content

---

## 🤝 Collaboration Notes

**For AI Design Tools (Google Stitch, Figma Make):**

- **Input:** This entire prompt + SimVox design tokens
- **Output:** Complete Figma file with 10 screens
- **Iterations:** Expect 2-3 refinement rounds
- **Focus:** Get Screen 1 (Main Editor) perfect first, then iterate on others

**For Human Designers:**

- Reference existing SimVox Product UI in `C:\DATA\SimVox\simvox-docs\04-design\prototype`
- Use same component library and design patterns
- Maintain consistency with Home, Race Hub, Stories screens
- This is a new module within existing SimVox ecosystem

**Questions? Clarifications Needed?**

If any specification is unclear, default to:
1. SimVox existing design patterns
2. Industry standard (Photoshop, Figma, VS Code)
3. Racing/motorsport aesthetic (GT3, F1 visual language)

---

**End of Prompt**

**Generated:** November 12, 2025  
**Target:** Google Stitch AI / Figma Make  
**Expected Deliverable:** Complete UI design for SimVox Livery Builder (10 screens)  
**Timeline:** 3-5 days for initial designs, 1 week for refinements  
**Success Metric:** Production-ready designs that developers can implement directly from Figma specs
