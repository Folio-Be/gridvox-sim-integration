# POC: Track Map Visualization - Real-Time Racer Positions

**Created**: November 8, 2025  
**Status**: 🚧 In Development  
**Purpose**: Real-time 2D track map visualization showing all racers' positions, sectors, and race state

---

## 📋 Overview

This POC implements a real-time track map visualization system that displays all racers on a 2D representation of the racing circuit, similar to broadcast TV graphics. The system leverages the existing GridVox telemetry infrastructure from `poc-02-direct-memory` to show:

- **Racer positions** on track (color-coded by class/team/status)
- **Sector markers** (S1, S2, S3 boundaries)
- **Race positions** and gaps
- **Pit lane activity**
- **Flag zones** and incidents
- **Player focus** with enhanced highlighting

### Visual Reference

The target visualization style (see attached image) shows:
- Track outline with numbered corner markers
- Colored dots representing racers
- Position numbers on each racer
- Sector zones (S1, S2, S3)
- Different colors for different racing states/classes

---

## 🎯 GridVox Integration Goals

This track map serves multiple GridVox features:

### 1. **Companion App Display**
- Mobile/web app showing live race positions
- Friends/family following the race
- Social spectator mode

### 2. **Commentary Enhancement**
- Visual context for AI commentator
- "The battle for P3 is heating up in sector 2"
- Position-aware race narrative

### 3. **Crew Radio Context**
- "Driver ahead is 0.8s away approaching turn 7"
- Strategic positioning information
- Gap management visualization

### 4. **Post-Race Analysis**
- Replay mode showing overtakes
- Incident investigation
- Highlight reel generation with track context

### 5. **Social Sharing**
- Generate track map snapshots for social media
- Show "moment of overtake" graphics
- Create animated GIFs of race progression

### 6. **Story Mode Progression**
- Visual representation of multi-driver stories
- Historic race recreation with accurate positions
- Rally stage progression visualization

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Track Map Visualization                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Rendering Engine (Canvas/SVG/WebGL)          │   │
│  │  - Track outline rendering                           │   │
│  │  - Racer position dots                               │   │
│  │  - Sector zones                                      │   │
│  │  - Corner markers                                    │   │
│  │  - Labels and overlays                               │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │         Position Calculation Layer                   │   │
│  │  - World coords → 2D track position                  │   │
│  │  - Lap distance → track percentage                   │   │
│  │  - Sector determination                              │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │         Track Data Manager                           │   │
│  │  - Track layout coordinates                          │   │
│  │  - Sector boundaries                                 │   │
│  │  - Corner positions and numbers                      │   │
│  │  - Pit lane geometry                                 │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────────────┐
│         Telemetry Stream (from poc-02-direct-memory)         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SharedMemoryReader (Native C++ Addon)               │   │
│  │  - Participant world positions [x, y, z]             │   │
│  │  - Current lap distance (meters)                     │   │
│  │  - Race positions                                    │   │
│  │  - Speeds, pit modes, sectors                        │   │
│  │  - Track location & variation                        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Input: Telemetry Data (from poc-02-direct-memory)

Available telemetry fields relevant to track mapping:

```typescript
interface TelemetryData {
  // Track identification
  trackLocation: string;          // "Silverstone"
  trackVariation: string;          // "Grand Prix"
  trackLength: number;             // 5891 meters
  
  // Participant array (up to 64 racers)
  participants: Array<{
    index: number;
    isActive: boolean;
    name: string;
    
    // Position data (KEY FOR MAPPING)
    worldPosition: [x, y, z];     // 3D coordinates in game world
    currentLapDistance: number;    // Distance through current lap (0 to trackLength)
    
    // Race state
    racePosition: number;          // 1st, 2nd, 3rd, etc.
    currentSector: number;         // 1, 2, or 3
    lapsCompleted: number;
    currentLap: number;
    
    // State indicators
    speed: number;
    pitMode: PitMode;              // NONE, DRIVING_INTO_PITS, IN_PIT, etc.
    raceState: RaceState;          // RACING, FINISHED, DNF, etc.
  }>;
  
  // Session state
  gameState: GameState;
  sessionState: SessionState;      // PRACTICE, RACE, QUALIFY
  
  // Flags and incidents
  highestFlagColor: FlagColor;    // GREEN, YELLOW, RED, etc.
  highestFlagReason: number;
}
```

