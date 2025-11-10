# AMS2 Hex Edit Testing - Initial Findings

**Date:** November 5, 2025
**Goal:** Test if we can manually edit hex values in AMS2 save files to change car selection

## Summary

**Short answer:** Possible, but existing test data is too noisy. Need cleaner before/after snapshots.

## What We Did

1. ✅ Created `hex-diff.js` - byte-level file comparison tool
2. ✅ Compared existing BMW vs Mercedes snapshots
3. ✅ Found **217,006 byte differences** (3% of 7.3 MB file)
4. ✅ Identified problem: too many changes to isolate car selection

## The Problem: Noisy Data

### Existing Snapshots
- **BMW snapshot:** `1762243965233_default.sav` (7.3 MB)
- **Mercedes snapshot:** `1762244000265_default.sav` (7.3 MB)
- **Differences:** 217,006 bytes changed

### Why So Many Changes?

The save file likely contains:

1. **Timestamps** - Updated every save (8-16 bytes scattered throughout)
2. **Session IDs** - Random data that changes per session
3. **Checksums/Hashes** - Recalculated when file changes (CRC32, MD5, SHA1)
4. **Compressed data** - Small changes become large after compression
5. **Encrypted sections** - Randomized data
6. **Floating point precision** - Physics state, car positions, etc.

### Example Difference Clusters

Looking at the diff output, changes appear in large blocks:

- Offsets 16-31: 16 bytes changed (possible timestamp/checksum)
- Offsets 13232-13247: 16 bytes changed
- Offsets 112496-112527: 32 bytes changed
- Offsets 117024-117159: 136 bytes changed

This pattern suggests:
- Not just car ID changes
- Possibly many interrelated fields
- Checksum/timestamp contamination

## Can We Still Hex Edit?

**YES - but we need cleaner test data.**

### What Would Good Test Data Look Like?

```
🔍 Differences Found: 4-20

| Offset | Before | After |
|--------|--------|-------|
| 1234   | 0x05   | 0x12  |  ← Possible car ID
| 1235   | 0x00   | 0x00  |  ← Padding
| 5678   | 0xAB   | 0xCD  |  ← Possible checksum
```

With only a few bytes changed, we could:
1. Identify which byte is the car ID
2. Test if changing just that byte works
3. Handle checksums if needed

## Next Steps

### 1. Capture Clean Test Data (Required)

Use the provided helper script:
```bash
test-clean-comparison.bat
```

**Process:**
1. Close AMS2
2. Run script, capture BEFORE snapshot (e.g., BMW)
3. Open AMS2, select different car (e.g., Mercedes)
4. Exit AMS2 properly (let it save)
5. Run script, capture AFTER snapshot
6. Run script, compare snapshots

**Key:** Only change ONE thing (car selection), nothing else.

### 2. Alternative Tests (If Car Selection Too Noisy)

Try simpler settings that might have fewer side effects:

#### Track Selection
- Select Monza → Save → Compare
- Select Interlagos → Save → Compare
- Tracks might have simpler IDs than cars

#### AI Difficulty
- Set to 50 → Save
- Set to 60 → Save
- Probably just one integer value

#### Graphics Settings
- Quality: Low → High
- Might be a single enum value

### 3. Analyze Results

**If <100 byte changes:**
- ✅ Proceed with hex editing approach
- Create patcher script
- Test if AMS2 accepts changes
- Map all car/track IDs

**If 1,000-10,000 changes:**
- ⚠️ Checksums or timestamps present
- Need to identify checksum algorithm
- May be able to recalculate checksums
- More complex but doable

**If 100,000+ changes:**
- ❌ File is compressed/encrypted or heavily structured
- Hex editing impractical
- Consider alternatives:
  - Memory editing (read/write process RAM)
  - UI automation (simulate user clicks)
  - Official API/SDK (if Reiza provides one)

## File Analysis Tools

### Check for Compression

```bash
# Check file header
xxd default.sav | head -20

# Look for magic bytes:
# 1f 8b       = gzip
# 50 4b       = zip
# 78 9c/78 da = zlib
# 42 5a       = bzip2
```

### Check for Encryption

```bash
# If first 100 bytes look random, might be encrypted
xxd default.sav | head -10

# High entropy = encrypted/compressed
# Low entropy = uncompressed plaintext
```

### Search for Readable Strings

```bash
strings default.sav | grep -i "bmw\|mercedes\|track\|car"

# If you find car names, file is not encrypted
# Note their offsets for comparison
```

## Tools Created

### 1. hex-diff.js

**Purpose:** Compare two binary files byte-by-byte

**Usage:**
```bash
node hex-diff.js file1.sav file2.sav Label1 Label2
```

**Output:**
- Difference count
- Offset table with before/after values
- Hex context for first 10 differences
- Patch data array (for automated patching)

