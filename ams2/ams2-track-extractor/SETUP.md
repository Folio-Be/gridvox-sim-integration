# PCarsTools Setup Guide

Complete setup guide for extracting AMS2 track files using PCarsTools.

---

## Overview

This guide walks you through setting up the complete toolchain for extracting 3D track models from Automobilista 2 game files.

**Estimated Setup Time:** 30-45 minutes  
**One-time setup:** Yes (tools persist across tracks)

---

## ☑️ Pre-Flight Checklist

Complete each section in order. Do not skip steps.

### 1. .NET 6.0 Runtime

**Why needed:** PCarsTools is a .NET application

- [ ] Download .NET 6.0 Runtime from https://dotnet.microsoft.com/download/dotnet/6.0
- [ ] Install .NET Runtime (Desktop or Console)
- [ ] Restart terminal/command prompt
- [ ] Verify installation:

```powershell
dotnet --version
# Expected output: 6.0.x or higher (e.g., 6.0.27)
```

**Troubleshooting:**
- If `dotnet` command not found, restart your terminal
- Ensure you installed the **Runtime**, not just SDK
- Windows: Check `C:\Program Files\dotnet\` exists

---

### 2. PCarsTools Binary

**Why needed:** Extracts and decompresses AMS2 .bff archive files

**Download:**
1. Go to https://github.com/Nenkai/PCarsTools/releases
2. Download latest release (e.g., `PCarsTools_x64.zip` or similar)
3. Extract the ZIP file to a temporary location

**Installation:**
- [ ] Create directory: `tools/PCarsTools/` in this project
- [ ] Copy `pcarstools_x64.exe` from extracted ZIP to `tools/PCarsTools/`
- [ ] Verify: File exists at `tools/PCarsTools/pcarstools_x64.exe`

**File path should be:**
```
C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-track-extractor\tools\PCarsTools\pcarstools_x64.exe
```

**Verify:**
```powershell
Test-Path "tools\PCarsTools\pcarstools_x64.exe"
# Should return: True
```

---

### 3. Oodle Compression DLL

**Why needed:** AMS2 uses Oodle compression for .bff archives

**⚠️ Legal Note:** This DLL is proprietary Epic Games software. You must:
- Extract from your **own** AMS2 installation
- NOT redistribute publicly
- Use only for personal modding/development

**Locate the DLL:**

The file `oo2core_4_win64.dll` is in your AMS2 installation root:

**Common locations:**
```powershell
# Default installation
C:\GAMES\Automobilista 2\oo2core_4_win64.dll

# Steam installation
C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\oo2core_4_win64.dll

# Epic Games Store
C:\Program Files\Epic Games\Automobilista 2\oo2core_4_win64.dll

# Custom location
[Your AMS2 Install Path]\oo2core_4_win64.dll
```

**Find it:**
```powershell
# Search for the file
Get-ChildItem -Path "C:\" -Filter "oo2core_4_win64.dll" -Recurse -ErrorAction SilentlyContinue
```

**Installation:**
- [ ] Copy `oo2core_4_win64.dll` from your AMS2 installation
- [ ] Paste into `tools/PCarsTools/` directory in this project
- [ ] Verify: File exists at `tools/PCarsTools/oo2core_4_win64.dll`

**File path should be:**
```
C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-track-extractor\tools\PCarsTools\oo2core_4_win64.dll
```

**Verify:**
```powershell
Test-Path "tools\PCarsTools\oo2core_4_win64.dll"
# Should return: True
```

**File size check:**
- File should be approximately **1.5-2MB**
- If smaller, you may have copied the wrong file

---

### 4. Blender 4.0+

**Why needed:** Convert extracted track files to glTF format

- [ ] Download Blender from https://www.blender.org/download/
- [ ] Install Blender 4.0 or higher
- [ ] (Optional) Add Blender to system PATH for command-line access

**Verify installation:**
```powershell
# If added to PATH:
blender --version

