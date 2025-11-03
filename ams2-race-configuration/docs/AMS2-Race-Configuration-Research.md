# AMS2 Race Configuration - Deep Research & Implementation Options

**Research Date:** November 3, 2025  
**Context:** GridVox Phase 0 & Beyond - Enabling AI-driven race session configuration  
**Status:** Comprehensive evaluation of multiple approaches

> Subproject: For execution planning and working docs, see `06-development/subprojects/ams2-race-configuration/` (README, deep research, attack plan, lab protocol, UI automation design, risk log).

---

## Executive Summary

GridVox needs the ability to configure single-player race sessions and championships programmatically within sim racing games. This feature enables AI-driven race setup (track, car, opponents, weather), voice-controlled session configuration, and automated championship creation.

**Key Finding:** Multiple approaches exist, from file manipulation to API integration, each with different trade-offs for reliability, sim coverage, and user experience.

---

## Table of Contents

1. [Context & User Stories](#1-context--user-stories)
2. [AMS2 Local File Analysis](#2-ams2-local-file-analysis)
3. [Approach 1: Direct File Manipulation](#3-approach-1-direct-file-manipulation)
4. [Approach 2: Shared Memory Write Access](#4-approach-2-shared-memory-write-access)
5. [Approach 3: UDP/HTTP API Commands](#5-approach-3-udphttps-api-commands)
6. [Approach 4: In-Game Overlay Input Simulation](#6-approach-4-in-game-overlay-input-simulation)
7. [Approach 5: Sim-Specific Plugin/Mod System](#7-approach-5-sim-specific-pluginmod-system)
8. [Approach 6: SimHub Integration](#8-approach-6-simhub-integration)
9. [Cross-Sim Comparison](#9-cross-sim-comparison)
10. [Recommended Implementation Path](#10-recommended-implementation-path)
11. [GridVox Integration Architecture](#11-gridvox-integration-architecture)
12. [User Stories & Features](#12-user-stories--features)

---

## 1. Context & User Stories

### GridVox Use Cases

From the GridVox concept and user stories, race configuration enables:

1. **AI Voice-Controlled Race Setup**
   - "Set up a 20-lap race at Spa with GT3 cars"
   - "Configure a rainy evening session at Silverstone"
   - Voice command: "Add 10 more opponents to this race"

2. **Story Mode Dynamic Race Configuration**
   - Historical accuracy: "Load the 1976 Monaco Grand Prix configuration"
   - Challenge modes: "Recreate the 1993 Donington wet race conditions"
   - Progressive difficulty: Race configurations match story progression

3. **Quick Championship Creation**
   - "Create a 10-race GT3 championship with my favorite tracks"
   - AI suggests balanced championship schedules
   - Voice-controlled opponent difficulty and count adjustments

4. **Session Quick-Start**
   - "Start a quick race at my favorite track with my usual settings"
   - Save and recall race presets via voice
   - "Set up the same race as last time but with rain"

5. **Educational Features**
   - "Let me demonstrate racing in different weather conditions"
   - Interactive track and car class tutorials
   - Quick setup for teaching/practice scenarios

### GridVox Phase Priorities

- **Phase 0 (MVP):** Read-only telemetry, crew radio (no race configuration needed)
- **Phase 1:** Voice-controlled race session configuration (track, car, basic weather)
- **Phase 2:** Full championship creation, advanced weather/time configuration
- **Phase 3:** AI-suggested race configurations, cross-sim session templates

---

## 2. AMS2 Local File Analysis

### Directory Structure

**AMS2 Savegame Location:**
```
C:\Users\[Username]\OneDrive\Documents\Automobilista 2\savegame\[SteamID]\automobilista 2\
```

**Key Subdirectories:**
```
├── profiles\                   # User profiles and preferences
├── careersaves\                # Career mode saves
├── singlechamps\               # Single-player championship data
├── customraces\                # Custom race configurations (likely)
└── vehiclesetups_1_6\          # Vehicle setup files (separate subproject)
```

### Race Configuration Files

**Likely File Formats:**
- **Extension:** `.srs` (Session/Race Setup), `.xml`, or `.json`
- **Encoding:** XML or binary format
- **Location:** Possibly in root savegame folder or `customraces/` subdirectory
- **Content:** Track selection, car class, opponent configuration, weather, session parameters

**Expected Structure (if XML/JSON):**
```xml
<RaceConfiguration>
  <Track id="spa" name="Spa-Francorchamps" />
  <CarClass id="gt3" />
  <Opponents count="20" difficulty="medium" />
  <Weather type="rain" intensity="0.5" />
  <TimeOfDay hour="14" />
  <SessionLength laps="10" />
</RaceConfiguration>
```

**Expected Parameters:**
- Track ID/name
- Car class/category
- Opponent count (0-40+)
- AI difficulty/aggression
- Weather preset or detailed configuration
- Time of day and progression
- Session length (laps, minutes, or time-based)
- Starting position, formation lap settings

### Championship Files

**Location:** `singlechamps/` directory
**Format:** Likely XML with multiple race definitions
**Structure:** Series of races with tracks, points system, progression

### AMS2 File Format Challenges

1. **Unknown File Format**
   - Limited public documentation
   - May be XML (easy) or binary (challenging)
   - Requires research and testing

2. **Track/Car ID Mapping**
   - Need to map human names to internal IDs
   - IDs may change with DLC/updates
   - May require maintaining reference database

3. **Validation and Constraints**
   - Game may validate track/car combinations
   - Some cars may not be allowed on certain tracks
   - Weather/time constraints per track

4. **Version Compatibility**
   - File format may change with updates
   - Need version detection and handling

---

## 3. Approach 1: Direct File Manipulation

### Overview
Modify race configuration files directly in the savegame directory.

### Technical Implementation

#### Discovery Process

**Step 1: File Format Analysis**
```javascript
// Analyze race configuration file structure
const fs = require('fs');
const content = fs.readFileSync('CustomRace.srs', 'utf8');

// Check if XML/JSON or binary
if (content.startsWith('<')) {
  // XML format - parse with xml2js
} else if (content.startsWith('{')) {
  // JSON format - parse with JSON.parse()
} else {
  // Binary format - hex analysis required
}
```

**Step 2: Create Schema Definition**
```javascript
// Example structure for race configuration
interface RaceConfig {
  track: {
    id: string;           // 'spa', 'interlagos', etc.
    layout: string;       // 'gp', 'short', etc.
  };
  
  carClass: string;       // 'GT3', 'FormulaV10', etc.
  
  session: {
    type: 'race' | 'practice' | 'qualifying';
    length: number;       // laps or minutes
    timeScaling: number;  // 1x, 2x, etc.
  };
  
  opponents: {
    count: number;        // 0-40
    difficulty: number;   // 0-100 or preset names
    aggression: number;   // 0-100
  };
  
  weather: {
    type: 'clear' | 'overcast' | 'light_rain' | 'heavy_rain';
    temperature: number;  // celsius
    timeOfDay: number;    // hour 0-23
  };
  
  startingPosition: number;
  flags: boolean;
  penalties: boolean;
}
```

**Step 3: Read/Write Library**
```javascript
class AMS2RaceConfigManager {
  readConfig(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return this.parseConfig(content);
  }
  
  writeConfig(config, filePath) {
    // Backup original
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, filePath + '.backup');
    }
    
    const serialized = this.serializeConfig(config);
    fs.writeFileSync(filePath, serialized);
  }
  
  parseConfig(content) {
    // Parse XML/JSON to structured object
    // Map internal IDs to human-readable names
  }
  
  serializeConfig(config) {
    // Convert structured object back to file format
  }
}
```

### Pros
- ✅ **Complete control** over race parameters
- ✅ **No game modification** required
- ✅ **Works offline** (no network dependency)
- ✅ **Persistent** - configurations saved permanently
- ✅ **Can create unlimited configurations** programmatically

### Cons
- ❌ **File format discovery required** - initial research needed
- ❌ **Brittle** - game updates can break compatibility
- ❌ **No official support** - no documentation from developers
- ❌ **Risk of file corruption** - could damage save data
- ❌ **ID mapping required** - track/car IDs may not be human-readable
- ❌ **Version-specific** - need separate handling per game version

### Implementation Complexity
- **Research Time:** 20-40 hours (file format discovery)
- **Development Time:** 15-30 hours (parser/writer library)
- **Testing Time:** 15-30 hours (validation across configurations)
- **Maintenance:** Medium (game updates may require adjustments)
- **Total:** 50-100 hours

### Risk Level
- **Medium Risk:** File corruption possible, but less complex than vehicle setup
- **Mitigation:** Backup files before modification, extensive testing

---

## 4. Approach 2: Shared Memory Write Access

### Overview
Investigate if AMS2 exposes race configuration via shared memory that could be modified.

### Technical Analysis

AMS2 exposes telemetry via shared memory (`$pcars2$` memory-mapped file), but this is **read-only** and focused on real-time race data (speed, position, lap times), not race configuration parameters.

### Pros (If It Existed)
- ✅ **Low latency** - direct memory access
- ✅ **No file I/O** - instant changes

### Cons
- ❌ **Not designed for configuration** - shared memory is for telemetry output
- ❌ **Race configuration not exposed** - only live session data
- ❌ **Read-only by design** - game doesn't listen for external modifications
- ❌ **Session-only** - wouldn't persist configurations

### Verdict
- ⛔ **Not Applicable:** Shared memory is for telemetry output, not race configuration input

---

## 5. Approach 3: UDP/HTTP API Commands

### Overview
Check if AMS2 supports external commands for race configuration via network protocols.

### Investigation Results

**AMS2/Project CARS Engine Background:**
- Based on Madness Engine (same as Project CARS 1/2)
- Known for telemetry output, not input commands
- No documented UDP/HTTP command API for race configuration

**Community Research:**
- No official API documentation for race configuration
- Community forums show no evidence of command API
- CREST2 (telemetry bridge) is read-only

### Theoretical API Design

If such an API existed, it might look like:

```javascript
// Hypothetical AMS2 UDP Command Protocol
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const command = {
  type: 'CONFIGURE_RACE',
  parameters: {
    track: 'spa',
    carClass: 'GT3',
    opponents: 20,
    weather: 'rain',
    timeOfDay: 14
  }
};

client.send(JSON.stringify(command), 20777, 'localhost');
```

### Pros (If It Existed)
- ✅ **Clean interface** - official API
- ✅ **Reliable** - game developers ensure compatibility
- ✅ **Version-safe** - API versioning handles updates

### Cons
- ❌ **Doesn't exist** in AMS2
- ❌ **Would require developer cooperation** to add
- ❌ **Feature request** - may never be implemented

### Verdict
- ⏸️ **Future Possibility:** Could request from Reiza Studios
- **Action:** Submit feature request to official forums

---

## 6. Approach 4: In-Game Overlay Input Simulation

### Overview
Use keyboard/mouse automation to navigate in-game menus and configure races programmatically.

### Technical Implementation

**Input Simulation Libraries:**
```javascript
// Windows: robotjs or AutoHotkey integration
const robot = require('robotjs');

class RaceConfigController {
  async configureRace(config) {
    // 1. Detect game window
    await this.focusGame();
    
    // 2. Navigate to Custom Race
    await this.sendKey('escape');
    await this.navigateTo('Custom Race');
    
    // 3. Select track
    await this.navigateTo('Track Selection');
    await this.selectTrack(config.track);
    
    // 4. Select car class
    await this.navigateTo('Car Selection');
    await this.selectCarClass(config.carClass);
    
    // 5. Configure opponents
    await this.setOpponentCount(config.opponents);
    
    // 6. Set weather
    await this.selectWeather(config.weather);
    
    // 7. Start or save
    await this.confirmConfiguration();
  }
  
  async sendKey(key, times = 1) {
    for (let i = 0; i < times; i++) {
      robot.keyTap(key);
      await this.wait(100);
    }
  }
}
```

**UI State Detection:**
```javascript
// Use OCR or image recognition to detect current menu state
const tesseract = require('node-tesseract-ocr');

async detectMenuState() {
  const screenshot = robot.screen.capture();
  const text = await tesseract.recognize(screenshot);
  return text.includes('Custom Race') || text.includes('Track Selection');
}
```

### Pros
- ✅ **Works with any sim** - universal approach
- ✅ **No reverse engineering** - just automates existing UI
- ✅ **No file format knowledge** needed
- ✅ **Safe** - uses game's own validation
- ✅ **Human-auditable** - changes visible in game

### Cons
- ❌ **Slow** - menu navigation takes 10-30s
- ❌ **Fragile** - UI changes break automation
- ❌ **Resolution-dependent** - different screen sizes need different coordinates
- ❌ **Focus-sensitive** - only works when game is focused
- ❌ **Can't run in background** - disrupts user
- ❌ **OCR reliability** - text detection can fail
- ❌ **Localization issues** - different languages break detection

### Implementation Complexity
- **Development Time:** 30-50 hours (per sim)
- **Testing Time:** 30-50 hours (UI variations, edge cases)
- **Maintenance:** Medium-High (UI updates break it)
- **Total:** 60-100 hours per sim

### Risk Level
- **Low Risk:** Uses public APIs, no game modification
- **User Experience Risk:** Medium (visible but automated)

### Verdict
- ⚠️ **Viable Option:** Good fallback if file manipulation fails
- **Use Case:** Pre-race configuration only

---

## 7. Approach 5: Sim-Specific Plugin/Mod System

### Overview
Investigate if AMS2 or other sims have plugin systems that could help with race configuration.

### AMS2 Plugin Ecosystem

**Current State:**
- AMS2 **does not have** an official plugin/mod API for race configuration
- Modding focused on content (cars, tracks) not functionality
- No Lua/Python scripting available

### Verdict
- ❌ **Not viable for AMS2** - no plugin system exists
- 📋 **Future Watch:** Monitor AMS2 updates for potential API additions

---

## 8. Approach 6: SimHub Integration

### Overview
SimHub provides telemetry reading across multiple sims but does not support race configuration.

### SimHub Capabilities
- ✅ Read telemetry from 30+ sims (including AMS2)
- ❌ Cannot configure races or send commands to sims

### Verdict
- **Use for telemetry only** - not applicable for race configuration

---

## 9. Cross-Sim Comparison

### Race Configuration Approaches Across Sims

| Sim | Best Approach | Complexity | Notes |
|-----|--------------|------------|-------|
| **AMS2** | File/UI Automation | Medium-High | Files need discovery |
| **Assetto Corsa** | Direct File (INI) | Low | Well-documented |
| **ACC** | Direct File (JSON) | Low | JSON format |
| **iRacing** | UI Automation | Medium | No file access |
| **rFactor 2** | File (XML likely) | Medium | Needs investigation |

---

## 10. Recommended Implementation Path

### Phase 1: AMS2 File Discovery & UI Automation
**Duration:** 4-6 weeks

**Approach:**
1. **File Discovery** (1-2 weeks)
   - Investigate AMS2 savegame directory
   - Create/modify custom races in-game
   - Identify which files change
   - Determine file format (XML/JSON/binary)

2. **UI Automation MVP** (2-3 weeks)
   - Build AutoHotkey scripts for race configuration menus
   - Test on 1080p and 1440p resolutions
   - Implement retry logic and error handling

3. **File Manipulation** (1-2 weeks, parallel with UI)
   - If format is XML/JSON, build parser/writer
   - If binary, start reverse engineering

**Deliverables:**
- Working UI automation for race configuration
- File format documentation (if discovered)
- GridVox integration for voice commands

**Success Criteria:**
- Configure 20+ different races successfully
- 90%+ success rate with UI automation
- Zero file corruption incidents

### Phase 2: Advanced Features
**Duration:** Ongoing

1. **Championship Creation**
   - Multi-race configuration
   - Points system setup
   - Season progression

2. **Voice Command Refinement**
   - Natural language parsing for race config
   - "Set up a rainy race at Spa with 25 opponents"
   - Confirmation workflow

3. **Cross-Sim Support**
   - Extend to other sims (AC, ACC, rF2)
   - Unified race configuration interface

---

## 11. GridVox Integration Architecture

### Component Design

```
┌─────────────────────────────────────────────────────────────┐
│                    GridVox Desktop App                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Voice-Controlled Race Setup                  │ │
│  │  "Set up race at Spa with GT3 cars"                   │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │         Race Configuration Controller                  │ │
│  │  - Parse voice intent                                  │ │
│  │  - Validate parameters                                 │ │
│  │  - Request user confirmation                           │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │           Sim Detection & Router                       │ │
│  │  - Detect active sim (process name)                    │ │
│  │  - Route to appropriate handler                        │ │
│  └────────────────┬───────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
│ AMS2     │  │   AC     │  │  ACC     │
│ Handler  │  │  Handler │  │  Handler │
│(File/UI) │  │  (File)  │  │  (File)  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
     ┌──────────────▼──────────────┐
     │   Configuration Operations   │
     │   - Backup original         │
     │   - Write modified config   │
     │   - Validate integrity      │
     │   - Restore on failure      │
     └─────────────────────────────┘
```

### TypeScript Interface Design

```typescript
// gridvox-shared/types/race-config.ts

interface RaceConfiguration {
  track: {
    id: string;
    name: string;
    layout?: string;
  };
  
  carClass: string;
  
  session: {
    type: 'race' | 'practice' | 'qualifying';
    laps?: number;
    duration?: number; // minutes
    timeScaling?: number;
  };
  
  opponents: {
    count: number;
    difficulty: 'easy' | 'medium' | 'hard' | number;
    names?: string[];
  };
  
  weather: {
    type: 'clear' | 'overcast' | 'light_rain' | 'heavy_rain';
    temperature?: number;
    timeOfDay?: number; // 0-23
  };
  
  rules: {
    penalties: boolean;
    flags: boolean;
    damage: 'off' | 'visual' | 'full';
  };
}

interface IRaceConfigHandler {
  sim: SimType;
  
  detect(): Promise<boolean>;
  configureRace(config: RaceConfiguration): Promise<void>;
  validateConfig(config: RaceConfiguration): ValidationResult;
}
```

---

## 12. User Stories & Features

### US-RACE-001: Voice-Controlled Race Setup
**As a** GridVox user  
**I want** to say "Set up a 20-lap race at Spa with GT3 cars"  
**So that** I can configure races without navigating menus

**Acceptance Criteria:**
- Voice recognition detects race configuration intent
- LLM parses track, car class, session length
- UI shows confirmation prompt
- Race configured via file or UI automation

### US-RACE-002: Quick Race Templates
**As a** casual racer  
**I want** predefined race templates (e.g., "Quick GT3 Sprint")  
**So that** I can start racing quickly

**Acceptance Criteria:**
- Library of race templates
- Voice command: "Load quick race template"
- One-click application

### US-RACE-003: Championship Creation
**As an** enthusiast  
**I want** to create a custom championship programmatically  
**So that** I can set up an entire season at once

**Acceptance Criteria:**
- Define multiple races
- Configure points system
- Voice command: "Create 10-race GT3 championship"

---

## Conclusion

### Summary

Race configuration in AMS2 can be achieved through:
1. **File Manipulation** - if files are XML/JSON (ideal)
2. **UI Automation** - reliable fallback approach
3. **Combination** - use file manipulation when possible, UI automation when needed

### Recommended Strategy

1. **Week 1-2:** Discover AMS2 race configuration file format
2. **Week 3-4:** Build UI automation MVP
3. **Week 5-6:** Integrate with GridVox voice commands
4. **Week 7+:** Expand to championship creation and other sims

### Next Steps

1. ✅ Research AMS2 savegame directory for race config files
2. ⏸️ Build UI automation prototype
3. 📋 Test file format discovery with multiple race configurations
4. 📋 Integrate with GridVox voice command system

---

**Document Version:** 2.0 (Corrected)  
**Last Updated:** November 3, 2025  
**Focus:** Race session/championship configuration, NOT vehicle setup tuning  
**Author:** GridVox Development Team

