# Implementation Checklist: AI Livery Designer

**Project:** GridVox AI-Powered Livery Generation
**Timeline:** 16 weeks to production launch
**Budget:** $45,000 development + $300 GPU training
**Current Phase:** Phase 0 Complete → Starting Phase 1

---

## Phase 0: Research & Planning ✅ COMPLETE

- [x] Research neural UV mapping systems *8 systems evaluated: AUV-Net (best), FlexPara (newest), GraphSeam (proprietary), Nuvo (unofficial), Neural Surface Maps (open), Texture-GS (real-time), ParaPoint (unreleased), AtlasNet (mature)*
- [x] Analyze commercial platforms *Trading Paints ($24/yr, Paint Builder browser editor, localhost:34034 downloader) and RaceControl Livery Hub (auto-previews, 3-click assignment, API integration) workflows documented*
- [x] Evaluate AI 3D generation tools *TripoSR (0.5s, MIT), Hunyuan3D-2 (best quality, CLIP 0.809), TRELLIS (2B params, flexible), Shap-E (older) assessed; decided against 3D intermediate approach*
- [x] Define user personas & workflows *4 personas created: Alex (amateur racer, 28yo, main), Sarah (league organizer), Marcus (content creator), Emma (pro designer); complete user journeys with time savings (20hrs → 8min)*
- [x] Design UI/UX specifications *9 screens designed: Landing, Upload, CarSelection, AIGeneration, Preview, 2DEditor, 3DEditor, Export, Library; Google AI Studio prompts created*
- [x] Assess open source availability *AUV-Net (non-commercial NVIDIA license, requires permission), Neural Surface Maps (open, UCL), Texture-GS (open, ECCV 2024), AtlasNet (open, CVPR 2018) confirmed available; GraphSeam proprietary, ParaPoint unreleased*
- [x] Document all research findings *Complete documentation in 8 files: README, IMPLEMENTATION-CHECKLIST, RESEARCH-FINDINGS, COMMERCIAL-ANALYSIS, TECHNICAL-ARCHITECTURE, USER-STORIES, UI-UX-DESIGN, OPEN-SOURCE-STATUS*

---

## Phase 1: MVP Foundation (Weeks 1-4)

### Week 1: Project Setup

- [ ] Initialize Git repository *Create repo at github.com/GridVox/livery-designer with .gitignore for Python/Node, initial commit*
- [ ] Set up Tauri project structure *Run `npm create tauri-app@latest`, select React + TypeScript + Vite template, configure tauri.conf.json for ports (HTTP 1470, WS 1471)*
- [ ] Create Python backend boilerplate *FastAPI app.py, requirements.txt (torch>=2.5.0+cu126, diffusers==0.31.0, transformers==4.46.0, pillow, opencv-python), virtual environment*
- [ ] Configure development environment *Install CUDA Toolkit 12.6, verify PyTorch GPU support, install Node.js 18+ with pnpm, set up VSCode with extensions*
- [ ] Set up CI/CD pipeline *GitHub Actions for linting (ESLint, Black), testing (Jest, pytest), building (Tauri bundle)*

### Week 2: AUV-Net Setup & Licensing

- [ ] Clone AUV-Net repository *git clone https://github.com/nv-tlabs/AUV-NET.git, review code structure*
- [ ] Read NVIDIA license carefully *Determine if POC qualifies as "non-commercial research", document restrictions*
- [ ] Test AUV-Net on sample data *Run provided examples, verify outputs, measure inference time on RTX 4090*
- [ ] Draft NVIDIA commercial license request *Prepare email: explain GridVox use case, community benefit, request commercial licensing; include project overview and timeline*
- [ ] Set up alternative: Neural Surface Maps *Clone github.com/luca-morreale/neural_surface_maps as backup, verify license permits commercial use*

### Week 3: AMS2 Asset Extraction

