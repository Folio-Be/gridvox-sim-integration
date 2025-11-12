# Phase 1: Proof of Concept - AI Livery Designer
## AMS2 AI Livery Designer POC (Weeks 1-8)

**Project Location:** `C:\DATA\SimVox.ai\SimVox.ai-sim-integration\ams2\ams2-ai-livery-designer`

**Goal:** Build a working Tauri-based POC that demonstrates AI-powered livery generation from real-world photos with 70%+ accuracy on 2-3 test cars.

**Budget:** $0 (uses existing hardware)

**Timeline:** 8 weeks

---

## Week 1-2: Environment Setup & Model Selection

### ✅ Development Environment
- [ ] Install Rust and Cargo (latest stable)
- [ ] Install Node.js 18+ and pnpm
- [ ] Install Tauri CLI: `cargo install tauri-cli`
- [ ] Set up Python 3.10+ environment for AI models
- [ ] Install CUDA toolkit for GPU acceleration
- [ ] Verify GPU capabilities (RTX 3060+ recommended)

### ✅ AI Model Setup
- [ ] Install PyTorch with CUDA support
- [ ] Download Stable Diffusion XL model (6.9GB)
- [ ] Set up ControlNet depth/normal conditioning models
- [ ] Install IPAdapter for style transfer
- [ ] Test ComfyUI vs Automatic1111 vs custom pipeline
- [ ] Benchmark generation times on development GPU
- [ ] Document VRAM requirements for each model

### ✅ Tauri POC Project Structure
- [x] Create Tauri app in `ams2-ai-livery-designer/`
- [x] Set up React + TypeScript frontend
- [x] Configure Vite build system (port 1430/1431)
- [x] Set up Rust backend with Tauri commands
- [x] Add Python backend structure (port 8002)
- [x] Configure cross-process communication
- [x] Create asset directory structure

---

## Week 3-4: AMS2 Asset Extraction

### ✅ Extract Livery Files from AMS2
- [ ] Locate AMS2 installation directory
- [ ] Find `.mas`/`.gmt` archive files containing vehicle data
- [ ] Use PCarsTools to extract archives
- [ ] Identify UV texture file formats (DDS, TGA)
- [ ] Extract UV templates for test cars

### ✅ Test Car Selection (2-3 cars)
- [ ] **Car 1:** Porsche 911 GT3 R (popular, good UV layout)
- [ ] **Car 2:** McLaren 720S GT3 (complex surfaces)
- [ ] **Car 3:** (Optional) BMW M4 GT3 (alternative test case)

### ✅ UV Template Analysis
- [ ] Document UV layout patterns for each car
- [ ] Identify seam locations and problematic areas
- [ ] Export UV wireframe overlays for reference
- [ ] Create UV coordinate mapping documentation
- [ ] Extract 3D car models for depth/normal generation

### ✅ Real-World Reference Collection
- [ ] Find 10+ real-world photos of Porsche 911 GT3 R race liveries
- [ ] Find 10+ real-world photos of McLaren 720S GT3 liveries
- [ ] Collect various angles: front, side, rear, 3/4 view
- [ ] Organize by car model and livery style
- [ ] Document photo quality requirements (resolution, lighting)

### ✅ Existing Livery Analysis
- [ ] Extract 5-10 existing AMS2 liveries per test car
- [ ] Analyze DDS compression settings and formats
- [ ] Document color space and texture resolution standards
- [ ] Study how real-world designs translate to UV space
- [ ] Create "ground truth" examples for comparison

---

## Week 5-6: Pipeline Development

### ✅ Basic Processing Pipeline
- [ ] Build photo ingestion module (drag & drop UI)
- [ ] Implement background removal (SAM - Segment Anything Model)
- [ ] Add photo preprocessing (normalization, color correction)
- [ ] Create multi-view photo alignment system
- [ ] Build perspective correction module

### ✅ 3D Model Integration
- [ ] Import extracted 3D car models into pipeline
- [ ] Generate depth maps from 3D geometry
- [ ] Generate normal maps from 3D geometry
- [ ] Create camera position estimation from photos
- [ ] Build 3D-to-2D correspondence mapping

### ✅ AI Generation Module
- [ ] Implement SDXL pipeline integration
- [ ] Add ControlNet conditioning (depth + normals)
- [ ] Configure IPAdapter for style transfer
- [ ] Build UV space projection system
- [ ] Implement texture inpainting for occluded areas

### ✅ Single-Photo Workflow
- [ ] Test: Upload single side-view photo
- [ ] Process: Remove background, extract car
- [ ] Generate: Create UV texture from single view
- [ ] Export: Convert to DDS format
- [ ] Validate: Test in-game with AMS2

### ✅ Quality Metrics
- [ ] Define quality scoring system (0-100%)
- [ ] Implement automated quality checks
- [ ] Add visual comparison tools (before/after)
- [ ] Create error detection (seam misalignment, color shifts)
- [ ] Build user feedback collection mechanism

---

## Week 7-8: Quality Assessment & Iteration

### ✅ Test Generation Campaign
- [ ] Generate 10 liveries for Porsche 911 GT3 R
- [ ] Generate 10 liveries for McLaren 720S GT3
- [ ] Use variety of photo angles and qualities
- [ ] Test different lighting conditions
- [ ] Document generation parameters for each test

