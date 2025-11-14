import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useProjectController } from '../hooks/useProjectController';
import type { LayerTreeNode, LiveryProject } from '../types';
import { FabricStage } from './FabricStage';

export interface LiveryEditorProps {
    project?: LiveryProject;
    onSave?: (project: LiveryProject) => void;
    onExport?: (data: Blob, filename: string) => void;
    onChange?: (project: LiveryProject) => void;
    className?: string;
    height?: string | number;
}

interface ToolbarButton {
    id: string;
    icon: string;
    label: string;
    disabled?: boolean;
}

const toolbarButtons: ToolbarButton[] = [
    { id: 'select', icon: 'arrow_selector_tool', label: 'Select Tool' },
    { id: 'pen', icon: 'edit', label: 'Pen Tool' },
    { id: 'shapes', icon: 'check_box_outline_blank', label: 'Shapes Tool' },
    { id: 'pencil', icon: 'brush', label: 'Pencil Tool' },
    { id: 'type', icon: 'title', label: 'Type Tool' },
    { id: 'picture', icon: 'image', label: 'Picture Tool' },
    { id: 'pixel', icon: 'grid_4x4', label: 'Pixel Tool' },
    { id: 'mirror', icon: 'flip', label: 'Mirror Tool' },
];

const omButtons: ToolbarButton[] = [
    { id: 'align-left', icon: 'align_horizontal_left', label: 'Align Left' },
    { id: 'distribute', icon: 'width', label: 'Distribute Space' },
    { id: 'group', icon: 'group_work', label: 'Group', disabled: true },
    { id: 'ungroup', icon: 'ungroup', label: 'Ungroup', disabled: true },
    { id: 'reorder', icon: 'reorder', label: 'Reorder' },
];

const layerIconMap: Record<string, string> = {
    image: 'image',
    shape: 'category',
    text: 'title',
    fill: 'format_color_fill',
    gradient: 'gradient',
    group: 'layers',
};

const fallbackThumbnail =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC0wIJthJLJyk5n9sPBtQH0aHHAH5iMiP8c0EfA2qR4MVlF4QqkrJsstP6n86d3u77rB3FcMnEGPneqp9ZazEExObAFhBEadQ2EysKEDnKa2BTAxU0OJWENpzuuCani5KQTLCW9G-R3RjNTLXAajRJx7tjt5qoTWJyVhVFgtYDmccKilywJgdxKixwpUAZVcC2sYQMN3q9V2CLy3TBbrbax-XSBWBcHgy7rsjq1D7sJYeEM0jsB3qCUXDD_m7n_q6fQ_z4zomyjSyE';

const fallbackPreview =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD3NZhlTuGyBIBdzJqKB2ICqsjIzr4RpaDkK5KvtsfFyQB6Iq6PQuLUxKLkISgbLrvPrlLOTgKuQpOeHdM8ILXjZIjX0JKtFo_OvgJiBZHcDD5kCCdfKkd5PO2jETsCIH1qCddDQeQggwv4H6drG9QpL3BvRQsI3msSd00Wv9tVBBFkoeGFx6a94e2XilE93FMi2pb4tiTbl6ukQUP6XhJwOMLOwXO9DZvqWhPK02UEjiRpC5v1Xm5Mahxdhp7dyPZnQ-A_4BAS58E';

const getLayerIcon = (type?: string) => layerIconMap[type ?? ''] ?? 'layers';

const isFolder = (node: LayerTreeNode): node is LayerTreeNode & { nodeType: 'folder' } => node.nodeType === 'folder';

interface TreeNodeRowProps {
    node: LayerTreeNode;
    draggingId: string | null;
    dragOverId: string | null;
    onDragStart: (nodeId: string) => void;
    onDragOver: (nodeId: string) => void;
    onDrop: (nodeId: string, mode: 'before' | 'inside') => void;
    collapsedIds: Set<string>;
    toggleCollapse: (nodeId: string) => void;
    selectedLayerId: string | null;
    onSelectLayer: (layerId: string | null) => void;
}

