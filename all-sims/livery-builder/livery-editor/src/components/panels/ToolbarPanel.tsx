import type { Tool } from '../../types';

/**
 * Left vertical toolbar with drawing tools
 * Extracted from Stitch main_editor design
 */
export interface ToolbarPanelProps {
    activeTool: Tool;
    onSelectTool: (tool: Tool) => void;
}

const tools: { id: Tool; icon: string; title: string }[] = [
    { id: 'move', icon: '⊕', title: 'Move Tool' },
    { id: 'marquee', icon: '▭', title: 'Marquee Tool' },
    { id: 'lasso', icon: '∿', title: 'Lasso Tool' },
    { id: 'magic-wand', icon: '✦', title: 'Magic Wand' },
    { id: 'brush', icon: '🖌', title: 'Brush Tool' },
    { id: 'pencil', icon: '✏', title: 'Pencil Tool' },
    { id: 'gradient', icon: '▒', title: 'Gradient Tool' },
    { id: 'eraser', icon: '⌫', title: 'Eraser Tool' },
    { id: 'shape', icon: '▢', title: 'Shape Tool' },
    { id: 'text', icon: 'T', title: 'Text Tool' },
    { id: 'eyedropper', icon: '💧', title: 'Eyedropper' },
    { id: 'hand', icon: '✋', title: 'Hand Tool' },
    { id: 'zoom', icon: '🔍', title: 'Zoom Tool' },
];

export function ToolbarPanel({ activeTool, onSelectTool }: ToolbarPanelProps) {
    return (
        <aside className="w-16 bg-background-base p-2 flex-shrink-0 flex flex-col items-center gap-1 border-r border-border-default">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className={`
            w-12 h-12 flex items-center justify-center rounded transition-colors text-20
            ${activeTool === tool.id
                            ? 'bg-accent-blue text-white'
                            : 'text-text-primary hover:bg-border-default'
                        }
          `}
                    title={tool.title}
                >
                    {tool.icon}
                </button>
            ))}
        </aside>
    );
}
