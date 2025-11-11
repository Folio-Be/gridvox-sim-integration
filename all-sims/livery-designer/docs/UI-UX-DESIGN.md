# UI/UX Design Specifications

**Project:** GridVox AI Livery Designer
**Design Philosophy:** Dark gaming aesthetic + professional creative tools
**Inspiration:** Trading Paints + Figma + Midjourney
**Screen Count:** 9 core screens

---

## Design System

### Color Palette
```
Primary Background: #0D0D0D (pure black)
Secondary Background: #1E1E1E (dark gray)
Card Background: #2A2A2A (lighter gray, with subtle transparency)
Accent Primary: #00D9FF (electric blue) - CTAs, active states
Accent Secondary: #FF6B35 (vibrant orange) - AI features, warnings
Text Primary: #FFFFFF (white)
Text Secondary: #A0A0A0 (gray)
Success: #10B981 (green)
Warning: #F59E0B (amber)
Error: #EF4444 (red)
```

### Typography
```
Font Family: Inter or Poppons (modern sans-serif)
Headings:
  - H1: 48px, Bold (700)
  - H2: 36px, Semibold (600)
  - H3: 24px, Medium (500)
Body: 16px, Regular (400)
Small: 14px, Regular (400)
Tiny: 12px, Regular (400)
```

### Spacing System
```
Base: 8px
XS: 4px (0.5×)
SM: 8px (1×)
MD: 16px (2×)
LG: 24px (3×)
XL: 32px (4×)
XXL: 48px (6×)
```

### Components
```
Buttons:
  - Border radius: 8px
  - Padding: 12px 24px
  - Hover: scale(1.05) + brightness(1.1)

Cards:
  - Border radius: 12px
  - Box shadow: 0 4px 6px rgba(0,0,0,0.3)
  - Glass-morphism: backdrop-filter: blur(10px)

Inputs:
  - Border radius: 6px
  - Border: 1px solid #3A3A3A
  - Focus: border-color #00D9FF, glow effect
```

---

