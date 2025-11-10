# Self-Supervised UV Mapping Learning
## Learning UV Unwrapping from Example Liveries (No Blender Required)

**Date:** November 10, 2025  
**Status:** Architecture Design - Pure AI Approach  
**Key Insight:** Learn the inverse UV mapping function directly from existing livery examples

---

## The Breakthrough Insight

You're absolutely right - **the AI should figure this out itself**. We have:

**Training Data (per car):**
```
Ginetta G55 GT4:
├── body1.png to body5.png        # UV unwrapped textures (ground truth)
├── preview1.png to preview5.png  # Side-view 3D renders
├── showroom_2a.JPG, 2b.JPG      # Multi-angle 3D renders (GOLD!)
└── skin_i_want.jpg              # User's target design (inference input)
```

**The Learning Problem:**
```
Given:  showroom_2a.JPG (3D rendered view of car with body2.png applied)
        showroom_2b.JPG (different angle, same body2.png)
Learn:  f(showroom_view) → body2.png (the UV texture)
```

This is a **self-supervised correspondence learning** problem!

---

## Research Foundation: What We Learned

### 1. NeuTex (2021) - Neural Texture Mapping
**Key Concept:** Learn 3D-to-2D and 2D-to-3D mapping networks with cycle consistency

```
3D Point → [Mapping Network] → 2D UV Coordinate
2D UV Coordinate → [Inverse Network] → 3D Point

Loss: L_cycle = ||P_original - P_reconstructed||²
```

**Adaptation for Us:**
We don't need the 3D volume - we learn directly from 2D→2D!

### 2. MaterialFusion (2024) - Diffusion Priors for Inverse Rendering
**Key Concept:** Use diffusion models to guide texture estimation

**Relevance:** Confirms that learning appearance→texture mapping is possible with modern AI

### 3. Cycle Consistency for Unsupervised Learning
**Key Papers:** CycleGAN, DensePose RCNN (Facebook AI)

**Core Idea:**
```
Forward:  3D_view → [Network A] → UV_texture
Backward: UV_texture → [Renderer B] → 3D_view

Loss: L_recon = ||3D_view_input - 3D_view_reconstructed||
```

---

## Our Self-Supervised Learning Pipeline

### Phase 1: Differentiable Rendering Engine (Critical!)

**Problem:** We need `render(UV_texture, camera_pose) → 3D_view` to be differentiable

**Solution Options:**

#### Option A: Approximate Renderer (Faster, Less Accurate)
Use a **learned renderer** that mimics AMS2's rendering:

```python
class LearnableRenderer(nn.Module):
    """Neural network that learns to render UV textures"""
    
    def __init__(self):
        self.encoder = UNetEncoder()  # Extract UV features
        self.viewpoint_net = ViewpointTransform()  # Apply camera transform
        self.decoder = UNetDecoder()  # Generate 3D view
        
    def forward(self, uv_texture, camera_pose, car_model_id):
        # Encode UV texture into latent features
        uv_features = self.encoder(uv_texture)  # (B, 512, H, W)
        
        # Transform based on camera viewpoint
        # This network learns the geometric projection
        transformed = self.viewpoint_net(
            uv_features, 
            camera_pose,  # (azimuth, elevation, distance)
            car_model_id  # One-hot encoding of car type
        )
        
        # Decode into 3D rendered view
        rendered_view = self.decoder(transformed)  # (B, 3, H, W)
        
        return rendered_view
```

**Training the Renderer:**
```python
# Use existing livery pairs as ground truth
for body_texture, showroom_photo in dataset:
    camera_pose = estimate_pose(showroom_photo)  # Could use off-the-shelf pose estimator
    
    predicted_render = renderer(body_texture, camera_pose, car_id)
    loss = mse_loss(predicted_render, showroom_photo)
    loss.backward()
```

#### Option B: Neural Radiance Fields (NeRF-style)
Per-car NeRF that maps UV coordinates to 3D appearance:

