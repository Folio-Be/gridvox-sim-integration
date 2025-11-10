# Sim Integration Repository Cleanup

**Date:** November 10, 2025  
**Status:** ACTION REQUIRED

---

## Problem

Repository contains **~40,000+ files**, with majority being:
- Build artifacts (node_modules, dist, target)
- Generated content (extracted textures, car images)
- Compiled binaries (.o, .bin, .rlib, .rmeta)
- Source maps (.map files)
- Large texture files (.dds - 4,594 files)

**Estimated ignorable files:** ~17,000+ files (~42% of repository)

---

## Updated .gitignore

`.gitignore` has been updated to ignore:

### Dependencies (Most Critical)
- `node_modules/` - **~12,000+ files** from npm dependencies
- `target/` - Rust build artifacts (1,055+ .o files, 378 .rlib files)
- `dist/`, `build/`, `out/` - TypeScript/JavaScript build output

### Generated Content
- `output/` folders (car extractor, telemetry generator)
- `extracted-tracks/` (track extractor output)
- `*.dds` files (4,594 DDS texture files - extracted from game)
- `snapshots/` (savegame reverse engineering)
- `vosk-model*/` (voice recognition models - large binaries)

### Build Artifacts
- `*.map` files (5,116 source map files)
- `*.bin` files (2,550 binary files)
- `*.o` files (1,055 object files)
- `*.rlib`, `*.rmeta` (Rust libraries)
- `*.tsbuildinfo` (TypeScript incremental builds)

### Logs & Temporary
- `*.log` files
- `.cache/`, `.turbo/`, `.parcel-cache/`
- `coverage/` (test coverage reports)

---

## Cleanup Commands

### 1. Preview What Will Be Removed

```powershell
# Count files that will be ignored
cd C:\DATA\GridVox\gridvox-sim-integration

# Dependencies
Get-ChildItem -Recurse -Directory -Filter "node_modules" | Measure-Object
Get-ChildItem -Recurse -Directory -Filter "target" | Measure-Object

# Build artifacts
Get-ChildItem -Recurse -Directory -Filter "dist" | Measure-Object
Get-ChildItem -Recurse -File -Filter "*.map" | Measure-Object

# Generated content
Get-ChildItem -Recurse -File -Filter "*.dds" | Measure-Object
Get-ChildItem -Path ams2 -Recurse -Directory -Filter "output" | Measure-Object
```

### 2. Remove Build Artifacts (Safe - Can Rebuild)

```powershell
cd C:\DATA\GridVox\gridvox-sim-integration

# Remove node_modules (can reinstall with npm install)
Get-ChildItem -Recurse -Directory -Filter "node_modules" | Remove-Item -Recurse -Force

# Remove TypeScript builds (can rebuild with npm run build)
Get-ChildItem -Recurse -Directory -Filter "dist" | Remove-Item -Recurse -Force

# Remove Rust builds (can rebuild with cargo build)
Get-ChildItem -Recurse -Directory -Filter "target" | Remove-Item -Recurse -Force

# Remove source maps
Get-ChildItem -Recurse -File -Filter "*.map" | Remove-Item -Force
```

### 3. Remove Generated Content (WARNING: May Lose Data)

⚠️ **CAUTION:** Only run if you can regenerate this content!

```powershell
cd C:\DATA\GridVox\gridvox-sim-integration

# Remove car image extractor output
Remove-Item -Path "ams2\ams2-car-image-extractor\output" -Recurse -Force

# Remove track extractor output
Remove-Item -Path "ams2\ams2-track-extractor\extracted-tracks" -Recurse -Force

# Remove telemetry track generator output
Remove-Item -Path "ams2\ams2-telemetry-track-generator\output" -Recurse -Force

# Remove all DDS texture files (extracted from game)
Get-ChildItem -Recurse -File -Filter "*.dds" | Remove-Item -Force

# Remove voice model (can re-download)
Remove-Item -Path "ams2\savegame-reverse-engineering\vosk-model*" -Recurse -Force
```