### ✅ In-Game Validation
- [ ] Install generated liveries in AMS2
- [ ] Capture in-game screenshots (showroom + track)
- [ ] Compare against source photos
- [ ] Identify common failure modes
- [ ] Document quality patterns by car/angle

### ✅ Quality Analysis
- [ ] Calculate accuracy percentages (target: 70-85%)
- [ ] Measure seam alignment quality
- [ ] Evaluate color accuracy
- [ ] Assess detail preservation
- [ ] Score overall visual fidelity

### ✅ Pipeline Refinement
- [ ] Fix top 3 quality issues identified
- [ ] Optimize generation parameters
- [ ] Improve UV projection accuracy
- [ ] Enhance seam blending
- [ ] Reduce color shift artifacts

### ✅ Documentation & Demo
- [ ] Create before/after comparison gallery (20+ examples)
- [ ] Document successful workflows and settings
- [ ] Record demo video showing end-to-end process
- [ ] Write technical findings report
- [ ] Prepare Phase 2 recommendations

---

## Technical Stack

### Frontend (Tauri + React)
```
- Tauri 2.0+
- React 18+
- TypeScript 5+
- Vite
- TailwindCSS (UI styling)
- Zustand (state management)
- React Dropzone (file uploads)
```

### Backend (Rust)
```
- Tauri commands for file system access
- Image processing (image crate)
- DDS encoding/decoding
- Python bridge for AI models
```

### AI/ML (Python)
```
- PyTorch 2.0+
- Diffusers (Hugging Face)
- Stable Diffusion XL
- ControlNet
- IPAdapter
- Segment Anything Model (SAM)
- OpenCV (image processing)
```

### File Formats
```
- Input: JPG, PNG (photos)
- Processing: PNG (intermediate)
- Output: DDS (BC1/BC3 compression)
- 3D Models: GMT, FBX, OBJ
- UV Maps: PNG, TGA
```

---

## Success Criteria

### Must Have
- ✅ Working Tauri app with drag-and-drop photo upload
- ✅ AI generation produces DDS files compatible with AMS2
- ✅ 70%+ visual accuracy on test cars
- ✅ Generation time <10 minutes per livery
- ✅ Clear documentation of quality limitations

### Nice to Have
- ⭐ Multi-photo support (front + side views)
- ⭐ Real-time preview before generation
- ⭐ Iterative refinement workflow
- ⭐ Automatic quality scoring
- ⭐ 80%+ visual accuracy

---

## Risk Mitigation

### Risk: UV Template Extraction Difficulty
- **Primary:** PCarsTools automation
- **Fallback:** Manual extraction with hex editors
- **Contingency:** Partner with modding community for templates

### Risk: AI Quality Below 70%
- **Primary:** Fine-tune models on racing livery dataset
- **Fallback:** Add manual refinement tools
- **Contingency:** Position as "starting point" generator

### Risk: GPU Memory Limitations
- **Primary:** Use model quantization (FP16, INT8)
- **Fallback:** Implement tile-based processing
- **Contingency:** Cloud API for low-end GPUs

### Risk: AMS2 Game Updates Breaking Compatibility
- **Primary:** Version detection and warnings
- **Fallback:** Maintain compatibility matrix
- **Contingency:** Community mod repository backup

---

## Deliverables

1. **Working POC Application**
   - Tauri desktop app (Windows)
   - Photo upload and processing UI
   - AI generation integration
   - DDS export functionality

2. **Test Livery Gallery**
   - 20+ generated liveries
   - Before/after comparisons
   - In-game screenshots
   - Quality metrics for each

3. **Technical Documentation**
   - Installation guide
   - Usage workflow
   - Quality assessment report
   - Known limitations and issues

4. **Phase 2 Recommendations**
   - Features to add for MVP
   - Cars to prioritize
   - UI/UX improvements needed
   - Performance optimizations

---

## Next Immediate Actions (This Week)

### Day 1-2: Setup
- [ ] Install Rust, Node.js, Python toolchains
- [ ] Create Tauri project structure
- [ ] Set up Git repository
- [ ] Install SDXL models locally

### Day 3-4: Asset Extraction
- [ ] Extract first UV template from AMS2
- [ ] Find reference photos for Porsche 911 GT3 R
- [ ] Extract 3D model files

### Day 5-7: First Generation
- [ ] Build basic photo upload UI
- [ ] Integrate SDXL pipeline
- [ ] Generate first test livery
- [ ] Test in AMS2

---

## Progress Tracking

**Started:** November 10, 2025
**Current Week:** Week 1
**Completion:** 15%

**Last Updated:** November 10, 2025
**Status:** Development - Project Structure Complete

---

## Notes & Observations

_(Add notes here as development progresses)_

---

## Resources

### AMS2 Modding
- [AMS2 Content Manager](https://github.com/OpenSimTools/AMS2CM)
- [PCarsTools](https://github.com/lazd/pcarstools)
- [Overtake Modding Forums](https://www.overtake.gg/downloads/categories/automobilista-2.8/)

### AI/ML Resources
- [Stable Diffusion XL Documentation](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- [ControlNet GitHub](https://github.com/lllyasviel/ControlNet)
- [Segment Anything Model](https://github.com/facebookresearch/segment-anything)

### Tauri
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri + Python Integration](https://tauri.app/v1/guides/building/sidecar/)

---

**End of Phase 1 Planning Document**