```python
class CarNeRF(nn.Module):
    """NeRF-style renderer for specific car model"""
    
    def query(self, uv_coord, view_direction, uv_texture):
        # uv_coord: (u, v) position on texture
        # view_direction: camera ray direction
        # uv_texture: the texture to apply
        
        # Sample color from UV texture
        sampled_color = sample_bilinear(uv_texture, uv_coord)
        
        # Modulate with view-dependent effects (specularity, etc.)
        view_dependent = self.mlp(view_direction)
        
        return sampled_color * view_dependent
```

#### Option C: **Simplified Geometric Proxy** (RECOMMENDED)
Use a simple geometric transformation learned from data:

**Insight:** Cars have predictable UV unwrapping patterns. We can learn a spatial transformer network:

```python
class UVToViewTransformer(nn.Module):
    """Learn spatial transformation from UV space to view space"""
    
    def __init__(self):
        # Spatial transformer network
        self.localization = nn.Sequential(
            nn.Conv2d(3, 64, 7),
            nn.MaxPool2d(2),
            nn.ReLU(),
            nn.Conv2d(64, 128, 5),
            nn.MaxPool2d(2),
            nn.ReLU()
        )
        
        # Regression to affine transformation parameters
        self.fc_loc = nn.Sequential(
            nn.Linear(128 * 53 * 53, 256),
            nn.ReLU(),
            nn.Linear(256, 3 * 2 * 6)  # 6 affine transforms for different car parts
        )
        
    def forward(self, uv_texture, camera_params):
        # Learn how each UV island maps to view space
        xs = self.localization(uv_texture)
        xs = xs.view(-1, 128 * 53 * 53)
        theta = self.fc_loc(xs).view(-1, 6, 2, 3)
        
        # Apply transformations per car region
        transformed_parts = []
        for i, region_mask in enumerate(self.car_regions):
            grid = F.affine_grid(theta[:, i], uv_texture.size())
            transformed = F.grid_sample(uv_texture, grid)
            transformed_parts.append(transformed * region_mask)
        
        # Combine regions
        result = sum(transformed_parts)
        
        # Apply camera-specific adjustments
        result = self.camera_adjustment(result, camera_params)
        
        return result
```

**Why This Works:**
- UV islands (hood, doors, roof) have predictable shapes
- Spatial transformer learns these shapes from data
- Much faster than ray-tracing or NeRF
- Differentiable end-to-end

---

### Phase 2: Self-Supervised UV Prediction Network

**Goal:** Learn `3D_view → UV_texture` using cycle consistency

```python
class UVPredictionNetwork(nn.Module):
    """Predicts UV texture from 3D showroom view"""
    
    def __init__(self):
        # Encoder: Extract features from 3D view
        self.view_encoder = EfficientNetEncoder()
        
        # Pose estimator: Understand camera angle
        self.pose_estimator = PoseNet()  # Outputs (azimuth, elevation, distance)
        
        # UV decoder: Generate UV unwrapped texture
        self.uv_decoder = UNetDecoder(
            in_channels=512,  # From encoder
            out_channels=3,   # RGB UV texture
            output_size=(2048, 2048)
        )
        
        # Car-specific refinement
        self.car_specific_heads = nn.ModuleDict({
            'ginetta_g55_gt4': RefinementHead(),
            'bmw_m4_gt4': RefinementHead(),
            # ... one per car
        })
    
    def forward(self, showroom_view, car_id):
        # Extract visual features
        features = self.view_encoder(showroom_view)  # (B, 512, 32, 32)
        
        # Estimate camera pose (helps with correspondence)
        pose = self.pose_estimator(showroom_view)  # (B, 3)
        
        # Decode to UV space
        uv_texture = self.uv_decoder(features, pose)  # (B, 3, 2048, 2048)
        
        # Car-specific refinement
        uv_texture = self.car_specific_heads[car_id](uv_texture)
        
        return uv_texture, pose
```

---

### Phase 3: Training with Cycle Consistency

**The Training Loop:**

