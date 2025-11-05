/**
 * TypeScript type definitions for AMS2 Car Image Extractor
 */

// Import Vehicle type from ams2-content-listing
import { Vehicle } from '../../ams2-content-listing/src/types';
export { Vehicle };

/**
 * Result of extracting a single BFF archive
 */
export interface ExtractionResult {
  vehicle: Vehicle;
  success: boolean;
  extractedFiles: string[];
  outputPath: string;
  error?: string;
  durationMs: number;
}

/**
 * Result of converting a single DDS file to PNG
 */
export interface ConversionResult {
  vehicle: Vehicle;
  success: boolean;
  sourceDdsPath: string;
  outputPngPath: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSizeBytes: number;
  error?: string;
  durationMs: number;
}

/**
 * Overall processing report
 */
export interface ProcessingReport {
  startTime: Date;
  endTime: Date;
  totalDurationMs: number;
  vehiclesProcessed: number;
  vehiclesSucceeded: number;
  vehiclesFailed: number;
  extractions: ExtractionResult[];
  conversions: ConversionResult[];
}

/**
 * Manifest entry for a single vehicle
 */
export interface ManifestEntry {
  id: string;
  displayName: string;
  manufacturer: string;
  class: string;
  dlc: string;
  bffFile: string;
  thumbnailPath: string;
  sourceTexture: string;
  extractedAt: string;
  isBasGame: boolean;
}

/**
 * Complete manifest JSON structure
 */
export interface Manifest {
  version: string;
  extractedAt: string;
  ams2InstallPath: string;
  totalVehicles: number;
  processed: number;
  failed: number;
  vehicles: ManifestEntry[];
}

/**
 * CLI options for the process-all command
 */
export interface ProcessOptions {
  ams2Path: string;
  testMode: boolean;
  limit?: number;
  skipExisting: boolean;
  verbose: boolean;
}

/**
 * PCarsTools execution result
 */
export interface PCarsToolsResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}