### Processing: Position Calculation

Two approaches for mapping racers to track positions:

#### Approach A: Lap Distance Projection (Simpler, Recommended for POC)
```typescript
// Use currentLapDistance to project onto pre-defined track shape
const trackPercentage = participant.currentLapDistance / trackLength;
const position2D = interpolateTrackShape(trackPercentage, trackCoordinates);
```

**Pros:**
- Simple implementation
- Works with any track (just need track shape coordinates)
- No coordinate system mapping needed

**Cons:**
- Requires pre-defined track coordinates for each circuit
- Less accurate for complex layouts with crossovers

#### Approach B: World Coordinate Mapping (More Accurate)
```typescript
// Map 3D world coordinates to 2D track representation
const position2D = worldToTrackCoords(
  participant.worldPosition,
  trackBounds,
  projectionMatrix
);
```

**Pros:**
- Most accurate representation
- Shows exact racer positions including off-track
- Handles crossovers (e.g., Suzuka figure-8)

**Cons:**
- Complex coordinate system mapping
- Requires calibration per track
- More processing overhead

**Recommendation:** Start with Approach A (lap distance), add Approach B later.

---

## 🗺️ Track Data Format

### Track Definition Schema

```typescript
interface TrackDefinition {
  // Identification
  name: string;              // "Silverstone"
  variation: string;         // "Grand Prix"
  length: number;            // 5891 meters
  
  // Track shape as percentage-based coordinates
  trackPath: Array<{
    percentage: number;      // 0.0 to 1.0 (position along lap)
    x: number;              // 2D X coordinate (0-1000 normalized)
    y: number;              // 2D Y coordinate (0-1000 normalized)
    cornerNumber?: number;   // 1, 2, 3... for labeled corners
  }>;
  
  // Sector boundaries
  sectors: {
    sector1End: number;      // Lap percentage where S1 ends (e.g., 0.33)
    sector2End: number;      // Lap percentage where S2 ends (e.g., 0.66)
    // Sector 3 is implicitly from sector2End to 1.0
  };
  
  // Pit lane (optional)
  pitLane?: {
    entryPercentage: number;
    exitPercentage: number;
    path: Array<{ x: number; y: number }>;
  };
  
  // Visual settings
  viewport: {
    width: number;
    height: number;
    padding: number;
  };
}
```

### Example: Simplified Track Data

```json
{
  "name": "Silverstone",
  "variation": "Grand Prix",
  "length": 5891,
  "trackPath": [
    { "percentage": 0.00, "x": 500, "y": 800, "cornerNumber": 1 },
    { "percentage": 0.05, "x": 520, "y": 750 },
    { "percentage": 0.10, "x": 550, "y": 700, "cornerNumber": 2 },
    { "percentage": 0.15, "x": 600, "y": 680 },
    { "percentage": 0.20, "x": 650, "y": 650, "cornerNumber": 3 },
    // ... continues for full lap
    { "percentage": 0.95, "x": 480, "y": 810 },
    { "percentage": 1.00, "x": 500, "y": 800 }
  ],
  "sectors": {
    "sector1End": 0.33,
    "sector2End": 0.66
  }
}
```

---

## 🎨 Rendering Technologies

### Option 1: HTML5 Canvas (Recommended)
**Best for:** Real-time updates, high performance

```typescript
// Pseudo-code example
class TrackMapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  render(trackData: TrackDefinition, racers: ParticipantInfo[]) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw track outline
    this.drawTrackPath(trackData.trackPath);
    
    // Draw sector zones (subtle background colors)
    this.drawSectorZones(trackData.sectors);
    
    // Draw corner markers
    this.drawCornerMarkers(trackData.trackPath);
    
    // Draw racers
    racers.forEach(racer => {
      const pos = this.calculatePosition(racer, trackData);
      this.drawRacer(pos, racer);
    });
  }
  
  private drawRacer(pos: {x: number, y: number}, racer: ParticipantInfo) {
    // Color-code by state
    const color = this.getRacerColor(racer);
    
    // Draw circle
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw position number
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(racer.racePosition.toString(), pos.x, pos.y + 4);
  }
  
  private getRacerColor(racer: ParticipantInfo): string {
    // Player
    if (racer.index === viewedParticipantIndex) return '#FFFF00'; // Yellow
    
    // By pit mode
    if (racer.pitMode !== PitMode.NONE) return '#FFA500'; // Orange
    
    // By race state
    if (racer.raceState === RaceState.DNF) return '#666666'; // Gray
    
    // By sector (from image reference)
    // Red = Sector 1, Green = Sector 2, Blue = Sector 3
    switch (racer.currentSector) {
      case 1: return '#FF0000'; // Red
      case 2: return '#00FF00'; // Green
      case 3: return '#0000FF'; // Blue
      default: return '#FFFFFF';
    }
  }
}
```

