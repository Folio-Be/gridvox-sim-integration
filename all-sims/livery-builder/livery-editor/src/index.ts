/**
 * SimVox Livery Editor - React Component Module
 * 
 * A production-ready racing livery editor for the SimVox MVP.
 * Can be used standalone or integrated into larger applications.
 * 
 * @module @simvox/livery-editor
 */

// Main Component
export { LiveryEditor, type LiveryEditorProps } from './components/LiveryEditor';
export { default } from './components/LiveryEditor';

// Type Exports
export type {
    LiveryProject,
    LiveryTexture,
    TextureType,
    TextureFormat,
    ProjectMetadata,
    Layer,
    LayerType,
    LayerData,
    BlendMode,
    Tool,
    ToolState,
    Command,
    CommandHistory,
    CanvasState,
    CanvasSelection,
    ReferenceImage,
    ExportSettings,
    VoiceCommand,
    VoiceState,
    UIState,
} from './types';

// Component Exports (for advanced usage)
export { EditorLayout } from './components/layout/EditorLayout';
export { TitleBar } from './components/layout/TitleBar';
export { MenuBar } from './components/layout/MenuBar';
export { TextureTabs } from './components/layout/TextureTabs';
export { ToolbarPanel } from './components/panels/ToolbarPanel';
export { PropertiesPanel } from './components/panels/PropertiesPanel';
export { LayersPanel } from './components/panels/LayersPanel';
