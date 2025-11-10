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

function formatTimestamp(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleTimeString("en-US", { hour12: false, fractionalSecondDigits: 3 });
}

function formatPosition(worldPos: [number, number, number]): string {
  return `X:${worldPos[0].toFixed(1)} Y:${worldPos[1].toFixed(1)} Z:${worldPos[2].toFixed(1)}`;
}

function formatLapTime(currentTime: number): string {
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

type RunType = "outside" | "inside" | "racing";

interface LapData {
  id: string;
  runType: RunType;
  lapNumber: number;
  lapTime: number;
  timestamp: number;
  telemetryData: any[]; // Full telemetry points
}

interface RunStats {
  outside: number;
  inside: number;
  racing: number;
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

  // Run type management
  const [currentRunType, setCurrentRunType] = useState<RunType | null>(null); // null = not started yet
  const [nextRunType, setNextRunType] = useState<RunType>("outside");
  const [recordedLaps, setRecordedLaps] = useState<LapData[]>([]);
  const [runStats, setRunStats] = useState<RunStats>({
    outside: 0,
    inside: 0,
    racing: 0,
  });

  // Current lap telemetry buffer
  const [currentLapTelemetry, setCurrentLapTelemetry] = useState<any[]>([]);

  // Backup phase tracking
  const [needsBackup, setNeedsBackup] = useState(false);
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Auto-advance next run type (only when a run is active)
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    // Only auto-advance if we have an active run
    if (currentRunType !== null) {
      if (currentRunType === "outside") {
        setNextRunType("inside");
      } else if (currentRunType === "inside") {
        setNextRunType("racing");
      } else if (currentRunType === "racing") {
        setNextRunType("outside");
      }
    }
  }, [currentRunType, isInitialMount]);

  // Track info
  const [trackInfo, setTrackInfo] = useState({ location: "", variation: "" });

  // Recording consistency (telemetry rate tracking)
  const [telemetryRate, setTelemetryRate] = useState(0);


  // Initialize telemetry service
  useEffect(() => {
    const service = getTelemetryService();
    let firstUpdate = true;
    let lastLap = 0;
    let lastSector = -1;
    let lastUpdateTime = Date.now();
    let connectionLostWarned = false;
    let updateCount = 0;
    let rateCheckStart = Date.now();

    const handleTelemetryUpdate = (data: TelemetryData) => {
      setIsConnected(true);
      const now = Date.now();

      // Reset connection lost warning
      if (connectionLostWarned) {
        debugConsole.success("Telemetry connection restored!");
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

      // Log first telemetry update
      if (firstUpdate) {
        firstUpdate = false;
        setTrackInfo({
          location: data.track_location,
          variation: data.track_variation
        });
        debugConsole.success(`Connected to AMS2! Track: ${data.track_location} ${data.track_variation}`);
      }

      // Get player data (viewed participant)
      const playerIndex = data.viewed_participant_index;
      const player = data.participants[playerIndex];

      if (player) {
        // Collect telemetry point for current lap
        const telemetryPoint = {
          timestamp: now,
          speed: data.speed,
          position: player.world_position,
          throttle: data.throttle,
          brake: data.brake,
          gear: data.gear,
          rpm: data.rpm,
          lapDistance: player.current_lap_distance,
        };

        setCurrentLapTelemetry(prev => [...prev, telemetryPoint]);

        // Detect lap completion (lap number increased)
        if (player.current_lap > lastLap && lastLap > 0 && currentRunType !== null) {
          const lapTime = data.current_time;
          const lapTimeFormatted = formatLapTime(lapTime);

          // Save completed lap with telemetry data
          const completedLap: LapData = {
            id: `${Date.now()}-${lastLap}`,
            runType: currentRunType,
            lapNumber: lastLap,
            lapTime: lapTime,
            timestamp: now,
            telemetryData: currentLapTelemetry,
          };

          setRecordedLaps(prev => [...prev, completedLap]);

          // Clear telemetry buffer for next lap
          setCurrentLapTelemetry([]);

          debugConsole.success(`🏁 Lap ${lastLap} completed! Time: ${lapTimeFormatted} [${currentRunType.toUpperCase()}] (${currentLapTelemetry.length} telemetry points)`);
        }
        lastLap = player.current_lap;

        // Detect sector changes (requires current_sector field from participant)
        // Note: current_sector is in ParticipantInfo but not exposed in our Participant struct yet

        // Calculate lap progress (0-100%)
        const progress = data.track_length > 0
          ? (player.current_lap_distance / data.track_length) * 100
          : 0;

        setLapProgress(Math.min(100, Math.max(0, progress)));

        // Detect crossing start/finish line (lap progress wraps from ~100% to ~0%)
        const prevProgress = lapProgress;
        if (prevProgress > 90 && progress < 10) {
          // First lap: always start immediately with selected run type
          if (currentRunType === null) {
            setCurrentRunType(nextRunType);
            setRunStats(prev => ({
              ...prev,
              [nextRunType]: prev[nextRunType] + 1,
            }));
            debugConsole.info(`🏁 Crossed finish line! Starting Lap ${player.current_lap} [${nextRunType.toUpperCase()}]`);
          }
          // Subsequent laps: require backup if switching run types
          else if (currentRunType !== nextRunType && !hasBackedUp) {
            setNeedsBackup(true);
            debugConsole.warn(`⚠️ Please back up over the finish line before starting ${nextRunType.toUpperCase()} run`);
            // Don't switch yet, clear telemetry buffer
            setCurrentLapTelemetry([]);
          } else {
            // Switch to next run type
            setCurrentRunType(nextRunType);
            setNeedsBackup(false);
            setHasBackedUp(false);

            // Update run stats
            setRunStats(prev => ({
              ...prev,
              [nextRunType]: prev[nextRunType] + 1,
            }));

            debugConsole.info(`🏁 Crossed finish line! Starting Lap ${player.current_lap} [${nextRunType.toUpperCase()}]`);
          }
        }

        // Detect backing up over finish line (progress goes from ~0% to ~100% while in reverse)
        if (needsBackup && prevProgress < 10 && progress > 90 && data.gear < 0) {
          setHasBackedUp(true);
          setNeedsBackup(false);
          debugConsole.success(`✅ Backed up! Ready to start ${nextRunType.toUpperCase()} run. Cross finish line when positioned.`);
        }

        // Update telemetry display
        const throttlePct = Math.round(data.throttle * 100);
        const brakePct = Math.round(data.brake * 100);

        // Debug log throttle/brake values
        if (throttlePct > 0 || brakePct > 0) {
          console.log(`🎮 Throttle: ${throttlePct}%, Brake: ${brakePct}%`);
        }

        setTelemetry({
          speed: Math.round(data.speed * 2.23694), // m/s to MPH
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

    // Check for lost telemetry connection every 2 seconds
    const connectionCheckInterval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime;
      if (timeSinceLastUpdate > 2000 && !connectionLostWarned && !firstUpdate) {
        debugConsole.warn(`⚠️ No telemetry updates for ${Math.round(timeSinceLastUpdate / 1000)}s`);
        connectionLostWarned = true;
        setIsConnected(false);
      }
    }, 2000);

    const handleStarted = () => {
      debugConsole.info("Telemetry service started");
      debugConsole.info("Waiting for AMS2 connection...");
    };

    const handleConnected = (message: string) => {
      debugConsole.success(message);
    };

    const handleError = (error: Error) => {
      debugConsole.warn(error.message);
    };

    // Initial log
    debugConsole.info("Initializing telemetry service...");

    // Register event listeners BEFORE starting
    service.on("update", handleTelemetryUpdate);
    service.on("started", handleStarted);
    service.on("connected", handleConnected);
    service.on("error", handleError);

    // Start telemetry polling at 60Hz
    service.start(16).catch((err) => {
      debugConsole.error(`Failed to start telemetry: ${err.message}`);
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
        {/* Full-screen backup warning overlay */}
        {needsBackup && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 p-12 bg-orange-600 rounded-2xl border-4 border-orange-400 shadow-2xl animate-pulse">
              <div className="text-8xl">🔄</div>
              <div className="text-4xl font-bold text-white text-center">
                BACK UP OVER FINISH LINE
              </div>
              <div className="text-2xl text-white/90 text-center">
                Put car in reverse and cross finish line backwards
              </div>
              <div className="text-xl text-white/80 text-center">
                to switch to <span className="font-bold uppercase">{nextRunType}</span> run
              </div>
            </div>
          </div>
        )}

        {/* Full-screen "Starting Run" overlay */}
        {hasBackedUp && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 p-12 bg-green-600 rounded-2xl border-4 border-green-400 shadow-2xl animate-pulse">
              <div className="text-8xl">✅</div>
              <div className="text-4xl font-bold text-white text-center">
                READY TO START
              </div>
              <div className="text-3xl text-white font-bold text-center uppercase">
                {nextRunType} RUN
              </div>
              <div className="text-xl text-white/90 text-center">
                Cross finish line when positioned
              </div>
            </div>
          </div>
        )}

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
                    <span className={`text-xs font-bold ${
                      telemetryRate >= 55 ? "text-green-400" :
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

            {/* Run Type Selector & Status Bar */}
            <div className="border-b border-green-border px-10 py-4 bg-green-bg/50">
              <div className="flex items-center justify-center gap-3">
                {(["outside", "inside", "racing"] as RunType[]).map((type) => {
                  const isActive = currentRunType === type;
                  const isNext = nextRunType === type;
                  const count = runStats[type];

                  // Show dotted border only when:
                  // 1. No run has started yet (currentRunType === null) and this is the next type
                  // 2. A run is active (currentRunType !== null) and this is the next type AND different from current
                  const showNextBorder = isNext && (currentRunType === null || currentRunType !== nextRunType);

                  return (
                    <button
                      key={type}
                      onClick={() => setNextRunType(type)}
                      className={`flex flex-col items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                        isActive
                          ? "bg-primary/30 text-primary shadow-lg scale-105"
                          : "bg-green-border text-white/60 hover:bg-green-border/80 hover:text-white"
                      } ${
                        showNextBorder
                          ? "border-2 border-dashed border-primary"
                          : "border-2 border-transparent"
                      }`}
                    >
                      <span className="uppercase">{type}</span>
                      <span className="text-xs font-normal opacity-60">{count} laps</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recorded Laps Panel */}
            {recordedLaps.length > 0 && (
              <div className="border-b border-green-border px-10 py-4 bg-green-bg/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-sm">Recorded Laps ({recordedLaps.length})</h3>
                  <button
                    onClick={() => {
                      setRecordedLaps([]);
                      setRunStats({ outside: 0, inside: 0, racing: 0 });
                      debugConsole.info("🗑️ All laps cleared");
                    }}
                    className="px-3 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded border border-red-600/50 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                  {recordedLaps.map((lap) => (
                    <div
                      key={lap.id}
                      className="flex items-center gap-3 px-3 py-2 bg-green-border/30 rounded border border-green-border group hover:border-green-border/80 transition-all"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-xs">Lap {lap.lapNumber}</span>
                          <span className={`text-xs font-bold uppercase ${
                            lap.runType === "outside" ? "text-blue-400" :
                            lap.runType === "inside" ? "text-yellow-400" :
                            "text-red-400"
                          }`}>
                            {lap.runType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-mono">{formatLapTime(lap.lapTime)}</span>
                          <span className="text-white/40 text-xs">({lap.telemetryData.length} pts)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setRecordedLaps(prev => prev.filter(l => l.id !== lap.id));
                          setRunStats(prev => ({
                            ...prev,
                            [lap.runType]: Math.max(0, prev[lap.runType] - 1),
                          }));
                          debugConsole.info(`🗑️ Deleted Lap ${lap.lapNumber} [${lap.runType.toUpperCase()}]`);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-all"
                        title="Delete lap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <main className="flex flex-col flex-1 p-4 gap-4">
              {/* Progress Bar */}
              <ProgressBar label="" value={lapProgress} subtitle="Lap 3" />

              {/* Track Map & Telemetry Cards */}
              <div className="flex flex-1 gap-4 overflow-hidden">
                {/* 3D Track Visualization */}
                <div className="w-3/5 flex h-full">
                  <TrackVisualization
                    telemetryPoints={currentLapTelemetry}
                    currentRunType={currentRunType}
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
                  {/* Throttle/Brake Progress Bars */}
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

        <style>{`
          .pulse-red {
            animation: pulse-red 2s infinite;
          }
          @keyframes pulse-red {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
    </div>
  );
}