**Pros:**
- Native browser support
- Excellent performance (60+ FPS easily)
- Simple API
- Easy to export as image/video

**Cons:**
- No built-in interaction (need manual hit detection)
- Requires redraw on every update

### Option 2: SVG
**Best for:** Static/interactive elements, precision

**Pros:**
- Scalable, crisp at any zoom
- Built-in interaction (click, hover)
- Easy to animate individual elements

**Cons:**
- Performance degrades with many elements (>50 racers might struggle)
- Harder to export as raster image

### Option 3: WebGL (Pixi.js)
**Best for:** Maximum performance, effects

**Pros:**
- GPU-accelerated
- Can handle hundreds of objects
- Advanced effects (glow, trails, etc.)

**Cons:**
- Higher complexity
- Overkill for 64 racers

**Decision:** Start with **Canvas** for simplicity and performance.

---

## 🚀 Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal:** Basic track rendering with static test data

- [ ] Set up project structure (Node.js + TypeScript)
- [ ] Create track definition schema and example data
- [ ] Implement Canvas renderer
- [ ] Draw track outline for one circuit (e.g., Silverstone)
- [ ] Add corner markers and sector zones
- [ ] Test with mock racer positions

**Deliverables:**
- `track-renderer.ts` - Canvas rendering engine
- `track-definitions/silverstone.json` - First track data
- `demo-static.html` - Static visualization demo

### Phase 2: Telemetry Integration (Week 2)
**Goal:** Connect to live AMS2 data via poc-02-direct-memory

- [ ] Import telemetry reader from poc-02-direct-memory
- [ ] Implement position calculation (lap distance → 2D coords)
- [ ] Add real-time update loop (30-60 Hz)
- [ ] Handle racer state changes (pit, DNF, etc.)
- [ ] Implement color coding based on sector/state
- [ ] Add player highlighting

**Deliverables:**
- `telemetry-mapper.ts` - Telemetry → track position mapping
- `demo-live.html` - Live visualization from AMS2

### Phase 3: Visual Enhancements (Week 3)
**Goal:** Polish and additional visual features

- [ ] Add racer labels (names on hover/click)
- [ ] Implement gap indicators (lines between racers)
- [ ] Add mini-leaderboard overlay
- [ ] Show flag status on track
- [ ] Animated racer movement (interpolation between updates)
- [ ] Export snapshot function (PNG/JPEG)

**Deliverables:**
- Enhanced rendering with labels and animations
- Screenshot export feature

### Phase 4: Multi-Track Support (Week 4)
**Goal:** Support multiple circuits

- [ ] Create track definitions for 5+ popular circuits
  - Silverstone, Spa, Monza, Interlagos, Brands Hatch
- [ ] Implement auto-detection of track from telemetry
- [ ] Track switching based on session
- [ ] Fallback visualization for unknown tracks

**Deliverables:**
- `track-definitions/` folder with 5+ tracks
- Auto-track-detection system

### Phase 5: Advanced Features (Week 5+)
**Goal:** GridVox-specific integrations

- [ ] **Companion app web view** - Embed in mobile/web interface
- [ ] **Replay mode** - Playback recorded telemetry data
- [ ] **Incident markers** - Show crash/incident locations
- [ ] **Battle indicators** - Highlight close racing (gap < 1s)
- [ ] **Historical overlay** - Show "ghost" of previous lap
- [ ] **Social sharing** - Generate shareable images/GIFs
- [ ] **Commentary integration** - Track position events trigger crew radio
- [ ] **Multi-screen support** - Separate window/monitor display

**Deliverables:**
- Full-featured track map for GridVox ecosystem

---

## 📁 Project Structure

