# Gemini Stitch Interface Design Prompt - SimVox.ai Livery Builder

## Project Overview
Design a modern, professional web-based interface for **SimVox.ai Livery Builder** - a revolutionary multi-sim racing livery design tool that combines traditional design capabilities with AI assistance, voice commands, real-time collaboration, and social features.

## Design Philosophy
Create an interface that is:
- **Professional yet approachable** - feels like a pro design tool but welcomes beginners
- **Clean and modern** - dark theme with vibrant accents, minimal clutter
- **Focused on the canvas** - 3D preview and editing area are the stars
- **Context-sensitive** - tools appear when needed, hide when not
- **Delightful** - smooth animations, intuitive interactions, micro-moments of joy

## Core Interface Requirements

### Layout System
**Main Application Frame:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] SimVox.ai Livery Builder    File Edit View  [👤 Profile] │ ← Top Menu Bar (32px height)
├────┬─────────────────────────────────────────────────┬────────┤
│    │                                                 │        │
│ T  │                                                 │ Layers │
│ o  │           Canvas / 3D Preview Area             │  Panel │
│ o  │                                                 │        │
│ l  │         (Maximizable, Flexible)                │ Props  │
│ s  │                                                 │  Panel │
│    │                                                 │        │
│ 🎨 │                                                 │ Assets │
│    │                                                 │  Panel │
├────┴─────────────────────────────────────────────────┴────────┤
│ Timeline / History / Comments (Collapsible)                    │
└──────────────────────────────────────────────────────────────┘
```

**Panel System:**
- All panels should be **resizable, collapsible, and dockable**
- Panels can float as separate windows
- Saved workspace layouts (save custom arrangements)
- **Zen Mode** button to hide all panels (just canvas + floating toolbar)
- **Focus Mode** to maximize canvas to full screen

### Color Scheme & Theme

**Dark Theme (Default):**
- Background: `#1E1E1E` (dark gray, similar to VS Code)
- Panel backgrounds: `#252526` (slightly lighter)
- Panel borders: `#3E3E42` (subtle dividers)
- Text primary: `#CCCCCC` (light gray)
- Text secondary: `#858585` (mid gray)
- Accent color: `#007ACC` (SimVox.ai blue)
- Accent hover: `#1E8AD6` (lighter blue)
- Success: `#4CAF50` (green)
- Warning: `#FF9800` (orange)
- Error: `#F44336` (red)
- Canvas background: `#2D2D30` (slightly different from panels)

**Light Theme (Optional):**
- Similar structure but inverted values
- Canvas remains slightly darker than panels for focus

### Typography
- **Font family:** Inter, Segoe UI, or SF Pro (modern, clean sans-serif)
- **Headings:** 14-16px, weight 600
- **Body text:** 13px, weight 400
- **Small labels:** 11px, weight 400
- **Monospace:** Consolas or SF Mono for numerical values

---

## Component Specifications

### 1. Top Menu Bar
**Height:** 32px  
**Background:** `#2D2D30`  
**Content:**
- **Left side:**
  - SimVox.ai logo (icon, 24x24px)
  - "Livery Builder" text (subtle, 13px)
  - Menu items: File, Edit, View, Tools, Window, Help
  - Each menu item is clickable dropdown
  
- **Center:**
  - Project name (editable, click to rename)
  - Auto-save indicator ("Saved 2 minutes ago" or sync icon)

- **Right side:**
  - Collaboration status (active users with avatars)
  - Command palette button (🔍 Ctrl+K)
  - User profile avatar + dropdown

**Style notes:**
- Hover effect on menu items: lighten background by 10%
- Active menu: show dropdown with subtle shadow
- Icons should be 16x16px, monochrome

### 2. Left Toolbar (Vertical)
**Width:** 48px  
**Background:** `#333333`  
**Content:**
- **Tool icons** (32x32px click area, 24x24px icon):
  - Select / Move tool (cursor icon) - **V**
  - Rectangle shape tool - **R**
  - Ellipse shape tool - **E**
  - Line tool - **L**
  - Text tool - **T**
  - Pen/Bezier tool - **P**
  - Hand tool (pan) - **H**
  - Zoom tool - **Z**
  - Eyedropper - **I**
  - Paint bucket - **G**
  
