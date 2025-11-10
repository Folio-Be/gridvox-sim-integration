# UV Mapping AI System - Technical Architecture
## Problem: Generate UV Textures from 3D Reference Photos

**Date:** November 10, 2025  
**Status:** Architecture Design Phase  
**Complexity:** HIGH - Novel AI problem requiring custom training

---

## Executive Summary

**Challenge:** Train an AI to reverse-engineer UV unwrapped textures from 3D car photos.

**Core Innovation:** Learn the inverse UV mapping function by training on pairs of:
- Input: 3D showroom photos + target design reference
- Output: UV unwrapped texture that produces the target design when rendered

**Approach:** Multi-stage pipeline combining:
1. **3D Pose Estimation** → Understand camera angle/lighting
2. **UV Correspondence Learning** → Map 3D pixels to UV coordinates
3. **Conditional Generation** → Create UV texture matching target design
4. **Validation** → Render & compare to target

---

## Stage 1: Data Preparation & Synthetic Dataset Generation

### 1.1 Existing Assets Analysis
**Goal:** Understand what we have and what we need

**Existing Data:**
```
examples/gt4_skins/ginetta_g55_gt4_2/GIN/
├── body1.png → body5.png          # UV unwrapped textures (ground truth)
├── preview1.png → preview5.png    # Side-view renders (limited angles)
├── showroom 2a.JPG, 2b.JPG       # Multi-angle 3D views (ideal!)
└── skin i want.jpg                # Target design (user input)
```

**Problem:** Only 2 showroom photos for 1 livery. Need 1000s of training examples.

### 1.2 Synthetic Data Pipeline
**Solution:** Use Blender + Python to generate massive training dataset

**Architecture:**
```python
# Pseudo-code workflow
for each_car in [ginetta_g55_gt4, bmw_m4_gt4, ...]:
    car_3d_model = load_blender_model(car)
    uv_map = extract_uv_layout(car_3d_model)
    
    for livery_id in range(1000):  # Generate 1000 synthetic liveries
        # Generate random but realistic livery patterns
        uv_texture = generate_synthetic_livery(
            style=random_choice(['racing_stripes', 'flames', 'geometric', 'sponsor_heavy']),
            colors=random_palette(),
            complexity=random_range(0.3, 0.9)
        )
        
        # Render from multiple angles
        for camera_pose in [front_3_4, side, rear_3_4, top, low_angle, ...]:
            for lighting in [studio, sunset, overcast, ...]:
                rendered_view = blender_render(
                    model=car_3d_model,
                    texture=uv_texture,
                    camera=camera_pose,
                    lighting=lighting,
                    resolution=(2048, 2048)
                )
                
                # Save training pair
                save_training_example(
                    input_view=rendered_view,
                    output_uv=uv_texture,
                    metadata={
                        'car': car.name,
                        'camera_angle': camera_pose.euler,
                        'lighting': lighting.name,
                        'car_pose': car.rotation
                    }
                )
```

**Output:** 
- 6 cars × 1000 liveries × 8 angles × 3 lighting = **144,000 training pairs**
- Each pair: `(3D_rendered_view, UV_texture, metadata)`

### 1.3 Real Data Augmentation
**Supplement synthetic data with real AMS2 liveries:**

```python
# Use existing AMS2 liveries as ground truth
for real_livery in find_all_ams2_liveries():
    uv_texture = load_dds(real_livery.body_file)
    
    # Render from same 8 angles used in synthetic pipeline
    for camera_pose in standard_poses:
        rendered = blender_render(car_model, uv_texture, camera_pose)
        save_training_example(rendered, uv_texture, metadata)
```

**Output:** ~500 real liveries × 8 angles = **4,000 high-quality training pairs**

---

## Stage 2: UV Correspondence Network

### 2.1 Architecture: 3D → UV Pixel Mapping

**Goal:** Learn which UV coordinates correspond to each pixel in 3D view

