/**
 * AMS2 Track Map Adapter
 * 
 * Exports:
 * - AMS2Adapter: Converts AMS2 telemetry to universal format
 * - Type definitions for AMS2 shared memory
 */

export { AMS2Adapter } from './AMS2Adapter.js';
export type {
    AMS2SharedMemory,
    AMS2Participant,
    Vector3,
} from './types/AMS2Telemetry.js';
