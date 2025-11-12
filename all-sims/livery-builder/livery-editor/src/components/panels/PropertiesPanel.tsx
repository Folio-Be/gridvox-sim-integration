import type { Layer, ToolState } from '../../types';

/**
 * Right properties panel showing layer/tool properties
 * Extracted from Stitch main_editor design
 */
export interface PropertiesPanelProps {
    selectedLayers: Layer[];
    toolState: ToolState;
    onToolStateChange: (state: ToolState) => void;
}

export function PropertiesPanel({ selectedLayers, toolState, onToolStateChange }: PropertiesPanelProps) {
    const hasSelection = selectedLayers.length > 0;

    return (
        <aside className="w-[300px] bg-background-base border-l border-border-default flex-shrink-0 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border-default">
                <h2 className="text-16 font-medium text-text-primary">Properties</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                {!hasSelection ? (
                    <div className="text-text-secondary text-14">
                        <p>No layer selected</p>
                        <p className="text-12 mt-2">Select a layer to edit its properties</p>
                    </div>
                ) : (
                    <>
                        {/* Layer Properties */}
                        <div className="space-y-3">
                            <h3 className="text-14 font-medium text-text-primary">Layer</h3>

                            {/* Opacity */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-12">
                                    <span className="text-text-secondary">Opacity</span>
                                    <span className="text-text-primary">{selectedLayers[0]?.opacity || 100}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={selectedLayers[0]?.opacity || 100}
                                    className="w-full"
                                    disabled
                                />
                            </div>

                            {/* Blend Mode */}
                            <div className="space-y-2">
                                <label className="text-12 text-text-secondary">Blend Mode</label>
                                <select className="w-full bg-background-surface border border-border-default rounded px-2 py-1 text-14 text-text-primary">
                                    <option>Normal</option>
                                    <option>Multiply</option>
                                    <option>Screen</option>
                                    <option>Overlay</option>
                                </select>
                            </div>
                        </div>

                        {/* Transform */}
                        <div className="space-y-3 pt-4 border-t border-border-default">
                            <h3 className="text-14 font-medium text-text-primary">Transform</h3>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-12 text-text-secondary">X</label>
                                    <input
                                        type="number"
                                        value={selectedLayers[0]?.x || 0}
                                        className="w-full bg-background-surface border border-border-default rounded px-2 py-1 text-14 text-text-primary"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="text-12 text-text-secondary">Y</label>
                                    <input
                                        type="number"
                                        value={selectedLayers[0]?.y || 0}
                                        className="w-full bg-background-surface border border-border-default rounded px-2 py-1 text-14 text-text-primary"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="text-12 text-text-secondary">Width</label>
                                    <input
                                        type="number"
                                        value={selectedLayers[0]?.width || 0}
                                        className="w-full bg-background-surface border border-border-default rounded px-2 py-1 text-14 text-text-primary"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="text-12 text-text-secondary">Height</label>
                                    <input
                                        type="number"
                                        value={selectedLayers[0]?.height || 0}
                                        className="w-full bg-background-surface border border-border-default rounded px-2 py-1 text-14 text-text-primary"
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Tool Properties (always visible) */}
                <div className="space-y-3 pt-4 border-t border-border-default">
                    <h3 className="text-14 font-medium text-text-primary">Tool: {toolState.activeTool}</h3>

                    {(toolState.activeTool === 'brush' || toolState.activeTool === 'pencil') && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-12">
                                <span className="text-text-secondary">Brush Size</span>
                                <span className="text-text-primary">{toolState.brushSize}px</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={toolState.brushSize}
                                onChange={(e) => onToolStateChange({ ...toolState, brushSize: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
