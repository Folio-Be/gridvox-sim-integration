/**
 * GridVox Track Map - Telemetry Bridge Server
 * 
 * Node.js server that:
 * 1. Loads POC-02 native addon
 * 2. Connects to AMS2 shared memory
 * 3. Sends telemetry to browser via WebSocket
 */

const WebSocket = require('ws');
const path = require('path');

// Load POC-02 native addon
const addonPath = path.resolve(__dirname, '../../../../../gridvox-desktop/pocs/poc-02-direct-memory/build/Release/shared_memory_reader.node');
console.log('📦 Loading native addon from:', addonPath);

const { SharedMemoryReader } = require(addonPath);

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
console.log('🚀 WebSocket server listening on ws://localhost:8080');

let reader = null;
let connected = false;
let pollingInterval = null;

// Connect to AMS2
function connectToAMS2() {
    try {
        if (!reader) {
            reader = new SharedMemoryReader();
        }

        connected = reader.connect();

        if (connected) {
            console.log('✅ Connected to AMS2 shared memory');
            return true;
        } else {
            console.log('⚠️ Failed to connect (game not running?)');
            return false;
        }
    } catch (error) {
        console.error('❌ Connection error:', error);
        return false;
    }
}

// Poll telemetry and broadcast to all clients
function pollAndBroadcast() {
    if (!reader || !connected) return;

    try {
        if (!reader.isConnected()) {
            console.warn('Lost connection to AMS2');
            connected = false;
            broadcastToAll({ type: 'disconnected' });
            return;
        }

        const data = reader.read(); // Correct method name

        // Debug: Log multiple participants' world positions
        if (Math.random() < 0.02) { // 2% of the time
            const sample = data.participants?.slice(0, 5).map(p => ({
                name: p.name,
                pos: p.racePosition,
                worldPos: p.worldPosition,
                lapDist: p.currentLapDistance
            }));
            console.log('📊 Sample cars (first 5):', JSON.stringify(sample, null, 2));
            console.log('📊 Total participants:', data.numParticipants);
        }

        // Send to all connected clients
        broadcastToAll({
            type: 'telemetry',
            data: data
        });

    } catch (error) {
        console.error('Polling error:', error);
    }
}

// Broadcast message to all connected WebSocket clients
function broadcastToAll(message) {
    const payload = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('🔌 Client connected');

    // Send connection status immediately
    ws.send(JSON.stringify({
        type: 'status',
        connected: connected
    }));

    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);

            if (msg.type === 'connect') {
                const success = connectToAMS2();

                ws.send(JSON.stringify({
                    type: 'connection-result',
                    success: success
                }));

                if (success && !pollingInterval) {
                    // Start polling at 60 FPS
                    pollingInterval = setInterval(pollAndBroadcast, 16);
                    console.log('📡 Started telemetry polling at 60 FPS');
                }
            } else if (msg.type === 'disconnect') {
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                }
                if (reader) {
                    reader.disconnect();
                    connected = false;
                    console.log('🔌 Disconnected from AMS2');
                }
                ws.send(JSON.stringify({
                    type: 'disconnected'
                }));
            }
        } catch (error) {
            console.error('Message handling error:', error);
        }
    });

    ws.on('close', () => {
        console.log('❌ Client disconnected');

        // If no more clients, stop polling
        if (wss.clients.size === 0 && pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
            console.log('⏸️ Stopped polling (no clients)');
        }
    });
});

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  GridVox Telemetry Bridge Server');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('  WebSocket: ws://localhost:8080');
console.log('  Frontend:  http://localhost:3000');
console.log('');
console.log('  Waiting for connections...');
console.log('');
