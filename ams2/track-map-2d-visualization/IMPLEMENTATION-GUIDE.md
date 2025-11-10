# Track Map Visualization - Implementation Guide

**Version:** 1.0  
**Last Updated:** November 8, 2025

This guide provides step-by-step instructions for implementing the track map visualization POC.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Track Data Schema](#2-track-data-schema)
3. [Position Calculation](#3-position-calculation)
4. [Canvas Rendering](#4-canvas-rendering)
5. [Telemetry Integration](#5-telemetry-integration)
6. [Testing](#6-testing)
7. [Deployment](#7-deployment)

---

## 1. Project Setup

### Initialize Node.js Project

```bash
cd c:\DATA\GridVox\gridvox-sim-integration\ams2
mkdir track-map-visualization
cd track-map-visualization

# Initialize package.json
npm init -y

# Install dependencies
npm install --save-dev typescript @types/node ts-node nodemon
npm install eventemitter3

# Initialize TypeScript
npx tsc --init
```

### TypeScript Configuration

Edit `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/demo/static-demo.ts",
    "dev:live": "ts-node src/demo/live-demo.ts",
    "watch": "nodemon --watch src --exec ts-node src/demo/live-demo.ts",
    "test": "echo \"Tests not yet implemented\"",
    "clean": "rimraf dist"
  }
}
```

### Project Structure

Create folder structure:

```bash
mkdir -p src/core
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/demo
mkdir -p track-definitions
mkdir -p public
mkdir -p tests
```

---

## 2. Track Data Schema

### Track Type Definitions

Create `src/types/track.types.ts`:

```typescript
/**
 * Track data type definitions
 */

export interface TrackPoint {
  /** Position along lap (0.0 = start/finish, 1.0 = end of lap) */
  percentage: number;
  
  /** Normalized X coordinate (0-1000) */
  x: number;
  
  /** Normalized Y coordinate (0-1000) */
  y: number;
  
  /** Corner number if this is a labeled corner */
  cornerNumber?: number;
  
  /** Corner name (e.g., "Copse", "Eau Rouge") */
  cornerName?: string;
}

export interface SectorBoundaries {
  /** Lap percentage where sector 1 ends (typically ~0.33) */
  sector1End: number;
  
  /** Lap percentage where sector 2 ends (typically ~0.66) */
  sector2End: number;
  
  // Sector 3 is implicit: sector2End to 1.0
}

export interface PitLaneDefinition {
  /** Lap percentage where pit entry begins */
  entryPercentage: number;
  
  /** Lap percentage where pit exit ends */
  exitPercentage: number;
  
  /** Path coordinates for pit lane */
  path: Array<{ x: number; y: number }>;
}

export interface TrackViewport {
  /** Canvas width */
  width: number;
  
  /** Canvas height */
  height: number;
  
  /** Padding around track (pixels) */
  padding: number;
}

export interface TrackDefinition {
  /** Track name (matches AMS2 telemetry) */
  name: string;
  
  /** Track variation (matches AMS2 telemetry) */
  variation: string;
  
  /** Track length in meters */
  length: number;
  
  /** Track path as array of points */
  trackPath: TrackPoint[];
  
  /** Sector boundary definitions */
  sectors: SectorBoundaries;
  
  /** Pit lane definition (optional) */
  pitLane?: PitLaneDefinition;
  
  /** Viewport settings */
  viewport: TrackViewport;
  
  /** Metadata */
  metadata?: {
    country?: string;
    city?: string;
    yearBuilt?: number;
    corners?: number;
    description?: string;
  };
}

/**
 * Helper to determine which sector a lap percentage falls into
 */
export function getSectorForPercentage(
  percentage: number,
  sectors: SectorBoundaries
): 1 | 2 | 3 {
  if (percentage <= sectors.sector1End) return 1;
  if (percentage <= sectors.sector2End) return 2;
  return 3;
}

/**
 * Validate track definition structure
 */
export function validateTrackDefinition(track: any): track is TrackDefinition {
  if (!track.name || typeof track.name !== 'string') return false;
  if (!track.variation || typeof track.variation !== 'string') return false;
  if (!track.length || typeof track.length !== 'number') return false;
  if (!Array.isArray(track.trackPath) || track.trackPath.length < 3) return false;
  
  // Validate track path points
  for (const point of track.trackPath) {
    if (typeof point.percentage !== 'number' || 
        typeof point.x !== 'number' || 
        typeof point.y !== 'number') {
      return false;
    }
    if (point.percentage < 0 || point.percentage > 1) return false;
  }
  
  // Validate sectors
  if (!track.sectors || 
      typeof track.sectors.sector1End !== 'number' ||
      typeof track.sectors.sector2End !== 'number') {
    return false;
  }
  
  return true;
}
```

### Example Track Definition

Create `track-definitions/silverstone-gp.json`:

```json
{
  "name": "Silverstone",
  "variation": "Grand Prix",
  "length": 5891,
  "trackPath": [
    { "percentage": 0.000, "x": 500, "y": 850, "cornerNumber": 1, "cornerName": "Abbey" },
    { "percentage": 0.025, "x": 520, "y": 820 },
    { "percentage": 0.050, "x": 545, "y": 780, "cornerNumber": 2, "cornerName": "Farm" },
    { "percentage": 0.075, "x": 570, "y": 740 },
    { "percentage": 0.100, "x": 600, "y": 700, "cornerNumber": 3, "cornerName": "Village" },
    { "percentage": 0.125, "x": 635, "y": 660 },
    { "percentage": 0.150, "x": 670, "y": 630, "cornerNumber": 4, "cornerName": "The Loop" },
    { "percentage": 0.175, "x": 705, "y": 615 },
    { "percentage": 0.200, "x": 740, "y": 610, "cornerNumber": 5, "cornerName": "Aintree" },
    { "percentage": 0.225, "x": 775, "y": 615 },
    { "percentage": 0.250, "x": 805, "y": 630, "cornerNumber": 6, "cornerName": "Wellington" },
    { "percentage": 0.275, "x": 830, "y": 655 },
    { "percentage": 0.300, "x": 850, "y": 685, "cornerNumber": 7, "cornerName": "Brooklands" },
    { "percentage": 0.330, "x": 860, "y": 720 },
    { "percentage": 0.350, "x": 855, "y": 755, "cornerNumber": 8, "cornerName": "Luffield" },
    { "percentage": 0.375, "x": 835, "y": 785 },
    { "percentage": 0.400, "x": 805, "y": 805, "cornerNumber": 9, "cornerName": "Woodcote" },
    { "percentage": 0.425, "x": 770, "y": 815 },
    { "percentage": 0.450, "x": 730, "y": 815, "cornerNumber": 10, "cornerName": "Copse" },
    { "percentage": 0.475, "x": 690, "y": 805 },
    { "percentage": 0.500, "x": 655, "y": 785, "cornerNumber": 11, "cornerName": "Maggotts" },
    { "percentage": 0.525, "x": 625, "y": 760 },
    { "percentage": 0.550, "x": 600, "y": 730, "cornerNumber": 12, "cornerName": "Becketts" },
    { "percentage": 0.575, "x": 580, "y": 695 },
    { "percentage": 0.600, "x": 565, "y": 660, "cornerNumber": 13, "cornerName": "Chapel" },
    { "percentage": 0.625, "x": 555, "y": 625 },
    { "percentage": 0.650, "x": 555, "y": 590, "cornerNumber": 14, "cornerName": "Hangar" },
    { "percentage": 0.670, "x": 560, "y": 555 },
    { "percentage": 0.690, "x": 575, "y": 520, "cornerNumber": 15, "cornerName": "Stowe" },
    { "percentage": 0.710, "x": 595, "y": 490 },
    { "percentage": 0.730, "x": 620, "y": 465, "cornerNumber": 16, "cornerName": "Vale" },
    { "percentage": 0.750, "x": 650, "y": 450 },
    { "percentage": 0.775, "x": 685, "y": 445, "cornerNumber": 17, "cornerName": "Club" },
    { "percentage": 0.800, "x": 720, "y": 455 },
    { "percentage": 0.825, "x": 750, "y": 475 },
    { "percentage": 0.850, "x": 770, "y": 505, "cornerNumber": 18, "cornerName": "Abbey" },
    { "percentage": 0.875, "x": 780, "y": 540 },
    { "percentage": 0.900, "x": 775, "y": 575 },
    { "percentage": 0.925, "x": 755, "y": 605 },
    { "percentage": 0.950, "x": 725, "y": 630 },
    { "percentage": 0.975, "x": 690, "y": 645 },
    { "percentage": 1.000, "x": 500, "y": 850 }
  ],
  "sectors": {
    "sector1End": 0.33,
    "sector2End": 0.67
  },
  "pitLane": {
    "entryPercentage": 0.88,
    "exitPercentage": 0.05,
    "path": [
      { "x": 750, "y": 590 },
      { "x": 720, "y": 610 },
      { "x": 680, "y": 630 },
      { "x": 640, "y": 650 },
      { "x": 600, "y": 670 },
      { "x": 560, "y": 690 },
      { "x": 525, "y": 715 },
      { "x": 500, "y": 745 },
      { "x": 485, "y": 780 },
      { "x": 485, "y": 815 },
      { "x": 495, "y": 840 }
    ]
  },
  "viewport": {
    "width": 1200,
    "height": 1000,
    "padding": 50
  },
  "metadata": {
    "country": "United Kingdom",
    "city": "Silverstone",
    "yearBuilt": 1948,
    "corners": 18,
    "description": "Historic British Grand Prix circuit"
  }
}
```

### Racer Position Types

Create `src/types/racer.types.ts`:

```typescript
/**
 * Racer position and state types
 */

export interface RacerPosition {
  /** Participant index */
  index: number;
  
  /** Driver name */
  name: string;
  
  /** Current race position (1st, 2nd, etc.) */
  racePosition: number;
  
  /** 2D map position */
  mapPosition: {
    x: number;
    y: number;
  };
  
  /** Current sector (1, 2, or 3) */
  sector: 1 | 2 | 3;
  
  /** Lap percentage (0.0 to 1.0) */
  lapPercentage: number;
  
  /** Current lap number */
  currentLap: number;
  
  /** Speed (m/s) */
  speed: number;
  
  /** Pit mode */
  pitMode: 'NONE' | 'ENTERING' | 'IN_PIT' | 'EXITING';
  
  /** Race state */
  raceState: 'RACING' | 'FINISHED' | 'DNF' | 'RETIRED';
  
  /** Is this the player? */
  isPlayer: boolean;
}

export interface RacerColor {
  primary: string;
  outline: string;
}

export type ColorMode = 'sector' | 'class' | 'team' | 'state';

/**
 * Get color for racer based on mode and state
 */
export function getRacerColor(
  racer: RacerPosition,
  mode: ColorMode
): RacerColor {
  // Player always yellow
  if (racer.isPlayer) {
    return { primary: '#FFFF00', outline: '#000000' };
  }
  
  // Pit mode takes priority
  if (racer.pitMode !== 'NONE') {
    return { primary: '#FFA500', outline: '#000000' };
  }
  
  // DNF/Retired
  if (racer.raceState !== 'RACING' && racer.raceState !== 'FINISHED') {
    return { primary: '#666666', outline: '#000000' };
  }
  
  // Finished
  if (racer.raceState === 'FINISHED') {
    return { primary: '#00FFFF', outline: '#000000' };
  }
  
  // Color by mode
  switch (mode) {
    case 'sector':
      switch (racer.sector) {
        case 1: return { primary: '#FF0000', outline: '#000000' }; // Red
        case 2: return { primary: '#00FF00', outline: '#000000' }; // Green
        case 3: return { primary: '#0000FF', outline: '#000000' }; // Blue
      }
      break;
      
    case 'state':
      return { primary: '#FFFFFF', outline: '#000000' }; // White
      
    // TODO: Implement class and team colors
    case 'class':
    case 'team':
    default:
      return { primary: '#FFFFFF', outline: '#000000' };
  }
}
```

---

## 3. Position Calculation

### Position Calculator

Create `src/core/PositionCalculator.ts`:

```typescript
/**
 * Calculate 2D map positions from telemetry data
 */

import { TrackDefinition, TrackPoint } from '../types/track.types';

export class PositionCalculator {
  private trackDef: TrackDefinition;
  
  constructor(trackDef: TrackDefinition) {
    this.trackDef = trackDef;
  }
  
  /**
   * Calculate 2D position from lap distance
   * 
   * @param lapDistance Distance through current lap in meters
   * @returns {x, y} coordinates on track map
   */
  calculatePosition(lapDistance: number): { x: number; y: number } {
    // Convert to percentage (0.0 to 1.0)
    let percentage = lapDistance / this.trackDef.length;
    
    // Clamp to valid range
    percentage = Math.max(0, Math.min(1, percentage));
    
    // Find surrounding track points
    const { before, after, t } = this.findSurroundingPoints(percentage);
    
    // Linear interpolation
    const x = this.lerp(before.x, after.x, t);
    const y = this.lerp(before.y, after.y, t);
    
    return { x, y };
  }
  
  /**
   * Find the two track points that surround a given percentage
   */
  private findSurroundingPoints(percentage: number): {
    before: TrackPoint;
    after: TrackPoint;
    t: number; // Interpolation factor (0 to 1)
  } {
    const path = this.trackDef.trackPath;
    
    // Handle edge case: exact match
    for (let i = 0; i < path.length; i++) {
      if (Math.abs(path[i].percentage - percentage) < 0.0001) {
        return {
          before: path[i],
          after: path[i],
          t: 0
        };
      }
    }
    
    // Find bracketing points
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      if (percentage >= current.percentage && percentage <= next.percentage) {
        // Calculate interpolation factor
        const range = next.percentage - current.percentage;
        const offset = percentage - current.percentage;
        const t = range > 0 ? offset / range : 0;
        
        return {
          before: current,
          after: next,
          t: t
        };
      }
    }
    
    // Wrap around (between last and first point)
    const last = path[path.length - 1];
    const first = path[0];
    
    // Percentage is beyond last point, interpolate to first
    const range = (1.0 - last.percentage) + first.percentage;
    const offset = percentage - last.percentage;
    const t = offset / range;
    
    return {
      before: last,
      after: first,
      t: t
    };
  }
  
  /**
   * Linear interpolation
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  
  /**
   * Find nearest corner to a position
   */
  findNearestCorner(percentage: number): TrackPoint | null {
    const corners = this.trackDef.trackPath.filter(p => p.cornerNumber !== undefined);
    
    if (corners.length === 0) return null;
    
    let nearest = corners[0];
    let minDist = Math.abs(corners[0].percentage - percentage);
    
    for (const corner of corners) {
      const dist = Math.abs(corner.percentage - percentage);
      if (dist < minDist) {
        minDist = dist;
        nearest = corner;
      }
    }
    
    return nearest;
  }
}
```

---

## 4. Canvas Rendering

### Track Renderer

Create `src/core/TrackRenderer.ts`:

```typescript
/**
 * Canvas-based track map renderer
 */

import { TrackDefinition, getSectorForPercentage } from '../types/track.types';
import { RacerPosition, getRacerColor, ColorMode } from '../types/racer.types';

export interface RendererConfig {
  /** Color mode for racers */
  colorMode: ColorMode;
  
  /** Show racer labels */
  showLabels: boolean;
  
  /** Show corner numbers */
  showCorners: boolean;
  
  /** Show sector zones */
  showSectors: boolean;
  
  /** Highlight player with larger dot */
  highlightPlayer: boolean;
  
  /** Racer dot size */
  racerDotSize: number;
  
  /** Track line width */
  trackLineWidth: number;
}

export class TrackRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private trackDef: TrackDefinition;
  private config: RendererConfig;
  
  constructor(
    canvas: HTMLCanvasElement,
    trackDef: TrackDefinition,
    config: Partial<RendererConfig> = {}
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.trackDef = trackDef;
    
    // Default config
    this.config = {
      colorMode: 'sector',
      showLabels: false,
      showCorners: true,
      showSectors: true,
      highlightPlayer: true,
      racerDotSize: 8,
      trackLineWidth: 3,
      ...config
    };
    
    // Set canvas size
    this.canvas.width = trackDef.viewport.width;
    this.canvas.height = trackDef.viewport.height;
  }
  
  /**
   * Render complete track map
   */
  render(racers: RacerPosition[]): void {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw in layers
    if (this.config.showSectors) {
      this.drawSectorZones();
    }
    
    this.drawTrackOutline();
    
    if (this.config.showCorners) {
      this.drawCornerMarkers();
    }
    
    this.drawRacers(racers);
  }
  
  /**
   * Draw sector background zones
   */
  private drawSectorZones(): void {
    const path = this.trackDef.trackPath;
    const sectors = this.trackDef.sectors;
    
    // Sector 1 (red tint)
    this.fillSector(0, sectors.sector1End, 'rgba(255, 0, 0, 0.1)');
    
    // Sector 2 (green tint)
    this.fillSector(sectors.sector1End, sectors.sector2End, 'rgba(0, 255, 0, 0.1)');
    
    // Sector 3 (blue tint)
    this.fillSector(sectors.sector2End, 1.0, 'rgba(0, 0, 255, 0.1)');
  }
  
  private fillSector(startPct: number, endPct: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    
    const path = this.trackDef.trackPath;
    let started = false;
    
    for (const point of path) {
      if (point.percentage >= startPct && point.percentage <= endPct) {
        if (!started) {
          this.ctx.moveTo(point.x, point.y);
          started = true;
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      }
    }
    
    // Close and fill (simplified - doesn't account for track width)
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  /**
   * Draw track outline
   */
  private drawTrackOutline(): void {
    const path = this.trackDef.trackPath;
    
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = this.config.trackLineWidth;
    this.ctx.beginPath();
    
    // Draw path
    path.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });
    
    this.ctx.closePath();
    this.ctx.stroke();
  }
  
  /**
   * Draw corner number markers
   */
  private drawCornerMarkers(): void {
    const corners = this.trackDef.trackPath.filter(p => p.cornerNumber !== undefined);
    
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    for (const corner of corners) {
      // Draw circle
      this.ctx.beginPath();
      this.ctx.arc(corner.x, corner.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw number
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(corner.cornerNumber!.toString(), corner.x, corner.y);
      this.ctx.fillStyle = '#888888';
    }
  }
  
  /**
   * Draw all racers
   */
  private drawRacers(racers: RacerPosition[]): void {
    // Sort by position (draw leaders last so they're on top)
    const sorted = [...racers].sort((a, b) => b.racePosition - a.racePosition);
    
    for (const racer of sorted) {
      this.drawRacer(racer);
    }
  }
  
  /**
   * Draw single racer
   */
  private drawRacer(racer: RacerPosition): void {
    const { x, y } = racer.mapPosition;
    const colors = getRacerColor(racer, this.config.colorMode);
    
    // Determine size
    const size = this.config.highlightPlayer && racer.isPlayer
      ? this.config.racerDotSize * 1.5
      : this.config.racerDotSize;
    
    // Draw outline
    this.ctx.fillStyle = colors.outline;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size + 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw main circle
    this.ctx.fillStyle = colors.primary;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw position number
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Add shadow for readability
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 3;
    this.ctx.fillText(racer.racePosition.toString(), x, y);
    this.ctx.shadowBlur = 0;
    
    // Draw name label if enabled
    if (this.config.showLabels) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 2;
      this.ctx.fillText(racer.name, x, y + size + 12);
      this.ctx.shadowBlur = 0;
    }
  }
  
  /**
   * Export canvas as PNG blob
   */
  async exportPNG(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    });
  }
}
```

---

## 5. Telemetry Integration

### Track Map Visualizer

Create `src/core/TrackMapVisualizer.ts`:

```typescript
/**
 * Main visualizer - integrates telemetry, calculation, and rendering
 */

import { EventEmitter } from 'eventemitter3';
import { TrackDefinition } from '../types/track.types';
import { RacerPosition, ColorMode } from '../types/racer.types';
import { PositionCalculator } from './PositionCalculator';
import { TrackRenderer, RendererConfig } from './TrackRenderer';

// Import telemetry types (from poc-02-direct-memory)
interface TelemetryData {
  trackLocation: string;
  trackVariation: string;
  trackLength: number;
  viewedParticipantIndex: number;
  participants: Array<{
    index: number;
    isActive: boolean;
    name: string;
    currentLapDistance: number;
    racePosition: number;
    currentSector: number;
    currentLap: number;
    speed: number;
    pitMode: number;
    raceState: number;
  }>;
}

export interface VisualizerConfig extends Partial<RendererConfig> {
  /** Update rate in Hz */
  updateRate?: number;
}

export class TrackMapVisualizer extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private trackDef: TrackDefinition | null = null;
  private calculator: PositionCalculator | null = null;
  private renderer: TrackRenderer | null = null;
  private config: VisualizerConfig;
  
  constructor(canvas: HTMLCanvasElement, config: VisualizerConfig = {}) {
    super();
    this.canvas = canvas;
    this.config = {
      updateRate: 30,
      ...config
    };
  }
  
  /**
   * Load track definition
   */
  loadTrack(trackDef: TrackDefinition): void {
    this.trackDef = trackDef;
    this.calculator = new PositionCalculator(trackDef);
    this.renderer = new TrackRenderer(this.canvas, trackDef, this.config);
    
    this.emit('track-loaded', trackDef);
  }
  
  /**
   * Update visualization with new telemetry data
   */
  update(telemetryData: TelemetryData): void {
    if (!this.trackDef || !this.calculator || !this.renderer) {
      console.warn('Track not loaded, cannot update visualization');
      return;
    }
    
    // Convert telemetry participants to racer positions
    const racers: RacerPosition[] = telemetryData.participants
      .filter(p => p.isActive)
      .map(p => {
        // Calculate map position
        const mapPosition = this.calculator!.calculatePosition(p.currentLapDistance);
        
        // Determine sector
        const lapPercentage = p.currentLapDistance / this.trackDef!.length;
        const sector = this.getSector(lapPercentage);
        
        // Map pit mode
        const pitMode = this.mapPitMode(p.pitMode);
        
        // Map race state
        const raceState = this.mapRaceState(p.raceState);
        
        return {
          index: p.index,
          name: p.name,
          racePosition: p.racePosition,
          mapPosition,
          sector,
          lapPercentage,
          currentLap: p.currentLap,
          speed: p.speed,
          pitMode,
          raceState,
          isPlayer: p.index === telemetryData.viewedParticipantIndex
        };
      });
    
    // Render
    this.renderer.render(racers);
    
    this.emit('updated', racers);
  }
  
  private getSector(percentage: number): 1 | 2 | 3 {
    if (!this.trackDef) return 1;
    
    if (percentage <= this.trackDef.sectors.sector1End) return 1;
    if (percentage <= this.trackDef.sectors.sector2End) return 2;
    return 3;
  }
  
  private mapPitMode(mode: number): RacerPosition['pitMode'] {
    switch (mode) {
      case 1: return 'ENTERING';
      case 2: return 'IN_PIT';
      case 3: return 'EXITING';
      default: return 'NONE';
    }
  }
  
  private mapRaceState(state: number): RacerPosition['raceState'] {
    switch (state) {
      case 2: return 'RACING';
      case 3: return 'FINISHED';
      case 5: return 'RETIRED';
      case 6: return 'DNF';
      default: return 'RACING';
    }
  }
  
  /**
   * Change color mode
   */
  setColorMode(mode: ColorMode): void {
    this.config.colorMode = mode;
    if (this.renderer && this.trackDef) {
      this.renderer = new TrackRenderer(this.canvas, this.trackDef, this.config);
    }
  }
  
  /**
   * Export current frame as PNG
   */
  async exportPNG(): Promise<Blob> {
    if (!this.renderer) {
      throw new Error('No renderer available');
    }
    return this.renderer.exportPNG();
  }
}
```

---

## 6. Testing

### Static Demo (No Telemetry Required)

Create `src/demo/static-demo.ts`:

```typescript
/**
 * Static demo with mock data - no AMS2 required
 */

import * as fs from 'fs';
import * as path from 'path';
import { TrackDefinition } from '../types/track.types';
import { RacerPosition } from '../types/racer.types';
import { PositionCalculator } from '../core/PositionCalculator';

// Load track definition
const trackPath = path.join(__dirname, '../../track-definitions/silverstone-gp.json');
const trackData = JSON.parse(fs.readFileSync(trackPath, 'utf-8')) as TrackDefinition;

console.log('\\n🏁 GridVox Track Map Visualization - Static Demo\\n');
console.log(`Track: ${trackData.name} - ${trackData.variation}`);
console.log(`Length: ${trackData.length}m`);
console.log(`Points: ${trackData.trackPath.length}`);
console.log(`\\nGenerating mock racer positions...\\n`);

const calculator = new PositionCalculator(trackData);

// Generate 20 mock racers spread around track
const mockRacers: RacerPosition[] = [];
for (let i = 0; i < 20; i++) {
  const lapDistance = (i / 20) * trackData.length;
  const lapPercentage = lapDistance / trackData.length;
  const mapPosition = calculator.calculatePosition(lapDistance);
  
  let sector: 1 | 2 | 3 = 1;
  if (lapPercentage > trackData.sectors.sector2End) sector = 3;
  else if (lapPercentage > trackData.sectors.sector1End) sector = 2;
  
  mockRacers.push({
    index: i,
    name: `Driver ${i + 1}`,
    racePosition: i + 1,
    mapPosition,
    sector,
    lapPercentage,
    currentLap: 1,
    speed: 200 + Math.random() * 50,
    pitMode: 'NONE',
    raceState: 'RACING',
    isPlayer: i === 0
  });
}

// Print positions
console.log('Mock Racer Positions:');
console.log('─'.repeat(70));
mockRacers.forEach(racer => {
  console.log(
    `P${racer.racePosition.toString().padStart(2)}: ${racer.name.padEnd(15)} | ` +
    `S${racer.sector} | ${Math.round(racer.lapPercentage * 100)}% | ` +
    `Map: (${Math.round(racer.mapPosition.x)}, ${Math.round(racer.mapPosition.y)})`
  );
});

console.log('\\n✅ Static demo complete!');
console.log('\\nNext step: Run live demo with AMS2');
console.log('   npm run dev:live\\n');
```

Run with: `npm run dev`

---

## 7. Next Steps

### Create Live Demo (Week 2)

Will require:
1. Import from `poc-02-direct-memory`
2. HTML page with canvas element
3. WebSocket or HTTP server for browser access
4. Real-time update loop

### Add More Tracks (Week 4)

Create more track definitions in `track-definitions/`:
- Spa-Francorchamps
- Monza
- Interlagos
- Brands Hatch
- Nürburgring GP

### Companion App Integration (Week 5)

Setup WebSocket server to broadcast positions to mobile devices.

---

## Appendix: Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/types/track.types.ts` | Track definition interfaces |
| `src/types/racer.types.ts` | Racer position types |
| `src/core/PositionCalculator.ts` | Lap distance → 2D coords |
| `src/core/TrackRenderer.ts` | Canvas rendering |
| `src/core/TrackMapVisualizer.ts` | Main coordinator |
| `track-definitions/*.json` | Track data files |

### NPM Commands

```bash
npm run build      # Compile TypeScript
npm run dev        # Static demo
npm run dev:live   # Live AMS2 demo (Week 2)
npm run watch      # Auto-rebuild on changes
npm run test       # Run tests (TBD)
```

---

**Next:** Proceed with project setup and implement static demo!
