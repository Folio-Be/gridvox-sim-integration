# AMS2 Hex Edit Test Results

**Date:** November 5, 2025
**Test:** Can we manually edit hex bytes in save files to change car selection?
**Result:** ❌ **Not viable with current approach**

## Test Summary

### What We Tested

Captured 5 clean car selection snapshots in controlled conditions:
1. **Mercedes** (baseline)
2. **Audi**
3. **McLaren**
4. **Porsche**
5. **Nissan**

Each snapshot taken immediately after exiting setup screen (same save trigger point).

### Results

| Comparison | File Size | Bytes Changed | Percentage |
|------------|-----------|---------------|------------|
| Mercedes → Audi | 7,340,032 | 144,281 | 1.97% |
| Audi → McLaren | 7,340,032 | 91,511 | 1.25% |
| McLaren → Porsche | 7,340,032 | ~90,000 (est) | ~1.23% |

### Key Findings

1. **Too many changes**: 90,000-145,000 bytes change per car selection
2. **No readable strings**: Car names not stored in plain text
3. **Scattered changes**: Differences across entire 7.3 MB file
4. **Cyclic patterns**: Some bytes revert to previous values (suggests timestamps/checksums)
5. **Custom binary format**: No standard compression headers detected

## Why So Many Changes?

The AMS2 save file appears to have:

### 1. Timestamps Throughout File
- Offsets 16-31 show time-based changes
- Values cycle between saves even seconds apart
- Can't isolate car selection from timestamp noise

### 2. Session State / Random Data
- Potentially includes:
  - Physics state
  - RNG seeds
  - Session IDs
  - Performance metrics

### 3. Checksums/Validation
- File likely validates integrity
- Changing car selection cascades through checksums
- Would need to reverse engineer checksum algorithm

### 4. Custom Binary Format
- No standard compression (checked for gzip, zlib, zip headers)
- High entropy data (random-looking)
- Possibly custom compression or encoding
- Car selection stored as IDs, not readable strings

## Attempts Made

### ✅ What Worked
- Created hex diff analyzer tool
- Captured clean, controlled snapshots
- Minimal time between comparisons (<30 seconds)
- Only changed one setting (car selection)

### ❌ What Didn't Work
- Too much noise from timestamps/checksums
- Can't identify which bytes = car selection
- File format too complex to manually patch
- No readable car names to search for

## Technical Analysis

### File Header (first 32 bytes)
```
00000000: 4044 9489 a53d 6714 3cbd f59d 4ba6 a47a  @D...=g.<...K..z
00000010: 0b62 f65c 3c03 56a7 db36 5dee 157c 0bce  .b.\<.V..6]..|..
```

- Starts with `40 44` (not standard magic bytes)
- High entropy data (looks random)
- Custom AMS2/Madness Engine format

### Change Patterns

**Offset 16-31** (likely timestamp or checksum):
```
Mercedes: 0b 62 f6 5c 3c 03 56 a7 db 36 5d ee 15 7c 0b ce
Audi:     7a 26 f8 68 d6 42 6a 36 e4 8b c3 7d ed d2 99 42
McLaren:  0b 62 f6 5c 3c 03 56 a7 db 36 5d ee 15 7c 0b ce (same as Mercedes!)
```

Notice McLaren values **match Mercedes** - suggests time-based cycling, not car data.

## Conclusion

**Direct hex editing of AMS2 save files is impractical** due to:
- Extensive checksums/timestamps (1-2% of file changes)
- Custom binary format
- No isolated car selection bytes
- Would need full reverse engineering of save format

## Alternative Approaches

### Option 1: Memory Editing ⚡ (Recommended)
**How:** Read/write AMS2 process memory while game is running

**Pros:**
- Bypass save file format entirely
- No checksum/timestamp issues
- Real-time changes
- Can observe immediate effect

**Tools:**
- Cheat Engine (search for car ID values)
- WinAPI ReadProcessMemory/WriteProcessMemory
- Custom memory scanner

**Steps:**
1. Start AMS2 with Mercedes selected
2. Attach memory scanner to AMS2 process
3. Search for value that changes when switching cars
4. Narrow down to car selection variable
5. Modify value, observe if car changes

### Option 2: UI Automation 🖱️ (Already Explored)
**How:** Simulate mouse clicks and keyboard input

**Pros:**
- Works regardless of file format
- No reverse engineering needed
- Reliable if UI doesn't change

**Cons:**
- Slow (UI navigation delays)
- Brittle if UI changes
- Requires game windowed or has focus

**Status:** Already have partial implementation in ams2-race-configuration

### Option 3: Contact Reiza for API/SDK 📧
**How:** Request official configuration API

**Pros:**
- Clean, supported approach
- No hacks/workarounds
- Future-proof

**Cons:**
- May not exist
- May be rejected
- Long timeline

**Next step:** Email Reiza support asking if mod API exists

### Option 4: SimHub Integration 🔌
**How:** Use SimHub's existing AMS2 integration

**Pros:**
- Already connects to AMS2
- Has telemetry access
- Active development

**Cons:**
- May not expose car/track configuration
- Need to check SimHub API docs

**Next step:** Research if SimHub can trigger race config changes

### Option 5: Deep Save Format Reverse Engineering 🔬
**How:** Full analysis of save file structure

**Effort:** Very high (weeks/months)

**Would need:**
- Reverse engineer checksum algorithm
- Map all data structures
- Understand compression if any
- Handle version changes

**Only worth it if:** No other options work

## Recommendation

**Proceed with Option 1: Memory Editing**

**Why:**
1. Fastest to test (~1-2 hours)
2. Bypasses all save file complexity
3. Clean detection of car selection variable
4. Can extend to track, weather, AI settings

**Next Steps:**
1. Download Cheat Engine (free memory scanner)
2. Start AMS2, select Mercedes
3. Attach Cheat Engine to AMS2
4. Search for unknown value
5. Change to Audi in AMS2
6. Search for "changed value"
7. Repeat until 1-5 addresses remain
8. Test changing those addresses
9. If it works, document memory offsets
10. Create memory patcher tool for SimVox.ai

## Files Created

- `hex-diff.js` - Byte-level comparison tool ✅
- `test-clean-comparison.bat` - Snapshot helper ✅
- `watcher.js` - Keyboard-only annotation watcher ✅
- `CLEAN-TEST-GUIDE.md` - Testing procedure ✅
- `HEX-EDIT-FINDINGS.md` - Initial analysis ✅
- `HEX-EDIT-TEST-RESULTS.md` - This document ✅

## Snapshots Captured

All in `snapshots/` directory:
- `1762363805154_default.sav` - Mercedes baseline
- `1762363834185_default.sav` - Audi
- `1762363854658_default.sav` - McLaren
- `1762363873309_default.sav` - Porsche
- `1762363897152_default.sav` - Nissan

Total: 36.7 MB of test data captured

## Lessons Learned

1. **Not all save files are hex-editable** - modern games use checksums
2. **Clean test data still had noise** - timestamps embedded throughout
3. **Memory editing > file editing** for live games
4. **Always check for readable strings first** - if car names in plain text, file would be easier
5. **1-2% file change is too much** - need <0.01% for practical hex editing

## Time Spent

- Tool development: ~1 hour
- Testing/data capture: ~30 minutes
- Analysis: ~1 hour
- **Total: ~2.5 hours**

Worth it to definitively rule out this approach and confirm memory editing is the way forward.

---

**Status:** Hex editing approach **abandoned** ❌
**Next:** Memory editing with Cheat Engine 🎯