**Model:** Modified ControlNet or custom U-Net with geometric priors

```
Input: 3D rendered view (RGB, 2048×2048)
       + Camera metadata (angle, distance, FOV)
       + Depth map (from ZoeDepth)
       + Surface normals (from depth)

Output: UV coordinate map (2 channels: U, V ∈ [0,1])
        + Visibility mask (1 channel: which pixels are visible)
        + Confidence map (1 channel: mapping certainty)

Architecture:
┌─────────────────┐
│ 3D View (RGB)   │─────┐
└─────────────────┘     │
┌─────────────────┐     │    ┌──────────────────┐
│ Depth Map       │─────┼───→│ Encoder (ResNet) │
└─────────────────┘     │    └──────────────────┘
┌─────────────────┐     │            │
│ Camera Metadata │─────┘            │
└─────────────────┘                  ↓
                           ┌──────────────────┐
                           │ UV Decoder       │
                           │ (U-Net style)    │
                           └──────────────────┘
                                     │
                           ┌─────────┴─────────┐
                           ↓                   ↓
                    ┌─────────────┐    ┌─────────────┐
                    │ UV Map      │    │ Visibility  │
                    │ (U,V coords)│    │ + Confidence│
                    └─────────────┘    └─────────────┘
```

**Training Loss:**
```python
loss = (
    0.5 * L1_loss(predicted_uv, ground_truth_uv) +
    0.3 * perceptual_loss(predicted_uv, ground_truth_uv) +
    0.2 * edge_aware_loss(predicted_uv, ground_truth_uv)
) * visibility_mask
```

**Why This Works:**
- Encoder learns geometric features from depth + normals
- Decoder learns UV island structure specific to each car
- Metadata provides viewpoint context
- Visibility mask handles occlusion

### 2.2 Multi-View Fusion (Optional Enhancement)

**Problem:** Single view has occlusion (back of car hidden from front camera)

**Solution:** If user provides multiple photos, fuse UV maps:

```python
def fuse_multi_view_uv(views, camera_poses):
    uv_maps = []
    confidence_maps = []
    
    for view, pose in zip(views, camera_poses):
        uv, confidence = uv_correspondence_net(view, pose)
        uv_maps.append(uv)
        confidence_maps.append(confidence)
    
    # Weighted average based on confidence
    fused_uv = weighted_average(uv_maps, weights=confidence_maps)
    return fused_uv
```

---

## Stage 3: UV Texture Generation from Target Design

### 3.1 Conditional SDXL Pipeline

**Goal:** Generate UV texture that matches user's target design photo

**Approach:** Fine-tune SDXL with ControlNet conditioning

**Model Architecture:**
```
Input:
  1. Target design photo (skin i want.jpg)
  2. UV coordinate map (from Stage 2)
  3. Text prompt (optional: "racing livery with blue stripes")

Output:
  UV unwrapped texture (2048×2048 DDS-compatible PNG)

Pipeline:
┌──────────────────┐
│ Target Design    │──→ [CLIP Encoder] ──→ Text Embedding
└──────────────────┘

┌──────────────────┐
│ UV Coord Map     │──→ [ControlNet] ──→ Spatial Guidance
└──────────────────┘

         ↓                      ↓
    ┌─────────────────────────────┐
    │  SDXL UNet (Fine-tuned)     │
    │  + UV Structure Prior       │
    └─────────────────────────────┘
                ↓
    ┌─────────────────────────────┐
    │  VAE Decoder                │
    └─────────────────────────────┘
                ↓
    ┌─────────────────────────────┐
    │  UV Texture (2048×2048)     │
    └─────────────────────────────┘
```

### 3.2 Fine-Tuning Strategy

**Dataset:** Use synthetic + real UV textures from Stage 1

