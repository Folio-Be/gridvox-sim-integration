# Lab Protocol: AMS2 Race Configuration File Reverse Engineering

Objective
Map AMS2 race/championship configuration file structure to enable safe read/write of session parameters.

Prereqs
- AMS2 installed; access to Custom Race and Championship creation
- Text/hex editor (VSCode/HxD/010 Editor), diff tool
- Spreadsheet for mapping (parameter, location, type, values)

Dataset Creation (Repeatable)
1) Pick a baseline configuration (e.g., Custom Race: Interlagos, GT3, 15 opponents, clear, 10 laps)
2) Save configuration as "BASELINE"
3) Change ONE parameter (e.g., track to Spa); save as "TRACK_SPA"
4) Exit to ensure config written; copy files to working folder
5) Repeat for 20+ parameters:
   - Track selection (5+ different tracks)
   - Car class (GT3, Formula, Stock Car, etc.)
   - Opponent count (5, 10, 15, 20, 30)
   - AI difficulty (easy, medium, hard, custom)
   - Weather (clear, overcast, rain light, rain heavy)
   - Time of day (morning, noon, afternoon, dusk, night)
   - Session length (laps, minutes, time scaling)
6) Create championship configs with multiple races

Analysis Steps
- Diff: BASELINE vs TRACK_SPA → note changed regions
- For XML: locate track name/ID elements, structure
- For binary: hypothesize field types, offsets, encoding
- Identify track/car ID mapping (strings vs integers)
- Document weather structure and available presets
- Record in mapping sheet: parameter, location, type, valid values

Schema Documentation
- Create structured schema (JSON/XML) documenting file format
- Map track names to IDs, car classes to IDs
- Document opponent configuration structure
- Document weather/time blocks and valid ranges
- Note any version identifiers in files

Validation
- Implement script (Python/Node) to modify one known parameter
- Load in-game; confirm change applied correctly
- Test edge cases (min/max values, unknown tracks)
- Iterate; expand mapping incrementally

Deliverable
- v1.0 schema covering ≥10 race configuration parameters
- Documentation of file format (XML schema or binary structure)
- Scripts: `read_race_config.py` and `write_race_config.py` (PoC)
- Track/car ID mapping reference

Quality Gates
- Two reviewers replicate mapping with different configurations
- All edits pass in-game validation on fresh loads

