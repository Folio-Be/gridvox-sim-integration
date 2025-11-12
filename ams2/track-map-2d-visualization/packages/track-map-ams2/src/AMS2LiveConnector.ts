/**
 * AMS2 Live Telemetry Connector
 * 
 * Connects to telemetry bridge server via WebSocket
 * The bridge server loads the native addon and sends telemetry data
 */

import type { CarPosition } from '@SimVox.ai/track-map-core';
import { AMS2Adapter } from './AMS2Adapter.js';
import type { AMS2SharedMemory } from './types/AMS2Telemetry.js';

export class AMS2LiveConnector {
    private ws: WebSocket | null = null;
    private adapter: AMS2Adapter;
    private connected = false;
    private onUpdate: ((cars: CarPosition[]) => void) | null = null;
    private onConnectionChange: ((connected: boolean) => void) | null = null;
    private readonly wsUrl = 'ws://localhost:8080';

    constructor() {
        this.adapter = new AMS2Adapter();
    }

    /**
     * Initialize WebSocket connection to bridge server
     */
    async connect(): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                console.log(`🔌 Connecting to telemetry bridge at ${this.wsUrl}...`);

                this.ws = new WebSocket(this.wsUrl);

                this.ws.onopen = () => {
                    console.log('✅ Connected to bridge server');

                    // Request AMS2 connection
                    this.ws?.send(JSON.stringify({ type: 'connect' }));
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);

                        if (message.type === 'connection-result') {
                            this.connected = message.success;
                            console.log(message.success ? '✅ AMS2 connected' : '❌ AMS2 connection failed');
                            this.onConnectionChange?.(message.success);
                            resolve(message.success);
                        } else if (message.type === 'telemetry') {
                            this.handleTelemetry(message.data);
                        } else if (message.type === 'disconnected') {
                            this.connected = false;
                            this.onConnectionChange?.(false);
                        }
                    } catch (error) {
                        console.error('Message parsing error:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    resolve(false);
                };

                this.ws.onclose = () => {
                    console.log('🔌 Bridge server disconnected');
                    this.connected = false;
                    this.onConnectionChange?.(false);
                };

                // Timeout after 5 seconds
                setTimeout(() => {
                    if (!this.connected) {
                        console.warn('⏱️ Connection timeout - is bridge server running?');
                        resolve(false);
                    }
                }, 5000);

            } catch (error) {
                console.error('❌ Failed to connect to bridge server:', error);
                resolve(false);
            }
        });
    }

    /**
     * Disconnect from bridge server
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.send(JSON.stringify({ type: 'disconnect' }));
            this.ws.close();
            this.ws = null;
        }

        this.connected = false;
        this.onConnectionChange?.(false);
        console.log('🔌 Disconnected from AMS2');
    }

    /**
     * Start polling telemetry (WebSocket receives push automatically)
     */
    startPolling(_intervalMs: number = 16): void {
        console.log('📡 Receiving telemetry via WebSocket push');
    }

    /**
     * Stop polling (no-op for WebSocket)
     */
    stopPolling(): void {
        // WebSocket handles this automatically
    }

    /**
     * Handle incoming telemetry data from WebSocket
     */
    private handleTelemetry(rawData: any): void {
        try {
            // Convert raw data to AMS2SharedMemory format
            const sharedMemory = this.mapRawData(rawData);

            // Convert to universal CarPosition format
            const carPositions = this.adapter.toCarPositions(sharedMemory);

            // Notify listeners
            this.onUpdate?.(carPositions);

        } catch (error) {
            console.error('Error processing telemetry:', error);
        }
    }

    /**
     * Map raw addon data to AMS2SharedMemory type
     */
    private mapRawData(raw: any): AMS2SharedMemory {
        return raw as AMS2SharedMemory;
    }

    /**
     * Register callback for telemetry updates
     */
    onTelemetryUpdate(callback: (cars: CarPosition[]) => void): void {
        this.onUpdate = callback;
    }

    /**
     * Register callback for connection status changes
     */
    onConnectionChanged(callback: (connected: boolean) => void): void {
        this.onConnectionChange = callback;
    }

    /**
     * Get current connection status
     */
    isConnected(): boolean {
        return this.connected;
    }

    /**
     * Get single telemetry snapshot (not supported via WebSocket)
     */
    getCurrentTelemetry(): CarPosition[] | null {
        console.warn('getCurrentTelemetry() not supported with WebSocket bridge');
        return null;
    }
}
