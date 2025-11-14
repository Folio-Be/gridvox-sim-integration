## Sim Profile Schema

Each simulator profile describes how to capture, tag, and validate recordings.

```json
{
  "id": "ams2",
  "windowTitle": "Automobilista 2",
  "resolution": [1920, 1080],
  "framerate": 60,
  "capture": {
    "defaultRegion": "full_ui",
    "cursorPollHz": 12,
    "regionPresets": {
      "full_ui": {
        "crop": [0, 0, 1920, 1080],
        "description": "Entire menu space"
      },
      "hud_strip": {
        "crop": [0, 860, 1920, 220],
        "description": "HUD-only capture"
      }
    }
  },
  "bookmarkHotkey": {
    "ctrl": true,
    "shift": false,
    "key": "L",
    "noteMode": "stdin"
  },
  "paths": {
    "recordingsDir": "data/recordings",
    "capturesDir": "data/captures"
  },
  "taxonomy": {
    "elements": ["car_tile", "track_tile", "dropdown", "button"]
  },
  "validation": {
    "requiredProcesses": ["AMS2AVX.exe"],
    "windowTitlePatterns": ["Automobilista 2", "Automobilista 2 - Championship"],
    "resolutionWhitelist": [[1920, 1080]]
  }
}
```

- `capture.regionPresets` lets you define named crops (full screen vs HUD) and specify which one is default for extraction.
- `bookmarkHotkey.noteMode` supports `stdin` (prompt for a console note) or `none` (default, no prompt). Use `stdin` for quick annotations during recording.
- `validation.windowTitlePatterns`/`requiredProcesses` power the `pnpm run validate-profile` CLI so you can verify configs before recording.
