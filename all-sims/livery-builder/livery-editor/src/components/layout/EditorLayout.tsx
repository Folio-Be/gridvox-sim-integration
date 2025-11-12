import type { LiveryProject, UIState } from '../../types';
import { TitleBar } from './TitleBar';
import { MenuBar } from './MenuBar';
import { TextureTabs } from './TextureTabs';
import { ToolbarPanel } from '../panels/ToolbarPanel';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { LayersPanel } from '../panels/LayersPanel';

export interface EditorLayoutProps {
    project: LiveryProject | null;
    uiState: UIState;
    onProjectChange: (project: LiveryProject) => void;
    onUIStateChange: (state: UIState) => void;
    onSave: () => void;
    onExport: (blob: Blob, filename: string) => void;
}

/**
 * Main editor layout with 3-panel structure:
 * - Left: Toolbar (64px fixed)
 * - Center: Canvas (flexible)
 * - Right: Properties Panel (300px fixed)
 * - Bottom: Layers Panel (200px fixed)
 */
export function EditorLayout({
    project,
    uiState,
    onProjectChange,
    onUIStateChange,
    onSave,
    onExport,
}: EditorLayoutProps) {
    const activeTexture = project?.textures.find(t => t.id === uiState.activeTextureId);

    return (
        <div className="flex flex-col h-full w-full bg-background-base">
            {/* Title Bar - Windows style */}
            <TitleBar filename={project?.name || 'Untitled'} />

            {/* Menu Bar */}
            <MenuBar onSave={onSave} onExport={() => { }} />

            {/* Texture Tabs */}
            {project && (
                <TextureTabs
                    textures={project.textures}
                    activeTextureId={uiState.activeTextureId}
                    onSelectTexture={(id) => onUIStateChange({ ...uiState, activeTextureId: id })}
                />
            )}

            {/* Main Content Area - 3 columns */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar */}
                {uiState.panels.toolbar && (
                    <ToolbarPanel
                        activeTool={uiState.toolState.activeTool}
                        onSelectTool={(tool) => onUIStateChange({
                            ...uiState,
                            toolState: { ...uiState.toolState, activeTool: tool }
                        })}
                    />
                )}

                {/* Center Canvas Area */}
                <div className="flex-1 flex flex-col bg-background-surface overflow-hidden">
                    {/* Canvas will go here */}
                    <div className="flex-1 flex items-center justify-center">
                        {!project && (
                            <div className="text-center text-text-secondary">
                                <p className="text-20 mb-4">No project loaded</p>
                                <p className="text-14">Import a PSD or create a new livery project</p>
                            </div>
                        )}
                        {project && !activeTexture && (
                            <div className="text-center text-text-secondary">
                                <p className="text-16">Select a texture from the tabs above</p>
                            </div>
                        )}
                        {activeTexture && (
                            <div className="text-center text-text-secondary">
                                <p className="text-14 mb-2">Canvas coming soon</p>
                                <p className="text-12">{activeTexture.name} - {activeTexture.width}x{activeTexture.height}</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Layers Panel */}
                    {uiState.panels.layers && activeTexture && (
                        <LayersPanel
                            layers={activeTexture.layers}
                            selectedLayerIds={uiState.selectedLayerIds}
                            onSelectLayer={(ids) => onUIStateChange({ ...uiState, selectedLayerIds: ids })}
                        />
                    )}
                </div>

                {/* Right Properties Panel */}
                {uiState.panels.properties && (
                    <PropertiesPanel
                        selectedLayers={activeTexture?.layers.filter(l => uiState.selectedLayerIds.includes(l.id)) || []}
                        toolState={uiState.toolState}
                        onToolStateChange={(toolState) => onUIStateChange({ ...uiState, toolState })}
                    />
                )}
            </div>
        </div>
    );
}
