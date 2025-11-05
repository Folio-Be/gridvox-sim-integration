# Changelog

All notable changes to @gridvox/sim-detection will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-05

### Added

- Initial release of GridVox Simulator Detection Library
- Steam library detection via VDF parsing
- Epic Games Store detection via manifest parsing
- EA App/Origin detection via Windows registry
- Windows registry-based detection for manual installations
- Filesystem scanner for custom installation paths
- Process monitoring for runtime simulator detection
- Built-in caching with configurable TTL
- Support for 20+ racing simulators including:
  - iRacing
  - Assetto Corsa, ACC, AC EVO
  - rFactor 2
  - Automobilista 2
  - BeamNG.drive
  - RaceRoom Racing Experience
  - Project CARS series
  - DiRT Rally 2.0
  - EA SPORTS WRC
  - Le Mans Ultimate
  - F1 series (22, 23, 24)
  - Truck simulators (ATS, ETS2)
- Cross-platform support (Windows, macOS, Linux)
- TypeScript definitions
- Comprehensive documentation and examples

### Technical Details

- Uses `@node-steam/vdf` for Steam library parsing
- Uses `regedit` for Windows registry access
- Uses `node-cache` for result caching
- Parallel detection for maximum performance
- Deduplication of results across multiple detectors
- Error handling and reporting

## [0.1.0] - 2025-01-05

### Added (Post-Release Fixes)
- Richard Burns Rally support (with RallySimFans mod detection)
- F1 25 support (Steam AppID: 3059520)
- WRC 9 support (Steam AppID: 1272320, Epic: Quartz)

### Fixed (Post-Release Fixes)
- EA SPORTS WRC executable path (now correctly detects at `WRC/Binaries/Win64/WRC.exe`)
- Assetto Corsa EVO detection for versioned folder names and subdirectory executables

### Testing
- Validated with 7 real installations across Steam, Epic, and manual sources
- Performance: 212-229ms full detection time
- All edge cases successfully handled

## [Unreleased]

### Planned

- GOG Galaxy detection
- Microsoft Store detection
- Additional simulator definitions
- Launcher integration APIs
- Auto-update detection via file system watchers
- Game version extraction improvements
- DLC/content pack detection
