# Quick Start - Voice-Enabled Savegame Watcher

## Run Now (Two Clicks!)

1. Double-click: **`run-watcher.bat`**
2. Done! Watcher is running with voice support!

## What You'll See

```
🎤 Initializing voice input...
✅ Voice input ready!
👂 Listening for file changes...
```

## Workflow

1. **Watcher runs** → monitoring AMS2 saves
2. **You change something in AMS2** → select car, track, etc.
3. **BEEP!** → file changed detected
4. **Speak** what you did (or press ENTER to type)
5. **Continue** → repeat for each change

## Stop Watcher

Press **Ctrl+C** in the terminal

## Analyze Results

```cmd
cd C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\savegame-reverse-engineering
npm run analyze
```

## Voice Not Working?

Install SoX:
```cmd
choco install sox.portable
```

Watcher falls back to keyboard automatically if voice unavailable.

## Files

- `annotations.log` - Your annotations
- `snapshots/` - File versions
- `analysis-report.md` - Generated analysis

## See Also

- `README.md` - Full documentation
- `VOICE_SETUP.md` - Voice setup details
- `SETUP-COMPLETE.md` - Setup status

