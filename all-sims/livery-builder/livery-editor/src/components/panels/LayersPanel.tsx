import type { Layer } from '../../types';

/**
 * Bottom layers panel showing layer stack
 * Extracted from Stitch main_editor design
 */
export interface LayersPanelProps {
    layers: Layer[];
    selectedLayerIds: string[];
    onSelectLayer: (ids: string[]) => void;
}

export function LayersPanel({ layers, selectedLayerIds, onSelectLayer }: LayersPanelProps) {
    return (
        <div className="h-[200px] bg-background-base border-t border-border-default flex-shrink-0 flex flex-col">
            {/* Header */}
            <div className="px-4 py-2 border-b border-border-default flex items-center justify-between">
                <h2 className="text-14 font-medium text-text-primary">Layers</h2>
                <div className="flex gap-1">
                    <button className="px-2 py-1 text-12 text-text-secondary hover:text-text-primary" title="New Layer">
                        +
                    </button>
                    <button className="px-2 py-1 text-12 text-text-secondary hover:text-text-primary" title="Delete Layer">
                        −
                    </button>
                </div>
            </div>

            {/* Layer List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {layers.length === 0 ? (
                    <div className="p-4 text-center text-text-secondary text-12">
                        No layers yet
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {[...layers].reverse().map((layer) => {
                            const isSelected = selectedLayerIds.includes(layer.id);

                            return (
                                <button
                                    key={layer.id}
                                    onClick={() => onSelectLayer([layer.id])}
                                    className={`
                    w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors
                    ${isSelected
                                            ? 'bg-accent-blue/20 border border-accent-blue'
                                            : 'hover:bg-background-surface border border-transparent'
                                        }
                  `}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-10 h-10 bg-background-surface border border-border-default rounded flex items-center justify-center text-20 flex-shrink-0">
                                        {layer.thumbnail ? (
                                            <img src={layer.thumbnail} alt={layer.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span>□</span>
                                        )}
                                    </div>

                                    {/* Layer Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-14 text-text-primary truncate">{layer.name}</p>
                                        <p className="text-12 text-text-secondary">{layer.type}</p>
                                    </div>

                                    {/* Visibility */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // TODO: Toggle visibility
                                        }}
                                        className="text-16 text-text-secondary hover:text-text-primary"
                                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                                    >
                                        {layer.visible ? '👁' : '👁‍🗨'}
                                    </button>

                                    {/* Lock */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // TODO: Toggle lock
                                        }}
                                        className="text-16 text-text-secondary hover:text-text-primary"
                                        title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                                    >
                                        {layer.locked ? '🔒' : '🔓'}
                                    </button>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
