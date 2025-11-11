import { useMemo, useState } from "react";
import LayerToggle from "../ui/LayerToggle";
import ValidationItem from "../ui/ValidationItem";
import TrackViewer3D, { LayerVisibility } from "../TrackViewer3D";
import { ProcessingResult, TrackGenerationSummary } from "../../lib/processing-types";

interface PreviewScreenProps {
  result: ProcessingResult | null;
  onExport: (summary: TrackGenerationSummary | null) => void;
  onReprocess: () => void;
}

const DEFAULT_LAYERS: LayerVisibility = {
  racingLine: true,
  centerline: true,
  edges: false,
  sectors: false,
  startFinish: false,
  apex: false,
};

export default function PreviewScreen({ result, onExport, onReprocess }: PreviewScreenProps) {
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);

  const [activeTab, setActiveTab] = useState<"statistics" | "validation">("validation");

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers({ ...layers, [layer]: !layers[layer] });
  };

  const summary = result?.output ?? null;
  const exportedFiles = result?.request?.exportedFiles ?? [];
  const glbPath = summary?.glbPath ?? null;
  const metadataPath = summary?.metadataPath ?? null;
  const trackInfo = summary?.track ?? null;
  const alignment = summary?.alignment ?? null;

  const alignmentStatus = useMemo<{
    scoreLabel: string;
    scoreStatus: "success" | "warning" | "error";
    confidenceLabel: string;
    confidenceStatus: "success" | "warning" | "error";
  }>(() => {
    if (!alignment) {
      return { scoreLabel: "--", scoreStatus: "warning" as const, confidenceLabel: "--", confidenceStatus: "warning" as const };
    }

    const alignmentScore = alignment.alignmentScore ?? 0;
    const confidence = alignment.confidence ?? 0;
    const scoreStatus = alignmentScore >= 0.85 ? "success" : alignmentScore >= 0.7 ? "warning" : "error";
    const confidenceStatus = confidence >= 0.8 ? "success" : confidence >= 0.6 ? "warning" : "error";

    return {
      scoreLabel: `${(alignmentScore * 100).toFixed(1)}%`,
      scoreStatus,
      confidenceLabel: `${(confidence * 100).toFixed(1)}%`,
      confidenceStatus,
    };
  }, [alignment]);

  return (
    <div className="flex h-screen w-full flex-row">
      {/* Left Sidebar */}
      <aside className="flex w-[280px] flex-col border-r border-white/10 bg-[#1A1A1A]">
        <div className="flex h-full flex-col p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-2">
              <span className="material-symbols-outlined text-primary">layers</span>
              <div className="flex flex-col">
                <h1 className="text-base font-medium leading-normal text-white">Layers</h1>
                <p className="text-sm font-normal leading-normal text-gray-400">Toggle visibility</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <LayerToggle label="Racing Line" checked={layers.racingLine} onChange={() => toggleLayer("racingLine")} />
              <LayerToggle label="Track Surface" checked={layers.centerline} onChange={() => toggleLayer("centerline")} />
              <LayerToggle label="Track Edges" checked={layers.edges} onChange={() => toggleLayer("edges")} />
              <LayerToggle label="Sector Markers" checked={layers.sectors} onChange={() => toggleLayer("sectors")} />
              <LayerToggle label="Start/Finish Line" checked={layers.startFinish} onChange={() => toggleLayer("startFinish")} />
              <LayerToggle label="Apex Points" checked={layers.apex} onChange={() => toggleLayer("apex")} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <div className="relative flex flex-1 flex-col bg-gradient-to-b from-[#1A1A1A] to-black">
          <TrackViewer3D glbPath={glbPath} layers={layers} className="relative h-full w-full" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-gray-300">
            <p className="text-base font-normal leading-normal">Left click: orbit · Right click: pan · Scroll: zoom</p>
            {trackInfo && (
              <p className="text-xs text-gray-400">
                {trackInfo.location}
                {trackInfo.variation ? ` · ${trackInfo.variation}` : ""}
                {` · ${(trackInfo.length / 1000).toFixed(2)} km`}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="flex h-[240px] flex-col border-t border-white/10 bg-[#1A1A1A]">
          <div className="flex flex-1">
            <div className="flex w-full">
              <div className="flex flex-1 flex-col px-4 py-3">
                {/* Tab Toggle */}
                <div className="flex h-10 w-full items-center justify-center rounded-lg bg-[#2d2d2d] p-1">
                  <label
                    className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${activeTab === "statistics" ? "bg-[#1A1A1A] text-white" : "text-gray-300"
                      }`}
                    onClick={() => setActiveTab("statistics")}
                  >
                    <span className="truncate">Track Statistics</span>
                  </label>
                  <label
                    className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${activeTab === "validation" ? "bg-[#1A1A1A] text-white" : "text-gray-300"
                      }`}
                    onClick={() => setActiveTab("validation")}
                  >
                    <span className="truncate">Validation Results</span>
                  </label>
                </div>

                {/* Validation Results */}
                {activeTab === "statistics" ? (
                  <div className="grid flex-1 grid-cols-4 p-4">
                    <ValidationItem
                      label="Alignment Score"
                      status={alignmentStatus.scoreStatus}
                      statusLabel={alignmentStatus.scoreLabel}
                    />
                    <ValidationItem
                      label="Confidence"
                      status={alignmentStatus.confidenceStatus}
                      statusLabel={alignmentStatus.confidenceLabel}
                    />
                    <ValidationItem
                      label="Max Start Delta"
                      status={alignment && alignment.maxStartPositionDelta < 5 ? "success" : "warning"}
                      statusLabel={alignment ? `${alignment.maxStartPositionDelta.toFixed(2)} m` : "--"}
                    />
                    <ValidationItem
                      label="Resample Count"
                      status="success"
                      statusLabel={alignment ? `${alignment.resampleCount}` : "--"}
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col gap-2 overflow-hidden p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Exported Runs</div>
                    <div className="flex-1 overflow-y-auto rounded border border-white/5 bg-black/30 p-3 text-xs text-gray-300">
                      {exportedFiles.length === 0 ? (
                        <p className="text-gray-500">No telemetry exports captured for this session.</p>
                      ) : (
                        <ul className="space-y-1">
                          {exportedFiles.map((file) => (
                            <li key={`${file.runType}-${file.filePath}`} className="flex flex-col gap-0.5">
                              <span className="text-gray-200 font-medium">{file.runType.toUpperCase()}</span>
                              <span className="truncate text-gray-400">{file.filePath}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {metadataPath && (
                      <div className="text-xs text-gray-400">
                        Metadata: <span className="text-gray-200">{metadataPath}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 px-4 py-3">
            <button
              className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#444444] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-[#555555]"
              onClick={onReprocess}
            >
              <span className="truncate">Re-process</span>
            </button>
            <button
              className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-base font-bold leading-normal tracking-[0.015em] text-black hover:bg-primary/90"
              onClick={() => onExport(summary)}
              disabled={!summary}
            >
              <span className="truncate">Export Track</span>
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .material-symbols-outlined.fill {
          font-variation-settings: 'FILL' 1;
        }
      `}</style>
    </div>
  );
}
