import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Execute command and return stdout/stderr
 */
export async function executeCommand(
  command: string,
  args: string[] = [],
  options: { cwd?: string; timeout?: number } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      shell: true,
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = options.timeout || 300000; // 5 minutes default
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`Command timeout after ${timeout}ms: ${command}`));
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      });
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/**
 * Execute command and stream output to console
 */
export async function executeCommandStreaming(
  command: string,
  args: string[] = [],
  options: {
    cwd?: string;
    timeout?: number;
    onStdout?: (data: string) => void;
    onStderr?: (data: string) => void;
  } = {}
): Promise<{ exitCode: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      shell: true,
      windowsHide: true
    });

    proc.stdout?.on('data', (data) => {
      const output = data.toString();
      if (options.onStdout) {
        options.onStdout(output);
      } else {
        process.stdout.write(output);
      }
    });

    proc.stderr?.on('data', (data) => {
      const output = data.toString();
      if (options.onStderr) {
        options.onStderr(output);
      } else {
        process.stderr.write(output);
      }
    });

    const timeout = options.timeout || 300000;
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`Command timeout after ${timeout}ms: ${command}`));
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code || 0 });
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/**
 * Check if command/executable exists
 */
export async function commandExists(command: string): Promise<boolean> {
  try {
    const { exitCode } = await executeCommand('where', [command]);
    return exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Execute shell command (simple wrapper for one-liners)
 */
export async function shell(command: string, cwd?: string): Promise<string> {
  try {
    const { stdout } = await execAsync(command, { cwd });
    return stdout.trim();
  } catch (error: any) {
    throw new Error(`Shell command failed: ${error.message}`);
  }
}
