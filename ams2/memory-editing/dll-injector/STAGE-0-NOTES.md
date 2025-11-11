# Stage 0 – Championship Save Hook Recon

Goal: capture the AMS2 function that serialises championship data and map the in-memory structure we need to patch. This prep work enables the later DLL hook to target a stable location.

---

## 1. Tooling Checklist

| Tool | Purpose | Notes |
|------|---------|-------|
| **x64dbg** (https://x64dbg.com) | Live debugging, breakpoints on file I/O & crypto | Portable build recommended; run as admin. |
| **Process Monitor** (Sysinternals) | Confirm which writes touch `default.championshipeditor.v1.00.sav` | Filter by path contains `championshipeditor`. |
| **HxD** or `xxd` | Quick hex dumps of live buffers | Optional, for validation. |
| **Cheat Engine** (optional) | Rapid pointer following while running | If you already have it from earlier memory work. |
| **Python notebook / notes** | Document struct fields and offsets | Track discoveries as you go. |

> ⚠️ **Before you start**: Back up the AMS2 install directory and save folder. Disable Steam auto updates temporarily so your offsets stay valid during analysis.

---

## 2. Identify the Write Path

1. Launch **Process Monitor**.
2. Create a filter: `Process Name is AMS2AVX.exe` *and* `Path contains championshipeditor`.
3. Start AMS2, load into a screen where you can save/edit championships and trigger a save (e.g., modify a round order).
4. In Process Monitor, note the call stack attached to the `WriteFile` event. Find the user-mode frames (`AMS2AVX.exe+XXXX`). Copy the module offset – this is our first anchor.
5. Repeat once more to ensure the call stack is consistent.

Document:
- `WriteFile` caller offset(s).
- Any intermediate functions (e.g., `FileSaveManager::SaveProfile`).

---

## 3. Breakpoint Strategy in x64dbg

1. Start **x64dbg** and attach to AMS2 (`File → Attach`). Pause the game or sit in a menu state.
2. Set breakpoints on the APIs you saw in Process Monitor:
   ```
   bp kernel32!WriteFile
   bp kernel32!CreateFileW
   ```
3. Resume the game and perform the championship save action again. When `WriteFile` trips, inspect the call stack (`View → Threads → Call Stack`).
4. Step (`Shift+F7`) until you reach the AMS2 frame responsible for marshalling the championship buffer.
5. Once you find a frame that receives a pointer to the data being written:
   - Dump the buffer via `Dump` window (right-click the register pointing to the buffer → Follow in Dump).
   - Save 256–512 bytes of the dump to compare with the actual `.sav` file (sanity check).
6. Note the function address (e.g., `AMS2AVX.exe+1A3F0`). This will become the MinHook target or at least the entry point for our patch.

Record:
- Function RVA (relative to module base).
- Number of arguments and calling convention (observe register usage, e.g., `RCX`/`RDX` etc.).
- Registers at entry: which hold the buffer pointer, size, context structs.

---

## 4. Map the Championship Structure

While halted inside the function:

1. Use x64dbg to capture the size argument passed to `WriteFile` (typically in `rdx` or the stack). This tells you how large the championship blob is.
2. Copy the buffer to file (`Dump` window → `Save raw data`). Compare with the existing `default.championshipeditor.v1.00.sav` using `hex-diff.js` to confirm alignment.
3. Modify a single field in-game (e.g., rename the championship, tweak AI level), trigger the save again, and capture the buffer once more.
4. Diff the two buffers to identify which offsets move with each change. Start a spreadsheet or JSON describing:
   ```json
   {
     "offset": 0x120,
     "field": "championshipName",
     "type": "UTF16LE",
     "length": 64
   }
   ```
5. Repeat for each editable field we intend to automate (round list, car class, weather presets, points system, etc.).

Aim to produce a partial struct, for example:
```cpp
typedef struct ChampionshipProfile {
    wchar_t name[64];         // 0x0000
    uint32_t seasonId;        // 0x0080
    uint32_t seasonFlags;     // 0x0084
    RoundDefinition rounds[10];
    // ...
} ChampionshipProfile;
```

> Tip: if you suspect nested structures, set watchpoints (`hw`) on the relevant memory and watch where else the game reads/writes it during navigation.

---

## 5. Pattern Signature Prep

Once the target function is confirmed:
1. In x64dbg, switch to the disassembly view at the hooked function.
2. Select 12–20 bytes starting from the function prolog and use `Copy → Pattern` to get a signature template (`48 89 5C 24 ? 57 48 83 EC ? ...`).
3. Save this signature in the notes – it will feed the DLL’s pattern scanner. Capture module timestamp (`ImageBase` + `TimeDateStamp`) to detect version drift later.

Optional: export the entire function to IDA/Ghidra for better pseudocode and easier field naming.

---

## 6. Deliverables for Stage 0

- [ ] Call stack screenshot or notes identifying the championship save function.
- [ ] Exact RVA (module offset) and signature pattern.
- [ ] Register map indicating which register carries the championship buffer pointer and size.
- [ ] Raw dump(s) of the buffer with before/after diffs to outline key fields.
- [ ] Initial struct definition document (`struct-map.json` or markdown table).
- [ ] Summary log (`stage0-log.md`) capturing steps, offsets, and observations.

When all items are checked, we can lock the hook target and move to Stage 1 (injector scaffolding).

---

## Quick Reference Commands (x64dbg)

```
// Breakpoints
bp kernel32!WriteFile
bp -p kernel32!WriteFile           ; disable

// Hardware watchpoint on buffer (example address 0x0000012345600000)
hb 0x0000012345600000, r, 0x100

// Step instructions
F7  // step into
F8  // step over
Shift+F7 // step out

// Dump pointer
follow rbx in dump 0
savefile dump 0x100
```

Keep this notes file updated with each detective session so the later automation work has a clear reference.