# Otherwise, Blender executable should be at:
# C:\Program Files\Blender Foundation\Blender 4.0\blender.exe
```

**PATH setup (optional but recommended):**
```powershell
# Add to User PATH:
$env:Path += ";C:\Program Files\Blender Foundation\Blender 4.0"
```

---

### 5. Node.js Dependencies

**Why needed:** TypeScript execution and file processing

- [ ] Navigate to project directory:
```powershell
cd C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-track-extractor
```

- [ ] Install dependencies:
```powershell
npm install
```

**What gets installed:**
- `@gltf-transform/core` - glTF file manipulation
- `@gltf-transform/functions` - Optimization functions
- `three` - 3D mesh generation
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution

**Verify:**
```powershell
# Check node_modules exists
Test-Path "node_modules"
# Should return: True
```

---

### 6. AMS2 Installation Path

**Why needed:** PCarsTools needs to find track files

- [ ] Verify AMS2 is installed and up to date
- [ ] Note your AMS2 installation path

**Find your path:**
```powershell
# Check common locations
Test-Path "C:\GAMES\Automobilista 2"
Test-Path "C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2"
Test-Path "C:\Program Files\Epic Games\Automobilista 2"
```

**Set default path (optional):**

Create `.env` file in project root:
```
AMS2_INSTALL_PATH=C:\GAMES\Automobilista 2
```

---

## ✅ Verification

### Run Full Verification

```powershell
npm run verify-setup
```

This checks:
- ✅ .NET Runtime installed
- ✅ PCarsTools binary exists
- ✅ Oodle DLL exists
- ✅ Blender installed (if in PATH)
- ✅ Node modules installed
- ✅ AMS2 installation found

### Manual Verification

Check each component individually:

**1. .NET:**
```powershell
dotnet --version
# Expected: 6.0.x or higher
```

**2. PCarsTools:**
```powershell
.\tools\PCarsTools\pcarstools_x64.exe --help
# Expected: PCarsTools help text
```

**3. Oodle DLL:**
```powershell
Get-Item .\tools\PCarsTools\oo2core_4_win64.dll | Select-Object Name, Length
# Expected: Name = oo2core_4_win64.dll, Length ≈ 1.5-2 MB
```

**4. Blender:**
```powershell
blender --version
# Expected: Blender version info
```

**5. Node Modules:**
```powershell
npm list --depth=0
# Expected: List of installed packages
```

---

## 📋 Expected Directory Structure

After setup, your directory should look like this:

```
ams2-track-extractor/
├── tools/
│   └── PCarsTools/
│       ├── pcarstools_x64.exe          ✅ Required
│       ├── oo2core_4_win64.dll         ✅ Required
│       ├── PCarsTools.pdb              (optional)
│       ├── XCompression.pdb            (optional)
│       └── oo2core_4_win64_debug.dll   (optional)
│
├── node_modules/                       ✅ Required (after npm install)
├── extracted-tracks/                   (created on first extraction)
├── converted-tracks/                   (created on first conversion)
│
├── package.json                        ✅ Required
├── tsconfig.json                       ✅ Required
├── README.md
├── SETUP.md                            ← You are here
├── MANUAL-SETUP.md
└── GETTING-STARTED.md
```

---

## 🚀 Ready to Extract

Once all checklist items are complete, you're ready to extract tracks!

### Test Extraction

Try extracting a single track to verify everything works:

```powershell
npm run extract -- --track silverstone --test
```

**Expected output:**
```
✓ .NET Runtime found (6.0.27)
✓ PCarsTools binary found
✓ Oodle DLL found
✓ AMS2 installation found
→ Extracting Silverstone GP...
→ Using PCarsTools to decompress .bff archive...
✓ Track files extracted to: extracted-tracks/silverstone/
```

### Next Steps

See [GETTING-STARTED.md](./GETTING-STARTED.md) for:
- Extraction workflow
- Blender conversion steps
- Optimization process
- Troubleshooting common issues

---

## ❓ Troubleshooting

### Error: "dotnet not found"

**Solution:**
1. Download .NET Runtime from Microsoft
2. Install the Runtime (not just SDK)
3. Restart terminal/PowerShell
4. Try again

**Verify:**
```powershell
dotnet --version
```

---

### Error: "pcarstools_x64.exe not found"

**Solution:**
1. Download from https://github.com/Nenkai/PCarsTools/releases
2. Extract ZIP file
3. Copy `pcarstools_x64.exe` to `tools/PCarsTools/`
4. Verify filename is exactly `pcarstools_x64.exe` (not renamed)

**Check:**
```powershell
Test-Path "tools\PCarsTools\pcarstools_x64.exe"
# Should return: True
```

---

### Error: "oo2core_4_win64.dll not found"

**Solution:**
1. Find DLL in your AMS2 installation folder (root directory)
2. Copy `oo2core_4_win64.dll` to `tools/PCarsTools/`
3. Ensure filename is exactly `oo2core_4_win64.dll`
4. Check file size is 1.5-2MB (not empty or wrong file)

**Search for it:**
```powershell
Get-ChildItem -Path "C:\" -Filter "oo2core_4_win64.dll" -Recurse -ErrorAction SilentlyContinue
```

**Verify size:**
```powershell
(Get-Item "tools\PCarsTools\oo2core_4_win64.dll").Length / 1MB
# Should be approximately 1.5-2
```

---

### Error: "Cannot find AMS2 installation"

**Solution:**

**Option 1: Use --path parameter**
```powershell
npm run extract -- --track silverstone --path "D:\Games\Automobilista 2"
```

**Option 2: Create .env file**
```
AMS2_INSTALL_PATH=D:\Games\Automobilista 2
```

**Option 3: Check common locations**
```powershell
# Steam
C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2

