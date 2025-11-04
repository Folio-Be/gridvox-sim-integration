# 🚀 QUICK START - Tomorrow Morning

## 1️⃣ Install SoX (2 minutes)
```powershell
choco install sox.portable
sox --version  # Verify
```

## 2️⃣ Start Testing (3 minutes)
```bash
cd C:\DATA\GridVox\gridvox-sim-integration\ams2\savegame-reverse-engineering
run-watcher.bat
```

## 3️⃣ Test Voice (10 minutes)
1. Open AMS2
2. Make a change (select car/track)
3. Wait for BEEP 🔔
4. Speak: "Selected BMW M4 GT3"
5. Check transcription appears

## 4️⃣ Check Results
```bash
type annotations.log
npm run analyze
```

---

## 📋 Full Documentation
- **TODO-TOMORROW.md** - Detailed instructions
- **VOICE-TEST-PLAN.md** - Complete test scenarios  
- **SESSION-NOTES-NOV-4-2025.md** - Everything we did today

## 🆘 If Problems
- No SoX? → Will use keyboard instead
- Not transcribing? → Check microphone permissions
- Crashes? → Check error messages, reinstall packages

---

**Total Time: ~15 minutes to start testing** ⚡

Location: `C:\DATA\GridVox\gridvox-sim-integration\ams2\savegame-reverse-engineering\`

