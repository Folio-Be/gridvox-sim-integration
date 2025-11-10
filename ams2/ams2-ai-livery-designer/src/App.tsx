import { useState } from "react";
import "./App.css";

interface UploadedImage {
  file: File;
  preview: string;
  angle: "front" | "side" | "rear" | "3/4" | "unknown";
}

function App() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>("Porsche_992_GT3R");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          angle: "unknown",
        });
      }
    });

    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    const newImages: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          angle: "unknown",
        });
      }
    });

    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const updateAngle = (index: number, angle: UploadedImage["angle"]) => {
    const newImages = [...uploadedImages];
    newImages[index].angle = angle;
    setUploadedImages(newImages);
  };

  const generateLivery = async () => {
    if (uploadedImages.length === 0) {
      setStatusMessage("Please upload at least one photo");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Processing images and generating livery...");

    // TODO: Integrate with Python backend
    setTimeout(() => {
      setIsProcessing(false);
      setStatusMessage("Generation complete! (Mock - not yet implemented)");
    }, 3000);
  };

  return (
    <div className="container">
      <header>
        <h1>🎨 AMS2 AI Livery Designer</h1>
        <p className="subtitle">POC Phase 1 - AI-Powered Livery Generation</p>
      </header>

      <div className="main-content">
        {/* Car Selection */}
        <section className="section">
          <h2>1. Select Test Car</h2>
          <div className="car-selector">
            <label>
              <input
                type="radio"
                value="Porsche_992_GT3R"
                checked={selectedCar === "Porsche_992_GT3R"}
                onChange={(e) => setSelectedCar(e.target.value)}
              />
              <div className="car-option">
                <span className="car-name">Porsche 992 GT3 R</span>
                <span className="car-class">GT3_Gen2</span>
              </div>
            </label>
            <label>
              <input
                type="radio"
                value="McLaren_720S_GT3_Evo"
                checked={selectedCar === "McLaren_720S_GT3_Evo"}
                onChange={(e) => setSelectedCar(e.target.value)}
              />
              <div className="car-option">
                <span className="car-name">McLaren 720S GT3 Evo</span>
                <span className="car-class">GT3_Gen2</span>
              </div>
            </label>
            <label>
              <input
                type="radio"
                value="BMW_M4_GT3"
                checked={selectedCar === "BMW_M4_GT3"}
                onChange={(e) => setSelectedCar(e.target.value)}
              />
              <div className="car-option">
                <span className="car-name">BMW M4 GT3</span>
                <span className="car-class">GT3_Gen2</span>
              </div>
            </label>
          </div>
        </section>

        {/* Photo Upload */}
        <section className="section">
          <h2>2. Upload Reference Photos</h2>
          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <p>📸 Drag & drop photos here or click to browse</p>
            <p className="hint">
              Upload photos of real race cars from various angles
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="file-input"
            />
            <label htmlFor="file-input" className="upload-button">
              Choose Files
            </label>
          </div>

          {uploadedImages.length > 0 && (
            <div className="uploaded-images">
              <h3>Uploaded Photos ({uploadedImages.length})</h3>
              <div className="image-grid">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="image-item">
                    <img src={img.preview} alt={`Upload ${index + 1}`} />
                    <select
                      value={img.angle}
                      onChange={(e) =>
                        updateAngle(
                          index,
                          e.target.value as UploadedImage["angle"]
                        )
                      }
                      className="angle-selector"
                    >
                      <option value="unknown">Unknown Angle</option>
                      <option value="front">Front</option>
                      <option value="side">Side</option>
                      <option value="rear">Rear</option>
                      <option value="3/4">3/4 View</option>
                    </select>
                    <button
                      onClick={() => removeImage(index)}
                      className="remove-button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Generation Controls */}
        <section className="section">
          <h2>3. Generate Livery</h2>
          <button
            className="generate-button"
            onClick={generateLivery}
            disabled={isProcessing || uploadedImages.length === 0}
          >
            {isProcessing ? "⚙️ Processing..." : "🚀 Generate AI Livery"}
          </button>

          {statusMessage && (
            <div className={`status-message ${isProcessing ? "processing" : "complete"}`}>
              {statusMessage}
            </div>
          )}

          <div className="info-box">
            <h4>POC Stage 1 - Features</h4>
            <ul>
              <li>✅ Photo upload with drag & drop</li>
              <li>✅ Multi-angle photo support</li>
              <li>✅ 3 GT3 test cars (Porsche, McLaren, BMW)</li>
              <li>⏳ Background removal (SAM) - Coming soon</li>
              <li>⏳ SDXL + ControlNet generation - Coming soon</li>
              <li>⏳ UV space projection - Coming soon</li>
              <li>⏳ DDS export for AMS2 - Coming soon</li>
            </ul>
          </div>
        </section>

        {/* Progress Tracker */}
        <section className="section">
          <h2>📋 Phase 1 Progress</h2>
          <div className="progress-tracker">
            <div className="progress-item complete">
              <span className="progress-icon">✅</span>
              <span>Week 1-2: Environment Setup</span>
            </div>
            <div className="progress-item in-progress">
              <span className="progress-icon">🔄</span>
              <span>Week 3-4: Asset Extraction</span>
            </div>
            <div className="progress-item">
              <span className="progress-icon">⏳</span>
              <span>Week 5-6: Pipeline Development</span>
            </div>
            <div className="progress-item">
              <span className="progress-icon">⏳</span>
              <span>Week 7-8: Quality Assessment</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
