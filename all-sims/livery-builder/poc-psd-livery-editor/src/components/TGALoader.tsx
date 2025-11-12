import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
// @ts-ignore - tga-js doesn't have TypeScript definitions
import TGA from "tga-js";

interface TGALoaderProps {
  onLoad: (imageData: ImageData) => void;
  onError: (error: string) => void;
}

export function TGALoader({ onLoad, onError }: TGALoaderProps) {
  const handleLoadTGA = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "TGA Image",
            extensions: ["tga"],
          },
        ],
      });

      if (!selected) {
        return;
      }

      console.log("Selected TGA file:", selected);

      // Read file as ArrayBuffer
      const fileData = await readFile(selected as string);
      const arrayBuffer = fileData.buffer;

      console.log("TGA file size:", arrayBuffer.byteLength, "bytes");

      // Parse TGA
      const tga = new TGA();
      tga.load(new Uint8Array(arrayBuffer));

      console.log("TGA parsed successfully");
      console.log("TGA dimensions:", tga.width, "x", tga.height);

      // Get ImageData
      const imageData = tga.getImageData();
      console.log("ImageData created:", imageData.width, "x", imageData.height);

      onLoad(imageData);
    } catch (error) {
      console.error("Failed to load TGA:", error);
      onError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <div className="tga-loader">
      <button onClick={handleLoadTGA}>Load TGA Livery</button>
      <div className="info">
        <small>Supports LMU customskin.tga files (4096x4096)</small>
      </div>
    </div>
  );
}
