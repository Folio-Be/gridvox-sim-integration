# Attack Plan: AMS2 Race Configuration Subproject

Date: Nov 3, 2025
Owner: GridVox Desktop Team

Objective
Deliver two working paths to configure AMS2 single-player race sessions and championships:
1) Direct file manipulation (race/championship config files) with backups and validation
2) UI automation macro with >90% reliability on 1080p/1440p (English UI)

Milestones
- M1: Research environment ready (tools installed, dataset captured)
- M2: UI automation MVP configures a simple race (track + car change) reliably
- M3: Race config file mapping of 10 core parameters; format documented
- M4: Race config read/write library with validation and CLI
- M5: GridVox integration (voice → confirmation → apply via chosen method)
- M6: Beta test report (10 tracks x 5 car classes x weather variants); success ≥95%

Timeline (aggressive)
- Week 1: M1, M2 (automation MVP)
- Weeks 2–4: M3 (file format mapping and schema)
- Week 5: M4 (library + CLI)
- Week 6: M5 (integration)
- Week 7: M6 (beta + hardening)

Team & Roles
- RE Lead: File format mapping, schema documentation
- Automation Lead: AutoHotkey/Node automation, image anchors
- QA: Corpus generation, reproducible lab runs, metrics

Workstreams

W1 — Lab Protocol & Dataset
- Create 50+ controlled race configurations by toggling one parameter at a time
- Tracks: Interlagos, Spa, Silverstone, Curitiba, Goiânia, Nürburgring
- Car classes: GT3, Formula V10, Stock Car, Formula Trainer, Touring Cars
- Variables: opponent count, AI difficulty, weather presets, time of day, session length
- Capture: before/after config files; annotate parameter and expected deltas

W2 — UI Automation MVP
- Choose tool: AutoHotkey v2 (primary) + Node wrapper
- Build resolution profile for 1920x1080; store coordinates/anchors
- Steps: Main Menu → Custom Race → Track Select → Car Select → Configure → Start/Save
- Add retries and screen capture on failure

W3 — UI Automation Hardening
- Add 2560x1440 profile; auto-detect resolution
- Add OCR fallback (Tesseract) to confirm labels
- Add window title detection and focus via WinAPI
- Add watchdog to abort on unexpected state

W4 — Race Config File Reverse Engineering
- Identify config file locations and formats (XML/binary)
- Diff parameter changes; maintain mapping sheet (parameter, location, type)
- Document track IDs, car class IDs, weather structure, opponent configuration
- Draft parser template/schema; keep version-gated sections

W5 — Race Config Library & CLI (Node + TypeScript)
- Parser: Read race/championship config files, extract parameters
- Serializer: Write updated values; preserve structure and unknowns
- Safety: Backup existing files; write temp + atomic replace
- CLI: `gvx-ams2-race read/write` with JSON I/O

W6 — GridVox Integration
- Add RaceConfigService with two drivers: `ams2File`, `ams2Ui`
- Confirmation UI: show race configuration diff and prompt user
- Voice intents: map common phrases to race parameters (track, car, weather, opponents)
- Session note: configuration applied before session start

Risks & Mitigations
- Unknown file format → block write path until solved; use UI path as fallback
- OneDrive file sync delays → fsync and post-write wait; detect file locks
- Game caching configs → require menu reload or game restart; document in UI
- Localization differences → restrict V1 to English; detect language early
- UI changes by patch → version the automation profiles; add self-check images

Success Criteria (Exit)
- 10+ parameters supported via file path (track, car class, opponents, weather, time, session length)
- 0 corrupted config incidents in 200+ automated test writes
- UI automation success rate ≥90% across 3 machines (1080p/1440p)
- Integration demo: voice → confirm → configured race → verified

Dependencies
- Tools: Text/Hex editors, Python (xml.etree), Node 20+, AutoHotkey v2, Tesseract, OpenCV
- Test hardware: 2 PCs with AMS2 installed, OneDrive default paths

Appendix — CLI Sketch

```
# Read a race config to JSON
npx gvx-ams2-race read "C:\\Users\\<user>\\...\\CustomRace.srs" > race.json

# Update track and opponent count, write back safely
npx gvx-ams2-race write --track spa --opponents 20 "C:\\...\\CustomRace.srs"
```

