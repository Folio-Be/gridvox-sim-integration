# Displaying DDS Files in Electron

AMS2 stores all thumbnails as DDS (DirectDraw Surface) texture files. Here are three ways to display them in your Electron app.

---

## Option 1: Runtime Decoding with `dds-parser` ⭐ RECOMMENDED

**Best for**: Direct access, no pre-processing needed

### Installation

```bash
npm install dds-parser
```

### Implementation

```typescript
import { readFile } from 'fs/promises';
import { decodeDds, parseHeaders } from 'dds-parser';

/**
 * Load DDS file and convert to RGBA data that can be drawn to canvas
 */
async function loadDDSToCanvas(ddsPath: string, canvas: HTMLCanvasElement) {
  // Read DDS file
  const buffer = await readFile(ddsPath);
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );

  // Parse DDS headers
  const info = parseHeaders(arrayBuffer);
  const image = info.images[0]; // Get first mipmap level

  // Decode DDS to RGBA
  const rgba = decodeDds(
    arrayBuffer.slice(image.offset, image.offset + image.length),
    info.format,
    image.shape.width,
    image.shape.height
  );

  // Draw to canvas
  const ctx = canvas.getContext('2d');
  canvas.width = image.shape.width;
  canvas.height = image.shape.height;

  const imageData = ctx.createImageData(image.shape.width, image.shape.height);
  imageData.data.set(rgba);
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Load DDS and return as data URL for <img> src
 */
async function loadDDSToDataURL(ddsPath: string): Promise<string> {
  const canvas = document.createElement('canvas');
  await loadDDSToCanvas(ddsPath, canvas);
  return canvas.toDataURL('image/png');
}
```

### Usage in React Component

```tsx
import { useState, useEffect } from 'react';

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  useEffect(() => {
    if (vehicle.thumbnail) {
      loadDDSToDataURL(vehicle.thumbnail).then(setThumbnailUrl);
    }
  }, [vehicle.thumbnail]);

  return (
    <div className="vehicle-card">
      {thumbnailUrl && <img src={thumbnailUrl} alt={vehicle.displayName} />}
      <h3>{vehicle.displayName}</h3>
      <p>{vehicle.vehicleClass}</p>
    </div>
  );
}
```

**Pros**:
- ✅ No pre-processing needed
- ✅ Direct file access
- ✅ Works with any DDS format
- ✅ Pure JavaScript

**Cons**:
- ❌ Decode overhead on each load
- ❌ Not cached (use React state/cache layer)

---

## Option 2: Pre-Convert to PNG/WebP during Scan

**Best for**: Performance, one-time conversion

### Installation

```bash
# ImageMagick (Windows)
choco install imagemagick

# Or npm package
npm install imagemagick
```

### Implementation

Add to `thumbnail-converter.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const execAsync = promisify(exec);

export class ThumbnailConverter {
  // ... existing code ...

  /**
   * Convert DDS to PNG using ImageMagick
   */
  async convertDDSToPNG(ddsPath: string, outputDir: string): Promise<string> {
    const filename = basename(ddsPath, '.dds') + '.png';
    const outputPath = join(outputDir, filename);

    // Skip if already converted
    if (existsSync(outputPath)) {
      return outputPath;
    }

    // Create output directory
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Convert using ImageMagick
    try {
      await execAsync(`magick convert "${ddsPath}" "${outputPath}"`);
      console.log(`Converted: ${filename}`);
      return outputPath;
    } catch (error) {
      console.error(`Failed to convert ${ddsPath}:`, error);
      throw error;
    }
  }

  /**
   * Convert all thumbnails to PNG
   */
  async convertAllThumbnails(): Promise<{
    trackLogos: Map<string, string>;
    trackPhotos: Map<string, string>;
    classLogos: Map<string, string>;
  }> {
    const outputDir = join(this.installPath, '..', 'ams2-thumbnails-png');

    // Find all DDS files
    const trackLogos = await this.findTrackLogos();
    const trackPhotos = await this.findTrackPhotos();
    const classLogos = await this.findVehicleClassLogos();

    // Convert all
    const convertedTrackLogos = new Map<string, string>();
    const convertedTrackPhotos = new Map<string, string>();
    const convertedClassLogos = new Map<string, string>();

    console.log('Converting track logos...');
    for (const [id, ddsPath] of trackLogos) {
      const pngPath = await this.convertDDSToPNG(ddsPath, join(outputDir, 'tracklogos'));
      convertedTrackLogos.set(id, pngPath);
    }

    console.log('Converting track photos...');
    for (const [id, ddsPath] of trackPhotos) {
      const pngPath = await this.convertDDSToPNG(ddsPath, join(outputDir, 'trackphotos'));
      convertedTrackPhotos.set(id, pngPath);
    }

    console.log('Converting class logos...');
    for (const [id, ddsPath] of classLogos) {
      const pngPath = await this.convertDDSToPNG(ddsPath, join(outputDir, 'classlogos'));
      convertedClassLogos.set(id, pngPath);
    }

    return { trackLogos: convertedTrackLogos, trackPhotos: convertedTrackPhotos, classLogos: convertedClassLogos };
  }
}
```