**Fine-tuning approach:**
```python
# LoRA fine-tuning (lightweight, 500MB vs 6GB full model)
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,  # LoRA rank
    lora_alpha=32,
    target_modules=["to_q", "to_v", "to_k", "to_out.0"],
    lora_dropout=0.1
)

sdxl_unet = get_peft_model(sdxl.unet, lora_config)

# Training loop
for epoch in range(20):
    for batch in dataloader:
        target_design = batch['rendered_view']  # What user sees in 3D
        uv_texture = batch['uv_texture']       # What we need to generate
        uv_coord_map = batch['uv_coordinates'] # Spatial guidance
        
        # Encode target as conditioning
        conditioning = clip_encode(target_design)
        
        # ControlNet guides structure
        control_signal = controlnet(uv_coord_map)
        
        # SDXL generates UV texture
        predicted_uv = sdxl_unet(
            latent_noise,
            timestep=t,
            encoder_hidden_states=conditioning,
            down_block_additional_residuals=control_signal
        )
        
        # Loss: Generated UV should match ground truth
        loss = mse_loss(predicted_uv, uv_texture)
        loss.backward()
```

**Training Time:** ~40 hours on RTX 4090 for 144k examples

### 3.3 Inference Pipeline

**User workflow:**
```python
def generate_livery(target_photo, car_model):
    # Step 1: Estimate camera pose from target photo
    camera_pose = estimate_pose(target_photo)
    
    # Step 2: Generate depth map
    depth = zoe_depth_model(target_photo)
    
    # Step 3: Map 3D pixels to UV coordinates
    uv_coord_map, visibility = uv_correspondence_net(
        target_photo, camera_pose, depth
    )
    
    # Step 4: Generate UV texture conditioned on target
    uv_texture = sdxl_pipeline(
        image=target_photo,
        control_image=uv_coord_map,
        prompt="racing car livery, high detail, professional",
        num_inference_steps=30,
        guidance_scale=7.5
    )
    
    # Step 5: Post-process (ensure seamless UV islands)
    uv_texture = fix_uv_seams(uv_texture, car_model.uv_layout)
    
    return uv_texture
```

---

## Stage 4: Validation & Refinement

### 4.1 Render-Compare Loop

**Problem:** How do we know generated UV texture actually looks like target?

**Solution:** Render it in Blender and compare to target photo

```python
def validate_generation(generated_uv, target_photo, car_model, camera_pose):
    # Apply generated UV to 3D model
    car_model.apply_texture(generated_uv)
    
    # Render from same angle as target photo
    rendered = blender_render(car_model, camera_pose)
    
    # Compare using perceptual metrics
    ssim_score = structural_similarity(rendered, target_photo)
    lpips_score = learned_perceptual_similarity(rendered, target_photo)
    
    # If score too low, refine
    if lpips_score > 0.3:  # Threshold
        return refine_generation(generated_uv, target_photo, delta=lpips_score)
    
    return generated_uv, quality_score=lpips_score
```

### 4.2 Iterative Refinement

**If first generation isn't perfect:**

```python
def refine_generation(initial_uv, target_photo, max_iterations=3):
    current_uv = initial_uv
    
    for i in range(max_iterations):
        # Render current UV
        rendered = blender_render(car_model, current_uv, camera_pose)
        
        # Compute difference from target
        diff_map = compute_difference(rendered, target_photo)
        
        # Project difference back to UV space (inverse of Stage 2)
        uv_correction = inverse_uv_mapping(diff_map, uv_coord_map)
        
        # Generate refined UV using img2img
        current_uv = sdxl_img2img(
            image=current_uv,
            mask=uv_correction,  # Focus on wrong areas
            strength=0.5,        # Don't change too much
            prompt="fix colors and details"
        )
        
        # Check if good enough
        if quality_metric(rendered, target_photo) < threshold:
            break
    
    return current_uv
```

---

## Stage 5: Integration with Existing System

### 5.1 Backend API Design

**Endpoint:** `POST /api/generate-livery`