```python
# Initialize networks
uv_predictor = UVPredictionNetwork()
renderer = UVToViewTransformer()  # Option C from Phase 1

# Training data: We have body*.png and showroom photos
dataset = [
    {'uv': body1.png, 'views': [showroom_2a.jpg, showroom_2b.jpg], 'car': 'ginetta'},
    {'uv': body2.png, 'views': [showroom_2a.jpg, showroom_2b.jpg], 'car': 'ginetta'},
    # ... 5 examples per car × 6 cars = 30 base examples
]

for epoch in range(100):
    for batch in dataloader:
        showroom_view = batch['views'][0]  # Pick one view
        ground_truth_uv = batch['uv']
        car_id = batch['car']
        
        # ========================================
        # FORWARD CYCLE: View → UV → View
        # ========================================
        
        # Step 1: Predict UV from showroom view
        predicted_uv, estimated_pose = uv_predictor(showroom_view, car_id)
        
        # Step 2: Render predicted UV back to view
        reconstructed_view = renderer(predicted_uv, estimated_pose, car_id)
        
        # Cycle consistency loss
        L_cycle = mse_loss(reconstructed_view, showroom_view)
        
        # ========================================
        # BACKWARD CYCLE: UV → View → UV
        # ========================================
        
        # Step 3: Render ground truth UV
        rendered_gt = renderer(ground_truth_uv, estimated_pose, car_id)
        
        # Step 4: Predict UV from rendered view
        reconstructed_uv, _ = uv_predictor(rendered_gt, car_id)
        
        # UV reconstruction loss
        L_uv_recon = l1_loss(reconstructed_uv, ground_truth_uv)
        
        # ========================================
        # SUPERVISION: When we have ground truth
        # ========================================
        
        # Direct UV supervision (when available)
        L_direct = l1_loss(predicted_uv, ground_truth_uv)
        
        # Perceptual loss (use VGG features)
        L_perceptual = perceptual_loss(predicted_uv, ground_truth_uv)
        
        # ========================================
        # COMBINED LOSS
        # ========================================
        
        total_loss = (
            0.3 * L_cycle +           # View consistency
            0.3 * L_uv_recon +        # UV consistency
            0.2 * L_direct +          # Supervised learning
            0.2 * L_perceptual        # Perceptual quality
        )
        
        total_loss.backward()
        optimizer.step()
```

**Why This Works:**

1. **L_cycle ensures view consistency:** Predicted UV, when rendered, must look like input
2. **L_uv_recon ensures UV structure:** Rendered GT, when inverted, recovers UV
3. **L_direct uses ground truth:** We have real UV textures to supervise
4. **L_perceptual ensures quality:** VGG features capture livery patterns

---

### Phase 4: Data Augmentation (Bootstrap More Examples)

**Problem:** Only 5-10 examples per car isn't enough

**Solution:** Use the trained networks to generate synthetic training pairs!

```python
def augment_dataset(uv_predictor, renderer, base_examples):
    """Generate 1000s of training examples from 5-10 base examples"""
    
    augmented = []
    
    for example in base_examples:
        original_uv = example['uv']
        car_id = example['car']
        
        # Strategy 1: Render from different viewpoints
        for azimuth in range(0, 360, 15):  # 24 angles
            for elevation in [-10, 0, 10, 20]:  # 4 elevations
                for distance in [1.5, 2.0, 2.5]:  # 3 distances
                    pose = (azimuth, elevation, distance)
                    
                    # Render UV from this pose
                    synthetic_view = renderer(original_uv, pose, car_id)
                    
                    augmented.append({
                        'view': synthetic_view,
                        'uv': original_uv,
                        'pose': pose,
                        'car': car_id
                    })
        
        # Strategy 2: Color augmentation in UV space
        for color_shift in color_variations():
            augmented_uv = apply_color_shift(original_uv, color_shift)
            
            # Render augmented UV
            synthetic_view = renderer(augmented_uv, random_pose(), car_id)
            
            augmented.append({
                'view': synthetic_view,
                'uv': augmented_uv,
                'car': car_id
            })
        
        # Strategy 3: Pattern modifications
        # Add stripes, decals, number plates at random UV locations
        for pattern in pattern_library:
            modified_uv = composite_pattern(original_uv, pattern)
            synthetic_view = renderer(modified_uv, random_pose(), car_id)
            
            augmented.append({
                'view': synthetic_view,
                'uv': modified_uv,
                'car': car_id
            })
    
    return augmented  # 5 examples × 24 angles × 4 elevations × 3 distances = 1440 examples!
```

