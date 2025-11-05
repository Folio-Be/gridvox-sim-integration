# Cheat Engine Guide - Finding AMS2 Memory Addresses

**Goal:** Find memory addresses for car/track/weather selection

**Time:** 1-2 hours

**Required:** Cheat Engine (download from https://cheatengine.org/)

---

## Setup

### 1. Download & Install Cheat Engine

1. Go to https://cheatengine.org/downloads.php
2. Download latest version (7.5+)
3. Install (default options are fine)
4. ⚠️ **During install:** Decline any bundled software offers

### 2. Start AMS2

1. Launch Automobilista 2
2. Navigate to **Single Race** → **Setup**
3. Note the currently selected car (e.g., Mercedes-AMG GT3)
4. **Don't start the race yet** - stay in setup screen

### 3. Attach Cheat Engine to AMS2

1. Open Cheat Engine
2. Click the **computer icon** (top left) - "Open Process"
3. Find **AMS2.exe** in the process list
4. Click **Open**

You should see "AMS2.exe" in the title bar.

---

## Phase 1: Find Car Selection Address

### Step 1: Initial Scan

Currently selected car: **Mercedes-AMG GT3**

1. In Cheat Engine:
   - **Value Type:** Select `4 Bytes` (car ID likely an integer)
   - **Scan Type:** Select `Unknown initial value`
   - Click **First Scan** button

You'll see millions of addresses appear in the left panel. This is normal!

### Step 2: Change Car in AMS2

1. **Alt-Tab to AMS2**
2. Change car to **Audi R8 LMS GT3** (or any different car)
3. **Don't exit setup screen** - just change the car
4. **Alt-Tab back to Cheat Engine**

### Step 3: Changed Value Scan

1. In Cheat Engine:
   - **Scan Type:** Select `Changed value`
   - Click **Next Scan**

The address list should shrink significantly (thousands or hundreds).

### Step 4: Repeat Until Narrow

Repeat steps 2-3 several times with different cars:

**Iteration 2:**
- Change to **McLaren 720S GT3** in AMS2
- `Changed value` scan in Cheat Engine

**Iteration 3:**
- Change to **Porsche 911 GT3 R** in AMS2
- `Changed value` scan

**Iteration 4:**
- Change to **BMW M4 GT3** in AMS2
- `Changed value` scan

**Goal:** Get down to **1-10 addresses**

### Step 5: Test Addresses

Once you have 1-10 addresses:

1. **Select all addresses** in the left panel
2. Right-click → **Add selected addresses to the address list**
3. They appear in the bottom panel

For each address in the bottom panel:

1. **Double-click the value** to edit it
2. Enter a different number (e.g., if it's 5, try 6)
3. **Alt-Tab to AMS2** - did the car change?
4. If yes: **This is the car selection address!** 🎉
5. If no: Try the next address

### Step 6: Map Car IDs

Once you find the working address, map all cars:

1. In AMS2, select each car one by one
2. Note the value in Cheat Engine
3. Create a mapping table:

```
Value | Car Name
------|------------------
1     | Mercedes-AMG GT3
2     | Audi R8 LMS GT3
3     | McLaren 720S GT3
4     | Porsche 911 GT3 R
5     | BMW M4 GT3
6     | Nissan GT-R GT3
...   | ...
```

### Step 7: Document Address

1. Right-click the address → **Pointer scan for this address**
2. Save the pointer scan results
3. Or note the raw address (e.g., `0x12AB5678`)
4. Check if it's a **static address** or needs **base + offset** calculation

**Save to:** `memory-addresses.json`

---

## Phase 2: Find Track Selection Address

**Same process as car selection!**

### Process

1. **New Scan** in Cheat Engine
2. Note current track (e.g., Monza)
3. `Unknown initial value` scan
4. Change to different track (e.g., Spa) in AMS2
5. `Changed value` scan
6. Repeat 3-5 times
7. Test addresses
8. Map track IDs

### Expected Result

```
Value | Track Name
------|------------------
1     | Monza
2     | Spa-Francorchamps
3     | Interlagos
4     | Silverstone
...   | ...
```

---

## Phase 3: Find Weather Selection

**Same process!**

### Settings to Find

- **Weather** (Clear, Cloudy, Rain, etc.)
- **Time of Day** (Morning, Noon, Afternoon, etc.)
- **AI Difficulty** (0-100 slider)
- **Race Length** (laps or minutes)

### Tips

- **Weather:** Likely a small integer (1=Clear, 2=Cloudy, etc.)
- **Time:** Might be integer or float (hours since midnight?)
- **AI Difficulty:** Likely 0-100 integer
- **Race Length:** Integer (laps) or float (minutes)

---

## Common Issues & Solutions

### Issue 1: Too Many Addresses Remain

**Problem:** After 5+ scans, still have 100+ addresses

**Solutions:**
1. Try `Value Type: 2 Bytes` instead of 4 Bytes
2. Or try `Float` or `Double` if setting uses decimals
3. Change value more dramatically (e.g., first car → last car in list)
4. Try `Unchanged value` scan between changes (eliminates volatile memory)

### Issue 2: Addresses Reset to 0 After Game Restart

**Problem:** Address works during session, but resets after relaunch

**Solution:**
- Address is **dynamic** (allocated at runtime)
- Need to do **Pointer Scan** to find base + offset
- Or re-scan addresses each time (less ideal)

### Issue 3: Can't Change Value (Access Denied)

**Problem:** Cheat Engine can't write to memory

**Solutions:**
1. Run Cheat Engine as **Administrator**
2. Disable anti-virus temporarily (might block memory writes)
3. AMS2 might have protection (unlikely for single-player game)

### Issue 4: Value Changes But Nothing Happens in Game

**Problem:** Changed memory value, but car/track doesn't change

**Possible reasons:**
1. Wrong address (found wrong variable)
2. Need to trigger UI refresh (exit and re-enter setup screen)
3. Value is read-only display (actual value stored elsewhere)

**Solution:** Try another address from the list

---

## Advanced: Pointer Scanning

If addresses change after game restart, use pointer scanning:

### Why Pointers?

- **Static addresses:** Fixed location (easy to use)
- **Dynamic addresses:** Allocated at runtime (change each launch)
- **Pointers:** Find the base address + offset (works across restarts)

### Process

1. Find the dynamic address (using normal scanning)
2. Right-click → **Pointer scan for this address**
3. Cheat Engine scans for pointers to this address
4. Save results
5. Restart game
6. Re-scan with new address
7. Compare pointer scan results
8. Find matching pointers (these are stable!)

### Result

Instead of: `0x12AB5678` (changes each run)

You get: `AMS2.exe + 0x01234567 → +0x10 → +0x20` (stable!)

---

## Saving Your Work

### Create Memory Map File

`memory-addresses.json`:
```json
{
  "ams2_version": "1.5.8.0",
  "addresses": {
    "car_selection": {
      "address": "AMS2.exe+0x01234567",
      "type": "int32",
      "description": "Current selected car ID",
      "values": {
        "1": "Mercedes-AMG GT3",
        "2": "Audi R8 LMS GT3",
        "3": "McLaren 720S GT3"
      }
    },
    "track_selection": {
      "address": "AMS2.exe+0x02345678",
      "type": "int32",
      "description": "Current selected track ID",
      "values": {
        "1": "Monza",
        "2": "Spa-Francorchamps"
      }
    },
    "weather": {
      "address": "AMS2.exe+0x03456789",
      "type": "int32",
      "values": {
        "0": "Clear",
        "1": "Cloudy",
        "2": "Light Rain",
        "3": "Heavy Rain"
      }
    }
  }
}
```

---

## Next Steps

Once addresses are found:

1. ✅ Document all addresses in `memory-addresses.json`
2. ✅ Verify addresses work across game sessions
3. ✅ Map all car/track/weather values
4. → **Phase 2:** Build custom memory tool (no Cheat Engine needed)
5. → **Phase 3:** Integrate with GridVox

---

## Quick Reference Commands

| Action | Cheat Engine Steps |
|--------|-------------------|
| New scan | `Scan Type: Unknown initial value` → `First Scan` |
| After change | `Scan Type: Changed value` → `Next Scan` |
| Add to list | Right-click addresses → `Add selected addresses` |
| Test value | Double-click value in bottom panel → Enter new number |
| Pointer scan | Right-click address → `Pointer scan for this address` |

---

## Time Estimates

| Task | Time |
|------|------|
| Install Cheat Engine | 5 minutes |
| Find car selection | 20-40 minutes |
| Map all cars | 15 minutes |
| Find track selection | 20-30 minutes |
| Map all tracks | 20 minutes |
| Find weather/time/AI | 15-20 minutes each |
| Pointer scanning (if needed) | 30-60 minutes |
| **Total** | **2-4 hours** |

---

## Resources

- **Cheat Engine Tutorial:** https://cheatengine.org/tutorial.php
- **Pointer Scanning Guide:** https://guidedhacking.com/threads/how-to-find-pointers-using-cheat-engine.11384/
- **Video Tutorial:** Search YouTube for "Cheat Engine pointer scan tutorial"

---

**Ready to start?** Download Cheat Engine and follow Step 1!
