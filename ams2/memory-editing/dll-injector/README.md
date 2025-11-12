# AMS2 DLL Injector Plan

**Objective:** Build an injected helper that edits AMS2 championship data in-memory and exposes a zero-click control channel (hotkeys + IPC) for SimVox.ai.

## Architecture Overview

```
SimVox.ai Desktop ──> Injector Launcher ──> AMS2.exe
                     │                     │
                     │ injects DLL         │ patched runtime exposes
                     ▼                     ▼
                Injector DLL  <──IPC──>  SimVox.ai (named pipe or WebSocket)
``` 

**Key components**
1. **Injector Launcher (EXE)** – Finds the AMS2 process, injects the compiled DLL, and sets up a watchdog (re‑inject if the process respawns). No UI.
2. **Injected DLL** – Uses MinHook to intercept the championship save routine (or the function that buffers championship data). Provides two automation paths:
   - **IPC bridge:** Named pipe `\\.\pipe\SimVox.ai-ams2` coupled to a simple JSON protocol (`{"command": "applyChampionship", "payload": {...}}`).
   - **Hotkeys:** Registers one or two global hotkeys (e.g. `Ctrl+Shift+F9`) that apply the current preset directly from data cached inside the DLL.
3. **SimVox.ai client adapter** – Small service class that connects to the named pipe, sends championship presets, and (optionally) listens for status events.

## Development Stages

### Stage 0 – Research hooks
- Run AMS2 under a debugger and drop breakpoints on the functions that write the championship save (`default.championshipeditor.v1.00.sav`).
- Capture call stacks and register states to identify a stable target function and the data structure layout (championship buffer pointer, length, checksum calls).
- Dump the struct to a JSON file to reuse in the DLL and in SimVox.ai.

### Stage 1 – Prototype injector (C++)
1. Set up a Visual Studio solution with two projects:
   - `Ams2Injector.exe` (console launcher)
   - `Ams2Bridge.dll` (injected payload)
2. Add MinHook (submodule or NuGet) and a lightweight JSON lib (e.g. `nlohmann/json.hpp`).
3. Confirm you can inject and run a stub in AMS2:
   ```cpp
   BOOL APIENTRY DllMain(HMODULE hModule, DWORD reason, LPVOID) {
       if (reason == DLL_PROCESS_ATTACH) {
           DisableThreadLibraryCalls(hModule);
           MessageBeep(MB_OK); // TEMP: confirm injection works
       }
       return TRUE;
   }
   ```
4. Replace `MessageBeep` with a log file + pipe server once confirmed.

### Stage 2 – Hook and patch
- Create a struct that mirrors the championship block (`struct ChampionshipProfile { ... };`).
- Author a hook using MinHook:
  ```cpp
  using SaveFunc = void(__fastcall*)(ChampionshipProfile* profile);
  SaveFunc g_originalSave = nullptr;

  void __fastcall SaveHook(ChampionshipProfile* profile) {
      ApplyAutomation(profile); // inject our edits before save executes
      g_originalSave(profile);
  }
  ```
- Apply pattern scanning to locate `SaveFunc` each launch (signature compiled from Stage 0 disassembly).
- Keep a mutex around automation so hotkeys/IPC commands do not race against the actual save call.

### Stage 3 – IPC and preset handling
- Implement a named pipe server inside the DLL:
  ```cpp
  static const wchar_t* PIPE_NAME = L"\\\\.\\pipe\\SimVox.ai-ams2";
  // Spawn a worker thread on DLL attach that calls ConnectNamedPipe and loops over ReadFile.
  ```
- Message schema (JSON):
  ```json
  {
    "command": "applyChampionship",
    "payload": {
      "series": "GT3",
      "rounds": [ ... ],
      "pointsSystem": "fia_gt"
    }
  }
  ```
- Convert payload into the in-memory structure and cache it; the next hook invocation or hotkey press writes the data immediately.
- Optional outbound messages: `{ "event": "saveApplied" }`, `{ "event": "error", "details": "..." }`.

### Stage 4 – Hotkey layer
- Register with `RegisterHotKey(nullptr, 1, MOD_CONTROL | MOD_SHIFT, VK_F9);` in a dedicated message thread.
- When the hotkey fires, copy the last preset from DLL cache to the live game structure (or queue a pipe request to the hook thread).

### Stage 5 – Launcher polish
- Implement AMS2 detection by enumerating processes (`CreateToolhelp32Snapshot`).
- Inject via `CreateRemoteThread`/`LoadLibrary` using standard technique.
- If AMS2 is not running, block until it starts; auto-exit when AMS2 closes.
- Provide CLI flags for telemetry (`--log-level`, `--keep-alive`).

### Stage 6 – SimVox.ai integration
- Build a thin TypeScript/Node service that connects to `\\.\pipe\SimVox.ai-ams2` (using `node-named-pipe` or raw `net.createConnection` on Windows).
- Expose methods: `isBridgeActive()`, `pushChampionshipPreset(preset)`, `onEvent(handler)`.
- Add UI affordances: show connection status, button to reinstall bridge if injection failed.

## Security & Stability Notes
- **EAC/DRM:** Automobilista 2 is offline friendly, but create a backup of the executable before loading unsigned code.
- **Version bumps:** Pattern scanning must include fallback (bail out if signature not found to avoid patching wrong address).
- **Crash safety:** Wrap every hook call in `__try/__except` to stop propagating errors to the game.
- **Logging:** Write logs to `%LOCALAPPDATA%\SimVox.ai\ams2-dll-bridge.log` and keep a rotating size limit (~256 KB).

## Task Checklist
- [ ] Capture target function signature and struct layout (Stage 0).
- [ ] Scaffold Visual Studio solution with injector + DLL projects.
- [ ] Integrate MinHook and JSON parser.
- [ ] Implement DLL entry, pipe server, and test injection stub.
- [ ] Add function hook, pattern scan, and structure patching.
- [ ] Implement hotkey handling and automation logic.
- [ ] Ship the injector launcher (CLI) with auto-inject and watchdog.
- [ ] Build SimVox.ai IPC adapter and expose API.
- [ ] QA end-to-end: push preset → hotkey apply → confirm in-game.

---

**Next immediate action:** Continue Stage 0 reverse engineering to lock down the function signature; without that, the DLL can’t patch the right data.
