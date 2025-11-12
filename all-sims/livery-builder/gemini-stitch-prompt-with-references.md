# GridVox Livery Builder - Interface Design Prompt (With Reference Images)

## Overview

Design a modern, professional web-based interface for **GridVox Livery Builder** - a next-generation multi-sim racing livery design tool. You'll be redesigning an existing tool (Trading Paints) with significant improvements in UX, AI integration, collaboration features, and modern design patterns.

**Reference images provided** show the current Trading Paints interface. Your task is to **redesign and improve** these screens while maintaining familiar design tool patterns but adding GridVox's innovative features.

---

## Reference Images Analysis & Improvement Goals

### Reference 1: Main Interface (`01-main-interface.png`)

**What the current design shows:**
- Basic three-panel layout (left sidebar, center canvas, right sidebar)
- Light/neutral color scheme
- Traditional toolbar layout
- Simple 3D car preview in center
- Cluttered with all tools always visible

**What we want instead:**
- **Dark theme by default** (professional, reduces eye strain)
- **Flexible panel system** (resizable, collapsible, dockable, floating)
- **Context-sensitive UI** (show only relevant tools based on current task)
- **Cleaner, more spacious layout** with better visual hierarchy
- **Modern design language** (rounded corners, subtle shadows, smooth gradients)
- **Collaboration indicators** (user avatars, presence indicators)
- **Command palette access** (prominent Ctrl+K shortcut hint)
- **Maximizable canvas** (double-click to go full screen)
- **Zen mode toggle** (hide all panels for distraction-free work)

**Key improvements:**
- Replace top menu bar with sleeker, more modern design
- Add floating toolbar overlays on canvas instead of fixed toolbars
- Show active users in collaboration mode
- Add quick access to AI assistant
- Modern typography and spacing

---

### Reference 2: Layers Panel (`02-layers-panel.png`)

**What the current design shows:**
- Basic layer list with small thumbnails
- Simple visibility/lock icons
- Minimal visual hierarchy
- No grouping or organization features
- Small, cramped layout

**What we want instead:**
- **Larger layer thumbnails** (28x28px minimum, easier to identify)
- **Layer search/filter** capability at top of panel
- **Color-coded groups** (with colored dots/badges)
- **Visual effect indicators** (badges showing applied effects like drop shadow, blur, etc.)
- **Smart grouping** (auto-suggest related layers)
- **Drag-and-drop with visual feedback** (ghost image while dragging)
- **Right-click context menus** for quick actions
- **Bulk selection and operations** (multi-select with checkboxes)
- **Layer states** (save/load visibility states for different views)
- **Cleaner, more spacious list** with better padding

**Key improvements:**
- Add search bar at top: `[🔍 Search layers...]`
- Show effect badges (✨ for effects, 🎨 for blend modes, etc.)
- Color-coded groups: 🔵 Team Livery, 🟢 Sponsors, 🟡 Numbers
- Larger thumbnails with better quality
- Clear selected state with accent color background
- Add "+ New Layer" button at bottom

---

### Reference 3: Grid & Guides (`03-grid-guides.png`)

**What the current design shows:**
- Basic grid overlay system
- Simple wireframe mode
- Limited visual customization
- Fixed grid spacing

