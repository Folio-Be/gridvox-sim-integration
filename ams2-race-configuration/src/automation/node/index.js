#!/usr/bin/env node

/**
 * AMS2 Race Configuration Automation - Node.js Wrapper
 * Provides programmatic control over AutoHotkey automation scripts
 */

import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const AHK_SCRIPT = path.join(__dirname, '../ahk/ams2-race-config.ahk');
const CONFIG_PATH = path.join(__dirname, '../config/race-config.json');
const LOG_DIR = path.join(__dirname, '../logs');
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

class AMS2RaceAutomation {
  constructor() {
    this.ahkExecutable = this.findAutoHotkey();
  }

  /**
   * Find AutoHotkey v2 executable
   */
  findAutoHotkey() {
    // Common installation paths for AutoHotkey v2
    const possiblePaths = [
      'C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey64.exe',
      'C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey32.exe',
      'C:\\Program Files (x86)\\AutoHotkey\\v2\\AutoHotkey.exe',
    ];

    for (const ahkPath of possiblePaths) {
      if (fs.access(ahkPath).then(() => true).catch(() => false)) {
        return ahkPath;
      }
    }

    // Fallback: assume it's in PATH
    return 'AutoHotkey64.exe';
  }

  /**
   * Write race configuration to JSON file
   */
  async writeConfig(config) {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log('Configuration written:', config);
  }

  /**
   * Run AutoHotkey script with given configuration
   */
  async runAutomation(config) {
    console.log('Starting AMS2 race automation...');

    // Write config
    await this.writeConfig(config);

    // Ensure directories exist
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

    try {
      // Execute AutoHotkey script
      const { stdout, stderr } = await execa(this.ahkExecutable, [AHK_SCRIPT], {
        timeout: 60000, // 60 second timeout
      });

      console.log('Automation completed successfully');
      if (stdout) console.log('Output:', stdout);
      if (stderr) console.error('Errors:', stderr);

      return { success: true, stdout, stderr };
    } catch (error) {
      console.error('Automation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Read latest log file
   */
  async getLatestLog() {
    try {
      const files = await fs.readdir(LOG_DIR);
      const logFiles = files.filter(f => f.endsWith('.log')).sort().reverse();

      if (logFiles.length === 0) {
        return null;
      }

      const latestLog = path.join(LOG_DIR, logFiles[0]);
      const content = await fs.readFile(latestLog, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error reading log:', error.message);
      return null;
    }
  }

  /**
   * List all screenshots
   */
  async listScreenshots() {
    try {
      const files = await fs.readdir(SCREENSHOT_DIR);
      return files.filter(f => f.endsWith('.png')).sort().reverse();
    } catch (error) {
      return [];
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new AMS2RaceAutomation();

  // Example configuration
  const sampleConfig = {
    track: 'Spa-Francorchamps',
    carClass: 'GT3',
    opponents: {
      count: 20,
      difficulty: 'Hard',
      aggression: 60,
    },
    weather: 'Light Rain',
    timeOfDay: 'Afternoon',
    sessionLength: {
      type: 'laps',
      value: 15,
    },
  };

  console.log('Running AMS2 automation with sample config...');

  automation.runAutomation(sampleConfig)
    .then(async (result) => {
      console.log('\n=== Result ===');
      console.log('Success:', result.success);

      // Show latest log
      console.log('\n=== Latest Log ===');
      const log = await automation.getLatestLog();
      if (log) {
        console.log(log.split('\n').slice(-10).join('\n')); // Last 10 lines
      }

      // List screenshots
      console.log('\n=== Screenshots ===');
      const screenshots = await automation.listScreenshots();
      console.log(screenshots.slice(0, 5)); // Latest 5

      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default AMS2RaceAutomation;
