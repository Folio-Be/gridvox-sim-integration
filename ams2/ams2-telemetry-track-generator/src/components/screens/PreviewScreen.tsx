import { useState } from "react";
import LayerToggle from "../ui/LayerToggle";
import ValidationItem from "../ui/ValidationItem";
import Button from "../ui/Button";

interface PreviewScreenProps {
  onExport: () => void;
  onReprocess: () => void;
}

export default function PreviewScreen({ onExport, onReprocess }: PreviewScreenProps) {
  const [layers, setLayers] = useState({
    racingLine: false,
    centerline: true,
    edges: false,
    sectors: true,
    startFinish: false,
    apex: false,
  });

  const [activeTab, setActiveTab] = useState<"statistics" | "validation">("validation");

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers({ ...layers, [layer]: !layers[layer] });
  };

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
              <LayerToggle label="Track Centerline" checked={layers.centerline} onChange={() => toggleLayer("centerline")} />
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
          {/* TODO: Replace with Three.js WebGL canvas */}
          <div className="flex h-full w-full items-center justify-center">
            <img
              alt="3D visualization of a race track with a glowing green racing line on a dark background"
              className="h-auto w-full max-w-4xl object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPMvbK5mMhsucNidM-OFmHY6J0OhuYjkA77V2F5gzBzwGmqLuBk-NYBxEb3cYKuHbc4u8QPqhwCOdTnRMDlId_tbeyKcs8RiMG73kNSZ0f7d_zijbro_3wtRhnjHv8cyiwr8r6R_U4RrHxTLK2tK84HOfM5IZOxrX0cUHQns6vqobEVaxo1UuRAdlnjSzQjk3Jm2kCUegXijHk0v7_Xw1vOG6XCb99WzuAVK5Dx1BQ-qQ3i13VnU_NCvVeOWzpnEa92WH_ik30j0o"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2">
            <p className="text-base font-normal leading-normal text-gray-300">Right-click to pan, Scroll to zoom</p>
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
                    className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${
                      activeTab === "statistics" ? "bg-[#1A1A1A] text-white" : "text-gray-300"
                    }`}
                    onClick={() => setActiveTab("statistics")}
                  >
                    <span className="truncate">Track Statistics</span>
                  </label>
                  <label
                    className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${
                      activeTab === "validation" ? "bg-[#1A1A1A] text-white" : "text-gray-300"
                    }`}
                    onClick={() => setActiveTab("validation")}
                  >
                    <span className="truncate">Validation Results</span>
                  </label>
                </div>

                {/* Validation Results */}
                <div className="grid flex-1 grid-cols-4 p-4">
                  <ValidationItem label="Data Integrity" status="success" statusLabel="Success" />
                  <ValidationItem label="Track Smoothness" status="success" statusLabel="Success" />
                  <ValidationItem label="Closed Loop" status="success" statusLabel="Success" />
                  <ValidationItem label="Telemetry Gaps" status="warning" statusLabel="Warning" />
                </div>
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
              onClick={onExport}
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
