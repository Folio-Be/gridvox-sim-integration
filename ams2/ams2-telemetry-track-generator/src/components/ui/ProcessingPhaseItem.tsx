interface ProcessingPhaseItemProps {
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  progress?: number;
}

export default function ProcessingPhaseItem({ title, description, status, progress }: ProcessingPhaseItemProps) {
  const icons = {
    completed: "check_circle",
    "in-progress": "progress_activity",
    pending: "pause_circle",
  };

  const colors = {
    completed: "text-[#4CAF50] bg-[#4CAF50]/20",
    "in-progress": "text-[#2196F3] bg-[#2196F3]/20",
    pending: "text-[#FFC107] bg-[#FFC107]/20",
  };

  const statusLabels = {
    completed: "Completed",
    "in-progress": "",
    pending: "Pending",
  };

  const statusTextColors = {
    completed: "text-[#4CAF50]",
    "in-progress": "text-white",
    pending: "text-[#FFC107]",
  };

  return (
    <div className="flex gap-4 px-2 py-4 justify-between items-center">
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center justify-center rounded-lg shrink-0 size-12 ${colors[status]} ${
            status === "in-progress" ? "animate-spin" : ""
          }`}
        >
          <span className="material-symbols-outlined">{icons[status]}</span>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-white text-base font-medium leading-normal">{title}</p>
          <p className="text-[#9ac1a0] text-sm font-normal leading-normal">{description}</p>
        </div>
      </div>
      <div className="shrink-0">
        {status === "in-progress" && typeof progress === "number" ? (
          <div className="flex items-center gap-3">
            <div className="w-24 overflow-hidden rounded-full bg-white/10 h-2">
              <div className="h-full rounded-full bg-[#2196F3]" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-white text-sm font-medium leading-normal">{progress}%</p>
          </div>
        ) : (
          <div className={`text-sm font-medium leading-normal ${statusTextColors[status]}`}>
            {statusLabels[status]}
          </div>
        )}
      </div>
    </div>
  );
}