- **Separator line** (subtle divider)

- **View controls:**
  - Grid toggle
  - Ruler toggle
  - Guides toggle
  - Wireframe mode

- **Bottom section:**
  - Settings cog (⚙️)
  - Help (?)

**Interaction:**
- Selected tool: highlighted with accent color background
- Hover: show tooltip with tool name + keyboard shortcut
- Right-click on tool: show tool options menu
- Long-press or small arrow: show tool variants

**Style notes:**
- Icons should be simple line icons, 2px stroke weight
- Active tool gets `#007ACC` background with rounded corners (4px)
- Tooltips appear on right side, 200ms delay

### 3. Canvas / 3D Preview Area
**The Star of the Show**

**Background:** Subtle gradient from `#2D2D30` to `#252526`

**Content:**
- 3D car model in center (WebGL rendering)
- Orbit controls (click-drag to rotate)
- Zoom controls (mouse wheel or pinch)
- Grid overlay (toggleable)

**Overlay UI Elements:**

**Top-left corner (Floating):**
```
┌────────────────────────┐
│ View: [3D ▼]           │ ← Dropdown: 3D, 2D Top, 2D Side, 2D Front
│ Lighting: [Studio ▼]  │ ← Preset lighting options
│ Quality: ▓▓▓▓▓░░ High │ ← Performance slider
└────────────────────────┘
```

**Top-right corner (Floating):**
```
┌────────────────────────┐
│ [🔄 Auto-Rotate]       │ ← Toggle auto-rotation
│ [📸 Screenshot]        │ ← Capture current view
│ [🎬 Turntable Video]   │ ← Export 360° video
│ [📱 AR Preview]        │ ← View in AR on mobile
└────────────────────────┘
```

**Bottom-center (Floating toolbar):**
```
┌─────────────────────────────────────────────────┐
│ [⟲ Undo] [⟳ Redo]  |  [-] 100% [+]  |  [⛶]    │
└─────────────────────────────────────────────────┘
```
- Undo/Redo buttons with count badges
- Zoom percentage (editable)
- Fit to window button

**Bottom-right corner:**
```
┌────────────────────────┐
│ [Expand ⛶]             │ ← Maximize canvas
│ [Zen Mode 🧘]          │ ← Hide all panels
└────────────────────────┘
```

**Interactive features:**
- Double-click canvas: maximize to full screen
- Middle-click drag: pan view
- Shift+drag: constrain rotation to axes
- Ctrl+scroll: zoom in/out
- Spacebar+drag: hand tool (temporary)

### 4. Right Sidebar - Tabbed Panels
**Width:** 280px (resizable from 200-400px)  
**Background:** `#252526`

**Tab Bar (Top):**
```
┌────────────────────────────────────┐
│ [Layers] [Properties] [Assets] [🤖 AI] │ ← Tabs
└────────────────────────────────────┘
```
- Active tab: `#007ACC` underline (2px)
- Inactive tabs: `#6E6E6E` text
- Hover: lighten text color

#### 4.1 Layers Panel Tab
**Header:**
- "Layers" title
- Search box (🔍 placeholder: "Search layers...")
- Add layer button (+)
- More options (⋮)

**Layer List:**
```
┌─────────────────────────────────────┐
│ 🔵 Team Livery        [˅] [👁️] [🔒] │ ← Group header (collapsible)
│   ├─ [Thumb] Base Color     [👁️]   │ ← Layer with thumbnail
│   ├─ [Thumb] Stripes        [👁️]   │
│   └─ [Thumb] ✨ Logo        [👁️]   │ ← Badge for effects
├─────────────────────────────────────┤
│ 🟢 Sponsors           [˅] [👁️] [🔒] │
│   ├─ [Thumb] Sponsor A      [👁️]   │
│   └─ [Thumb] Sponsor B      [👁️]   │
├─────────────────────────────────────┤
│ 🟡 Numbers            [˅] [👁️] [🔒] │
│   └─ [Thumb] #42            [👁️]   │
└─────────────────────────────────────┘
```

