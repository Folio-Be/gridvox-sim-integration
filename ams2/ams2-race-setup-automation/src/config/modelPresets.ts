export type ModelKind = 'llm' | 'vision' | 'tts' | 'stt';

export interface ModelDescriptor {
  id: string;
  kind: ModelKind;
  name: string;
  quantization: string;
  vramGb: number;
  downloadUri: string;
  sha256: string;
  notes?: string;
}

export interface TierPreset {
  tier: 'tier-3' | 'tier-2' | 'tier-1';
  label: string;
  minVramGb: number;
  minRamGb: number;
  minCpuThreads: number;
  defaultModels: ModelDescriptor[];
}

export const MODEL_PRESETS: TierPreset[] = [
  {
    tier: 'tier-3',
    label: 'Enthusiast (>=24 GB VRAM)',
    minVramGb: 24,
    minRamGb: 32,
    minCpuThreads: 16,
    defaultModels: [
      {
        id: 'qwen3-vl-32b',
        kind: 'vision',
        name: 'Qwen3-VL-32B Instruct',
        quantization: 'fp16',
        vramGb: 20,
        downloadUri: 'https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct',
        sha256: 'placeholder',
        notes: 'Full vision+reasoning without swapping',
      },
      {
        id: 'omniparser-v2',
        kind: 'vision',
        name: 'OmniParser v2 detector',
        quantization: 'fp16',
        vramGb: 3,
        downloadUri: 'https://huggingface.co/microsoft/OmniParser-v2.0',
        sha256: 'placeholder',
      },
      {
        id: 'whisper-large-v3',
        kind: 'stt',
        name: 'Whisper Large V3',
        quantization: 'fp16',
        vramGb: 4,
        downloadUri: 'https://huggingface.co/openai/whisper-large-v3',
        sha256: 'placeholder',
      },
      {
        id: 'neural-tts-xxl',
        kind: 'tts',
        name: 'Neural TTS XXL',
        quantization: 'fp16',
        vramGb: 2,
        downloadUri: 'https://example.com/tts-xxl',
        sha256: 'placeholder',
      },
    ],
  },
  {
    tier: 'tier-2',
    label: 'Performance (10–16 GB VRAM)',
    minVramGb: 10,
    minRamGb: 16,
    minCpuThreads: 12,
    defaultModels: [
      {
        id: 'qwen3-vl-8b-q4',
        kind: 'vision',
        name: 'Qwen3-VL-8B Instruct',
        quantization: 'q4_k_m',
        vramGb: 6.5,
        downloadUri: 'https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-GGUF',
        sha256: 'placeholder',
        notes: 'Primary reasoning for AMS2 automation on RTX 3060',
      },
      {
        id: 'paddleocr-ppv4',
        kind: 'vision',
        name: 'PaddleOCR PP-OCRv4',
        quantization: 'fp32',
        vramGb: 0.5,
        downloadUri: 'https://github.com/PaddlePaddle/PaddleOCR',
        sha256: 'N/A',
        notes: 'Runs on CPU; assists layout parsing',
      },
      {
        id: 'whisper-medium',
        kind: 'stt',
        name: 'Whisper Medium',
        quantization: 'fp16',
        vramGb: 2.5,
        downloadUri: 'https://huggingface.co/openai/whisper-medium',
        sha256: 'placeholder',
      },
      {
        id: 'bark-small',
        kind: 'tts',
        name: 'Bark Small',
        quantization: 'fp16',
        vramGb: 1,
        downloadUri: 'https://huggingface.co/suno/bark-small',
        sha256: 'placeholder',
      },
    ],
  },
  {
    tier: 'tier-1',
    label: 'Baseline (≤8 GB VRAM)',
    minVramGb: 0,
    minRamGb: 12,
    minCpuThreads: 8,
    defaultModels: [
      {
        id: 'paddleocr-cpu',
        kind: 'vision',
        name: 'PaddleOCR CPU',
        quantization: 'fp32',
        vramGb: 0,
        downloadUri: 'https://github.com/PaddlePaddle/PaddleOCR',
        sha256: 'N/A',
      },
      {
        id: 'template-matcher',
        kind: 'vision',
        name: 'Template Matcher',
        quantization: 'N/A',
        vramGb: 0,
        downloadUri: 'local',
        sha256: 'local',
      },
      {
        id: 'whisper-small',
        kind: 'stt',
        name: 'Whisper Small',
        quantization: 'fp16',
        vramGb: 1,
        downloadUri: 'https://huggingface.co/openai/whisper-small',
        sha256: 'placeholder',
      },
      {
        id: 'vits-light',
        kind: 'tts',
        name: 'VITS Light',
        quantization: 'fp16',
        vramGb: 0.5,
        downloadUri: 'https://example.com/vits-light',
        sha256: 'placeholder',
      },
    ],
  },
];