**Result:** 5-10 base examples → 10,000+ augmented training pairs

---

### Phase 5: User Inference Pipeline

**User uploads `skin_i_want.jpg` → Get UV texture**

```python
def generate_livery_from_photo(user_photo_path, car_model):
    """
    Main inference function
    
    Args:
        user_photo_path: Path to user's desired livery photo
        car_model: 'ginetta_g55_gt4', 'bmw_m4_gt4', etc.
    
    Returns:
        uv_texture: 2048×2048 UV unwrapped texture ready for AMS2
    """
    
    # Load user photo
    user_photo = load_image(user_photo_path)  # (1, 3, H, W)
    
    # Step 1: Estimate camera pose from photo
    # (helps network understand viewing angle)
    estimated_pose = pose_estimator(user_photo)
    
    # Step 2: Predict UV texture
    predicted_uv, confidence = uv_predictor(
        user_photo, 
        car_id=car_model
    )
    
    # Step 3: Multi-view refinement (if user provides multiple photos)
    if additional_photos:
        uv_maps = []
        confidences = []
        
        for photo in [user_photo] + additional_photos:
            uv, conf = uv_predictor(photo, car_model)
            uv_maps.append(uv)
            confidences.append(conf)
        
        # Weighted fusion
        predicted_uv = weighted_average(uv_maps, weights=confidences)
    
    # Step 4: Post-processing
    # Fix UV seams, ensure seamless tiling
    predicted_uv = fix_uv_seams(predicted_uv, car_model)
    
    # Step 5: Validation render
    # Render UV from same pose as input, check similarity
    validation_render = renderer(predicted_uv, estimated_pose, car_model)
    similarity = ssim(validation_render, user_photo)
    
    if similarity < 0.7:
        # Refinement needed
        predicted_uv = refine_with_diffusion(
            predicted_uv, 
            target=user_photo,
            num_steps=10
        )
    
    # Step 6: Convert to AMS2 format
    dds_file = convert_to_dds(predicted_uv, format='BC7', mipmaps=True)
    
    return dds_file, similarity_score
```

---

## Key Advantages of This Approach

### 1. **No 3D Models Required**
- Don't need Blender
- Don't need to extract AMS2 car models
- Don't need manual UV unwrapping
- Pure 2D→2D learning!

### 2. **Self-Supervised Learning**
- Learns from existing livery examples
- No manual labeling needed
- Cycle consistency provides training signal
- Bootstraps itself with augmentation

### 3. **Car-Specific Adaptation**
- Network learns unique UV layout per car
- Ginetta has different unwrapping than BMW
- Captured in car-specific refinement heads

### 4. **Works with Limited Data**
- 5-10 examples per car is enough to start
- Augmentation generates 1000s more
- Transfer learning from similar cars

### 5. **Handles Multi-View Fusion**
- If user provides multiple photos, combine predictions
- Confidence weighting based on visibility
- Better coverage of entire car surface

---

## Technical Challenges & Solutions

### Challenge 1: Occlusion
**Problem:** Side view doesn't show roof, rear view doesn't show hood

**Solution:**
```python
# Network learns visibility masks
visibility_map = compute_visibility(camera_pose, car_geometry_proxy)

# Only supervise visible regions
loss = mse_loss(predicted_uv * visibility_map, gt_uv * visibility_map)

# For occluded regions, use prior knowledge from other examples
occluded_regions = 1 - visibility_map
uv_prior = get_average_uv_pattern(car_id, occluded_regions)
predicted_uv = predicted_uv * visibility_map + uv_prior * occluded_regions
```

### Challenge 2: UV Seams
**Problem:** UV islands have boundaries that can show artifacts

