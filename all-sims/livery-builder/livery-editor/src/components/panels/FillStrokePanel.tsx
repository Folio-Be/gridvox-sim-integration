interface FillStrokePanelProps {
  fillColor: string;
  strokeColor: string;
  onChangeFill: (color: string) => void;
  onChangeStroke: (color: string) => void;
}

export function FillStrokePanel({
  fillColor,
  strokeColor,
  onChangeFill,
  onChangeStroke,
}: FillStrokePanelProps) {
  return (
    <section className="rounded-2xl border border-[#1f2c3d] bg-[#0f1622] p-4 shadow-inner">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
        Fill & Stroke
      </h3>
      <div className="flex items-center gap-4">
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Fill
          <div className="flex items-center gap-3 rounded-xl border border-[#1f2c3d] bg-[#141b2a] px-3 py-2">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => onChangeFill(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-lg border border-[#26334a] bg-transparent"
            />
            <span className="text-sm font-semibold text-text-primary">{fillColor.toUpperCase()}</span>
          </div>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Stroke
          <div className="flex items-center gap-3 rounded-xl border border-[#1f2c3d] bg-[#141b2a] px-3 py-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => onChangeStroke(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-lg border border-[#26334a] bg-transparent"
            />
            <span className="text-sm font-semibold text-text-primary">
              {strokeColor ? strokeColor.toUpperCase() : 'No stroke'}
            </span>
          </div>
        </label>
      </div>
    </section>
  );
}