### 4. Git Cleanup (After Manual Removal)

```powershell
cd C:\DATA\GridVox\gridvox-sim-integration

# Remove ignored files from Git index (doesn't delete from disk)
git rm -r --cached .
git add .
git commit -m "chore: remove build artifacts and generated content from Git tracking"

# Verify what will be committed
git status
```

---

## Expected Results

### Before Cleanup
- **Total Files:** ~40,000+
- **Repository Size:** Large (includes all build artifacts, textures, binaries)
- **Git Operations:** Slow (tracking unnecessary files)

### After Cleanup
- **Total Files:** ~23,000 (source code, configs, docs)
- **Repository Size:** Much smaller
- **Git Operations:** Faster
- **Can regenerate:** All removed files via build/extraction tools

---

## File Breakdown Analysis

| Type | Count | Should Ignore? | Rationale |
|------|-------|----------------|-----------|
| `.js` | 12,198 | ⚠️ PARTIAL | Source: NO, node_modules: YES |
| `.ts` | 7,138 | ❌ NO | TypeScript source code |
| `.map` | 5,116 | ✅ YES | Build artifacts (source maps) |
| `.dds` | 4,594 | ✅ YES | Extracted game textures (can regenerate) |
| `.bin` | 2,550 | ✅ YES | Binary files (compiled/extracted) |
| `.o` | 1,055 | ✅ YES | Rust object files (target/) |
| `.json` | 1,840 | ⚠️ PARTIAL | Configs: NO, node_modules: YES |
| `.md` | 1,382 | ❌ NO | Documentation |
| `.png` | 1,121 | ⚠️ PARTIAL | Icons/assets: NO, extracted: YES |
| `.rlib` | 378 | ✅ YES | Rust libraries (target/) |
| `.rmeta` | 380 | ✅ YES | Rust metadata (target/) |

---

## Recommended Action Plan

### Phase 1: Safe Cleanup (Reversible)
1. ✅ Update `.gitignore` (DONE)
2. Run `git status` to see what's currently tracked
3. Review the list of files to be untracked
4. Commit `.gitignore` changes first

### Phase 2: Remove Build Artifacts
1. Delete `node_modules/` folders (can run `npm install` to restore)
2. Delete `dist/` folders (can run `npm run build` to restore)
3. Delete `target/` folders (can run `cargo build` to restore)
4. Delete `.map` files (regenerated on build)

### Phase 3: Remove Generated Content (Optional)
1. Review `output/` folders - decide if needed
2. Review `*.dds` files - can extract from game again if needed
3. Review `vosk-model*/` - can re-download if needed
4. Delete snapshots if not actively analyzing savegames

### Phase 4: Git Cleanup
1. `git rm -r --cached .` (untrack all files)
2. `git add .` (re-add based on new .gitignore)
3. Commit the cleanup
4. Push to remote

---

## Verification

After cleanup, verify repository health:

```powershell
cd C:\DATA\GridVox\gridvox-sim-integration

# Count remaining files
(Get-ChildItem -Recurse -File | Measure-Object).Count

# Check Git status
git status

# Verify .gitignore is working
git check-ignore -v node_modules/
git check-ignore -v dist/
git check-ignore -v **/*.dds
```

---

## Notes

- **Don't delete** `.git/` directory (version control history)
- **Don't delete** source code files (`.ts`, `.tsx`, `.rs`, `.py`)
- **Don't delete** configuration files (`package.json`, `Cargo.toml`, `tsconfig.json`)
- **Don't delete** documentation (`.md` files)
- **Can safely delete** anything in `.gitignore` (can be regenerated)

---

**Next Steps:**
1. Review this cleanup plan
2. Run preview commands to see what will be removed
3. Execute Phase 1 (safe, reversible)
4. Execute Phase 2 (safe, can rebuild)
5. Consider Phase 3 (optional, based on needs)
6. Commit and push cleanup