**What we want instead:**
- **Advanced grid system** with multiple subdivision levels
- **Customizable grid appearance** (color, opacity, spacing)
- **Smart guides** that appear when aligning with other elements
- **Measurement display** when moving/resizing elements
- **Perspective grid option** for 3D-aware placement
- **Floating grid controls** (don't dedicate panel space)
- **Quick toggle shortcuts** (keyboard shortcuts for each view mode)
- **Saved grid presets** (different grids for different car types)

**Key improvements:**
- Floating controls overlay in top-left of canvas:
  ```
  Grid: [On ▼] Size: [Medium ▼] Opacity: [50%]
  Guides: [Smart] Wireframe: [Off]
  ```
- Visual feedback when snapping to grid (subtle highlight)
- Grid appears subtly, doesn't dominate the view
- Smart guides show distances/alignment in real-time

---

### Reference 4: Graphics Library (`04-graphics-library.png`)

**What the current design shows:**
- Grid of graphic thumbnails
- Category navigation
- Basic search
- Simple thumbnail view

**What we want instead:**
- **Larger preview thumbnails** (64x64px or bigger)
- **Hover preview** (show larger preview on hover)
- **Drag-and-drop to canvas** with visual feedback
- **Advanced filtering** (by tag, color, style, recent, favorites)
- **View mode options** (grid view, list view, detail view)
- **Quick actions** (favorite, preview, add to collection)
- **Asset metadata** (size, format, author, downloads)
- **Infinite scroll or pagination** for large libraries
- **Upload zone** (drag-and-drop area for importing)
- **Community assets** (toggle between personal and shared library)

**Key improvements:**
- Tabbed interface: `[Graphics] [Patterns] [Logos] [My Uploads]`
- Search bar with autocomplete and filters:
  ```
  [🔍 Search assets...]
  Filter: [All ▼] Sort: [Recent ▼] View: [Grid] [List]
  ```
- Visual card design for each asset with hover effects
- Quick preview modal on click (before adding to canvas)
- Star/favorite system for organizing assets
- Show asset stats (used in X projects, added date, etc.)

---

### Reference 5: Drawing Tools (`05-drawing-tools.png`)

**What the current design shows:**
- Vertical toolbar with basic tool icons
- Simple icon design
- No tool grouping
- Limited visual feedback

**What we want instead:**
- **Tool groups** (related tools grouped together)
- **Radial menu option** (right-click for context-sensitive tools)
- **Tool variants** (long-press or arrow to show variants)
- **Active tool highlighting** with accent color
- **Tooltips with shortcuts** (show keyboard shortcut on hover)
- **Recent tools** section (quick access to last 3-5 tools)
- **Customizable quick access bar** (pin favorite tools)
- **Visual feedback** (active tool has clear selected state)
- **Minimal but clear icons** (2px stroke weight, simple line design)

**Key improvements:**
- Vertical toolbar on left, 48px wide
- Tool groups separated by subtle dividers:
  ```
  [Selection Tools]
    V - Select/Move
    M - Marquee
  ---
  [Shape Tools]
    R - Rectangle
    E - Ellipse
    L - Line
    P - Polygon
  ---
  [Drawing Tools]
    B - Brush
    N - Pen/Bezier
  ```
- Active tool gets `#007ACC` background with rounded corners
- Hover shows tooltip: "Rectangle Tool (R)"
- Small arrow for tools with variants (click arrow for submenu)

---

### Reference 6: Color Picker (`06-color-picker.png`)

**What the current design shows:**
- Basic color wheel or slider interface
- RGB/Hex input
- Limited saved colors
- Small, cramped interface

**What we want instead:**
- **Large color wheel** (HSV color space, 200x200px minimum)
- **Multiple input modes** (HSV, RGB, Hex, with easy switching)
- **Recent colors** (automatic, last 10 colors used)
- **Document colors** (all colors used in current project)
- **Saved swatches** (user-created color libraries)
- **Eyedropper tool** (sample from canvas or entire screen)
- **Gradient editor** (create custom gradients)
- **Color harmony generator** (complementary, analogous, triadic, etc.)
- **Accessibility checker** (contrast ratio, colorblind preview)
- **AI color suggestions** ("Suggest colors for aggressive racing livery")
- **Material previews** (see how color looks with different materials)

**Key improvements:**
- Modal popup design, centered on screen, 400px wide:
  ```
  ┌──────────────────────────────────┐
  │ Color Picker               [×]   │
  ├──────────────────────────────────┤
  │  [Large HSV Color Wheel]         │
  │                                  │
  │  Brightness: [▓▓▓▓▓░░░░]        │
  │                                  │
  │  Hex: [#FF5733]                  │
  │  RGB: R[255] G[87] B[51]         │
  │                                  │
  │  Recent: [■][■][■][■][■]         │
  │  Document: [■][■][■][■]          │
  │                                  │
  │  [Harmony ▼] [Eyedropper] [AI]  │
  │                      [Apply]     │
  └──────────────────────────────────┘
  ```
- Smooth color transitions on preview
- Live preview on canvas as you adjust
- Keyboard support (arrow keys to adjust hue/saturation)

---

### Reference 7: Properties Panel (`07-properties-panel.png`)

**What the current design shows:**
- Context-sensitive properties
- Basic sliders and inputs
- Cramped layout
- Limited visual feedback

**What we want instead:**
- **Larger, more spacious layout** with better padding
- **Grouped properties** (collapsible sections)
- **Visual property previews** (show effect of changes before applying)
- **Linked inputs** (chain icon to link width/height)
- **Unit selection** (px, %, em for different properties)
- **Precise numeric input** (monospace font, +/- buttons)
- **Smart defaults** (context-aware default values)
- **Property presets** (save common property combinations)
- **History slider** (scrub through property changes)
- **Real-time preview** (see changes live on canvas)

**Key improvements:**
- Collapsible sections with clear headers:
  ```
  ┌─────────────────────────────────┐
  │ ▼ Transform                     │
  │   X: [120 px] ⛓️ Y: [450 px]   │
  │   W: [500 px] ⛓️ H: [200 px]   │
  │   Rotation: [45°] [🔄]         │
  │   [↔️ Flip H] [↕️ Flip V]       │
  ├─────────────────────────────────┤
  │ ▼ Appearance                    │
  │   Opacity: [▓▓▓▓▓░░] 75%       │
  │   Blend: [Normal ▼]            │
  │   Fill: [███ #FF0000] [▼]      │
  │   Stroke: [███ #000000] [▼]    │
  ├─────────────────────────────────┤
  │ ▼ Effects                       │
  │   [+ Add Effect]                │
  │   ✨ Drop Shadow                │
  │     [Edit] [Remove]             │
  └─────────────────────────────────┘
  ```
- Sliders with numerical input (click to type exact value)
- Color swatches clickable to open color picker
- Visual previews for effects (show before/after)

---

### Reference 8: 3D Preview/Canvas (`08-3d-preview.png`)

**What the current design shows:**
- 3D car model rendering
- Basic rotation controls
- Simple background
- Limited lighting options

**What we want instead:**
- **High-quality 3D rendering** (PBR materials, realistic lighting)
- **Multiple lighting presets** (Studio, Outdoor, Track, Sunset, Night)
- **Environment maps** (HDR backgrounds for realistic reflections)
- **Auto-rotate option** (slow rotation for viewing all angles)
- **Comparison mode** (before/after slider, side-by-side)
- **Screenshot tool** (capture specific angles with annotations)
- **Video export** (360° turntable animation)
- **AR preview** (QR code to view on mobile in AR)
- **Material preview** (see chrome, matte, metallic in real lighting)
- **Zoom to panel** (click on car panel to zoom and focus)
- **Picture-in-picture** (small 3D preview while editing in 2D)
- **Split view** (canvas + 3D side by side)

**Key improvements:**
- Floating controls overlay (top-right of canvas):
  ```
  ┌────────────────────────┐
  │ View: [3D ▼]           │
  │ Lighting: [Studio ▼]  │
  │ Quality: ▓▓▓▓▓░ High   │
  │                        │
  │ [🔄 Auto] [📸] [🎬]    │
  │ [📱 AR] [⛶ Fullscreen] │
  └────────────────────────┘
  ```
- Smooth rotation with momentum physics
- Double-click to maximize canvas
- Canvas background with subtle gradient (dark theme)
- Performance indicator (FPS counter, optional)
- Loading skeleton when switching cars

---

## NEW GridVox-Specific Features to Add

These features are **NOT** in the reference images but are essential for GridVox:

### 1. AI Assistant Panel

**New panel tab** in right sidebar with chat interface:

```
┌────────────────────────────────────┐
│ 🤖 AI Assistant        [Persona ▼] │
├────────────────────────────────────┤
│ [Chat history, scrollable]         │
│                                    │
│ AI: How can I help with your      │
│     livery design?                │
│                                    │
│ You: Make this more aggressive    │
│                                    │
│ AI: I can help! Would you like:   │
│     1. Darker base colors          │
│     2. Sharp angular shapes        │
│     3. High contrast colors        │
│     4. All of the above            │
│                                    │
│     [1] [2] [3] [4] [Custom]       │
│                                    │
├────────────────────────────────────┤
│ [Type message...] [🎤] [Send]      │
└────────────────────────────────────┘
```

**Features:**
- Message bubbles (user vs AI styled differently)
- Quick action buttons for AI suggestions
- Voice input button (🎤)
- Persona selector (choose AI personality: Coach, Technical, Creative, etc.)
- Typing indicator when AI is thinking
- Code/color swatches in chat (clickable to apply)

### 2. Collaboration Mode Indicators

**Active users display** (top-right corner):

```
┌────────────────────────────────┐
│ 👤 Alice ● 👤 Bob ● 👤 Carol  │
│ [3 active users]               │
└────────────────────────────────┘
```

**Features:**
- Colored cursors on canvas (each user has unique color)
- User name labels next to cursors
- Live selection indicators (dashed outline in user's color)
- Activity feed showing recent changes
- In-app chat for collaborators
- Presence status (active, idle, away)

### 3. Voice Command Indicator

**Floating indicator** when voice is active (top-center):

```
┌─────────────────────────────┐
│ 🎤 Listening...     [Stop]  │
│ "Change base color to red"  │
└─────────────────────────────┘
```

**Features:**
- Pulsing microphone icon (animated)
- Live transcription of speech
- Confirmation message ("✓ Changed base color to red")
- Error handling ("❌ Sorry, I didn't understand that")

### 4. Command Palette (Ctrl+K)

**Centered modal overlay** (inspired by VS Code, Figma):

```
┌─────────────────────────────────────┐
│ [🔍 Type a command or search...]    │
├─────────────────────────────────────┤
│ → Export to iRacing         Ctrl+E  │
│   Export to ACC                     │
│   Export to AMS2                    │
│   ─────────────────                 │
│   Add Rectangle                   R │
│   Add Ellipse                     E │
│   Add Text                        T │
│   ─────────────────                 │
│   Toggle Grid                     G │
│   Toggle Dark Mode                  │
│   Open AI Assistant           Ctrl+J│
└─────────────────────────────────────┘
```

**Features:**
- Fuzzy search (type partial words)
- Recent commands at top
- Keyboard navigation (up/down arrows)
- Categories separated by dividers
- Keyboard shortcuts shown on right
- Instant search results (no lag)
- ESC to close

### 5. Export Wizard (Multi-Sim)

**Multi-step modal** for exporting to multiple sims:

```
Step 1: Select Sims
┌──────────────────────────────────┐
│ Export to Multiple Sims          │
├──────────────────────────────────┤
│ ☑ iRacing - Porsche 911 GT3 R   │
│ ☑ ACC - Porsche 911 GT3 R        │
│ ☑ AMS2 - Porsche 911 GT3 Cup     │
│ ☐ rFactor 2 - Porsche 911 GT3   │
│                                  │
│ [< Back]          [Next: Preview >]│
└──────────────────────────────────┘

Step 2: Preview & Adjust
┌──────────────────────────────────┐
│ Preview Exports                  │
├──────────────────────────────────┤
│ [iRacing]  [ACC]  [AMS2]         │
│ [Preview]  [Preview]  [Preview]  │
│                                  │
│ Differences detected:            │
│ • ACC requires higher res        │
│ • AMS2 uses different mapping    │
│                                  │
│ [< Back]        [Export All >]   │
└──────────────────────────────────┘
```

**Features:**
- Step-by-step wizard (3-4 steps)
- Car matching suggestions (AI-powered)
- Side-by-side preview of exports
- Automatic optimization per sim
- Export queue with progress
- Success notification with actions

### 6. Mobile/Responsive View (Optional)

**Simplified interface for tablets**:
- Collapsible panels (all panels hide by default)
- Touch-optimized controls (larger hit targets)
- Simplified toolbar (most-used tools only)
- Gesture support (pinch to zoom, two-finger rotate)
- Portrait and landscape layouts

---

## Design System Specifications

### Color Palette

**Dark Theme (Primary):**
```
Background:       #1E1E1E (main background)
Panel:            #252526 (panels, sidebars)
Panel Border:     #3E3E42 (dividers, borders)
Canvas:           #2D2D30 (canvas background)
Text Primary:     #CCCCCC (main text)
Text Secondary:   #858585 (labels, hints)
Text Tertiary:    #6E6E6E (disabled, subtle)
Accent Blue:      #007ACC (primary actions, selections)
Accent Hover:     #1E8AD6 (hover states)
Success:          #4CAF50 (green, confirmations)
Warning:          #FF9800 (orange, cautions)
Error:            #F44336 (red, errors)
Purple:           #9B59B6 (AI features)
Gold:             #FFD700 (premium features)
```

**Light Theme (Secondary):**
```
Background:       #F3F3F3
Panel:            #FFFFFF
Panel Border:     #E0E0E0
Canvas:           #E8E8E8
Text Primary:     #333333
Text Secondary:   #666666
(Same accent colors)
```

### Typography

```
Font Family:      Inter, "Segoe UI", "SF Pro", system-ui
Heading Large:    16px, weight 600, line-height 1.4
Heading Medium:   14px, weight 600, line-height 1.4
Body:             13px, weight 400, line-height 1.5
Small:            11px, weight 400, line-height 1.4
Monospace:        Consolas, "SF Mono", monospace (for numeric values)
```

### Spacing System

```
xs:  4px   (tight spacing)
sm:  8px   (compact elements)
md:  16px  (standard spacing)
lg:  24px  (section spacing)
xl:  32px  (panel spacing)
```

### Border Radius

```
Small:   4px   (buttons, inputs)
Medium:  8px   (cards, modals)
Large:   12px  (panels, large cards)
Round:   50%   (avatars, icons)
```

### Shadows

```
Small:   0 2px 4px rgba(0,0,0,0.1)
Medium:  0 4px 8px rgba(0,0,0,0.15)
Large:   0 8px 16px rgba(0,0,0,0.2)
Glow:    0 0 20px rgba(0,122,204,0.5) (accent glow)
```

### Animations

```
Fast:     100ms ease    (hover effects)
Normal:   200ms ease    (panel toggles)
Slow:     300ms ease    (modal open/close)
Smooth:   cubic-bezier(0.4, 0.0, 0.2, 1) (smooth easing)
```

---

## Layout Specifications

### Main Application Frame

```
┌──────────────────────────────────────────────────────────┐
│ [Logo] GridVox Livery Builder  File Edit View [👤]      │ ← 32px height
├────┬────────────────────────────────────────────┬────────┤
│    │                                            │        │
│ T  │                                            │ Layers │ ← Resizable
│ o  │          Canvas / 3D Preview               │ 280px  │   280-400px
│ o  │                                            │        │
│ l  │      (Maximizable, Flexible)               │ Props  │
│ s  │                                            │        │
│    │                                            │        │
│ 48 │                                            │ Assets │
│ px │                                            │        │
│    │                                            │   AI   │
├────┴────────────────────────────────────────────┴────────┤
│ History / Comments / Timeline (Collapsible, 180px)       │
└──────────────────────────────────────────────────────────┘
```

**Responsive behavior:**
- Minimum width: 1024px (show warning below)
- Recommended: 1920x1080 or higher
- Panels remember collapsed/expanded state
- Save workspace layouts

---

## Interaction Patterns

### Hover States
- Lighten background by 5-10%
- Show tooltip after 300ms delay
- Subtle scale up (1.02x) for buttons
- Cursor change (pointer for clickable)

### Active/Selected States
- Accent color background (`#007ACC`)
- Border highlight
- Icon color change
- Subtle inner shadow

### Loading States
- Skeleton screens (pulsing gray rectangles)
- Spinner for long operations
- Progress bars with percentage
- "Processing..." text with estimated time

### Error States
- Red border on inputs
- Error icon (⚠️ or ❌)
- Error message below element
- Shake animation on submit error

### Empty States
- Large icon (48x48px, centered)
- Explanatory text
- Call-to-action button
- Helpful tips or examples

---

## Accessibility Requirements

### Keyboard Navigation
- Tab order follows visual order
- Focus indicators (2px blue outline)
- ESC to close modals/panels
- Enter to activate buttons
- Arrow keys for lists/sliders
- Comprehensive keyboard shortcuts

### Screen Reader
- ARIA labels on all interactive elements
- Semantic HTML5 (header, nav, main, section)
- Alt text on icons/images
- Announcement regions for status updates
- Proper heading hierarchy (h1-h6)

### Color Contrast
- WCAG AA compliance (4.5:1 for text)
- Don't rely on color alone for meaning
- High contrast mode option
- Colorblind simulation toggle

### Motion
- Detect `prefers-reduced-motion`
- Disable animations if preferred
- Instant transitions alternative

---

## Technical Considerations

### Performance
- 60 FPS animations
- <100ms interaction response
- Virtual scrolling for long lists
- Code splitting / lazy loading
- Optimized 3D rendering (LOD system)

### Browser Support
- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+ (Chromium)

### Frameworks
- React or Vue.js (component-based)
- Three.js or Babylon.js (3D)
- Fabric.js or Konva (2D canvas)
- Framer Motion or GSAP (animations)

---

## Deliverables Requested

Please design these **10 screens**:

1. **Main Application Interface** - Full layout with all panels visible (dark theme)
2. **Canvas-Focused View** - Zen mode with minimal UI, maximized canvas
3. **Layer Panel Detail** - Zoomed view showing enhanced layer management
4. **Color Picker Modal** - Advanced color selection interface
5. **Command Palette** - Ctrl+K search modal with results
6. **AI Assistant Panel** - Chat interface with conversation
7. **Export Wizard** - Multi-step export modal (step 2 preview screen)
8. **Graphics Library** - Enhanced asset browser with filters
9. **Collaboration Mode** - Interface showing multiple user cursors and presence
10. **Properties Panel States** - Various states (shape, text, image selected)

---

## Design Philosophy Summary

**Improve upon Trading Paints by:**
- ✅ Dark theme for professional look and reduced eye strain
- ✅ Flexible, customizable panel system (not rigid)
- ✅ Context-sensitive UI (show what's needed, when needed)
- ✅ AI-powered assistance (chat, voice, suggestions)
- ✅ Real-time collaboration (like Figma)
- ✅ Modern interactions (command palette, shortcuts, gestures)
- ✅ Accessibility-first (keyboard, screen reader, high contrast)
- ✅ Delightful micro-interactions (smooth, responsive, polished)
- ✅ Multi-sim support (export wizard, car matching)
- ✅ Community features (assets, sharing, templates)

**Make it feel like:**
- Figma (modern, collaborative, fast)
- VS Code (powerful, customizable, keyboard-friendly)
- Canva (approachable, template-driven, fun)
- Adobe Creative Cloud (professional, full-featured)

**But specialized for:**
- Racing livery design
- 3D car visualization
- Multi-sim workflows
- Team collaboration
- AI-assisted creativity

---

## Final Notes

The reference images show a **functional but dated interface**. Your goal is to:

1. **Modernize** the visual design (dark theme, better typography, spacing, colors)
2. **Enhance** the UX (better navigation, clearer hierarchy, more intuitive controls)
3. **Add** new GridVox features (AI, voice, collaboration, multi-sim)
4. **Optimize** for efficiency (command palette, shortcuts, smart defaults)
5. **Delight** users (smooth animations, helpful feedback, thoughtful details)

Make GridVox Livery Builder the tool that designers **want to use**, not just **have to use**. It should be a joy to open and work in, whether you're creating your first livery or your hundredth.

---

**Let's create something amazing!** 🏎️✨
