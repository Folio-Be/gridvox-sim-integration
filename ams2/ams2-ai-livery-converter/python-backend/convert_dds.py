"""
Convert DDS livery files to PNG for preview/analysis
Uses Pillow with DDS plugin support
"""

from pathlib import Path
from PIL import Image
import sys

def convert_dds_to_png(dds_path: Path, output_path: Path = None) -> Path:
    """
    Convert a single DDS file to PNG
    
    Args:
        dds_path: Path to source DDS file
        output_path: Optional output path (defaults to same name with .png)
    
    Returns:
        Path to created PNG file
    """
    if not dds_path.exists():
        raise FileNotFoundError(f"DDS file not found: {dds_path}")
    
    # Default output: same location, .png extension
    if output_path is None:
        output_path = dds_path.with_suffix('.png')
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # Open DDS file
        with Image.open(dds_path) as img:
            # Convert to RGBA if needed
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Save as PNG
            img.save(output_path, 'PNG')
            
        print(f"✓ {dds_path.name} → {output_path.name}")
        return output_path
        
    except Exception as e:
        print(f"✗ Failed to convert {dds_path.name}: {e}")
        raise

def convert_directory(input_dir: Path, output_dir: Path = None, recursive: bool = True) -> list[Path]:
    """
    Convert all DDS files in a directory
    
    Args:
        input_dir: Directory containing DDS files
        output_dir: Output directory (defaults to input_dir)
        recursive: Search subdirectories
    
    Returns:
        List of created PNG file paths
    """
    if not input_dir.exists():
        raise FileNotFoundError(f"Directory not found: {input_dir}")
    
    # Find all DDS files
    pattern = "**/*.dds" if recursive else "*.dds"
    dds_files = list(input_dir.glob(pattern))
    
    if not dds_files:
        print(f"No DDS files found in {input_dir}")
        return []
    
    print(f"Found {len(dds_files)} DDS files")
    
    converted = []
    failed = []
    
    for dds_file in dds_files:
        try:
            if output_dir:
                # Preserve relative directory structure
                rel_path = dds_file.relative_to(input_dir)
                out_path = output_dir / rel_path.with_suffix('.png')
            else:
                out_path = dds_file.with_suffix('.png')
            
            png_file = convert_dds_to_png(dds_file, out_path)
            converted.append(png_file)
            
        except Exception as e:
            failed.append((dds_file, str(e)))
    
    # Summary
    print("\n" + "=" * 60)
    print(f"✓ Converted: {len(converted)}")
    if failed:
        print(f"✗ Failed: {len(failed)}")
        for dds_file, error in failed:
            print(f"  - {dds_file.name}: {error}")
    print("=" * 60)
    
    return converted

def main():
    """CLI entry point"""
    if len(sys.argv) < 2:
        print("Usage: python convert_dds.py <input_dir> [output_dir]")
        print("\nExample:")
        print("  python convert_dds.py examples/gt4_skins")
        print("  python convert_dds.py examples/gt4_skins output/liveries_png")
        sys.exit(1)
    
    input_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else None
    
    print("=" * 60)
    print("DDS to PNG Converter")
    print("=" * 60)
    print(f"Input: {input_dir}")
    if output_dir:
        print(f"Output: {output_dir}")
    else:
        print(f"Output: In-place conversion")
    print("=" * 60)
    
    converted = convert_directory(input_dir, output_dir, recursive=True)
    
    if converted:
        print(f"\n✓ Successfully converted {len(converted)} files")
        print(f"\nFirst few outputs:")
        for png_file in converted[:5]:
            print(f"  - {png_file}")
        if len(converted) > 5:
            print(f"  ... and {len(converted) - 5} more")

if __name__ == "__main__":
    main()