### Usage in CLI

```typescript
// In cli.ts, add conversion step
const thumbnailConverter = new ThumbnailConverter(installPath);
const converted = await thumbnailConverter.convertAllThumbnails();

// Update database with PNG paths instead of DDS
for (const track of result.database.tracks) {
  const pngLogo = converted.trackLogos.get(track.id);
  if (pngLogo) track.thumbnail = pngLogo;
}
```

**Pros**:
- ✅ Fast display (native image format)
- ✅ One-time conversion
- ✅ No runtime overhead
- ✅ Works everywhere

**Cons**:
- ❌ Requires ImageMagick installed
- ❌ Extra disk space (~20MB)
- ❌ Pre-processing step

---

## Option 3: UTEX.js (Lightweight)

**Best for**: Minimal dependencies, BC1/BC3/BC7 formats

### Installation

```bash
npm install utex
# or just copy UTEX.js (single file)
```

### Implementation

```typescript
import UTEX from 'utex';

async function loadDDSWithUTEX(ddsPath: string): Promise<ImageData> {
  const buffer = await readFile(ddsPath);
  const arrayBuffer = buffer.buffer;

  // Parse DDS
  const dds = UTEX.parseDDS(arrayBuffer);

  // Decompress first mipmap
  const rgba = UTEX.decode(
    dds.data,
    dds.width,
    dds.height,
    dds.format
  );

  return new ImageData(
    new Uint8ClampedArray(rgba),
    dds.width,
    dds.height
  );
}
```

**Pros**:
- ✅ Tiny library (~3KB)
- ✅ Fast decompression
- ✅ Pure JavaScript

**Cons**:
- ❌ Limited format support (BC1, BC2, BC3, BC7)
- ❌ May not support all AMS2 DDS variants

---

## Recommended Approach for SimVox.ai

### Phase 1: Quick Start (Option 1)

Use `dds-parser` for immediate functionality:

```bash
npm install dds-parser
```

Create `src/dds-loader.ts` with the runtime decoder above.

### Phase 2: Optimization (Option 2)

Add ImageMagick conversion to the scan process:

```bash
npm run scan          # Scan + convert thumbnails
npm run scan --no-convert  # Scan only
```

Store PNG paths in database for instant loading.

---

## Performance Comparison

| Method | Initial Load | Subsequent Loads | Disk Space | Setup |
|--------|-------------|------------------|------------|-------|
| dds-parser | ~50ms/image | ~50ms/image | 0MB | npm install |
| ImageMagick | N/A | <1ms/image | +20MB | System install |
| UTEX.js | ~30ms/image | ~30ms/image | 0MB | npm install |

---

## Sample Implementation

Here's a complete React hook for DDS loading:

```typescript
import { useState, useEffect } from 'react';
import { decodeDds, parseHeaders } from 'dds-parser';
import { readFile } from 'fs/promises';

/**
 * React hook to load DDS file as data URL
 */
export function useDDSImage(ddsPath: string | undefined) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ddsPath) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const buffer = await readFile(ddsPath);
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        );

        const info = parseHeaders(arrayBuffer);
        const image = info.images[0];

        const rgba = decodeDds(
          arrayBuffer.slice(image.offset, image.offset + image.length),
          info.format,
          image.shape.width,
          image.shape.height
        );

        if (cancelled) return;

        // Convert to canvas and data URL
        const canvas = document.createElement('canvas');
        canvas.width = image.shape.width;
        canvas.height = image.shape.height;

        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(image.shape.width, image.shape.height);
        imageData.data.set(rgba);
        ctx.putImageData(imageData, 0, 0);

        const url = canvas.toDataURL('image/png');
        setDataUrl(url);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [ddsPath]);

  return { dataUrl, loading, error };
}

// Usage
function VehicleThumbnail({ vehicle }: { vehicle: Vehicle }) {
  const { dataUrl, loading, error } = useDDSImage(vehicle.thumbnail);

  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error">Failed to load</div>;
  if (!dataUrl) return <div className="placeholder">No image</div>;

  return <img src={dataUrl} alt={vehicle.displayName} />;
}
```

---

## Next Steps

1. **Install dds-parser**: `npm install dds-parser`
2. **Create DDS loader utility**: Copy code above to `src/dds-loader.ts`
3. **Test with single thumbnail**: Load one vehicle class logo
4. **Add caching layer**: Store decoded images in memory/localStorage
5. **Optimize**: Consider pre-conversion for production builds

Would you like me to implement the runtime DDS decoder in the project now?
