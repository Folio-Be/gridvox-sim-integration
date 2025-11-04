# Voice Input Test Plan

## Test Session: [DATE]

### Pre-Test Checklist
- [ ] SoX installed and verified
- [ ] Microphone working (test in Windows Sound settings)
- [ ] AMS2 installed and accessible
- [ ] Watcher starts without errors

### Test 1: Basic Voice Recognition
**Goal:** Verify voice transcription works

1. Start watcher: `run-watcher.bat`
2. Trigger a file change in AMS2
3. When BEEP sounds, speak: "Test annotation number one"
4. Record result:

```
Spoken: "Test annotation number one"
Heard:  _________________________________
Accuracy: ☐ Perfect  ☐ Good  ☐ Fair  ☐ Poor
Latency: _____ ms
```

### Test 2: Racing Terminology
**Goal:** Test accuracy on car/track names

| You Say | Transcription | Accuracy |
|---------|---------------|----------|
| "Selected BMW M4 GT3" | | ☐ ✓ ☐ ✗ |
| "Changed to Spa Francorchamps" | | ☐ ✓ ☐ ✗ |
| "Set tire pressure to 27 PSI" | | ☐ ✓ ☐ ✗ |
| "Increased front downforce" | | ☐ ✓ ☐ ✗ |
| "Switched to dry tires" | | ☐ ✓ ☐ ✗ |

### Test 3: Background Noise
**Goal:** Test in realistic gaming environment

Test with:
- [ ] Game audio at normal volume
- [ ] Discord/voice chat active
- [ ] Music playing

Results:
```
False positives: _____
Missed commands: _____
Overall usability: ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor
```

### Test 4: Rapid-Fire Annotations
**Goal:** Multiple quick changes

1. Make 5 rapid changes in AMS2
2. Annotate each one with voice
3. Check all transcriptions

```
Success rate: ___/5
Any dropped commands? ☐ Yes ☐ No
```

### Test 5: Long Annotations
**Goal:** Test longer phrases

Speak: "I changed the brake bias from 55 percent to 58 percent to improve rear stability under braking"

```
Transcription: _________________________________
_________________________________
_________________________________

Complete? ☐ Yes ☐ No
Accurate? ☐ Yes ☐ No
```

## Performance Metrics

### Transcription Quality
- Accuracy: ____%
- Error types:
  - [ ] Missed words
  - [ ] Wrong words
  - [ ] Extra words
  - [ ] Poor punctuation

### Performance
- Average latency: _____ ms
- CPU usage during transcription: _____%
- RAM usage: _____ MB

### User Experience
- Ease of use: ☐ 1 ☐ 2 ☐ 3 ☐ 4 ☐ 5
- Would use regularly? ☐ Yes ☐ No
- Prefer over typing? ☐ Yes ☐ No

## Issues Encountered

1. _________________________________
2. _________________________________
3. _________________________________

## Recommendations

### Keep Using Vosk?
☐ Yes - it works well
☐ No - switch to Whisper

**Reasons:**
_________________________________
_________________________________

### Improvements Needed
- [ ] _________________________________
- [ ] _________________________________
- [ ] _________________________________

## Comparison: Vosk vs Whisper (for POC-05)

| Feature | Vosk (Current) | Whisper (POC-05) |
|---------|----------------|------------------|
| Accuracy | ___/10 | ? |
| Speed | ___/10 | ? |
| Model Size | 40MB | 74MB |
| CPU Usage | ___% | ? |
| Suitable for Racing? | ☐ Yes ☐ No | TBD |

## Next Actions

Based on testing:

### If Successful ✅
- [ ] Document best practices
- [ ] Implement POC-05 with Whisper
- [ ] Compare Vosk vs Whisper performance
- [ ] Integrate with LLM (POC-03)

### If Issues ⚠️
- [ ] Debug specific problems
- [ ] Adjust model parameters
- [ ] Consider push-to-talk only
- [ ] Investigate Whisper.cpp

## Sample Annotations to Test

### Car Changes
- "Selected the Porsche 911 GT3 R"
- "Switched to Mercedes AMG GT3"
- "Changed to Audi R8 LMS"

### Track Selection  
- "Selected Brands Hatch circuit"
- "Changed to Silverstone Grand Prix"
- "Switched to Nürburgring Nordschleife"

### Setup Changes
- "Increased rear wing by two clicks"
- "Lowered ride height by 5 millimeters"
- "Softened front springs"
- "Changed gear ratios for top speed"

### Session Types
- "Started practice session"
- "Beginning qualifying"
- "Race started with 20 laps"

## Files to Review After Testing

```bash
# View all annotations
type annotations.log

# Check specific snapshot
dir snapshots\

# Run analysis
npm run analyze

# Check for errors
type error.log
```

## Test Complete!

Date: _____________
Duration: _____________
Overall Success: ☐ Yes ☐ Partial ☐ No

Notes:
_________________________________
_________________________________
_________________________________
_________________________________

---

**Tester Signature:** _____________

