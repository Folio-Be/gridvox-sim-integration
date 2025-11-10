import { useState, useEffect } from "react";
import ProcessingPhaseItem from "../ui/ProcessingPhaseItem";

interface ProcessingScreenProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function ProcessingScreen({ onComplete, onCancel }: ProcessingScreenProps) {
  const [progress, setProgress] = useState(75);
  const [logEntries] = useState([
    { level: "INFO", timestamp: "14:32:01", message: "Found 5 valid laps." },
    { level: "INFO", timestamp: "14:32:02", message: "Ingesting telemetry data from silverstone_lap3.csv" },
    { level: "INFO", timestamp: "14:32:05", message: "Data ingestion complete. 1.2M data points processed." },
    { level: "INFO", timestamp: "14:32:06", message: "Starting GPS coordinate alignment..." },
    { level: "WARN", timestamp: "14:32:15", message: "High G-force spike detected at T3." },
    { level: "INFO", timestamp: "14:32:20", message: "Generating 3D point cloud, 50% complete..." },
  ]);

  // TODO: Replace with real processing status
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full">
      {/* SideNavBar */}
      <aside className="flex w-64 flex-col justify-between border-r border-white/10 bg-background-dark p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBUaZNg7l3dMXy_8sLkbG9l6VMpWYeuTIjTnfVandQuPfP83Hk4bTSQVCUdqqnDV7u2msf8MvXRW9OV1_6J0pqQfXlf6vvaK8VFEsA_q-WVSsGtfNAQ6NfHU2m_x-4AkSwCWtjGu7WOv5mSRrfCu5UicWqy62DApcg7mDua2_rGWxbkT94Q1YaWOi0Ns0ioJkd1-cLmeFTf2sMeOsxLbxoV17tQxagYdFeHzVzdR0iqQptBJegbAdySRPEvwpSM8TVxDUA1-cfBF8c")',
              }}
            ></div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-medium leading-normal">SimTelemetry</h1>
              <p className="text-[#9ac1a0] text-sm font-normal leading-normal">Pro Version</p>
            </div>
          </div>
          <nav className="mt-4 flex flex-col gap-2">
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-[#1a281c] transition-colors">
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white bg-primary/20">
              <span className="material-symbols-outlined">radio_button_checked</span>
              <p className="text-sm font-medium leading-normal">Record</p>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-[#1a281c] transition-colors">
              <span className="material-symbols-outlined">folder</span>
              <p className="text-sm font-medium leading-normal">Projects</p>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-[#1a281c] transition-colors">
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium leading-normal">Settings</p>
            </a>
          </nav>
        </div>
        <div className="flex flex-col gap-1">
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-[#1a281c] transition-colors">
            <span className="material-symbols-outlined">help</span>
            <p className="text-sm font-medium leading-normal">Help</p>
          </a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-[#1a281c] transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium leading-normal">Logout</p>
          </a>
        </div>
      </aside>

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
                Processing telemetry and generating 3D track model
              </p>
            </header>

            <div className="grid flex-1 grid-cols-3 gap-6">
              {/* Processing Pipeline (2/3 width) */}
              <div className="col-span-3 lg:col-span-2 flex flex-col gap-4 rounded-xl bg-[#1a281c] p-6">
                <h2 className="text-lg font-semibold text-white">Processing Pipeline</h2>
                <div className="flex flex-col divide-y divide-white/10">
                  <ProcessingPhaseItem
                    title="Phase 1: Data Ingestion"
                    description="Loading telemetry file, Parsing G-force data"
                    status="completed"
                  />
                  <ProcessingPhaseItem
                    title="Phase 2: Point Cloud Generation"
                    description="Aligning GPS coordinates, Generating 3D points"
                    status="in-progress"
                    progress={progress}
                  />
                  <ProcessingPhaseItem
                    title="Phase 3: Model Finalization"
                    description="Meshing track surface, Applying textures"
                    status="pending"
                  />
                </div>
              </div>

              {/* Alignment Quality Sidebar (1/3 width) */}
              <aside className="col-span-3 lg:col-span-1 flex flex-col gap-4 rounded-xl bg-[#1a281c] p-6">
                <h2 className="text-lg font-semibold text-white">Alignment Quality</h2>
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-background-dark p-6">
                  <div className="relative flex size-32 items-center justify-center">
                    <svg className="absolute inset-0 size-full -rotate-90 transform" viewBox="0 0 36 36">
                      <circle
                        className="stroke-current text-white/10"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeWidth="2"
                      ></circle>
                      <circle
                        className="stroke-current text-[#4CAF50]"
                        cx="18"
                        cy="18"
                        fill="none"
                        r="16"
                        strokeDasharray="100, 100"
                        strokeDashoffset="2"
                        strokeLinecap="round"
                        strokeWidth="2"
                      ></circle>
                    </svg>
                    <span className="text-3xl font-bold text-[#4CAF50]">98%</span>
                  </div>
                  <p className="text-white font-medium">Confidence Score</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#4CAF50]">check_circle</span>
                    <p className="text-[#9ac1a0] text-sm">Data Consistency</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#4CAF50]">check_circle</span>
                    <p className="text-[#9ac1a0] text-sm">Lap Cohesion</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#4CAF50]">check_circle</span>
                    <p className="text-[#9ac1a0] text-sm">Elevation Variance</p>
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
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-[#9ac1a0]">
                  {logEntries.map((entry, index) => (
                    <p key={index}>
                      <span
                        className={entry.level === "WARN" ? "text-[#FFC107]" : "text-white/50"}
                      >
                        [{entry.timestamp}] {entry.level}:
                      </span>{" "}
                      {entry.message}
                    </p>
                  ))}
                </div>
              </div>
              <div className="col-span-3 lg:col-span-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2 rounded-xl bg-[#1a281c] p-4">
                  <p className="text-sm text-[#9ac1a0]">Estimated Time Remaining</p>
                  <p className="text-3xl font-bold text-white">2m 15s</p>
                </div>
                <button
                  className="w-full rounded-lg border-2 border-[#F44336]/50 bg-[#F44336]/20 py-3 font-semibold text-[#F44336] transition-colors hover:bg-[#F44336]/30 hover:border-[#F44336]"
                  onClick={onCancel}
                >
                  Cancel Processing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
