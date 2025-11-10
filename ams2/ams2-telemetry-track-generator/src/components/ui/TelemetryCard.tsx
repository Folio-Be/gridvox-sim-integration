interface TelemetryCardProps {
  label: string;
  value: string | number;
}

export default function TelemetryCard({ label, value }: TelemetryCardProps) {
  return (
    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-green-border">
      <p className="text-white text-base font-medium leading-normal">{label}</p>
      <p className="text-white tracking-light text-2xl font-bold leading-tight">{value}</p>
    </div>
  );
}
