import { useState } from 'react';
import type { Tool } from '../../types';

interface ObjectToolbarProps {
    activeTool: Tool;
    onSelectTool: (tool: Tool) => void;
}

const shapeOptions: { id: Tool; label: string }[] = [
    { id: 'shape-rectangle', label: 'Rectangle' },
    { id: 'shape-ellipse', label: 'Ellipse' },
    { id: 'shape-polygon', label: 'Polygon' },
];

const pencilOptions: { id: Tool; label: string }[] = [
    { id: 'pencil', label: 'Pencil' },
    { id: 'brush', label: 'Brush' },
];

export function ObjectToolbar({ activeTool, onSelectTool }: ObjectToolbarProps) {
    const [openMenu, setOpenMenu] = useState<'shape' | 'pencil' | null>(null);

    const renderButton = (tool: Tool, label: string) => (
        <button
            key={tool}
            onClick={() => {
                setOpenMenu(null);
                onSelectTool(tool);
            }}
            className={`px-3 py-1.5 rounded-xl text-12 font-medium transition ${
                isToolActive(tool, activeTool)
                    ? 'bg-[#22d2ee] text-[#041019]'
                    : 'text-simvox-text-bright hover:bg-[#1d2430]'
            }`}
        >
            {label}
        </button>
    );

    const renderDropdown = (
        id: 'shape' | 'pencil',
        label: string,
        options: { id: Tool; label: string }[],
        isActive: boolean,
    ) => (
        <div className="relative">
            <button
                onClick={() => setOpenMenu(openMenu === id ? null : id)}
                className={`px-3 py-1.5 rounded-xl text-12 font-medium transition ${
                    isActive ? 'bg-[#22d2ee] text-[#041019]' : 'text-simvox-text-bright hover:bg-[#1d2430]'
                }`}
            >
                {label} ▾
            </button>
            {openMenu === id && (
                <div className="absolute left-0 mt-2 w-40 rounded-xl border border-[#1f2c3d] bg-[#0c111b] shadow-xl backdrop-blur z-10">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => {
                                onSelectTool(option.id);
                                setOpenMenu(null);
                            }}
                            className={`block w-full text-left px-4 py-2 text-12 rounded-xl hover:bg-[#141c2a] ${
                                isToolActive(option.id, activeTool) ? 'text-white' : 'text-simvox-text-bright'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex items-center gap-2">
            {renderButton('select', 'Select')}
            {renderButton('pen', 'Pen')}
            {renderDropdown('shape', 'Shapes', shapeOptions, activeTool.startsWith('shape'))}
            {renderDropdown('pencil', 'Pencil', pencilOptions, ['pencil', 'brush'].includes(activeTool))}
            {renderButton('text', 'Type')}
            {renderButton('picture', 'Picture')}
            {renderButton('pixel', 'Pixel')}
            {renderButton('mirror', 'Mirror')}
        </div>
    );
}

function isToolActive(tool: Tool, activeTool: Tool) {
    if (tool.startsWith('shape')) {
        return activeTool.startsWith('shape');
    }
    if (tool === 'pencil' || tool === 'brush') {
        return activeTool === 'pencil' || activeTool === 'brush';
    }
    return tool === activeTool;
}