```
track-map-visualization/
├── README.md                          # This file
├── IMPLEMENTATION-GUIDE.md            # Detailed coding guide
├── package.json
├── tsconfig.json
├── .gitignore
│
├── src/
│   ├── core/
│   │   ├── TrackRenderer.ts          # Canvas rendering engine
│   │   ├── PositionCalculator.ts     # Lap distance → 2D coords
│   │   ├── TelemetryMapper.ts        # Telemetry integration
│   │   └── TrackManager.ts           # Track data loading/management
│   │
│   ├── types/
│   │   ├── track.types.ts            # Track definition interfaces
│   │   ├── racer.types.ts            # Racer state interfaces
│   │   └── renderer.types.ts         # Rendering configuration
│   │
│   ├── utils/
│   │   ├── interpolation.ts          # Smooth position updates
│   │   ├── colors.ts                 # Color schemes
│   │   └── export.ts                 # Screenshot/GIF export
│   │
│   └── demo/
│       ├── static-demo.ts            # Mock data visualization
│       ├── live-demo.ts              # Real AMS2 connection
│       └── replay-demo.ts            # Playback mode
│
├── track-definitions/
│   ├── schema.json                   # JSON schema for validation
│   ├── silverstone-gp.json
│   ├── spa-francorchamps.json
│   ├── monza.json
│   ├── interlagos.json
│   ├── brands-hatch-gp.json
│   └── README.md                     # Track creation guide
│
├── public/
│   ├── index.html                    # Main demo page
│   ├── styles.css
│   └── assets/
│       └── fonts/
│
└── tests/
    ├── position-calculator.test.ts
    ├── renderer.test.ts
    └── telemetry-mapper.test.ts
```

---

## 🔧 Technical Specifications

### Performance Targets

- **Rendering FPS:** 60 FPS minimum
- **Telemetry Update Rate:** 30-60 Hz (from AMS2 shared memory)
- **Latency:** <16ms from telemetry update to screen render
- **Memory Usage:** <100MB for full 64-racer grid
- **CPU Usage:** <5% on mid-range CPU (single core)

### Rendering Specifications

- **Canvas Size:** 1920x1080 (Full HD) or configurable
- **Track Scale:** Auto-fit to viewport with padding
- **Racer Dot Size:** 8-16px diameter (adjustable by zoom)
- **Font:** Bold sans-serif, white with black outline for readability
- **Sector Colors:** Red (S1), Green (S2), Blue (S3) - matching image reference
- **Player Indicator:** Yellow dot, larger size (1.5x), optional trailing line

### Color Scheme

```typescript
const COLORS = {
  // Racer states
  PLAYER: '#FFFF00',           // Yellow (bright)
  SECTOR_1: '#FF0000',         // Red
  SECTOR_2: '#00FF00',         // Green  
  SECTOR_3: '#0000FF',         // Blue
  PIT_LANE: '#FFA500',         // Orange
  DNF: '#666666',              // Gray
  FINISHED: '#00FFFF',         // Cyan
  
  // Track elements
  TRACK_OUTLINE: '#FFFFFF',    // White
  TRACK_FILL: '#1A1A1A',       // Dark gray
  SECTOR_ZONE_1: 'rgba(255,0,0,0.1)',    // Faint red
  SECTOR_ZONE_2: 'rgba(0,255,0,0.1)',    // Faint green
  SECTOR_ZONE_3: 'rgba(0,0,255,0.1)',    // Faint blue
  CORNER_MARKER: '#888888',    // Light gray
  
  // UI
  BACKGROUND: '#000000',       // Black
  TEXT: '#FFFFFF',             // White
  TEXT_SHADOW: '#000000',      // Black
};
```

---

## 🧪 Testing Strategy

### Unit Tests
- Position calculation accuracy (lap distance → 2D coords)
- Track path interpolation
- Color determination logic

### Integration Tests
- Telemetry reader connection
- Real-time update loop stability
- Track switching

### Visual Regression Tests
- Screenshot comparison for known track layouts
- Racer position accuracy verification

### Performance Tests
- FPS measurement under load (64 racers)
- Memory leak detection (long sessions)
- CPU profiling

---

## 🎮 Usage Examples

### Basic Live Visualization

