export type StatusIndicatorStatus =
  | "recording"
  | "paused"
  | "restarting"
  | "connected"
  | "disconnected"
  | "idle";

interface StatusIndicatorProps {
  status: StatusIndicatorStatus;
  label: string;
}

export default function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const colors: Record<StatusIndicatorStatus, string> = {
    recording: "bg-red-500 pulse-red",
    paused: "bg-yellow-400",
    restarting: "bg-blue-400 animate-pulse",
    connected: "bg-green-500",
    disconnected: "bg-gray-500",
    idle: "bg-purple-400",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`size-3 rounded-full ${colors[status] || colors.idle}`}></div>
      <span className="text-white text-sm font-bold leading-normal tracking-[0.015em]">{label}</span>
    </div>
  );
}
