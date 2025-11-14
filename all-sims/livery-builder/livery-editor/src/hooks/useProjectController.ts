import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Layer, LayerTreeFolder, LiveryProject, LiveryTexture, PreviewSnapshot, ReferenceImage, SelectionGroup } from '../types';
import { exportProjectBundle, fetchProjectBundle, saveProjectBundle, type ProjectBundle } from '../lib/mockBackend';
import { flattenLayerTree, reorderLayerTree } from '../lib/layerTree';
import { mockPreviewSnapshots, mockReferenceImages, mockSelectionGroups } from '../data/mockProject';

interface ControllerOptions {
    onProjectChange?: (project: LiveryProject) => void;
}

interface LayerTreeState {
    project: LiveryProject | null;
    selectionGroups: SelectionGroup[];
    references: ReferenceImage[];
    previews: PreviewSnapshot[];
    loading: boolean;
    error?: string;
    activeTextureId: string | null;
    setActiveTexture: (textureId: string) => void;
    activeTool: string;
    setActiveTool: (toolId: string) => void;
    activeOmAction: string;
    setActiveOmAction: (actionId: string) => void;
    activeReferenceId: string | null;
    setActiveReference: (referenceId: string) => void;
    reorderNode: (textureId: string, sourceId: string, targetId: string, mode: 'before' | 'inside') => void;
    createLayer: (textureId: string, layerInput: Partial<Layer>) => Promise<Layer | null>;
    serializeProject: () => string | null;
    loadProjectFromJson: (json: string) => void;
    saveProject: () => Promise<LiveryProject | null>;
    exportProject: () => Promise<Blob | null>;
}

const buildBundleFromProject = (project: LiveryProject): ProjectBundle => ({
    project,
    selectionGroups: mockSelectionGroups,
    references: mockReferenceImages,
    previews: mockPreviewSnapshots,
});

