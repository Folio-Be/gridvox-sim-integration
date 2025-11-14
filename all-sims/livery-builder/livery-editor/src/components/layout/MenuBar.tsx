/**
 * Menu bar with File, Edit, View, Layer, Window, Help menus
 * Extracted from Stitch main_editor design
 */
export interface MenuBarProps {
    onSave: () => void;
    onExport: () => void;
}

export function MenuBar({ onSave, onExport }: MenuBarProps) {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-border-default px-4 py-1 text-sm bg-background-base flex-shrink-0">
            <div className="flex items-center gap-4 text-text-primary">
                <button className="px-2 py-1 hover:bg-border-default rounded transition-colors" onClick={onSave}>
                    File
                </button>
                <button className="px-2 py-1 hover:bg-border-default rounded transition-colors">
                    Edit
                </button>
                <button className="px-2 py-1 hover:bg-border-default rounded transition-colors">
                    View
                </button>
                <button className="px-2 py-1 hover:bg-border-default rounded transition-colors">
                    Layer
                </button>
                <button className="px-2 py-1 hover:bg-border-default rounded transition-colors">
                    Window
                </button>
                <button className="px-2 py-1 hover:bg-border-default rounded transition-colors">
                    Help
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded text-12 text-text-secondary hover:text-white hover:bg-border-default transition-colors" onClick={onSave}>
                    Save
                </button>
                <button className="px-3 py-1 rounded text-12 bg-accent-blue text-white hover:bg-accent-blue/80 transition-colors" onClick={onExport}>
                    Export
                </button>
            </div>
        </header>
    );
}
