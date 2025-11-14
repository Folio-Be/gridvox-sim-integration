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

export type {
  LiveryProject,
  LiveryTexture,
  TextureType,
  TextureFormat,
  ProjectMetadata,
} from './types';
