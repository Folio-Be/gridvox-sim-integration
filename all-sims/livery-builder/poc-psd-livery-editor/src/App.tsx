import { useState } from "react";
import "./App.css";
import { PSDLoader } from "./components/PSDLoader";
import { TGALoader } from "./components/TGALoader";
import { LiveryCanvas } from "./components/LiveryCanvas";
import { UnifiedCanvas } from "./components/UnifiedCanvas";

type FileType = "psd" | "tga" | null;

function App() {
  const [fileType, setFileType] = useState<FileType>(null);
  const [psd, setPsd] = useState<any>(null);
  const [tgaImageData, setTgaImageData] = useState<ImageData | null>(null);
  const [error, setError] = useState<string>("");

  const handlePSDLoad = (loadedPsd: any) => {
    setPsd(loadedPsd);
    setFileType("psd");
    setTgaImageData(null);
    setError("");
  };

  const handleTGALoad = (imageData: ImageData) => {
    setTgaImageData(imageData);
    setFileType("tga");
    setPsd(null);
    setError("");
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <main className="container">
      <h1>SimVox Livery Editor POC</h1>
      <p className="subtitle">
        Multi-format livery editor: PSD templates (AMS2) + TGA liveries (LMU)
      </p>

      <div className="loader-section">
        <PSDLoader onLoad={handlePSDLoad} onError={handleError} />
        <TGALoader onLoad={handleTGALoad} onError={handleError} />
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {fileType === "psd" && psd && (
        <LiveryCanvas psd={psd} />
      )}

      {fileType === "tga" && tgaImageData && (
        <UnifiedCanvas imageData={tgaImageData} />
      )}
    </main>
  );
}

export default App;
