import { useState, useEffect, useRef, useMemo } from "react";
import ProgressBar from "../ui/ProgressBar";
import TelemetryCard from "../ui/TelemetryCard";
import StatusIndicator, { StatusIndicatorStatus } from "../ui/StatusIndicator";
import TrackVisualization from "../TrackVisualization";
import { getTelemetryService, TelemetryData } from "../../lib/telemetry-service";
import { debugConsole } from "../ui/DebugConsole";
import {
  loadRunTypeAssignments,
  saveRunTypeAssignment,
  clearRunTypeAssignments,
  deleteRunTypeAssignment,
  RunTypeAssignmentPayload,
  RunTypeName,
} from "../../lib/run-type-storage";

const GAME_STATES = {
  EXITED: 0,
  FRONT_END: 1,
  IN_GAME_PLAYING: 2,
  IN_GAME_PAUSED: 3,
  IN_GAME_RESTARTING: 4,
  IN_GAME_REPLAY: 5,
  IN_GAME_FRONT_END: 6,
  IN_GAME_TIME_PROGRESSING: 7,
} as const;

const GAME_STATE_LABELS: Record<number, string> = {
  [GAME_STATES.EXITED]: "Exited",
  [GAME_STATES.FRONT_END]: "Front End",
  [GAME_STATES.IN_GAME_PLAYING]: "In-Game (Playing)",
  [GAME_STATES.IN_GAME_PAUSED]: "In-Game (Paused)",
  [GAME_STATES.IN_GAME_RESTARTING]: "In-Game (Restarting)",
  [GAME_STATES.IN_GAME_REPLAY]: "In-Game (Replay)",
  [GAME_STATES.IN_GAME_FRONT_END]: "In-Game (Front End)",
  [GAME_STATES.IN_GAME_TIME_PROGRESSING]: "In-Game (Time Progressing)",
};

type LapRecord = {
  id: number;
  lap: number;
  startedAt: number;
  durationSeconds?: number;
  distanceMeters?: number;
  isActive: boolean;
  validity: "pending" | "valid" | "invalid";
  hadInvalidation?: boolean;
};

type RunType = RunTypeName;

type RunTypeAssignmentState = {
  runType: RunType;
  lapId: number;
  lapNumber: number;
  assignedAt: number;
  validity: "pending" | "valid" | "invalid";
  timeSeconds?: number;
  distanceMeters?: number;
};

type RunTypeAssignmentsState = Record<RunType, RunTypeAssignmentState | null>;

type VisualizerTelemetryPoint = {
  timestamp: number;
  speed: number;
  position: [number, number, number];
  throttle: number;
  brake: number;
  gear: number;
  rpm: number;
  lapDistance: number;
  inPit?: boolean;
  runType: RunType | null;
  isOverlay?: boolean;
};

const RUN_TYPES: RunType[] = ["outside", "inside", "racing"];

const RUN_TYPE_LABELS: Record<RunType, string> = {
  outside: "Outside",
  inside: "Inside",
  racing: "Racing",
};

const isRunTypeName = (value: unknown): value is RunType => RUN_TYPES.includes(value as RunType);

const RUN_TYPE_BUTTON_COLORS: Record<RunType, string> = {
  outside: "bg-blue-600 hover:bg-blue-500 focus-visible:ring-blue-300 text-white",
  inside: "bg-green-600 hover:bg-green-500 focus-visible:ring-green-300 text-white",
  racing: "bg-red-600 hover:bg-red-500 focus-visible:ring-red-300 text-white",
};

const RUN_TYPE_OUTLINE_COLORS: Record<RunType, string> = {
  outside: "border-blue-400 text-blue-200",
  inside: "border-green-400 text-green-200",
  racing: "border-red-400 text-red-200",
};

const RUN_TYPE_HISTORY_CLASSES: Record<RunType, string> = {
  outside: "border-l-2 border-blue-500/80 bg-blue-500/10",
  inside: "border-l-2 border-green-500/80 bg-green-500/10",
  racing: "border-l-2 border-red-500/80 bg-red-500/10",
};

const RUN_TYPE_TILE_COLORS: Record<RunType, {
  assigned: string;
  hover: string;
  accent: string;
  badge: string;
  remove: string;
  unassigned: string;
  unassignedText: string;
}> = {
  outside: {
    assigned: "border-blue-500/70 bg-blue-500/10",
    hover: "hover:bg-blue-500/15",
    accent: "text-blue-200",
    badge: "bg-blue-500/30 text-blue-100 border border-blue-400/60",
    remove: "text-blue-200 hover:text-blue-100 focus-visible:ring-blue-400/50",
    unassigned: "border-dashed border-blue-500/40 bg-blue-500/5",
    unassignedText: "text-blue-200/70",
  },
  inside: {
    assigned: "border-green-500/70 bg-green-500/10",
    hover: "hover:bg-green-500/15",
    accent: "text-green-200",
    badge: "bg-green-500/30 text-green-100 border border-green-400/60",
    remove: "text-green-200 hover:text-green-100 focus-visible:ring-green-400/50",
    unassigned: "border-dashed border-green-500/40 bg-green-500/5",
    unassignedText: "text-green-200/70",
  },
  racing: {
    assigned: "border-red-500/70 bg-red-500/10",
    hover: "hover:bg-red-500/15",
    accent: "text-red-200",
    badge: "bg-red-500/30 text-red-100 border border-red-400/60",
    remove: "text-red-200 hover:text-red-100 focus-visible:ring-red-400/50",
    unassigned: "border-dashed border-red-500/40 bg-red-500/5",
    unassignedText: "text-red-200/70",
  },
};

const MIN_LAP_COVERAGE_RATIO = 0.95;

interface LiveRecordingProps {
  onStopRecording: () => void;
}

function formatPosition(worldPos: [number, number, number]): string {
  const clip = (value: number) => {
    if (!Number.isFinite(value)) {
      return "--";
    }
    const fixed = value.toFixed(1);
    return fixed.length > 8 ? fixed.slice(0, 8) : fixed;
  };

  return `X: ${clip(worldPos[0])}\nY: ${clip(worldPos[1])}\nZ: ${clip(worldPos[2])}`;
}

