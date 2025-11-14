import type { PreviewSnapshot } from '../../types';

interface PreviewPanelProps {
    previews: PreviewSnapshot[];
}

export function PreviewPanel({ previews }: PreviewPanelProps) {
    return (
        <section className="rounded-2xl border border-[#1f2c3d] bg-[#0f1622] p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                    Preview Box
                </h3>
                <button className="rounded-lg border border-[#1f2c3d] px-3 py-1 text-xs text-text-primary transition hover:bg-[#1d2430]">
                    Open 3D
                </button>
            </div>
            {previews.length === 0 ? (
                <p className="text-12 text-text-secondary">Preview will appear once the canvas updates.</p>
            ) : (
                previews.map((preview) => (
                    <div key={preview.id} className="overflow-hidden rounded-2xl border border-[#1f2c3d] bg-[#111827]">
                        <img src={preview.thumbnail} alt={preview.title} className="h-32 w-full object-cover" />
                        <div className="flex items-center justify-between px-4 py-3 text-xs text-text-secondary">
                            <div>
                                <p className="text-sm font-medium text-text-primary">{preview.title}</p>
                                <p className="text-[11px] uppercase tracking-wide text-text-secondary">
                                    {preview.textureName} · {preview.camera}
                                </p>
                            </div>
                            <span>{preview.description || ''}</span>
                        </div>
                    </div>
                ))
            )}
        </section>
    );
}
