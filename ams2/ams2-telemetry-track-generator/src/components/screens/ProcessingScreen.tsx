import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import ProcessingPhaseItem from "../ui/ProcessingPhaseItem";
import {
  getProcessingService,
  ProcessingLogEvent,
  ProcessingProgressEvent,
  ProcessingCompleteEvent,
} from "../../lib/processing-service";
import { ProcessingResult, StopRecordingPayload } from "../../lib/processing-types";
import {
  RunTypeAssignmentPayload,
  RunTypeName,
  StoredTelemetryPoint,
} from "../../lib/run-type-storage";

type PhaseStatus = {
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  progress: number;
};

const PROCESSING_PHASES: Array<Pick<PhaseStatus, "title" | "description">> = [
  {
    title: "Phase 1: Data Ingestion",
    description: "Loading telemetry file and normalising capture signals",
  },
  {
    title: "Phase 2: Point Cloud Generation",
    description: "Aligning GPS coordinates and building the 3D cloud",
  },
  {
    title: "Phase 3: Model Finalization",
    description: "Meshing the surface and applying overlays",
  },
];

function formatEta(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "--";
  }
  const clamped = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(clamped / 60);
  const remainder = clamped % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainder.toString().padStart(2, "0")}s`;
  }
  return `${remainder}s`;
}

function formatLogTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface ProcessingScreenProps {
  initialPayload: StopRecordingPayload | null;
  onComplete: (result: ProcessingResult) => void;
  onCancel: () => void;
}

export default function ProcessingScreen({ initialPayload, onComplete, onCancel }: ProcessingScreenProps) {
  const processingService = useMemo(() => getProcessingService(), []);
  const [activePayload, setActivePayload] = useState<StopRecordingPayload | null>(initialPayload);
  const [phases, setPhases] = useState<PhaseStatus[]>(() =>
    PROCESSING_PHASES.map((phase, index) => ({
      ...phase,
      status: index === 0 ? "in-progress" : "pending",
      progress: 0,
    }))
  );
  const [overallProgress, setOverallProgress] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [logEntries, setLogEntries] = useState<ProcessingLogEvent[]>([]);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingManualPayload, setIsLoadingManualPayload] = useState(false);
  const [manualLoadError, setManualLoadError] = useState<string | null>(null);
  const logListRef = useRef<HTMLDivElement | null>(null);

  const payloadRef = useRef<StopRecordingPayload | null>(initialPayload);

  useEffect(() => {
    setActivePayload(initialPayload);
  }, [initialPayload]);

  useEffect(() => {
    payloadRef.current = activePayload;
  }, [activePayload]);

  const resetPhases = useCallback(() => {
    setPhases(
      PROCESSING_PHASES.map((phase, index) => ({
        ...phase,
        status: index === 0 ? "in-progress" : "pending",
        progress: 0,
      }))
    );
  }, []);

  const resetRun = useCallback(() => {
    resetPhases();
    setOverallProgress(0);
    setEtaSeconds(null);
    setProcessingError(null);
    setLogEntries([]);
  }, [resetPhases]);

  const beginProcessing = useCallback(async (payloadOverride?: StopRecordingPayload | null) => {
    resetRun();
    const payload = payloadOverride ?? payloadRef.current;
    if (!payload) {
      setIsRunning(false);
      setProcessingError("No telemetry session is loaded yet. Record runs before starting processing.");
      return;
    }
    try {
      await processingService.start({
        request: payload,
      });
    } catch (error) {
      setProcessingError(String(error));
    }
  }, [processingService, resetRun]);

  const loadTelemetryExports = useCallback(
    async (filePaths: string[]): Promise<StopRecordingPayload> => {
      type ExportFilePayload = {
        track_key: string;
        track: {
          location: string;
          variation: string;
        };
        run_type: string;
        exported_at: string;
        lap: {
          id: number;
          number: number;
          validity: string;
          time_seconds?: number;
          distance_meters?: number;
          assigned_at: number;
        };
        telemetry: StoredTelemetryPoint[];
      };

      const acceptableRunTypes: RunTypeName[] = ["outside", "inside", "racing"];
      const assignmentMap: Partial<Record<RunTypeName, { assignment: RunTypeAssignmentPayload; filePath: string }>> = {};

      let trackKey: string | null = null;
      let trackLocation: string | null = null;
      let trackVariation: string | undefined;

      for (const filePath of filePaths) {
        const raw = await readTextFile(filePath);
        const parsed = JSON.parse(raw) as ExportFilePayload;
        const runType = parsed.run_type as RunTypeName;

        if (!acceptableRunTypes.includes(runType)) {
          continue;
        }

        const assignment: RunTypeAssignmentPayload = {
          lapId: parsed.lap.id,
          lapNumber: parsed.lap.number,
          assignedAt: parsed.lap.assigned_at,
          validity: parsed.lap.validity as RunTypeAssignmentPayload["validity"],
          timeSeconds: parsed.lap.time_seconds,
          distanceMeters: parsed.lap.distance_meters,
          telemetryPoints: parsed.telemetry as StoredTelemetryPoint[],
        };

        assignmentMap[runType] = {
          assignment,
          filePath,
        };

        trackKey = trackKey ?? parsed.track_key;
        trackLocation = trackLocation ?? parsed.track.location;
        trackVariation = trackVariation ?? (parsed.track.variation || undefined);
      }

      const missingRunTypes = acceptableRunTypes.filter((type) => !assignmentMap[type]);
      if (missingRunTypes.length > 0) {
        throw new Error(
          `Missing telemetry exports for: ${missingRunTypes
            .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
            .join(", ")}.`
        );
      }

      if (!trackKey || !trackLocation) {
        throw new Error("Telemetry exports are missing track metadata.");
      }

      return {
        trackKey,
        trackLocation,
        trackVariation,
        assignments: {
          outside: assignmentMap.outside!.assignment,
          inside: assignmentMap.inside!.assignment,
          racing: assignmentMap.racing!.assignment,
        },
        exportedFiles: acceptableRunTypes.map((runType) => ({
          runType,
          filePath: assignmentMap[runType]!.filePath,
        })),
      };
    },
    []
  );

  const handleLoadManualPayload = useCallback(async () => {
    setManualLoadError(null);
    try {
      const selection = await open({
        multiple: true,
        filters: [{ name: "Telemetry Exports", extensions: ["json"] }],
      });

      const files = Array.isArray(selection)
        ? selection
        : typeof selection === "string"
          ? [selection]
          : [];

      if (files.length === 0) {
        return;
      }

      setIsLoadingManualPayload(true);
      const payload = await loadTelemetryExports(files);
      setActivePayload(payload);
      payloadRef.current = payload;
      await beginProcessing(payload);
    } catch (error) {
      if (error instanceof Error) {
        setManualLoadError(error.message);
      } else if (error !== null) {
        setManualLoadError(String(error));
      }
    } finally {
      setIsLoadingManualPayload(false);
    }
  }, [beginProcessing, loadTelemetryExports]);

  useEffect(() => {
    const handleProgress = (event: ProcessingProgressEvent) => {
      setIsRunning(true);
      setOverallProgress(event.overall_progress);
      setEtaSeconds(Number.isFinite(event.eta_seconds) ? event.eta_seconds : null);
      setPhases((prev) =>
        prev.map((phase, index) => {
          if (index < event.phase_index) {
            return { ...phase, status: "completed", progress: 100 };
          }
          if (index === event.phase_index) {
            return {
              ...phase,
              status: "in-progress",
              progress: event.phase_progress,
            };
          }
          return { ...phase, status: "pending", progress: 0 };
        })
      );
    };

    const handleLog = (entry: ProcessingLogEvent) => {
      setLogEntries((prev) => [...prev.slice(-199), entry]);
    };

    const handleStarted = () => {
      setIsRunning(true);
      setIsCancelling(false);
    };

    const handleComplete = (event: ProcessingCompleteEvent) => {
      setIsRunning(false);
      setIsCancelling(false);
      setOverallProgress(100);
      setEtaSeconds(0);
      setPhases((prev) => prev.map((phase) => ({ ...phase, status: "completed", progress: 100 })));
      setProcessingError(null);
      const resultPayload: ProcessingResult = {
        alignment: null,
        request: payloadRef.current,
        output: event.result ?? null,
        error: null,
      };
      onComplete(resultPayload);
    };

    const handleError = (event: { message: string }) => {
      setIsRunning(false);
      setIsCancelling(false);
      setProcessingError(event.message || "Processing run encountered an error.");
    };

    const handleCancelled = () => {
      setIsRunning(false);
      setIsCancelling(false);
      onCancel();
    };

    processingService.on("progress", handleProgress);
    processingService.on("log", handleLog);
    processingService.on("started", handleStarted);
    processingService.on("complete", handleComplete);
    processingService.on("error", handleError);
    processingService.on("cancelled", handleCancelled);

    void beginProcessing();

    return () => {
      processingService.off("progress", handleProgress);
      processingService.off("log", handleLog);
      processingService.off("started", handleStarted);
      processingService.off("complete", handleComplete);
      processingService.off("error", handleError);
      processingService.off("cancelled", handleCancelled);
      void processingService.dispose();
    };
  }, [beginProcessing, onCancel, onComplete, processingService]);

  useEffect(() => {
    if (logListRef.current) {
      logListRef.current.scrollTop = logListRef.current.scrollHeight;
    }
  }, [logEntries]);

  const handleCancel = useCallback(async () => {
    if (!processingService.isRunning) {
      onCancel();
      return;
    }

    setIsCancelling(true);
    try {
      await processingService.cancel();
    } catch (error) {
      setProcessingError(`Failed to cancel: ${String(error)}`);
      setIsCancelling(false);
    }
  }, [onCancel, processingService]);

  const handleRetry = useCallback(async () => {
    setIsRestarting(true);
    try {
      await beginProcessing();
    } finally {
      setIsRestarting(false);
    }
  }, [beginProcessing]);

  const activePhase = phases.find((phase) => phase.status === "in-progress");
  const overallProgressClamped = Math.max(0, Math.min(100, overallProgress));
  const overallProgressDisplay = Math.round(overallProgressClamped);
  const headerSubtitle = processingError
    ? "Processing run encountered an error. Review the log and retry."
    : activePhase
      ? `Currently running: ${activePhase.title}`
      : isRunning
        ? "Finalising processing run..."
        : "Preparing processing pipeline...";
  const statusText = processingError
    ? "Error"
    : isCancelling
      ? "Cancelling..."
      : isRunning
        ? "Running"
        : "Idle";
  const statusAccentClass = processingError
    ? "text-[#F44336]"
    : isCancelling
      ? "text-[#FFC107]"
      : isRunning
        ? "text-[#4CAF50]"
        : "text-white/60";
  const cancelButtonLabel = processingError
    ? "Return to Setup"
    : isCancelling
      ? "Cancelling..."
      : isRunning
        ? "Cancel Processing"
        : "Close";
  const isCancelDisabled = isCancelling || isRestarting;
  const retryButtonLabel = isRestarting ? "Restarting..." : "Retry Processing";

  return (
    <div className="flex h-screen w-full">
      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <div className="flex h-full w-full p-6 lg:p-8">
          <div className="flex w-full flex-col gap-6">
            {/* PageHeading */}
            <header>
              <p className="text-3xl font-bold leading-tight tracking-tight text-white">
                Track Generation in Progress
              </p>
              <p className="text-[#9ac1a0] text-base font-normal leading-normal">
                Processing telemetry and generating a 3D track model.
              </p>
              <p className="text-[#9ac1a0] text-sm font-normal leading-normal">{headerSubtitle}</p>
            </header>

            {!activePayload && (
              <div className="rounded-lg border border-dashed border-white/20 bg-[#1a281c]/60 p-4 text-sm text-[#9ac1a0]">
                <p className="font-medium text-white">No telemetry exports detected.</p>
                <p className="mt-1 leading-relaxed">
                  Select the three exported JSON files (outside, inside, racing) to process an existing recording without
                  rerunning the capture flow.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    className="rounded-lg border border-white/20 bg-transparent px-4 py-2 font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleLoadManualPayload}
                    type="button"
                    disabled={isLoadingManualPayload}
                  >
                    {isLoadingManualPayload ? "Loading exports..." : "Select telemetry exports"}
                  </button>
                  {manualLoadError && <span className="text-xs text-[#ff8a80]">{manualLoadError}</span>}
                </div>
              </div>
            )}

            {processingError && (
              <div className="rounded-lg border border-[#F44336]/40 bg-[#2b1a1a] p-4 text-sm text-[#ffcdd2]">
                <p className="font-semibold text-[#ff8a80]">Processing Error</p>
                <p className="mt-1 leading-relaxed">{processingError}</p>
                <p className="mt-2 text-xs text-[#ffab91]">Review the log for details or retry the run.</p>
              </div>
            )}

            <div className="grid flex-1 grid-cols-3 gap-6">
              {/* Processing Pipeline (2/3 width) */}
              <div className="col-span-3 lg:col-span-2 flex flex-col gap-4 rounded-xl bg-[#1a281c] p-6">
                <h2 className="text-lg font-semibold text-white">Processing Pipeline</h2>
                <div className="flex flex-col divide-y divide-white/10">
                  {phases.map((phase) => (
                    <ProcessingPhaseItem
                      key={phase.title}
                      title={phase.title}
                      description={phase.description}
                      status={phase.status}
                      progress={Math.round(phase.progress)}
                    />
                  ))}
                </div>
              </div>

              {/* Alignment Quality Sidebar (1/3 width) */}
              <aside className="col-span-3 lg:col-span-1 flex flex-col gap-4 rounded-xl bg-[#1a281c] p-6">
                <h2 className="text-lg font-semibold text-white">Run Status</h2>
                <div className="flex flex-col gap-4 rounded-lg bg-background-dark p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#9ac1a0]">Overall Progress</p>
                    <p className="text-sm font-semibold text-white">{overallProgressDisplay}%</p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#4CAF50] transition-all"
                      style={{ width: `${overallProgressClamped}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined ${statusAccentClass}`}>play_circle</span>
                    <div className="flex flex-col">
                      <p className="text-[#9ac1a0] text-sm">Status</p>
                      <p className="text-sm font-medium text-white">{statusText}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#9ac1a0]">playlist_add_check</span>
                    <div className="flex flex-col">
                      <p className="text-[#9ac1a0] text-sm">Active Phase</p>
                      <p className="text-sm font-medium text-white">{activePhase ? activePhase.title : "None"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#9ac1a0]">schedule</span>
                    <div className="flex flex-col">
                      <p className="text-[#9ac1a0] text-sm">ETA</p>
                      <p className="text-sm font-medium text-white">{formatEta(etaSeconds)}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Bottom Bar */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 lg:col-span-2 flex flex-col rounded-xl bg-[#1a281c]">
                <div className="border-b border-white/10 p-4">
                  <h3 className="font-semibold text-white">Processing Log</h3>
                </div>
                <div
                  ref={logListRef}
                  className="flex-1 overflow-y-auto p-4 font-mono text-xs text-[#9ac1a0] space-y-2"
                >
                  {logEntries.length === 0 ? (
                    <p className="text-white/40">Awaiting log output...</p>
                  ) : (
                    logEntries.map((entry, index) => {
                      const levelClass =
                        entry.level === "WARN"
                          ? "text-[#FFC107]"
                          : entry.level === "ERROR"
                            ? "text-[#F44336]"
                            : "text-white/50";
                      return (
                        <p key={`${entry.timestamp}-${index}`}>
                          <span className={levelClass}>
                            [{formatLogTimestamp(entry.timestamp)}] {entry.level}:
                          </span>{" "}
                          {entry.message}
                        </p>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="col-span-3 lg:col-span-1 flex flex-col gap-4">
                <div className="flex flex-col gap-2 rounded-xl bg-[#1a281c] p-4">
                  <p className="text-sm text-[#9ac1a0]">Estimated Time Remaining</p>
                  <p className="text-3xl font-bold text-white">{formatEta(etaSeconds)}</p>
                  <p className="text-xs text-[#9ac1a0]">Overall progress {overallProgressDisplay}%.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="w-full rounded-lg border-2 border-[#F44336]/50 bg-[#F44336]/20 py-3 font-semibold text-[#F44336] transition-colors hover:bg-[#F44336]/30 hover:border-[#F44336] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleCancel}
                    type="button"
                    disabled={isCancelDisabled}
                  >
                    {cancelButtonLabel}
                  </button>
                  {processingError ? (
                    <button
                      className="w-full rounded-lg border-2 border-[#2196F3]/40 bg-[#2196F3]/20 py-3 font-semibold text-[#2196F3] transition-colors hover:bg-[#2196F3]/30 hover:border-[#2196F3] disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleRetry}
                      type="button"
                      disabled={isRestarting}
                    >
                      {retryButtonLabel}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
