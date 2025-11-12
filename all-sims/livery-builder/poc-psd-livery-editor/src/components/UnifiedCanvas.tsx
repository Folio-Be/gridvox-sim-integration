import { useEffect, useRef, useState } from "react";

interface UnifiedCanvasProps {
  imageData: ImageData | null;
}

export function UnifiedCanvas({ imageData }: UnifiedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size to image dimensions
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    // Draw the image
    ctx.putImageData(imageData, 0, 0);
  }, [imageData]);

  const handleExportPNG = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `livery_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 2.0));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const handleResetZoom = () => setScale(1.0);

  if (!imageData) {
    return (
      <div className="unified-canvas-placeholder">
        <p>Load a PSD or TGA file to begin editing</p>
      </div>
    );
  }

  return (
    <div className="unified-canvas-editor">
      <div className="controls">
        <div className="control-group">
          <label>Zoom:</label>
          <button onClick={handleZoomOut}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn}>+</button>
          <button onClick={handleResetZoom}>Reset</button>
        </div>

        <div className="control-group">
          <span>
            {imageData.width}×{imageData.height}
          </span>
        </div>

        <button onClick={handleExportPNG}>Export PNG</button>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}
