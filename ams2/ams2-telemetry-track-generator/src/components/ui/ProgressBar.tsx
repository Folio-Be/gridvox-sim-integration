interface ProgressBarProps {
  label: string;
  value: number;
  subtitle?: string;
}

export default function ProgressBar({ label, value, subtitle }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {label && (
        <div className="flex gap-6 justify-between">
          <p className="text-white text-base font-medium leading-normal">{label}</p>
          <p className="text-white text-sm font-normal leading-normal">{value}%</p>
        </div>
      )}
      <div className="rounded bg-green-border">
        <div className="h-2 rounded bg-primary" style={{ width: `${value}%` }}></div>
      </div>
      {subtitle && <p className="text-[#9ac1a0] text-sm font-normal leading-normal">{subtitle}</p>}
    </div>
  );
}
