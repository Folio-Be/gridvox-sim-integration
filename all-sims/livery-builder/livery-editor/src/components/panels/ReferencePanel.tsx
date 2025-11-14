import { useState } from 'react';
import type { ReferenceImage } from '../../types';

interface ReferencePanelProps {
    references: ReferenceImage[];
}

export function ReferencePanel({ references }: ReferencePanelProps) {
    const [activeId, setActiveId] = useState(references[0]?.id);
    const activeRef = references.find((ref) => ref.id === activeId);

    return (
        <section className="rounded-2xl border border-[#1f2c3d] bg-[#0f1622] p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                    Reference Box
                </h3>
                <button className="rounded-lg border border-[#1f2c3d] px-3 py-1 text-xs text-text-primary transition hover:bg-[#1d2430]">
                    Upload
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {references.map((ref) => (
                    <button
                        key={ref.id}
                        onClick={() => setActiveId(ref.id)}
                        className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                            activeId === ref.id
                                ? 'bg-[#22d2ee] text-[#041019]'
                                : 'bg-[#111a27] text-text-secondary hover:text-white'
                        }`}
                    >
                        {ref.name}
                    </button>
                ))}
            </div>
            {activeRef ? (
                <div className="overflow-hidden rounded-2xl border border-[#1f2c3d] bg-[#111827]">
                    <img src={activeRef.url} alt={activeRef.name} className="h-32 w-full object-cover" />
                    <div className="flex items-center justify-between px-4 py-2 text-xs text-text-secondary">
                        <span>{activeRef.name}</span>
                        <span>
                            {activeRef.width}×{activeRef.height}
                        </span>
                    </div>
                </div>
            ) : (
                <p className="text-12 text-text-secondary">Add reference photos to stay aligned.</p>
            )}
        </section>
    );
}
