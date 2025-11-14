import chalk from 'chalk';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export class Logger {
  private logFile?: string;
  private verbose: boolean;

  constructor(options: { logFile?: string; verbose?: boolean } = {}) {
    this.logFile = options.logFile;
    this.verbose = options.verbose ?? false;

    // Create log file directory if needed
    if (this.logFile) {
      const dir = dirname(this.logFile);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Log debug message (only in verbose mode)
   */
  debug(message: string, ...args: any[]) {
    if (this.verbose) {
      this.log('debug', message, ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any) {
    if (error instanceof Error) {
      this.log('error', message, error.message);
      if (this.verbose && error.stack) {
        console.error(chalk.gray(error.stack));
      }
    } else {
      this.log('error', message, error);
    }
  }

  /**
   * Log success message
   */
  success(message: string, ...args: any[]) {
    this.log('success', message, ...args);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const formattedMessage = args.length > 0
      ? `${message} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`
      : message;

    // Console output with colors
    const levelLabel = this.getLevelLabel(level);
    console.log(`${levelLabel} ${formattedMessage}`);

    // File output (plain text)
    if (this.logFile) {
      const logLine = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage}\n`;
      try {
        appendFileSync(this.logFile, logLine, 'utf-8');
      } catch (err) {
        console.error('Failed to write to log file:', err);
      }
    }
  }

  /**
   * Get colored level label
   */
  private getLevelLabel(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return chalk.gray('▸');
      case 'info':
        return chalk.blue('ℹ');
      case 'warn':
        return chalk.yellow('⚠');
      case 'error':
        return chalk.red('✖');
      case 'success':
        return chalk.green('✓');
      default:
        return '●';
    }
  }

  /**
   * Create a progress bar string
   */
  progressBar(current: number, total: number, width = 30): string {
    const percentage = total > 0 ? current / total : 0;
    const filled = Math.floor(percentage * width);
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = (percentage * 100).toFixed(1);

    return `${bar} ${percent}%`;
  }

  /**
   * Log progress with bar
   */
  progress(message: string, current: number, total: number) {
    const bar = this.progressBar(current, total);
    const count = chalk.gray(`[${current}/${total}]`);
    this.info(`${message} ${count} ${bar}`);
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();
