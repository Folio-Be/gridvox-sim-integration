interface ValidationItemProps {
  label: string;
  status: "success" | "warning" | "error";
  statusLabel: string;
}

export default function ValidationItem({ label, status, statusLabel }: ValidationItemProps) {
  const icons = {
    success: "check_circle",
    warning: "warning",
    error: "cancel",
  };

  const colors = {
    success: "text-primary",
    warning: "text-[#FFBF00]",
    error: "text-[#FF3131]",
  };

  return (
    <div className="flex flex-col gap-1 border-r border-solid border-white/10 py-2 px-4 last:border-r-0 last:pr-0 first:pl-0">
      <p className="text-sm font-normal leading-normal text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined fill text-sm ${colors[status]}`}>{icons[status]}</span>
        <p className={`text-sm font-normal leading-normal ${colors[status]}`}>{statusLabel}</p>
      </div>
    </div>
  );
}
