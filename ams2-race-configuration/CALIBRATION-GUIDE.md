# AMS2 Automation Calibration Guide

This guide will help you calibrate the automation by capturing exact screen coordinates for UI elements in AMS2.

## Prerequisites

1. **AMS2 installed and launchable**
2. **Resolution: 1920x1080** (windowed or fullscreen)
3. **Language: English**
4. **AutoHotkey v2 installed** (already done)

## Step-by-Step Calibration

### Phase 1: Launch Coordinate Finder

1. Open the coordinate finder tool:
   ```cmd
   cd C:\DATA\GridVox\gridvox-sim-integration\ams2-race-configuration\src\automation\ahk
   AutoHotkey64.exe coordinate-finder.ahk
   ```

2. You'll see instructions. Keep this tool running in the background.

**Hotkeys:**
- `Ctrl+Shift+C` - Capture coordinate at mouse position
- `Ctrl+Shift+M` - Toggle live mouse position display
- `Ctrl+Shift+S` - Save all captured coordinates
- `Ctrl+Shift+D` - Delete all captured coordinates
- `Ctrl+Shift+Q` - Quit tool
- `Ctrl+Shift+H` - Show help

---

### Phase 2: Launch AMS2

1. **Launch AMS2** from Steam
2. **Set resolution to 1920x1080**
   - Windowed or borderless recommended (easier to switch windows)
3. **Set language to English**
4. **Navigate to main menu**

---

### Phase 3: Capture Main Menu Coordinates

With AMS2 at the **main menu**:

1. **Hover over "Single Player" button**
   - Press `Ctrl+Shift+C`
   - Enter description: `Main Menu - Single Player`

2. **Hover over "Options" or "Settings" button**
   - Press `Ctrl+Shift+C`
   - Enter description: `Main Menu - Options`

3. **Capture any other main menu elements** you see

---

### Phase 4: Navigate to Custom Race

1. **Click "Single Player"** in AMS2
2. **Hover over "Custom Race" or "Race Weekend"**
   - Press `Ctrl+Shift+C`
   - Enter description: `Single Player Menu - Custom Race`

3. **Click "Custom Race"** to enter race configuration screen

---

### Phase 5: Capture Race Configuration Elements

You should now be at the **race configuration screen**. Capture coordinates for:

#### Track Selection
1. **Hover over "Track" or "Circuit" button/tab**
   - `Ctrl+Shift+C` → `Race Config - Track Button`

2. **Click to open track selection**
3. **Hover over first track in list** (e.g., "Interlagos")
   - `Ctrl+Shift+C` → `Track List - First Track`

4. **Hover over track search/filter** (if exists)
   - `Ctrl+Shift+C` → `Track List - Search Box`

5. **Hover over scroll up/down arrows** (if exists)
   - `Ctrl+Shift+C` → `Track List - Scroll Down`

6. **Hover over "Confirm" or "Back" button**
   - `Ctrl+Shift+C` → `Track List - Confirm Button`

#### Car/Class Selection
1. **Navigate back to main race config screen**
2. **Hover over "Car" or "Class" button/tab**
   - `Ctrl+Shift+C` → `Race Config - Car Class Button`

3. **Click to open car selection**
4. **Hover over first car class** (e.g., "GT3")
   - `Ctrl+Shift+C` → `Car List - First Class`

5. **Hover over confirm button**
   - `Ctrl+Shift+C` → `Car List - Confirm Button`

#### Opponents Configuration
1. **Navigate to opponent settings**
2. **Hover over "Opponents" or "AI" button/tab**
   - `Ctrl+Shift+C` → `Race Config - Opponents Button`

3. **Hover over opponent count slider/input**
   - `Ctrl+Shift+C` → `Opponents - Count Input`

4. **Hover over + button** (to increase opponents)
   - `Ctrl+Shift+C` → `Opponents - Increase Button`

5. **Hover over - button** (to decrease opponents)
   - `Ctrl+Shift+C` → `Opponents - Decrease Button`

6. **Hover over AI difficulty dropdown/slider**
   - `Ctrl+Shift+C` → `Opponents - Difficulty Control`

#### Weather Configuration
1. **Navigate to weather/conditions settings**
2. **Hover over "Weather" button/tab**
   - `Ctrl+Shift+C` → `Race Config - Weather Button`

3. **Hover over weather preset dropdown** (Clear, Rain, etc.)
   - `Ctrl+Shift+C` → `Weather - Preset Dropdown`

4. **Hover over first weather option**
   - `Ctrl+Shift+C` → `Weather - Clear Option`

5. **Hover over rain option**
   - `Ctrl+Shift+C` → `Weather - Rain Option`

