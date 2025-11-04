# Next Steps: AMS2 Race Configuration Subproject

**Date:** November 3, 2025  
**Status:** Initiation Complete → Ready for Execution  
**Current Phase:** M1 (Research Environment Ready)

---

## Current State Assessment

### ✅ Completed
- **Research & Planning**: Comprehensive research docs completed
  - Deep research on multiple approaches (file, UI automation, API investigation)
  - Attack plan with 7-week timeline and clear milestones
  - Lab protocol for race config file reverse engineering
  - UI automation design document
  - Risk log with 10 identified risks and mitigations

- **Environment**:
  - AMS2 installed with access to savegame directory
  - Git structure clean

### ⚠️ Pending
- **Tools Setup**: Text/hex editors, AutoHotkey, Python/Node environments
- **Dataset Creation**: Need 50+ controlled race config files for reverse engineering
- **UI Automation**: No prototype yet
- **Config File Mapping**: No file format documentation yet
- **Integration**: Not connected to GridVox desktop app

---

## Recommended Immediate Actions

### Priority 1: Quick Win - UI Automation MVP (Week 1)

**Goal:** Prove we can configure races reliably without reverse engineering

**Action Items:**
1. **Install AutoHotkey v2**
   ```cmd
   winget install AutoHotkey.AutoHotkey
   ```

2. **Create Initial UI Automation Script**
   - Target: Simple custom race configuration (track + car class change)
   - Steps: Main Menu → Custom Race → Select Track → Select Car → Configure
   - Add basic error handling and retries
   - Test on 1920x1080 resolution

3. **Deliverable:** Working script that can configure a race with >80% success rate

**Why First?**
- Immediate value: Can use while doing file format reverse engineering
- Lower risk: No file corruption possible
- Validates the approach works before investing in RE
- Can release to GridVox users faster

**Time Estimate:** 3-5 days

---

### Priority 2: Lab Environment Setup (Week 1)

**Goal:** Enable systematic race config file reverse engineering

**Action Items:**
1. **Install Tools**
   - Text editor (VSCode with XML/JSON extensions)
   - HxD or 010 Editor (hex editor for binary formats)
   - Beyond Compare or WinMerge (file diff)
   - Python 3.11+ or Node 20+ (for scripting)

2. **Create Dataset Collection Workspace**
   ```cmd
   mkdir C:\DATA\GridVox\labs\ams2-race-config-re
   mkdir C:\DATA\GridVox\labs\ams2-race-config-re\baseline
   mkdir C:\DATA\GridVox\labs\ams2-race-config-re\variants
   mkdir C:\DATA\GridVox\labs\ams2-race-config-re\analysis
   ```

3. **Locate Race Configuration Files**
   - Investigate savegame directory for race/championship config files
   - Document file locations and formats discovered

**Time Estimate:** 1-2 days

---

### Priority 3: Dataset Generation (Weeks 1-2)

**Goal:** Create controlled race configuration files for reverse engineering

**Action Items:**

1. **Select Test Tracks** (6 tracks covering different types):
   - Interlagos
   - Spa-Francorchamps
   - Silverstone
   - Nürburgring
   - Curitiba
   - Small oval (e.g., Londrina)

2. **Select Test Car Classes** (5 categories):
   - GT3
   - Formula V10
   - Stock Car
   - Touring Cars
   - Formula Classic

2. **Select Test Tracks** (3 tracks):
   - Interlagos
   - Silverstone
   - Spa

3. **Create Baseline + Variants** (systematic parameter changes):
   - Create baseline custom race → Save configuration
   - Copy config file → note filename, timestamp, size
   - Change ONE parameter → Save with descriptive name
   - Repeat for each parameter:
     - Track changes (6 different tracks)
     - Car class changes (5 different classes)
     - Opponent count: 5, 10, 15, 20, 25, 30
     - AI difficulty: Easy, Medium, Hard
     - Weather: Clear, Overcast, Light Rain, Heavy Rain
     - Time of day: Morning, Noon, Afternoon, Dusk, Night
     - Session length: 5 laps, 10 laps, 20 laps, 30 minutes, 60 minutes

