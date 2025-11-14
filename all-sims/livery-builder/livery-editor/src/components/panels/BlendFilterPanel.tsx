interface BlendFilterPanelProps {
  opacity: number;
  blendMode: string;
  onChangeOpacity: (value: number) => void;
  onChangeBlendMode: (mode: string) => void;
}

const blendModes = ['normal', 'multiply', 'screen', 'overlay', 'soft-light'];

export function BlendFilterPanel({
  opacity,
  blendMode,
  onChangeOpacity,
  onChangeBlendMode,
}: BlendFilterPanelProps) {
  return (
    <section className="rounded-2xl border border-[#1f2c3d] bg-[#0f1622] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
          Blending & Filters
        </h3>
        <button className="text-xs text-text-secondary hover:text-white">Reset</button>
      </div>
      <label className="mb-4 flex flex-col gap-2 text-xs text-text-secondary">
        Opacity
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => onChangeOpacity(Number(e.target.value))}
            className="flex-1 accent-[#22d2ee]"
          />
          <span className="w-10 text-right text-sm text-text-primary">{opacity}%</span>
        </div>
      </label>
      <label className="flex flex-col gap-2 text-xs text-text-secondary">
        Blend Mode
        <select
          value={blendMode}
          onChange={(e) => onChangeBlendMode(e.target.value)}
          className="rounded-xl border border-[#1f2c3d] bg-[#141b2a] px-3 py-2 text-sm text-text-primary"
        >
          {blendModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>
      <button className="mt-4 h-10 w-full rounded-xl bg-[#1d2430] text-sm font-semibold text-text-primary transition hover:bg-[#2486ff] hover:text-white">
        Add Filter
      </button>
    </section>
  );
}
