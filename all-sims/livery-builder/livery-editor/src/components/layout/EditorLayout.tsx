import type {
    LiveryProject,
    UIState,
    SelectionGroup,
    ReferenceImage,
    PreviewSnapshot,
} from '../../types';
import { ProjectHeader } from './ProjectHeader';
import { TextureTabs } from './TextureTabs';
import { ObjectToolbar } from './ObjectToolbar';
import { ObjectActionStrip } from './ObjectActionStrip';
import { ObjectTreePanel } from '../panels/ObjectTreePanel';
import { SelectionGroupPanel } from '../panels/SelectionGroupPanel';
import { FillStrokePanel } from '../panels/FillStrokePanel';
import { BlendFilterPanel } from '../panels/BlendFilterPanel';
import { ReferencePanel } from '../panels/ReferencePanel';
import { PreviewPanel } from '../panels/PreviewPanel';
import { CanvasViewport } from '../canvas/CanvasViewport';

export interface EditorLayoutProps {
    project: LiveryProject | null;
    uiState: UIState;
    onUIStateChange: (state: UIState) => void;
    onSave: () => void;
    onExport: (blob: Blob, filename: string) => void;
    selectionGroups: SelectionGroup[];
    referenceImages: ReferenceImage[];
    previewSnapshots: PreviewSnapshot[];
}

export function EditorLayout({
    project,
    uiState,
    onUIStateChange,
    onSave,
    onExport,
    selectionGroups,
    referenceImages,
    previewSnapshots,
}: EditorLayoutProps) {
    const activeTexture =
        project?.textures.find((t) => t.id === uiState.activeTextureId) ?? project?.textures[0];
    const projectThumbnail =
        activeTexture?.thumbnail ?? referenceImages[0]?.url ?? 'https://placehold.co/48x48/1c1f2b/ffffff?text=SV';

    return (
        <div className="flex flex-col h-full w-full bg-background-base">
            <ProjectHeader
                thumbnail={projectThumbnail}
                name={project?.name || 'Untitled Livery'}
                simulator={project?.simulator}
                car={project?.car}
                onSave={onSave}
                onExport={() => {
                    onExport(new Blob(), `${project?.name || 'livery'}.zip`);
                }}
                tabs={
                    project ? (
                        <TextureTabs
                            textures={project.textures}
                            activeTextureId={activeTexture?.id || uiState.activeTextureId}
                            onSelectTexture={(id) => onUIStateChange({ ...uiState, activeTextureId: id })}
                        />
                    ) : null
                }
            />

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-[280px] border-r border-border-default flex flex-col bg-[#0b1018]">
                    <ObjectTreePanel
                        tree={activeTexture?.layerTree}
                        selectedLayerIds={uiState.selectedLayerIds}
                        onSelectLayer={(ids) => onUIStateChange({ ...uiState, selectedLayerIds: ids })}
                    />
                    <SelectionGroupPanel
                        groups={selectionGroups}
                        onSelectGroup={(ids) => onUIStateChange({ ...uiState, selectedLayerIds: ids })}
                    />
                </aside>

                <div className="flex-1 flex flex-col bg-[#0f141d] overflow-hidden">
                    <div className="px-6 py-4">
                        <div className="rounded-2xl border border-[#1f2c3d] bg-[#111828]/80 p-4 shadow-lg backdrop-blur">
                            <ObjectToolbar
                                activeTool={uiState.toolState.activeTool}
                                onSelectTool={(tool) =>
                                    onUIStateChange({
                                        ...uiState,
                                        toolState: { ...uiState.toolState, activeTool: tool },
                                    })
                                }
                            />
                        </div>
                        <div className="mt-3 rounded-2xl border border-[#1f2c3d] bg-[#111828]/80 p-3 shadow-lg backdrop-blur">
                            <ObjectActionStrip />
                        </div>
                    </div>
                    <CanvasViewport texture={activeTexture} />
                    <div className="flex h-12 items-center justify-between border-t border-simvox-border-dark bg-[#090d13] px-6 text-xs text-text-secondary">
                        <span>{activeTexture?.name ?? 'No texture'}</span>
                        <span>
                            {activeTexture ? `${activeTexture.width}×${activeTexture.height}px` : ''}
                        </span>
                        <span className="uppercase tracking-wide">Tool: {uiState.toolState.activeTool}</span>
                    </div>
                </div>

                <aside className="w-[320px] border-l border-border-default bg-[#0b1018] overflow-y-auto scrollbar-thin p-4 space-y-4">
                    <FillStrokePanel
                        fillColor={uiState.toolState.fillColor}
                        strokeColor={uiState.toolState.strokeColor}
                        onChangeFill={(color) =>
                            onUIStateChange({
                                ...uiState,
                                toolState: { ...uiState.toolState, fillColor: color },
                            })
                        }
                        onChangeStroke={(color) =>
                            onUIStateChange({
                                ...uiState,
                                toolState: { ...uiState.toolState, strokeColor: color },
                            })
                        }
                    />
                    <BlendFilterPanel
                        opacity={uiState.toolState.brushOpacity}
                        blendMode={
                            activeTexture?.layers.find((l) => uiState.selectedLayerIds.includes(l.id))?.blendMode ??
                            'normal'
                        }
                        onChangeOpacity={(value) =>
                            onUIStateChange({
                                ...uiState,
                                toolState: { ...uiState.toolState, brushOpacity: value },
                            })
                        }
                        onChangeBlendMode={() => { }}
                    />
                    <ReferencePanel references={referenceImages} />
                    <PreviewPanel previews={previewSnapshots} />
                </aside>
            </div>
        </div>
    );
}
