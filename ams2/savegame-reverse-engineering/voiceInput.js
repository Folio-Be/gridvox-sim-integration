import recorder from 'node-record-lpcm16';
import vosk from 'vosk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vosk model path - download from https://alphacephei.com/vosk/models
const MODEL_PATH = path.join(__dirname, 'vosk-model-small-en-us-0.15');

let model = null;
let recognizer = null;

// Initialize Vosk model
async function initializeVosk() {
  if (!fs.existsSync(MODEL_PATH)) {
    console.log('⚠️  Vosk model not found!');
    console.log('📥 Please download the model from:');
    console.log('   https://alphacephei.com/vosk/models');
    console.log('   Recommended: vosk-model-small-en-us-0.15 (40MB)');
    console.log('📁 Extract it to:', MODEL_PATH);
    console.log('');
    console.log('💡 Falling back to keyboard input for now...');
    return false;
  }

  try {
    vosk.setLogLevel(-1); // Suppress vosk logs
    model = new vosk.Model(MODEL_PATH);
    recognizer = new vosk.Recognizer({ model: model, sampleRate: 16000 });
    return true;
  } catch (err) {
    console.error('❌ Failed to initialize Vosk:', err.message);
    return false;
  }
}

// Record and transcribe speech
async function getVoiceInput(timeout = 5000) {
  if (!model || !recognizer) {
    return null; // Fall back to keyboard
  }

  return new Promise((resolve, reject) => {
    console.log('🎤 Listening... (speak now, then pause)');

    const mic = recorder.record({
      sampleRate: 16000,
      threshold: 0,
      verbose: false,
      recordProgram: 'sox', // or 'rec' on Windows with SoX installed
      silence: '2.0', // Stop after 2 seconds of silence
    });

    let audioData = [];
    let hasReceivedAudio = false;

    // Timeout to stop recording
    const timeoutId = setTimeout(() => {
      mic.stop();
      if (!hasReceivedAudio) {
        console.log('⏱️  No speech detected (timeout)');
        recognizer.free();
        recognizer = new vosk.Recognizer({ model: model, sampleRate: 16000 });
        resolve(null);
      }
    }, timeout);

    mic.stream()
      .on('data', (chunk) => {
        hasReceivedAudio = true;
        if (recognizer.acceptWaveform(chunk)) {
          const result = JSON.parse(recognizer.result());
          if (result.text && result.text.trim()) {
            clearTimeout(timeoutId);
            mic.stop();
            console.log(`✅ Heard: "${result.text}"`);
            recognizer.free();
            recognizer = new vosk.Recognizer({ model: model, sampleRate: 16000 });
            resolve(result.text);
          }
        }
      })
      .on('error', (err) => {
        clearTimeout(timeoutId);
        console.error('🎤 Microphone error:', err.message);
        recognizer.free();
        recognizer = new vosk.Recognizer({ model: model, sampleRate: 16000 });
        resolve(null);
      })
      .on('end', () => {
        clearTimeout(timeoutId);
        const finalResult = JSON.parse(recognizer.finalResult());
        recognizer.free();
        recognizer = new vosk.Recognizer({ model: model, sampleRate: 16000 });

        if (finalResult.text && finalResult.text.trim()) {
          console.log(`✅ Heard: "${finalResult.text}"`);
          resolve(finalResult.text);
        } else {
          console.log('⏭️  No speech detected');
          resolve(null);
        }
      });
  });
}

// Cleanup
function cleanup() {
  if (recognizer) {
    recognizer.free();
    recognizer = null;
  }
  if (model) {
    model.free();
    model = null;
  }
}

export { initializeVosk, getVoiceInput, cleanup };
