# Tool Binaries

This directory contains the required external tools for car model extraction.

## Required Tools

### 1. kn5-converter (C# .NET Tool)

**Purpose**: Converts Assetto Corsa .kn5 files to FBX format

**Download**:
- Repository: https://github.com/RaduMC/kn5-converter
- Releases: https://github.com/RaduMC/kn5-converter/releases

**Installation**:
1. Download latest release OR build from source (requires .NET 6.0 SDK)
2. Extract `kn5conv.exe` to `tools/kn5-converter/kn5conv.exe`
3. Verify: `.\tools\kn5-converter\kn5conv.exe --help`

**Build from Source** (if no precompiled binary available):
```bash
git clone https://github.com/RaduMC/kn5-converter.git
cd kn5-converter
dotnet build -c Release
# Copy bin/Release/net6.0/kn5conv.exe to tools/kn5-converter/
```

**Required Files**:
```
tools/kn5-converter/
├── kn5conv.exe         # Main executable
└── (dependencies)      # Any DLLs it depends on
```

---

### 2. FBX2glTF (Meta/Facebook Tool)

**Purpose**: Converts FBX files to glTF/GLB format with Draco compression

**Download**:
- Repository: https://github.com/facebookincubator/FBX2glTF
- Releases: https://github.com/facebookincubator/FBX2glTF/releases
- Direct download (Windows x64): [FBX2glTF-windows-x86_64.zip](https://github.com/facebookincubator/FBX2glTF/releases/latest)

**Installation**:
1. Download `FBX2glTF-windows-x86_64.zip` from releases
2. Extract `FBX2glTF.exe` to `tools/FBX2glTF/FBX2glTF.exe`
3. Verify: `.\tools\FBX2glTF\FBX2glTF.exe --help`

**Required Files**:
```
tools/FBX2glTF/
├── FBX2glTF.exe        # Main executable
└── (any DLLs)          # Autodesk FBX SDK dependencies (if included in zip)
```

**Note**: FBX2glTF includes proprietary Autodesk FBX SDK code. Redistribution may be restricted. See [Autodesk FBX SDK License](https://www.autodesk.com/developer-network/platform-technologies/fbx-sdk-2020-0).

---

## Verification

After downloading both tools, run the verification script:

```bash
npm run verify
```

Expected output:
```
✓ kn5-converter found: tools/kn5-converter/kn5conv.exe
✓ FBX2glTF found: tools/FBX2glTF/FBX2glTF.exe
✓ Assetto Corsa installation: C:\...\assettocorsa
✓ Found 178 cars in content/cars/
```

---

## Why These Tools Aren't Bundled

These executables are **NOT included in this repository** because:

1. **kn5-converter**:
   - Requires building from C# source (no official precompiled binaries)
   - .NET 6.0 dependency
   - License allows redistribution but binaries may vary by platform

2. **FBX2glTF**:
   - Large binary (~50MB with dependencies)
   - Includes proprietary Autodesk FBX SDK
   - License restrictions on redistribution
   - Official releases provide trusted builds

**Security**: Always download tools from official GitHub releases to avoid malware.

---

## Alternative: Automated Download Script

If you want to automate tool downloads, create `scripts/download-tools.ps1`:

```powershell
# Download kn5-converter (example - adjust URL for latest release)
$kn5Url = "https://github.com/RaduMC/kn5-converter/releases/download/v1.0.0/kn5conv.exe"
Invoke-WebRequest -Uri $kn5Url -OutFile "tools/kn5-converter/kn5conv.exe"

# Download FBX2glTF
$fbx2gltfUrl = "https://github.com/facebookincubator/FBX2glTF/releases/latest/download/FBX2glTF-windows-x86_64.zip"
$fbx2gltfZip = "tools/FBX2glTF.zip"
Invoke-WebRequest -Uri $fbx2gltfUrl -OutFile $fbx2gltfZip
Expand-Archive -Path $fbx2gltfZip -DestinationPath "tools/FBX2glTF" -Force
Remove-Item $fbx2gltfZip
```

⚠️ **Warning**: Verify checksums when downloading executables automatically.

---

## License Information

### kn5-converter
- License: Check repository (likely MIT or similar)
- Author: RaduMC
- Purpose: Community tool for Assetto Corsa modding

### FBX2glTF
- License: 3-Clause BSD (for FBX2glTF code)
- Autodesk FBX SDK: Proprietary (check Autodesk license)
- Author: Meta/Facebook (facebookincubator)
- Purpose: Official FBX to glTF converter

---

## Troubleshooting

### "kn5conv.exe is not recognized"

**Solution**: Ensure `tools/kn5-converter/kn5conv.exe` exists. Check `.env` for correct path.

### "VCRUNTIME140.dll was not found"

**Solution**: Install Microsoft Visual C++ Redistributable:
- Download: https://aka.ms/vs/17/release/vc_redist.x64.exe

### ".NET 6.0 Runtime is required"

**Solution**: Install .NET 6.0 Runtime:
- Download: https://dotnet.microsoft.com/download/dotnet/6.0

### "FBX2glTF.exe failed to execute"

**Solution**:
1. Ensure all DLLs are in `tools/FBX2glTF/` directory
2. Run `FBX2glTF.exe --version` to verify it works
3. Check antivirus didn't quarantine the file

---

## Directory Structure (After Setup)

```
tools/
├── README.md                   # This file
├── kn5-converter/
│   ├── kn5conv.exe            # ← Download from RaduMC/kn5-converter
│   └── (dependencies)
└── FBX2glTF/
    ├── FBX2glTF.exe           # ← Download from facebookincubator/FBX2glTF
    └── (dependencies)
```

---

**Ready?** Run `npm run verify` to check your setup!
