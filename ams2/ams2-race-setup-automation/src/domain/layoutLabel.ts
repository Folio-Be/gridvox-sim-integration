export interface LayoutElementLabel {
  label: string;
  text?: string;
  bbox: [number, number, number, number];
  interactable?: boolean;
}

export interface LayoutLabelRecord {
  screenshot: string;
  capturedAt: string;
  resolution: [number, number];
  elements: LayoutElementLabel[];
}
