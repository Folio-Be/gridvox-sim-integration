# AMS2 Memory Editing Approach

**Status:** ✅ Recommended approach after hex editing proved impractical
**User Installation Required:** ❌ None (after development)

## Overview

Instead of editing save files (which have extensive checksums), we'll:
1. Read AMS2 process memory while game is running
2. Find addresses for car/track/weather selection
3. Modify those memory addresses directly
4. Changes take effect immediately (no save/load needed)

## Phase 1: Discovery (Using Cheat Engine)

**Goal:** Find memory addresses for race configuration settings

**Time:** 1-2 hours

**Required:** Cheat Engine (free, one-time install)

### Process

1. **Download Cheat Engine**
   - https://cheatengine.org/downloads.php
   - Free, open source
   - Only needed for discovery phase

2. **Find Car Selection Address**
   - Start AMS2, select Mercedes
   - Attach Cheat Engine to AMS2 process
   - "Unknown initial value" scan
   - Change car to Audi in AMS2
   - "Changed value" scan
   - Repeat until 1-5 addresses remain
   - Test modifying those addresses

3. **Find Track Selection Address**
   - Same process with track changes

4. **Find Weather/Time/AI Addresses**
   - Repeat for each setting

5. **Document Findings**
   - Memory address (e.g., 0x12AB5678)
   - Base address or offset
   - Value type (int32, string, etc.)
   - Value mapping (1=Mercedes, 2=Audi, etc.)

### Expected Results

```
Car Selection:
  Base: AMS2.exe + 0x12AB5678
  Type: int32
  Values:
    1 = Mercedes-AMG GT3
    2 = Audi R8 LMS
    3 = McLaren 720S GT3
    ...

Track Selection:
  Base: AMS2.exe + 0x23BC6789
  Type: int32
  Values:
    1 = Monza
    2 = Spa
    3 = Interlagos
    ...
```

## Phase 2: Build Custom Memory Tool

**Goal:** Create Node.js/C# tool to read/write AMS2 memory

**Time:** 3-5 hours

**User Installation:** ❌ None - bundled with GridVox

### Architecture

```
GridVox Desktop
    ↓
Memory Tool (Node.js native addon or C# executable)
    ↓
Windows API (ReadProcessMemory / WriteProcessMemory)
    ↓
AMS2.exe process
```

### Implementation Options

#### Option A: Node.js Native Addon (Recommended)
**Pros:**
- Integrates directly with Electron
- No separate process needed
- Fast IPC

**Packages:**
- `memoryjs` - npm package for Windows memory access
- `ffi-napi` - Call Windows APIs directly

**Example:**
```javascript
const memoryjs = require('memoryjs');

// Find AMS2 process
const process = memoryjs.openProcess('AMS2.exe');

// Read car selection value
const carId = memoryjs.readMemory(
  process.handle,
  0x12AB5678, // Address from Cheat Engine
  'int'
);

// Write new car selection
memoryjs.writeMemory(
  process.handle,
  0x12AB5678,
  2, // Audi
  'int'
);
```

#### Option B: C# Executable
**Pros:**
- Full Windows API access
- Easy P/Invoke
- Can use existing C# knowledge

**Example:**
```csharp
using System.Diagnostics;
using System.Runtime.InteropServices;

[DllImport("kernel32.dll")]
static extern IntPtr OpenProcess(int dwDesiredAccess, bool bInheritHandle, int dwProcessId);

[DllImport("kernel32.dll")]
static extern bool ReadProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress,
    byte[] lpBuffer, int dwSize, out int lpNumberOfBytesRead);

[DllImport("kernel32.dll")]
static extern bool WriteProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress,
    byte[] lpBuffer, int nSize, out int lpNumberOfBytesWritten);

// Find AMS2 process
var process = Process.GetProcessesByName("AMS2")[0];
var handle = OpenProcess(0x1F0FFF, false, process.Id);

// Read car selection
byte[] buffer = new byte[4];
ReadProcessMemory(handle, (IntPtr)0x12AB5678, buffer, 4, out _);
int carId = BitConverter.ToInt32(buffer, 0);

// Write new car selection
buffer = BitConverter.GetBytes(2); // Audi
WriteProcessMemory(handle, (IntPtr)0x12AB5678, buffer, 4, out _);
```

### Tool Features

1. **Process Detection**
   - Find AMS2.exe automatically
   - Handle if game not running

2. **Memory Reading**
   - Read current car/track/weather selection
   - Validate values

3. **Memory Writing**
   - Write new configuration
   - Verify write succeeded

4. **Error Handling**
   - Process not found
   - Access denied (run as admin?)
   - Invalid memory address

5. **Value Mapping**
   - Map human-readable names to IDs
   - "Mercedes-AMG GT3" → 1

## Phase 3: Integration with GridVox

**Goal:** Expose memory editing through GridVox API

**Time:** 2-3 hours

### API Design

```typescript
// gridvox-desktop/src/services/ams2-config.ts

export class AMS2ConfigService {
  // Initialize memory tool
  async connect(): Promise<boolean>;

  // Read current configuration
  async getCurrentConfig(): Promise<RaceConfig>;

  // Write new configuration
  async setConfig(config: RaceConfig): Promise<boolean>;

  // Check if AMS2 is running
  isGameRunning(): boolean;
}

interface RaceConfig {
  car: string;         // "Mercedes-AMG GT3"
  track: string;       // "Monza"
  weather: string;     // "Clear"
  timeOfDay: string;   // "Noon"
  aiLevel: number;     // 50-100
  raceLength: number;  // Minutes
}
```