## Screen 1: Landing Dashboard

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│  [GridVox Logo]          [Library] [Marketplace] [Account]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              ╔═══════════════════════════════════╗           │
│              ║  "From Photo to Race in Minutes"  ║           │
│              ║                                    ║           │
│              ║    [⚡ Create New Livery] (CTA)    ║           │
│              ╚═══════════════════════════════════╝           │
│                                                               │
│  ┌──────────────────────┬──────────────────────┬──────────┐ │
│  │ 🎨 AI Generation     │ 🖼️ Quick Start        │ 📚 Learn │ │
│  │ Upload photo → Done  │ Browse templates     │ Tutorial │ │
│  └──────────────────────┴──────────────────────┴──────────┘ │
│                                                               │
│  Recent Projects:                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ [3D Preview] │ │ [3D Preview] │ │ [3D Preview] │        │
│  │ Porsche 992  │ │ McLaren 720S │ │ BMW M4 GT3   │        │
│  │ 2 days ago   │ │ 5 days ago   │ │ Draft        │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Visual Details
- **Hero Section:** Large gradient background (dark blue #1a2332 to black)
- **CTA Button:** Glowing electric blue (#00D9FF) with pulse animation
- **3D Previews:** Interactive Three.js car models, hover to rotate
- **Background Pattern:** Subtle racing stripe pattern at 3% opacity

---

## Screen 2: Upload Reference Photo

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]        Upload Reference Photo        [Skip →]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│           ╔═══════════════════════════════════════╗          │
│           ║                                       ║          │
│           ║    📸  Drag & Drop Photo Here        ║          │
│           ║                                       ║          │
│           ║    or [Browse Files]                  ║          │
│           ║                                       ║          │
│           ║    JPG, PNG, HEIC • Max 20MB          ║          │
│           ╚═══════════════════════════════════════╝          │
│                                                               │
│  [+ Add More Photos] (Pro feature)                           │
│                                                               │
│  Tips:                                                        │
│  ✓ Clear side or 3/4 view                                   │
│  ✓ Good lighting, minimal shadows                            │
│  ✓ Full car visible                                          │
│                                                               │
│                          [Next →]                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Details
- **Drop Zone:** Dashed border (#3A3A3A), 600px × 400px
- **Drag-over State:** Border turns blue (#00D9FF), background lightens slightly
- **Preview After Upload:** Large preview with AI analysis overlay (green boxes around car, labels for quality/angle/lighting)

---

## Screen 3: Car Selection

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]        Select Target Car               [Next →]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Simulator: [AMS2 ▼] [iRacing] [ACC] [LMU]                  │
│  Search: [🔍 Type car name...]                               │
│  Filters: [GT3 ✓] [GT4] [Formula] [Prototype]               │
│                                                               │
│  Popular:                                                     │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │  [3D Model]   │ │  [3D Model]   │ │  [3D Model]   │     │
│  │ Porsche 992   │ │ McLaren 720S  │ │ BMW M4 GT3    │     │
│  │ GT3 R         │ │ GT3 Evo       │ │               │     │
│  │ ⭐ Most Used   │ │ ⭐ Trending    │ │ ⭐ New         │     │
│  └───────────────┘ └───────────────┘ └───────────────┘     │
│                                                               │
│  All Cars (387):                                              │
│  [Grid of car thumbnails, 4 per row, infinite scroll]        │
└─────────────────────────────────────────────────────────────┘
```

### Visual Details
- **Car Cards:** 280px × 320px, hover lifts with blue glow shadow
- **Selected State:** Blue border (2px, #00D9FF) + checkmark overlay
- **3D Models:** Real-time Three.js rendering, orbit on hover

---

## Screen 4: AI Generation (Loading)

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│                    AI Livery Generation                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                   ╔════════════════════╗                      │
│                   ║   [Animated 3D     ║                      │
│                   ║    Wireframe Car   ║                      │
│                   ║    Rotating with   ║                      │
│                   ║    Paint Filling]  ║                      │
│                   ╚════════════════════╝                      │
│                                                               │
│              🤖 AI is generating your livery...               │
│                                                               │
│  ✅ Analyzing reference photo                                │
│  ✅ Extracting color palette                                 │
│  🔄 Mapping to UV layout...          [████████░░] 80%        │
│  ⏳ Generating texture                                        │
│  ⏳ Optimizing seams                                          │
│                                                               │
│  Estimated: 15 seconds                                        │
│  [Cancel]                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Visual Details
- **Animation:** 3D car wireframe gradually fills with color (WebGL particles)
- **Progress Bar:** Smooth gradient fill (blue → orange)
- **Background:** Subtle animated particles (paint droplets)

---

## Screen 5: Preview & Review

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│  [← Regenerate]    Your Livery is Ready!     [Edit] [Export]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────┬───────────────────────┐  │
│  │                               │  Quality Analysis:    │  │
│  │        [3D INTERACTIVE        │  Overall: 87%  ⭐⭐⭐⭐  │  │
│  │         VIEWER]                │  Hood:    95% ✓       │  │
│  │     (Orbit, zoom, pan)        │  Doors:   92% ✓       │  │
│  │                               │  Roof:    89% ✓       │  │
│  │   [Front][Side][Rear][Top]    │  Bumper:  78% ⚠       │  │
│  │   Quick angle buttons         │  Seams:   95% ✓       │  │
│  └───────────────────────────────┴───────────────────────┘  │
│                                                               │
│  Compare:                                                     │
│  [Reference Photo] ⟷ [Generated Result]                     │
│  Similarity: 87%                                              │
│                                                               │
│  [🎨 Adjust Colors] [✨ Refine Area] [🔁 Regenerate]         │
│  [✓ Export Now] [✏️ Edit in 2D] [🎨 Edit in 3D]             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Details
- **3D Viewer:** Dark studio background, realistic car lighting
- **Quality Scores:** Color-coded bars (green >90%, yellow 80-90%, red <80%)
- **Side-by-Side:** Synchronized angles (drag slider to compare)

---

## Screen 6: 2D UV Editor

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]           2D UV Editor           [Save] [Export]   │
├──────────────────────────┬──────────────────────────────────┤
│ Tools:                   │                                   │
│ ◉ Brush                  │        [UV CANVAS]                │
│ ○ Eraser                 │     2048×2048 viewport            │
│ ○ Fill                   │     With car UV outlines          │
│ ○ Text                   │     Zoomable, pannable            │
│                          │                                   │
│ Size: [====|====]        │  [Mini 3D preview bottom-right]   │
│ Opacity: [======|==]     │  Updates as you paint             │
│                          │                                   │
│ Layers:                  │                                   │
│ 👁 Sponsors             │                                   │
│ 👁 Numbers              │                                   │
│ 👁 Base Paint           │                                   │
│                          │                                   │
│ AI Assist:               │                                   │
│ [✨ Auto-fix Seams]      │                                   │
│ [🎨 Extend Pattern]      │                                   │
└──────────────────────────┴──────────────────────────────────┘
```

### Visual Details
- **UV Overlay:** Semi-transparent labels (hood, door, roof) at 40% opacity
- **Canvas:** HTML5 Canvas with WebGL acceleration
- **AI Buttons:** Orange accent (#FF6B35) for AI-powered tools

---

## Screen 7: 3D Editor (Advanced)

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]       3D Editor (Creator)        [Save] [Export]   │
├──────────────────────────┬──────────────────────────────────┤
│ Tools:                   │       [3D CAR MODEL]              │
│ ◉ 3D Paint               │   Three.js interactive viewer     │
│ ○ Decal/Logo             │   - Paint on surface             │
│ ○ Pattern Fill           │   - Logos snap to geometry        │
│ ○ Material               │   - Real-time preview            │
│                          │                                   │
│ Paint Mode:              │  Camera:                          │
│ ◉ Project Texture        │  [📷] [📷] [📷] Saved views       │
│                          │                                   │
│ Materials:               │  Lighting:                        │
│ Gloss: [===|=====]       │  ○ Studio ○ Track ○ Sunset       │
│ Metallic: [==|======]    │                                   │
│                          │  ┌──────────────────┐            │
│ My Logos:                │  │ UV Preview       │            │
│ [thumb][thumb][thumb]    │  │ (synced)         │            │
└──────────────────────────┴──────────────────────────────────┘
```

### Visual Details
- **3D Viewport:** Grid floor, HDRI lighting
- **Decal Snap:** AI automatically aligns logos to surface normals
- **Split View:** Toggle 3D/UV/Split modes

---

## Screen 8: Export

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]                Export Livery                       │
├─────────────────────────────────────────────────────────────┤
│  Preview: [Front] [Side] [Rear]                              │
│                                                               │
│  Format:                                                      │
│  ◉ Automobilista 2 (.dds, BC3, mipmaps, 2048×2048)          │
│  ○ iRacing (.tga, 24-bit RGB)                               │
│  ○ PNG (4K for sharing)                                      │
│                                                               │
│  Installation:                                                │
│  ◉ Auto-install (Desktop app)                               │
│     Path: C:\...\Automobilista 2\CustomLiveries\            │
│  ○ Manual download (.zip)                                    │
│                                                               │
│  Share:                                                       │
│  ☑ Publish to marketplace                                    │
│  Price: [Free ▼] [$2.99] [$4.99]                            │
│                                                               │
│  [⬇️ Download] [🚀 Install to Game]                          │
└─────────────────────────────────────────────────────────────┘
```

### Visual Details
- **Preview Grid:** 3 renders (front/side/rear) at 400×300px each
- **Path Detection:** Green checkmark if game found, yellow warning if not
- **Success Modal:** Animated checkmark + "Ready to race!" message

---

## Screen 9: Library

### Layout Description
```
┌─────────────────────────────────────────────────────────────┐
│  [Home] [📚 Library] [🛒 Marketplace] [👤 Account]           │
├─────────────────────────────────────────────────────────────┤
│  My Liveries (24)               [🔍 Search] [+ New]          │
│  Sort: [Recent ▼]  Filter: [All Cars ▼]                     │
│                                                               │
│  ┌────────────────┬────────────────┬────────────────┐       │
│  │  [3D Preview]  │  [3D Preview]  │  [3D Preview]  │       │
│  │  Porsche 992   │  McLaren 720S  │  BMW M4 GT3    │       │
│  │  2 days ago    │  1 week ago    │  Draft         │       │
│  │  [Edit][Export]│  [Edit][Share] │  [Edit][Delete]│       │
│  └────────────────┴────────────────┴────────────────┘       │
│                                                               │
│  Community:                                                   │
│  [Grid of 8 featured liveries with download counts]          │
└─────────────────────────────────────────────────────────────┘
```

### Visual Details
- **Card Hover:** Lifts 4px, shows stats (views, downloads, likes)
- **Status Badges:** "Draft" (gray), "Published" (blue), "Private" (yellow)
- **Quick Actions:** Appear on hover with smooth fade-in

---

## GOOGLE AI STUDIO PROMPT (Complete Version)

```
Create a modern, dark-themed desktop application UI design for an AI-powered racing livery creator called "GridVox". The design should combine gaming aesthetics with professional creative tools, similar to Figma + Trading Paints + Midjourney interface.

OVERALL STYLE:
- Dark theme with deep grays (#1E1E1E), blacks (#0D0D0D), subtle gradients
- Accent colors: Electric blue (#00D9FF) for primary actions, vibrant orange (#FF6B35) for AI features
- Typography: Clean, modern sans-serif (Inter or Poppins style), generous spacing
- Grid-based layout with 8px spacing system
- Subtle racing stripe patterns in backgrounds (3-5% opacity)
- Glass-morphism effects on cards (backdrop-filter: blur(10px), semi-transparent)

GENERATE 9 SCREENS:

SCREEN 1 - LANDING DASHBOARD:
- Top navigation: GridVox logo (left), menu items (Library, Marketplace, Account) on right
- Large hero section: gradient background (dark blue #1a2332 to black), centered
- Prominent CTA button: "Create New Livery" with glowing electric blue effect (#00D9FF), pulsing animation
- Three feature cards below hero: "AI Generation" (paint brush icon), "Quick Start" (lightning icon), "Learn" (book icon)
- Recent projects section: 3 car thumbnails in 3D (Porsche 992 GT3 R, McLaren 720S GT3, BMW M4 GT3), interactive hover states
- Community highlights carousel at bottom with 5 featured liveries
- Background: Subtle wireframe car mesh pattern at 3% opacity

SCREEN 2 - PHOTO UPLOAD:
- Large dashed-border drop zone (600×400px) in center
- Text: "Drag & Drop Photo Here" with camera icon (48px)
- Alternative "Browse Files" button below
- File specs: "JPG, PNG, HEIC • Max 20MB"
- Tips sidebar (left): checklist with green checkmarks - "Clear side view", "Good lighting", "Full car visible"
- Example thumbnails at bottom showing good vs bad references (4 thumbnails total)
- Dark background with subtle grid pattern
- After upload: large preview with AI analysis overlay (green boxes around detected car, labels: "Side view detected", "Lighting: Good", "Quality: 85%")

SCREEN 3 - CAR SELECTION:
- Simulator filter tabs at top: AMS2 (selected, blue), iRacing, ACC, LMU
- Search bar with magnifying glass icon, full-width
- Category pills below search: GT3 (selected), GT4, Formula, Prototype (with car counts)
- "Popular Picks" section: 3 large cards (280×320px each) showing 3D car renders
  - Each card: car name, category badge, popularity indicator ("Most Used", "Trending", "New")
- Grid of all cars below (4 per row): smaller thumbnails (200×220px), infinite scroll
- Hover state: card lifts 4px with blue glow shadow
- Selected state: blue border (2px, #00D9FF) with checkmark overlay (top-right)

SCREEN 4 - AI GENERATION (LOADING):
- Center: large animated 3D wireframe car (400×300px), rotating slowly
- Wireframe gradually fills with color from bottom to top (paint filling effect)
- Text above: "AI is generating your livery..." with robot emoji
- Progress checklist on left:
  - "Analyzing reference photo" (green checkmark)
  - "Extracting color palette" (green checkmark)
  - "Mapping to UV layout" (orange spinner, progress bar showing 80%)
  - "Generating texture" (gray, pending)
  - "Optimizing seams" (gray, pending)
- Estimated time at bottom: "15 seconds"
- Subtle particle effects background (paint droplets, low opacity)
- Cancel button at bottom center (gray, subtle)

SCREEN 5 - PREVIEW & REVIEW:
- Large 3D interactive car viewer on left (60% width): dark studio background with realistic lighting
- Car can be orbited with mouse (show orbit control hint)
- Angle selector buttons below viewer: Front, Side, Rear, Top, 3/4, Low (pill-shaped buttons)
- Quality analysis panel on right (40% width):
  - Overall score: "87%" with 4 filled stars
  - Breakdown scores with color-coded bars:
    - Hood: 95% (green bar)
    - Doors: 92% (green bar)
    - Roof: 89% (green bar)
    - Bumper: 78% (yellow bar, warning icon)
  - Color match: 91%
  - Seam quality: 95%
- Compare section below: side-by-side sliders showing reference photo vs generated result
- Action buttons at bottom: "Adjust Colors", "Refine Area", "Regenerate" (secondary style)
- Large primary buttons: "Export Now", "Edit in 2D", "Edit in 3D" (card-style, with icons)

SCREEN 6 - 2D UV EDITOR:
- Left sidebar (20% width): tool palette with icons
  - Brush (selected, blue highlight), Eraser, Fill, Gradient, Stamp, Text, Select
  - Brush settings: size slider, opacity slider
  - Color palette: 8 color swatches + color picker
  - Layers panel below: thumbnails with eye icons (Sponsors, Numbers, Base Paint)
  - AI Assist section (orange buttons): "Auto-fix Seams", "Extend Pattern"
- Center canvas (60% width): large UV map (2048×2048 visible)
  - Show car UV islands outlined in semi-transparent white (40% opacity)
  - Labels for car parts (hood, door, roof) in small text
  - Zoomable, pannable canvas (show zoom percentage: 100%)
- Small 3D preview in bottom-right corner (15% width): mini Three.js viewer showing live updates as user paints
- Top toolbar: undo/redo arrows, save button, export button

SCREEN 7 - 3D EDITOR:
- Left sidebar (20% width): 3D-specific tools
  - 3D Paint Brush (selected), Decal/Logo, Pattern Fill, Material Editor, Mask/Select
  - Paint mode toggles: Paint on Surface, Project Texture (selected)
  - Brush settings: size, hardness, flow sliders
  - Material sliders: Gloss, Metallic, Roughness
  - Asset library: "Upload Logo" button, 3 logo thumbnails below
- Center viewport (65% width): Three.js 3D car on grid floor
  - Dark studio background with HDRI lighting
  - Car centered, interactive (orbit/zoom)
  - Crosshair cursor when painting mode active
- Right panel (15% width):
  - Camera presets: 5 thumbnail buttons showing saved views
  - Lighting selector: Studio (selected), Track, Sunset (radio buttons)
  - Small UV preview at bottom (synced with 3D edits)
- Bottom strip: layer visibility toggles with thumbnails

SCREEN 8 - EXPORT:
- Three preview renders at top (400×300px each): front view, side view, rear view
- Format selection section:
  - Radio buttons with detailed specs:
    - "Automobilista 2 (.dds)" selected - shows: "2048×2048, BC3 compression, Mipmaps: ✓, ~4.2MB"
    - "iRacing (.tga)" - shows: "24-bit RGB, Custom number support"
    - "PNG (4K)" - shows: "4096×4096, For sharing/archiving"
- Installation section:
  - "Auto-install" radio selected - shows detected path: "C:\...\Automobilista 2\" with green checkmark
  - "Manual download" radio - shows: "Download .zip with instructions"
- Share section:
  - Checkbox: "Publish to marketplace" (checked)
  - Price dropdown: Free (selected), $2.99, $4.99, Custom
  - Tags input: "GT3", "Porsche", "Blue", "Racing" (pill-shaped tags)
- Large primary buttons at bottom: "Download Files" (secondary), "Install to Game" (primary, blue glow)

SCREEN 9 - LIBRARY:
- Top navigation bar with tabs: Home, Library (active, blue underline), Marketplace, Account
- Header: "My Liveries (24)" with search bar and "+ New Livery" button (right)
- Sort/filter controls: "Recent" dropdown, "All Cars" dropdown, "All Sims" dropdown
- Grid layout (3 columns): livery cards (350×400px each)
  - Each card shows:
    - 3D car thumbnail (interactive, hover to rotate)
    - Car name: "Porsche 992 GT3 R"
    - Team/livery name: "Thunder Racing"
    - Metadata: "AMS2 • 2 days ago"
    - Quick action buttons (appear on hover): Edit, Export, Share, Clone
- Status badges on cards: "Draft" (gray), "Published" (blue), "Private" (yellow)
- Community section below: "Community Favorites" heading, grid of 8 cards with download counts
- Load more button at bottom (infinite scroll)

DESIGN ELEMENTS TO INCLUDE ACROSS ALL SCREENS:
- Glass-morphism cards: semi-transparent backgrounds with backdrop-filter: blur(10px)
- Micro-interactions: buttons scale(1.05) on hover, progress bars animate smoothly, success states with checkmark animations
- Icons: Lucide React style (outline, consistent 2px stroke width)
- Badges: pill-shaped with subtle shadows (border-radius: 12px, padding: 4px 12px)
- Buttons: rounded corners (8px), hover states with slight scale-up and brightness increase
- Loading states: skeleton screens with shimmer effect (animated gradient)
- Tooltips: dark (#2A2A2A) with white text, small arrow pointer, appear on 500ms hover delay
- 3D car renders: use photorealistic Porsche 992 GT3 R, McLaren 720S GT3 Evo, BMW M4 GT3 models
- Realistic liveries: show racing stripes, sponsor logos, racing numbers on preview cars
- Studio lighting: three-point lighting on all 3D models (key light from top-left, fill from right, rim from back)

TECHNICAL SPECIFICATIONS:
- Desktop application design (not mobile)
- Minimum resolution: 1920×1080
- Use 8px spacing system throughout
- All screens should feel cohesive (same spacing, colors, typography, component styles)
- Show realistic content (actual car names, realistic livery designs, proper racing aesthetics)
- UI should look professional yet accessible (not intimidating for beginners)
- Gaming aesthetic but not "gamey" (avoid neon overload, keep professional)
- Make CTAs obvious with clear visual hierarchy
- Show that AI is working but not scary/technical (friendly progress indicators)

OUTPUT: Generate each screen as a high-fidelity mockup showing the complete interface with realistic content, NOT wireframes. Include photorealistic 3D car renders where applicable. Use a cohesive dark theme throughout all 9 screens.
```

---

## ALTERNATE PROMPT (Midjourney/DALL-E Style)

If using Midjourney or DALL-E instead of Google AI Studio:

```
/imagine modern dark UI design for racing car livery designer app, professional creative software interface, dark theme #0D0D0D with electric blue #00D9FF accents, large 3D car preview viewport, sidebar with tool palette, top navigation bar, sleek gaming aesthetic similar to Figma and Blender, glass-morphism cards, realistic Porsche GT3 car render with custom racing livery, photorealistic UI mockup, desktop application, professional studio lighting, 4K quality --ar 16:9 --style raw --v 6

Create 9 variations:
1. Landing page dashboard with hero CTA
2. Photo upload screen with drag-drop zone
3. Car selection grid with 3D thumbnails
4. AI loading screen with animated wireframe
5. Preview screen with side-by-side comparison
6. 2D UV canvas editor with tools
7. 3D editor with Three.js viewport
8. Export screen with format options
9. Library grid showing saved liveries

Style requirements: Dark UI, blue/orange accents (#00D9FF/#FF6B35), Inter font, gaming aesthetic, professional grade, glass-morphism effects, micro-interactions visible, realistic 3D Porsche/McLaren/BMW GT3 cars with racing liveries
```

---

## Figma Design File Structure (Recommended)

If creating in Figma:

```
GridVox_AI_Livery_Designer.fig
├── 🎨 Design System
│   ├── Colors (palette with hex codes)
│   ├── Typography (text styles: H1-H4, Body, Small)
│   ├── Components
│   │   ├── Buttons (Primary, Secondary, Tertiary, Disabled states)
│   │   ├── Cards (Glass-morph, Hover, Selected)
│   │   ├── Inputs (Text, Select, Checkbox, Switch, Slider)
│   │   ├── Icons (Lucide React set)
│   │   └── 3D Car Renders (Porsche, McLaren, BMW)
│   └── Spacing (8px system: 4, 8, 16, 24, 32, 48)
│
├── 📱 Screens (1920×1080)
│   ├── 01_Landing_Dashboard
│   ├── 02_Upload_Photo
│   ├── 03_Car_Selection
│   ├── 04_AI_Generation_Loading
│   ├── 05_Preview_Review
│   ├── 06_2D_UV_Editor
│   ├── 07_3D_Editor_Advanced
│   ├── 08_Export_Settings
│   └── 09_Library_Grid
│
├── 🔄 User Flows (prototype connections)
│   ├── Happy Path: Upload → AI → Export (5 screens)
│   ├── Advanced Path: Upload → AI → 3D Edit → Export (6 screens)
│   └── Browse Path: Library → Edit → Export (3 screens)
│
└── 📐 Responsive (if needed)
    ├── Desktop_1440 (1440×900, laptop)
    └── Desktop_2560 (2560×1440, large monitor)
```

### Component Library in Figma

**Master Components to Create:**
1. **Button** - 4 variants (Primary, Secondary, AI Feature, Danger)
2. **Card** - 3 variants (Default, Hover, Selected)
3. **Input** - 5 types (Text, Number, Select, File Upload, Search)
4. **Livery Card** - For library grid with 3 states
5. **Quality Score Bar** - Animated progress bar with color coding
6. **3D Viewport** - Placeholder frame for Three.js integration
7. **Tool Icon** - 20 icons (Brush, Eraser, Fill, etc.)
8. **Badge** - 4 variants (Status, Category, Popularity, AI)

---

## Animation Specifications

### Key Animations to Include:

1. **CTA Button Pulse (Landing Page)**
   ```css
   @keyframes pulse {
     0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,217,255,0.7); }
     50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(0,217,255,0); }
   }
   animation: pulse 2s infinite;
   ```

2. **Card Hover Lift**
   ```css
   transition: transform 0.2s ease, box-shadow 0.3s ease;
   &:hover {
     transform: translateY(-4px);
     box-shadow: 0 8px 16px rgba(0,217,255,0.3);
   }
   ```

3. **Progress Bar Fill**
   ```css
   @keyframes fillProgress {
     from { width: 0%; }
     to { width: 80%; }
   }
   animation: fillProgress 1.5s ease-out;
   ```

4. **Wireframe Car Fill (AI Loading)**
   - Start: Wireframe outline only
   - Progress: Fill from bottom to top with gradient
   - End: Solid colored car with livery texture

5. **Success Checkmark**
   ```css
   @keyframes checkmark {
     0% { stroke-dashoffset: 100; opacity: 0; }
     50% { opacity: 1; }
     100% { stroke-dashoffset: 0; }
   }
   ```

---

## Accessibility Considerations

- **Keyboard Navigation:** All interactive elements accessible via Tab
- **Focus States:** Blue outline (2px, #00D9FF) on focused elements
- **Alt Text:** Descriptive alt text for all images/icons
- **Color Contrast:** All text meets WCAG AA standards (4.5:1 minimum)
- **Screen Reader:** Semantic HTML, ARIA labels where needed
- **Reduced Motion:** Respect `prefers-reduced-motion` media query

---

## Implementation Notes

### For Developers:

1. **3D Renders:** Use Three.js with OrbitControls, realistic PBR materials
2. **Canvas Editor:** HTML5 Canvas with WebGL for performance
3. **Glass-morphism:** Use `backdrop-filter: blur(10px)` with fallback for Safari
4. **Animations:** Use Framer Motion or CSS transitions, 60fps target
5. **Icons:** Lucide React library (consistent 24px size, 2px stroke)
6. **Responsive:** Desktop-first (1920×1080 base), scale down to 1440×900

### Asset Requirements:

- 3D car models: Porsche 992 GT3 R, McLaren 720S GT3, BMW M4 GT3 (.glb format)
- UV templates: 2048×2048 PNG with transparency for each car
- Logo library: 100+ racing sponsor logos (vector SVG)
- Example liveries: 10-20 high-quality reference liveries per car

---

**Last Updated:** January 11, 2025
**Design Status:** ✅ Specifications Complete → 🎨 Ready for Mockup Generation
**Next Step:** Use prompt with Google AI Studio / Midjourney to generate high-fidelity mockups
