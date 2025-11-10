interface TelemetryCardProps {
  label: string;
  value: string | number;
  compact?: boolean;
  valueClassName?: string;
}

export default function TelemetryCard({ label, value, compact = false, valueClassName }: TelemetryCardProps) {
  const containerClasses = compact
    ? "flex min-w-[120px] flex-1 flex-col gap-1.5 rounded-lg border border-green-border/80 bg-green-bg/40 p-3"
    : "flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-green-border";

  const labelClasses = compact
    ? "text-white/80 text-xs font-medium"
    : "text-white text-base font-medium leading-normal";

  const baseValueClasses = compact
    ? "text-white tracking-tight text-lg font-semibold leading-tight"
    : "text-white tracking-light text-2xl font-bold leading-tight";

  const combinedValueClasses = valueClassName
    ? `${baseValueClasses} ${valueClassName}`
    : baseValueClasses;

  return (
    <div className={containerClasses}>
      <p className={labelClasses}>{label}</p>
      <p className={combinedValueClasses}>{value}</p>
    </div>
  );
}