4. **Organize Dataset**:
   - Create CSV tracking log:
     ```csv
     filename,baseline_file,parameter,value_before,value_after,notes
     race_001.srs,baseline.srs,track,interlagos,spa,track_change
     race_002.srs,baseline.srs,opponents,15,20,opponent_count
     race_003.srs,baseline.srs,weather,clear,rain,weather_preset
     ```

**Expected Output:** 50-100 race config files with known parameter changes

**Time Estimate:** 5-7 days

---

### Priority 4: Race Config File Reverse Engineering (Weeks 2-4)

**Goal:** Map file format to enable reliable file manipulation

**Action Items:**

1. **Determine File Format**
   - Check if XML/JSON (text editor)
   - If binary, analyze with hex editor
   - Look for human-readable strings (track names, car class names)

2. **File Diff Analysis**
   - For XML/JSON: standard text diff
   - For binary: hex diff to find changed regions
   - Map parameter changes to file structure

3. **Build Track/Car ID Mapping**
   ```json
   {
     "tracks": {
       "spa": "spa_francorchamps",
       "interlagos": "interlagos_gp",
       ...
     },
     "carClasses": {
       "gt3": "GT3_CLASS",
       "formula_v10": "FV10",
       ...
     }
   }
   ```

4. **Create Parser/Writer**
   ```python
   # race_config.py
   import xml.etree.ElementTree as ET
   
   def read_race_config(path):
       tree = ET.parse(path)
       root = tree.getroot()
       return {
           'track': root.find('Track').get('id'),
           'car_class': root.find('CarClass').get('id'),
           'opponents': int(root.find('Opponents').get('count')),
           'weather': root.find('Weather').get('type'),
           ...
       }
   
   def write_race_config(path, config):
       # Modify XML and write back
       ...
   ```

5. **Create Validation Script**
   ```python
   # validate_config.py
   # 1. Read config file
   # 2. Modify one parameter
   # 3. Write back
   # 3. Recalculate checksum (if identified)
   # 4. Write to new file
   # 5. Test in game
   ```

**Deliverables:**
- Mapping table for 10+ parameters
- Python/Node utility to read/write .vts safely
- 010 Editor binary template
- Checksum algorithm implementation (or "UNKNOWN" status)

**Time Estimate:** 2-3 weeks (depends on checksum complexity)

---

## Parallel Track: Integration Planning

While doing RE and UI automation, plan GridVox integration:

### Architecture Decisions

**1. Service Layer**
```typescript
// gridvox-desktop/src/services/SetupService.ts

interface ISetupDriver {
  canModify(): Promise<boolean>;
  applyChange(param: string, value: number): Promise<void>;
}

class AMS2FileDriver implements ISetupDriver {
  // Direct .vts manipulation
}

class AMS2UIDriver implements ISetupDriver {
  // AutoHotkey automation
}

class SetupService {
  private driver: ISetupDriver;
  
  async applySetupChange(param: string, value: number) {
    // 1. Check if in menu/garage (required state)
    // 2. Create backup
    // 3. Apply via driver
    // 4. Verify success
    // 5. Log to telemetry
  }
}
```

**2. Voice Command Integration**
```typescript
// Example voice intents
"Make the front wing softer" → front_wing -= 1
"Increase rear downforce" → rear_wing += 2
"Set brake bias to 58" → brake_bias = 58
"Add 10 liters of fuel" → fuel_load += 10
"Make the car more stable" → [preset: +rear_wing, -front_wing, +rear_arb]
```

**3. Confirmation UX**
- Before applying, show diff in overlay
- User must confirm (voice "Yes" / "Confirm" or button press)
- Show progress during application
- Notify when complete (requires garage reload/pit)

---

## Risk Mitigation Strategy

### R1: Unknown Checksum (HIGH PRIORITY)

**Plan A:** Continue UI automation path (no checksum needed)  
**Plan B:** Release partial file driver (read-only + limited writes)  
**Plan C:** Community outreach (AMS2 modding forums, Discord)  
**Plan D:** Consider simpler format (JSON export/import if game adds support)

### R2: Savegame Corruption

**Mitigations in Place:**
- Auto-backup before every write
- Atomic writes (temp file → move)
- Validation before accepting changes
- Easy restore UI in GridVox

**Additional:**
- OneDrive versioning as safety net
- Weekly backup to separate location