```python
# python-backend/api/livery_generator.py
from fastapi import FastAPI, UploadFile
from models.uv_correspondence import UVCorrespondenceNet
from models.sdxl_livery import SDXLLiveryGenerator
from validators.render_validator import RenderValidator

app = FastAPI()

@app.post("/api/generate-livery")
async def generate_livery(
    target_design: UploadFile,
    car_model: str = "ginetta_g55_gt4",
    additional_views: list[UploadFile] = [],
    style_prompt: str = ""
):
    # Save uploaded file
    target_path = save_upload(target_design)
    
    # Load car-specific models
    uv_net = UVCorrespondenceNet.load(f"models/uv_nets/{car_model}.pth")
    sdxl = SDXLLiveryGenerator.load("models/sdxl_livery_lora.safetensors")
    
    # Stage 1: Analyze target photo
    camera_pose = estimate_camera_pose(target_path)
    depth = generate_depth_map(target_path)
    
    # Stage 2: UV correspondence
    uv_coords, visibility = uv_net(target_path, camera_pose, depth)
    
    # Stage 3: Generate UV texture
    uv_texture = sdxl.generate(
        target_image=target_path,
        control_image=uv_coords,
        prompt=f"racing livery for {car_model}, {style_prompt}",
        num_steps=30
    )
    
    # Stage 4: Validate & refine
    validator = RenderValidator(car_model)
    validated_uv, quality = validator.validate_and_refine(
        uv_texture, target_path, camera_pose
    )
    
    # Stage 5: Convert to AMS2 format
    dds_file = convert_to_dds(validated_uv, format="BC7", mipmap=True)
    
    return {
        "livery_file": dds_file,
        "quality_score": quality,
        "preview_renders": validator.preview_images,
        "installation_path": f"CustomLiveries/Overrides/{car_model}/AI_Generated/"
    }
```

### 5.2 Frontend Integration

