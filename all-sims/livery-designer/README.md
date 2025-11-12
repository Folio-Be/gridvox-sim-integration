# GridVox AI Livery Designer

**AI-Powered Custom Livery Generation for Sim Racing**

> Transform any race car photo into a game-ready livery in under 10 minutes using cutting-edge neural UV mapping technology.

---

## 🎯 Project Vision

Create the world's first AI-powered livery designer that eliminates the complexity of UV mapping and texture painting, making professional-grade custom liveries accessible to every sim racer.

### The Problem
- Manual livery creation takes 15-20 hours and requires Photoshop expertise
- UV mapping is confusing and error-prone for beginners
- Professional designers charge $200+ per livery
- Most racers settle for default liveries due to barriers

### Our Solution
- **Upload photo** → **AI generates UV texture** → **Export to game**
- 120x faster than manual workflow (20 hours → 10 minutes)
- No Photoshop or UV mapping knowledge required
- Professional quality (85-95% accuracy)

---

## 📚 Documentation

### Getting Started
| Document | Description |
|----------|-------------|
| [IMPLEMENTATION-CHECKLIST.md](docs/IMPLEMENTATION-CHECKLIST.md) | **Start here!** Detailed 16-week roadmap with phases, checkboxes, and milestones |
| [APPROACH-COMPARISON.md](docs/APPROACH-COMPARISON.md) | **Training data decision:** DreamCar vs CADillac vs Blender vs Hybrid (choose before Phase 2) |
| [USER-STORIES.md](docs/USER-STORIES.md) | 4 user personas (Amateur, League, Creator, Pro Designer) with complete workflows |
| [UI-UX-DESIGN.md](docs/UI-UX-DESIGN.md) | 9 screen specifications + complete Google AI Studio prompts for mockups |

### Research & Analysis
| Document | Description |
|----------|-------------|
| [RESEARCH-FINDINGS.md](docs/RESEARCH-FINDINGS.md) | Analysis of 8 neural UV mapping systems (AUV-Net, FlexPara, GraphSeam, etc.) |
| [AI-3D-TOOLS-COMPARISON.md](docs/AI-3D-TOOLS-COMPARISON.md) | Detailed comparison of TripoSR, Hunyuan3D-2, TRELLIS, Shap-E (Phase 6+ planning) |
| [COMMERCIAL-ANALYSIS.md](docs/COMMERCIAL-ANALYSIS.md) | Trading Paints & RaceControl Livery Hub deep dive, business models, tech stack |
| [OPEN-SOURCE-STATUS.md](docs/OPEN-SOURCE-STATUS.md) | License analysis for all systems, NVIDIA license strategy, commercial feasibility |

### Technical Implementation
| Document | Description |
|----------|-------------|
| [TECHNICAL-ARCHITECTURE.md](docs/TECHNICAL-ARCHITECTURE.md) | System design, direct vs 3D approach, training pipeline, API design, costs |
| [IMPLEMENTATION-ARCHITECTURE.md](docs/IMPLEMENTATION-ARCHITECTURE.md) | Code structure, data flow, state management, error handling, testing strategy |
| [FILE-FORMATS-SPECIFICATION.md](docs/FILE-FORMATS-SPECIFICATION.md) | Complete specs for DDS, TGA, PNG, GVOX, GMT formats with examples |
| [MULTI-SIMULATOR-SUPPORT.md](docs/MULTI-SIMULATOR-SUPPORT.md) | Per-simulator specs (AMS2, iRacing, ACC, LMU), export pipelines, car mappings |

### Implementation Guides
| Document | Description |
|----------|-------------|
| [PCARSTOOLS-EXTRACTION-GUIDE.md](docs/PCARSTOOLS-EXTRACTION-GUIDE.md) | Step-by-step guide for extracting car models/UV templates from AMS2 |
| [BLENDER-AUTOMATION-GUIDE.md](docs/BLENDER-AUTOMATION-GUIDE.md) | Production-ready script for generating 4,800 synthetic training pairs per car |

### Quick Reference
| Document | Description |
|----------|-------------|
| [RESEARCH-SUMMARY.txt](docs/RESEARCH-SUMMARY.txt) | Quick reference summary of key findings and next steps |

---

## 🚀 Current Status

**Phase:** Research & Planning ✅ Complete
**Next:** Phase 1 - MVP Foundation (Weeks 1-4)
**Timeline:** 16 weeks to production launch
**Budget:** $45,000 development + $300 GPU training

### Key Decisions Made
- ✅ **Primary Approach:** AUV-Net style neural UV correspondence (direct photo → UV texture)
- ✅ **Not Pursuing (Yet):** 3D model generation path (TripoSR → Three.js → UV remapping)
- ✅ **Rationale:** Direct approach is faster, simpler, and higher quality
- ✅ **License Strategy:** Request NVIDIA commercial license for AUV-Net; fallback to Neural Surface Maps
- ✅ **Business Model:** 3-tier SaaS ($0 free, $4.99 Pro, $14.99 Creator)

---

## 🎨 Technology Stack

### Frontend
- **Tauri 2.0** - Cross-platform desktop app
- **React 19** - UI framework
- **Three.js** - 3D car previews and optional editor
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Backend
- **Python 3.10+** - AI processing
- **PyTorch 2.9** - Deep learning framework
- **FastAPI** - REST API server
- **AUV-Net** (modified) - Neural UV correspondence learning
- **SDXL + ControlNet** - Texture generation

### Infrastructure
- **NVIDIA RTX 4090** - Development & inference GPU
- **Blender Python API** - Synthetic data generation
- **PCarsTools** - AMS2 asset extraction

