import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeVosk, getVoiceInput, cleanup } from './voiceInput.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const SAVEGAME_PATH = 'C:\\Users\\tomat\\OneDrive\\Documents\\Automobilista 2\\savegame';
const LOG_FILE = path.join(__dirname, 'annotations.log');
const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots');
const USE_VOICE_INPUT = true; // Set to false to use keyboard input

// Voice input state
let voiceInputAvailable = false;

// Create snapshots directory
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

// Store previous file states
const fileStates = new Map();
let changeCounter = 0;

// Beep function (console beep)
function beep() {
  process.stdout.write('\x07');
  changeCounter++;
  const timestamp = new Date().toLocaleTimeString();
  console.log('\n' + '█'.repeat(80));
  console.log(`🔔 CHANGE #${changeCounter} DETECTED at ${timestamp}`);
  console.log('█'.repeat(80) + '\n');
}

// Log change with timestamp - simple human-readable format
function logChange(filename, snapshotPath, annotation = null) {
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp} | ${filename} | ${path.basename(snapshotPath)} | ${annotation || 'NO ANNOTATION'}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
}

// Save snapshot of file
function saveSnapshot(filepath, filename) {
  const timestamp = Date.now();
  const snapshotPath = path.join(SNAPSHOTS_DIR, `${timestamp}_${filename}`);
  fs.copyFileSync(filepath, snapshotPath);
  return snapshotPath;
}

// No longer needed - we're just saving snapshots, not diffs

// Main async initialization
async function initialize() {
  console.log('🔍 AMS2 Savegame Watcher Starting...');
  console.log(`📁 Watching: ${SAVEGAME_PATH}`);
  console.log(`📝 Annotations: ${LOG_FILE}`);
  console.log(`📸 Snapshots: ${SNAPSHOTS_DIR}`);

  // Initialize voice input if enabled
  if (USE_VOICE_INPUT) {
    console.log('\n🎤 Initializing voice input...');
    voiceInputAvailable = await initializeVosk();

    if (voiceInputAvailable) {
      console.log('✅ Voice input ready!');
      console.log('\n🎤 When you hear a BEEP, just SPEAK what you did in AMS2!');
      console.log('   (No typing needed - your annotation will be captured by voice)');
      console.log('   💡 Tip: Keep AMS2 in focus, no need to switch windows!\n');
    } else {
      console.log('⚠️  Voice input unavailable, using keyboard mode');
      console.log('\n⌨️  When you hear a BEEP, press ENTER and type your annotation.\n');
    }
  } else {
    console.log('\n⌨️  Voice input disabled (using keyboard mode)');
    console.log('   When you hear a BEEP, press ENTER and type your annotation.\n');
  }

  // Write header if file doesn't exist
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, 'Timestamp | Filename | Snapshot | Annotation\n');
    fs.appendFileSync(LOG_FILE, '─'.repeat(120) + '\n');
  }

  return true;
}

// Watch for file changes
const watcher = chokidar.watch(SAVEGAME_PATH, {
  persistent: true,
  ignoreInitial: false,
  depth: 10,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100
  }
});

// Handle file changes
watcher.on('change', async (filepath) => {
  const filename = path.basename(filepath);

  beep();

  try {
    // Save snapshot
    const snapshotPath = saveSnapshot(filepath, filename);

    console.log(`📄 File: ${filename}`);
    console.log(`📸 Snapshot: ${path.basename(snapshotPath)}`);

    // Log without annotation first
    logChange(filename, snapshotPath);

    // Wait for user annotation (async)
    await promptAnnotation(filename, snapshotPath);

  } catch (err) {
    console.error(`❌ Error processing ${filename}:`, err.message);
  }
});

watcher.on('add', (filepath) => {
  const filename = path.basename(filepath);
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    fileStates.set(filepath, content);
    console.log(`✅ Watching: ${filename}`);
  } catch (err) {
    // Binary file or unreadable
    fileStates.set(filepath, null);
  }
});

watcher.on('error', error => {
  console.error('Watcher error:', error);
});

// Simple annotation prompt with voice or keyboard
async function promptAnnotation(filename, snapshotPath) {
  console.log('\n' + '─'.repeat(80));
  console.log(`💬 ANNOTATION for "${filename}":`);

  let annotation = null;

  // Try voice input first if available
  if (voiceInputAvailable && USE_VOICE_INPUT) {
    console.log(`   🎤 Speak what you did (or press ENTER to skip)...`);
    console.log('─'.repeat(80));

    try {
      annotation = await getVoiceInput(5000); // 5 second timeout
    } catch (err) {
      console.error('Voice input error:', err.message);
      annotation = null;
    }

    // If voice failed or returned nothing, fall back to keyboard
    if (!annotation) {
      console.log('   ⌨️  Voice input failed/skipped. Type annotation or press ENTER to skip:');
      console.log('> ');
      annotation = await getKeyboardInput();
    }
  } else {
    // Keyboard-only mode
    console.log(`   What did you just do in AMS2?`);
    console.log('─'.repeat(80));
    console.log('> ');
    annotation = await getKeyboardInput();
  }

  // Update the last line in the log file with annotation
  if (annotation && annotation.trim()) {
    const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n');
    const lastLine = logs[logs.length - 2]; // -2 because last is empty
    const updated = lastLine.replace('NO ANNOTATION', annotation.trim());
    logs[logs.length - 2] = updated;
    fs.writeFileSync(LOG_FILE, logs.join('\n'));

    console.log('\n' + '✅'.repeat(40));
    console.log(`   Saved: "${annotation.trim()}"`);
    console.log('✅'.repeat(40) + '\n');
  } else {
    console.log('⏭️  Skipped annotation\n');
  }
  console.log('👂 Listening for more changes...\n');
}

// Helper function for keyboard input
function getKeyboardInput() {
  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

// Enable stdin
process.stdin.setEncoding('utf8');
process.stdin.resume();

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  cleanup();
  watcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down...');
  cleanup();
  watcher.close();
  process.exit(0);
});

// Start the application
initialize().then(() => {
  console.log('✅ Watcher active!\n');
}).catch((err) => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});
