"""
DDS Exporter Service
Handles conversion and export of generated textures to AMS2-compatible DDS format
"""

import numpy as np
from PIL import Image
from typing import Optional, Literal


class DDSExporter:
    """
    Service for exporting generated liveries as DDS files for AMS2
    
    Features (Week 6):
    - DDS format encoding (BC1, BC3, BC7 compression)
    - Proper color space handling (sRGB)
    - Mipmap generation
    - AMS2-compatible formatting
    - Quality optimization
    """
    
    def __init__(self):
        """Initialize DDS exporter"""
        # TODO: Will use pydds or similar library in Week 6
        pass
    
    def export_to_dds(
        self,
        texture: np.ndarray,
        output_path: str,
        compression: Literal["BC1", "BC3", "BC7"] = "BC3",
        generate_mipmaps: bool = True,
        srgb: bool = True
    ) -> bool:
        """
        Export texture to DDS file
        
        Args:
            texture: Input texture as numpy array (RGB or RGBA)
            output_path: Output file path (.dds)
            compression: DDS compression format
                - BC1: No alpha, 4:1 compression (smallest)
                - BC3: With alpha, 4:1 compression (recommended)
                - BC7: Best quality, 4:1 compression (slowest)
            generate_mipmaps: Whether to generate mipmap chain
            srgb: Use sRGB color space (recommended for AMS2)
            
        Returns:
            True if export successful, False otherwise
        """
        # TODO: Implement DDS export in Week 6
        # For now, save as PNG
        try:
            img = Image.fromarray(texture)
            png_path = output_path.replace('.dds', '.png')
            img.save(png_path)
            print(f"Saved as PNG (DDS export coming in Week 6): {png_path}")
            return True
        except Exception as e:
            print(f"Export failed: {e}")
            return False
    
    def validate_for_ams2(self, texture: np.ndarray) -> dict:
        """
        Validate texture meets AMS2 requirements
        
        Args:
            texture: Input texture
            
        Returns:
            Validation results dict with issues and recommendations
        """
        issues = []
        warnings = []
        
        height, width = texture.shape[:2]
        
        # Check power-of-two dimensions
        if not self._is_power_of_two(width) or not self._is_power_of_two(height):
            issues.append(f"Dimensions must be power of 2 (current: {width}x{height})")
        
        # Check if square
        if width != height:
            warnings.append(f"Non-square texture ({width}x{height}) - may cause issues")
        
        # Check recommended size (4096x4096 for high-quality liveries)
        if width < 2048 or height < 2048:
            warnings.append(f"Resolution below recommended 2048x2048 (current: {width}x{height})")
        
        # Check maximum size
        if width > 4096 or height > 4096:
            warnings.append("Resolution above 4096x4096 may impact performance")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "recommended_size": "4096x4096",
            "recommended_format": "BC3 (DXT5)"
        }
    
    def _is_power_of_two(self, n: int) -> bool:
        """Check if number is power of 2"""
        return n > 0 and (n & (n - 1)) == 0
    
    def generate_mipmaps(self, texture: np.ndarray, num_levels: Optional[int] = None) -> list:
        """
        Generate mipmap chain for texture
        
        Args:
            texture: Base texture (level 0)
            num_levels: Number of mipmap levels (None = auto calculate)
            
        Returns:
            List of mipmap textures from largest to smallest
        """
        mipmaps = [texture]
        
        if num_levels is None:
            # Auto-calculate levels based on size
            size = max(texture.shape[:2])
            num_levels = int(np.log2(size)) + 1
        
        current = texture
        for i in range(1, num_levels):
            # Downsample by 2
            h, w = current.shape[:2]
            if h <= 1 or w <= 1:
                break
            
            new_h, new_w = max(1, h // 2), max(1, w // 2)
            img = Image.fromarray(current)
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            current = np.array(img)
            mipmaps.append(current)
        
        return mipmaps
    
    def optimize_for_ams2(self, texture: np.ndarray) -> np.ndarray:
        """
        Optimize texture for AMS2 (resize, color space conversion, etc.)
        
        Args:
            texture: Input texture
            
        Returns:
            Optimized texture
        """
        # Ensure power-of-two dimensions
        h, w = texture.shape[:2]
        target_size = self._nearest_power_of_two(max(h, w))
        
        if h != target_size or w != target_size:
            img = Image.fromarray(texture)
            img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
            texture = np.array(img)
        
        return texture
    
    def _nearest_power_of_two(self, n: int) -> int:
        """Find nearest power of 2"""
        if n <= 0:
            return 1
        
        power = 1
        while power < n:
            power *= 2
        
        # Return closest (current or previous)
        if power - n < n - power // 2:
            return power
        else:
            return power // 2
