# Gemini Stitch Design Prompt - AMS2 Track Generator

## Prompt for AI Design Tool (Gemini Stitch)

---

### Design Brief

Create a complete UI/UX design for **SimVox.ai AMS2 Telemetry Track Generator**, a desktop application that records telemetry from racing simulators and generates 3D track models.

---

## Application Overview

**Type**: Tauri Desktop Application (Windows/macOS/Linux)
**Purpose**: Record telemetry from Automobilista 2 and generate accurate 3D track models using a 3-run mapping method
**Target Users**: Sim racers, track designers, racing game developers
**Use Case**: Generate 3D glTF track models from live telemetry for use in visualization, analysis, and game development

---

## Design Requirements

### Overall Aesthetic

**Theme**: Dark, modern, technical
**Style**: Minimalist dashboard with focus on data visualization
**Reference**: GitHub Desktop, VSCode, racing telemetry apps (iRacing, Motec)
**Color Scheme**: Dark background (#0a0a0a) with lime green accents (#51cf66) for success states

**Design Philosophy**:
- Professional and technical, not gamified
- Clear information hierarchy
- Real-time data emphasis
- Progress transparency (show what's happening)
- Motorsport aesthetic (checkered flags, racing colors)

---

## Screens to Design

### 1. Welcome/Home Screen (1200x800px)

**Purpose**: Entry point for creating new tracks or loading existing projects

**Layout**:
- Custom dark title bar at top with app name "SimVox.ai Track Generator" and window controls
- Large centered logo/icon (race track icon or checkered flag)
- App title and tagline: "AMS2 Telemetry Track Generator" / "Generate 3D tracks from telemetry"
- Two large action cards side-by-side:
  - **Left card**: "📁 New Track" - Start 3-Run Recording Workflow
  - **Right card**: "📂 Load Files" - Import Existing Telemetry Data
- Below cards: "Recent Projects" list showing 2-3 previous tracks with metadata (name, track length, corners, time ago)
- Bottom right: Settings and Help icons

**Visual Style**:
- Dark background (#0a0a0a)
- Action cards: Dark gray (#1a1a1a) with subtle borders (#333)
- Hover effect: Border changes to lime green (#51cf66)
- Cards have icons, title, description, and CTA button
- Recent projects: List items with track icon, metadata in smaller text
- Overall feel: Clean, welcoming, professional

---

### 2. Project Setup Modal (600x500px overlay)

**Purpose**: Gather track information and choose recording method

**Layout**:
- Modal overlay on welcome screen (dark backdrop with blur)
- Modal title: "New Track Project"
- Section 1: "Track Information"
  - Input field: Track Name (required, with * indicator)
  - Input field: Variation (optional, e.g., "GP Circuit")
  - Input field: Location (optional, e.g., "United Kingdom")
  - Textarea: Notes (optional)
- Section 2: "Recording Method"
  - Radio button: "Manual 3-Run Recording" (selected by default)
    - Small description: "Record live from AMS2"
  - Radio button: "Load Existing Telemetry Files"
    - Small description: "Import pre-recorded JSON"
- Section 3: "Output Directory"
  - File path input with "Browse" button
- Bottom: Cancel and "Next: Recording →" buttons

**Visual Style**:
- Modal: Darker card (#1a1a1a) with rounded corners and shadow
- Input fields: Even darker (#0d0d0d) with subtle borders
- Focus state: Lime green border
- Radio buttons: Custom styled with lime green selection
- Primary button: Lime green background, dark text
- Secondary button: Transparent with gray border

---

### 3. Recording Instructions Screen (1200x800px)

**Purpose**: Visual guide showing how to record the 3 runs

**Layout**:
- Top: Tab navigation showing "1/3", "2/3", "3/3" (Run 1 active)
- Large section title: "Run 1: Outside Border"
- Center: Large animated diagram (400x400px) showing:
  - Simple track outline (oval shape)
  - Car icon following the outer edge of track
  - White line indicating track boundary
  - Arrow showing direction of travel
  - Subtle animation loop (car moving around track)
- Below diagram: "📋 Instructions" section with bullet points:
  - "Stay on the OUTSIDE edge of the track"
  - "Follow the white line / track boundary"
  - "Don't cut corners or go off track"
  - "Drive at ~50% race pace (smooth & consistent)"
  - "Complete ONE full lap"
- "💡 Tips" callout box with helpful advice:
  - "Imagine you're driving a wide truck"
  - "Lap time doesn't matter - consistency is what counts"
- Bottom: Time estimate "⏱ Estimated time: 2-3 minutes per lap"
- Navigation: "← Back to Setup" and "Start Recording →" buttons

**Visual Style**:
- Tab navigation: Horizontal pills with active state (lime background)
- Animated diagram: SVG or Canvas with smooth car movement
- Track: Light gray outline, car: Simple race car icon (top-down view)
- Instruction bullets: Lime checkmark icons
- Tips box: Subtle yellow background (#ffd43b with low opacity)
- Clean, instructional style like tutorial screens

---

### 4. Live Recording Screen (1200x800px)

**Purpose**: Real-time telemetry capture with visual feedback

**Layout**:
- Top banner: "Recording: Run 1 - Outside Border" with status "🔴 RECORDING" (pulsing red dot)
- Connection status bar:
  - "Connection: ✅ Connected to AMS2"
  - "Track: Silverstone GP"
  - Progress bar showing lap completion (65%)
  - "Lap Distance: 3,845m / 5,891m"
  - "Data Points: 1,247"
- Main content split 60/40:
  - **Left 60%**: "Track Map 2D"
    - Canvas showing track outline being drawn in real-time
    - Car position dot moving along path
    - Green line showing recorded path so far
    - Subtle grid background
  - **Right 40%**: "Live Telemetry" cards
    - 3x2 grid of metric cards:
      - Speed (187 km/h) - Large number
      - Position (X, Y, Z coordinates) - Small numbers
      - Lap (1/1, Current Sector: 2)
      - Gear, Throttle, Brake
    - Recording time: "1m 32s"
- Bottom section: "Debug Log" (scrollable console)
  - Monospace font
  - Timestamped messages with icons (✅ green, ℹ️ gray)
  - Latest messages at bottom
- Large "⏹ Stop & Save Recording" button at bottom right

**Visual Style**:
- Status banner: Red background with pulsing animation
- Progress bar: Lime green fill on dark gray background
- Track map: Dark canvas (#0d0d0d) with lime green path
- Telemetry cards: Nested dark cards (#0d0d0d) with borders
- Metric layout: Small gray label above, large white value
- Debug console: Black background, monospace text, color-coded
- Overall feel: High-tech racing telemetry dashboard

---

### 5. Processing & Generation Screen (1200x800px)

**Purpose**: Show progress of track alignment and generation

**Layout**:
- Title: "Generating Track: Silverstone GP"
- Main section: "Processing Pipeline" (hierarchical tree view)
  - ✅ Loaded telemetry files (3/3) - completed, checkmark
  - ✅ Validated run data - completed, checkmark
  - ⏳ Aligning runs... - in progress, spinner
    - Sub-step: Finding start/finish - 85% progress bar
    - Sub-step: Rotating to start - 70% progress bar
    - Sub-step: Resampling points - 0% (not started)
  - ⏸️ Track surface generation (pending) - paused icon
  - ⏸️ Feature detection (pending) - paused icon
    - Sub-items: Sectors, Corners, Curbs, etc. (grayed out)
  - ⏸️ Export glTF (pending) - paused icon
- Side panel: "Alignment Quality"
  - Large confidence score: "0.95 / 1.0" with meter/gauge
  - Checklist:
    - ✅ All 3 detection methods agree
    - ✅ Track lengths match within 2m
    - ✅ Runs aligned to common start
- Bottom: Time estimate "⏱ Estimated time remaining: 45 seconds"
- Processing log (scrollable console, similar to recording screen)
- "Cancel Processing" button

**Visual Style**:
- Tree view: Indented hierarchy with connecting lines
- Status icons: Checkmarks (green), spinner (cyan), paused (gray)
- Progress bars: Small inline bars with percentage
- Confidence meter: Circular or linear gauge (lime when >0.9)
- Clean, technical progress tracker aesthetic
- Similar to IDE build output or CI/CD pipeline view

---

### 6. 3D Preview & Validation Screen (1200x800px)

**Purpose**: Interactive 3D visualization with quality checks

**Layout**:
- Left sidebar (200px): "Layers" panel
  - Checkboxes for toggling visibility:
    - ☑ Surface (track mesh)
    - ☑ Line (racing line)
    - ☑ Sectors
    - ☑ Corners
    - ☐ Curbs
    - ☐ Braking
    - ☐ Pit
    - ☐ Grid (floor)
  - Each with colored icon matching feature color
- Main area (1000px): 3D Viewer
  - WebGL canvas showing 3D track model
  - Track with racing line, sector markers visible
  - Checkered flag at start/finish
  - Orbit controls hint: "Click+Drag to rotate"
  - Camera controls: "Camera: Free View" with [Reset View] button
  - Dark background with subtle grid floor
- Bottom panel: Two sections side-by-side
  - **Left**: "Track Statistics"
    - Length: 5,891m | Corners: 18 | Sectors: 3
    - Elevation: +12m to -5m (17m range)
  - **Right**: "Validation Results"
    - ✅ Track forms closed loop
    - ✅ No geometry errors
    - ✅ All features detected successfully
    - ⚠️ Pit lane not recorded (warning in orange)
- Bottom buttons: "← Re-process" and "Export Track →"

**Visual Style**:
- Sidebar: Dark panel with checkboxes (custom styled, lime when checked)
- 3D viewer: Full WebGL canvas with dark gradient background
- Track: Gray asphalt material, racing line in lime green
- Sector markers: Colored planes (blue, yellow, red)
- Statistics: Simple text layout with icons
- Validation: Checklist with status icons (checkmarks, warnings)
- Professional 3D viewer UI (like Blender or Three.js editor)

---

### 7. Export Options Modal (600x650px overlay)

**Purpose**: Configure export format and AI enrichment

**Layout**:
- Modal title: "Export Track"
- Section 1: "Output Format"
  - Radio buttons with file size estimates:
    - ○ Standard (.glb) ~8.2 MB
    - ● Optimized (.glb) ~2.1 MB (selected)
    - ○ Web Optimized (.glb) ~850 KB
  - Small description under each option
- Section 2: "Optimization Settings"
  - Checkboxes:
    - ☑ Draco mesh compression
    - ☑ Mesh simplification
    - ☑ Texture optimization
    - ☐ Remove debug markers
    - ☐ Merge similar meshes
- Section 3: "AI Enrichment (Optional)"
  - Checkboxes:
    - ☑ Add corner names (Gemini API)
      - Small text: "Uses Wikipedia + track maps"
    - ☐ Generate buildings (experimental)
    - ☐ Include historical documentation
  - API key input field (password style)
  - Info text: "ℹ️ Free tier: Unlimited reasonable use"
- Section 4: "Output Directory"
  - File path input with "Browse" button
- Section 5: "Files to be created" (preview list)
  - 📄 silverstone.glb
  - 📄 silverstone-metadata.json
  - 📁 silverstone-features/ (folder with sub-files)
- Bottom: "Cancel" and "Export Track" buttons

**Visual Style**:
- Modal: Centered overlay with dark background
- Radio buttons: Custom styled with size estimates in gray text
- Checkboxes: Lime green when checked
- Sections: Clear spacing with subtle dividers
- File preview: Icon + filename in monospace font
- Primary button: Large, lime green, prominent
- Clean, form-focused design

---

## Design System

### Colors

**Background Palette**:
- Primary background: `#0a0a0a` (near black)
- Card background: `#1a1a1a` (dark gray)
- Nested cards: `#0d0d0d` (darker)
- Borders: `#333333` (medium gray)
- Hover borders: `#555555` (lighter gray)

**Text Palette**:
- Primary text: `#e0e0e0` (light gray, high contrast)
- Secondary text: `#aaaaaa` (medium gray)
- Muted text: `#666666` (low emphasis)
- White: `#ffffff` (headings only)

**Accent Colors**:
- Success/Primary: `#51cf66` (lime green) - use for CTAs, success states, progress
- Error: `#ff6b6b` (red) - errors, warnings, stop actions
- Warning: `#ffd43b` (orange/yellow) - warnings, alerts
- Info: `#339af0` (cyan/blue) - info messages, neutral highlights
- Recording: `#ff0000` (bright red) - recording indicator (pulsing)

**Feature Colors** (for 3D visualization):
- Racing line: `#00ff00` (bright green)
- Sector 1: `#3b82f6` (blue)
- Sector 2: `#fbbf24` (yellow)
- Sector 3: `#ef4444` (red)
- Corners: `#a855f7` (purple)
- Curbs: White and red alternating
- Braking zones: `#ff6b6b` (red)

### Typography

**Font Family**:
```
Primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif
Monospace: 'Consolas', 'Monaco', 'Courier New', monospace
```

**Font Sizes**:
- H1 (screen titles): 24px / 1.5rem
- H2 (section headers): 20px / 1.25rem
- H3 (subsections): 17.6px / 1.1rem
- Body: 15.2px / 0.95rem
- Small: 13.6px / 0.85rem
- Tiny: 12px / 0.75rem

**Font Weights**:
- Bold (headers): 600
- Medium (emphasis): 500
- Normal (body): 400

### Spacing

**Spacing Scale** (base unit 4px):
- XS: 4px
- S: 8px
- M: 12px
- L: 16px
- XL: 24px
- 2XL: 32px
- 3XL: 48px

**Component Spacing**:
- Card padding: 16px (L)
- Card gap: 16px (L)
- Button padding: 12px 24px (M XL)
- Input padding: 8px 12px (S M)
- Section spacing: 24px (XL)

### Border Radius
- Small (inputs): 4px
- Medium (cards): 6px
- Large (modals): 8px
- Buttons: 6px

### Shadows
- Cards: `0 2px 8px rgba(0, 0, 0, 0.3)`
- Modals: `0 8px 32px rgba(0, 0, 0, 0.5)`
- Button hover: `0 4px 12px rgba(81, 207, 102, 0.3)` (lime glow)

### Components

**Buttons**:
- Primary: Lime green background, dark text, rounded corners
  - Hover: Lighter lime, subtle shadow glow
- Secondary: Transparent, gray border, light text
  - Hover: Lime border and text
- Destructive: Red background
  - Hover: Darker red

**Cards**:
- Dark background with subtle border
- Hover: Border color changes to lime or lighter gray
- Padding: 16px
- Border radius: 6px

**Inputs**:
- Dark background (#0d0d0d)
- Gray border (#333)
- Light text (#e0e0e0)
- Focus: Lime green border
- Placeholder: Gray (#666)

**Progress Bars**:
- Background: Dark (#222)
- Fill: Lime green gradient
- Height: 20px
- Percentage text centered
- Smooth animation (0.3s transition)

**Checkboxes & Radio Buttons**:
- Custom styled (not default browser)
- Unchecked: Gray border, transparent
- Checked: Lime background with white checkmark
- Size: 18px x 18px

**Tooltips**:
- Dark background (#1a1a1a)
- Light text
- Small arrow pointer
- 4px border radius

---

## Additional Design Guidance

### Visual Hierarchy

1. **Primary actions**: Lime green buttons, large, prominent
2. **Secondary actions**: Gray outline buttons, smaller
3. **Data visualization**: Lime green for active/important, gray for inactive
4. **Status indicators**: Color-coded (green=success, red=error, yellow=warning, cyan=info)

### Iconography

Use simple, line-based icons from **Lucide** icon set or similar:
- File/folder icons for file operations
- Checkered flag for racing/finish line
- Car icon for vehicle/telemetry
- Gear icon for settings
- Question mark for help
- Checkmarks for success
- Warning triangle for warnings
- X for errors

### Animations

**Subtle animations** for polish:
- Fade in: Screens/modals (300ms)
- Progress bars: Smooth width transition (300ms)
- Hover states: Border/background color change (200ms)
- Recording dot: Pulsing opacity animation (1s loop)
- Page transitions: Slide up and fade in (300ms)

**No excessive animations** - keep it professional and fast.

### Accessibility

- High contrast text (4.5:1 minimum ratio)
- Visible focus indicators (lime outline)
- Clear button labels
- Status communicated with color AND text/icons
- Keyboard navigable (tab through all controls)

---

## Technical Notes for Implementation

- Desktop app, minimum window size 1200x800px
- No mobile/responsive design needed
- Dark theme only (no light mode)
- WebGL 3D viewer (Three.js compatible)
- Canvas/SVG for 2D visualizations
- Real-time updates (10Hz for telemetry)

---

## Reference Visual Style

**Similar Applications**:
- GitHub Desktop (dark theme, clean cards)
- Visual Studio Code (color scheme, panels)
- iRacing telemetry apps (racing data visualization)
- Figma desktop app (modern, minimal)
- Discord (dark theme execution)

**NOT like**:
- Bright/colorful gaming UIs
- Skeuomorphic designs
- Cluttered dashboards
- Low-contrast themes

---

## Deliverables Requested

For each screen (#1-7):
1. High-fidelity mockup (1200x800px or specified size)
2. Component specifications (buttons, inputs, cards)
3. Color palette swatches
4. Typography specimens
5. Interactive prototype (if possible)

Optional:
- Design system Figma file
- Component library
- Responsive states (hover, focus, disabled)
- Animation specifications

---

## Example Screen Layout (ASCII for reference)

Welcome Screen:
```
┌────────────────────────────────────────────┐
│ 🏁 SimVox.ai Track Generator      [─][□][×] │
├────────────────────────────────────────────┤
│                                            │
│           [SimVox.ai Logo Icon]              │
│     AMS2 Telemetry Track Generator         │
│                                            │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ 📁 New Track │  │ 📂 Load Files│        │
│  │              │  │              │        │
│  │ [Button]     │  │ [Button]     │        │
│  └──────────────┘  └──────────────┘        │
│                                            │
│  Recent Projects:                          │
│  • Silverstone GP                          │
│  • Spa-Francorchamps                       │
│                                            │
└────────────────────────────────────────────┘
```

---

## Final Notes

This application should feel **professional, technical, and focused** - like a tool for serious sim racers and developers. The dark theme with lime green accents creates a racing/performance aesthetic while maintaining readability.

The UI should prioritize:
1. **Clarity**: What's happening right now?
2. **Progress**: How far along am I?
3. **Feedback**: Did my action work?
4. **Guidance**: What should I do next?

Design should be clean, modern, and functional - beauty through simplicity and excellent information design.

---

**End of Design Prompt**

---

## How to Use This Prompt

1. Copy this entire prompt
2. Paste into Gemini Stitch or your preferred AI design tool
3. Request designs for each screen individually or all at once
4. Specify output format (PNG, Figma, Sketch, etc.)
5. Iterate on designs as needed

**Example follow-up prompts**:
- "Create screen 1 (Welcome Screen) following this spec"
- "Design the 3D Preview screen with the layer sidebar"
- "Generate a complete design system based on the color palette"
- "Create hover states for all buttons"