#### Time of Day
1. **Hover over time of day control**
   - `Ctrl+Shift+C` → `Race Config - Time of Day Control`

2. **Capture specific time options** if visible

#### Session Length
1. **Hover over session length control** (laps or time)
   - `Ctrl+Shift+C` → `Race Config - Session Length Input`

2. **Hover over +/- buttons** for session length
   - `Ctrl+Shift+C` → `Session Length - Increase Button`
   - `Ctrl+Shift+C` → `Session Length - Decrease Button`

#### Save/Start Buttons
1. **Hover over "Save Configuration" button** (if exists)
   - `Ctrl+Shift+C` → `Race Config - Save Button`

2. **Hover over "Start Race" or "Continue" button**
   - `Ctrl+Shift+C` → `Race Config - Start Race Button`

3. **Hover over "Back" or "Cancel" button**
   - `Ctrl+Shift+C` → `Race Config - Back Button`

---

### Phase 6: Save Captured Coordinates

1. **Press `Ctrl+Shift+S`** to save all coordinates
2. File will be saved to:
   ```
   C:\DATA\GridVox\gridvox-sim-integration\ams2-race-configuration\src\automation\config\captured-coordinates.txt
   ```

3. **Open the file** to review coordinates

---

### Phase 7: Update AutoHotkey Script

1. **Open the captured coordinates file**
2. **Copy the AutoHotkey code snippet** at the bottom of the file

3. **Edit the main script**:
   ```cmd
   code C:\DATA\GridVox\gridvox-sim-integration\ams2-race-configuration\src\automation\ahk\ams2-race-config.ahk
   ```

4. **Replace placeholder coordinates** with real ones:

   **Before:**
   ```autohotkey
   Click(960, 400)  ; Setup button (EXAMPLE)
   ```

   **After:**
   ```autohotkey
   global Race_Config_Track_Button_X := 640
   global Race_Config_Track_Button_Y := 350

   Click(Race_Config_Track_Button_X, Race_Config_Track_Button_Y)
   ```

5. **Update all navigation functions** with real coordinates

---

## Expected Coordinate Count

You should capture approximately **20-30 coordinates** covering:
- ✅ Main menu navigation (2-3)
- ✅ Race config screen entry (2-3)
- ✅ Track selection (5-7)
- ✅ Car class selection (3-5)
- ✅ Opponent configuration (4-6)
- ✅ Weather configuration (3-5)
- ✅ Session controls (3-5)
- ✅ Save/start buttons (2-3)

---

## Testing After Calibration

1. **Test single run**:
   ```cmd
   cd src/automation/node
   node index.js
   ```

2. **Watch the automation**:
   - Does it click the right buttons?
   - Are navigation paths correct?
   - Does it reach the configuration screen?

3. **Check logs**:
   ```cmd
   type ..\logs\2025-11-03.log
   ```

4. **If clicks miss targets**:
   - Recapture that specific coordinate
   - Check if UI elements moved after menu change
   - Increase delays if UI is slow to respond

---

## Troubleshooting Calibration

### Coordinates Seem Wrong
- **Ensure exact resolution**: 1920x1080
- **Check window mode**: Fullscreen vs windowed may have different coordinates
- **Verify mouse position**: Use `Ctrl+Shift+M` to see live coordinates

### UI Elements Not Found
- **Menu structure changed**: AMS2 may have updated UI
- **Different game mode**: Custom Race vs Career may have different menus
- **Language mismatch**: Ensure English UI

### Automation Clicks Wrong Place
- **Window not focused**: Script must activate AMS2 window first
- **Timing issues**: Increase delays between clicks
- **UI animation**: Wait for menu transitions to complete

---

## Next Steps After Calibration

1. ✅ **Test single configuration** - Verify one full cycle works
2. ✅ **Refine timing** - Adjust delays for your system speed
3. ✅ **Add error recovery** - Handle unexpected dialogs
4. ✅ **Run batch test** - Test 5 configurations automatically
5. ✅ **Document success rate** - Aim for ≥90%

---

## Quick Reference: Capture Workflow

```
1. Launch coordinate-finder.ahk
2. Launch AMS2 (1920x1080, English)
3. Navigate to race config screen
4. Hover + Ctrl+Shift+C on each UI element
5. Ctrl+Shift+S to save
6. Update ams2-race-config.ahk with coordinates
7. Test with: node index.js
```

---

## Support

If you encounter issues:
1. Check logs in `src/automation/logs/`
2. Review screenshots in `src/automation/screenshots/`
3. Refer to main documentation in `docs/`
4. Report issues with screenshots + log excerpts

---

**Ready to start calibration?**

1. Run: `AutoHotkey64.exe coordinate-finder.ahk`
2. Launch AMS2
3. Start capturing coordinates!