export function useProjectController(initialProject?: LiveryProject, options: ControllerOptions = {}): LayerTreeState {
    const [bundle, setBundle] = useState<ProjectBundle | null>(initialProject ? buildBundleFromProject(initialProject) : null);
    const [loading, setLoading] = useState(!initialProject);
    const [error, setError] = useState<string | undefined>();
    const [activeTextureId, setActiveTextureId] = useState<string | null>(initialProject?.textures[0]?.id ?? null);
    const [activeTool, setActiveTool] = useState('select');
    const [activeOmAction, setActiveOmAction] = useState('align-left');
    const [activeReferenceId, setActiveReferenceId] = useState<string | null>(mockReferenceImages[0]?.id ?? null);

    useEffect(() => {
        let mounted = true;
        if (initialProject) {
            setLoading(false);
            setBundle(buildBundleFromProject(initialProject));
            setActiveTextureId(initialProject.textures[0]?.id ?? null);
            setActiveReferenceId(mockReferenceImages[0]?.id ?? null);
            return () => {
                mounted = false;
            };
        }
        setLoading(true);
        fetchProjectBundle()
            .then((result) => {
                if (!mounted) return;
                setBundle(result);
                setActiveTextureId(result.project.textures[0]?.id ?? null);
                setActiveReferenceId(result.references[0]?.id ?? null);
                setError(undefined);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load project');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [initialProject]);

    const emitChange = useCallback(
        (project: LiveryProject) => {
            options.onProjectChange?.(project);
        },
        [options],
    );

    const mutateTexture = useCallback(
        (textureId: string, updater: (texture: LiveryTexture) => LiveryTexture) => {
            setBundle((current) => {
                if (!current) return current;
                const updatedTextures = current.project.textures.map((texture) =>
                    texture.id === textureId ? updater(texture) : texture,
                );
                const updatedProject = {
                    ...current.project,
                    textures: updatedTextures,
                };
                emitChange(updatedProject);
                return { ...current, project: updatedProject };
            });
        },
        [emitChange],
    );

    const reorderNode = useCallback(
        (textureId: string, sourceId: string, targetId: string, mode: 'before' | 'inside') => {
            mutateTexture(textureId, (texture) => {
                const nextTree = reorderLayerTree(texture.layerTree ?? [], sourceId, targetId, mode);
                return {
                    ...texture,
                    layerTree: nextTree,
                    layers: flattenLayerTree(nextTree),
                };
            });
        },
        [mutateTexture],
    );

    const createLayer = useCallback(
        async (textureId: string, layerInput: Partial<Layer>) => {
            const newLayerId = `layer-${Math.random().toString(36).slice(2, 8)}`;
            let createdLayer: Layer | null = null;
            mutateTexture(textureId, (texture) => {
                const layerTree = JSON.parse(JSON.stringify(texture.layerTree ?? []));
                const baseLayer: Layer = {
                    id: newLayerId,
                    name: layerInput.name ?? `Layer ${newLayerId.slice(-3)}`,
                    type: layerInput.type ?? 'shape',
                    visible: layerInput.visible ?? true,
                    locked: layerInput.locked ?? false,
                    opacity: layerInput.opacity ?? 100,
                    blendMode: layerInput.blendMode ?? 'normal',
                    x: layerInput.x ?? 0,
                    y: layerInput.y ?? 0,
                    width: Math.max(layerInput.width ?? 50, 1),
                    height: Math.max(layerInput.height ?? 50, 1),
                    rotation: layerInput.rotation ?? 0,
                    scaleX: layerInput.scaleX ?? 1,
                    scaleY: layerInput.scaleY ?? 1,
                    data: layerInput.data,
                };
                const targetFolder = layerTree.find(
                    (node: any) => node.nodeType === 'folder' && node.folderType === 'regular',
                ) as LayerTreeFolder | undefined;
                const layerNode = {
                    nodeType: 'layer' as const,
                    ...baseLayer,
                };
                if (targetFolder) {
                    targetFolder.children = targetFolder.children ?? [];
                    targetFolder.children.push(layerNode);
                } else {
                    layerTree.push(layerNode);
                }
                createdLayer = baseLayer;
                return {
                    ...texture,
                    layerTree,
                    layers: flattenLayerTree(layerTree),
                };
            });
            return createdLayer;
        },
        [mutateTexture],
    );

    const serializeProject = useCallback(() => {
        if (!bundle?.project) return null;
        return JSON.stringify(bundle.project, null, 2);
    }, [bundle?.project]);

    const loadProjectFromJson = useCallback(
        (json: string) => {
            try {
                const parsed = JSON.parse(json) as LiveryProject;
                const normalizedTextures: LiveryTexture[] = (parsed.textures ?? []).map((texture) => {
                    const layerTree = texture.layerTree ?? [];
                    return {
                        ...texture,
                        layerTree,
                        layers: flattenLayerTree(layerTree),
                    };
                });
                const normalizedProject: LiveryProject = {
                    ...parsed,
                    textures: normalizedTextures,
                    createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
                    updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : new Date(),
                };
                setBundle({
                    project: normalizedProject,
                    selectionGroups: bundle?.selectionGroups ?? mockSelectionGroups,
                    references: bundle?.references ?? mockReferenceImages,
                    previews: bundle?.previews ?? mockPreviewSnapshots,
                });
                setActiveTextureId(normalizedProject.textures[0]?.id ?? null);
            } catch (err) {
                console.error('Failed to load JSON project', err);
            }
        },
        [bundle?.references, bundle?.selectionGroups, bundle?.previews],
    );

    const saveProject = useCallback(async () => {
        if (!bundle?.project) return null;
        const updated = await saveProjectBundle(bundle.project);
        setBundle((current) => (current ? { ...current, project: updated } : current));
        emitChange(updated);
        return updated;
    }, [bundle?.project, emitChange]);

    const exportProject = useCallback(async () => {
        if (!bundle?.project) return null;
        return exportProjectBundle(bundle.project);
    }, [bundle?.project]);

    return useMemo(
        () => ({
            project: bundle?.project ?? null,
            selectionGroups: bundle?.selectionGroups ?? [],
            references: bundle?.references ?? [],
            previews: bundle?.previews ?? [],
            loading,
            error,
            activeTextureId,
            setActiveTexture: setActiveTextureId,
            activeTool,
            setActiveTool,
            activeOmAction,
            setActiveOmAction,
            activeReferenceId,
            setActiveReference: setActiveReferenceId,
            reorderNode,
            createLayer,
            serializeProject,
            loadProjectFromJson,
            saveProject,
            exportProject,
        }),
        [
            bundle,
            loading,
            error,
            activeTextureId,
            activeTool,
            activeOmAction,
            activeReferenceId,
            reorderNode,
            createLayer,
            serializeProject,
            loadProjectFromJson,
            saveProject,
            exportProject,
        ],
    );
}