### Usage in GridVox

```typescript
// User configures race in GridVox UI
const config: RaceConfig = {
  car: "Mercedes-AMG GT3",
  track: "Monza",
  weather: "Clear",
  timeOfDay: "Noon",
  aiLevel: 70,
  raceLength: 30
};

// Apply configuration via memory editing
const ams2Service = new AMS2ConfigService();
await ams2Service.connect();
await ams2Service.setConfig(config);

// User switches to AMS2 window
// Configuration is already set!
```

## Advantages Over Other Approaches

### vs. Hex Editing Save Files
✅ No checksum/timestamp issues
✅ Changes take effect immediately
✅ No need to restart game
✅ Can verify changes instantly

### vs. UI Automation
✅ Instant (no UI navigation)
✅ Doesn't require game focus
✅ More reliable (no UI changes)
✅ Can run in background

### vs. Official API
✅ Available now (no waiting for Reiza)
✅ Full control
✅ No API limitations

## Challenges & Solutions

### Challenge 1: Memory Addresses Change Per Version
**Problem:** AMS2 updates change memory layout

**Solutions:**
1. **Pattern Scanning** - Search for byte patterns near addresses
2. **Version Detection** - Maintain address map per AMS2 version
3. **Hybrid Approach** - Memory editing + fallback to UI automation

### Challenge 2: Anti-Cheat / Protection
**Problem:** AMS2 might detect memory modification

**Status:** AMS2 is single-player focused, unlikely to have strong protection

**Fallback:** If detected, revert to UI automation

### Challenge 3: Race Already Started
**Problem:** Can't change car mid-race

**Solution:** Only allow changes in setup screen (detect game state)

### Challenge 4: Admin Privileges
**Problem:** May need admin rights to write process memory

**Solutions:**
1. Request elevation on GridVox startup
2. Or only on first AMS2 connection
3. Fallback to read-only mode if denied

## Testing Plan

### Phase 1 Testing (Cheat Engine)
- [⏸️] Find car selection address - **IN PROGRESS** (see CHEAT-ENGINE-SESSION-LOG.md)
- [ ] Find track selection address
- [ ] Find weather address
- [ ] Find time of day address
- [ ] Find AI difficulty address
- [ ] Test modifying each address
- [ ] Verify changes in AMS2
- [ ] Document all addresses

**Current Status:** Narrowed to 1,252 addresses using 4 Bytes scan. Need "Unchanged value" filtering to get below 100 for manual testing.

### Phase 2 Testing (Custom Tool)
- [ ] Connect to AMS2 process
- [ ] Read memory addresses successfully
- [ ] Write memory addresses successfully
- [ ] Verify changes in game
- [ ] Handle game not running
- [ ] Handle access denied errors
- [ ] Test with multiple game versions

### Phase 3 Testing (GridVox Integration)
- [ ] API correctly reads config
- [ ] API correctly writes config
- [ ] UI shows current config
- [ ] User can change config from UI
- [ ] Changes apply to game
- [ ] Error messages clear
- [ ] Works with story mode campaigns

## Timeline

| Phase | Task | Time | Dependencies |
|-------|------|------|--------------|
| 1 | Install Cheat Engine | 5 min | - |
| 1 | Find car selection address | 30 min | AMS2 running |
| 1 | Find track address | 20 min | Car address |
| 1 | Find weather/time/AI | 30 min | Track address |
| 1 | Document all findings | 15 min | All addresses |
| 2 | Set up Node.js native addon | 30 min | - |
| 2 | Implement memory read/write | 2 hours | Phase 1 complete |
| 2 | Test memory tool | 1 hour | Implementation done |
| 2 | Create value mappings | 1 hour | Testing done |
| 3 | Design API interface | 30 min | - |
| 3 | Implement service class | 1 hour | Memory tool working |
| 3 | Integrate with UI | 1 hour | Service class done |
| 3 | End-to-end testing | 1 hour | Integration done |

**Total:** ~8-10 hours of development

**User experience:** Just works - no installation needed

## Next Steps

**📖 Resume Session:** See `CHEAT-ENGINE-SESSION-LOG.md` for current progress and exact steps to continue.

**Where We Are:**
- ✅ Phase 1 started - Cheat Engine attached, narrowed to 1,252 addresses
- ⏸️ Next: Use "Unchanged value" filtering to get below 100 addresses
- ⏳ Then: Manual testing to find working car selection address

**Roadmap:**
1. **Tomorrow:** Complete car selection address discovery (30-60 min)
2. **Later:** Build memory tool (Phase 2)
3. **Later:** Integrate with GridVox (Phase 3)

---

## Resources

- **Cheat Engine:** https://cheatengine.org/
- **memoryjs:** https://www.npmjs.com/package/memoryjs
- **Windows Memory APIs:** https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/
- **Pattern Scanning:** https://guidedhacking.com/threads/external-internal-pattern-scanning-guide.14112/

## Files

- `cheat-engine-guide.md` - Step-by-step Cheat Engine tutorial
- `CHEAT-ENGINE-SESSION-LOG.md` - **Current session progress and resume instructions** ⏸️
- `memory-addresses.json` - Discovered addresses per AMS2 version (not yet created)
- `memory-tool/` - Node.js or C# memory editing tool (Phase 2)
- `ams2-config-service.ts` - GridVox integration service (Phase 3)
