import { useState, useEffect } from "react";
import ProgressBar from "../ui/ProgressBar";
import TelemetryCard from "../ui/TelemetryCard";
import StatusIndicator from "../ui/StatusIndicator";
import TrackVisualization from "../TrackVisualization";
import { getTelemetryService, TelemetryData } from "../../lib/telemetry-service";
import { debugConsole } from "../ui/DebugConsole";

interface LiveRecordingProps {
  onStopRecording: () => void;
}

function formatPosition(worldPos: [number, number, number]): string {
  return `X:${worldPos[0].toFixed(1)} Y:${worldPos[1].toFixed(1)} Z:${worldPos[2].toFixed(1)}`;
}

function formatLapTime(currentTime: number): string {
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

export default function LiveRecording({ onStopRecording }: LiveRecordingProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lapProgress, setLapProgress] = useState(0);
  const [telemetry, setTelemetry] = useState({
    speed: 0,
    position: "X:0.0 Y:0.0 Z:0.0",
    lap: "0 / 0:00.000",
    gear: 0,
    throttle: 0,
    brake: 0,
    rpm: 0,
    maxRpm: 0,
  });

  const [allTelemetryPoints, setAllTelemetryPoints] = useState<any[]>([]);
  const [trackInfo, setTrackInfo] = useState({ location: "", variation: "" });
  const [telemetryRate, setTelemetryRate] = useState(0);

  useEffect(() => {
    const service = getTelemetryService();
    let firstUpdate = true;
    let lastUpdateTime = Date.now();
    let connectionLostWarned = false;
    let updateCount = 0;
    let rateCheckStart = Date.now();

    const handleTelemetryUpdate = (data: TelemetryData) => {
      setIsConnected(true);
      const now = Date.now();

      if (connectionLostWarned) {
        connectionLostWarned = false;
      }
      lastUpdateTime = now;

      // Calculate telemetry rate (Hz)
      updateCount++;
      const elapsed = (now - rateCheckStart) / 1000;
      if (elapsed >= 1) {
        setTelemetryRate(Math.round(updateCount / elapsed));
        updateCount = 0;
        rateCheckStart = now;
      }

      if (firstUpdate) {
        firstUpdate = false;
        setTrackInfo({
          location: data.track_location,
          variation: data.track_variation
        });
        debugConsole.success(`Connected to AMS2! Track: ${data.track_location} ${data.track_variation}`);
      }

      const playerIndex = data.viewed_participant_index;
      const player = data.participants[playerIndex];

      if (player) {
        const telemetryPoint = {
          timestamp: now,
          speed: data.speed,
          position: player.world_position,
          throttle: data.throttle,
          brake: data.brake,
          gear: data.gear,
          rpm: data.rpm,
          lapDistance: player.current_lap_distance,
          runType: null,
          inPit: data.game_state === 3,
        };

        setAllTelemetryPoints(prev => [...prev, telemetryPoint]);

        // Calculate lap progress
        const progress = data.track_length > 0
          ? (player.current_lap_distance / data.track_length) * 100
          : 0;

        setLapProgress(Math.min(100, Math.max(0, progress)));

        // Update telemetry display
        const throttlePct = Math.round(data.throttle * 100);
        const brakePct = Math.round(data.brake * 100);

        setTelemetry({
          speed: Math.round(data.speed * 2.23694),
          position: formatPosition(player.world_position),
          lap: `${player.current_lap} / ${formatLapTime(data.current_time)}`,
          gear: data.gear,
          throttle: throttlePct,
          brake: brakePct,
          rpm: Math.round(data.rpm),
          maxRpm: Math.round(data.max_rpm),
        });
      }
    };

    const connectionCheckInterval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime;
      if (timeSinceLastUpdate > 2000 && !connectionLostWarned && !firstUpdate) {
        connectionLostWarned = true;
        setIsConnected(false);
      }
    }, 2000);

    const handleStarted = () => {};
    const handleConnected = () => {};
    const handleError = () => {};

    service.on("update", handleTelemetryUpdate);
    service.on("started", handleStarted);
    service.on("connected", handleConnected);
    service.on("error", handleError);

    service.start(16).catch((err) => {
      console.error(`Failed to start telemetry: ${err.message}`);
    });

    return () => {
      clearInterval(connectionCheckInterval);
      service.off("update", handleTelemetryUpdate);
      service.off("started", handleStarted);
      service.off("connected", handleConnected);
      service.off("error", handleError);
      service.stop();
    };
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col bg-green-bg dark group/design-root overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-green-border px-10 py-3">
            <div className="flex items-center gap-4 text-white">
              <div className="size-4 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    clipRule="evenodd"
                    d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                  <path
                    clipRule="evenodd"
                    d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Telemetry Capture
              </h2>
            </div>
            <div className="flex flex-1 justify-end gap-6 items-center">
              {/* Track Info */}
              {trackInfo.location && (
                <div className="flex flex-col items-end gap-0.5">
                  <div className="text-white font-medium text-sm">
                    {trackInfo.location} {trackInfo.variation && `- ${trackInfo.variation}`}
                  </div>
                  <div className="text-white/40 text-xs">Automobilista 2</div>
                </div>
              )}

              {/* Recording consistency indicator */}
              {telemetryRate > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-bg/50 rounded border border-green-border">
                  <span className="text-white/60 text-xs">Rate:</span>
                  <span className={`text-xs font-bold ${telemetryRate >= 55 ? "text-green-400" :
                      telemetryRate >= 45 ? "text-yellow-400" :
                        "text-red-400"
                    }`}>
                    {telemetryRate} Hz
                  </span>
                </div>
              )}

              {isConnected && <StatusIndicator status="recording" label="Recording..." />}
              <StatusIndicator
                status={isConnected ? "connected" : "disconnected"}
                label={isConnected ? "Connected" : "Waiting..."}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-col flex-1 p-4 gap-4">
            {/* Progress Bar */}
            <ProgressBar label="Lap Progress" value={lapProgress} />

            {/* Track Map & Telemetry Cards */}
            <div className="flex flex-1 gap-4 overflow-hidden">
              {/* 3D Track Visualization */}
              <div className="w-3/5 flex h-full">
                <TrackVisualization
                  telemetryPoints={allTelemetryPoints}
                  currentRunType={null}
                  className="w-full h-full rounded-lg border border-green-border overflow-hidden"
                />
              </div>

              {/* Telemetry Cards */}
              <div className="w-2/5 flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <TelemetryCard label="Speed" value={`${telemetry.speed} MPH`} />
                  <TelemetryCard label="Position" value={telemetry.position} />
                  <TelemetryCard label="Lap" value={telemetry.lap} />
                  <TelemetryCard label="Gear" value={telemetry.gear} />
                </div>
                <div className="flex flex-col gap-3">
                  <ProgressBar label="Throttle" value={telemetry.throttle} />
                  <ProgressBar label="Brake" value={telemetry.brake} />
                </div>
              </div>
            </div>

            {/* Stop Button */}
            <div className="flex justify-end p-4">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-red-600 hover:bg-red-700 text-white text-base font-bold leading-normal tracking-[0.015em] gap-2"
                onClick={onStopRecording}
              >
                <span className="material-symbols-outlined">stop_circle</span>
                <span className="truncate">Stop & Save Recording</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