```typescript
import { TrackMapVisualizer } from './src/core/TrackMapVisualizer';
import { SharedMemoryReader } from '../../desktop/pocs/poc-02-direct-memory';

// Create visualizer
const canvas = document.getElementById('trackMap') as HTMLCanvasElement;
const visualizer = new TrackMapVisualizer(canvas, {
  updateRate: 30, // 30 Hz
  showLabels: true,
  highlightPlayer: true,
  colorMode: 'sector' // 'sector', 'class', 'team'
});

// Connect to telemetry
const telemetry = new SharedMemoryReader();
telemetry.connect();

// Update loop
setInterval(() => {
  const data = telemetry.read();
  visualizer.update(data);
}, 1000 / 30); // 30 FPS
```

### Export Screenshot for Social Media

```typescript
// Capture current state as image
const imageBlob = await visualizer.exportPNG({
  width: 1920,
  height: 1080,
  includeOverlay: true, // Add leaderboard, timing info
  watermark: 'GridVox Racing'
});

// Upload to social media
await uploadToSocialMedia(imageBlob, {
  caption: `Epic battle for P3! ${currentLap}/${totalLaps}`
});
```

### Replay Mode

```typescript
// Load recorded telemetry session
const replayData = await loadReplayFile('race-2025-11-08.telemetry');

// Create replay controller
const replay = new ReplayController(visualizer, replayData, {
  playbackSpeed: 1.0, // Real-time
  startTime: 0,
  endTime: replayData.duration
});

// Playback controls
replay.play();
replay.pause();
replay.seek(300); // Jump to 5 minutes
replay.setSpeed(2.0); // 2x speed
```

---

## 🔗 Integration Points with GridVox

### 1. Companion App (Mobile/Web)

**Use Case:** Friends/family watch race live on their phones

```typescript
// Server-side: Broadcast track state via WebSocket
const wss = new WebSocketServer({ port: 8080 });

setInterval(() => {
  const telemetry = reader.read();
  const trackState = {
    track: telemetry.trackLocation,
    racers: telemetry.participants.map(p => ({
      name: p.name,
      position: p.racePosition,
      sector: p.currentSector,
      mapPosition: calculatePosition(p, trackData)
    }))
  };
  
  wss.clients.forEach(client => {
    client.send(JSON.stringify(trackState));
  });
}, 100); // 10 Hz for mobile (lower bandwidth)
```

**Client-side (React Native/Web):**
```tsx
const TrackMapViewer = () => {
  const [trackState, setTrackState] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      setTrackState(JSON.parse(event.data));
    };
  }, []);
  
  return <TrackMapCanvas trackState={trackState} />;
};
```

### 2. Commentary System

**Use Case:** AI commentator references track positions

```typescript
// Event: Close battle detected
const battle = battleDetector.detect(telemetry);

if (battle) {
  // Get track context
  const mapData = visualizer.getRacerPositions(battle.participants);
  
  // Generate commentary with position context
  const comment = await commentatorAI.generate({
    event: 'battle',
    participants: battle.participants,
    trackContext: {
      sector: mapData[0].sector,
      corner: mapData[0].nearestCorner,
      gap: battle.gap
    }
  });
  
  // "Verstappen and Hamilton are wheel-to-wheel through Copse corner!"
  playAudio(comment);
}
```

### 3. Post-Race Highlights

**Use Case:** Generate video with track map overlay

```typescript
// Capture key moments
const highlights = [
  { time: 120, event: 'overtake', participants: [1, 3] },
  { time: 450, event: 'accident', participants: [7] },
  { time: 890, event: 'fastest_lap', participants: [1] }
];

// For each highlight, capture track map snapshot
for (const highlight of highlights) {
  replay.seek(highlight.time);
  
  const snapshot = await visualizer.exportPNG({
    highlightRacers: highlight.participants,
    showReplayIndicator: true
  });
  
  // Add to video timeline
  videoEditor.addFrame(snapshot, highlight.time);
}
```

### 4. Social Sharing

**Use Case:** Auto-post race moments to Twitter/Instagram

```typescript
// Detect overtake
overtakeDetector.on('overtake', async (event) => {
  // Capture track map at moment of overtake
  const trackImage = await visualizer.exportPNG({
    highlightRacers: [event.overtaker, event.overtaken],
    showGap: true,
    timestamp: event.time
  });
  
  // Generate caption
  const caption = `${event.overtaker.name} overtakes ${event.overtaken.name} ` +
                  `for P${event.newPosition} at ${event.location}!`;
  
  // Post to social media
  await socialMedia.post({
    image: trackImage,
    caption: caption,
    hashtags: ['GridVox', 'SimRacing', event.trackName]
  });
});
```

