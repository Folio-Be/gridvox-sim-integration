/**
 * AMS2 Track Map Adapter
 * 
 * Exports:
 * - AMS2Adapter: Converts AMS2 telemetry to universal format
 * - AMS2LiveConnector: Connects to POC-02 native addon for live telemetry
 * - Type definitions for AMS2 shared memory
 */

export { AMS2Adapter } from './AMS2Adapter.js';
export { AMS2LiveConnector } from './AMS2LiveConnector.js';
export type {
    AMS2SharedMemory,
    AMS2Participant,
    Vector3,
} from './types/AMS2Telemetry.js';
