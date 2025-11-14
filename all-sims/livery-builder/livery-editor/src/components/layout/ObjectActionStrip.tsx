interface ObjectActionStripProps {
  onAlign?: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute?: (type: 'horizontal' | 'vertical') => void;
  onGroup?: () => void;
  onUngroup?: () => void;
}

const alignments: { id: string; icon: string; title: string }[] = [
  { id: 'left', icon: '⇤', title: 'Align Left' },
  { id: 'center', icon: '⇆', title: 'Align Center' },
  { id: 'right', icon: '⇥', title: 'Align Right' },
  { id: 'top', icon: '⇞', title: 'Align Top' },
  { id: 'middle', icon: '⇳', title: 'Align Middle' },
  { id: 'bottom', icon: '⇟', title: 'Align Bottom' },
];

export function ObjectActionStrip({
  onAlign,
  onDistribute,
  onGroup,
  onUngroup,
}: ObjectActionStripProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {alignments.map((align) => (
          <button
            key={align.id}
            onClick={() => onAlign?.(align.id as any)}
            title={align.title}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f2c3d] bg-[#0f1622] text-sm text-simvox-text-med transition hover:border-[#2d3b52] hover:text-white"
          >
            {align.icon}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onDistribute?.('horizontal')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f2c3d] bg-[#0f1622] text-sm text-simvox-text-med transition hover:border-[#2d3b52] hover:text-white"
          title="Distribute Horizontal"
        >
          ⇔
        </button>
        <button
          onClick={() => onDistribute?.('vertical')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f2c3d] bg-[#0f1622] text-sm text-simvox-text-med transition hover:border-[#2d3b52] hover:text-white"
          title="Distribute Vertical"
        >
          ⇕
        </button>
      </div>
      <div className="w-px h-6 bg-[#1f2c3d]" />
      <button
        onClick={onGroup}
        className="h-9 rounded-lg border border-[#1f2c3d] bg-[#1b2433] px-3 text-xs font-semibold text-white transition hover:bg-[#2486ff]"
      >
        Group
      </button>
      <button
        onClick={onUngroup}
        className="h-9 rounded-lg border border-[#1f2c3d] bg-transparent px-3 text-xs font-semibold text-simvox-text-med transition hover:bg-[#141b28] hover:text-white"
      >
        Ungroup
      </button>
    </div>
  );
}
