# Voice Input Setup Guide

## Overview

The watcher now supports **voice annotation input** to prevent AMS2 focus loss! Instead of typing annotations (which causes AMS2 to lose focus and create spurious save file changes), you can now just speak your annotations.

## Benefits

- **No focus loss**: Keep AMS2 window active while annotating
- **Cleaner data**: Prevent 0-byte changes caused by window focus loss
- **Faster workflow**: Just speak instead of typing
- **Fallback support**: Automatically falls back to keyboard if voice fails

## Requirements

### 1. Install Dependencies

```bash
cd /home/user/SimVox.ai-sim-integration/ams2/savegame-reverse-engineering
npm install
```

This installs:
- `chokidar` - File watching
- `node-record-lpcm16` - Audio recording
- `vosk` - Offline speech recognition (no API keys needed!)

### 2. Install Audio Recording Tool (Windows)

The voice input requires SoX (Sound eXchange) to record audio:

**Option A: Using Chocolatey (Recommended)**
```powershell
choco install sox.portable
```

**Option B: Manual Installation**
1. Download SoX from: https://sourceforge.net/projects/sox/files/sox/14.4.2/
2. Extract to `C:\Program Files\sox`
3. Add to PATH: `C:\Program Files\sox`
4. Verify: Open a new terminal and run `sox --version`

**Option C: Using Windows Alternative**
If SoX doesn't work, edit `voiceInput.js` line 32 and change:
```javascript
recordProgram: 'rec', // Change to 'rec' for Windows
```

### 3. Download Vosk Speech Model

The tool uses Vosk for offline speech recognition. You need to download a language model:

**EASY WAY (Automatic Download):**
```bash
npm run setup-voice
```
This will automatically download and extract the small model (40MB).

For the large model (1.8GB):
```bash
npm run setup-voice-large
```

**MANUAL WAY:**
1. Go to: https://alphacephei.com/vosk/models
2. Download: `vosk-model-small-en-us-0.15.zip` (40MB) - Recommended for speed
   - Or `vosk-model-en-us-0.22.zip` (1.8GB) - For better accuracy
3. Extract the zip file
4. Place the extracted folder in: `/home/user/SimVox.ai-sim-integration/ams2/savegame-reverse-engineering/vosk-model-small-en-us-0.15`

**Expected folder structure:**
```
ams2/savegame-reverse-engineering/
├── watcher.js
├── voiceInput.js
├── package.json
└── vosk-model-small-en-us-0.15/
    ├── am/
    ├── conf/
    ├── graph/
    ├── ivector/
    └── README
```

**Alternative Models:**
- **Small (40MB)**: `vosk-model-small-en-us-0.15` - Fast, good for simple phrases
- **Large (1.8GB)**: `vosk-model-en-us-0.22` - More accurate, slower
- **Other languages**: Check https://alphacephei.com/vosk/models

If using a different model, update the path in `voiceInput.js` line 14:
```javascript
const MODEL_PATH = path.join(__dirname, 'your-model-name-here');
```

## Usage

### Start with Voice Input (Default)

```bash
npm run watch
```

When you hear a BEEP:
1. Stay in AMS2 (no need to switch windows!)
2. Just **speak** what you did: "changed to a mercedes"
3. The tool will transcribe your speech automatically
4. Continue playing AMS2

### Start with Keyboard Only

If you want to disable voice input, edit `watcher.js` line 14:
```javascript
const USE_VOICE_INPUT = false; // Set to false to disable voice
```

Then start normally:
```bash
npm run watch
```

## Voice Input Behavior

### Successful Voice Recognition
```
🎤 Listening... (speak now, then pause)
✅ Heard: "changed to a mercedes"
   Saved: "changed to a mercedes"
```

### Voice Timeout or Failure
```
🎤 Listening... (speak now, then pause)
⏭️  No speech detected
   ⌨️  Voice input failed/skipped. Type annotation or press ENTER to skip:
>
```

In this case, you can:
- Type your annotation as usual
- Or just press ENTER to skip

## Troubleshooting

### "Vosk model not found" Error

**Problem**: The tool can't find the speech recognition model
**Solution**:
1. Download the model from https://alphacephei.com/vosk/models
2. Extract to the correct folder (see step 3 above)
3. Verify the folder name matches `MODEL_PATH` in `voiceInput.js`

### "Microphone error" or "sox not found"

