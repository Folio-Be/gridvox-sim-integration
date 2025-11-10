interface StatusIndicatorProps {
  status: "recording" | "connected" | "disconnected";
  label: string;
}

export default function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const colors = {
    recording: "bg-red-500 pulse-red",
    connected: "bg-green-500",
    disconnected: "bg-gray-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`size-3 rounded-full ${colors[status]}`}></div>
      <span className="text-white text-sm font-bold leading-normal tracking-[0.015em]">{label}</span>
    </div>
  );
}