**Solution:**
```python
def fix_uv_seams(uv_texture, car_model):
    """Ensure seamless transitions at UV island boundaries"""
    
    # Load pre-computed seam locations for this car
    seam_map = load_seam_map(car_model)  # From analyzing ground truth UVs
    
    # Dilate seam regions
    seam_dilation = dilate(seam_map, kernel_size=5)
    
    # Apply Poisson blending at seams
    for seam_region in seam_dilation.split_islands():
        blended = poisson_blend(uv_texture, seam_region)
        uv_texture = composite(uv_texture, blended, seam_region)
    
    return uv_texture
```

### Challenge 3: Color/Lighting Variation
**Problem:** Showroom lighting ≠ target photo lighting

**Solution:**
```python
# Train with photometric augmentation
def augment_lighting(image):
    # Random brightness/contrast
    image = F.adjust_brightness(image, random.uniform(0.7, 1.3))
    image = F.adjust_contrast(image, random.uniform(0.8, 1.2))
    
    # Random color temperature
    temp_shift = random.uniform(-0.1, 0.1)
    image[:, 0] += temp_shift  # Red channel
    image[:, 2] -= temp_shift  # Blue channel
    
    return image

# At inference, normalize lighting before prediction
user_photo = normalize_lighting(user_photo, target_histogram=standard_lighting)
```

### Challenge 4: Low-Resolution Input
**Problem:** User's photo might be 800×600, but UV needs to be 2048×2048

**Solution:**
```python
# Two-stage generation: coarse + refinement
class CoarseToFineUVGenerator(nn.Module):
    def __init__(self):
        self.coarse_net = UVPredictionNetwork(output_size=512)
        self.refinement_net = SuperResolutionNetwork(scale=4)
    
    def forward(self, low_res_input):
        # Stage 1: Generate 512×512 UV
        coarse_uv = self.coarse_net(low_res_input)
        
        # Stage 2: Upscale to 2048×2048 with detail
        fine_uv = self.refinement_net(coarse_uv)
        
        return fine_uv
```

---

## Implementation Roadmap

### Week 5: Foundation (Nov 11-17)
**Day 1-2: Data Preparation**
- Organize existing GT4 liveries (body*.png, showroom*.jpg)
- Create dataset loader with car-specific handling
- Implement pose estimation (simple regression or pre-trained model)

**Day 3-4: Differentiable Renderer**
- Implement UVToViewTransformer (Spatial Transformer Network approach)
- Train on known UV→view pairs
- Validate: render(body2.png, pose) ≈ showroom_2a.jpg

**Day 5-7: UV Prediction Network**
- Implement UVPredictionNetwork architecture
- Basic training loop with cycle consistency
- Test on 1 car (Ginetta) first

**Deliverable:** Can predict UV from showroom photo with 60-70% accuracy

### Week 6: Self-Supervised Training (Nov 18-24)
**Day 8-10: Full Training Pipeline**
- Implement all loss functions (cycle, direct, perceptual)
- Train on all 6 GT4 cars
- Hyperparameter tuning

**Day 11-12: Data Augmentation**
- Implement synthetic viewpoint generation
- Color/pattern augmentation
- Expand dataset to 10,000+ examples

**Day 13-14: Validation & Debugging**
- Visual inspection of predictions
- Identify failure modes
- Fix seam artifacts

**Deliverable:** 80-85% accuracy on test set

### Week 7: Refinement & Quality (Nov 25 - Dec 1)
**Day 15-17: Diffusion-Based Refinement**
- Integrate SDXL for texture detail enhancement
- ControlNet conditioning on coarse UV prediction
- Fine-tune for racing livery style

**Day 18-19: Multi-View Fusion**
- Implement confidence-weighted averaging
- Handle occlusion intelligently
- Test with 2-3 input photos

**Day 20-21: Post-Processing**
- UV seam fixing
- Resolution upscaling (512→2048)
- DDS conversion pipeline

**Deliverable:** 90%+ accuracy, production-quality UV textures

