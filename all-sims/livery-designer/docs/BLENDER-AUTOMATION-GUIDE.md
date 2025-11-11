# Blender Automation Guide

**Project:** GridVox AI Livery Designer
**Purpose:** Production-ready implementation guide for synthetic training data generation using Blender
**Last Updated:** January 11, 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Blender Setup](#blender-setup)
4. [Car Model Import](#car-model-import)
5. [Livery Generation Pipeline](#livery-generation-pipeline)
6. [Camera & Lighting Setup](#camera--lighting-setup)
7. [Batch Rendering](#batch-rendering)
8. [Quality Validation](#quality-validation)
9. [Performance Optimization](#performance-optimization)
10. [Complete Automation Script](#complete-automation-script)

---

## Overview

### Goal
Generate 4,800 training pairs per car for AUV-Net training:
- **Input:** Rendered photo of car (1024×1024 PNG, side view)
- **Output:** Corresponding UV texture (2048×2048 DDS, ground truth)

### Why Blender?
- ✅ Free & open source (no licensing costs)
- ✅ Python API (bpy) for full automation
- ✅ Cycles renderer (photorealistic quality)
- ✅ GPU acceleration (OptiX, CUDA)
- ✅ Large community (troubleshooting support)

### Training Data Requirements
```
Per Car Model (e.g., Porsche 992 GT3 R):
- 4,800 photo/UV pairs
- 4 camera angles × 1,000 livery variations × 1.2 lighting conditions
- Storage: ~9.6GB per car (2MB per photo + 2MB per UV texture)
- Rendering Time: 24-48 hours (RTX 4090, parallelized)
```

---

## Prerequisites

### Software Requirements

```
Required:
✅ Blender 4.0+ (LTS version recommended)
   Download: https://www.blender.org/download/lts/4-0/
✅ Python 3.11 (included with Blender)
✅ pip packages: numpy, Pillow (install in Blender's Python)

Optional:
⚠️ GMT Importer Plugin (for AMS2 .gmt files)
   Download: https://github.com/TheAdmiester/Blender-GMT-Importer
```

### Hardware Requirements

```
Minimum:
CPU: 4 cores (for Cycles CPU rendering)
RAM: 16GB
GPU: NVIDIA GTX 1660 (6GB VRAM, CUDA support)
Storage: 100GB free (for dataset)

Recommended:
CPU: 8+ cores (for parallel batch processing)
RAM: 32GB+
GPU: NVIDIA RTX 4090 (24GB VRAM, OptiX rendering)
Storage: 500GB NVMe SSD (fast I/O for batch rendering)

Performance:
- RTX 4090: 1-2 seconds per render (4,800 renders in 2-3 hours)
- RTX 3060: 5-8 seconds per render (4,800 renders in 8-10 hours)
- CPU only: 30-60 seconds per render (4,800 renders in 48+ hours)
```

---

## Blender Setup

### Installation

```bash
# Download Blender 4.0 LTS (Windows)
# Direct link: https://www.blender.org/download/release/Blender4.0/blender-4.0.2-windows-x64.msi

# Install to custom location for scripting
msiexec /i blender-4.0.2-windows-x64.msi INSTALLDIR="C:\Tools\Blender"

# Verify installation
"C:\Tools\Blender\blender.exe" --version
# Expected: Blender 4.0.2
```

### Enable GPU Rendering

```python
# enable_gpu.py - Run once to configure Blender for GPU rendering

import bpy

# Get user preferences
prefs = bpy.context.preferences
cycles_prefs = prefs.addons['cycles'].preferences

# Set compute device type to CUDA (NVIDIA) or OPTIX (RTX)
cycles_prefs.compute_device_type = 'OPTIX'  # Use 'CUDA' for older GPUs

# Enable all CUDA/OptiX devices
cycles_prefs.get_devices()
for device in cycles_prefs.devices:
    device.use = True
    print(f"Enabled: {device.name} ({device.type})")

# Save preferences
bpy.ops.wm.save_userpref()
```

**Run Setup:**
```bash
"C:\Tools\Blender\blender.exe" --background --python enable_gpu.py
```

### Install Python Packages in Blender's Python

```bash
# Blender uses its own Python interpreter
# Install packages using Blender's pip

# Windows:
"C:\Tools\Blender\4.0\python\bin\python.exe" -m pip install numpy Pillow

# Verify packages
"C:\Tools\Blender\4.0\python\bin\python.exe" -c "import numpy; import PIL; print('Packages installed!')"
```

---

## Car Model Import

### Import AMS2 GMT Models

```python
# import_gmt_car.py - Import .gmt car model into Blender

import bpy
import os

def import_gmt_car(gmt_path: str) -> bpy.types.Object:
    """
    Import AMS2 .gmt car model.

    Requires: GMT Importer addon installed
    https://github.com/TheAdmiester/Blender-GMT-Importer
    """
    # Clear scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Import GMT
    bpy.ops.import_scene.gmt(filepath=gmt_path)

    # Get imported car object (usually named after file)
    car_obj = bpy.context.selected_objects[0]

    # Center car at origin
    bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS', center='BOUNDS')
    car_obj.location = (0, 0, 0)

    # Scale to standard size (if needed)
    # Most GT3 cars are ~4.8m long, normalize to this
    dimensions = car_obj.dimensions
    if dimensions.y > 6.0:  # Car too large
        scale_factor = 4.8 / dimensions.y
        car_obj.scale = (scale_factor, scale_factor, scale_factor)

    print(f"Imported car: {car_obj.name}")
    print(f"  Vertices: {len(car_obj.data.vertices)}")
    print(f"  Faces: {len(car_obj.data.polygons)}")
    print(f"  Dimensions: {car_obj.dimensions}")

    return car_obj

# Example usage:
gmt_path = "C:\\GridVox\\training_data\\porsche_992_gt3_r\\models\\porsche_992_gt3_r.gmt"
car = import_gmt_car(gmt_path)
```

### Extract UV Layout

```python
def extract_uv_layout(car_obj: bpy.types.Object) -> dict:
    """
    Extract UV map info from car model.

    Returns: UV layout metadata (for validation during training)
    """
    mesh = car_obj.data

    if not mesh.uv_layers:
        raise ValueError(f"Car {car_obj.name} has no UV layers!")

    uv_layer = mesh.uv_layers[0]

    # Calculate UV bounds (min/max coordinates)
    uv_coords = []
    for poly in mesh.polygons:
        for loop_idx in poly.loop_indices:
            uv = uv_layer.data[loop_idx].uv
            uv_coords.append((uv.x, uv.y))

    uv_array = np.array(uv_coords)

    return {
        "uv_layer_name": uv_layer.name,
        "vertex_count": len(mesh.vertices),
        "face_count": len(mesh.polygons),
        "uv_min": uv_array.min(axis=0).tolist(),  # [0.0, 0.0] ideally
        "uv_max": uv_array.max(axis=0).tolist(),  # [1.0, 1.0] ideally
        "uv_coverage": (uv_array.max(axis=0) - uv_array.min(axis=0)).tolist()
    }
```

---

## Livery Generation Pipeline

### Procedural Livery Materials

```python
import random
from dataclasses import dataclass

@dataclass
class LiveryConfig:
    """Configuration for procedurally generated livery."""
    base_color: tuple[float, float, float]  # RGB 0-1
    accent_color: tuple[float, float, float]
    pattern: str  # "solid", "stripes", "gradient", "checkers"
    sponsor_logos: list[str]  # Paths to sponsor PNG files
    number: int  # Car number (1-999)

def generate_random_livery_config() -> LiveryConfig:
    """Generate random livery configuration for training diversity."""

    # Color palettes (realistic racing colors)
    color_palettes = [
        # Gulf Racing
        [(0.0, 0.4, 0.8), (1.0, 0.5, 0.0)],  # Blue + Orange
        # Martini Racing
        [(1.0, 1.0, 1.0), (0.0, 0.3, 0.6)],  # White + Blue
        # Castrol
        [(0.0, 0.6, 0.0), (1.0, 1.0, 1.0)],  # Green + White
        # Marlboro (historical)
        [(1.0, 0.0, 0.0), (1.0, 1.0, 1.0)],  # Red + White
        # Rothmans
        [(0.0, 0.3, 0.7), (1.0, 0.8, 0.0)],  # Blue + Gold
    ]

    palette = random.choice(color_palettes)
    base_color = palette[0]
    accent_color = palette[1]

    pattern = random.choice([
        "solid",      # 30% probability
        "stripes",    # 30%
        "gradient",   # 25%
        "checkers"    # 15%
    ])

    # Sponsor logo selection (assuming pre-downloaded PNG files)
    available_sponsors = [
        "shell.png", "mobil1.png", "castrol.png", "bbs.png",
        "enkei.png", "pirelli.png", "michelin.png", "bosch.png"
    ]
    sponsor_count = random.randint(2, 5)
    sponsors = random.sample(available_sponsors, sponsor_count)

    number = random.randint(1, 99)

    return LiveryConfig(
        base_color=base_color,
        accent_color=accent_color,
        pattern=pattern,
        sponsor_logos=sponsors,
        number=number
    )

def apply_livery_to_car(
    car_obj: bpy.types.Object,
    livery_config: LiveryConfig,
    uv_texture_output_path: str
):
    """
    Apply procedural livery to car and export UV texture.

    This function:
    1. Creates Blender material with livery colors/patterns
    2. Applies material to car
    3. Bakes texture to UV map
    4. Exports UV texture as PNG/DDS (ground truth for training)
    """

    # Create new material
    mat = bpy.data.materials.new(name="Livery_Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Clear default nodes
    nodes.clear()

    # Create nodes
    output_node = nodes.new(type='ShaderNodeOutputMaterial')
    principled_node = nodes.new(type='ShaderNodeBsdfPrincipled')
    uv_node = nodes.new(type='ShaderNodeUVMap')
    uv_node.uv_map = car_obj.data.uv_layers[0].name

    # Link UV to Principled BSDF
    links.new(uv_node.outputs['UV'], principled_node.inputs['Base Color'])

    # Set base color
    principled_node.inputs['Base Color'].default_value = (
        *livery_config.base_color, 1.0
    )

    # Add pattern (stripes, gradient, etc.)
    if livery_config.pattern == "stripes":
        wave_tex = nodes.new(type='ShaderNodeTexWave')
        wave_tex.wave_type = 'BANDS'
        wave_tex.inputs['Scale'].default_value = 10.0
        wave_tex.inputs['Distortion'].default_value = 0.0

        color_ramp = nodes.new(type='ShaderNodeValToRGB')
        color_ramp.color_ramp.elements[0].color = (*livery_config.base_color, 1.0)
        color_ramp.color_ramp.elements[1].color = (*livery_config.accent_color, 1.0)

        links.new(uv_node.outputs['UV'], wave_tex.inputs['Vector'])
        links.new(wave_tex.outputs['Fac'], color_ramp.inputs['Fac'])
        links.new(color_ramp.outputs['Color'], principled_node.inputs['Base Color'])

    elif livery_config.pattern == "gradient":
        gradient_tex = nodes.new(type='ShaderNodeTexGradient')
        gradient_tex.gradient_type = 'LINEAR'

        color_ramp = nodes.new(type='ShaderNodeValToRGB')
        color_ramp.color_ramp.elements[0].color = (*livery_config.base_color, 1.0)
        color_ramp.color_ramp.elements[1].color = (*livery_config.accent_color, 1.0)

        links.new(uv_node.outputs['UV'], gradient_tex.inputs['Vector'])
        links.new(gradient_tex.outputs['Fac'], color_ramp.inputs['Fac'])
        links.new(color_ramp.outputs['Color'], principled_node.inputs['Base Color'])

    # Link to output
    links.new(principled_node.outputs['BSDF'], output_node.inputs['Surface'])

    # Assign material to car
    if car_obj.data.materials:
        car_obj.data.materials[0] = mat
    else:
        car_obj.data.materials.append(mat)

    # Bake texture to UV map
    bake_uv_texture(car_obj, uv_texture_output_path, resolution=2048)

def bake_uv_texture(
    car_obj: bpy.types.Object,
    output_path: str,
    resolution: int = 2048
):
    """
    Bake car's material to UV texture image.

    This creates the ground truth UV texture for training.
    """
    # Create image texture (target for baking)
    image_name = f"bake_texture_{random.randint(1000, 9999)}"
    image = bpy.data.images.new(
        image_name,
        width=resolution,
        height=resolution,
        alpha=True
    )

    # Create image texture node (required for baking)
    mat = car_obj.data.materials[0]
    nodes = mat.node_tree.nodes
    image_node = nodes.new(type='ShaderNodeTexImage')
    image_node.image = image
    nodes.active = image_node  # Must be active for baking

    # Select car
    bpy.ops.object.select_all(action='DESELECT')
    car_obj.select_set(True)
    bpy.context.view_layer.objects.active = car_obj

    # Bake settings
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 128  # Higher = better quality
    bpy.context.scene.cycles.bake_type = 'DIFFUSE'
    bpy.context.scene.render.bake.use_pass_direct = False
    bpy.context.scene.render.bake.use_pass_indirect = False

    # Bake!
    bpy.ops.object.bake(type='DIFFUSE')

    # Save baked texture
    image.filepath_raw = output_path
    image.file_format = 'PNG'  # Save as PNG (convert to DDS later)
    image.save()

    print(f"Baked UV texture saved to: {output_path}")

    # Cleanup
    bpy.data.images.remove(image)
    nodes.remove(image_node)
```

---

## Camera & Lighting Setup

### Camera Angles

```python
import math

def setup_camera(
    angle: str,  # "side_45", "side_straight", "front_3quarter", "rear_3quarter"
    car_obj: bpy.types.Object
) -> bpy.types.Object:
    """
    Position camera for specific car angle.

    Training needs 4 angles for robustness:
    - side_45: 45° side view (most common user photo angle)
    - side_straight: Perfect side view (90°)
    - front_3quarter: Front 3/4 view
    - rear_3quarter: Rear 3/4 view
    """

    # Get car bounds
    car_length = car_obj.dimensions.y
    car_height = car_obj.dimensions.z

    # Camera settings
    camera_data = bpy.data.cameras.new(name="Camera")
    camera_obj = bpy.data.objects.new("Camera", camera_data)
    bpy.context.scene.collection.objects.link(camera_obj)

    # Set focal length (50mm = standard lens, realistic perspective)
    camera_data.lens = 50

    # Distance from car (8m = typical user photo distance)
    distance = car_length * 1.8

    if angle == "side_45":
        # 45° side view
        angle_rad = math.radians(45)
        camera_obj.location = (
            distance * math.sin(angle_rad),
            -distance * math.cos(angle_rad),
            car_height * 0.7  # Slightly above midpoint
        )
        camera_obj.rotation_euler = (math.radians(90), 0, math.radians(45))

    elif angle == "side_straight":
        # Perfect 90° side view
        camera_obj.location = (distance, 0, car_height * 0.6)
        camera_obj.rotation_euler = (math.radians(90), 0, math.radians(90))

    elif angle == "front_3quarter":
        # Front 3/4 view (car facing camera, 45° offset)
        angle_rad = math.radians(135)
        camera_obj.location = (
            distance * math.sin(angle_rad),
            distance * math.cos(angle_rad),
            car_height * 0.8
        )
        camera_obj.rotation_euler = (math.radians(85), 0, math.radians(135))

    elif angle == "rear_3quarter":
        # Rear 3/4 view
        angle_rad = math.radians(-45)
        camera_obj.location = (
            distance * math.sin(angle_rad),
            distance * math.cos(angle_rad),
            car_height * 0.7
        )
        camera_obj.rotation_euler = (math.radians(90), 0, math.radians(-45))

    # Set as active camera
    bpy.context.scene.camera = camera_obj

    return camera_obj

def setup_lighting(hdri_path: str):
    """
    Setup HDRI environment lighting for photorealistic rendering.

    HDRIs: Download free HDRIs from https://polyhaven.com/hdris
    Recommended: Outdoor/Studio HDRIs (8K resolution, .exr format)
    """

    # Enable world nodes
    world = bpy.context.scene.world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links

    # Clear default nodes
    nodes.clear()

    # Create nodes
    output_node = nodes.new(type='ShaderNodeOutputWorld')
    background_node = nodes.new(type='ShaderNodeBackground')
    env_tex_node = nodes.new(type='ShaderNodeTexEnvironment')

    # Load HDRI
    env_tex_node.image = bpy.data.images.load(hdri_path)

    # Link nodes
    links.new(env_tex_node.outputs['Color'], background_node.inputs['Color'])
    links.new(background_node.outputs['Background'], output_node.inputs['Surface'])

    # Set background strength (brightness)
    background_node.inputs['Strength'].default_value = random.uniform(0.8, 1.2)

    print(f"Loaded HDRI: {hdri_path}")

# Example HDRI library:
hdri_library = [
    "C:\\GridVox\\hdris\\studio_small_08_8k.exr",
    "C:\\GridVox\\hdris\\outdoor_summer_8k.exr",
    "C:\\GridVox\\hdris\\warehouse_8k.exr",
    "C:\\GridVox\\hdris\\sunset_8k.exr"
]
```

---

## Batch Rendering

### Render Settings

```python
def configure_render_settings(resolution: int = 1024, samples: int = 128):
    """
    Configure Cycles render settings for optimal quality/speed.

    Resolution: 1024×1024 (AI models resize anyway, no need for 4K)
    Samples: 128 (good balance, 256 for higher quality)
    """

    scene = bpy.context.scene

    # Set render engine
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'GPU'  # Use GPU (OptiX/CUDA)

    # Resolution
    scene.render.resolution_x = resolution
    scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100

    # Samples (quality vs speed)
    scene.cycles.samples = samples

    # Denoising (reduces noise, improves quality)
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = 'OPTIX'  # Use OptiX denoiser (RTX GPUs)

    # Transparent background (optional, for compositing)
    scene.render.film_transparent = False  # We want solid background (sky from HDRI)

    # Color management (sRGB output)
    scene.view_settings.view_transform = 'Standard'
    scene.display_settings.display_device = 'sRGB'

def render_photo(output_path: str):
    """Render current scene to PNG."""
    scene = bpy.context.scene
    scene.render.filepath = output_path
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.image_settings.compression = 15  # 0-100 (15 = good compression)

    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {output_path}")
```

### Batch Generation Loop

```python
def generate_training_dataset(
    car_gmt_path: str,
    output_dir: str,
    num_samples: int = 4800
):
    """
    Generate full training dataset for one car.

    Creates 4,800 photo/UV pairs:
    - 4 camera angles
    - 1,200 livery variations per angle
    """

    import os
    os.makedirs(f"{output_dir}/photos", exist_ok=True)
    os.makedirs(f"{output_dir}/uv_textures", exist_ok=True)
    os.makedirs(f"{output_dir}/metadata", exist_ok=True)

    # Import car
    car_obj = import_gmt_car(car_gmt_path)

    # Camera angles
    angles = ["side_45", "side_straight", "front_3quarter", "rear_3quarter"]
    samples_per_angle = num_samples // len(angles)  # 1,200 per angle

    # Configure rendering
    configure_render_settings(resolution=1024, samples=128)

    # Load HDRI library
    hdris = [
        "C:\\GridVox\\hdris\\studio_small_08_8k.exr",
        "C:\\GridVox\\hdris\\outdoor_summer_8k.exr",
        "C:\\GridVox\\hdris\\warehouse_8k.exr"
    ]

    sample_id = 0

    for angle in angles:
        print(f"\nGenerating {samples_per_angle} samples for angle: {angle}")

        # Setup camera once per angle
        camera = setup_camera(angle, car_obj)

        for i in range(samples_per_angle):
            # Generate random livery
            livery_config = generate_random_livery_config()

            # UV texture path (ground truth)
            uv_path = f"{output_dir}/uv_textures/{sample_id:05d}.png"

            # Apply livery and bake UV texture
            apply_livery_to_car(car_obj, livery_config, uv_path)

            # Random lighting
            hdri = random.choice(hdris)
            setup_lighting(hdri)

            # Render photo
            photo_path = f"{output_dir}/photos/{sample_id:05d}.png"
            render_photo(photo_path)

            # Save metadata
            metadata = {
                "sample_id": sample_id,
                "car_model": os.path.basename(car_gmt_path).replace(".gmt", ""),
                "camera_angle": angle,
                "hdri": os.path.basename(hdri),
                "livery": {
                    "base_color": livery_config.base_color,
                    "accent_color": livery_config.accent_color,
                    "pattern": livery_config.pattern,
                    "number": livery_config.number
                }
            }

            import json
            with open(f"{output_dir}/metadata/{sample_id:05d}.json", "w") as f:
                json.dump(metadata, f, indent=2)

            sample_id += 1

            # Progress
            if (i + 1) % 100 == 0:
                print(f"  Progress: {i+1}/{samples_per_angle} ({(i+1)/samples_per_angle*100:.1f}%)")

        # Cleanup camera
        bpy.data.objects.remove(camera, do_unlink=True)

    print(f"\n✅ Dataset generation complete!")
    print(f"   Total samples: {sample_id}")
    print(f"   Photos: {output_dir}/photos/")
    print(f"   UV textures: {output_dir}/uv_textures/")
```

---

## Quality Validation

### Automated Quality Checks

```python
def validate_training_sample(photo_path: str, uv_path: str) -> dict:
    """
    Validate generated training pair.

    Checks:
    - File exists and readable
    - Correct resolution
    - Not blank/corrupted
    - Sufficient color variance (not solid black/white)
    """
    from PIL import Image
    import numpy as np

    issues = []

    # Check photo
    if not os.path.exists(photo_path):
        issues.append(f"Photo missing: {photo_path}")
    else:
        photo = Image.open(photo_path)
        if photo.size != (1024, 1024):
            issues.append(f"Photo wrong size: {photo.size} (expected 1024×1024)")

        # Check not blank
        photo_array = np.array(photo)
        if photo_array.std() < 10:  # Very low variance = likely blank
            issues.append(f"Photo appears blank (std: {photo_array.std():.1f})")

    # Check UV texture
    if not os.path.exists(uv_path):
        issues.append(f"UV texture missing: {uv_path}")
    else:
        uv = Image.open(uv_path)
        if uv.size != (2048, 2048):
            issues.append(f"UV wrong size: {uv.size} (expected 2048×2048)")

        uv_array = np.array(uv)
        if uv_array.std() < 10:
            issues.append(f"UV appears blank (std: {uv_array.std():.1f})")

    return {
        "valid": len(issues) == 0,
        "issues": issues
    }

def validate_dataset(dataset_dir: str):
    """Run validation on entire dataset."""
    photos_dir = f"{dataset_dir}/photos"
    uv_dir = f"{dataset_dir}/uv_textures"

    photo_files = sorted(os.listdir(photos_dir))
    uv_files = sorted(os.listdir(uv_dir))

    if len(photo_files) != len(uv_files):
        print(f"⚠️ Mismatch: {len(photo_files)} photos, {len(uv_files)} UVs")

    failures = []

    for photo_file, uv_file in zip(photo_files, uv_files):
        photo_path = f"{photos_dir}/{photo_file}"
        uv_path = f"{uv_dir}/{uv_file}"

        result = validate_training_sample(photo_path, uv_path)
        if not result["valid"]:
            failures.append({
                "photo": photo_file,
                "issues": result["issues"]
            })

    print(f"\n✅ Validation complete:")
    print(f"   Total samples: {len(photo_files)}")
    print(f"   Valid: {len(photo_files) - len(failures)}")
    print(f"   Failed: {len(failures)}")

    if failures:
        print(f"\n❌ Failed samples:")
        for fail in failures[:10]:  # Show first 10
            print(f"   {fail['photo']}: {fail['issues']}")
```

---

## Performance Optimization

### GPU Rendering Optimization

```python
# Set tile size for optimal GPU utilization
bpy.context.scene.cycles.tile_size = 256  # RTX GPUs: 256, GTX: 128

# Reduce memory usage (if hitting VRAM limits)
bpy.context.scene.cycles.use_persistent_data = True

# Enable experimental features (OptiX denoising)
bpy.context.preferences.addons['cycles'].preferences.use_experimental_features = True
```

### Parallel Batch Rendering

```bash
# Run multiple Blender instances in parallel (4 instances)

# Instance 1: Samples 0-1199
start "Blender1" "C:\Tools\Blender\blender.exe" --background --python generate_dataset.py -- --start 0 --end 1200 --angle side_45

# Instance 2: Samples 1200-2399
start "Blender2" "C:\Tools\Blender\blender.exe" --background --python generate_dataset.py -- --start 1200 --end 2400 --angle side_straight

# Instance 3: Samples 2400-3599
start "Blender3" "C:\Tools\Blender\blender.exe" --background --python generate_dataset.py -- --start 2400 --end 3600 --angle front_3quarter

# Instance 4: Samples 3600-4799
start "Blender4" "C:\Tools\Blender\blender.exe" --background --python generate_dataset.py -- --start 3600 --end 4800 --angle rear_3quarter

# With 4× RTX 4090: 4,800 samples in 30-45 minutes (vs 2-3 hours single GPU)
```

---

## Complete Automation Script

```python
# generate_training_data.py - Complete automation script

import bpy
import os
import sys
import argparse
import random
import json
import math
from pathlib import Path

# Add GridVox modules to path (if needed)
sys.path.append("C:\\GridVox\\training_pipeline")

# ... (Include all functions from above sections)

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic training data for GridVox")
    parser.add_argument("--car-gmt", required=True, help="Path to .gmt car model")
    parser.add_argument("--output-dir", required=True, help="Output directory for dataset")
    parser.add_argument("--num-samples", type=int, default=4800, help="Total samples to generate")
    parser.add_argument("--start", type=int, default=0, help="Start sample ID (for parallel processing)")
    parser.add_argument("--end", type=int, default=None, help="End sample ID")
    parser.add_argument("--resolution", type=int, default=1024, help="Render resolution")
    parser.add_argument("--samples", type=int, default=128, help="Cycles samples (quality)")

    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])

    print(f"\nGridVox Training Data Generator")
    print(f"================================")
    print(f"Car Model: {args.car_gmt}")
    print(f"Output Dir: {args.output_dir}")
    print(f"Samples: {args.num_samples}")
    print(f"Resolution: {args.resolution}×{args.resolution}")
    print(f"Cycles Samples: {args.samples}\n")

    # Generate dataset
    generate_training_dataset(
        car_gmt_path=args.car_gmt,
        output_dir=args.output_dir,
        num_samples=args.num_samples
    )

    # Validate
    print("\nValidating dataset...")
    validate_dataset(args.output_dir)

    print("\n✅ Done!")

if __name__ == "__main__":
    main()
```

**Run Command:**
```bash
"C:\Tools\Blender\blender.exe" --background --python generate_training_data.py -- \
  --car-gmt "C:\GridVox\training_data\porsche_992_gt3_r\models\porsche_992_gt3_r.gmt" \
  --output-dir "C:\GridVox\datasets\porsche_992_gt3_r" \
  --num-samples 4800 \
  --resolution 1024 \
  --samples 128
```

---

**Last Updated:** January 11, 2025
**Status:** ✅ Blender automation guide complete → Ready for Phase 2 Week 1 (synthetic data generation)
**Next:** Run initial test batch (100 samples) to validate pipeline before full 4,800 generation