---

## 📚 Research & Resources

### Track Data Sources

1. **Manual Tracing**
   - Load track in AMS2
   - Drive slowly recording GPS coordinates
   - Sample every 10-50 meters
   - Process into normalized coordinates

2. **Community Resources**
   - SimHub track definitions
   - iRacing track maps (community)
   - Real-world track layouts (adjust for game version)

3. **Automated Extraction**
   - Record full lap telemetry (worldPosition array)
   - Cluster points to extract track centerline
   - Smooth and normalize

### Similar Projects

- **iRacing TV Overlay** - Real-time broadcast graphics
- **SimHub Dash** - Customizable telemetry displays
- **CrewChief Track Map** - Basic position visualization
- **F1 TV Graphics** - Professional broadcast standard

---

## 🚦 Success Criteria

### Minimum Viable Product (MVP)
- [ ] Display 64 racers on track in real-time
- [ ] Color-code by sector (Red/Green/Blue)
- [ ] Show position numbers
- [ ] Support 3+ tracks (Silverstone, Spa, Monza)
- [ ] Update at 30 FPS minimum
- [ ] Auto-detect track from telemetry

### Full Release
- [ ] All AMS2 tracks supported
- [ ] Companion app integration (WebSocket streaming)
- [ ] Replay mode with playback controls
- [ ] Screenshot export for social media
- [ ] Commentary system integration
- [ ] Performance: 60 FPS with 64 racers
- [ ] <100MB memory footprint

---

## 🛣️ Future Enhancements

### Advanced Visualization
- **3D Track Map** - WebGL isometric view
- **Telemetry Trails** - Show racer paths over last N seconds
- **Speed Heatmap** - Color track by speed zones
- **Overtake Arrows** - Animated indicators for position changes

### Data Analysis
- **Battle Detection Zones** - Highlight track areas with most overtakes
- **Optimal Racing Line** - Overlay fastest path
- **Incident Hotspots** - Show crash-prone corners
- **Gap Evolution Graph** - Time-series view of position gaps

### Multiplayer Features
- **Ghost Comparison** - Show multiple laps simultaneously
- **Team View** - Highlight team members
- **Class Filtering** - Toggle visibility by car class
- **Spectator Camera** - Auto-follow closest battle

### Cross-Sim Support
- **rFactor 2** - Different shared memory format
- **Assetto Corsa** - UDP telemetry
- **iRacing** - API integration
- **Universal Track Format** - Shared track definitions across sims

---

## 📞 Related POCs

- **poc-02-direct-memory** - Telemetry data source
- **poc-01-telemetry** - Initial telemetry exploration
- **poc-06-tauri-integration** - Desktop app framework
- **persona-builder** - AI crew chief integration

---

## 📝 Notes

### Design Decisions

1. **Why lap distance instead of world coordinates?**
   - Simpler to implement
   - Works without coordinate system calibration
   - Sufficient accuracy for broadcast-style visualization
   - Can upgrade to world coords later if needed

2. **Why Canvas over WebGL?**
   - Adequate performance for 64 racers
   - Simpler debugging
   - Easier to export as images
   - Lower learning curve for contributors

3. **Why JSON for track data?**
   - Human-readable and editable
   - Easy to version control
   - Lightweight for loading
   - Community can contribute tracks easily

### Known Limitations

- **Track Crossovers:** Lap distance approach can't distinguish elevation (e.g., Suzuka crossover)
- **Off-Track Position:** World coordinates needed for accurate off-track representation
- **Rally Stages:** Linear progression only, no proper stage layout
- **Pit Lane:** Requires separate path definition per track

### Future Considerations

- **Mobile Performance:** May need lower update rate (15-20 Hz) for older devices
- **Bandwidth:** WebSocket streaming should compress data (binary format)
- **Accessibility:** Add colorblind modes, text-only alternative
- **Internationalization:** Multi-language support for labels

---

## 🏁 Getting Started

See [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) for step-by-step coding instructions.

**Quick Start:**
```bash
cd gridvox-sim-integration/ams2/track-map-visualization
npm install
npm run dev
# Open browser to http://localhost:3000
# Start AMS2 race session
# Watch live track map!
```

---

**Author:** GridVox Development Team  
**Contact:** [GitHub Issues](https://github.com/Folio-Be/gridvox/issues)  
**License:** MIT
