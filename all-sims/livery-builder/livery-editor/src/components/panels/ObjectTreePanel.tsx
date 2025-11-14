import type { LayerTreeNode } from '../../types';

interface ObjectTreePanelProps {
    tree?: LayerTreeNode[];
    selectedLayerIds: string[];
    onSelectLayer: (ids: string[]) => void;
}

export function ObjectTreePanel({
    tree = [],
    selectedLayerIds,
    onSelectLayer,
}: ObjectTreePanelProps) {
    const renderNode = (node: LayerTreeNode, depth = 0) => {
        const indent = depth * 16;

        if (node.nodeType === 'folder') {
            return (
                <div key={node.id} className="mb-1">
                    <div
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${node.folderType === 'mask'
                                ? 'bg-[#121927]'
                                : 'bg-transparent'
                            }`}
                        style={{ paddingLeft: indent + 8 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#1f2c3d] bg-[#0f1622] text-xs text-simvox-text-med">
                                {node.folderType === 'mask' ? 'Mask' : 'Fld'}
                            </div>
                            <div className="leading-tight">
                                <p className="text-text-primary text-sm font-medium">{node.name}</p>
                                <p className="text-[11px] uppercase tracking-wide text-text-secondary">
                                    {node.folderType === 'mask' ? 'Mask Folder' : 'Folder'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <button className="hover:text-white">👁</button>
                            <button className="hover:text-white">🔒</button>
                        </div>
                    </div>
                    <div className="ml-4 border-l border-[#1f2c3d] pl-2">
                        {node.children.map((child) => renderNode(child, depth + 1))}
                    </div>
                </div>
            );
        }

        const selected = selectedLayerIds.includes(node.id);
        return (
            <button
                key={node.id}
                onClick={() => onSelectLayer([node.id])}
                className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${selected
                        ? 'bg-[#22d2ee1a] text-white'
                        : 'text-text-primary hover:bg-[#151c29]'
                    }`}
                style={{ paddingLeft: indent + 24 }}
            >
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg border border-[#1f2c3d] bg-[#1b2231]" />
                    <div className="leading-tight">
                        <p className="text-sm">{node.name}</p>
                        <p className="text-[11px] uppercase tracking-wide text-text-secondary">{node.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <button className="hover:text-white">👁</button>
                    <button className="hover:text-white">🔒</button>
                    <button className="hover:text-white">🗑</button>
                </div>
            </button>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4">
            {tree.length === 0 ? (
                <p className="text-12 text-text-secondary">No layers loaded</p>
            ) : (
                tree.map((node) => renderNode(node))
            )}
        </div>
    );
}
