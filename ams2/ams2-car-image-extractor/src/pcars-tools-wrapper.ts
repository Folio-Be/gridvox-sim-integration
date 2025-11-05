/**
 * Wrapper for PCarsTools binary execution
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { PCarsToolsResult } from './types';

const PCARSTOOLS_DIR = path.join(__dirname, '..', 'tools', 'PCarsTools');
const PCARSTOOLS_EXE = path.join(PCARSTOOLS_DIR, 'pcarstools_x64.exe');
const OODLE_DLL = path.join(PCARSTOOLS_DIR, 'oo2core_4_win64.dll');

/**
 * Verify that PCarsTools and Oodle DLL are installed
 */
export function verifyInstallation(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!fs.existsSync(PCARSTOOLS_EXE)) {
    missing.push(`PCarsTools executable: ${PCARSTOOLS_EXE}`);
  }

  if (!fs.existsSync(OODLE_DLL)) {
    missing.push(`Oodle DLL: ${OODLE_DLL}`);
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Extract a BFF archive using PCarsTools
 * @param bffPath - Path to the .bff file
 * @param outputDir - Directory to extract files to
 * @returns Promise with extraction result
 */
export async function extractBFF(
  bffPath: string,
  outputDir: string,
  gameDir: string = 'C:\\GAMES\\Automobilista 2'
): Promise<PCarsToolsResult> {
  return new Promise((resolve) => {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // PCarsTools command: pcarstools_x64.exe pak -i <bffPath> -g <gameDir> -o <outputDir>
    const args = ['pak', '-i', bffPath, '-g', gameDir, '-o', outputDir];

    let stdout = '';
    let stderr = '';

    const child = spawn(PCARSTOOLS_EXE, args, {
      cwd: PCARSTOOLS_DIR,
      env: { ...process.env },
    });

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      resolve({
        success: false,
        stdout,
        stderr,
        exitCode: -1,
        error: `Failed to spawn PCarsTools: ${error.message}`,
      });
    });

    child.on('close', (exitCode) => {
      resolve({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode: exitCode || -1,
        error: exitCode !== 0 ? `PCarsTools exited with code ${exitCode}` : undefined,
      });
    });
  });
}

/**
 * List contents of a BFF archive (for debugging)
 * @param bffPath - Path to the .bff file
 * @returns Promise with list result
 */
export async function listBFFContents(bffPath: string): Promise<PCarsToolsResult> {
  return new Promise((resolve) => {
    // PCarsTools command: pcarstools_x64.exe list <bffPath>
    const args = ['list', bffPath];

    let stdout = '';
    let stderr = '';

    const child = spawn(PCARSTOOLS_EXE, args, {
      cwd: PCARSTOOLS_DIR,
      env: { ...process.env },
    });

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      resolve({
        success: false,
        stdout,
        stderr,
        exitCode: -1,
        error: `Failed to spawn PCarsTools: ${error.message}`,
      });
    });

    child.on('close', (exitCode) => {
      resolve({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode: exitCode || -1,
        error: exitCode !== 0 ? `PCarsTools exited with code ${exitCode}` : undefined,
      });
    });
  });
}
