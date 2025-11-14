import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { ExtractionConfig, ToolPaths } from '../lib/types.js';

/**
 * Load environment variables from .env file
 */
function loadEnv(): Record<string, string> {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const content = readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }

    return env;
  } catch {
    // .env file doesn't exist, use process.env only
    return {};
  }
}

const envVars = loadEnv();

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue?: string): string {
  return envVars[key] || process.env[key] || defaultValue || '';
}

/**
 * Parse boolean environment variable
 */
function getEnvBool(key: string, defaultValue = false): boolean {
  const value = getEnv(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse integer environment variable
 */
function getEnvInt(key: string, defaultValue: number): number {
  const value = getEnv(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get default extraction configuration from environment
 */
export function getDefaultConfig(): ExtractionConfig {
  return {
    acInstallPath: getEnv(
      'AC_INSTALL_PATH',
      'C:\\Program Files (x86)\\Steam\\steamapps\\common\\assettocorsa'
    ),
    outputDir: getEnv('OUTPUT_DIR', './output'),
    kn5ConverterPath: getEnv('KN5_CONVERTER_PATH', './tools/kn5-converter/kn5conv.exe'),
    fbx2gltfPath: getEnv('FBX2GLTF_PATH', './tools/FBX2glTF/FBX2glTF.exe'),
    dracoCompression: getEnvBool('DRACO_COMPRESSION', true),
    dracoLevel: getEnvInt('DRACO_COMPRESSION_LEVEL', 7),
    dracoBitsPosition: getEnvInt('DRACO_BITS_POSITION', 14),
    dracoBitsUV: getEnvInt('DRACO_BITS_UV', 10),
    dracoBitsNormals: getEnvInt('DRACO_BITS_NORMALS', 10),
    skipExisting: getEnvBool('SKIP_EXISTING', true),
    verbose: getEnvBool('VERBOSE', false),
    logFile: getEnv('LOG_FILE', './car-extractor.log')
  };
}

/**
 * Validate extraction configuration
 */
export function validateConfig(config: ExtractionConfig): string[] {
  const errors: string[] = [];

  if (!config.acInstallPath) {
    errors.push('AC_INSTALL_PATH is required');
  }

  if (!config.outputDir) {
    errors.push('OUTPUT_DIR is required');
  }

  if (config.dracoLevel !== undefined && (config.dracoLevel < 0 || config.dracoLevel > 10)) {
    errors.push('DRACO_COMPRESSION_LEVEL must be between 0 and 10');
  }

  return errors;
}

/**
 * Get tool paths with auto-detection
 */
export function getToolPaths(config: ExtractionConfig): ToolPaths {
  return {
    kn5Converter: resolve(config.kn5ConverterPath || './tools/kn5-converter/kn5conv.exe'),
    fbx2gltf: resolve(config.fbx2gltfPath || './tools/FBX2glTF/FBX2glTF.exe')
  };
}

/**
 * Get cars to extract from environment (comma-separated list)
 */
export function getExtractCars(): string[] {
  const carsEnv = getEnv('EXTRACT_CARS');
  if (!carsEnv) return [];

  return carsEnv
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
}
