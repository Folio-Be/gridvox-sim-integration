import type { SelectionGroup } from '../../types';

interface SelectionGroupPanelProps {
  groups: SelectionGroup[];
  onSelectGroup?: (layerIds: string[]) => void;
}

export function SelectionGroupPanel({ groups, onSelectGroup }: SelectionGroupPanelProps) {
  return (
    <div className="border-t border-simvox-border-dark px-4 pb-4 pt-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Selection Groups</p>
        <button className="h-6 w-6 rounded-full bg-[#1d2430] text-sm text-text-primary">+</button>
      </div>
      <div className="space-y-2">
        {groups.map((group, idx) => (
          <button
            key={group.id}
            onClick={() => onSelectGroup?.(group.layerIds)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              idx === 0 ? 'border-transparent bg-[#22d2ee] text-[#05131a]' : 'border-[#1f2c3d] bg-[#111827] text-text-primary hover:border-[#27405f]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="h-8 w-1 rounded-full" style={{ backgroundColor: group.color }}></span>
              <div className="leading-tight">
                <p className="text-sm font-medium">{group.name}</p>
                <p className="text-[11px] uppercase tracking-wide text-current opacity-70">
                  {group.layerIds.length} Layers
                </p>
              </div>
            </div>
            <span className="text-xs opacity-70">›</span>
          </button>
        ))}
        {groups.length === 0 && <p className="text-12 text-text-secondary">No groups yet</p>}
      </div>
    </div>
  );
}