### Week 8: Integration & Testing (Dec 2-8)
**Day 22-24: Backend API**
- FastAPI endpoint for inference
- Handle file uploads (JPEG, PNG)
- Return DDS file + preview renders

**Day 25-27: Frontend UI**
- Upload interface (single or multi-photo)
- Car model selector
- Live preview of generated UV

**Day 28: End-to-End Testing**
- Test with real user photos
- Validate in AMS2 (actually apply livery and drive!)

**Deliverable:** Working POC - upload photo, get AMS2 livery

### Week 9-10: Polish & Documentation (Dec 9-22)
**Day 29-35: User Testing**
- Collect feedback from GridVox team
- Fix edge cases
- Improve quality on difficult photos

**Day 36-40: Documentation**
- Training guide (how to add new cars)
- API documentation
- User manual

**Day 41-43: Performance Optimization**
- TensorRT for faster inference
- Model quantization (FP16)
- Batch processing

**Day 44: Release**
- Package for distribution
- Demo video
- Blog post explaining approach

---

## Success Metrics

### Technical Metrics
- **UV Prediction Accuracy:** SSIM > 0.85 vs ground truth (when available)
- **Rendering Consistency:** render(predicted_UV) ≈ input_photo (SSIM > 0.80)
- **Inference Speed:** <10 seconds per livery on RTX 4090
- **Generalization:** Works on unseen livery designs

### User Metrics
- **Approval Rate:** >75% of generated liveries accepted without editing
- **Iteration Count:** <2 attempts to get desired result
- **Ease of Use:** Single photo upload → working livery

### Dataset Growth
- **Week 5:** 30 base examples (5 per car × 6 cars)
- **Week 6:** 10,000 augmented examples
- **Week 7:** 50,000+ with diffusion-generated variations

---

## Why This Will Work

### 1. **Proven Architecture Pattern**
- Cycle consistency: CycleGAN (image-to-image), DensePose (3D-to-2D)
- Spatial transformers: proven for geometric understanding
- Self-supervision: NeRF, inverse graphics research

### 2. **Sufficient Training Signal**
- 5-10 examples per car × 6 cars = 30-60 base pairs
- Augmentation → 10,000+ training pairs
- Cycle consistency provides dense supervision

### 3. **Practical Constraints**
- Cars have predictable UV layouts (hood, roof, doors)
- Racing liveries have strong visual features (stripes, numbers, sponsors)
- AMS2 rendering is consistent (not photo-realistic, so easier to match)

### 4. **Fallback Strategies**
- If single-photo fails, request multiple angles
- If prediction poor, allow manual UV editing
- If new car, transfer learning from similar car

---

## Next Step: Proof of Concept

**Immediate Action (Nov 10-11):**

1. **Test Cycle Consistency Hypothesis**
   ```python
   # 30-minute experiment
   - Load body2.png and showroom_2a.jpg
   - Train simple encoder-decoder: view → UV
   - Check if it learns anything useful
   ```

2. **Validate Renderer Feasibility**
   ```python
   # 1-hour experiment
   - Implement basic spatial transformer
   - See if it can map UV → view at all
   - Doesn't need to be perfect, just differentiable
   ```

3. **Compute Baseline Metrics**
   ```python
   # 30-minute analysis
   - SSIM between body2.png and body1.png (similarity of real liveries)
   - SSIM between showroom_2a and showroom_2b (multi-view consistency)
   - Establishes what "good" looks like
   ```

**Decision Point:** If these 3 experiments show promise (>60% correlation), proceed with full implementation.

---

## Final Thought: The Beauty of Self-Supervision

We're not teaching the AI how UV unwrapping works.  
We're giving it examples and letting it **discover the patterns**.

The network will learn:
- "Hood is top-center of UV map"
- "Doors are left/right sides"
- "Roof wraps around top edge"
- "Bumpers are bottom regions"

All from just looking at body*.png ↔ showroom*.jpg pairs.

**That's the power of modern deep learning.**

No Blender. No manual 3D modeling. Just data and gradients.

Let's build it! 🚀