**Layer item specifications:**
- **Height:** 36px per layer
- **Thumbnail:** 28x28px (left side, 4px margin)
- **Layer name:** Truncate with ellipsis if too long
- **Icons:** 16x16px (visibility eye, lock)
- **Color dot:** 8px circle for group color coding
- **Badges:** Small icons for effects (sparkle), adjustments (sliders), masks (circle)
- **Hover state:** Lighten background by 5%
- **Selected state:** `#094771` background (muted blue)

**Interactions:**
- Click: select layer
- Ctrl+Click: multi-select
- Shift+Click: range select
- Drag: reorder layers
- Right-click: context menu (duplicate, delete, merge, effects, etc.)
- Eye icon: toggle visibility
- Lock icon: toggle lock
- Double-click name: rename inline

#### 4.2 Properties Panel Tab
**Context-sensitive based on selected layer/tool**

**When layer selected - General properties:**
```
┌─────────────────────────────────┐
│ Layer Properties                │
├─────────────────────────────────┤
│ Opacity:    [▓▓▓▓▓▓░░] 75%     │ ← Slider with value
│ Blend Mode: [Normal      ▼]    │ ← Dropdown
│ Fill:       [▓▓▓▓▓▓▓▓] 100%    │
├─────────────────────────────────┤
│ Transform                       │
│ X: [120 px]  Y: [450 px]       │ ← Linked inputs
│ W: [500 px]  H: [200 px]       │
│ Rotation: [45°] [🔄]           │
│ [↔️ Flip H] [↕️ Flip V]         │
└─────────────────────────────────┘
```

**When shape selected - Additional properties:**
```
┌─────────────────────────────────┐
│ Fill & Stroke                   │
├─────────────────────────────────┤
│ Fill:  [███ #FF0000] [▼]       │ ← Color picker dropdown
│ Stroke: [███ #000000] [▼]      │
│ Weight: [▓▓▓░░░░░] 4px         │
│ Style: [Solid ▼]               │
├─────────────────────────────────┤
│ Corner Radius: [▓░░░░] 8px     │
└─────────────────────────────────┘
```

**When text selected:**
```
┌─────────────────────────────────┐
│ Text Properties                 │
├─────────────────────────────────┤
│ Font: [Roboto      ▼]          │
│ Style: [B] [I] [U]             │ ← Toggle buttons
│ Size: [48 pt] [▼]              │
│ Color: [███ #FFFFFF]           │
│ Align: [≡ Left ▼]              │
├─────────────────────────────────┤
│ Letter Spacing: [0 ]           │
│ Line Height: [1.5]             │
└─────────────────────────────────┘
```

**Property input styles:**
- Sliders: `#007ACC` fill, `#3E3E42` track, circular thumb
- Numeric inputs: Monospace font, dark background `#1E1E1E`, light border
- Dropdowns: Chevron icon, opens below with smooth animation
- Color pickers: Square preview (24x24px) with current color

#### 4.3 Assets Panel Tab
**Tabbed sub-sections:**
```
┌─────────────────────────────────┐
│ [Graphics] [Patterns] [Logos]   │ ← Sub-tabs
└─────────────────────────────────┘
```

**Graphics library (grid view):**
```
┌────────────────────────────────────┐
│ Search: [🔍 Search assets...]      │
│ Filter: [All ▼] Sort: [Recent ▼]  │
├────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ │Img1│ │Img2│ │Img3│ │Img4│      │ ← Thumbnail grid
│ └────┘ └────┘ └────┘ └────┘      │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ │Img5│ │Img6│ │Img7│ │Img8│      │
│ └────┘ └────┘ └────┘ └────┘      │
├────────────────────────────────────┤
│ [+ Upload New Asset]               │
└────────────────────────────────────┘
```

**Thumbnail specifications:**
- Size: 64x64px
- Padding: 8px between items
- Hover: scale up 5%, show name tooltip
- Click: add to canvas at center
- Drag: drag onto canvas to position
- Right-click: preview, edit, delete, add to favorites

#### 4.4 AI Assistant Panel Tab
**Chat-like interface:**
```
┌────────────────────────────────────┐
│ 🤖 AI Assistant        [Persona ▼] │ ← Select persona
├────────────────────────────────────┤
│ [Chat history]                     │
│                                    │
│ AI: How can I help with your      │
│     livery design today?          │
│                                    │
│ You: Make this more aggressive    │
│                                    │
│ AI: I can help! Would you like:   │
│     1. Darker base colors          │
│     2. Sharp angular shapes        │
│     3. High contrast stripes       │
│     4. All of the above            │
│                                    │
│     [1] [2] [3] [4]                │
│                                    │
├────────────────────────────────────┤
│ [Type message...] [🎤] [Send]      │
└────────────────────────────────────┘
```