# Epic Games
C:\Program Files\Epic Games\Automobilista 2

# Default
C:\GAMES\Automobilista 2
```

---

### Error: "Access denied" when copying DLL

**Solution:**
1. Run PowerShell/Terminal as Administrator
2. Or copy files manually using File Explorer
3. Ensure you have write permissions to project directory

---

### PCarsTools runs but extraction fails

**Common causes:**

**1. Wrong Oodle DLL version**
- Ensure DLL is from **your** AMS2 installation (same version)
- File size should be 1.5-2MB
- Don't use DLL from other games

**2. Corrupted game files**
- Verify AMS2 game files through Steam/Epic
- Reinstall AMS2 if necessary

**3. Encrypted/protected files**
- Some tracks may have encrypted files
- Try different track (Silverstone is usually accessible)
- Check PCarsTools GitHub issues for compatibility

---

### Blender import fails

**Solution:**
1. Ensure you extracted files successfully first
2. Check Blender version is 4.0+
3. Try manual import (File → Import → select appropriate format)
4. See [MANUAL-SETUP.md](./MANUAL-SETUP.md) for detailed Blender workflow

---

## 📞 Getting Help

1. **Check this guide** - Most issues covered above
2. **Read error messages** - Often indicate exactly what's missing
3. **Verify each step** - Use verification commands above
4. **Check PCarsTools documentation** - https://github.com/Nenkai/PCarsTools
5. **SimVox.ai community** - Discord/Forum

---

## 🔄 Updating Tools

### Update PCarsTools

When new version released:
1. Download latest from GitHub releases
2. Replace `tools/PCarsTools/pcarstools_x64.exe`
3. Keep Oodle DLL (usually doesn't change)

### Update Oodle DLL

After AMS2 major updates:
1. Check if `oo2core_4_win64.dll` version changed
2. Copy new version from updated AMS2 installation
3. Replace in `tools/PCarsTools/`

### Update .NET Runtime

Periodically check for updates:
```powershell
dotnet --list-runtimes
# Compare with latest at https://dotnet.microsoft.com/download
```

---

**Setup complete?** → Continue to [GETTING-STARTED.md](./GETTING-STARTED.md) to extract your first track! 🏁
