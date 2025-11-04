import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Model configuration
const MODELS = {
  small: {
    name: 'vosk-model-small-en-us-0.15',
    url: 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip',
    size: '40MB',
    description: 'Fast, good for short phrases (RECOMMENDED)'
  },
  large: {
    name: 'vosk-model-en-us-0.22',
    url: 'https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip',
    size: '1.8GB',
    description: 'More accurate, slower'
  }
};

console.log('🎤 Vosk Model Downloader\n');
console.log('This script will help you download a speech recognition model for voice input.\n');
console.log('Available models:');
console.log('1. Small (40MB) - vosk-model-small-en-us-0.15 [RECOMMENDED]');
console.log('   Fast transcription, good accuracy for short phrases');
console.log('2. Large (1.8GB) - vosk-model-en-us-0.22');
console.log('   Better accuracy, slower transcription\n');

// Get model choice from command line argument
const arg = process.argv[2];
let modelChoice = 'small';

if (arg === '2' || arg === 'large') {
  modelChoice = 'large';
} else if (arg === '1' || arg === 'small' || !arg) {
  modelChoice = 'small';
} else {
  console.error('Invalid choice. Usage: node download-vosk-model.js [1|2|small|large]');
  process.exit(1);
}

const model = MODELS[modelChoice];
console.log(`Selected: ${model.name} (${model.size})`);
console.log(`Description: ${model.description}\n`);

const zipPath = path.join(__dirname, `${model.name}.zip`);
const extractPath = path.join(__dirname, model.name);

// Check if model already exists
if (fs.existsSync(extractPath)) {
  console.log('✅ Model already exists at:', extractPath);
  console.log('   Delete the folder if you want to re-download.\n');
  process.exit(0);
}

console.log('📥 Downloading model...');
console.log('   This may take a while depending on your connection...\n');

// Download file with progress
const file = fs.createWriteStream(zipPath);
let downloadedBytes = 0;
let totalBytes = 0;

https.get(model.url, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    // Handle redirect
    https.get(response.headers.location, handleDownload);
  } else {
    handleDownload(response);
  }
}).on('error', (err) => {
  console.error('❌ Download failed:', err.message);
  process.exit(1);
});

function handleDownload(response) {
  totalBytes = parseInt(response.headers['content-length'], 10);

  response.pipe(file);

  response.on('data', (chunk) => {
    downloadedBytes += chunk.length;
    const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
    const downloadedMB = (downloadedBytes / 1024 / 1024).toFixed(1);
    const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
    process.stdout.write(`\r   Progress: ${percent}% (${downloadedMB}MB / ${totalMB}MB)`);
  });

  file.on('finish', () => {
    file.close();
    console.log('\n\n✅ Download complete!');
    console.log('📦 Extracting...\n');

    // Extract the zip file
    extractZip(zipPath, __dirname);
  });
}

function extractZip(zipFile, destDir) {
  // Check if unzip is available (Linux/Mac)
  if (process.platform !== 'win32') {
    exec(`unzip -q "${zipFile}" -d "${destDir}"`, (err) => {
      if (err) {
        console.error('❌ Extraction failed:', err.message);
        console.log('\n💡 Please manually extract the zip file:');
        console.log(`   File: ${zipFile}`);
        console.log(`   Extract to: ${destDir}\n`);
        process.exit(1);
      }

      cleanup();
    });
  } else {
    // Windows - use PowerShell
    const psCommand = `Expand-Archive -Path "${zipFile}" -DestinationPath "${destDir}" -Force`;
    exec(`powershell -Command "${psCommand}"`, (err) => {
      if (err) {
        console.error('❌ Extraction failed:', err.message);
        console.log('\n💡 Please manually extract the zip file:');
        console.log(`   File: ${zipFile}`);
        console.log(`   Extract to: ${destDir}\n`);
        process.exit(1);
      }

      cleanup();
    });
  }
}

function cleanup() {
  console.log('✅ Extraction complete!');
  console.log('🗑️  Cleaning up...\n');

  // Delete zip file
  try {
    fs.unlinkSync(zipPath);
  } catch (err) {
    console.warn('⚠️  Could not delete zip file:', err.message);
  }

  console.log('✅ Model installed successfully!');
  console.log(`📁 Location: ${extractPath}\n`);
  console.log('🎉 You can now use voice input!');
  console.log('   Run: npm run watch\n');
}