**Features:**
- Message bubbles (user vs AI styled differently)
- AI messages: light background `#2D2D30`
- User messages: accent color `#007ACC`
- Quick action buttons in AI responses
- Voice input button (🎤)
- Typing indicator when AI is processing
- Scroll to bottom on new message

### 5. Bottom Panel (Collapsible)
**Height:** 180px (when expanded), 32px (when collapsed)  
**Background:** `#1E1E1E`

**Tab options:**
- Timeline (for layer animations - future feature)
- History (undo/redo history list)
- Comments (collaboration comments)
- Activity Feed (who changed what)

**Header:**
```
┌──────────────────────────────────────────────┐
│ [History ▼] ────────────────────── [˄ Hide] │
└──────────────────────────────────────────────┘
```

**History example:**
```
┌──────────────────────────────────────────────┐
│ Now                                          │
│ • Changed layer opacity to 75%      [⟲ Go] │
│ • Added rectangle shape             [⟲ Go] │
│ • Changed base color to red         [⟲ Go] │
│ • Uploaded logo                     [⟲ Go] │
│ • Created new project            [⟲ Go] │
│ 5 minutes ago                                │
└──────────────────────────────────────────────┘
```

**Comments example (collaboration mode):**
```
┌──────────────────────────────────────────────┐
│ Bob: "Can you move that logo up?"           │
│ 2 min ago                                    │
│                                              │
│ You: "Like this?" [shows preview]           │
│ Just now                                     │
│                                              │
│ [Type comment...] [@mention] [Pin 📌] [Send]│
└──────────────────────────────────────────────┘
```

### 6. Floating UI Elements

#### Command Palette (Ctrl+K)
**Centered modal overlay:**
```
┌────────────────────────────────────────┐
│ [🔍 Type a command or search...]       │
├────────────────────────────────────────┤
│ → Export to iRacing              Ctrl+E│
│   Export to ACC                        │
│   Export to AMS2                       │
│   ────────────────                     │
│   Add Rectangle                      R │
│   Add Ellipse                        E │
│   Add Text                           T │
│   ────────────────                     │
│   Toggle Grid                        G │
│   Toggle Dark Mode                     │
│   Open Settings                        │
└────────────────────────────────────────┘
```

**Specifications:**
- Width: 600px
- Max height: 400px (scrollable)
- Background: `#252526` with subtle shadow
- Border: `#3E3E42` 1px
- Rounded corners: 8px
- Backdrop blur: 8px
- Search box: Large, 48px height
- Results: 40px height per item
- Highlight matching text in accent color
- Keyboard navigation (up/down arrows)
- ESC to close

#### Context Menus (Right-click)
```
┌─────────────────────────────┐
│ Duplicate Layer       Ctrl+J│
│ Delete Layer            Del │
│ ─────────────────────────── │
│ Merge Down            Ctrl+E│
│ Merge Visible               │
│ Flatten Image               │
│ ─────────────────────────── │
│ Layer Effects           ▶   │ ← Submenu arrow
│ Blending Options            │
│ ─────────────────────────── │
│ Lock Layer                  │
│ Hide Layer                  │
└─────────────────────────────┘
```

**Style:**
- Background: `#1E1E1E`
- Border: `#3E3E42` 1px
- Item height: 32px
- Hover: `#094771` background
- Dividers: `#3E3E42` 1px
- Shortcuts: right-aligned, gray text
- Icons: 16x16px, left of text
- Submenu arrow: right side
- Disabled items: 50% opacity

#### Toast Notifications
**Bottom-right corner:**
```
┌───────────────────────────────────┐
│ ✅ Livery exported successfully!  │
│    [View in folder] [Dismiss]    │
└───────────────────────────────────┘
```

**Types:**
- Success: Green left border `#4CAF50`, checkmark icon
- Error: Red left border `#F44336`, X icon
- Warning: Orange left border `#FF9800`, warning icon
- Info: Blue left border `#007ACC`, info icon