### Supported Simulators (MVP)
- ✅ Automobilista 2 (DDS export)
- 🔜 iRacing (TGA export) - Phase 2
- 🔜 Assetto Corsa Competizione (DDS) - Phase 3
- 🔜 Le Mans Ultimate (TGA) - Phase 3

---

## 📊 Success Metrics

### Technical KPIs
- **Generation Quality:** 85-90% accuracy vs reference photo
- **Processing Time:** <30 seconds per livery (RTX 4090)
- **UV Mapping Accuracy:** <5px error on average
- **User Satisfaction:** >80% approval in blind A/B tests

### Business KPIs
- **User Acquisition:** 10,000 liveries generated in first month
- **Conversion Rate:** 60% free → paid tier
- **Churn:** <10% monthly (sticky product)
- **Community Growth:** 50% of users share liveries publicly

---

## 🎯 User Value Proposition

### For Amateur Racers (Primary Persona: "Alex")
- ⏱️ **Time:** 20 hours → 8 minutes (150x faster)
- 💰 **Cost:** $220/livery (designer + Photoshop) → $4.99/month
- 🎨 **Quality:** Amateur (60%) → Professional (85-90%)
- 😊 **Satisfaction:** Frustration & giving up → Racing same day

### For League Organizers
- Create 20 matching liveries in 30 minutes (vs 40 hours)
- Cohesive team branding without hiring designers
- Easy management (CSV upload for driver names/numbers)

### For Content Creators
- Authentic replica liveries for YouTube videos
- Professional production quality
- Monetization via affiliate links

### For Professional Designers
- 5x capacity (generate 80% in 30s, refine 20% in 1-2 hours)
- More competitive pricing
- Focus on creative direction, not tedious UV mapping

---

## 🛠️ Quick Start (When Implemented)

```bash
# Clone repository
git clone https://github.com/GridVox/livery-designer.git
cd livery-designer

# Install dependencies
pnpm install
cd python-backend && pip install -r requirements.txt

# Run development servers
# Terminal 1: Frontend
pnpm tauri dev

# Terminal 2: Python backend
cd python-backend && python main.py
```

**User Workflow:**
1. Open app → Upload race car photo
2. Select target car (e.g., Porsche 992 GT3 R)
3. AI generates livery (30 seconds)
4. Review & adjust colors/logos (optional)
5. Export → Auto-install to Automobilista 2
6. Race!

---

## 🏗️ Development Phases

### Phase 0: Research & Planning ✅ (Complete)
- Neural UV mapping systems evaluation
- Commercial platform analysis
- User research & personas
- UI/UX design specifications

### Phase 1: MVP Foundation (Weeks 1-4)
- Project setup (Tauri + React + Python)
- Clone AUV-Net, verify license
- Extract AMS2 assets (3 GT4 cars)
- Collect training data (5-10 liveries per car)

### Phase 2: Neural UV Mapper Training (Weeks 5-8)
- Implement AUV-Net architecture
- Generate synthetic dataset (Blender: 4,800 pairs)
- Train models for 3 cars
- Validate accuracy (target: 75-85%)

### Phase 3: Web UI Development (Weeks 9-12)
- Landing page & photo upload
- Car selection with 3D previews
- AI generation loading screen
- Preview & review with quality scores
- Basic 2D UV editor

### Phase 4: Export & Integration (Weeks 13-14)
- DDS export pipeline (BC3 compression)
- Auto-installer for AMS2
- iRacing TGA export
- Community marketplace

### Phase 5: Testing & Launch (Weeks 15-16)
- Alpha testing (20 sim racers)
- Performance optimization
- Production deployment
- Marketing campaign (Reddit, Discord, YouTube)

### Phase 6+: Future Enhancements
- 3D editor with Three.js painting
- Multi-simulator support (ACC, LMU, rF2)
- Expand to 50+ car models
- Mobile app (iOS/Android)

---

## 🤝 Contributing

This is currently a research project. Contributions will be welcome once we reach Phase 1.

**Interested in:**
- Sim racing and custom liveries
- Machine learning / computer vision
- 3D graphics programming (Three.js, Blender)
- UI/UX design for creative tools

Join our Discord: [Coming Soon]

---

## 📄 License

**Research Phase:** All documentation is internal to GridVox.
**Code License:** TBD (likely MIT or Apache 2.0 for core, proprietary for AI models)
**Third-Party:** AUV-Net usage requires NVIDIA commercial license approval

---

## 🙏 Acknowledgments

### Research Foundations
- **AUV-Net** (NVIDIA Research) - Learning Aligned UV Maps for Texture Transfer
- **FlexPara** (April 2025) - Flexible Neural Surface Parameterization
- **Neural Surface Maps** (UCL, CVPR 2021) - Differentiable surface representations
- **Texture-GS** (ECCV 2024) - 3D Gaussian Splatting texture editing

### Inspiration
- **Trading Paints** - iRacing livery marketplace & Paint Builder
- **RaceControl Livery Hub** - Le Mans Ultimate community platform
- **Ready Player Me** - Production use of SDXL + ControlNet for outfit texturing

### Community
- r/simracing - User research and feedback
- AMS2 modding community - UV template extraction techniques

---

## 📞 Contact

**Project Lead:** [Your Name]
**Organization:** GridVox
**Email:** [Coming Soon]
**Website:** https://gridvox.com

---

**Last Updated:** January 11, 2025
**Version:** 0.1.0 (Research Phase)
**Status:** 📋 Documentation Complete → 🚧 Ready to Start Phase 1
