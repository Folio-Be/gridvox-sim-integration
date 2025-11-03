# AMS2 Race Configuration Automation


Automated race configuration tool for Automobilista 2 using UI automation.

## Features

- **Fully Automated**: Launch game, configure race, save, exit - no manual intervention
- **Batch Testing**: Run multiple configurations sequentially for testing
- **Logging & Screenshots**: Detailed logs and automatic screenshot capture
- **Emergency Abort**: `Ctrl+Alt+G` to stop automation immediately
- **JSON Configuration**: Define race settings in simple JSON format

## Requirements

- **AutoHotkey v2.0+** (installed automatically via setup)
- **Node.js 20+** (for batch runner and wrapper)
- **AMS2** installed via Steam
- **Resolution**: 1920x1080 (1440p support coming soon)
- **Language**: English UI

## Installation

1. **Install AutoHotkey** (already done):
   ```cmd
   winget install AutoHotkey.AutoHotkey
   ```

2. **Install Node dependencies**:
   ```cmd
   cd src/automation/node
   npm install
   ```

## Usage

### Single Configuration Test

1. **Edit configuration**: `src/automation/config/race-config.json`
   ```json
   {
     "track": "Spa-Francorchamps",
     "carClass": "GT3",
     "opponents": {
       "count": 20,
       "difficulty": "Hard"
     },
     "weather": "Light Rain",
     "timeOfDay": "Afternoon",
     "sessionLength": {
       "type": "laps",
       "value": 15
     }
   }
   ```


2. **Run automation**:
   ```cmd
   cd src/automation/node
   node index.js
   ```

### Batch Testing (Unattended)

Run multiple configurations automatically:

```cmd
cd src/automation/node
node batch-runner.js
```

This will:
- Run 5 predefined test configurations
- Wait 5 seconds between tests
- Generate a detailed JSON report
- Save logs and screenshots
- Exit with code 0 if ≥90% success rate

### Direct AutoHotkey Execution

```cmd
cd src/automation/ahk
AutoHotkey64.exe ams2-race-config.ahk
```

## Configuration Options

### Track Names
- `Interlagos`
- `Spa-Francorchamps`
- `Silverstone`
- `Nurburgring GP`
- `Curitiba`
- (more to be mapped)

### Car Classes
- `GT3`
- `Formula V10`
- `Stock Car`
- `Touring Cars`
- `Formula Classic`
- (more to be mapped)

### Weather Types
- `Clear`
- `Overcast`
- `Light Rain`
- `Heavy Rain`

### Time of Day
- `Morning`
- `Noon`
- `Afternoon`
- `Dusk`
- `Night`

### Session Length
```json
{"type": "laps", "value": 10}
{"type": "time", "value": 30}  // 30 minutes
```

## Calibration (REQUIRED)

**The automation script contains PLACEHOLDER coordinates.** Before running:

1. **Launch AMS2** in windowed 1920x1080 mode
2. **Navigate to Custom Race** screen manually
3. **Record screen coordinates** for:
   - Main menu buttons
   - Track selection menu
   - Car class selection
   - Opponent configuration sliders
   - Weather menu
   - Save/confirm buttons

4. **Update coordinates** in `ahk/ams2-race-config.ahk`:
   ```autohotkey
   ; Example: Click track selection at x=640, y=400
   Click(640, 400)
   ```

### Calibration Tool (Coming Soon)
A helper tool to record coordinates interactively.

## File Structure

```
src/automation/
├── ahk/
│   └── ams2-race-config.ahk     # Main AutoHotkey script
├── node/
│   ├── index.js                  # Node wrapper
│   ├── batch-runner.js           # Batch testing
│   └── package.json
├── config/
│   └── race-config.json          # Current race config
├── logs/
│   ├── 2025-11-03.log            # Daily logs
│   └── batch-report.json         # Batch test results
└── screenshots/
    ├── 20251103-143022_success.png
    └── 20251103-143045_error.png
```

## Logs

Logs are written to `src/automation/logs/YYYY-MM-DD.log`:

```
2025-11-03 14:30:15 | === AMS2 Race Configuration Automation Started ===
2025-11-03 14:30:16 | Configuration loaded: JSON Object
2025-11-03 14:30:17 | Game window focused
2025-11-03 14:30:20 | Navigating to Custom Race...
2025-11-03 14:30:25 | Configuring race parameters...
2025-11-03 14:30:35 | === Race configuration completed successfully ===
```

## Emergency Abort

Press `Ctrl+Alt+G` at any time to immediately stop the automation.

## Troubleshooting

### Game Not Detected
- Ensure AMS2 window title is "Automobilista 2"
- Check game is running (not minimized)
- Verify Steam app ID: `1066890`

### Clicks Missing Targets
- **Calibrate coordinates** for your resolution
- Check game is in correct state (main menu, not in race)
- Increase delays in CONFIG section if system is slow

### Automation Hangs
- Press `Ctrl+Alt+G` to abort
- Check logs for last successful step
- Verify no unexpected dialog boxes

### Configuration Not Applied
- Check JSON syntax in `race-config.json`
- Verify track/car names match game exactly
- Increase `DefaultDelay` for slower systems

## Roadmap

### Week 1 (Current)
- [x] Basic automation framework
- [x] AutoHotkey script with game launch
- [x] Node wrapper for programmatic control
- [x] Batch testing runner
- [ ] Coordinate calibration tool
- [ ] Test on real AMS2 instance

### Week 2-3
- [ ] Complete coordinate mapping for 1920x1080
- [ ] Image-based anchors (OpenCV/template matching)
- [ ] OCR for state validation (Tesseract)
- [ ] Retry logic and error recovery
- [ ] 90%+ success rate on test machine

### Week 4+
- [ ] 2560x1440 resolution profile
- [ ] GridVox desktop integration
- [ ] Voice command mapping
- [ ] Confirmation UI before applying changes

## Integration with GridVox

Future integration will allow:

```typescript
// Voice: "Configure race at Spa with GT3 cars in the rain"
gridvox.raceConfig.apply({
  track: "Spa-Francorchamps",
  carClass: "GT3",
  weather: "Light Rain"
});
// Shows confirmation dialog → User approves → Automation runs
```

## Contributing

When adding track/car mappings:
1. Test configuration in-game manually first
2. Add to JSON config with exact name
3. Update README documentation
4. Submit with screenshot proof

## License

MIT - GridVox Team 2025