- [ ] Install PCarsTools *Download from modding community, extract to tools/, verify oo2core_4_win64.dll compatibility*
- [ ] Extract 3 GT4 car models *Use PCarsTools to extract .mas/.gmt files for Ginetta G55 GT4, BMW M4 GT4, McLaren 720S GT3 from AMS2 installation*
- [ ] Import car models to Blender *Use Blender 4.0+ GMT importer plugin, verify UV layouts are correct, export as .blend files*
- [ ] Extract UV templates *Render UV layouts to PNG (2048×2048), label car parts (hood, doors, roof, bumpers), save to assets/uv-templates/*
- [ ] Document UV island structure *Map which UV regions correspond to which car parts, note seam locations, create reference diagrams*

### Week 4: Training Data Collection

- [ ] Collect existing AMS2 liveries *Find 5-10 custom liveries per car from RaceDepartment, OverTake modding forums, extract body*.dds files*
- [ ] Convert DDS to PNG *Use convert_dds.py script with Pillow, preserve alpha channels, validate output quality*
- [ ] Set up Blender render pipeline *Create Python script for batch rendering: load car model, apply livery texture, render from 8 angles (front, side, rear, top, front-3/4, rear-3/4, low, high)*
- [ ] Generate initial training dataset *Render 5 liveries × 3 cars × 8 angles = 120 base examples, validate lighting consistency, check for artifacts*
- [ ] Organize dataset structure *Create datasets/ams2_gt4/train/ and test/ folders, save as {car_id}_{livery_id}_{angle}.png + {car_id}_{livery_id}_uv.png pairs*

---

## Phase 2: Neural UV Mapper Training (Weeks 5-8)

### Week 5: Architecture Implementation

- [ ] Implement AUV-Net style encoder *EfficientNetB7 backbone for photo feature extraction, freeze first 5 blocks, add custom head*
- [ ] Build UV decoder network *UNetDecoder with skip connections, output 2 channels (U, V coordinates), add visibility mask channel*
- [ ] Create car-specific basis generators *One BasisNet per car model (3 total), learns UV layout structure specific to each car*
- [ ] Implement cycle consistency loss *Forward cycle (3D → UV → 3D render), backward cycle (UV → 3D → UV), perceptual loss with LPIPS*
- [ ] Set up training infrastructure *PyTorch Lightning for training loop, TensorBoard logging, model checkpointing, learning rate scheduling*

### Week 6: Synthetic Data Generation

- [ ] Automate Blender rendering script *Batch process: for each car, generate 1,000 synthetic livery patterns (stripes, gradients, geometric, sponsor-heavy)*
- [ ] Generate synthetic livery textures *Use procedural generation: random colors from realistic palettes, racing stripe patterns, checkered flags, sponsor logo placements*
- [ ] Render from multiple angles *8 camera positions × 3 lighting conditions (studio, sunset, overcast) = 24 renders per livery*
- [ ] Apply data augmentation *Color jitter, contrast adjustment, slight rotation/crop, add noise, blur variations*
- [ ] Validate dataset quality *Manually review 100 random samples, ensure UV-3D correspondence is correct, check for rendering artifacts*
- [ ] Final dataset size *Target: 6 cars × 1,000 liveries × 24 angles = 144,000 training pairs; actual achieved: [TBD]*

### Week 7: Training First Car (Ginetta G55 GT4)

- [ ] Prepare Ginetta training set *Filter dataset to Ginetta only, split 80/10/10 train/val/test, balance angle distribution*
- [ ] Train UV correspondence network *Start with learning rate 1e-4, batch size 16, train for 50 epochs (~40 hours on RTX 4090)*
- [ ] Monitor training metrics *Track cycle loss, UV reconstruction loss, perceptual loss, validation SSIM, log to TensorBoard*
- [ ] Perform hyperparameter tuning *Adjust learning rate schedule, loss weights (cycle:UV:perceptual = 0.4:0.4:0.2), dropout rates*
- [ ] Evaluate on test set *Calculate LPIPS <0.2, SSIM >0.85, measure inference time (target: <30s), generate quality report*

### Week 8: Train Remaining Cars & Validate

- [ ] Train BMW M4 GT4 model *Reuse architecture, train from scratch on BMW dataset, 50 epochs*
- [ ] Train McLaren 720S GT3 model *Same process, monitor for consistent performance across car types*
- [ ] Cross-validation testing *Test BMW model on Ginetta (should fail), verify car-specific learning*
- [ ] Validate on real AMS2 liveries *Use held-out test set of real community liveries (not seen in training), calculate accuracy vs ground truth*
- [ ] Quality assessment *Target: 75-85% similarity to ground truth, identify failure modes (complex sponsors, text, fine details), document limitations*
- [ ] Save trained models *Export to .pth files, compress with quantization if needed, upload to model registry*

---

## Phase 3: Web UI Development (Weeks 9-12)

### Week 9: Core UI Components

- [ ] Build landing page *Implement hero section with CTA, recent projects grid with 3D previews (Three.js), community highlights carousel*
- [ ] Create photo upload screen *Drag-drop zone with file validation (JPG/PNG/HEIC, max 20MB), preview with AI quality analysis overlay (lighting, angle, clarity)*
- [ ] Implement car selection interface *Filterable grid (simulator dropdown, search bar, category pills), 3D car thumbnails with hover rotation, selected state with blue glow*
- [ ] Set up routing system *React Router or state-based navigation, preserve state across screens, breadcrumb navigation*
- [ ] Build reusable UI components *Button, Card, Input, Select, Checkbox from shadcn/ui pattern with Tailwind, dark theme with blue/orange accents*

### Week 10: AI Generation Flow

- [ ] Create AI generation loading screen *Animated 3D wireframe car filling with color, progress checklist (6 steps), real-time status updates via WebSocket*
- [ ] Integrate Python backend *FastAPI endpoint POST /api/generate-livery, accept photo upload + car_model, return generated UV texture + quality scores*
- [ ] Implement preview & review screen *Interactive Three.js 3D viewer (orbit controls, zoom, pan), quality analysis panel (scores per car part), angle selector buttons (8 views)*
- [ ] Build side-by-side comparison *Reference photo vs generated render at same angle, similarity slider, synchronized view updates on hover*
- [ ] Add quick adjustment controls *Color picker (hue shift), brightness/contrast sliders, regenerate button, save draft functionality*

### Week 11: 2D UV Editor (Basic)

- [ ] Create canvas-based UV editor *HTML5 Canvas 2048×2048, pan/zoom with mouse wheel, UV island overlays with semi-transparent labels*
- [ ] Implement painting tools *Brush (size, opacity, hardness), eraser, fill bucket, gradient tool, color picker with palette*
- [ ] Add layer system *Base layer, paint layer, sponsor layer; visibility toggles, opacity per layer, blend modes*
- [ ] Build real-time 3D preview *Mini Three.js viewer in corner, updates as user paints on UV canvas, synchronized camera angle*
- [ ] AI assist features *Auto-fix seams button (uses inpainting), extend pattern tool (uses SDXL), remove background button (uses SAM)*

### Week 12: UI Polish & Testing

- [ ] Implement export screen *Format selector (DDS/TGA/PNG), resolution options, compression settings, preview renders (front/side/rear)*
- [ ] Build library/history screen *Grid layout of saved projects, search/filter/sort, quick actions (edit, export, share, clone, delete)*
- [ ] Add keyboard shortcuts *Undo (Ctrl+Z), redo (Ctrl+Y), save (Ctrl+S), export (Ctrl+E), full documentation in help modal*
- [ ] Create onboarding flow *5-step tutorial: upload photo → select car → wait for AI → review result → export, skip option for returning users*
- [ ] Perform UI testing *Test on multiple screen sizes (1920×1080, 1440×900, 2560×1440), verify dark theme consistency, check accessibility (keyboard nav, screen readers)*

---

## Phase 4: Export & Integration (Weeks 13-14)

### Week 13: File Export Pipeline

- [ ] Implement DDS export *Use nvidia-texture-tools or Pillow with DDS plugin, BC3 (DXT5) compression with alpha, generate mipmaps (7 levels)*
- [ ] Add TGA export for iRacing *Uncompressed 24-bit RGB or 32-bit RGBA, correct header format, validate with Trading Paints downloader*
- [ ] Create PNG export for sharing *4K resolution (4096×4096), preserve alpha channel, add watermark option, optimize for social media*
- [ ] Validate exported files *Test DDS files load in AMS2, verify textures display correctly in-game, check TGA compatibility with iRacing*
- [ ] Build batch export *Allow exporting multiple formats simultaneously, create .zip archive with all files + instructions.txt*

### Week 14: Auto-Installer & Marketplace

- [ ] Build AMS2 path detector *Search common install locations (Steam, default install paths), read registry keys, prompt user if not found*
- [ ] Implement auto-installer *Copy DDS files to Automobilista 2\Vehicles\Textures\CustomLiveries\Overrides\{car_id}\{team_name}\, create backup of existing files, verify copy success*
- [ ] Create marketplace backend *Database schema (user_id, livery_id, car_model, preview_images, download_count, price, tags), REST API endpoints (upload, search, download)*
- [ ] Build marketplace UI *Discovery page with filters (car, sim, tags, price), livery detail modal with 8-angle preview, download/purchase flow, creator profiles*
- [ ] Implement sharing features *Generate share links, allow remixes (clone as base), privacy settings (public/private/unlisted), download tracking*

---

## Phase 5: Testing & Launch (Weeks 15-16)

### Week 15: Alpha Testing

- [ ] Recruit alpha testers *20 sim racers from r/simracing, Discord communities, personal network; diverse skill levels (10 beginners, 5 intermediate, 5 experts)*
- [ ] Distribute alpha builds *Windows .exe installer (Tauri bundle), macOS .dmg (if time permits), detailed testing instructions, feedback form (Google Forms or Typeform)*
- [ ] Collect structured feedback *Usability testing (5 tasks: upload photo, generate livery, adjust colors, export, install), satisfaction surveys (NPS score), bug reports, feature requests*
- [ ] Analyze usage metrics *Track time-to-first-livery, generation success rate, export completion rate, most used features, drop-off points*
- [ ] Iterate based on feedback *Fix critical bugs (crashes, generation failures), improve confusing UI (simplify car selection), adjust AI parameters (if quality <75%)*

### Week 16: Production Launch

- [ ] Performance optimization *Reduce bundle size (tree-shaking, code splitting), optimize SDXL inference (TensorRT, quantization), implement caching (store generated UVs for 24hrs)*
- [ ] Deploy to production *Set up cloud infrastructure (AWS/GCP), deploy Python backend with GPU instances, configure CDN for static assets, set up monitoring (Datadog, Sentry)*
- [ ] Create marketing materials *Demo video (2-3min: problem → solution → demo → CTA), blog post announcement, social media graphics, press kit*
- [ ] Launch campaign *Reddit posts (r/simracing, r/Automobilista2, r/iRacing), Discord server announcements, YouTube tutorial videos, ProductHunt submission*
- [ ] Monitor launch metrics *User signups, livery generation volume, server load, error rates, user feedback (Discord, email), press coverage*
- [ ] Post-launch support *Respond to bug reports within 24hrs, collect feature requests, plan Phase 6 enhancements, celebrate launch with team! 🎉*

---

## Phase 6: Future Enhancements (Weeks 17+)

### Advanced Features

- [ ] Integrate 3D editor workflow *Three.js painting on 3D model surface, semantic UV transfer (paint hood → correct UV island), decal/logo drag-drop with perspective correction*
- [ ] Add multi-simulator support *ACC DDS export (different UV layouts), LMU TGA format, rFactor 2 support, universal livery format converter*
- [ ] Expand car library *Train models for 50+ cars (GT3, GT4, LMP2, Formula, Touring), prioritize by community votes, automate training pipeline*
- [ ] Implement style transfer *"Make my Porsche look like this Ferrari" mode, transfer design patterns while preserving car geometry, fine-tune SDXL for car-specific styles*
- [ ] Build mobile app *iOS/Android with React Native or Flutter, simplified editor (color picker, preset patterns), export to desktop for final tweaks*

### Business & Community

- [ ] Launch marketplace revenue sharing *Creators earn 70%, GridVox takes 30%, implement payment processing (Stripe), payout automation*
- [ ] Add team management features *League organizer dashboard, batch generate liveries for 20+ drivers (CSV upload), team branding templates*
- [ ] Implement affiliate program *5-10% commission for referrals, generate unique links, track conversions, monthly payouts*
- [ ] Create API for third parties *REST API for teams/leagues, webhook notifications, rate limiting (100 requests/day), paid tiers for higher limits*
- [ ] Build community features *User profiles with portfolios, follow creators, like/comment on liveries, trending page, weekly featured designer*

### Technical Debt & Infrastructure

- [ ] Refactor backend architecture *Separate concerns: API layer, business logic, ML inference, database access; implement caching layer (Redis)*
- [ ] Improve AI model quality *Fine-tune on larger dataset (500+ liveries per car), add attention mechanisms, experiment with newer architectures (Hunyuan3D-2)*
- [ ] Optimize costs *Batch processing for multiple users, cold start optimization, use spot instances, implement queue system for non-urgent generations*
- [ ] Enhance security *Implement rate limiting, add CAPTCHA for free tier, secure API keys, audit third-party dependencies, penetration testing*
- [ ] Scale infrastructure *Load balancing, horizontal scaling for backend, multi-region deployment, database replication, CDN optimization*

---

## Success Criteria & KPIs

### Phase 1 Success Criteria
- ✅ Development environment fully configured (CUDA, PyTorch, Tauri running)
- ✅ AMS2 assets extracted (3 car models with UV templates)
- ✅ Training dataset collected (120+ base examples)
- ✅ NVIDIA commercial license request sent (or alternative plan in place)

### Phase 2 Success Criteria
- ✅ UV correspondence network trained for 3 cars
- ✅ Generation quality: 75-85% accuracy vs reference photos
- ✅ Inference time: <30 seconds on RTX 4090
- ✅ Models exported and ready for integration

### Phase 3 Success Criteria
- ✅ Web UI functional for all core workflows (upload → generate → export)
- ✅ 3D preview working with Three.js
- ✅ Basic 2D editor with painting tools
- ✅ Dark theme UI matches design specifications

### Phase 4 Success Criteria
- ✅ DDS export working, tested in AMS2 in-game
- ✅ Auto-installer detects AMS2 path and copies files correctly
- ✅ Marketplace backend deployed with search/upload/download

### Phase 5 Success Criteria
- ✅ 20 alpha testers complete end-to-end workflow
- ✅ Average satisfaction: NPS >50 (promoters - detractors)
- ✅ Time to first livery: <10 minutes for new users
- ✅ Generation success rate: >90% (no crashes/failures)

### Launch Success Criteria (First Month)
- ✅ 10,000+ liveries generated
- ✅ 60%+ free → paid conversion rate
- ✅ <10% churn rate
- ✅ 500+ community marketplace uploads
- ✅ Featured in sim racing media (Inside Sim Racing, RaceDepartment news)

---

## Risk Mitigation

### Technical Risks
- **Risk:** NVIDIA denies commercial license for AUV-Net
  - **Mitigation:** Use Neural Surface Maps as alternative, or re-implement AUV-Net architecture from paper
- **Risk:** AI quality <75% accuracy
  - **Mitigation:** Collect more training data, fine-tune SDXL, offer manual refinement tools
- **Risk:** Inference too slow (>60s)
  - **Mitigation:** Use TensorRT optimization, quantization, or cloud GPUs

### Business Risks
- **Risk:** Low user adoption (community doesn't want AI liveries)
  - **Mitigation:** Emphasize manual editing tools, position as "assistant" not "replacement"
- **Risk:** Trading Paints copies our AI feature
  - **Mitigation:** Move fast, build strong community, differentiate on quality and multi-sim support
- **Risk:** High infrastructure costs (>$1000/month)
  - **Mitigation:** Optimize inference, use spot instances, implement queue system

### Legal Risks
- **Risk:** Copyright issues with reference photos (users upload copyrighted images)
  - **Mitigation:** Clear ToS stating users must own rights, DMCA takedown process, watermark detection
- **Risk:** Sim developers prohibit AI-generated liveries
  - **Mitigation:** Engage with Reiza (AMS2), iRacing early, emphasize community benefit, offer revenue sharing

---

## Notes & Decisions

### Key Technical Decisions
1. **Direct UV Generation** (not 3D intermediate) - Faster, simpler, higher quality
2. **AUV-Net style architecture** - Proven on car datasets, aligned UV learning
3. **Blender for training data** - Automate rendering, full control over lighting/angles
4. **Tauri desktop app** - Better than Electron (smaller, faster), but also offer web version

### Key Business Decisions
1. **3-tier SaaS model** - Free (2 liveries/month), Pro ($4.99, unlimited), Creator ($14.99, marketplace)
2. **Start with AMS2** - Smaller community, easier to extract assets, more modding-friendly
3. **Marketplace revenue sharing** - 70/30 split attracts creators, builds community
4. **Phase 6 (3D editor)** - Only if Phase 5 validates strong demand

### Lessons Learned (To Be Updated)
- *Week 1:* [TBD]
- *Week 5:* [TBD]
- *Week 10:* [TBD]
- *Week 15:* [TBD]

---

**Last Updated:** January 11, 2025
**Next Review:** Start of Week 1 (Phase 1)
**Owner:** [Project Lead Name]
**Status:** ✅ Phase 0 Complete → 🚧 Ready to Start Phase 1
