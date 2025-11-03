# Deep Research: AMS2 Race Configuration (Direct File + UI Automation)

Date: Nov 3, 2025
Authors: GridVox Desktop Team

Goal
Provide an evidence-based map of options and feasibility for AMS2 race session and championship configuration through:
1) Direct File Manipulation (race/championship config file reverse engineering)
2) UI Automation (menu navigation + input simulation for race setup screens)

---

Section A — AMS2 Race Configuration File Manipulation

A1. Observed Files & Structure
- Location: C:\Users\<user>\OneDrive\Documents\Automobilista 2\savegame\<steamid>\automobilista 2\
- Key file types:
  - **Single Race:** CustomRace.srs (or similar session definition files)
  - **Championships:** *.xml or *.srs championship files
  - **Session Settings:** Track, car class, opponent count/difficulty, weather, time of day, session length
- Likely format: XML or binary with track IDs, car class IDs, opponent configuration, weather presets

A2. Likely Encoding & Patterns
- XML structure (most likely): Track name/ID, car class, opponent list, weather blocks
- Binary alternative: Fixed-size headers with offsets to track/car/weather sections
- Track/car references: String names or integer IDs mapped to game database
- Weather: JSON-like or structured blocks (temperature, rain %, clouds, time progression)
- Opponent configuration: AI difficulty, aggression, count, specific opponent IDs

A3. Evidence-Gathering Protocol (repeatable)
- Create baseline custom race with known settings (e.g., Interlagos, GT3, 20 opponents, clear day, 10 laps)
- Save; capture the config file
- Change ONE parameter (e.g., track to Spa); save as variant
- Hex/text-diff to identify changed regions
- Repeat for: car class, opponent count, weather presets, time of day, session length
- Build mapping table (parameter → file location/structure)

A4. Tooling
- Text editor: VSCode, Notepad++ (if XML/JSON)
- Hex editor: HxD / 010 Editor (if binary)
- Diff tools: Beyond Compare, WinMerge
- Scripting: Python (xml.etree, struct), Node (xml2js, Buffer) for parsers
- Validation: Load modified files in-game to confirm acceptance

A5. Risks & Unknowns
- File format may be proprietary binary requiring extensive RE
- Game may validate checksums or signatures
- Track/car IDs may not be human-readable
- Championship files may have complex multi-race structures
- Game may cache settings requiring restart

A6. Validation Strategy
- Always backup original files
- Test modifications with minimal changes first
- Build corpus of 20+ race configurations across tracks/cars
- Verify game loads modified configs without errors
- Document any version-specific format changes

A7. Expected Outcome
- Stable read/write library for race configuration files
- Documented schema for AMS2 session/championship files
- CLI utility for programmatic race configuration

---

Section B — UI Automation (Input Simulation)

B1. Constraints & Realities
- No official write APIs; UI automation is universal fallback
- Requires consistent resolution, UI theme, and input focus
- Must navigate race setup menus (not garage/vehicle setup)

B2. Tooling Options
- Windows-native: AutoHotkey v2 (stable, robust)
- Node: robotjs, nut.js (image-based anchors), win32 APIs for window focus
- Python: pywinauto, pyautogui + OpenCV for image matching, Tesseract OCR
- Screen state: OpenCV template matching to locate buttons/labels

B3. Robustness Techniques
- Anchor by visual elements (e.g., "Custom Race", "Track Selection") with image matching
- Timeouts and retries for each step
- Resolution profiles: 1080p, 1440p; store coordinates per profile
- Language profiles: default to English; detect via OCR if needed
- Pre-flight checks: ensure AMS2 at main menu or appropriate screen
- Safety: user-confirmed action before automation starts

B4. Flow Outline (example: Configure custom race - Spa, GT3, 20 opponents, rain)
1) Ensure game focused; navigate to main menu
2) Select "Custom Race" or "Race Weekend"
3) Navigate to Track Selection; find and select "Spa-Francorchamps"
4) Navigate to Car/Class Selection; select "GT3"
5) Navigate to Opponent Configuration; set count to 20, adjust difficulty
6) Navigate to Weather; select "Rain" preset or configure manually
7) Confirm/start race or save configuration
8) Notify success/failure and time taken

B5. Instrumentation & Telemetry
- Capture screenshots at each major step for debugging
- Log timings, success rates, and retries
- Adjustable delays; calibrate per machine

B6. Limitations
- Fragile vs UI updates; must maintain per-version profiles
- Menu navigation paths may vary by game mode
- Requires game to be at specific starting state

B7. Expected Outcome
- Reliable automation macro achieving >90% success on supported profiles
- Reusable framework for other sims if needed

---

Section C — Hybrid Approach
- Start with UI automation for immediate functionality
- Pursue file format RE in parallel for more reliable long-term solution
- Offer user toggle: "Apply via UI" vs "Apply via file (experimental)"
- When file manipulation matures, switch default to file method
- For other sims (AC/ACC), investigate their race configuration file formats similarly

---

Appendix — References
- Reiza forum threads: custom race/championship file discussions
- Community modding guides: track/car ID mappings, file format documentation
- Tools: HxD, 010 Editor, Python xml.etree, Node xml2js, OpenCV, Tesseract