### R3: UI Updates Breaking Automation

**Mitigations:**
- Version detection (check AMS2 build number)
- Self-test mode (run automation without game changes)
- Fallback to manual mode with instructions
- Community-contributed profiles for new versions

---

## Success Metrics (Next 4 Weeks)

### Week 1 (Nov 3-10)
- [ ] UI automation MVP: 1 parameter change working
- [ ] Tools installed and lab environment ready
- [ ] 10 baseline .vts files captured

### Week 2 (Nov 11-17)
- [ ] UI automation: 5 parameters supported
- [ ] 50+ .vts variants created
- [ ] First parameter mapped in binary structure

### Week 3 (Nov 18-24)
- [ ] UI automation: 90% success rate on test machine
- [ ] 5+ parameters mapped
- [ ] Checksum hypothesis (even if not cracked)

### Week 4 (Nov 25-Dec 1)
- [ ] Decision point: File driver viable? (Y/N)
- [ ] UI driver integrated into GridVox desktop
- [ ] First voice command demo working

---

## Recommended Next Action (Today)

**Start with UI Automation MVP** - this gives fastest feedback and value.

### Step-by-Step:

1. **Install AutoHotkey v2**
2. **Boot AMS2 in windowed 1920x1080**
3. **Record baseline coordinates:**
   - Pause menu position
   - "Setup" button position
   - "Aerodynamics" tab position
   - Front wing slider position
   - Save button position

4. **Write first script:**
```autohotkey
; ams2-setup-demo.ahk
#Requires AutoHotkey v2.0

; Config
GameTitle := "Automobilista 2"
ResolutionCheck := "1920x1080"

; Focus game window
WinActivate(GameTitle)
Sleep(500)

; Open pause menu (ESC key)
Send("{Esc}")
Sleep(1000)

; Navigate to setup (hardcoded coordinates for 1080p)
Click(960, 400)  ; Setup button (EXAMPLE - measure actual position)
Sleep(500)

; Navigate to Aerodynamics tab
Click(300, 200)  ; Aero tab
Sleep(500)

; Increment front wing (click + button)
Click(800, 350)  ; Front wing +
Sleep(200)

; Save setup
Click(960, 900)  ; Save button
Sleep(500)

; Exit menus
Send("{Esc}")
Send("{Esc}")

MsgBox("Setup change applied!")
```

5. **Test and refine coordinates**
6. **Add error handling (window detection, retry logic)**

**Time to first working prototype:** 2-4 hours

---

## Questions to Answer Soon

1. **Which approach should we prioritize?**
   - Recommendation: UI automation first (de-risking)
   - File approach in parallel (long-term goal)

2. **Should we support multiple resolutions in V1?**
   - Recommendation: Start with 1920x1080 only
   - Add 1440p after proving concept

3. **How do we handle OneDrive sync delays?**
   - Test file write → sync → game load timing
   - May need to pause OneDrive sync during session

4. **What's the fallback if UI automation fails?**
   - Manual setup application with GridVox providing guidance
   - Audio cues: "Set front wing to 6 clicks"

---

## Resources & Links

### Tools
- **AutoHotkey v2**: https://www.autohotkey.com/
- **HxD Hex Editor**: https://mh-nexus.de/en/hxd/
- **010 Editor**: https://www.sweetscape.com/010editor/
- **Python struct docs**: https://docs.python.org/3/library/struct.html

### AMS2 Community
- **Official Forums**: https://forum.reizastudios.com/
- **Reddit**: r/automobilista2
- **Discord**: Search for AMS2 modding channels

### Related GridVox Docs
- Phase 0 user stories: `03-planning/GridVox-Phase-0-User-Stories.md`
- Technical architecture: `02-specifications/GridVox-Technical-Architecture.md`

---

## Conclusion

**The subproject is well-documented and ready for execution.**

**Immediate next step:** Build UI automation MVP this week. This will:
- Prove the concept works
- Provide immediate value
- De-risk the file approach
- Give us a working solution while doing reverse engineering

**By end of November:** Should have either working file driver OR robust UI automation integrated into GridVox desktop.

**Long-term vision:** Hybrid approach - use file manipulation where safe (simple params), fall back to UI automation for complex changes or when checksum remains unknown.

