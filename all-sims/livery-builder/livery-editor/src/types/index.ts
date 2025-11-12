/**
 * Core type definitions for SimVox Livery Editor
 */

// ============================================================================
// Livery Project Types
// ============================================================================

export interface LiveryProject {
    id: string;
    name: string;
    simulator: string; // "ams2" | "ac" | "acc" | etc.
    car: string;
    textures: LiveryTexture[];
    metadata: ProjectMetadata;
    createdAt: Date;
    updatedAt: Date;
}

export interface LiveryTexture {
    id: string;
    name: string; // "car_body.dds", "windows.dds", etc.
    type: TextureType;
    width: number;
    height: number;
    format: TextureFormat;
    layers: Layer[];
    thumbnail?: string; // base64 or URL
}

export type TextureType =
    | "body"
    | "windows"
    | "wheels"
    | "decals"
    | "numbers"
    | "windshield"
    | "other";

export type TextureFormat = "DDS" | "TGA" | "PNG" | "PSD";

export interface ProjectMetadata {
    author?: string;
    team?: string;
    season?: string;
    tags?: string[];
    description?: string;
}

// ============================================================================
// Layer System
// ============================================================================

export interface Layer {
    id: string;
    name: string;
    type: LayerType;
    visible: boolean;
    locked: boolean;
    opacity: number; // 0-100
    blendMode: BlendMode;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number; // degrees
    scaleX: number;
    scaleY: number;
    data?: LayerData;
    thumbnail?: string;
}

export type LayerType =
    | "image"
    | "shape"
    | "text"
    | "fill"
    | "gradient"
    | "group";

export type BlendMode =
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion";

export interface LayerData {
    // Image layer
    imageUrl?: string;
    imageData?: ImageData;

    // Shape layer
    shapeType?: "rectangle" | "circle" | "polygon" | "custom";
    fill?: string;
    stroke?: string;
    strokeWidth?: number;

    // Text layer
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: string;
    color?: string;

    // Gradient layer
    gradientType?: "linear" | "radial";
    gradientStops?: GradientStop[];
}

export interface GradientStop {
    offset: number; // 0-1
    color: string;
}

// ============================================================================
// Tool System
// ============================================================================

export type Tool =
    | "select"
    | "move"
    | "marquee"
    | "lasso"
    | "magic-wand"
    | "brush"
    | "pencil"
    | "eraser"
    | "fill"
    | "gradient"
    | "text"
    | "shape"
    | "eyedropper"
    | "hand"
    | "zoom";

export interface ToolState {
    activeTool: Tool;
    brushSize: number;
    brushHardness: number;
    brushOpacity: number;
    eraserSize: number;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
}

// ============================================================================
// Command Pattern (Undo/Redo)
// ============================================================================

export interface Command {
    id: string;
    type: string;
    timestamp: Date;
    textureId: string;
    execute(): void;
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;

    // Voice command metadata
    voicePhrase?: string;
    isContinuous?: boolean;
}

export interface CommandHistory {
    past: Command[];
    future: Command[];
    maxHistory: number;
}

// ============================================================================
// Canvas State
// ============================================================================

export interface CanvasState {
    zoom: number; // 0.1 - 10.0
    panX: number;
    panY: number;
    gridEnabled: boolean;
    gridSize: number;
    snapToGrid: boolean;
    guidesVisible: boolean;
    rulers: boolean;
    wireframeMode: boolean;
    sponsorZonesVisible: boolean;
}

export interface CanvasSelection {
    layerIds: string[];
    bounds?: SelectionBounds;
}

export interface SelectionBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ============================================================================
// Reference Images
// ============================================================================

export interface ReferenceImage {
    id: string;
    name: string;
    url: string;
    width: number;
    height: number;
    opacity: number; // 0-100
    alwaysOnTop: boolean;
    thumbnail?: string;
}

// ============================================================================
// Export Settings
// ============================================================================

export interface ExportSettings {
    format: TextureFormat;
    quality: number; // 0-100
    includeAlpha: boolean;
    compression: "none" | "dxt1" | "dxt5" | "bc7";
    generateMipmaps: boolean;
    outputPath?: string;
}

// ============================================================================
// Voice Command Types
// ============================================================================

export interface VoiceCommand {
    id: string;
    phrase: string;
    transcript: string;
    confidence: number;
    timestamp: Date;
    executed: boolean;
    result?: CommandExecutionResult;
}

export interface CommandExecutionResult {
    success: boolean;
    message: string;
    commandId?: string;
}

export interface VoiceState {
    isListening: boolean;
    isProcessing: boolean;
    currentTranscript: string;
    lastCommand?: VoiceCommand;
    history: VoiceCommand[];
}

// ============================================================================
// UI State
// ============================================================================

export interface UIState {
    activeTextureId: string | null;
    selectedLayerIds: string[];
    toolState: ToolState;
    canvasState: CanvasState;
    commandHistory: CommandHistory;
    voiceState: VoiceState;

    // Panel visibility
    panels: {
        toolbar: boolean;
        properties: boolean;
        layers: boolean;
        reference: boolean;
        voice: boolean;
        sponsorLibrary: boolean;
    };

    // Modal states
    modals: {
        export: boolean;
        import: boolean;
        settings: boolean;
        about: boolean;
    };
}
