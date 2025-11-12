# Cheat Engine Session Log - AMS2 Car Selection

**Date:** November 5, 2025
**Goal:** Find memory address for car selection in AMS2
**Status:** ⏸️ In Progress - Resume Tomorrow

---

## Session Summary

### What We Accomplished
- ✅ Installed and configured Cheat Engine
- ✅ Successfully attached to AMS2.exe process
- ✅ Tested multiple scan strategies
- ✅ Narrowed addresses significantly (millions → thousands)
- ⏸️ Need final filtering to get to testable range (<100 addresses)

### Current Best Result
**1,252 addresses** using:
- **Value Type:** 4 Bytes
- **Initial Scan:** Value between 0-100
- **Method:** 15+ "Changed value" scans across different cars
- **Conclusion:** This is the most promising approach

---

## Scan Strategies Tested

### ❌ Strategy 1: Unknown Initial Value (Failed)
**Settings:**
- Value Type: 4 Bytes
- Scan Type: Unknown initial value

**Result:**
- First scan: 2,557,325,312 addresses (2.5 billion)
- Problem: Addresses didn't display in Cheat Engine
- Changed value scans kept returning exact same count
- **Conclusion:** Too broad, not viable

### ✅ Strategy 2: Value Between 0-100 with 4 Bytes (Best)
**Settings:**
- Value Type: 4 Bytes
- Scan Type: Value between 0-100
- Method: Changed value after each car selection

**Results:**
| Iteration | Car Change | Addresses Remaining |
|-----------|------------|---------------------|
| Initial | - | 11,793,050 |
| 1 | McLaren → BMW | 52,501 |
| 2 | BMW → Porsche | 22,444 |
| 3 | Porsche → ? | 16,988 |
| 4-15 | Various | **1,982** |
| Final | Multiple cycles | **1,252** (lowest) |

**Conclusion:** 4 Bytes is correct, but need further filtering

### ❌ Strategy 3: 2 Bytes (Worse)
**Settings:**
- Value Type: 2 Bytes
- Scan Type: Value between 0-50

**Result:**
- After 20 car changes: 5,566 addresses
- **Worse than 4 Bytes approach**
- **Conclusion:** Car ID likely stored as 4-byte integer, not 2-byte

---

## Technical Insights

### Why So Many Addresses Remain?

1. **Volatile Memory:** Timers, counters, frame counters change constantly
2. **Related Variables:** UI state, selection indices, cached values
3. **Duplicate Storage:** Car ID might be stored in multiple places (current, previous, display)

### What Car ID Probably Is
- **Type:** 4-byte integer (int32)
- **Range:** 0-100 (assuming 100+ cars in game)
- **Location:** Part of larger race configuration struct

---

## Next Steps (Resume Tomorrow)

### Recommended Approach: "Unchanged Value" Filter

This will eliminate volatile memory (timers, counters) that change even without user input.

**Steps:**

1. **Start Fresh Scan (4 Bytes)**
   - Value Type: 4 Bytes
   - Scan Type: Value between 0-100
   - First Scan

2. **Narrow with Car Changes (3-5 iterations)**
   - Change car in AMS2
   - Scan Type: Changed value
   - Next Scan
   - Repeat until ~2,000-5,000 addresses

3. **Filter Volatile Memory (NEW TECHNIQUE)**
   - **DON'T touch AMS2** (leave car selected)
   - Wait 10 seconds
   - Scan Type: **Unchanged value**
   - Next Scan
   - **Repeat 3-4 times** (wait → Unchanged value scan)
   - This should eliminate counters/timers

4. **Final Car Change Test**
   - Change car in AMS2
   - Scan Type: Changed value
   - Next Scan
   - **Goal:** Get below 100 addresses

5. **Manual Testing Phase**
   - Select all remaining addresses
   - Add to address list (bottom panel)
   - Test addresses in batches:
     - Select 10 addresses
     - Note their current values
     - Double-click one value → change it
     - Check if car changes in AMS2
   - Repeat until car address found

---

## Alternative Approaches (If Above Fails)

### Option A: Pointer Scan
If we find the address but it changes after game restart:
1. Right-click working address
2. "Pointer scan for this address"
3. Save results
4. Restart AMS2
5. Re-scan to find stable pointer path

### Option B: Batch Freeze Testing
With 1,252 addresses:
1. Add all to address list
2. Freeze addresses 1-100 (check the "Active" checkbox)
3. Try changing car in AMS2
4. If car won't change → one of these 100 is correct
5. Narrow down by testing smaller batches

### Option C: String Search
AMS2 might store car names alongside IDs:
1. Scan Type: String
2. Search for car name (e.g., "McLaren")
3. Find string address
4. Car ID likely stored nearby (+/- 16 bytes)

---

## Session Statistics

- **Time Spent:** ~2 hours
- **Scan Iterations:** 40+ total
- **Strategies Tested:** 3 (Unknown, 4 Bytes, 2 Bytes)
- **Best Result:** 1,252 addresses (4 Bytes, 0-100 range)
- **Cars Tested:** McLaren, BMW, Porsche, Mercedes, Audi, Nissan, + more

---

## Important Notes

### AMS2 Must Be:
- ✅ Running
- ✅ In "Single Race" → "Setup" screen
- ✅ NOT in race (setup screen only)
- ✅ Process attached to Cheat Engine

### Cheat Engine Settings:
- Scan Type: **4 Bytes** (proven best)
- Initial Range: **0-100** (car IDs likely in this range)
- Method: **Changed value** after car changes
- Filter: **Unchanged value** to eliminate volatile memory (tomorrow's task)

### Why This Matters
Once we find car selection address:
1. **Other parameters nearby** (track, weather likely +4, +8, +12 bytes offset)
2. **Only need 3-6 parameters** for SimVox.ai (not all 200)
3. **Pointer scan reveals base struct** (access to all config at once)
4. **One-time effort** - document and build tool, users won't need Cheat Engine

---

## Files & Documentation

### Created Documents:
- `cheat-engine-guide.md` - Step-by-step tutorial ✅
- `README.md` - Full memory editing approach ✅
- `CHEAT-ENGINE-SESSION-LOG.md` - This document ✅

### Related Files:
- `C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\savegame-reverse-engineering\`
  - `HEX-EDIT-TEST-RESULTS.md` - Why hex editing failed
  - `hex-diff.js` - Hex comparison tool
  - `watcher.js` - Save file snapshot tool

---

## Quick Resume Checklist (Tomorrow)

- [ ] Start AMS2
- [ ] Navigate to Single Race → Setup screen
- [ ] Open Cheat Engine
- [ ] Attach to AMS2.exe
- [ ] Follow "Next Steps" section above
- [ ] Start with "Unchanged value" filtering technique
- [ ] Goal: Get to <100 addresses for manual testing

**Estimated Time:** 30-60 minutes to complete

---

## Questions to Answer Tomorrow

1. ✅ Does "Unchanged value" filter work to eliminate volatile memory?
2. ❓ Can we get below 100 addresses for testing?
3. ❓ Does changing an address value actually change the car in AMS2?
4. ❓ Are track/weather addresses nearby (same struct)?
5. ❓ Does address persist across game restarts (or need pointer scan)?

---

**Status:** Ready to resume tomorrow with "Unchanged value" filtering approach.

**Expected Outcome:** Find working car selection address within 1 hour.
