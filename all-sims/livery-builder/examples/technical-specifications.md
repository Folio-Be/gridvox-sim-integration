# Trading Paints Builder - Technical Specifications

Based on video analysis from https://www.tradingpaints.com/page/Builder

## Architecture

### Platform
- **Type:** Web-based application
- **Deployment:** Cloud-hosted SaaS
- **Access:** Browser-based (no installation required)
- **Integration:** Direct integration with iRacing platform

### User Interface

#### Canvas/Workspace
- **3D View Rotation:** Full 360° rotation around car model
- **Zoom:** In/out capability for detail work
- **Grid Overlays:** Toggle-able grid system for alignment
- **Wireframe Mode:** Car structure outline view
- **Sponsor Placement Guides:** Pre-defined zones for sponsor logos

#### Layer System
- **Layer Panel:** Hierarchical layer management
- **Layer Types:**
  - Base Paint (iRacing's layered patterns)
  - Vector Graphics
  - Raster Images
  - Shapes (geometric)
  - Text
  - Freehand Drawing
- **Layer Properties:**
  - Opacity/Transparency
  - Blend Modes
  - Shadows
  - Strokes
  - Skew/Transform
  - Position and Size

#### Tools

**Drawing Tools:**
- Rectangle
- Circle/Ellipse
- Line
- Freehand Brush
- Custom Shapes

**Selection/Transform:**
- Move
- Resize
- Rotate
- Skew

**Color/Fill:**
- Solid colors
- Gradients (implied)
- Pattern fills

**Effects:**
- Drop shadow
- Stroke (outline)
- Blend modes (multiply, overlay, etc.)

### Graphics Library

#### Vector Assets
- **Quantity:** "Hundreds" of original vector graphics
- **Format:** SVG (Scalable Vector Graphics)
- **Categories:**
  - Patterns
  - Logos
  - Fictional brands
  - Decorative elements
- **Customization:** Color, size, and style modifications

#### Import Capabilities
- **Supported Formats:**
  - Raster images (PNG, JPG implied)
  - Vector graphics (SVG)
- **User Assets:** Custom logo and graphic upload

### Material System (BETA)

#### Finish Types
- **Chrome:** Reflective metallic finish
- **Flat:** Matte, non-reflective surface
- **Metallic:** Metallic sheen with varied reflectivity
- **Custom Spec Maps:** Advanced material definition

**Technical Implementation:**
- Per-layer finish application
- Spec map generation for iRacing compatibility
- Visual preview of finish effects

### 3D Preview Integration

#### Sim Preview Feature
- **Real-time Preview:** See changes on 3D car model
- **Integration:** iRacing's 3D car model viewer
- **Synchronization:** Live updates as design changes
- **Viewing:** Multiple angles and lighting conditions

#### Technical Requirements
- Communication with iRacing API
- 3D model file access
- Texture mapping system
- Real-time rendering updates

### Collaboration Features

#### Real-time Collaboration
- **Project Sharing:** Share with other users
- **Live Updates:** See changes as they happen
- **Multi-user Editing:** Collaborative design sessions

#### Export/Deployment
- **iRacing Integration:** Direct upload to iRacing
- **Showroom Submission:** Publish to Trading Paints community
- **Project Saving:** Cloud-based project storage

### Workflow Features

#### Keyboard Shortcuts
- Quick access to tools
- Undo/Redo (Ctrl+Z, Ctrl+Y implied)
- Layer manipulation
- View controls

#### Undo/Redo System
- Multi-level undo history
- Redo capability
- Non-destructive editing

#### View Controls
- Pan across canvas
- Zoom in/out
- Rotate 3D view
- Reset view position

## File Format & Export

### Project Format
- **Storage:** Cloud-based project files
- **Collaboration:** Real-time shared projects
- **Version Control:** Implied (not shown in videos)

### Export Formats
- **iRacing Format:** Native iRacing livery format
- **Image Export:** Raster output (implied)
- **Vector Preservation:** Vectors converted to rasters for iRacing

### Technical Constraints
- **iRacing Limitation:** Uses bitmap graphics for cars
- **Vector Usage:** Vectors only in editor, rasterized for export
- **Resolution:** Matches iRacing's texture requirements

## Performance Considerations

### Browser Requirements
- Modern web browser
- WebGL support (implied for 3D preview)
- Adequate RAM for layer management
- Fast internet for cloud sync

### Optimization
- Smooth rotation and zoom (60 fps implied)
- Responsive interface
- Efficient layer rendering
- Cloud save/load performance

## User Experience Design

### Onboarding
- Membership required (Trading Paints Pro)
- "Simple enough for beginners"
- "Powerful enough for pros"

### Accessibility
- Grid and guide system for precision
- Wireframe for structural reference
- Sponsor placement zones for guidance

### Feedback Systems
- Real-time preview updates
- Visual feedback on layer changes
- Sim preview for final verification

## Competitive Advantages

### vs. Photo Editing Software
- ✅ Simpler learning curve
- ✅ Car-specific tools (rotation, wireframe)
- ✅ Direct iRacing integration
- ✅ No installation required
- ✅ Built-in graphics library

### vs. Manual Paint Creation
- ✅ Visual editor vs. file manipulation
- ✅ Real-time 3D preview
- ✅ Undo/redo functionality
- ✅ Layer management
- ✅ Professional results without expertise

## Business Model

### Monetization
- **Subscription:** Trading Paints Pro membership required
- **Freemium:** Basic Trading Paints features free, Builder is Pro
- **Community:** Showroom drives engagement and subscriptions

### Value Proposition
- Professional results without Photoshop
- Time-saving tools and templates
- Direct integration with racing platform
- Community features and exposure

## GridVox Implementation Recommendations

### Core Technology Stack

**Frontend:**
- Web: React/Vue + Canvas API or Three.js for 3D
- Desktop: Electron or Tauri wrapper
- Mobile: React Native with WebView

**Backend:**
- Node.js/Express for API
- PostgreSQL for projects/users
- S3/Blob storage for assets
- WebSocket for real-time collaboration

**3D Rendering:**
- Three.js for browser-based 3D
- Unity/Unreal for desktop (overkill?)
- Native graphics APIs for performance

### Differentiation Strategy

1. **Multi-Sim Support**
   - AMS2, iRacing, ACC, etc.
   - Template conversion between sims
   - Sim-specific texture requirements

2. **AI Features**
   - Auto-generate patterns based on preferences
   - Smart color palette suggestions
   - Sponsor placement optimization
   - Style transfer from reference images

3. **Advanced Collaboration**
   - Team workspaces
   - Role-based permissions
   - Comment/feedback system
   - Version history

4. **Integration with GridVox Ecosystem**
   - Voice commands for design
   - Telemetry-driven color schemes
   - Performance-based designs
   - Social media integration

### Development Phases

**MVP (3-4 months):**
- Basic layer system
- Shape and image tools
- Single sim 3D preview (AMS2)
- Local file save/load

**V1.0 (6-8 months):**
- Vector graphics library
- Advanced drawing tools
- Material/finish system
- Cloud storage and sync
- Multi-sim support (2-3 sims)

**V2.0 (12 months):**
- Real-time collaboration
- AI-powered features
- Community marketplace
- Mobile app support
- Full sim coverage (5+ sims)

### Technical Challenges

1. **3D Model Access**
   - Need permission to access sim 3D models
   - Different formats per sim
   - Texture mapping variations

2. **Performance**
   - Large texture files
   - Many layers with effects
   - Real-time 3D rendering
   - Browser memory constraints

3. **Cross-Platform**
   - Browser compatibility
   - Desktop vs. mobile UX
   - File format standardization

4. **Multi-Sim Support**
   - Different texture layouts per sim
   - Car naming inconsistencies
   - Update frequency for new cars

### Success Metrics

- **User Engagement:** Time spent in editor
- **Completion Rate:** Projects finished and exported
- **Social Sharing:** Designs posted to community
- **Retention:** Monthly active users
- **Conversion:** Free to Pro conversion rate