const TreeNodeRow = ({
    node,
    draggingId,
    dragOverId,
    onDragStart,
    onDragOver,
    onDrop,
    collapsedIds,
    toggleCollapse,
    selectedLayerId,
    onSelectLayer,
}: TreeNodeRowProps) => {
    const folderStyles = isFolder(node)
        ? node.folderType === 'mask'
            ? 'bg-black text-white ring-1 ring-simvox-border-light'
            : 'bg-simvox-bg-light text-simvox-text-bright'
        : 'hover:bg-simvox-bg-light';
    const isCollapsed = isFolder(node) && collapsedIds.has(node.id);
    const isSelected = node.nodeType === 'layer' && node.id === selectedLayerId;
    const rowClasses = [
        'sv-tree-row flex h-10 items-center gap-2 rounded p-2',
        folderStyles,
        dragOverId === node.id ? 'sv-tree-row--over' : '',
        draggingId === node.id ? 'sv-tree-row--dragging' : '',
        isSelected ? 'sv-tree-row--selected' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const content = (
        <div
            className={rowClasses}
            draggable
            onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', node.id);
                onDragStart(node.id);
            }}
            onDragOver={(event) => {
                event.preventDefault();
                onDragOver(node.id);
            }}
            onDrop={(event) => {
                event.preventDefault();
                onDrop(node.id, isFolder(node) ? 'inside' : 'before');
            }}
            onClick={(event) => {
                event.stopPropagation();
                if (isFolder(node)) {
                    toggleCollapse(node.id);
                } else {
                    onSelectLayer(node.id);
                }
            }}
        >
            {isFolder(node) ? (
                <>
                    <div className="size-6 shrink-0 rounded bg-simvox-border-dark" />
                    <span
                        className={`material-symbols-outlined text-xl transition-transform ${
                            node.folderType === 'mask' ? '' : isCollapsed ? '' : '-rotate-90'
                        }`}
                    >
                        expand_more
                    </span>
                    <span className="material-symbols-outlined text-xl">{node.folderType === 'mask' ? 'interests' : 'folder_open'}</span>
                    <p className="flex-1 truncate text-sm font-medium">{node.name}</p>
                    <div className="flex items-center gap-1 text-simvox-text-med">
                        <span className="material-symbols-outlined cursor-pointer text-lg hover:text-simvox-text-bright">visibility</span>
                        <span className="material-symbols-outlined cursor-pointer text-lg hover:text-simvox-text-bright">lock</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="size-6 shrink-0 rounded bg-simvox-border-dark" />
                    <span className="w-5" />
                    <span className="material-symbols-outlined text-xl text-simvox-text-med">{getLayerIcon(node.type)}</span>
                    <p className={`flex-1 truncate text-sm font-normal ${isSelected ? 'text-simvox-accent-primary' : ''}`}>{node.name}</p>
                    <div className="flex items-center gap-1 text-simvox-text-med">
                        <span className="material-symbols-outlined cursor-pointer text-lg hover:text-simvox-text-bright">
                            {node.visible ? 'visibility' : 'visibility_off'}
                        </span>
                        <span className="material-symbols-outlined cursor-pointer text-lg hover:text-simvox-text-bright">
                            {node.locked ? 'lock' : 'lock_open'}
                        </span>
                    </div>
                </>
            )}
        </div>
    );

    if (!isFolder(node)) {
        return content;
    }

    return (
        <div className="flex flex-col space-y-1">
            {content}
            {node.children.length > 0 && !isCollapsed && (
                <div className="ml-8 flex flex-col space-y-1 border-l border-simvox-border-dark pl-4">
                    {node.children.map((child) => (
                        <TreeNodeRow
                            key={child.id}
                            node={child}
                            draggingId={draggingId}
                            dragOverId={dragOverId}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            collapsedIds={collapsedIds}
                            toggleCollapse={toggleCollapse}
                            selectedLayerId={selectedLayerId}
                            onSelectLayer={onSelectLayer}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export function LiveryEditor({
    project: incomingProject,
    onSave,
    onExport,
    onChange,
    className = '',
    height = '100vh',
}: LiveryEditorProps) {
    const controller = useProjectController(incomingProject, {
        onProjectChange: (updated) => onChange?.(updated),
    });
    const {
        project,
        selectionGroups,
        references,
        previews,
        loading,
        error,
        activeTextureId,
        setActiveTexture,
        activeTool,
        setActiveTool,
        activeOmAction,
        setActiveOmAction,
        activeReferenceId,
        setActiveReference,
        reorderNode,
        createLayer,
        serializeProject,
        loadProjectFromJson,
        saveProject,
        exportProject,
    } = controller;

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

    const activeTexture = useMemo(() => {
        if (!project || !project.textures.length) return null;
        return project.textures.find((texture) => texture.id === activeTextureId) ?? project.textures[0];
    }, [project, activeTextureId]);

    const tabs = project?.textures ?? [];
    const resolutionLabel =
        activeTexture?.width && activeTexture?.height ? `${activeTexture.width}x${activeTexture.height} px` : '4096x4096 px';
    const thumbnailUrl = activeTexture?.thumbnail ?? tabs[0]?.thumbnail ?? fallbackThumbnail;
    const previewImage = previews[0]?.thumbnail ?? fallbackPreview;

    useEffect(() => {
        setSelectedLayerId(null);
    }, [activeTexture?.id]);

    const jsonFileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadJson = () => {
        const json = serializeProject();
        if (!json) return;
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${project?.name ?? 'livery'}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const handleOpenJsonClick = () => {
        jsonFileInputRef.current?.click();
    };

    const handleJsonFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        loadProjectFromJson(text);
        event.target.value = '';
    };

    const handleSave = async () => {
        const updated = await saveProject();
        if (updated) {
            onSave?.(updated);
        }
    };

    const handleExport = async () => {
        const blob = await exportProject();
        if (blob && project) {
            onExport?.(blob, `${project.name || 'livery'}.json`);
        }
    };

    const handleDrop = (targetId: string, mode: 'before' | 'inside') => {
        if (draggingId && activeTexture) {
            reorderNode(activeTexture.id, draggingId, targetId, mode);
        }
        setDragOverId(null);
        setDraggingId(null);
    };

    const toggleCollapse = (nodeId: string) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    const handleSelectLayer = (layerId: string | null) => {
        setSelectedLayerId(layerId);
    };

    if (loading && !project) {
        return (
            <div className={`flex items-center justify-center bg-simvox-bg-deep text-simvox-text-med ${className}`} style={{ height }}>
                <span>Loading project…</span>
            </div>
        );
    }

    if (error && !project) {
        return (
            <div className={`flex items-center justify-center bg-simvox-bg-deep text-simvox-accent-primary ${className}`} style={{ height }}>
                <span>{error}</span>
            </div>
        );
    }

    if (!project || !activeTexture) {
        return null;
    }

    const handleSaveAll = async () => {
        await handleSave();
        handleDownloadJson();
    };

    return (
        <div className={`bg-simvox-bg-deep text-simvox-text-bright font-display ${className}`} style={{ height }}>
            <div className="relative flex h-full w-full flex-col overflow-hidden">
                <header className="relative flex h-16 shrink-0 items-center justify-between gap-4 border-b border-simvox-border-dark px-6 py-2 sv-header-gradient">
                    <input
                        type="file"
                        accept="application/json"
                        ref={jsonFileInputRef}
                        className="hidden"
                        onChange={handleJsonFileChange}
                    />
                    <div className="flex flex-1 items-center gap-4">
                        <div
                            aria-label="Project thumbnail"
                            className="aspect-square size-10 flex-shrink-0 rounded-lg bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${thumbnailUrl})` }}
                        />
                        <div className="flex flex-col justify-center">
                            <p className="truncate text-base font-semibold">{project.name}</p>
                            <p className="truncate text-sm text-simvox-text-med">{project.simulator}</p>
                        </div>
                    </div>
                    <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-simvox-bg-deep p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`group relative flex h-full flex-1 items-center justify-center rounded-md px-3 text-sm font-medium tracking-wide ${
                                    tab.id === activeTexture.id
                                        ? 'bg-simvox-accent-primary text-white'
                                        : 'text-simvox-text-med hover:bg-simvox-bg-light hover:text-simvox-text-bright'
                                }`}
                                type="button"
                                onClick={() => setActiveTexture(tab.id)}
                            >
                                <span className="truncate">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-1 items-center justify-end gap-3">
                        <button
                            onClick={handleOpenJsonClick}
                            className="flex h-10 min-w-[84px] items-center justify-center rounded-lg border border-simvox-border-dark bg-simvox-bg-light px-4 text-sm font-bold tracking-[0.015em] text-simvox-text-bright hover:bg-simvox-border-dark"
                            type="button"
                        >
                            Load JSON
                        </button>
                        <button
                            onClick={handleSaveAll}
                            className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-simvox-border-dark bg-simvox-bg-light px-4 text-sm font-bold tracking-[0.015em] text-simvox-text-bright hover:bg-simvox-border-dark"
                            type="button"
                        >
                            <span className="truncate">Save</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-simvox-accent-primary px-4 text-sm font-bold tracking-[0.015em] text-white hover:opacity-90"
                            type="button"
                        >
                            <span className="truncate">Export</span>
                        </button>
                    </div>
                </header>

                <main className="flex flex-1 overflow-hidden">
                    <aside className="flex w-[280px] shrink-0 flex-col overflow-y-auto border-r border-simvox-border-dark bg-simvox-bg-deep">
                        <div className="flex flex-1 flex-col">
                            <div className="p-4">
                                <div className="flex flex-col space-y-1">
                                    {(activeTexture.layerTree ?? []).map((node) => (
                                        <TreeNodeRow
                                            key={node.id}
                                            node={node}
                                            draggingId={draggingId}
                                            dragOverId={dragOverId}
                                            onDragStart={(nodeId) => setDraggingId(nodeId)}
                                            onDragOver={(nodeId) => setDragOverId(nodeId)}
                                            onDrop={handleDrop}
                                            collapsedIds={collapsedIds}
                                            toggleCollapse={toggleCollapse}
                                            selectedLayerId={selectedLayerId}
                                            onSelectLayer={handleSelectLayer}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-simvox-border-dark p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-simvox-text-med">Selection Groups</h3>
                                    <button
                                        className="flex h-6 w-6 items-center justify-center rounded-md text-simvox-text-med hover:bg-simvox-bg-light hover:text-simvox-text-bright"
                                        type="button"
                                        aria-label="Add selection group"
                                    >
                                        <span className="material-symbols-outlined text-xl">add</span>
                                    </button>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    {selectionGroups.map((group, index) => (
                                        <div
                                            key={group.id}
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 ${
                                                index === 0 ? 'bg-simvox-accent-primary border-simvox-accent-primary text-white' : 'border-simvox-border-dark bg-simvox-bg-light hover:border-simvox-accent-primary'
                                            }`}
                                        >
                                            <div className="h-6 w-1 rounded-full" style={{ backgroundColor: group.color }} />
                                            <div>
                                                <p className="text-sm font-medium">{group.name}</p>
                                                <p className="text-xs text-simvox-text-med">{group.layerIds.length} Layers</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="relative flex flex-1 flex-col bg-simvox-bg-deep">
                        <div className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
                            <div className="flex items-center justify-start gap-1 rounded-lg border border-simvox-border-dark bg-simvox-bg-med p-1 shadow-2xl">
                                {toolbarButtons.map((button) => (
                                    <button
                                        key={button.id}
                                        type="button"
                                        className={`rounded p-2 ${
                                            activeTool === button.id
                                                ? 'bg-simvox-accent-primary text-white'
                                                : 'text-simvox-text-med hover:bg-simvox-bg-light hover:text-simvox-text-bright'
                                        }`}
                                        onClick={() => setActiveTool(button.id)}
                                        aria-label={button.label}
                                    >
                                        <span className="material-symbols-outlined text-base leading-none">{button.icon}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center justify-start gap-1 rounded-lg border border-simvox-border-dark bg-simvox-bg-med p-1 shadow-2xl">
                                {omButtons.map((button) => (
                                    <button
                                        key={button.id}
                                        type="button"
                                        aria-label={button.label}
                                        disabled={button.disabled}
                                        onClick={() => !button.disabled && setActiveOmAction(button.id)}
                                        className={`rounded p-2 ${
                                            activeOmAction === button.id
                                                ? 'bg-simvox-accent-primary text-white'
                                                : button.disabled
                                                    ? 'text-simvox-text-dim opacity-40'
                                                    : 'text-simvox-text-med hover:bg-simvox-bg-light hover:text-simvox-text-bright'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-base leading-none">{button.icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative flex flex-1 overflow-hidden bg-simvox-bg-deep">
                            <div className="absolute inset-0 sv-canvas-vignette pointer-events-none" />
                            <div className="relative z-10 flex h-full w-full items-center justify-center">
                                <FabricStage
                                    texture={activeTexture}
                                    activeTool={activeTool}
                                    selectedLayerId={selectedLayerId}
                                    onSelectLayer={handleSelectLayer}
                                    onLayerCreate={(layer) => createLayer(activeTexture.id, layer)}
                                />
                            </div>
                        </div>
                        <div className="flex h-8 items-center justify-between border-t border-simvox-border-dark bg-simvox-bg-med px-4 text-xs text-simvox-text-med">
                            <div className="flex items-center gap-4">
                                <span>{activeTexture.name}</span>
                                <span>{resolutionLabel}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>Tool: {toolbarButtons.find((btn) => btn.id === activeTool)?.label ?? 'Select'}</span>
                                <span>Zoom: 100%</span>
                                <button className="flex items-center gap-1 hover:text-simvox-text-bright" type="button" aria-label="Collapse canvas footer">
                                    <span className="material-symbols-outlined text-base">expand_less</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside className="flex w-[320px] shrink-0 flex-col border-l border-simvox-border-dark bg-simvox-bg-deep">
                        <div className="flex h-full flex-col">
                            <div className="flex flex-col">
                                <div className="space-y-3 p-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-simvox-text-med">Fill</label>
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 cursor-pointer rounded-md bg-simvox-accent-primary ring-2 ring-offset-2 ring-offset-simvox-bg-deep ring-simvox-text-bright" />
                                            <span className="font-mono text-sm uppercase text-simvox-text-med">#22D2EE</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-simvox-text-med">Stroke</label>
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 cursor-pointer rounded-md border-2 border-dashed border-simvox-text-dim bg-transparent" />
                                            <span className="text-sm text-simvox-text-dim">No stroke</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 border-t border-simvox-border-dark p-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-simvox-text-med">Opacity</label>
                                        <span className="text-sm font-medium text-simvox-text-bright">100%</span>
                                    </div>
                                    <input className="sv-range" max={100} min={0} type="range" defaultValue={100} />
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-simvox-text-med">Blend Mode</label>
                                        <span className="text-sm font-medium text-simvox-text-bright">Normal</span>
                                    </div>
                                    <button className="h-9 w-full rounded-md border border-simvox-border-dark bg-simvox-bg-light text-sm text-simvox-text-bright hover:border-simvox-accent-primary" type="button">
                                        Add Filter
                                    </button>
                                </div>
                            </div>
                            <div className="flex min-h-0 flex-1 flex-col">
                                <div className="flex min-h-0 flex-1 flex-col border-t border-simvox-border-dark">
                                    <div className="flex flex-col p-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1">
                                                {references.map((reference) => (
                                                    <button
                                                        key={reference.id}
                                                        className={`group flex items-center gap-1.5 rounded-md py-1 pl-3 pr-2 text-sm ${
                                                            reference.id === activeReferenceId
                                                                ? 'bg-simvox-accent-primary text-white'
                                                                : 'text-simvox-text-med hover:bg-simvox-bg-light'
                                                        }`}
                                                        type="button"
                                                        onClick={() => setActiveReference(reference.id)}
                                                    >
                                                        <span>{reference.name}</span>
                                                        <span className="material-symbols-outlined text-base opacity-70 group-hover:opacity-100">close</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <button className="h-7 rounded-md bg-simvox-bg-light px-3 text-xs font-medium text-simvox-text-med hover:text-simvox-text-bright" type="button">
                                                Upload
                                            </button>
                                        </div>
                                        <div className="mt-2 flex grow items-center justify-center rounded border border-simvox-border-dark bg-simvox-bg-deep">
                                            {activeReferenceId ? (
                                                <div
                                                    className="h-full w-full rounded bg-cover bg-center bg-no-repeat"
                                                    style={{
                                                        backgroundImage: `url(${
                                                            references.find((ref) => ref.id === activeReferenceId)?.url ??
                                                            references[0]?.url ??
                                                            ''
                                                        })`,
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-sm text-simvox-text-dim">Reference Image</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="group h-2.5 cursor-row-resize border-y border-simvox-border-dark bg-simvox-bg-deep hover:border-simvox-accent-primary">
                                    <div className="mx-auto h-full w-8 rounded-full bg-simvox-border-light group-hover:bg-simvox-accent-primary" />
                                </div>
                                <div className="flex min-h-0 flex-1 flex-col">
                                    <div className="flex flex-1 flex-col p-2">
                                        <div className="flex h-full w-full flex-col">
                                            <div className="relative mb-2 w-full flex-1 rounded border border-simvox-border-dark bg-simvox-bg-deep">
                                                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" data-alt="3D render of a race car" style={{ backgroundImage: `url(${previewImage})` }} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-simvox-text-bright">Real-time Preview</p>
                                                    <p className="text-xs text-simvox-text-med">{project.car}</p>
                                                </div>
                                                <button className="flex h-7 items-center gap-1 rounded-md bg-simvox-bg-light px-3 text-xs font-medium text-simvox-accent-primary hover:text-simvox-accent-blue" type="button">
                                                    <span>Open 3D</span>
                                                    <span className="material-symbols-outlined text-base">open_in_new</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
}

export default LiveryEditor;