function formatLapTime(currentTime: number): string {
  if (!Number.isFinite(currentTime) || currentTime <= 0) {
    return "0:00.000";
  }

  const totalSeconds = Math.max(0, currentTime);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

function formatDistance(distanceMeters: number): string {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return "--";
  }
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(2)} km`;
  }
  return `${distanceMeters.toFixed(0)} m`;
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

  const [displayedTelemetryPoints, setDisplayedTelemetryPoints] = useState<VisualizerTelemetryPoint[]>([]);
  const [trackInfo, setTrackInfo] = useState({ location: "", variation: "" });
  const [telemetryRate, setTelemetryRate] = useState(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [currentLapMetrics, setCurrentLapMetrics] = useState({ timeSeconds: 0, distanceMeters: 0 });
  const [selectedLapId, setSelectedLapId] = useState<number | null>(null);
  const [recordingIndicator, setRecordingIndicator] = useState<{ status: StatusIndicatorStatus; label: string }>(
    { status: "idle", label: "Waiting for telemetry" }
  );
  const [runTypeAssignments, setRunTypeAssignments] = useState<RunTypeAssignmentsState>({
    outside: null,
    inside: null,
    racing: null,
  });
  const [selectedRunType, setSelectedRunType] = useState<RunType | null>(null);
  const [isClearingRunTypes, setIsClearingRunTypes] = useState(false);
  const lapsRef = useRef<LapRecord[]>([]);
  const previousLapDistanceRef = useRef<number | null>(null);
  const hasActiveLapRef = useRef(false);
  const currentLapNumberRef = useRef(0);
  const lapTelemetryRef = useRef<Record<number, any[]>>({});
  const lapVisualizerTelemetryRef = useRef<Record<number, VisualizerTelemetryPoint[]>>({});
  const lapValidityRef = useRef<Record<number, "pending" | "flagged" | "valid" | "invalid">>({});
  const runTypeTelemetryRef = useRef<Record<RunType, VisualizerTelemetryPoint[]>>({
    outside: [],
    inside: [],
    racing: [],
  });
  const [runTypeTelemetryState, setRunTypeTelemetryState] = useState<Record<RunType, VisualizerTelemetryPoint[]>>({
    outside: [],
    inside: [],
    racing: [],
  });
  const currentLapIdRef = useRef<number | null>(null);
  const selectedLapIdRef = useRef<number | null>(null);
  const lastGameStateRef = useRef<number | null>(null);
  const selectedRunTypeRef = useRef<RunType | null>(null);
  const trackKeyRef = useRef<string | null>(null);
  const runTypeAssignmentsRef = useRef<RunTypeAssignmentsState>({
    outside: null,
    inside: null,
    racing: null,
  });
  const [overlayTelemetry, setOverlayTelemetry] = useState<VisualizerTelemetryPoint[] | null>(null);
  const [overlayRunType, setOverlayRunType] = useState<RunType | null>(null);
  const overlayTelemetryRef = useRef<VisualizerTelemetryPoint[] | null>(null);
  const overlayRunTypeRef = useRef<RunType | null>(null);
  const trackInfoRef = useRef(trackInfo);

  const clearRunTypeAssignment = (
    runType: RunType,
    options?: { persist?: boolean; message?: string }
  ) => {
    const { persist = true, message } = options ?? {};

    const currentAssignments = runTypeAssignmentsRef.current;
    const hadAssignment = Boolean(currentAssignments[runType]);

    runTypeAssignmentsRef.current = {
      ...currentAssignments,
      [runType]: null,
    };
    setRunTypeAssignments((prev) => ({ ...prev, [runType]: null }));

    runTypeTelemetryRef.current = {
      ...runTypeTelemetryRef.current,
      [runType]: [],
    };
    setRunTypeTelemetryState((prev) => ({ ...prev, [runType]: [] }));

    if (selectedRunTypeRef.current === runType) {
      selectedRunTypeRef.current = null;
      setSelectedRunType(null);
      const selectedLapIdValue = selectedLapIdRef.current;
      if (selectedLapIdValue && lapVisualizerTelemetryRef.current[selectedLapIdValue]) {
        const lapTelemetry = (lapVisualizerTelemetryRef.current[selectedLapIdValue] ?? []).map((point) => ({ ...point }));
        overlayRunTypeRef.current = null;
        overlayTelemetryRef.current = lapTelemetry;
        setOverlayRunType(null);
        setOverlayTelemetry(lapTelemetry);
      } else {
        overlayRunTypeRef.current = null;
        overlayTelemetryRef.current = null;
        setOverlayRunType(null);
        setOverlayTelemetry(null);
      }
    }

    if (overlayRunTypeRef.current === runType) {
      overlayRunTypeRef.current = null;
      overlayTelemetryRef.current = null;
      setOverlayRunType(null);
      setOverlayTelemetry(null);
    }

    if (message && hadAssignment) {
      debugConsole.info(message);
    }

    const trackKey = trackKeyRef.current;
    if (persist && trackKey && hadAssignment) {
      void deleteRunTypeAssignment(trackKey, runType).catch((error) => {
        debugConsole.error(`Failed to remove ${RUN_TYPE_LABELS[runType]} assignment: ${String(error)}`);
      });
    }
  };

  const toVisualizerTelemetryPoint = (point: any, runTypeOverride?: RunType | null): VisualizerTelemetryPoint => {
    const positionSource = Array.isArray(point.position) ? point.position : [0, 0, 0];
    const runTypeValue =
      runTypeOverride !== undefined
        ? runTypeOverride
        : isRunTypeName(point.runType)
          ? point.runType
          : null;

    return {
      timestamp: Number(point.timestamp ?? Date.now()),
      speed: Number(point.speed ?? 0),
      position: [
        Number(positionSource[0] ?? 0),
        Number(positionSource[1] ?? 0),
        Number(positionSource[2] ?? 0),
      ],
      throttle: Number(point.throttle ?? 0),
      brake: Number(point.brake ?? 0),
      gear: Number(point.gear ?? 0),
      rpm: Number(point.rpm ?? 0),
      lapDistance: Number(point.lapDistance ?? 0),
      inPit: Boolean(point.inPit ?? false),
      runType: runTypeValue,
    };
  };

  const toVisualizerTelemetryArray = (points: any[], runTypeOverride?: RunType | null): VisualizerTelemetryPoint[] =>
    points.map((point) => toVisualizerTelemetryPoint(point, runTypeOverride));

  const toStorageTelemetryArray = (points: VisualizerTelemetryPoint[]) =>
    points.map(({ runType: _runType, isOverlay: _isOverlay, inPit: _inPit, ...rest }) => rest);

  const purgeInvalidLapsFromHistory = () => {
    const invalidLapIds = lapsRef.current.filter((lap) => lap.validity === "invalid").map((lap) => lap.id);
    if (invalidLapIds.length === 0) {
      return;
    }

    const invalidSet = new Set(invalidLapIds);
    const retainedLaps = lapsRef.current.filter((lap) => !invalidSet.has(lap.id));
    if (retainedLaps.length !== lapsRef.current.length) {
      lapsRef.current = retainedLaps;
      setLaps(retainedLaps);
    }

    invalidSet.forEach((lapId) => {
      delete lapTelemetryRef.current[lapId];
      delete lapVisualizerTelemetryRef.current[lapId];
      delete lapValidityRef.current[lapId];
    });

    if (selectedLapIdRef.current && invalidSet.has(selectedLapIdRef.current)) {
      selectedLapIdRef.current = null;
      setSelectedLapId(null);
      setSelectedRunType(null);
      setOverlayRunType(null);
      setOverlayTelemetry(null);
    }

    if (currentLapIdRef.current && invalidSet.has(currentLapIdRef.current)) {
      currentLapIdRef.current = null;
      hasActiveLapRef.current = false;
    }

    previousLapDistanceRef.current = null;
    setCurrentLapMetrics({ timeSeconds: 0, distanceMeters: 0 });
    setLapProgress(0);
  };

  const resetActiveLapState = () => {
    const activeLapId = currentLapIdRef.current;
    if (activeLapId !== null) {
      const nextLaps = lapsRef.current.filter((lap) => !(lap.id === activeLapId && lap.isActive));
      if (nextLaps.length !== lapsRef.current.length) {
        lapsRef.current = nextLaps;
        setLaps(nextLaps);
      }

      delete lapTelemetryRef.current[activeLapId];
      delete lapVisualizerTelemetryRef.current[activeLapId];
      delete lapValidityRef.current[activeLapId];
    }

    currentLapIdRef.current = null;
    hasActiveLapRef.current = false;
    previousLapDistanceRef.current = null;

    if (selectedLapIdRef.current === activeLapId) {
      selectedLapIdRef.current = null;
      setSelectedLapId(null);
    }

    setCurrentLapMetrics({ timeSeconds: 0, distanceMeters: 0 });
    setLapProgress(0);

    if (selectedRunTypeRef.current) {
      const activeRunType = selectedRunTypeRef.current;
      const telemetryPoints = runTypeTelemetryRef.current[activeRunType] ?? [];
      overlayRunTypeRef.current = activeRunType;
      setOverlayRunType(activeRunType);
      const overlayPoints = telemetryPoints.map((point) => ({ ...point }));
      overlayTelemetryRef.current = overlayPoints;
      setOverlayTelemetry(overlayPoints);
    } else {
      overlayRunTypeRef.current = null;
      setOverlayRunType(null);
      overlayTelemetryRef.current = null;
      setOverlayTelemetry(null);
    }
  };

  useEffect(() => {
    selectedLapIdRef.current = selectedLapId;
  }, [selectedLapId]);

  useEffect(() => {
    selectedRunTypeRef.current = selectedRunType;
  }, [selectedRunType]);

  useEffect(() => {
    runTypeAssignmentsRef.current = runTypeAssignments;
  }, [runTypeAssignments]);

  useEffect(() => {
    overlayTelemetryRef.current = overlayTelemetry;
  }, [overlayTelemetry]);

  useEffect(() => {
    overlayRunTypeRef.current = overlayRunType;
  }, [overlayRunType]);

  useEffect(() => {
    trackInfoRef.current = trackInfo;
  }, [trackInfo]);

  const persistentVisualizerPoints = useMemo(() => (
    RUN_TYPES.flatMap((runType) =>
      (runTypeTelemetryState[runType] ?? []).map((point) => ({
        ...point,
        runType,
        isOverlay: false,
      }))
    )
  ), [runTypeTelemetryState]);

  const hasRunTypeAssignments = useMemo(
    () => RUN_TYPES.some((runType) => Boolean(runTypeAssignments[runType])),
    [runTypeAssignments]
  );

  const completedLapCount = useMemo(
    () => laps.filter((lap) => !lap.isActive).length,
    [laps]
  );
  const completedLapLabel = completedLapCount === 1 ? "1 completed" : `${completedLapCount} completed`;

  useEffect(() => {
    const overlayPoints = overlayTelemetry && overlayTelemetry.length > 0
      ? overlayTelemetry.map((point) => ({
        ...point,
        runType: overlayRunType ?? point.runType ?? null,
        isOverlay: true,
      }))
      : [];

    setDisplayedTelemetryPoints([
      ...persistentVisualizerPoints,
      ...overlayPoints,
    ]);
  }, [persistentVisualizerPoints, overlayTelemetry, overlayRunType]);

  useEffect(() => {
    if (!trackInfo.location) {
      return;
    }
    const key = `${trackInfo.location}|||${trackInfo.variation ?? ""}`;
    trackKeyRef.current = key;
    let cancelled = false;

    loadRunTypeAssignments(key)
      .then((response) => {
        if (cancelled) {
          return;
        }
        const nextAssignments: RunTypeAssignmentsState = {
          outside: null,
          inside: null,
          racing: null,
        };
        const nextRunTypeTelemetry: Record<RunType, VisualizerTelemetryPoint[]> = {
          outside: [],
          inside: [],
          racing: [],
        };
        RUN_TYPES.forEach((runType) => {
          const stored = response?.[runType];
          if (stored) {
            nextAssignments[runType] = {
              runType,
              lapId: stored.lapId,
              lapNumber: stored.lapNumber,
              assignedAt: stored.assignedAt,
              validity: stored.validity,
              timeSeconds: stored.timeSeconds,
              distanceMeters: stored.distanceMeters,
            };
            const visualizerTelemetry = toVisualizerTelemetryArray(stored.telemetryPoints ?? [], runType);
            runTypeTelemetryRef.current[runType] = visualizerTelemetry;
            nextRunTypeTelemetry[runType] = visualizerTelemetry.map((point) => ({ ...point }));
            lapVisualizerTelemetryRef.current[stored.lapId] = visualizerTelemetry.map((point) => ({ ...point }));
          } else {
            runTypeTelemetryRef.current[runType] = [];
            nextRunTypeTelemetry[runType] = [];
          }
        });
        runTypeAssignmentsRef.current = nextAssignments;
        setRunTypeAssignments(nextAssignments);
        setRunTypeTelemetryState(nextRunTypeTelemetry);

        const activeRunType = selectedRunTypeRef.current;
        if (activeRunType) {
          const stored = response?.[activeRunType];
          if (stored) {
            setOverlayRunType(activeRunType);
            setOverlayTelemetry(runTypeTelemetryRef.current[activeRunType].map((point) => ({ ...point })));
          }
        }
      })
      .catch((error) => {
        debugConsole.error(`Failed to load run type assignments: ${String(error)}`);
      });

    return () => {
      cancelled = true;
    };
  }, [trackInfo.location, trackInfo.variation]);

  const updateRecordingIndicator = (status: StatusIndicatorStatus, label: string) => {
    setRecordingIndicator((prev) => {
      if (prev.status === status && prev.label === label) {
        return prev;
      }
      return { status, label };
    });
  };

  useEffect(() => {
    const service = getTelemetryService();
    let firstUpdate = true;
    let lastUpdateTime = Date.now();
    let connectionLostWarned = false;
    let updateCount = 0;
    let rateCheckStart = Date.now();
    // Small buffer (meters) that prevents noise from triggering false lap resets.
    const LAP_RESET_TOLERANCE = 5;
    const handleTelemetryUpdate = (data: TelemetryData) => {
      setIsConnected(true);
      const now = Date.now();

      if (connectionLostWarned) {
        connectionLostWarned = false;
      }
      lastUpdateTime = now;

      const gameState = data.game_state;
      const lastGameState = lastGameStateRef.current;
      if (lastGameState === null || lastGameState !== gameState) {
        if (gameState === GAME_STATES.IN_GAME_PAUSED) {
          debugConsole.warn(`Pause menu detected (gameState=${gameState}).`);
          updateRecordingIndicator("paused", "Paused");
          setCurrentLapMetrics((prev) => ({
            timeSeconds: prev.timeSeconds,
            distanceMeters: prev.distanceMeters,
          }));
        } else if (
          lastGameState === GAME_STATES.IN_GAME_PAUSED &&
          gameState === GAME_STATES.IN_GAME_PLAYING
        ) {
          debugConsole.success("Resumed driving after pause.");
          updateRecordingIndicator("recording", "Recording");
        } else if (gameState === GAME_STATES.IN_GAME_RESTARTING) {
          debugConsole.warn("Race restart requested from pause menu.");
          updateRecordingIndicator("restarting", "Restarting race...");
          resetActiveLapState();
          purgeInvalidLapsFromHistory();
          setCurrentLapMetrics({ timeSeconds: 0, distanceMeters: 0 });
          lastGameStateRef.current = gameState;
          return;
        } else if (
          lastGameState === GAME_STATES.IN_GAME_RESTARTING &&
          gameState === GAME_STATES.IN_GAME_PLAYING
        ) {
          debugConsole.success("Race restart complete; live telemetry resumed.");
          updateRecordingIndicator("recording", "Recording");
        } else if (gameState === GAME_STATES.FRONT_END || gameState === GAME_STATES.EXITED) {
          updateRecordingIndicator("idle", "In menus");
        } else if (lastGameState !== null) {
          const label = GAME_STATE_LABELS[gameState] ?? `Unknown (${gameState})`;
          debugConsole.info(`Game state changed: ${label}`);
          if (gameState === GAME_STATES.IN_GAME_PLAYING) {
            updateRecordingIndicator("recording", "Recording");
          }
        }
        lastGameStateRef.current = gameState;
      }

      if (gameState === GAME_STATES.IN_GAME_RESTARTING) {
        return;
      }

      // Calculate telemetry rate (Hz)
      updateCount++;
      const elapsed = (now - rateCheckStart) / 1000;
      if (elapsed >= 1) {
        setTelemetryRate(Math.round(updateCount / elapsed));
        updateCount = 0;
        rateCheckStart = now;
      }

      const rawLocation = (data.track_location ?? "").trim();
      const rawVariation = (data.track_variation ?? "").trim();
      const fallbackLocation = rawLocation.length > 0
        ? rawLocation
        : data.track_length
          ? `Unknown Track (${Math.round(data.track_length)}m)`
          : "Unknown Track";
      const nextTrackInfo = {
        location: fallbackLocation,
        variation: rawVariation,
      };

      if (firstUpdate) {
        firstUpdate = false;
        setTrackInfo(nextTrackInfo);
        debugConsole.success(`Connected to AMS2! Track: ${nextTrackInfo.location} ${nextTrackInfo.variation}`.trim());
      } else if (
        nextTrackInfo.location !== trackInfoRef.current.location ||
        nextTrackInfo.variation !== trackInfoRef.current.variation
      ) {
        setTrackInfo(nextTrackInfo);
        debugConsole.info(`Track context updated: ${nextTrackInfo.location} ${nextTrackInfo.variation}`.trim());
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

        const lapDistance = typeof player.current_lap_distance === "number"
          ? Math.max(player.current_lap_distance, 0)
          : 0;

        const commitLaps = (nextLaps: LapRecord[]) => {
          lapsRef.current = nextLaps;
          setLaps(nextLaps);
        };

        if (!hasActiveLapRef.current && lapDistance > 0) {
          hasActiveLapRef.current = true;
          currentLapNumberRef.current += 1;
          const lapNumber = currentLapNumberRef.current;
          const lapId = now;
          currentLapIdRef.current = lapId;
          lapTelemetryRef.current[lapId] = [];
          lapVisualizerTelemetryRef.current[lapId] = [];
          lapValidityRef.current[lapId] = "pending";
          const nextLaps = [...lapsRef.current, {
            id: lapId,
            lap: lapNumber,
            startedAt: now,
            isActive: true,
            validity: "pending" as const,
            hadInvalidation: false,
          }];
          commitLaps(nextLaps);
          if (selectedRunTypeRef.current === null) {
            selectedLapIdRef.current = lapId;
            setSelectedLapId(lapId);
            setOverlayRunType(null);
            setOverlayTelemetry([]);
          }
          debugConsole.success(`Lap ${lapNumber} start detected (distance ${lapDistance.toFixed(1)}m).`);
        } else if (
          hasActiveLapRef.current &&
          previousLapDistanceRef.current !== null &&
          lapDistance + LAP_RESET_TOLERANCE < previousLapDistanceRef.current
        ) {
          const previousLapId = currentLapIdRef.current;
          const updatedLaps = [...lapsRef.current];
          if (previousLapId !== null) {
            const previousIndex = updatedLaps.findIndex((lap) => lap.id === previousLapId);
            if (previousIndex !== -1) {
              const previousLapRecord = updatedLaps[previousIndex];
              const previousLapPoints = lapTelemetryRef.current[previousLapId] || [];
              const previousLastPoint = previousLapPoints[previousLapPoints.length - 1];
              const completedDuration = previousLastPoint
                ? Math.max((previousLastPoint.timestamp - previousLapRecord.startedAt) / 1000, 0)
                : previousLapRecord.durationSeconds;
              const completedDistance = previousLastPoint?.lapDistance
                ?? previousLapDistanceRef.current
                ?? previousLapRecord.distanceMeters;
              const distanceMeters = Number.isFinite(completedDistance ?? NaN)
                ? Number(completedDistance)
                : 0;
              const trackLengthMeters = Number.isFinite(data.track_length ?? NaN)
                ? Number(data.track_length)
                : 0;
              const meetsCoverageThreshold = trackLengthMeters <= 0
                ? distanceMeters > 0
                : distanceMeters >= trackLengthMeters * MIN_LAP_COVERAGE_RATIO;

              if (!meetsCoverageThreshold) {
                updatedLaps.splice(previousIndex, 1);
                delete lapTelemetryRef.current[previousLapId];
                delete lapVisualizerTelemetryRef.current[previousLapId];
                delete lapValidityRef.current[previousLapId];

                RUN_TYPES.forEach((runType) => {
                  const assignment = runTypeAssignmentsRef.current[runType];
                  if (assignment && assignment.lapId === previousLapId) {
                    clearRunTypeAssignment(runType, {
                      message: `${RUN_TYPE_LABELS[runType]} assignment cleared because Lap ${previousLapRecord.lap} did not cover enough track distance.`,
                    });
                  }
                });

                if (selectedLapIdRef.current === previousLapId) {
                  selectedLapIdRef.current = null;
                  setSelectedLapId(null);
                  overlayRunTypeRef.current = null;
                  overlayTelemetryRef.current = null;
                  setOverlayRunType(null);
                  setOverlayTelemetry(null);
                }

                if (distanceMeters > 0 && trackLengthMeters > 0) {
                  const coveragePercent = Math.min(100, (distanceMeters / trackLengthMeters) * 100);
                  debugConsole.warn(
                    `Discarded Lap ${previousLapRecord.lap}: covered only ${coveragePercent.toFixed(1)}% (${distanceMeters.toFixed(0)}m of ${trackLengthMeters.toFixed(0)}m).`
                  );
                } else {
                  debugConsole.warn(
                    `Discarded Lap ${previousLapRecord.lap}: insufficient track coverage detected.`
                  );
                }
              } else {
                const validityState = lapValidityRef.current[previousLapId];
                const finalizedValidity = validityState === "flagged" || validityState === "invalid"
                  ? "invalid"
                  : "valid";
                lapValidityRef.current[previousLapId] = finalizedValidity;
                updatedLaps[previousIndex] = {
                  ...previousLapRecord,
                  durationSeconds: completedDuration,
                  distanceMeters: distanceMeters,
                  isActive: false,
                  validity: finalizedValidity,
                  hadInvalidation: finalizedValidity === "invalid",
                };
                RUN_TYPES.forEach((runType) => {
                  const assignment = runTypeAssignmentsRef.current[runType];
                  if (assignment && assignment.lapId === previousLapId) {
                    const updatedAssignment: RunTypeAssignmentState = {
                      ...assignment,
                      validity: finalizedValidity,
                      timeSeconds: completedDuration,
                      distanceMeters,
                    };
                    runTypeAssignmentsRef.current = {
                      ...runTypeAssignmentsRef.current,
                      [runType]: updatedAssignment,
                    };
                    setRunTypeAssignments((prev) => ({
                      ...prev,
                      [runType]: updatedAssignment,
                    }));

                    const trackKey = trackKeyRef.current;
                    if (trackKey) {
                      const telemetryPoints = runTypeTelemetryRef.current[runType] ?? [];
                      const payload: RunTypeAssignmentPayload = {
                        lapId: updatedAssignment.lapId,
                        lapNumber: updatedAssignment.lapNumber,
                        assignedAt: updatedAssignment.assignedAt,
                        validity: updatedAssignment.validity,
                        timeSeconds: updatedAssignment.timeSeconds,
                        distanceMeters: updatedAssignment.distanceMeters,
                        telemetryPoints: toStorageTelemetryArray(telemetryPoints),
                      };
                      void saveRunTypeAssignment(trackKey, runType, payload).catch((error) => {
                        debugConsole.error(`Failed to refresh ${RUN_TYPE_LABELS[runType]} assignment: ${String(error)}`);
                      });
                    }
                  }
                });
              }
            }
          }
          currentLapNumberRef.current += 1;
          const lapNumber = currentLapNumberRef.current;
          const newLapId = now;
          currentLapIdRef.current = newLapId;
          lapTelemetryRef.current[newLapId] = [];
          lapVisualizerTelemetryRef.current[newLapId] = [];
          lapValidityRef.current[newLapId] = "pending";
          updatedLaps.push({
            id: newLapId,
            lap: lapNumber,
            startedAt: now,
            isActive: true,
            validity: "pending" as const,
            hadInvalidation: false,
          });
          commitLaps(updatedLaps);
          const selectedId = selectedLapIdRef.current;
          if (selectedRunTypeRef.current === null && (selectedId === null || selectedId === previousLapId || selectedId === newLapId)) {
            selectedLapIdRef.current = newLapId;
            setSelectedLapId(newLapId);
            setOverlayRunType(null);
            setOverlayTelemetry([]);
          }
          debugConsole.info(
            `Lap ${lapNumber} start detected (distance reset from ${previousLapDistanceRef.current.toFixed(1)}m).`
          );
        }

        const activeLapId = currentLapIdRef.current;
        if (activeLapId !== null) {
          const existingPoints = lapTelemetryRef.current[activeLapId] || [];
          const updatedPoints = [...existingPoints, telemetryPoint];
          lapTelemetryRef.current[activeLapId] = updatedPoints;
          const visualizerPoints = lapVisualizerTelemetryRef.current[activeLapId] || [];
          const visualizerPoint = toVisualizerTelemetryPoint(telemetryPoint, null);
          lapVisualizerTelemetryRef.current[activeLapId] = [...visualizerPoints, visualizerPoint];
          if (selectedRunTypeRef.current === null && selectedLapIdRef.current === activeLapId) {
            setOverlayRunType(null);
            setOverlayTelemetry(lapVisualizerTelemetryRef.current[activeLapId].map((point) => ({ ...point })));
          }
          const activeLapRecord = lapsRef.current.find((lap) => lap.id === activeLapId);
          if (activeLapRecord) {
            const elapsedSeconds = Math.max((telemetryPoint.timestamp - activeLapRecord.startedAt) / 1000, 0);
            setCurrentLapMetrics((prev) => ({
              timeSeconds: gameState === GAME_STATES.IN_GAME_PLAYING ? elapsedSeconds : prev.timeSeconds,
              distanceMeters: lapDistance,
            }));
            if (data.lap_invalidated && lapValidityRef.current[activeLapId] === "pending") {
              lapValidityRef.current[activeLapId] = "flagged";
              const nextLaps = lapsRef.current.map((lap) =>
                lap.id === activeLapId ? { ...lap, hadInvalidation: true } : lap
              );
              commitLaps(nextLaps);
              debugConsole.warn(`Lap ${activeLapRecord.lap} flagged for validation by simulator.`);
            }
            if (gameState === GAME_STATES.IN_GAME_PLAYING) {
              const lapLabel = `Recording Lap ${Math.max(1, activeLapRecord.lap || 1)}`;
              updateRecordingIndicator("recording", lapLabel);
            }
          }
        } else {
          setCurrentLapMetrics({ timeSeconds: 0, distanceMeters: 0 });
        }

        previousLapDistanceRef.current = lapDistance;

        // Calculate lap progress
        const rawProgress = data.track_length > 0
          ? (player.current_lap_distance / data.track_length) * 100
          : 0;
        const roundedProgress = Math.min(100, Math.max(0, Math.round(rawProgress)));

        setLapProgress(roundedProgress);

        // Update telemetry display
        const throttlePct = Math.round(data.throttle * 100);
        const brakePct = Math.round(data.brake * 100);

        const rawLapNumber = Number(player.current_lap);
        const lapNumber = Number.isFinite(rawLapNumber) && rawLapNumber > 0 ? rawLapNumber : 1;
        const lapValue = `Lap ${lapNumber}\n${formatLapTime(data.current_time)}`;

        setTelemetry({
          speed: Math.round(data.speed * 2.23694),
          position: formatPosition(player.world_position),
          lap: lapValue,
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
        updateRecordingIndicator("idle", "Waiting for telemetry");
      }
    }, 2000);

    const handleStarted = () => { };
    const handleConnected = () => { };
    const handleError = () => { };

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

  const handleClearLaps = () => {
    if (lapsRef.current.length === 0) {
      debugConsole.info("Lap history is already empty.");
      return;
    }

    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Are you sure you want to clear all recorded laps?");
      if (!confirmed) {
        return;
      }
    }

    lapsRef.current = [];
    previousLapDistanceRef.current = null;
    hasActiveLapRef.current = false;
    currentLapNumberRef.current = 0;
    lapTelemetryRef.current = {};
    lapVisualizerTelemetryRef.current = {};
    lapValidityRef.current = {};
    currentLapIdRef.current = null;
    selectedLapIdRef.current = null;
    lastGameStateRef.current = null;
    setSelectedLapId(null);
    setLapProgress(0);
    setLaps([]);
    setCurrentLapMetrics({ timeSeconds: 0, distanceMeters: 0 });
    updateRecordingIndicator("idle", "Waiting for telemetry");
    debugConsole.warn("Lap history cleared.");

    const activeRunType = selectedRunTypeRef.current;
    if (activeRunType) {
      const telemetryPoints = runTypeTelemetryRef.current[activeRunType];
      setOverlayRunType(activeRunType);
      setOverlayTelemetry(telemetryPoints.map((point) => ({ ...point })));
    } else {
      setOverlayRunType(null);
      setOverlayTelemetry(null);
    }
  };

  const handleClearRunTypeAssignments = async () => {
    const trackKey = trackKeyRef.current;
    if (!trackKey) {
      debugConsole.warn("Track information is unavailable; cannot clear run type assignments.");
      return;
    }

    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Are you sure you want to delete all the assigned run types?");
      if (!confirmed) {
        return;
      }
    }

    setIsClearingRunTypes(true);
    try {
      RUN_TYPES.forEach((runType) => {
        clearRunTypeAssignment(runType, { persist: false });
      });

      await clearRunTypeAssignments(trackKey);
      debugConsole.info("Cleared saved run type assignments for this track.");
    } catch (error) {
      debugConsole.error(`Failed to clear run type assignments: ${String(error)}`);
    } finally {
      setIsClearingRunTypes(false);
    }
  };

  const handleRunTypeRemove = (runType: RunType) => {
    const existingAssignment = runTypeAssignmentsRef.current[runType];
    if (!existingAssignment) {
      debugConsole.info(`${RUN_TYPE_LABELS[runType]} is already unassigned.`);
      return;
    }

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`Remove the ${RUN_TYPE_LABELS[runType]} assignment?`);
      if (!confirmed) {
        return;
      }
    }

    clearRunTypeAssignment(runType, {
      message: `${RUN_TYPE_LABELS[runType]} assignment cleared.`,
    });
  };

  const assignRunType = async (runType: RunType, lap: LapRecord) => {
    if (lap.isActive) {
      debugConsole.warn(`Lap ${lap.lap} is still in progress. Finish the lap before assigning a run type.`);
      return;
    }
    if (lap.validity === "invalid") {
      debugConsole.warn(`Lap ${lap.lap} was invalidated and cannot be used for a run type.`);
      return;
    }
    const trackKey = trackKeyRef.current;
    if (!trackKey) {
      debugConsole.error("Track information is unavailable; cannot persist run type assignment.");
      return;
    }

    const telemetryPoints = lapTelemetryRef.current[lap.id] ?? [];
    if (telemetryPoints.length === 0) {
      debugConsole.warn(`No telemetry data captured for Lap ${lap.lap}; unable to assign.`);
      return;
    }

    RUN_TYPES.forEach((existingRunType) => {
      if (existingRunType !== runType) {
        const existingAssignment = runTypeAssignmentsRef.current[existingRunType];
        if (existingAssignment?.lapId === lap.id) {
          clearRunTypeAssignment(existingRunType, {
            message: `${RUN_TYPE_LABELS[existingRunType]} assignment cleared; Lap ${lap.lap} reassigned to ${RUN_TYPE_LABELS[runType]}.`,
          });
        }
      }
    });

    const lastPoint = telemetryPoints[telemetryPoints.length - 1];
    const durationSeconds = typeof lap.durationSeconds === "number"
      ? lap.durationSeconds
      : lastPoint
        ? Math.max((lastPoint.timestamp - lap.startedAt) / 1000, 0)
        : undefined;
    const distanceMeters = typeof lap.distanceMeters === "number"
      ? lap.distanceMeters
      : lastPoint?.lapDistance;

    const visualizerTelemetry = toVisualizerTelemetryArray(telemetryPoints, runType);
    const storageTelemetry = toStorageTelemetryArray(visualizerTelemetry);

    const nextAssignment: RunTypeAssignmentState = {
      runType,
      lapId: lap.id,
      lapNumber: lap.lap,
      assignedAt: Date.now(),
      validity: lap.validity,
      timeSeconds: durationSeconds,
      distanceMeters,
    };

    const payload: RunTypeAssignmentPayload = {
      lapId: lap.id,
      lapNumber: lap.lap,
      assignedAt: nextAssignment.assignedAt,
      validity: lap.validity,
      timeSeconds: durationSeconds,
      distanceMeters,
      telemetryPoints: storageTelemetry,
    };

    runTypeTelemetryRef.current[runType] = visualizerTelemetry.map((point) => ({ ...point }));
    lapVisualizerTelemetryRef.current[lap.id] = visualizerTelemetry.map((point) => ({ ...point }));
    runTypeAssignmentsRef.current = {
      ...runTypeAssignmentsRef.current,
      [runType]: nextAssignment,
    };
    setRunTypeAssignments((prev) => ({ ...prev, [runType]: nextAssignment }));
    setRunTypeTelemetryState((prev) => ({
      ...prev,
      [runType]: visualizerTelemetry.map((point) => ({ ...point })),
    }));
    setSelectedRunType(runType);
    selectedLapIdRef.current = lap.id;
    setSelectedLapId(lap.id);
    setOverlayRunType(runType);
    setOverlayTelemetry(visualizerTelemetry.map((point) => ({ ...point })));

    try {
      await saveRunTypeAssignment(trackKey, runType, payload);
      debugConsole.success(`Assigned Lap ${lap.lap} to the ${RUN_TYPE_LABELS[runType]} line.`);
    } catch (error) {
      debugConsole.error(`Failed to persist ${RUN_TYPE_LABELS[runType]} assignment: ${String(error)}`);
    }
  };

  const handleRunTypeSelect = (runType: RunType) => {
    const assignment = runTypeAssignments[runType];
    if (!assignment) {
      debugConsole.info(`No lap assigned to the ${RUN_TYPE_LABELS[runType]} line yet.`);
      return;
    }
    const telemetryPoints = runTypeTelemetryRef.current[runType];
    setSelectedRunType(runType);
    selectedLapIdRef.current = assignment.lapId;
    setSelectedLapId(assignment.lapId);
    setOverlayRunType(runType);
    setOverlayTelemetry(telemetryPoints.map((point) => ({ ...point })));
  };

  const handleLapClick = (lap: LapRecord) => {
    selectedLapIdRef.current = lap.id;
    setSelectedLapId(lap.id);
    const assignedRunType = RUN_TYPES.find((runType) => runTypeAssignmentsRef.current[runType]?.lapId === lap.id) ?? null;
    if (assignedRunType) {
      setSelectedRunType(assignedRunType);
      const telemetryPoints = runTypeTelemetryRef.current[assignedRunType];
      setOverlayRunType(assignedRunType);
      setOverlayTelemetry(telemetryPoints.map((point) => ({ ...point })));
      return;
    }

    setSelectedRunType(null);
    const lapVisualizerPoints = lapVisualizerTelemetryRef.current[lap.id]
      ?? toVisualizerTelemetryArray(lapTelemetryRef.current[lap.id] || []);
    lapVisualizerTelemetryRef.current[lap.id] = lapVisualizerPoints.map((point) => ({ ...point, runType: point.runType ?? null }));
    setOverlayRunType(null);
    setOverlayTelemetry(lapVisualizerTelemetryRef.current[lap.id].map((point) => ({ ...point, runType: null })));
  };

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

              <StatusIndicator status={recordingIndicator.status} label={recordingIndicator.label} />
              <StatusIndicator
                status={isConnected ? "connected" : "disconnected"}
                label={isConnected ? "Connected" : "Waiting..."}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-col flex-1 p-4 gap-3">
            {/* Track Map & Telemetry Cards */}
            <div className="flex flex-1 gap-3 overflow-hidden">
              {/* 3D Track Visualization & Telemetry Snapshot */}
              <div className="w-3/5 flex flex-col gap-3 h-full">
                <div className="flex-1 rounded-lg border border-green-border overflow-hidden">
                  <TrackVisualization
                    telemetryPoints={displayedTelemetryPoints}
                    currentRunType={null}
                    className="w-full h-full"
                  />
                </div>
                <div className="rounded-lg border border-green-border/80 bg-green-bg/40">
                  <ProgressBar label="Lap Progress" value={lapProgress} compact />
                </div>
                <div className="flex flex-col gap-3 rounded-lg border border-green-border/80 bg-green-bg/40 p-3">
                  <div className="flex flex-wrap gap-3">
                    <TelemetryCard label="Speed" value={`${telemetry.speed} MPH`} compact />
                    <TelemetryCard
                      label="Position"
                      value={telemetry.position}
                      compact
                      valueClassName="whitespace-pre-line text-white/80 text-xs leading-tight tracking-normal"
                    />
                    <TelemetryCard
                      label="Lap"
                      value={telemetry.lap}
                      compact
                      valueClassName="whitespace-pre-line text-white text-xs leading-tight"
                    />
                    <TelemetryCard label="Gear" value={telemetry.gear} compact />
                  </div>
                  <div className="flex flex-col gap-2">
                    <ProgressBar label="Throttle" value={telemetry.throttle} compact />
                    <ProgressBar label="Brake" value={telemetry.brake} compact />
                  </div>
                </div>
              </div>

              {/* Lap History */}
              <div className="w-2/5 flex flex-col gap-3">
                <div className="flex flex-col flex-1 rounded-lg border border-green-border bg-green-bg/30 min-h-0">
                  <div className="flex items-center justify-between border-b border-green-border px-4 py-3">
                    <h3 className="text-white text-sm font-bold uppercase tracking-wide">Lap History</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60">{completedLapLabel}</span>
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-white/60 hover:text-red-300 hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => handleClearLaps()}
                        title="Clear lap history"
                        aria-label="Clear lap history"
                        disabled={laps.length === 0}
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {laps.length === 0 ? (
                      <div className="flex h-full items-center justify-center px-4 text-xs text-white/40">
                        No laps recorded yet
                      </div>
                    ) : (
                      <ul className="divide-y divide-green-border/40">
                        {laps.map((lap) => {
                          const isActive = lap.isActive;
                          const isSelected = selectedLapId === lap.id;
                          const lapAssignmentRunType = RUN_TYPES.find((runType) => runTypeAssignments[runType]?.lapId === lap.id) ?? null;
                          const assignmentHighlightClass = lapAssignmentRunType ? RUN_TYPE_HISTORY_CLASSES[lapAssignmentRunType] : "";
                          const stateClasses: string[] = [];
                          if (isSelected) {
                            stateClasses.push("bg-green-bg/70");
                          } else if (isActive) {
                            stateClasses.push("bg-green-bg/40");
                          }
                          if (assignmentHighlightClass) {
                            stateClasses.push(assignmentHighlightClass);
                          }
                          const rowClassName = stateClasses.join(" ");
                          const canAssignRunType = !isActive && lap.validity === "valid";
                          let runTypeHelperText: string | null = null;
                          if (!canAssignRunType && isSelected) {
                            if (isActive) {
                              runTypeHelperText = "Complete the lap before assigning a run type.";
                            } else if (lap.validity !== "valid") {
                              runTypeHelperText = "Only valid laps can be assigned to a run type.";
                            }
                          }
                          const timeValue = lap.durationSeconds ?? (isActive ? currentLapMetrics.timeSeconds : undefined);
                          const distanceValue = lap.distanceMeters ?? (isActive ? currentLapMetrics.distanceMeters : undefined);
                          let statusLabel = "Pending";
                          let statusTextClass = "text-white/50";
                          let lapTitleClass = "text-white";

                          if (isActive) {
                            if (lap.hadInvalidation) {
                              statusLabel = "Validating";
                              statusTextClass = "text-orange-400";
                              lapTitleClass = "text-orange-200";
                            } else {
                              statusLabel = "In Progress";
                            }
                          } else {
                            if (lap.validity === "invalid") {
                              statusLabel = "Invalid";
                              statusTextClass = "text-red-400";
                              lapTitleClass = "text-red-300";
                            } else if (lap.validity === "valid") {
                              statusLabel = "Completed";
                            }
                          }

                          const isAssignedRunType = (runType: RunType) => runTypeAssignments[runType]?.lapId === lap.id;
                          return (
                            <li
                              key={`lap-${lap.startedAt}`}
                              className={rowClassName}
                            >
                              <div className="px-4 py-3">
                                <button
                                  type="button"
                                  className="w-full text-left text-xs text-white/80 transition-colors hover:bg-green-bg/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md px-2 py-2"
                                  onClick={() => handleLapClick(lap)}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`font-semibold ${lapTitleClass}`}>Lap {lap.lap}</span>
                                    <span className={`${statusTextClass}`}>{statusLabel}</span>
                                  </div>
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-white/80">
                                    <div>
                                      <div className="text-white/50 uppercase tracking-wide">Time</div>
                                      <div className="font-mono text-sm">
                                        {typeof timeValue === "number" ? formatLapTime(timeValue) : "--:--"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-white/50 uppercase tracking-wide">Distance</div>
                                      <div className="font-mono text-sm">
                                        {typeof distanceValue === "number" ? formatDistance(distanceValue) : "--"}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                                {isSelected && canAssignRunType && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {RUN_TYPES.map((runType) => {
                                      const assigned = isAssignedRunType(runType);
                                      return (
                                        <button
                                          key={`${lap.id}-${runType}`}
                                          type="button"
                                          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 ${assigned
                                            ? RUN_TYPE_BUTTON_COLORS[runType]
                                            : `${RUN_TYPE_OUTLINE_COLORS[runType]} bg-transparent hover:bg-green-bg/40 focus-visible:ring-primary/40`
                                            } ${lap.validity === "invalid" ? "opacity-40 cursor-not-allowed" : ""}`}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            if (lap.validity === "invalid") {
                                              debugConsole.warn("Cannot assign an invalid lap to a run type.");
                                              return;
                                            }
                                            void assignRunType(runType, lap);
                                          }}
                                          disabled={lap.validity === "invalid"}
                                        >
                                          {RUN_TYPE_LABELS[runType]}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                {isSelected && runTypeHelperText && (
                                  <div className="mt-3 rounded-md border border-dashed border-green-border/60 bg-green-bg/40 px-3 py-2 text-[11px] text-white/50">
                                    {runTypeHelperText}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-green-border bg-green-bg/30 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-white text-sm font-bold uppercase tracking-wide">Run Type Laps</h4>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-white/60 transition-colors hover:text-red-300 hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-30"
                      onClick={() => {
                        void handleClearRunTypeAssignments();
                      }}
                      disabled={isClearingRunTypes || !hasRunTypeAssignments}
                      title="Clear all run type assignments"
                      aria-label="Clear all run type assignments"
                    >
                      <span className="material-symbols-outlined text-base">
                        {isClearingRunTypes ? "hourglass_top" : "delete"}
                      </span>
                    </button>
                  </div>
                  <ul className="mt-3 flex flex-col gap-2">
                    {RUN_TYPES.map((runType) => {
                      const assignment = runTypeAssignments[runType];
                      const telemetryAvailable = runTypeTelemetryRef.current[runType]?.length > 0;
                      const isSelectedRunType = selectedRunType === runType;
                      const tileColors = RUN_TYPE_TILE_COLORS[runType];
                      const validityLabel = assignment?.validity === "valid"
                        ? "Valid"
                        : assignment?.validity === "invalid"
                          ? "Invalid"
                          : assignment
                            ? "Pending"
                            : "Unassigned";
                      const statusClass = assignment?.validity === "invalid"
                        ? "text-red-300"
                        : assignment?.validity === "valid"
                          ? "text-green-300"
                          : "text-white/60";

                      if (assignment && telemetryAvailable) {
                        return (
                          <li key={`run-${runType}`}>
                            <div
                              className={`relative overflow-hidden rounded-lg border transition-colors focus-within:ring-2 focus-within:ring-primary/60 ${tileColors.assigned} ${tileColors.hover} ${isSelectedRunType ? "ring-1 ring-primary/60" : ""}`}
                            >
                              <button
                                type="button"
                                className="w-full text-left px-3 py-3 pr-10 text-xs text-white/80"
                                onClick={() => handleRunTypeSelect(runType)}
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`font-semibold ${tileColors.accent}`}>{RUN_TYPE_LABELS[runType]} Line</span>
                                  <span className="font-mono text-white/80 inline-block pr-4">Lap {assignment.lapNumber}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-white/70">
                                  <div>
                                    <div className="uppercase tracking-wide">Time</div>
                                    <div className="font-mono text-sm text-white">
                                      {typeof assignment.timeSeconds === "number"
                                        ? formatLapTime(assignment.timeSeconds)
                                        : "--:--"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="uppercase tracking-wide">Distance</div>
                                    <div className="font-mono text-sm text-white">
                                      {typeof assignment.distanceMeters === "number"
                                        ? formatDistance(assignment.distanceMeters)
                                        : "--"}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-[11px]">
                                  <span className={`uppercase tracking-wide ${statusClass}`}>{validityLabel}</span>
                                  <span className={`${tileColors.accent}`}>Tap to view</span>
                                </div>
                              </button>
                              <button
                                type="button"
                                className={`absolute top-2.5 right-2 rounded-full p-1 transition-all focus:outline-none focus-visible:ring-2 ${tileColors.remove}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRunTypeRemove(runType);
                                }}
                                title={`Clear ${RUN_TYPE_LABELS[runType]} assignment`}
                                aria-label={`Clear ${RUN_TYPE_LABELS[runType]} assignment`}
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li
                          key={`run-${runType}`}
                          className={`rounded-lg px-3 py-3 text-left ${tileColors.unassigned}`}
                        >
                          <div className={`flex items-center justify-between text-xs ${tileColors.unassignedText}`}>
                            <span className="font-semibold">{RUN_TYPE_LABELS[runType]} Line</span>
                            <span className="uppercase">Unassigned</span>
                          </div>
                          <div className="mt-2 text-[11px] text-white/40">
                            Assign a recorded lap via the buttons above.
                          </div>
                        </li>
                      );
                    })}
                  </ul>
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