**Behavior:**
- Slide in from bottom-right
- Auto-dismiss after 5 seconds (unless error)
- Stack multiple notifications
- Click anywhere to dismiss
- Action buttons for relevant actions

#### Color Picker Modal
**Popup when clicking color swatch:**
```
┌─────────────────────────────────────┐
│ Color Picker                    [×] │
├─────────────────────────────────────┤
│  [HSV Color Wheel]                  │
│                                     │
│  Brightness slider                  │
│  ▓▓▓▓▓▓▓▓░░                         │
│                                     │
│  Hex: [#FF5733]                     │
│  RGB: R[255] G[87] B[51]            │
│  HSV: H[12°] S[80%] V[100%]        │
│                                     │
│  Recent Colors:                     │
│  [███][███][███][███][███]          │
│                                     │
│  Document Colors:                   │
│  [███][███][███][███]               │
│                                     │
│  [Eyedropper] [Add to Swatches]    │
│                           [Apply]   │
└─────────────────────────────────────┘
```

**Features:**
- Color wheel: 200x200px, drag to select
- Brightness slider below wheel
- Hex input with validation
- RGB/HSV sliders
- Recent colors: last 10 used
- Document colors: all colors in project
- Eyedropper tool to sample from canvas
- Apply button (or auto-apply on change)

---

## Special Features & Interactions

### Collaboration Mode Indicators
When multiple users are editing:

**Active user avatars (top-right):**
```
┌──────────────────────────────────┐
│ 👤Alice ● 👤Bob ● 👤Carol    [3] │
└──────────────────────────────────┘
```
- Green dot for online/active
- Click avatar to see what they're doing
- Hover to see cursor position on canvas

**Colored cursors on canvas:**
- Each user has unique color
- Show name label next to cursor
- Animate when they click/drag
- Fade when inactive

**Live selection indicators:**
- Dashed outline in user's color around selected layer
- Layer panel shows lock icon if another user is editing

### Voice Command Indicator
**When voice is active:**
```
┌─────────────────────────────┐
│ 🎤 Listening... [Stop]      │ ← Floating at top-center
│ "Change base color to red"  │
└─────────────────────────────┘
```
- Pulsing microphone icon
- Live transcription
- Confirmation of action taken
- Error message if command not understood

### Loading States
**Project loading:**
- Skeleton screens for panels
- Pulsing gray rectangles where content will appear
- "Loading project..." text
- Progress bar if applicable

**AI processing:**
- Spinning icon in AI chat
- "Thinking..." typing indicator
- Estimated time remaining for heavy tasks

### Empty States
**No layers yet:**
```
┌─────────────────────────────────┐
│         [📄 Icon]               │
│    No layers yet                │
│    Create your first layer      │
│    [+ Add Layer]                │
└─────────────────────────────────┘
```

**No assets:**
```
┌─────────────────────────────────┐
│         [🎨 Icon]               │
│    No assets in library         │
│    Upload your first graphic    │
│    [+ Upload Asset]             │
└─────────────────────────────────┘
```

### Animations & Transitions
**Micro-interactions:**
- Panel expand/collapse: 200ms ease-out
- Tool selection: 100ms ease
- Hover effects: 150ms ease
- Modal open: 200ms scale + fade
- Toast notifications: 300ms slide + fade
- Layer drag: smooth follow cursor with slight delay
- Color changes: 200ms transition on preview
- Button press: subtle scale down (0.95) on click

**Performance considerations:**
- Use CSS transforms (translate, scale) for animations
- Avoid animating layout properties (width, height)
- Use `will-change` for frequently animated elements
- Debounce slider inputs to avoid lag

---

## Responsive Behavior

### Window Resize
- Panels maintain aspect ratio
- Canvas auto-adjusts to fill space
- Minimum window width: 1024px (below this, show warning)
- Recommended: 1920x1080 or higher

### Panel Collapse States
- Panels can collapse to icons-only (32px width for left toolbar)
- Right sidebar can collapse to show only tabs
- Bottom panel can minimize to header bar only
- Save panel states in local storage

---

## Accessibility Requirements

