# AMS2 Savegame Reverse Engineering Tool

**Created:** November 4, 2025
**Purpose:** Watch AMS2 save files + voice annotation for rapid reverse engineering

## Concept

Instead of UI automation, this tool:
1. Watches AMS2 save directory for file changes
2. Beeps when changes detected
3. **NEW**: You speak (or type) what you just did in AMS2
4. Links your actions to specific file changes
5. Analyzes patterns to reverse engineer file formats

## 🎤 NEW: Voice Annotation Input

**No more focus loss issues!** The tool now supports voice input, so you can speak your annotations instead of typing. This prevents AMS2 from losing focus and creating spurious 0-byte save file changes.

**Quick Start:**
- See [VOICE_SETUP.md](./VOICE_SETUP.md) for full setup instructions
- Requires: Node packages (auto-installed) + SoX + Vosk speech model
- Works completely offline, no API keys needed!
- Automatic fallback to keyboard if voice unavailable

## Quick Start

```bash
cd C:\DATA\GridVox\gridvox-sim-integration\savegame-reverse-engineering

# Start watcher
npm run watch

# In another terminal, run analyzer when ready
npm run analyze
```

## Workflow

1. **Start watcher:** `npm run watch`
2. **Go to AMS2** and do ONE action (e.g., select a track)
3. **Hear BEEP** → return to terminal
4. **Type annotation** → what you just did
5. **Press ENTER** → annotation saved
6. **Repeat** for each action
7. **Run analyzer:** `npm run analyze` → generates report

## File Structure

```
savegame-reverse-engineering/
├── watcher.js              # File watcher with beep + annotation
├── analyzer.js             # Byte-level diff analyzer
├── package.json
├── README.md               # This file
├── annotations.log         # Human-readable log of changes
├── snapshots/              # File snapshots at each change
│   └── [timestamp]_[filename].sav
└── analysis-report.md      # Generated analysis report
```

## How It Works

### Watcher (watcher.js)

- Monitors: `C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame`
- On file change:
  1. Beeps (console beep `\x07`)
  2. Saves snapshot with timestamp
  3. Logs to `annotations.log`
  4. Prompts for annotation
  5. Updates log with your annotation

### Annotations Log Format

```
Timestamp | Filename | Snapshot | Annotation
────────────────────────────────────────────────────────────────
2025-11-04T08:12:48.549Z | default.localsettings.v1.03.sav | 1762243968548_default.localsettings.v1.03.sav | chose a bmw
2025-11-04T08:13:26.882Z | default.localsettings.v1.03.sav | 1762244006881_default.localsettings.v1.03.sav | chose a merc
```

### Analyzer (analyzer.js)

Processes `annotations.log` and snapshots:
1. Groups changes by category (car, track, weather, etc.)
2. Compares consecutive snapshots byte-by-byte
3. Identifies changed bytes and offsets
4. Generates markdown report with:
   - Byte change tables
   - Hex context
   - Pattern analysis
   - File modification summary

## Current Findings

**Session 1 (Nov 4, 2025):**
- **Car selection** modifies `default.localsettings.v1.03.sav` (1944 bytes)
- Tested: BMW → Merc
- Files captured, need more distinct changes to analyze

**Files that change most:**
- `default.localsettings.v1.03.sav` - Settings/preferences
- `default.sav` - Main save (7.3 MB)
- `default.controllersettings.v1.03.sav` - Controls
- `default.championshipeditor.v1.00.sav` - Championship data

## Tips for Effective Reverse Engineering

1. **Do ONE thing at a time** - change only one setting
2. **Be specific** - "selected Interlagos track" not "chose track"
3. **Test extremes** - min/max values, first/last options
4. **Repeat actions** - verify patterns
5. **Group similar tests** - all tracks, then all cars, etc.

## Example Session

```bash
# Terminal 1: Start watcher
npm run watch

# You see:
🔍 AMS2 Savegame Watcher Starting...
📁 Watching: C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame
📝 Annotations: annotations.log
📸 Snapshots: snapshots/
✅ Watcher active!

# Go to AMS2, select Interlagos track
# [BEEP] Return to terminal

# Type: selected Interlagos track
# Press ENTER

# Go to AMS2, select Monza track
# [BEEP] Return to terminal

# Type: selected Monza track
# Press ENTER

# Ctrl+C to stop watcher

# Terminal 2: Analyze
npm run analyze

# Generates: analysis-report.md with byte diffs
```

## Output: Analysis Report

`analysis-report.md` contains:

- **Category grouping** (car_selection, track_selection, etc.)
- **Byte-by-byte comparisons** between actions
- **Change tables** with offsets and hex values
- **Hex context** showing surrounding bytes
- **File modification summary**

Example output:
```markdown
### selected Interlagos track → selected Monza track

**File:** `default.localsettings.v1.03.sav`
**Bytes changed:** 8

| Offset | Offset (Hex) | Before | After | Before (Hex) | After (Hex) |
|--------|--------------|--------|-------|--------------|-------------|
| 245    | 0x00F5       | 18     | 32    | 0x12         | 0x20        |
| 246    | 0x00F6       | 56     | 91    | 0x38         | 0x5B        |
...
```

## Next Steps

1. **More testing needed:**
   - Track selection (all tracks)
   - Weather settings
   - Time of day
   - AI difficulty
   - Race length

2. **Compare patterns:**
   - Find consistent offsets for track IDs
   - Map values to settings
   - Build lookup tables

3. **Create config writer:**
   - Once patterns found, write tool to modify saves directly
   - Integrate with GridVox

## Advantages vs UI Automation

- **Faster:** No UI interaction delays
- **More reliable:** No UI element detection needed
- **Better data:** See actual file changes
- **Reversible:** Can examine any past change
- **Portable:** Works if UI changes

## Files

- **watcher.js** - Main file watcher (savegame-reverse-engineering/watcher.js:1)
- **analyzer.js** - Byte diff analyzer (savegame-reverse-engineering/analyzer.js:1)
- **annotations.log** - Change log
- **snapshots/** - File versions
- **analysis-report.md** - Generated analysis

## Configuration

Edit `watcher.js` to change:
- `SAVEGAME_PATH` - Where AMS2 saves files
- `LOG_FILE` - Annotations log location
- `SNAPSHOTS_DIR` - Snapshot storage location

## Requirements

- Node.js
- npm packages: `chokidar` (already installed)
- AMS2 running

## Troubleshooting

**No beep sound?**
- Check terminal volume
- Try different terminal (cmd vs PowerShell vs Windows Terminal)

**Watcher not detecting changes?**
- Verify path: `C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame`
- Check AMS2 is actually writing files
- Try changing a setting in AMS2

**Analysis shows 0 bytes changed?**
- Files might be identical (AMS2 didn't write anything)
- Try more drastic changes
- Check snapshots exist: `ls snapshots/`

## Status

✅ Watcher working
✅ Annotations logging
✅ Snapshots saving
✅ Analyzer functional
⏳ Need more test data for patterns

**Last session:** November 4, 2025
**Actions tested:** Car selection (BMW, Merc)
**Files captured:** ~30 snapshots
