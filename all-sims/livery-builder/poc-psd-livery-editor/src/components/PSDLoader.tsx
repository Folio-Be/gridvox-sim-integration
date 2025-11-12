import Psd from '@webtoon/psd';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

interface PSDLoaderProps {
  onLoad: (psd: any) => void;
  onError: (error: string) => void;
}

export function PSDLoader({ onLoad, onError }: PSDLoaderProps) {
  const handleLoadPSD = async () => {
    try {
      // Open file dialog
      const selected = await open({
        title: 'Select PSD Template',
        multiple: false,
        filters: [{
          name: 'Photoshop Files',
          extensions: ['psd', 'psb']
        }]
      });

      if (!selected) return;

      console.log('Loading PSD:', selected);

      // Read file as bytes
      const fileData = await readFile(selected as string);

      // Convert to ArrayBuffer
      const arrayBuffer = fileData.buffer.slice(
        fileData.byteOffset,
        fileData.byteOffset + fileData.byteLength
      );

      // Parse PSD
      console.log('Parsing PSD...');
      const psd = Psd.parse(arrayBuffer);

      console.log(`PSD loaded: ${psd.width}x${psd.height}, ${psd.layers.length} layers`);

      // Log all layer names
      for (const layer of psd.layers) {
        console.log(`  - Layer: ${layer.name}`);
      }

      onLoad(psd);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error loading PSD:', errorMsg);
      onError(errorMsg);
    }
  };

  return (
    <div className="psd-loader">
      <button onClick={handleLoadPSD} className="load-button">
        📁 Load PSD Template
      </button>
      <p className="hint">Select an AMS2 PSD template (BMW M4 GT3, Alpine A424, etc.)</p>
    </div>
  );
}
