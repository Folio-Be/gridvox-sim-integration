# Setup Guide - Quick Reference

Complete this checklist before running the extractor.

## ☑️ Pre-Flight Checklist

### 1. .NET Runtime
- [ ] Download .NET 6.0+ from https://dotnet.microsoft.com/download/dotnet/6.0
- [ ] Install .NET Runtime
- [ ] Verify: Run `dotnet --version` (should show 6.0.x or higher)

### 2. PCarsTools Binary
- [ ] Download from https://github.com/Nenkai/PCarsTools/releases
- [ ] Extract ZIP file
- [ ] Create `tools/PCarsTools/` directory in this project
- [ ] Copy `pcarstools_x64.exe` to `tools/PCarsTools/`
- [ ] Verify: File `tools/PCarsTools/pcarstools_x64.exe` exists

### 3. Oodle Compression DLL
- [ ] Locate `oo2core_4_win64.dll` in your AMS2 installation:
  - Default: `C:\GAMES\Automobilista 2\oo2core_4_win64.dll`
  - Steam: `C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\oo2core_4_win64.dll`
- [ ] Copy `oo2core_4_win64.dll` to `tools/PCarsTools/`
- [ ] Verify: File `tools/PCarsTools/oo2core_4_win64.dll` exists

### 4. Node.js Dependencies
- [ ] Navigate to project directory
- [ ] Run `npm install`
- [ ] Wait for dependencies to install (sharp, ts-node, typescript)

### 5. AMS2 Installation
- [ ] Ensure AMS2 is installed and up to date
- [ ] Note your AMS2 installation path (default: `C:\GAMES\Automobilista 2`)

## ✅ Verification

Run this command to verify all prerequisites:

```bash
npm run test
```

If you see errors about missing files, review the checklist above.

## 🚀 Ready to Run

Once all checklist items are complete:

```bash
# Test with 5 vehicles first
npm run test

# If successful, run full extraction
npm run process-all
```

## ❓ Troubleshooting

**Error: dotnet not found**
- Install .NET Runtime from Microsoft
- Restart terminal after installation

**Error: pcarstools_x64.exe not found**
- Check that file is in `tools/PCarsTools/` directory
- Verify filename is exactly `pcarstools_x64.exe`

**Error: oo2core_4_win64.dll not found**
- Find DLL in your AMS2 installation folder
- Copy to `tools/PCarsTools/` directory
- Ensure filename is exactly `oo2core_4_win64.dll`

**Error: Cannot find AMS2 installation**
- Use `--path` option: `npm run process-all -- --path "D:\Games\Automobilista 2"`

## 📋 Directory Structure After Setup

```
ams2-car-image-extractor/
├── tools/
│   └── PCarsTools/
│       ├── pcarstools_x64.exe    ✅ (copied)
│       └── oo2core_4_win64.dll   ✅ (copied)
├── node_modules/                  ✅ (npm install)
├── src/                           ✅ (implemented)
└── package.json                   ✅ (ready)
```

You're all set! 🎉
