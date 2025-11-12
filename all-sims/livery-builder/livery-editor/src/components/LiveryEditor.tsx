import { useState } from 'react';
import type { LiveryProject, UIState, Tool } from '../types';
import { EditorLayout } from './layout/EditorLayout';

export interface LiveryEditorProps {
    /** Initial project to load (optional) */
    project?: LiveryProject;

    /** Callback when project is saved */
    onSave?: (project: LiveryProject) => void;

    /** Callback when project is exported */
    onExport?: (data: Blob, filename: string) => void;

    /** Callback when project changes (for auto-save) */
    onChange?: (project: LiveryProject) => void;

    /** Enable voice commands */
    enableVoice?: boolean;

    /** Custom className for styling integration */
    className?: string;

    /** Height of the editor (default: 100vh) */
    height?: string | number;
}

/**
 * SimVox Livery Editor - Main Component
 * 
 * A complete racing livery editor with:
 * - Multi-texture management (10-20 textures per car)
 * - Fabric.js canvas with layer caching
 * - Command Pattern (undo/redo)
 * - Voice command support
 * - PSD/DDS/TGA import/export
 * - Racing-specific tools (sponsor zones, number templates, wireframes)
 * 
 * @example
 * ```tsx
 * import { LiveryEditor } from '@simvox/livery-editor';
 * 
 * function App() {
 *   return (
 *     <LiveryEditor
 *       enableVoice={true}
 *       onSave={(project) => console.log('Saved:', project)}
 *       onExport={(blob, filename) => downloadFile(blob, filename)}
 *     />
 *   );
 * }
 * ```
 */
export function LiveryEditor({
    project: initialProject,
    onSave,
    onExport,
    onChange,
    enableVoice = false,
    className = '',
    height = '100vh',
}: LiveryEditorProps) {
    const [project, setProject] = useState<LiveryProject | null>(initialProject || null);

    const [uiState, setUIState] = useState<UIState>({
        activeTextureId: null,
        selectedLayerIds: [],
        toolState: {
            activeTool: 'select' as Tool,
            brushSize: 20,
            brushHardness: 80,
            brushOpacity: 100,
            eraserSize: 20,
            fillColor: '#FF0000',
            strokeColor: '#000000',
            strokeWidth: 2,
        },
        canvasState: {
            zoom: 1,
            panX: 0,
            panY: 0,
            gridEnabled: false,
            gridSize: 50,
            snapToGrid: false,
            guidesVisible: false,
            rulers: true,
            wireframeMode: false,
            sponsorZonesVisible: false,
        },
        commandHistory: {
            past: [],
            future: [],
            maxHistory: 50,
        },
        voiceState: {
            isListening: false,
            isProcessing: false,
            currentTranscript: '',
            history: [],
        },
        panels: {
            toolbar: true,
            properties: true,
            layers: true,
            reference: false,
            voice: enableVoice,
            sponsorLibrary: false,
        },
        modals: {
            export: false,
            import: false,
            settings: false,
            about: false,
        },
    });

    const handleProjectChange = (updatedProject: LiveryProject) => {
        setProject(updatedProject);
        onChange?.(updatedProject);
    };

    const handleSave = () => {
        if (project) {
            onSave?.(project);
        }
    };

    const handleExport = (blob: Blob, filename: string) => {
        onExport?.(blob, filename);
    };

    return (
        <div
            className={`livery-editor ${className}`}
            style={{ height }}
        >
            <EditorLayout
                project={project}
                uiState={uiState}
                onProjectChange={handleProjectChange}
                onUIStateChange={setUIState}
                onSave={handleSave}
                onExport={handleExport}
            />
        </div>
    );
}

// Export the component as default for easier imports
export default LiveryEditor;