### Keyboard Navigation
- **Tab** to navigate between panels and inputs
- **Arrow keys** to navigate lists, adjust sliders
- **Enter** to activate buttons, confirm actions
- **ESC** to close modals, cancel operations
- **Ctrl/Cmd shortcuts** for common actions (see full list in docs)
- **Focus indicators**: 2px blue outline on focused elements

### Screen Reader Support
- All buttons have aria-labels
- Panel sections have proper headings (h1-h6)
- Status announcements for actions ("Layer added", "Export complete")
- Alt text on icons
- Semantic HTML5 elements

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for normal text)
- Interactive elements have clear hover/focus states
- Error states use both color and icons (not color alone)

### Reduced Motion
- Detect `prefers-reduced-motion` media query
- Disable or reduce animations for users who prefer it
- Instant transitions instead of animated

---

## Technical Considerations

### Framework Suggestions
- **React** or **Vue.js** for component architecture
- **Three.js** or **Babylon.js** for 3D rendering
- **Fabric.js** or **Konva** for 2D canvas manipulation
- **TailwindCSS** or **CSS Modules** for styling
- **Framer Motion** or **GSAP** for animations
- **Zustand** or **Pinia** for state management

### Performance Targets
- Initial load: <2 seconds on fast connection
- Time to interactive: <3 seconds
- 60 FPS during interactions
- Smooth 3D rotation and zoom
- Instant tool switching
- Layer operations <100ms

### Browser Support
- Chrome 90+ (primary target)
- Firefox 88+ (full support)
- Safari 14+ (full support)
- Edge 90+ (chromium, full support)

---

## Example Use Cases to Demonstrate

### Use Case 1: New User First Livery
1. Welcome screen with tutorial prompt
2. Template selection (grid of templates)
3. Click template to load
4. AI assistant suggests customization
5. Change colors with color picker
6. Add logo from library
7. Preview in 3D with rotation
8. Export to iRacing

### Use Case 2: Pro Designer Complex Livery
1. Start from blank canvas
2. Use pen tool to draw custom shapes
3. Layer panel with 20+ layers
4. Advanced blending modes
5. Custom color palette
6. Voice command to add stripe
7. Multi-sim export wizard
8. Save as template

### Use Case 3: Team Collaboration
1. Share link with teammate
2. Both users see live cursors
3. Chat about design changes
4. One user edits logo while other works on colors
5. Comment pinned on canvas
6. Approve changes
7. Export coordinated team liveries

---

## Design Deliverables Expected

Please create:
1. **Main application interface** (all panels visible, dark theme)
2. **Canvas-focused view** (zen mode with minimal UI)
3. **Color picker modal** (showing full color selection interface)
4. **Command palette** (Ctrl+K modal with search results)
5. **Layer panel detail** (zoomed view showing layer interactions)
6. **AI assistant panel** (showing conversation)
7. **Export wizard** (multi-step modal)
8. **Mobile responsive view** (if applicable, simplified interface)
9. **Collaboration mode** (showing multiple user cursors/presence)
10. **Light theme variant** (optional, for comparison)

---

## Brand Guidelines

### SimVox.ai Brand
- **Primary color:** Blue (#007ACC or similar)
- **Logo:** Include SimVox.ai icon/logo in top-left
- **Personality:** Professional, modern, innovative, approachable
- **Tone:** Helpful, encouraging, technically competent

### Racing/Motorsport Elements
- Subtle racing-inspired accents (checkered patterns, speed lines)
- Car-related iconography where appropriate
- Dynamic, energetic feel without being overwhelming
- Professional enough for real racing teams

---

## Final Notes

This interface should feel like a modern design tool (think Figma, Canva) but specialized for racing liveries. It should be:
- **Intuitive** enough for a beginner to create their first livery in minutes
- **Powerful** enough for a professional designer to create complex, detailed work
- **Delightful** with smooth animations and thoughtful interactions
- **Collaborative** with clear indicators of other users' presence
- **AI-enhanced** making the AI assistant feel like a natural part of the workflow

The goal is to create an interface that users genuinely enjoy using, that makes livery design accessible to everyone, and that showcases SimVox.ai's innovative approach to racing simulation tools.

---

**Ready to design? Let's make SimVox.ai Livery Builder the best livery design tool in the world!** 🏎️🎨
