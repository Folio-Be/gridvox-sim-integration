# Clean Test Guide - Hex Editing Save Files

## Problem Found

Initial comparison showed **217,006 byte differences** (3% of 7.3 MB file) between BMW and Mercedes snapshots. This is too many changes to isolate car selection bytes.

**Likely causes:**
- Timestamps embedded in save file
- Session IDs or random data
- Checksums that get recalculated
- Compressed or encrypted sections

## Solution: Controlled Testing

We need cleaner before/after snapshots with **ONLY** car selection changed.

## Test Procedure

### Option 1: Single Setting Change (Recommended)

1. **Close AMS2 completely**

2. **Backup save directory:**
   ```bash
   cd C:\Users\tomat\OneDrive\Documents\Automobilista 2
   cp -r savegame savegame-backup
   ```

3. **Open AMS2**
   - Navigate to car selection screen
   - Select **BMW M4 GT3** (or any car)
   - **DO NOT CHANGE ANYTHING ELSE**
   - Exit AMS2 properly (don't alt+F4)

4. **Wait 5 seconds for save to complete**

5. **Copy save file:**
   ```bash
   cd C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame
   cp default.sav bmw-test.sav
   ls -lh bmw-test.sav
   ```

6. **Open AMS2 again**
   - Navigate to car selection
   - Select **Mercedes-AMG GT3** (different manufacturer!)
   - **DO NOT CHANGE ANYTHING ELSE**
   - Exit AMS2 properly

7. **Wait 5 seconds, then copy:**
   ```bash
   cp default.sav mercedes-test.sav
   ls -lh mercedes-test.sav
   ```

8. **Compare:**
   ```bash
   cd C:\DATA\GridVox\gridvox-sim-integration\ams2\savegame-reverse-engineering
   node hex-diff.js "C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame\bmw-test.sav" "C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame\mercedes-test.sav" BMW Mercedes
   ```

### Option 2: Track Selection Test

If car selection has too many changes, try track selection instead:

1. Follow same process as above
2. Select **Track A** → Exit → Copy save
3. Select **Track B** → Exit → Copy save
4. Compare

### Option 3: Simple Settings Test

Try an even simpler setting:

1. **Graphics Quality**: Low → High
2. **Audio Volume**: 50% → 100%
3. **AI Difficulty**: 50 → 60

These might have fewer embedded timestamps.

## Expected Results

### Good Scenario (Success)
```
🔍 Differences Found: 10-50
```
This would indicate specific bytes changed for car selection.

### Bad Scenario (Too Many Changes)
```
🔍 Differences Found: 200,000+
```
This means timestamps/checksums make hex editing impractical.

## If Too Many Differences Persist

### Check for File Compression
```bash
file default.sav
xxd default.sav | head -20
```

Look for compression headers like:
- `1f 8b` (gzip)
- `50 4b` (zip)
- `78 9c` (zlib)

### Check for File Encryption

If file starts with random-looking data, might be encrypted.

### Alternative Approach: Memory Editing

Instead of save file editing, we could:
1. Read AMS2 process memory while running
2. Search for car selection value
3. Modify in real-time
4. Observe what happens

This bypasses save file format entirely.

## Questions to Answer

After clean testing:

- [ ] How many bytes changed with ONLY car selection?
- [ ] Are changes in consistent locations?
- [ ] Do changes look like IDs/strings or timestamps?
- [ ] Can we find readable car names in hex dump?
- [ ] Is file compressed/encrypted?

## Next Steps

### If Clean Test Shows <100 Byte Changes ✅
→ Create patcher script
→ Test if AMS2 accepts modified saves
→ Map all car IDs
→ Integrate with GridVox

### If Still Too Many Changes ⚠️
→ File likely has checksums or compression
→ Need to reverse engineer file format
→ OR use memory editing instead
→ OR use UI automation (less ideal)

---

**Run this test when you're ready and report back the number of differences!**
