# Risk Log — AMS2 Race Configuration Subproject

Date: Nov 3, 2025
Owner: GridVox Desktop Team

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|----|------|------------|--------|------------|-------|--------|
| R1 | Config file format unknown | High | High | Use UI path until identified; RE config file structure | RE Lead | Open |
| R2 | Config file corruption | Medium | High | Auto-backups, atomic writes, restore flow | RE Lead | Open |
| R3 | UI update breaks automation | Medium | Medium | Versioned anchors, self-test, fast hotfix | Automation Lead | Open |
| R4 | Resolution/Scaling variance | High | Medium | Profile sets for 1080p/1440p; disable DPI scaling | Automation Lead | Open |
| R5 | OneDrive sync delays | Medium | Medium | fsync + delay; warn user; disable sync for folder (docs) | QA | Open |
| R6 | Localization mismatch | Medium | Low | Limit V1 to English, OCR fallback, detect language early | QA | Open |
| R7 | Track/Car ID mapping incomplete | Medium | Medium | Build reference database; validate against game files | RE Lead | Open |
| R8 | User frustration (slow UI) | Medium | Medium | Clear UX: pre-race only; progress HUD; fallback to file when ready | PM | Open |
| R9 | AMS2 version drift | Medium | Medium | Check title build; run anchors self-test; alert for re-capture | QA | Open |
| R10 | Invalid track/car combinations | Low | Medium | Validate selections against game rules; graceful error handling | RE Lead | Open |

