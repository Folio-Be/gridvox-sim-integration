interface ProgressBarProps {
  label: string;
  value: number;
  subtitle?: string;
  compact?: boolean;
}

export default function ProgressBar({ label, value, subtitle, compact = false }: ProgressBarProps) {
  const containerClasses = compact ? "flex flex-col gap-2 p-3" : "flex flex-col gap-3 p-4";
  const labelClasses = compact ? "text-white/80 text-xs font-medium" : "text-white text-base font-medium leading-normal";
  const valueClasses = compact ? "text-white/70 text-xs font-semibold" : "text-white text-sm font-normal leading-normal";
  const subtitleClasses = compact ? "text-[#9ac1a0] text-[11px]" : "text-[#9ac1a0] text-sm font-normal leading-normal";
  const barHeight = compact ? "h-1.5" : "h-2";

  return (
    <div className={containerClasses}>
      {label && (
        <div className="flex gap-6 justify-between">
          <p className={labelClasses}>{label}</p>
          <p className={valueClasses}>{value}%</p>
        </div>
      )}
      <div className="rounded bg-green-border/80">
        <div className={`${barHeight} rounded bg-primary`} style={{ width: `${value}%` }}></div>
      </div>
      {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
    </div>
  );
}