### 2. test-clean-comparison.bat

**Purpose:** Interactive helper for capturing clean snapshots

**Features:**
- Capture BEFORE/AFTER snapshots
- Compare any two snapshots
- List all captured tests
- Clean up old tests

### 3. CLEAN-TEST-GUIDE.md

**Purpose:** Detailed manual for controlled testing

**Contents:**
- Step-by-step test procedure
- Expected results interpretation
- Alternative test ideas
- Troubleshooting guide

## References

### Existing Snapshots

All snapshots in:
```
C:\DATA\GridVox\gridvox-sim-integration\ams2\savegame-reverse-engineering\snapshots\
```

### AMS2 Save Location

```
C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame\
```

**Key files:**
- `default.sav` (7.3 MB) - Main save, contains car/track selection
- `default.localsettings.v1.03.sav` (1.9 KB) - Graphics/audio settings
- `default.controllersettings.v1.03.sav` (159 KB) - Controller bindings
- `default.championshipeditor.v1.00.sav` (44 KB) - Championship data

## Decision Tree

```
Start
  ├─ Capture clean test data
  │
  ├─ Run comparison
  │
  ├─ Check difference count
  │   │
  │   ├─ <100 diffs
  │   │   └─→ ✅ Create patcher, test hex editing
  │   │
  │   ├─ 1K-10K diffs
  │   │   └─→ ⚠️ Analyze checksums, may be doable
  │   │
  │   └─ 100K+ diffs
  │       └─→ ❌ Consider memory editing or UI automation
  │
  └─ If hex editing works
      └─→ Map all settings
          └─→ Create config writer
              └─→ Integrate with GridVox
```

## Conclusion

**Hex editing AMS2 saves is theoretically possible**, but:

1. **Need cleaner test data** - existing snapshots too noisy
2. **May encounter checksums** - will need to handle those
3. **May be compressed/encrypted** - would make it impractical

**Next action:** Run `test-clean-comparison.bat` and capture clean BMW vs Mercedes comparison with ONLY car selection changed.

---

## Quick Commands

```bash
# Navigate to tool directory
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\savegame-reverse-engineering

# Run clean test helper
test-clean-comparison.bat

# Manual comparison
node hex-diff.js "path/to/before.sav" "path/to/after.sav" BEFORE AFTER

# Check for strings in save
strings "C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame\default.sav" | head -50
```

---

## November 11, 2025 Update – Championship Save Encryption Research

### Observations from Latest Tests
- `default.championshipeditor.v1.00.sav` consistently shows ~7.98 bits/byte entropy (measured with the existing entropy helper), which aligns with encrypted data.
- All compression probes (`gzip`, `zlib`, `brotli`, and raw `deflate`) fail with "unknown compression" errors, pointing away from standard compression formats.
- Byte diffs between multiple championship snapshots are identical despite in-game tweaks, suggesting the game buffers edits elsewhere and only writes once validation succeeds.
- ASCII scans return only short, high-entropy fragments; no human-readable strings surfaced.

### Recon on Existing Tooling (PCarsTools)
- `BPakFileEncryption` holds three 32-slot key tables (PC1, PC2+, Test Drive FRL) that are XOR-scrambled with `[0xAC,0xC7,0x91]` before being fed into RC4 or TwoFish routines.
- `BConfig` decrypts `Languages/languages.bml` via TwoFish to map filenames to key indices and brute-forces the remaining slots by testing TOC headers.
- Extended TOC metadata relies on an RC5/RC6-style `ScribeDecrypt` round function, with a fallback to RC4 slot 0 for legacy titles.
- Takeaway: Slightly Mad stores key material in the executable, lightly obfuscated, and recovers it at runtime—likely the same pattern for profile saves.

### Implications for Championship Editing
- High entropy plus failed compression means naïve hex edits will corrupt the file; we must decrypt or intercept the plaintext.
- Expect per-chunk checksums or custom ciphers invoked just before disk writes; key schedules should be discoverable in RAM during serialization.
- Existing tooling targets archives, but the decryption workflow offers a template for building a save decryptor once the relevant routines are found.

### Next Actions
1. Capture fresh championship snapshots where only one field changes (e.g., rename a championship) to confirm whether any plaintext ever leaks.
2. Statical reconnaissance: scan the AMS2 executable for `championshipeditor` strings, XOR key tables, or TwoFish/RC4 implementations.
3. Dynamic tracing: break on `CreateFileW`/`WriteFile` while monitoring buffers for plaintext prior to encryption; log calls around suspected crypto loops.
4. If a custom cipher is identified, mirror the `BPakFileEncryption` pattern—extract the key schedule, implement decrypt/encrypt helpers, and validate with a round-trip edit.

---

**Status:** Championship save likely encrypted; pursuing runtime capture of plaintext buffers.