**Problem**: Audio recording tool not installed
**Solution**:
1. Install SoX (see step 2 above)
2. Restart your terminal after installation
3. Verify: `sox --version`

### Voice Not Recognized

**Problem**: Tool times out without recognizing speech
**Possible causes**:
- Microphone not working or not set as default
- Speaking too quietly or too far from mic
- Background noise interfering
- Wrong audio input device selected

**Solutions**:
1. Check Windows microphone settings
2. Test your mic in Windows Sound settings
3. Speak clearly and at normal volume
4. Try adjusting the timeout in `voiceInput.js` line 149: `annotation = await getVoiceInput(5000);` (increase from 5000ms to 10000ms)

### Voice Input Always Falls Back to Keyboard

**Problem**: Voice input initializes but always falls back
**Solution**:
- Check that the Vosk model is correctly installed
- Verify microphone permissions in Windows
- Check console for error messages

### Node Module Errors

**Problem**: `Cannot find module 'vosk'` or similar
**Solution**:
```bash
cd /home/user/SimVox.ai-sim-integration/ams2/savegame-reverse-engineering
npm install
```

## Configuration Options

### Adjust Voice Timeout

Edit `watcher.js` line 149 to change how long the tool listens:
```javascript
annotation = await getVoiceInput(10000); // 10 seconds instead of 5
```

### Use Different Model

Edit `voiceInput.js` line 14:
```javascript
const MODEL_PATH = path.join(__dirname, 'vosk-model-en-us-0.22'); // Larger model
```

### Toggle Voice/Keyboard Mode

Edit `watcher.js` line 14:
```javascript
const USE_VOICE_INPUT = true; // true = voice, false = keyboard only
```

## How It Works

1. **File Change Detected**: Chokidar detects AMS2 save file change
2. **Beep + Snapshot**: Tool beeps and saves file snapshot
3. **Voice Input**: If enabled and available:
   - Activates microphone
   - Records audio for up to 5 seconds
   - Uses Vosk to transcribe speech locally (offline)
   - Saves transcribed text as annotation
4. **Fallback**: If voice fails, falls back to keyboard input
5. **Log Update**: Annotation saved to `annotations.log`

## Privacy Note

Vosk runs **completely offline** on your local machine:
- No internet connection required for transcription
- No audio sent to cloud services
- No API keys needed
- All processing happens locally

## Performance

- **Small model (40MB)**: Fast, <1 second transcription, good accuracy for short phrases
- **Large model (1.8GB)**: Slower, 1-3 seconds transcription, better accuracy for complex phrases

For this use case (short action descriptions), the small model is recommended.

## Example Session

```bash
$ npm run watch

🔍 AMS2 Savegame Watcher Starting...
📁 Watching: C:\Users\tomat\OneDrive\Documents\Automobilista 2\savegame
📝 Annotations: annotations.log
📸 Snapshots: snapshots/

🎤 Initializing voice input...
✅ Voice input ready!

🎤 When you hear a BEEP, just SPEAK what you did in AMS2!
   (No typing needed - your annotation will be captured by voice)
   💡 Tip: Keep AMS2 in focus, no need to switch windows!

✅ Watcher active!

[You change car in AMS2]
[BEEP]

📄 File: default.localsettings.v1.03.sav
📸 Snapshot: 1762245123456_default.localsettings.v1.03.sav
────────────────────────────────────────────────────────────────────────────────
💬 ANNOTATION for "default.localsettings.v1.03.sav":
   🎤 Speak what you did (or press ENTER to skip)...
────────────────────────────────────────────────────────────────────────────────
🎤 Listening... (speak now, then pause)
✅ Heard: "changed to a mercedes"

✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
   Saved: "changed to a mercedes"
✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅

👂 Listening for more changes...
```

## Summary

With voice input:
- **Stay focused on AMS2** - no window switching
- **No spurious save changes** - no focus loss artifacts
- **Faster workflow** - speak instead of type
- **Works offline** - no cloud dependencies
- **Automatic fallback** - keyboard still works if needed

## Need Help?

If voice input isn't working:
1. Check all requirements are installed (npm packages, SoX, Vosk model)
2. Verify microphone works in Windows
3. Check console for error messages
4. Try keyboard mode as fallback (set `USE_VOICE_INPUT = false`)

For more help, check the main README.md or create an issue.