```typescript
// src/components/LiveryGenerator.tsx
const LiveryGenerator: React.FC = () => {
  const [targetDesign, setTargetDesign] = useState<File | null>(null);
  const [carModel, setCarModel] = useState("ginetta_g55_gt4");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    
    const formData = new FormData();
    formData.append("target_design", targetDesign!);
    formData.append("car_model", carModel);
    
    const response = await fetch("http://localhost:8000/api/generate-livery", {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    setResult(result);
    setGenerating(false);
  };

  return (
    <div>
      <h2>AI Livery Generator</h2>
      
      {/* Upload target design */}
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setTargetDesign(e.target.files![0])}
      />
      
      {/* Select car */}
      <select value={carModel} onChange={(e) => setCarModel(e.target.value)}>
        <option value="ginetta_g55_gt4">Ginetta G55 GT4</option>
        <option value="bmw_m4_gt4">BMW M4 GT4</option>
        {/* ... more cars */}
      </select>
      
      <button onClick={handleGenerate} disabled={!targetDesign || generating}>
        {generating ? "Generating..." : "Generate Livery"}
      </button>
      
      {result && (
        <div>
          <h3>Result (Quality: {result.quality_score})</h3>
          <img src={result.preview_renders[0]} alt="Generated livery preview" />
          <button onClick={() => installLivery(result.livery_file)}>
            Install to AMS2
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Implementation Timeline

### Week 5: Dataset Preparation (Nov 11-17)
- **Day 1-2:** Extract 3D models from AMS2, import to Blender
- **Day 3-4:** Create synthetic livery generator script
- **Day 5-7:** Generate 144k training pairs + validate quality

### Week 6-7: UV Correspondence Training (Nov 18 - Dec 1)
- **Day 8-10:** Implement UV Correspondence Network architecture
- **Day 11-14:** Train on synthetic dataset (first car: Ginetta)
- **Day 15-17:** Validate on real AMS2 liveries, debug issues
- **Day 18-21:** Train for remaining 5 cars

### Week 8: SDXL Fine-Tuning (Dec 2-8)
- **Day 22-24:** Prepare LoRA fine-tuning pipeline
- **Day 25-28:** Fine-tune SDXL on UV texture generation task
- **Day 29:** Validate generation quality

### Week 9: Integration & Validation (Dec 9-15)
- **Day 30-32:** Build backend API endpoints
- **Day 33-35:** Integrate with React frontend
- **Day 36:** Create render validation pipeline

### Week 10: Testing & Refinement (Dec 16-22)
- **Day 37-40:** User testing with various target designs
- **Day 41-43:** Refinement based on failure cases
- **Day 44:** Documentation + deployment

**Total:** 10 weeks from now → Production ready by **January 20, 2026**

---

## Technical Challenges & Mitigations

### Challenge 1: UV Seam Artifacts
**Problem:** UV islands have seams that can show visible lines

**Mitigation:**
- Train with seam-aware loss function
- Post-process with padding/dilation on UV island borders
- Use seamless texture synthesis techniques

### Challenge 2: Viewpoint Variation
**Problem:** User's target photo might be from unusual angle

**Mitigation:**
- Train on wide variety of camera poses (including extreme angles)
- Allow multi-photo upload for better coverage
- Use pose estimation to guide generation

### Challenge 3: Style Transfer Quality
**Problem:** Target photo might be low-res or have lighting/reflections

**Mitigation:**
- Pre-process with super-resolution (RealESRGAN)
- Use CLIP guidance to focus on semantic features, not lighting
- Provide style strength slider (0-100%) for user control

### Challenge 4: Computational Cost
**Problem:** Full pipeline might be slow (2-5 minutes per livery)

**Mitigation:**
- Use TensorRT optimization for inference
- Implement GPU batching for multi-view processing
- Cache intermediate results (depth maps, UV coordinates)
- Offer "quick preview" mode with fewer refinement iterations

---

## Success Metrics

### Technical Metrics
- **UV Mapping Accuracy:** <5px error on average (measured on test set)
- **Generation Quality:** LPIPS score <0.2 vs target photo
- **Processing Time:** <2 minutes per livery on RTX 4090
- **User Satisfaction:** >80% approval on blind A/B tests vs manual UV painting

### Deliverables
1. Trained UV Correspondence Network (6 car-specific models)
2. Fine-tuned SDXL LoRA weights for livery generation
3. FastAPI backend with generation endpoint
4. React UI for upload + generation workflow
5. Blender validation pipeline
6. Documentation + training notebooks

---

## Alternative Approaches (Considered & Rejected)

### Approach A: Template Matching
**Idea:** Find closest existing livery, do style transfer

**Rejected because:**
- Limited to existing livery structures
- Can't generate truly novel designs
- Doesn't solve UV unwrapping problem

### Approach B: 3D GAN (e.g., NeRF-based)
**Idea:** Generate 3D textured model directly, export UV

**Rejected because:**
- Requires car-specific 3D GAN training (very data-hungry)
- NeRF doesn't guarantee clean UV unwrapping
- Computational cost extremely high

### Approach C: Manual UV Painting Tool
**Idea:** Give users a UV editor with AI-assisted painting

**Rejected because:**
- Defeats purpose of "upload photo, get livery"
- Requires users to understand UV unwrapping
- Doesn't leverage AI for automation

**Why Multi-Stage Pipeline (Selected):**
- Modular: Can improve each stage independently
- Proven: Similar techniques work in texture synthesis
- Practical: Fits within 10-week timeline
- Scalable: Once trained, works on any car with UV template

---

## Next Steps (Immediate)

1. **Validate Feasibility:** Test UV Correspondence Network on 1 car with 100 examples
2. **Blender Pipeline:** Confirm we can extract UV layouts from AMS2 models
3. **Synthetic Data Quality:** Generate 1000 examples, manually review for realism
4. **Budget Check:** Estimate GPU hours needed (likely ~200 hours @ $1.50/hr = $300)

**Decision Point:** After Week 5 Day 3, we'll know if this approach is viable or needs pivot.
