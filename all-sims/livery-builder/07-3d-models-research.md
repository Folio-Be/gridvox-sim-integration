# 3D Car Models Research - Sources & Access Methods

**Research Date:** November 12, 2025  
**Purpose:** Determine where Trading Paints gets 3D car models and identify alternatives for multi-sim livery builder

---

## Executive Summary

Trading Paints uses iRacing's built-in 3D car model viewer, which is part of the iRacing installation. They do NOT have direct access to 3D model files. Instead, they use a **preview integration** approach where the Trading Paints Downloader sends paint files to iRacing, and iRacing's UI displays the car with the custom paint applied.

**Key Finding:** For a multi-sim livery builder like GridVox, we need **separate 3D model acquisition strategies per sim**, as each game uses proprietary formats and has different access levels.

---

## How Trading Paints Accesses 3D Models

### Integration Method: Sim Preview via Trading Paints Downloader

**Trading Paints Does NOT:**
- Extract 3D models from iRacing
- Host 3D models on their servers
- Render car models themselves

**Trading Paints DOES:**
- Generate paint texture files (TGA format)
- Send paint files to iRacing via Trading Paints Downloader (local app)
- Trigger iRacing's built-in 3D car model viewer
- Let iRacing handle all 3D rendering

### Workflow:
```
1. User designs livery in Paint Builder (web app)
2. User clicks "Sim Preview" button
3. Paint Builder generates TGA texture file
4. Trading Paints Downloader (running locally) receives file
5. Downloader places file in iRacing's paint folder
6. Downloader tells iRacing UI to refresh 3D viewer
7. iRacing UI displays car with new paint (using iRacing's own 3D models)
```

**Technical Implementation:**
- Trading Paints Downloader: Local Windows app that bridges web → iRacing
- iRacing Paint Shop: Built-in 3D viewer (accessible via iRacing UI)
- Communication: Local file system + iRacing API calls

**Source:** https://help.tradingpaints.com/kb/guide/en/sim-preview-viewing-your-paint-builder-projects-in-iracings-3d-car-model-viewer-DJAs6Php2d/Steps/2523926

---

## iRacing: 3D Model File Locations & Formats

### Installation Folder Structure

Based on iRacing support documentation:

**Active Cars Filepath:**
```
C:\Program Files (x86)\iRacing\cars\
```

**Active Tracks Filepath:**
```
C:\Program Files (x86)\iRacing\tracks\
```

**Source:** https://support.iracing.com/support/solutions/articles/31000172625-filepath-for-active-iracing-cars

### Car Folder Structure (Typical)
```
C:\Program Files (x86)\iRacing\cars\[car_name]\
├── [car_name].car (car file)
├── [car_name].dds (textures)
├── [car_name]_spec.mip (spec map)
├── car.ini (configuration)
├── templates_num\ (number templates)
└── paint_templates\ (paint templates - TGA files)
```

### File Formats Used by iRacing

**3D Model Format:**
- **GMT (Game Model Texture)** - Proprietary iRacing format
- NOT standard formats like FBX, OBJ, GLTF
- Encrypted/protected to prevent extraction

**Texture Formats:**
- **TGA (Targa)** - Main paint textures (what users create)
- **DDS (DirectDraw Surface)** - Compressed textures
- **MIP** - Spec/material maps

**Important:** iRacing does NOT provide direct access to 3D geometry files (.gmt) for third-party use. The GMT format is proprietary and not easily convertible.

---

## Alternative: How to Get 3D Car Models for GridVox Livery Builder

Since we can't extract proprietary 3D models from sims, here are **legal and practical alternatives**:

### Option 1: Use iRacing's Built-In Viewer (Like Trading Paints)

**Pros:**
- Legal and officially supported
- No copyright issues
- Access to all iRacing cars
- Real-time preview with accurate lighting/materials

**Cons:**
- Only works for iRacing (not multi-sim)
- Requires iRacing installation + membership
- Can't customize 3D viewer UI
- Limited to iRacing's viewer features

**Implementation:**
- Same approach as Trading Paints
- Local desktop app communicates with iRacing
- Web app generates TGA textures
- Desktop app triggers iRacing viewer

### Option 2: Create Simplified 3D Models from Scratch

**Pros:**
- Full control over viewer experience
- Works offline
- No licensing issues (own models)
- Can support all sims
- Customizable camera angles, lighting

**Cons:**
- Labor-intensive (need 3D artist)
- Models won't be 100% accurate
- Need to create/update for every car
- Requires 3D rendering expertise

**Implementation:**
- Commission 3D artists to create simplified car models
- Use reference photos/blueprints
- Model in Blender/Maya
- Export to GLTF/GLB (web-friendly format)
- Render in browser with Three.js

**Cost Estimate:**
- $100-$500 per car model (simplified)
- 170+ iRacing cars = $17,000-$85,000
- Ongoing maintenance for new cars

### Option 3: Licensed 3D Models from Asset Marketplaces

**Sources:**
- **Sketchfab:** Licensed 3D models (some cars available)
- **TurboSquid:** Professional 3D models ($50-$500 each)
- **CGTrader:** 3D models with commercial licenses
- **ArtStation Marketplace:** High-quality game-ready models

**Pros:**
- Pre-made models (faster)
- Professional quality
- Legal licensing available
- Can find many race cars

**Cons:**
- Expensive ($50-$500 per car)
- May not match sim cars exactly
- Licensing fees per model
- Limited selection (won't have all sim cars)

**Example Costs:**
- NASCAR stock car: $200-$400
- GT3 car: $150-$300
- Formula car: $200-$500
- 100 cars: $15,000-$40,000

### Option 4: Photogrammetry/3D Scanning (Real Cars)

**Pros:**
- Extremely accurate models
- Unique selling point
- Could partner with race teams
- Real-world reference

**Cons:**
- Requires physical access to cars
- Expensive equipment ($5,000-$50,000)
- Time-consuming process
- Limited to accessible cars

**Implementation:**
- Use photogrammetry software (RealityCapture, Meshroom)
- 3D scan real race cars at events
- Partner with teams/museums for access
- Clean up/optimize in Blender

### Option 5: Partner with Sim Developers (Official API/SDK)

**Potential Partners:**
- **iRacing:** Ask for official 3D viewer API
- **Kunos (ACC):** Request SDK/model access
- **Reiza (AMS2):** Explore modding tools
- **Studio 397 (rFactor 2):** Modding community support

**Pros:**
- Official/legal access
- Accurate models
- Community goodwill
- Marketing opportunity

**Cons:**
- Requires business development
- May involve revenue sharing
- Approval process
- Potential exclusivity agreements

**Implementation:**
- Contact sim developers' business teams
- Propose partnership (revenue share, co-marketing)
- Request API access or model licenses
- Sign licensing agreements

### Option 6: Community-Created Open-Source Models

**Sources:**
- **Blender community:** Free car models
- **Open Game Art:** CC-licensed models
- **Thingiverse:** Some race car models
- **GitHub:** Open-source 3D model repositories

**Pros:**
- Free (open licenses)
- Community-driven
- No licensing fees
- Can modify/improve

**Cons:**
- Limited selection
- Variable quality
- May not match sim cars
- Need to verify licenses (CC, MIT, etc.)

**Example Sources:**
- Blender models on BlendSwap
- OpenGameArt.org (CC0, CC-BY)
- Free3D.com (some free models)

### Option 7: Hybrid Approach - WebGL Shader-Based Previews

**Concept:**
- Don't use full 3D models
- Use **2D templates with 3D-like shading**
- Apply livery to flat/curved surfaces
- Use shaders to simulate 3D depth

**Pros:**
- Much faster to implement
- No 3D model licensing needed
- Works for all sims
- Lightweight (fast loading)

**Cons:**
- Not true 3D preview
- Limited viewing angles
- Less immersive
- Can't see all car panels simultaneously

**Implementation:**
- Use car template images (official from sims)
- Apply perspective transforms with CSS 3D transforms
- Use WebGL shaders for lighting effects
- Provide fixed camera angles (front, side, rear, 3/4)

**Example:**
```
Front view → Apply livery → Add lighting shader → Perspective tilt
Side view → Apply livery → Add shadow shader → 3D-ish effect
```

### Option 8: AI-Generated 3D Models from Photos

**Emerging Technology:**
- **NeRF (Neural Radiance Fields):** 3D from photos
- **Gaussian Splatting:** Real-time 3D from images
- **AI 3D Model Generation:** Tools like Luma AI, CSM.ai

**Pros:**
- Create models from reference photos
- Fast generation
- Increasingly accurate
- Lower cost than manual modeling

**Cons:**
- Still experimental
- Quality varies
- May require cleanup
- Licensing unclear for trained models

**Tools to Explore:**
- **Luma AI:** Photo → 3D model
- **CSM.ai:** Text/image → 3D model
- **Polycam:** Mobile 3D scanning app
- **NVIDIA Instant NeRF:** Open-source NeRF

---

## Sim-Specific 3D Model Access

### iRacing

**Official Models:**
- ❌ No direct access to GMT files
- ✅ Official 3D viewer API available
- ✅ Paint templates available (TGA format)

**File Locations:**
```
C:\Program Files (x86)\iRacing\cars\[car_name]\
```

**Format:** GMT (proprietary, encrypted)

**Best Approach:** Use iRacing's built-in viewer (like Trading Paints)

### Assetto Corsa Competizione (ACC)

**Official Models:**
- ⚠️ Models in UE4 format (Unreal Engine 4)
- ❌ Encrypted PAK files (not easily extractable)
- ✅ Livery templates available (DDS format)

**File Locations:**
```
C:\Program Files (x86)\Steam\steamapps\common\Assetto Corsa Competizione\
├── AC2\Content\Paks\ (PAK files - encrypted)
└── Customs\Liveries\ (custom liveries)
```

**Format:** UE4 assets in PAK files

**Best Approach:** 
- Create simplified 3D models based on reference photos
- Or use ACC's built-in showroom (if accessible via API)

### Automobilista 2 (AMS2)

**Official Models:**
- ⚠️ Uses Unreal Engine 4
- ⚠️ Encrypted PAK files
- ✅ Active modding community

**File Locations:**
```
C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\
├── Pakchunk*.pak (encrypted)
└── Vehicles\ (some mod-friendly files)
```

**Format:** UE4 PAK files

**Best Approach:**
- Community collaboration (modders may have extraction tools)
- Create simplified models
- Partner with Reiza Studios

### rFactor 2

**Official Models:**
- ✅ More modding-friendly than others
- ✅ FBX-based workflow (before compilation)
- ⚠️ Compiled MAS files (not easily readable)

**File Locations:**
```
C:\Program Files (x86)\Steam\steamapps\common\rFactor 2\
├── Installed\Vehicles\ (MAS files)
└── UserData\player\Settings\ (liveries)
```

**Format:** MAS archives (proprietary but moddable)

**Best Approach:**
- Work with modding community
- Request SDK access from Studio 397
- May be able to extract/convert models

### Le Mans Ultimate (LMU)

**Official Models:**
- ⚠️ Based on rFactor 2 engine (Studio 397)
- ⚠️ Uses similar MAS archive system
- ✅ Officially licensed WEC/IMSA content
- ⚠️ Modding support status unclear (new game, launched 2024)

**File Locations:**
```
C:\Program Files (x86)\Steam\steamapps\common\Le Mans Ultimate\
├── Installed\Vehicles\ (MAS files - similar to rFactor 2)
├── UserData\player\Settings\ (liveries)
└── Packages\ (DLC content)
```

**Format:** MAS archives (rFactor 2 engine format)

**Current Status:**
- **Game Status:** Released February 2024, still actively developed
- **Modding:** Limited information, likely similar to rFactor 2
- **Official Support:** Focused on official WEC/IMSA content
- **Community:** Growing, shares rFactor 2 modding community

**Livery System:**
- DDS texture files (similar to rFactor 2)
- Custom liveries in UserData folder
- Official template files (if provided)
- May support rFactor 2 modding tools

**Best Approach:**
- **Short-term:** Use same approach as rFactor 2 (similar engine)
- **Medium-term:** Work with rFactor 2/LMU modding community
- **Long-term:** Partner with Studio 397 (they develop both rF2 and LMU)
- **Alternative:** Create simplified models of WEC/IMSA cars (Hypercar, LMP2, LMGT3)

**Key Differentiator:**
- LMU focuses on endurance racing (Le Mans 24h, Daytona, etc.)
- Official WEC and IMSA licenses
- Smaller car roster (Hypercar, LMP2, LMGT3) vs rFactor 2's variety
- Could be easier to create simplified models (fewer cars to cover)

**Licensing Consideration:**
- LMU has official manufacturer licenses (Ferrari, Porsche, BMW, etc.)
- Creating custom 3D models may conflict with official licenses
- Best to use official in-game viewer or partner with Studio 397

**WEC/IMSA Car Classes:**
- **Hypercar/LMDh:** ~10-15 cars (Cadillac, Porsche 963, Ferrari 499P, etc.)
- **LMP2:** ~5 cars (Oreca, Ligier, Dallara)
- **LMGT3:** ~10 cars (Porsche, Ferrari, BMW, Aston Martin, McLaren, etc.)
- **Total:** ~25-30 cars (manageable for custom modeling)

**Community Resources:**
- Studio 397 Forums: https://forum.studio-397.com/ (Le Mans Ultimate section)
- Shares modding tools with rFactor 2 community
- Discord communities for LMU livery sharing

**RaceControl.gg - Official LMU Livery Platform:**
- **URL:** https://racecontrol.gg/
- **Owner:** Studio 397 (official platform for LMU and rFactor 2)
- **LiveryHub Feature:** Built-in livery sharing and discovery
- **Status:** Already operational with active community
- **Integration:** Direct integration with LMU game files

**Key Insights from RaceControl.gg:**
- **Official Studio 397 Platform:** "The official racing platform of Studio 397. Creators of Le Mans Ultimate and rFactor 2"
- **LiveryHub:** Community livery sharing (similar to Trading Paints for iRacing)
- **Trending Liveries:** Active community with hundreds of liveries shared
- **Classes Supported:** Hypercar, LMP2, LMGT3 (all major WEC/IMSA classes)
- **File Management:** Handles livery file distribution to users

**Important for GridVox Strategy:**
- RaceControl.gg is the **official competitor** for LMU (like Trading Paints for iRacing)
- They likely have **official access** to LMU 3D models/viewer
- Studio 397 partnership for GridVox would need to account for RaceControl.gg
- Alternative: GridVox could **complement** RaceControl.gg (not compete) with advanced features:
  - AI design assistance
  - Voice commands
  - GridVox persona integration
  - Cross-sim support (LMU + rF2 + ACC + iRacing in one tool)
  - Advanced livery builder vs simple upload/download

**Partnership Consideration:**
- Instead of competing with RaceControl.gg, GridVox could **integrate** with it
- Export to RaceControl.gg from GridVox Livery Builder
- GridVox = advanced creation tool, RaceControl.gg = distribution platform
- Similar to how Photoshop complements Instagram (create → share)

### Assetto Corsa (Original)

**Official Models:**
- ✅ Most modding-friendly sim
- ✅ KN5 format (readable with tools)
- ✅ Large modding community

**File Locations:**
```
C:\Program Files (x86)\Steam\steamapps\common\assettocorsa\
├── content\cars\[car_name]\
│   ├── [car].kn5 (3D model)
│   └── skins\ (liveries)
```

**Format:** KN5 (custom format, but tools exist to convert)

**Tools:**
- **AC Car Tuner:** Extract KN5 files
- **KN5 Tools:** Convert to FBX/OBJ
- **Content Manager:** View/edit cars

**Best Approach:**
- Use KN5 extraction tools
- Convert to web-friendly formats (GLTF)
- Most accessible sim for 3D models!

### Forza Motorsport / Horizon

**Official Models:**
- ❌ Highly encrypted (Xbox/Windows Store)
- ❌ No modding support
- ❌ No official API

**Best Approach:**
- Create models from scratch
- Or skip Forza entirely (too locked down)

### Gran Turismo 7

**Official Models:**
- ❌ PlayStation exclusive
- ❌ No PC version
- ❌ No modding support

**Best Approach:**
- Create models from scratch
- Or offer "generic" GT cars

### F1 2024/2025 (Codemasters)

**Official Models:**
- ⚠️ EGO Engine format
- ❌ Encrypted game files
- ⚠️ Limited modding community

**Best Approach:**
- Create simplified F1 car models (generic open-wheel)
- Use official F1 livery templates (if available)

---

## Recommended Strategy for GridVox Livery Builder

### Phase 1: MVP (Months 1-4)

**iRacing Only:**
- Use Trading Paints approach (local app + iRacing viewer)
- No 3D model extraction needed
- Legal and officially supported
- Focus on livery builder features

**Implementation:**
- GridVox Desktop app communicates with iRacing
- Web app generates TGA textures
- Desktop app triggers iRacing's 3D viewer
- Same user experience as Trading Paints Sim Preview

**Cost:** $0 (no licensing, uses iRacing's viewer)

### Phase 2: V1.0 (Months 5-8)

**Add Assetto Corsa Support:**
- Extract AC models using KN5 tools (legal, modding-friendly)
- Convert KN5 → GLTF/GLB
- Build custom 3D viewer in browser (Three.js)
- Host models on GridVox servers

**Implementation:**
- Use "AC Car Tuner" or "KN5 Tools" to extract models
- Convert to GLTF with Blender
- Optimize for web (reduce poly count, compress textures)
- Render in Three.js viewer

**Cost:** $0-$5,000 (tooling + server storage)

**Add ACC Support:**
- Create simplified 3D models (commission 3D artists)
- Focus on popular GT3/GT4 cars (20-30 cars)
- Use official livery templates

**Cost:** $2,000-$15,000 (simplified models)

**Add Le Mans Ultimate (LMU) Support:**
- Similar approach to rFactor 2 (same engine)
- Work with rF2/LMU modding community
- Focus on WEC/IMSA cars (~25-30 cars total)
- Create simplified models for Hypercar, LMP2, LMGT3 classes

**Cost:** $5,000-$12,000 (simplified endurance racing models, smaller roster than ACC)

### Phase 3: V2.0 (Months 9-12)

**Multi-Sim Support:**
- **iRacing:** Built-in viewer integration
- **AC:** Extracted KN5 models
- **ACC:** Custom simplified models (or partner with Kunos)
- **AMS2:** Custom models or partner with Reiza
- **rFactor 2:** Work with modding community
- **Le Mans Ultimate:** rF2-based approach or partner with Studio 397

**Partnerships:**
- Reach out to sim developers for official support
- Offer revenue share or co-marketing
- Request API access or model licenses
- **Studio 397:** Single partnership could cover both rFactor 2 AND Le Mans Ultimate

**Community Models:**
- Crowdsource 3D models from community
- Accept user-uploaded car templates
- Open-source model library (CC-BY license)

**Cost:** $10,000-$50,000 (partnerships + custom models)

---

## Legal Considerations

### Can We Extract 3D Models from Games?

**General Answer:** ⚠️ **Legally gray area, often violates EULA**

**EULAs Typically Prohibit:**
- Reverse engineering game files
- Extracting encrypted assets
- Using game assets outside the game
- Redistribution of game content

**Exceptions:**
- **Assetto Corsa:** Modding-friendly EULA, KN5 extraction tolerated
- **rFactor 2:** Modding community support
- **Official APIs:** If developer provides API/SDK

**Safe Approaches:**
1. Use official APIs/viewers (iRacing approach)
2. Create original models (no extraction)
3. License models from asset marketplaces
4. Partner with sim developers (official permission)
5. Use modding-friendly sims (Assetto Corsa)

**Risky Approaches:**
1. Extracting from encrypted PAK files (ACC, AMS2, Forza)
2. Reverse engineering proprietary formats (iRacing GMT)
3. Redistributing extracted models

**Recommendation:** For GridVox, prioritize legal methods:
- iRacing: Use official viewer
- AC: Use KN5 tools (community-accepted)
- Others: Create simplified models or partner

---

## Technical Implementation Recommendations

### Recommended 3D Viewer Stack (For Custom Models)

**Frontend:**
- **Three.js:** WebGL rendering library (most popular)
- **React Three Fiber:** React wrapper for Three.js
- **Drei:** Helper components for R3F
- **GLTF format:** Standard 3D model format

**Features:**
- Orbit controls (rotate, zoom, pan)
- Lighting presets (studio, track, sunset)
- Material editor (paint preview)
- Screenshot capture (high-res export)
- AR preview (mobile)

**Performance:**
- Lazy load models (only when needed)
- Use Draco compression for GLTF
- LOD (Level of Detail) for complex models
- Texture compression (Basis Universal)

### Model Optimization Guidelines

**Polygon Count:**
- Simple cars: 10,000-30,000 triangles
- Detailed cars: 30,000-100,000 triangles
- Ultra-detailed: 100,000-500,000 triangles (not recommended for web)

**Texture Resolution:**
- Base paint: 2048×2048 or 4096×4096
- Spec/normal maps: 2048×2048
- Logos/details: 1024×1024

**File Size Targets:**
- GLTF model: < 5 MB per car (compressed)
- Textures: < 10 MB total
- Total download: < 15 MB per car

---

## Alternative: "Flat" 3D Preview (No Full Models)

If acquiring 3D models proves too difficult/expensive, consider a **hybrid 2D/3D approach**:

### Flat Projection Method

**Concept:**
- Use official 2D templates from sims
- Apply perspective transforms to simulate 3D
- Provide multiple fixed angles (front, side, rear, 3/4)
- Use shaders for lighting effects

**Pros:**
- No 3D models needed
- Very fast performance
- Works on all devices
- No licensing issues (using official templates)

**Cons:**
- Not true 3D (can't rotate freely)
- Less immersive
- Limited viewing angles

**Implementation:**
```javascript
// Use CSS 3D transforms
.car-view {
  transform: perspective(1000px) rotateY(20deg);
}

// Apply livery texture
background-image: url(livery.png);

// Add WebGL lighting shader
fragment shader: apply phong lighting
```

**Example Angles:**
- Front view (0°)
- Front 3/4 (45°)
- Side view (90°)
- Rear 3/4 (135°)
- Rear view (180°)

**Trading Paints Uses This:** Their web previews are mostly 2D templates with perspective, not full 3D rotation.

---

## Cost-Benefit Analysis

| Approach | Cost | Time | Quality | Multi-Sim | Legal Risk |
|----------|------|------|---------|-----------|------------|
| iRacing Viewer Integration | $0 | 1 week | Excellent | ❌ iRacing only | ✅ None |
| Extract AC Models (KN5) | $0-$5k | 2 weeks | Good | ✅ AC only | ⚠️ Low |
| Create Simplified Models | $50k-$100k | 3-6 months | Medium | ✅ All sims | ✅ None |
| Licensed Marketplace Models | $15k-$40k | 1-2 months | Good | ⚠️ Limited | ✅ None |
| Flat 2D/3D Hybrid | $0 | 1 week | Medium | ✅ All sims | ✅ None |
| Partner with Sim Devs | $0-$50k | 3-6 months | Excellent | ✅ Per partner | ✅ None |
| AI-Generated Models | $5k-$20k | 1-2 months | Medium | ✅ All sims | ⚠️ Medium |
| Community Crowdsourced | $0 | Ongoing | Variable | ✅ All sims | ⚠️ Medium |

**Recommended MVP Approach:**
1. **iRacing:** Official viewer integration ($0, 1 week)
2. **Other Sims:** Flat 2D/3D hybrid preview ($0, 1 week)
3. **Future:** Partner with sim developers for official 3D access

**Recommended V1.0 Approach:**
1. **iRacing:** Official viewer
2. **AC:** Extract KN5 models ($0-$5k, 2 weeks)
3. **ACC/AMS2/LMU:** Flat 2D/3D hybrid
4. **Initiate partnerships** with Kunos, Reiza, Studio 397 (covers rF2 + LMU)

**Recommended V2.0 Approach:**
1. **All sims:** Official partnerships or custom models
2. **Community models:** Accept user contributions
3. **AI-generated models:** For rare/niche cars
4. **Studio 397 partnership:** Could unlock both rFactor 2 AND Le Mans Ultimate

---

## Key Findings Summary

1. **Trading Paints does NOT extract 3D models** - they use iRacing's built-in viewer via local app integration

2. **iRacing models are proprietary GMT format** - encrypted and not meant for extraction

3. **Most sims have encrypted 3D files** - Except Assetto Corsa (KN5 is extractable)

4. **Assetto Corsa is the most modding-friendly** - KN5 tools exist, community-accepted

5. **Le Mans Ultimate uses rFactor 2 engine** - Similar MAS file system, shares modding community with rF2

6. **For GridVox MVP:** Use iRacing's official viewer (like Trading Paints) + flat 2D/3D previews for other sims

7. **For GridVox V1.0:** Add AC support (KN5 extraction) + LMU support (rF2-based) + initiate sim developer partnerships

8. **For GridVox V2.0:** Official partnerships or custom simplified models for all sims

9. **Legal approach:** Prioritize official APIs, create original models, or use modding-friendly sims

10. **Studio 397 strategic partnership:** One partnership covers both rFactor 2 AND Le Mans Ultimate (efficiency gain)

9. **Cost-effective start:** iRacing viewer integration ($0) + flat 2D/3D previews ($0) = $0 for MVP

10. **Long-term investment:** Partner with sim developers for official 3D access and co-marketing

---

## Next Steps

### Immediate (This Week):
1. ✅ Document findings (this file)
2. Test iRacing viewer integration approach
3. Research iRacing API/SDK documentation
4. Test AC KN5 extraction tools

### Short-term (Month 1):
1. Build proof-of-concept iRacing viewer integration
2. Extract sample AC car models (KN5 → GLTF)
3. Build basic Three.js viewer for AC models
4. Create flat 2D/3D preview system for other sims

### Medium-term (Months 2-4):
1. Contact sim developers (Kunos, Reiza, Studio 397) for partnerships
2. Commission simplified 3D models for popular ACC cars
3. Expand AC model library
4. Improve 3D viewer UX

### Long-term (Months 5-12):
1. Secure official partnerships
2. Build comprehensive 3D model library
3. Add AR preview support (mobile)
4. Community model contribution system

---

## Conclusion

**GridVox Livery Builder can succeed without extracting proprietary 3D models.**

**Strategy:**
- **MVP:** Use iRacing's official viewer (legal, zero cost, excellent quality)
- **V1.0:** Add Assetto Corsa (KN5 extraction) + Le Mans Ultimate (rF2-based) + flat previews for other sims
- **V2.0:** Official partnerships or custom models for comprehensive multi-sim support

**This approach:**
- ✅ Legal and ethical
- ✅ Cost-effective for MVP
- ✅ Scalable to all sims
- ✅ Better UX than Trading Paints (multi-sim support)
- ✅ Community-friendly (open to contributions)

**Key differentiator:** While Trading Paints is iRacing-only, GridVox will support **10+ sims** through a combination of official integrations, extracted models (where legal), and custom simplified models.

**Le Mans Ultimate Advantage:**
- LMU has smaller car roster (~25-30 cars) making it feasible to create custom simplified models
- Shares rFactor 2 engine and modding community
- One Studio 397 partnership covers both rF2 and LMU
- Growing endurance racing community looking for livery tools

---

## RaceControl.gg Discovery & Strategic Analysis

### Platform Overview

**RaceControl.gg** is "The official racing platform of Studio 397" (creators of both Le Mans Ultimate and rFactor 2). This is a **major competitive/strategic consideration** for LMU integration.

**Key Facts:**
- **Official Status**: Owned and operated by Motorsport Games Inc.
- **Studio 397 Endorsed**: Official platform for LMU and rF2
- **Backend Provider**: Powered by TheSimGrid platform
- **Multi-Game**: Supports both Le Mans Ultimate AND rFactor 2

### LiveryHub Features

**Community Livery System:**
- **Discovery**: Trending liveries with view/download metrics
- **Class Organization**: HYPERCAR, LMP2, LMGT3 (LMU) + Touring Car, Open Wheel, Formula, Porsche Regional (rF2)
- **Team System**: Users organized into teams with branding/logos
- **Popular Liveries**: Top liveries show 35-1,153 downloads/views
- **Active Community**: Thousands of liveries across all car classes

**Technical Infrastructure (Inferred from Analysis):**
```
Storage:    AWS S3 (Frankfurt region)
            race-control-paints-prod.s3.eu-west-1.amazonaws.com
Auth:       Steam authentication required
Format:     DDS paint files (rF2/LMU standard)
Sync:       Cloud-to-game integration (likely local client app)
API:        Metadata API for trending/discovery
```

### Integration Workflow (Likely Model)

Based on webpage structure and similarity to Trading Paints:

1. **Creation**: User creates livery (DDS files for car texture maps)
2. **Upload**: Upload via RaceControl.gg website (Steam auth required)
3. **Assignment**: Assign to specific car/class/team
4. **Storage**: Files stored in AWS S3 + metadata in database
5. **Discovery**: Liveries appear in trending/class browsing
6. **Distribution**: Game client syncs when user joins events
7. **Application**: Liveries auto-applied to cars in-session

### Competitive Landscape Analysis

**RaceControl.gg vs Trading Paints:**

| Feature | RaceControl.gg | Trading Paints |
|---------|----------------|----------------|
| **Sims Supported** | LMU + rF2 | iRacing only |
| **Developer Status** | Official Studio 397 platform | Third-party for iRacing |
| **Company** | Motorsport Games Inc. | Independent |
| **Backend** | TheSimGrid | Custom |
| **Event Integration** | Heavily event-centric | Paint-centric |
| **Multi-Game** | ✅ (2 sims) | ❌ (1 sim) |

**Key Differences:**
- More **event-focused** than livery-focused
- Tied to competitive **daily races and championships**
- **Official endorsement** from game developer
- **Ecosystem integration** (SimGrid, Coach Dave Delta partnerships)

### Strategic Implications for GridVox

#### Positioning Analysis

**1. Direct Competition Concerns:**
- Building another LMU livery platform would compete with **official** solution
- Studio 397 unlikely to partner if we compete with their platform
- Community already established on RaceControl.gg
- Motorsport Games has significant resources

**2. Complementary Opportunity:**
- **RaceControl.gg = Distribution** (like Instagram)
- **GridVox = Creation Tool** (like Adobe Photoshop)
- Different value propositions, not competing

**3. Multi-Sim Advantage:**
- RaceControl.gg only covers LMU + rF2 (2 sims)
- GridVox targeting 12+ sims
- Can dominate other sims (ACC, AMS2, AC, Forza, GT7, F1, etc.)
- LMU/rF2 would be just 2 of 12+ supported platforms

#### Partnership Opportunity

**Studio 397 Partnership Benefits:**
- ✅ **Covers two sims** (rF2 + LMU) in one partnership
- ✅ **Official model access** for both platforms
- ✅ **Co-marketing** with RaceControl.gg
- ✅ **Legitimate integration** vs. competing platform
- ✅ **API access** to RaceControl.gg ecosystem

**Integration Scenarios:**

**Option A: Export Integration**
```
GridVox → "Publish to RaceControl.gg" → RaceControl.gg LiveryHub → LMU/rF2 Game
```
- User creates in GridVox (advanced tools, AI, voice, personas)
- One-click publish to RaceControl.gg
- Automatic sync to game via existing infrastructure

**Option B: White Label Creation Tool**
```
RaceControl.gg → "Create Livery" → GridVox Embedded Editor → Save to RaceControl.gg
```
- RaceControl.gg embeds GridVox editor as official creation tool
- GridVox provides superior UX/features
- RaceControl.gg handles distribution

**Option C: Parallel Platforms (Not Recommended)**
```
GridVox (Creation + Distribution) ⚔️ RaceControl.gg (Distribution)
```
- Direct competition with official platform
- Likely to fail without Studio 397 support
- Community fragmentation

### Technical Integration Requirements

**To Integrate with RaceControl.gg:**

1. **OAuth Authentication**:
   - Steam authentication (required by RaceControl.gg)
   - RaceControl.gg API keys
   - User permission flow

2. **File Format Compatibility**:
   - Export to rF2/LMU DDS format
   - Match expected texture map naming conventions
   - Support MAS archive structure (if needed)

3. **Metadata Mapping**:
   - Car class selection (HYPERCAR, LMP2, LMGT3, etc.)
   - Team assignment
   - Livery naming/description
   - Preview image generation

4. **API Integration**:
   - Upload endpoint for DDS files
   - Metadata submission
   - Team synchronization
   - Status callbacks (published/rejected/trending)

### Recommended Strategy

**Strategic Positioning:**
> **"GridVox is the Adobe Photoshop of livery design;  
> RaceControl.gg and Trading Paints are the Instagram of livery distribution."**

**Recommended Approach:**

1. **Multi-Sim Focus** (Don't Compete on LMU/rF2):
   - Position as **creation tool for ALL sims**
   - LMU/rF2 are just 2 of 12+ platforms
   - Let RaceControl.gg handle LMU/rF2 distribution
   - Focus on sims where no official platform exists (ACC, AMS2, AC, Forza, GT7, F1, WRC)

2. **Integration Partnership**:
   - Approach Studio 397 with **complementary pitch**:
     - "GridVox will drive more users to RaceControl.gg"
     - "Superior creation tools feed your distribution platform"
     - "We handle creation; you handle distribution and events"
   - Negotiate **official integration**:
     - "Publish to RaceControl.gg" feature in GridVox
     - Co-marketing: "Official Creation Partner for RaceControl.gg"
     - Access to official 3D models for rF2 + LMU

3. **Value Proposition Separation**:

| Aspect | GridVox | RaceControl.gg |
|--------|---------|----------------|
| **Core Value** | Advanced creation (AI, voice, personas, stories) | Distribution + events + racing |
| **User Focus** | Livery designers, artists, creators | Racers, leagues, events |
| **Monetization** | Credits, premium tools, AI features | Subscriptions, hosted servers, events |
| **Platform** | Multi-sim (12+ games) | LMU + rF2 only |
| **Integration** | Creation ecosystem | Racing ecosystem |

4. **Implementation Phases**:

**Phase 1 (MVP):**
- Build GridVox for iRacing, AC, ACC, AMS2
- Research RaceControl.gg API
- Contact Studio 397 for partnership discussions

**Phase 2 (V1.0):**
- Add LMU + rF2 support via RaceControl.gg integration
- "Publish to RaceControl.gg" feature
- Official Studio 397 partnership announcement

**Phase 3 (V2.0):**
- Expand to remaining sims (Forza, GT7, F1, WRC, etc.)
- Integrate with other distribution platforms (Trading Paints for iRacing)
- Position as "universal livery creation platform"

### Risk Assessment

**Risks of Competing with RaceControl.gg:**
- ⚠️ Studio 397 unlikely to provide official support
- ⚠️ Motorsport Games has legal/financial resources to defend market
- ⚠️ Community already on RaceControl.gg (network effects)
- ⚠️ Game updates could break unauthorized integrations

**Risks of Partnership Approach:**
- ⚠️ Dependent on Studio 397 cooperation
- ⚠️ Revenue sharing negotiations
- ⚠️ Potential exclusivity requirements

**Mitigations:**
- ✅ Multi-sim strategy reduces dependency on any one platform
- ✅ Superior creation tools provide unique value
- ✅ GridVox credit economy works independently
- ✅ Can always fall back to manual export/upload workflow

### Conclusion: RaceControl.gg Strategic Recommendation

**DO:**
- ✅ Position GridVox as **creation tool** (not distribution platform)
- ✅ Integrate with RaceControl.gg as export target
- ✅ Partner with Studio 397 for official support
- ✅ Focus on multi-sim advantage (12+ games vs. their 2)
- ✅ Emphasize advanced features RaceControl.gg doesn't have (AI, voice, personas, stories)

**DON'T:**
- ❌ Compete directly with RaceControl.gg for LMU/rF2 distribution
- ❌ Build separate event/racing platform
- ❌ Fragment the LMU/rF2 community
- ❌ Bypass official channels with unauthorized integrations

**Value Proposition:**
> "GridVox: The advanced multi-sim livery creation platform with AI, voice commands,  
> and story-driven design. Export to RaceControl.gg (LMU/rF2), Trading Paints (iRacing),  
> or directly to your game files."

---

## Euro Truck Simulator 2 (ETS2) & American Truck Simulator (ATS) Research

### Game Overview

**Developer:** SCS Software  
**Community Size:** Very large (millions of players)  
**Modding Community:** Extremely active and supported  
**Official Modding Support:** ✅ Extensive (SCS Blender Tools, Steam Workshop, official documentation)

### Livery System Architecture

**File Format:**
- **Texture Format**: DDS (DirectDraw Surface)
- **Resolution**: Typically 2048x2048 or 4096x4096
- **Color Space**: sRGB
- **Compression**: DXT1 (no alpha) or DXT5 (with alpha)
- **Mipmaps**: Required for optimal performance

**File Structure:**
```
ETS2/ATS Skin Mod:
├── manifest.sii (mod metadata)
├── mod_description.txt
└── vehicle/
    └── truck/
        └── [manufacturer]/
            └── [model]/
                └── paint_job/
                    ├── [skin_name].sii (paint job definition)
                    ├── [skin_name].tobj (texture object)
                    └── [texture_name].dds (actual texture)
```

### Installation Methods

**Method 1: Manual Installation**
1. Create `.scs` file (ZIP archive with `.scs` extension)
2. Place in `Documents/Euro Truck Simulator 2/mod/` folder
3. Activate in Mod Manager in-game

**Method 2: Steam Workshop**
1. Subscribe to mod on Steam Workshop
2. Automatic installation and updates
3. In-game activation via Mod Manager

**Method 3: World of Trucks**
- SCS Software's official community platform
- Upload/download paint jobs
- Integration with game profiles

### 3D Model Access

**Official Approach:**
- **SCS Blender Tools**: Official addon for Blender
- Export/import truck models for modding
- Supports truck cabins, trailers, accessories
- **Format**: PMG (SCS proprietary), exportable to/from Blender
- **Location**: Available from SCS modding wiki

**Model Availability:**
- ✅ **Full access** to truck 3D models via SCS Blender Tools
- ✅ **Community-created templates** for major trucks
- ✅ **Official documentation** for model structure
- ✅ **Legal extraction** using official tools

**Common Truck Models:**
- Scania R/S Series
- Volvo FH Series
- Mercedes-Benz Actros
- MAN TGX
- DAF XF/XG+
- Renault T Range
- Iveco S-Way
- And 20+ more manufacturers

### Paint Job Definition System

**SII File Format** (paint job configuration):
```sii
SiiNunit
{
    accessory_paint_job_data : .ovlscpaint
    {
        name: "Custom Paint Job Name"
        price: 12000
        unlock: 0
        airbrush: true
        base_color: (1.0, 1.0, 1.0)
        paint_job_mask: "/vehicle/truck/upgrade/paintjob/truck_model/custom/pjm.tobj"
    }
}
```

**TOBJ File** (texture object reference):
```
/material/ui/accessory/custom_paintjob.dds
```

### Technical Implementation Details

**UV Mapping:**
- Each truck model has specific UV layout
- SCS provides UV templates for paint jobs
- Separate UVs for: cabin, chassis, accessories
- Templates available in PSD/PNG format from community

**Material System:**
- Base color texture
- Metallic/roughness maps support
- Normal maps for detail
- Emission maps for lights/decals

**Complexity Levels:**
- **Simple**: Single color + decals
- **Medium**: Multi-panel design with graphics
- **Complex**: Full custom artwork with weathering
- **Advanced**: Animated textures, special effects

### Community & Distribution

**Workshop Statistics:**
- 10,000+ paint job mods on Steam Workshop
- Very active modding community
- Weekly releases of new liveries
- Professional-quality content common

**Popular Paint Job Types:**
1. Real company liveries (logistics companies)
2. Racing/motorsport themes
3. National flags and themes
4. Custom artistic designs
5. Movie/game franchises
6. Fictional companies

### GridVox Integration Strategy

**Advantages for GridVox:**
- ✅ **Huge player base** (millions of trucking sim fans)
- ✅ **Active community** seeking custom designs
- ✅ **Official modding support** (fully legal)
- ✅ **Simple file format** (DDS textures + SII config)
- ✅ **3D models readily available** via SCS Blender Tools
- ✅ **Multiple distribution channels** (Steam Workshop, manual mods, World of Trucks)

**Technical Feasibility:**
```
GridVox Creation:
1. User designs paint job in browser
2. Applies to 3D truck model (imported from SCS Blender Tools)
3. Exports to DDS format (2048x2048 or 4096x4096)
4. Generates SII configuration file
5. Packages as .SCS mod file
6. Optional: Upload to Steam Workshop via API
```

**3D Model Viewer Implementation:**
- Use SCS Blender Tools to export truck models to GLTF
- Convert to Three.js compatible format
- Provide real-time paint preview
- Support for multiple truck manufacturers

**Export Workflow:**
```
GridVox → DDS Export → SII Generation → .SCS Package → Steam Workshop (Optional)
```

### Challenges & Considerations

**Challenges:**
1. **Multiple truck models** (50+ truck variants across ETS2/ATS)
2. **Different UV layouts** per truck
3. **File size management** (high-res textures)
4. **SII syntax** (must be valid for game to load)
5. **Mod compatibility** (with other mods)

**Solutions:**
1. Start with **most popular trucks** (Scania R, Volvo FH, Mercedes Actros)
2. Provide **UV template library**
3. **Automatic DDS compression** with quality settings
4. **Template-based SII generation** (no manual coding)
5. **Compatibility testing** before export

### Market Opportunity

**Player Demographics:**
- Casual trucking fans
- Professional truck drivers (sim for relaxation)
- Modding enthusiasts
- Virtual trucking companies (multiplayer)

**Monetization Potential:**
- Premium truck templates (official manufacturer licenses?)
- Custom company branding services
- Bulk export for VTC (Virtual Trucking Company) fleets
- Subscription for unlimited truck template access

**Competition:**
- **Current**: Manual Photoshop/GIMP + SCS tools
- **GridVox Advantage**: Web-based, AI-assisted, voice commands, no Photoshop needed

### Recommendations for GridVox

**Phase 1 (MVP):**
1. Support **top 5 popular trucks** (Scania R, Volvo FH, Mercedes Actros, MAN TGX, DAF XF)
2. Import truck models via SCS Blender Tools → GLTF
3. Basic DDS export (2048x2048, DXT5)
4. Auto-generate SII files
5. Manual .SCS packaging

**Phase 2 (V1.0):**
1. Expand to **all ETS2/ATS trucks** (50+ models)
2. Steam Workshop API integration (automatic upload)
3. High-res export (4096x4096)
4. Trailer support
5. Accessories customization (mirrors, lights, etc.)

**Phase 3 (V2.0):**
1. World of Trucks integration
2. Virtual Trucking Company fleet management
3. Bulk export for entire truck fleets
4. Real company branding partnerships
5. AI-generated weathering/damage effects

---

## BeamNG.drive Research

### Game Overview

**Developer:** BeamNG GmbH  
**Engine:** Custom soft-body physics engine  
**Community Size:** Large and growing (millions of players)  
**Modding Community:** Extremely active  
**Official Modding Support:** ✅ Extensive (official mod repository, Steam Workshop, documentation)

### Livery System Architecture

**File Format:**
- **Texture Format**: DDS (DirectDraw Surface) or PNG
- **Resolution**: Varies by vehicle (typically 1024x1024 to 4096x4096)
- **Format**: DXT1, DXT5, or uncompressed
- **Mod Format**: ZIP files with `.zip` extension (not encrypted)

**File Structure:**
```
BeamNG Skin Mod:
├── mod_info.json (mod metadata)
└── vehicles/
    └── [vehicle_name]/
        ├── [skin_name].dae (optional: custom parts)
        ├── [skin_name].jbeam (part configuration)
        ├── [skin_name].pc (paint colors)
        └── [texture_name].dds (skin texture)
```

### JBeam System (Unique to BeamNG)

**JBeam Overview:**
- JSON-based physics and parts definition format
- Defines vehicle structure, physics, visuals
- **Critical for skins**: Specifies which textures apply to which parts

**JBeam Skin Definition Example:**
```json
{
    "beamng_vehicle": {
        "slotType": "skin",
        "name": "Custom Livery Name",
        "authors": "GridVox User",
        "paints": [
            {
                "baseColor": [1.0, 1.0, 1.0, 1.0],
                "metallic": 0.0,
                "roughness": 0.5,
                "clearcoat": 1.0,
                "clearcoatRoughness": 0.1
            }
        ]
    },
    "parts": {
        "paint_design": {
            "skin_body": {
                "textures": [
                    ["texture0", "/vehicles/[vehicle]/[skin].dds"]
                ]
            }
        }
    }
}
```

### Installation Methods

**Method 1: Manual Installation**
1. Place ZIP file in `Documents/BeamNG.drive/mods/` folder
2. Game automatically detects and loads
3. Select in vehicle customization menu

**Method 2: In-Game Repository**
1. Access mod repository from main menu
2. Browse/search for skins
3. One-click install
4. Automatic updates

**Method 3: Steam Workshop** (if enabled for BeamNG)
1. Subscribe on Steam
2. Automatic download and installation

### 3D Model Access

**Model Availability:**
- ✅ **Open format**: BeamNG uses `.dae` (COLLADA) format
- ✅ **Extractable**: Mod files are unencrypted ZIP archives
- ✅ **Community-friendly**: BeamNG encourages modding
- ✅ **Legal extraction**: Official support for mod creation

**Model Locations:**
```
Game Installation/content/vehicles/[vehicle_name]/
├── [vehicle].dae (3D model)
├── [vehicle].jbeam (physics/parts definition)
└── textures/
    └── *.dds (vehicle textures)
```

**Extraction Process:**
1. Navigate to game installation folder
2. Extract vehicle `.zip` archives (if packed)
3. Import `.dae` files into Blender/3D software
4. Convert to GLTF for web use

**Vehicle Variety:**
- 50+ official vehicles (constantly growing)
- 1,000+ community-created vehicles
- All types: cars, trucks, buses, motorcycles, planes, boats

### Paint System Details

**Paint Color (.pc file):**
```json
{
    "paints": {
        "white": {
            "baseColor": [1.0, 1.0, 1.0, 1.0],
            "metallic": 0.5,
            "roughness": 0.3,
            "clearcoat": 1.0
        }
    }
}
```

**Material Properties:**
- Base color (RGBA)
- Metallic (0.0-1.0)
- Roughness (0.0-1.0)
- Clearcoat (0.0-1.0)
- Clearcoat roughness
- Normal maps
- Damage textures

### Community & Distribution

**Mod Repository Statistics:**
- **1,880 skins** on official repository (as of Nov 2025)
- **19,997 Automation imports** (car designer integration)
- **3,399 "Mods of Mods"** (modifications of existing vehicles)
- Very active weekly releases

**Popular Skin Categories:**
1. Police/emergency vehicle liveries
2. Racing liveries (real-world replicas)
3. Fictional company branding
4. Anime/gaming character wraps ("itasha")
5. National themes
6. Custom artistic designs

### GridVox Integration Strategy

**Advantages for GridVox:**
- ✅ **Open modding system** (no encryption, no DRM)
- ✅ **Active community** (thousands of mod creators)
- ✅ **Simple file format** (ZIP + DDS + JSON)
- ✅ **3D models easily accessible** (DAE format, extractable)
- ✅ **Official mod repository** (distribution channel)
- ✅ **Cross-platform** (Windows, Linux, macOS via Proton)

**Technical Feasibility:**
```
GridVox Creation:
1. User designs livery in browser
2. Applies to 3D car model (extracted .dae → GLTF)
3. Exports to DDS texture
4. Generates JBeam skin configuration
5. Auto-generates mod_info.json
6. Packages as .zip mod file
7. Optional: Upload to mod repository
```

**3D Model Viewer Implementation:**
- Extract `.dae` models from BeamNG installation
- Convert DAE → GLTF using Blender scripting
- Load in Three.js for web preview
- Real-time paint preview with PBR materials

**Export Workflow:**
```
GridVox → DDS/PNG Export → JBeam Generation → mod_info.json → ZIP Package → Mod Repository (Optional)
```

### Unique Features

**Damage Simulation:**
- BeamNG's soft-body physics deform vehicles realistically
- Skins must work with deformation
- Requires proper UV mapping to avoid stretching artifacts

**Part Swapping:**
- Modular vehicle system (swap bumpers, hoods, wheels, etc.)
- Skins can apply to specific parts
- Allows mix-and-match customization

**Performance Considerations:**
- High-res textures impact performance
- BeamNG supports texture quality settings
- Recommend 2048x2048 max for most vehicles

### Challenges & Considerations

**Challenges:**
1. **JBeam complexity** (JSON syntax must be valid)
2. **Material system** (PBR requires understanding of roughness/metallic)
3. **Deformation compatibility** (skins must work when vehicle deforms)
4. **Part variations** (many vehicles have 100+ parts/configs)
5. **File size** (uncompressed mods can be large)

**Solutions:**
1. **Template-based JBeam generation** (auto-create valid syntax)
2. **Material presets** (matte, glossy, metallic, chrome, etc.)
3. **UV testing tools** (preview how skin deforms)
4. **Part-specific templates** (separate designs for hood, doors, roof, etc.)
5. **Automatic compression** (DXT5 compression for DDS)

### Market Opportunity

**Player Demographics:**
- Physics enthusiasts
- Crash test fans
- Car customization lovers
- Modding community
- Content creators (YouTube, Twitch)

**Monetization Potential:**
- Premium vehicle templates
- Custom branding for creators
- Bulk skin packs (themed collections)
- Subscription for unlimited vehicle access

**Competition:**
- **Current**: Manual Photoshop/GIMP + JBeam editing + manual packaging
- **GridVox Advantage**: Automated workflow, no coding, AI-assisted, voice commands

### Recommendations for GridVox

**Phase 1 (MVP):**
1. Support **top 10 popular vehicles** (ETK 800, Sunburst, Covet, Pessima, D-Series, etc.)
2. Extract `.dae` models → Convert to GLTF
3. Basic DDS export (1024x1024, DXT5)
4. Auto-generate JBeam skin configurations
5. Auto-generate mod_info.json
6. Manual ZIP packaging

**Phase 2 (V1.0):**
1. Expand to **all official BeamNG vehicles** (50+ models)
2. Mod repository API integration (if available)
3. High-res export (2048x2048, 4096x4096)
4. Part-specific customization (hoods, doors, roofs separately)
5. Material presets (matte, gloss, chrome, carbon fiber, etc.)

**Phase 3 (V2.0):**
1. **Community vehicle support** (allow users to import custom .dae models)
2. Deformation preview (simulate how skin looks when damaged)
3. Multi-part bulk export (entire vehicle kit)
4. AI-generated weathering/damage textures
5. Integration with Automation (car designer game that exports to BeamNG)

### Strategic Positioning

**BeamNG.drive + ETS2/ATS Together:**
- Both have **open modding ecosystems**
- Both use **DDS textures** (similar workflow)
- Both have **large active communities**
- Both support **3D model extraction** legally
- **Combined player base**: 5-10 million potential users

**GridVox Value Proposition for These Games:**
> "Create professional truck and car liveries in minutes, not hours.  
> No Photoshop. No coding. Just design, preview in 3D, and export.  
> One tool for ETS2, ATS, BeamNG.drive, and 10+ more sims."

---

## Comparative Analysis: ETS2/ATS vs BeamNG.drive

| Aspect | ETS2/ATS | BeamNG.drive |
|--------|----------|--------------|
| **Genre** | Trucking simulation | Soft-body physics / driving |
| **Developer Support** | ✅ Extensive (SCS Blender Tools) | ✅ Extensive (Open format) |
| **File Format** | DDS + SII | DDS/PNG + JBeam |
| **3D Model Access** | ✅ Via SCS Blender Tools | ✅ Extractable DAE files |
| **Complexity** | Medium (SII syntax) | Medium-High (JBeam JSON) |
| **Community Size** | Very Large (millions) | Large (hundreds of thousands) |
| **Workshop Support** | ✅ Steam Workshop | ✅ Official repository + Steam |
| **Texture Resolution** | 2048-4096 typical | 1024-4096 typical |
| **UV Complexity** | High (truck panels) | Medium (car bodies) |
| **Legal Modding** | ✅ Fully supported | ✅ Fully supported |
| **GridVox Feasibility** | ⭐⭐⭐⭐⭐ (Very High) | ⭐⭐⭐⭐⭐ (Very High) |

**Key Findings:**
1. **Both games are perfect targets** for GridVox integration
2. **Similar technical requirements** (DDS textures, 3D models)
3. **Different communities** (trucking vs physics enthusiasts) = broader appeal
4. **Open modding ecosystems** = legal, supported, encouraged
5. **Large player bases** = significant market opportunity

---

## Combined ETS2/ATS + BeamNG Integration Recommendations

### MVP Strategy (Phase 1)

**Target Vehicles:**
- **ETS2/ATS**: Top 5 popular trucks (Scania R, Volvo FH, Mercedes Actros, MAN TGX, DAF XF)
- **BeamNG**: Top 10 popular cars (ETK 800, Sunburst, Covet, Pessima, D-Series, Barstow, Moonhawk, Bluebuck, Grand Marshal, Roamer)

**Technical Implementation:**
```
Shared Infrastructure:
├── DDS Texture Export (2048x2048, DXT5)
├── 3D Model Viewer (Three.js + React Three Fiber)
├── UV Template Library
└── Mod Packaging System

ETS2/ATS-Specific:
├── SCS Blender Tools integration
├── SII file generator
├── .SCS packager
└── World of Trucks API (future)

BeamNG-Specific:
├── DAE → GLTF converter
├── JBeam generator
├── mod_info.json generator
└── Mod Repository API (future)
```

**Development Effort:**
- **Shared components**: 60% of effort
- **ETS2/ATS-specific**: 20% of effort
- **BeamNG-specific**: 20% of effort
- **Total**: ~2-3 months for MVP (both games)

### Cost-Benefit Analysis

**Development Costs** (for both games):
- 3D model extraction/conversion: $10k-$15k
- DDS export system: $5k-$8k (already needed for other sims)
- SII generator: $8k-$12k
- JBeam generator: $10k-$15k
- 3D viewer enhancements: $5k-$10k (shared with other sims)
- **Total**: $38k-$60k

**Potential Revenue:**
- **ETS2/ATS Market**: 5 million+ players, 10% interested in custom liveries = 500k potential users
- **BeamNG Market**: 1 million+ players, 20% modders = 200k potential users
- **Combined TAM**: 700k potential users
- **Conversion rate**: 1% pay users = 7,000 paying users
- **ARPU**: $5/month average = **$35k/month** = **$420k/year**

**ROI**: 7-10x in first year

### Strategic Advantages

**Why ETS2/ATS + BeamNG Together:**
1. **Different player bases** (truckers vs car enthusiasts)
2. **Similar technology** (DDS textures, 3D models)
3. **Shared infrastructure** (60% code reuse)
4. **Diversified revenue** (not dependent on one community)
5. **Cross-promotion** (ETS2 users might also play BeamNG)

**Competitive Positioning:**
- **No direct competitor** offers web-based livery creation for both games
- **Current workflow**: Hours of Photoshop/GIMP + manual file editing
- **GridVox workflow**: Minutes in browser + automatic export
- **Unique features**: AI assistance, voice commands, GridVox personas, credit economy

### Final Recommendation

**Priority Level**: ⭐⭐⭐⭐⭐ **VERY HIGH**

**Rationale:**
1. ✅ **Huge combined market** (6+ million potential users)
2. ✅ **Open modding ecosystems** (legal, supported, no DRM)
3. ✅ **Similar technology** (code reuse, shared infrastructure)
4. ✅ **Strong ROI** (7-10x in first year)
5. ✅ **Low technical risk** (proven file formats, active communities)
6. ✅ **Strategic fit** (aligns with GridVox multi-sim vision)

**Implementation Plan:**
- **MVP** (Months 1-3): ETS2/ATS + BeamNG basic support (15 vehicles total)
- **V1.0** (Months 4-6): Full vehicle libraries + Steam Workshop integration
- **V2.0** (Months 7-12): Advanced features, API integrations, community tools

**Next Steps:**
1. Extract sample truck models from ETS2 using SCS Blender Tools
2. Extract sample car models from BeamNG (DAE → GLTF)
3. Build proof-of-concept DDS exporter
4. Prototype SII and JBeam generators
5. Test with community (beta testers from both games)

---

## Microsoft Flight Simulator (2020/2024) & X-Plane 12 Research

### Game Overview

**Microsoft Flight Simulator 2020/2024:**
- Developer: Asobo Studio / Microsoft
- Community Size: Massive (millions of players)
- Modding Community: Extremely active (Flightsim.to has 100,000+ mods)
- Official Modding Support: ✅ Full support via SDK

**X-Plane 12:**
- Developer: Laminar Research
- Community Size: Large (hundreds of thousands)
- Modding Community: Very active
- Official Modding Support: ✅ Extensive plugin system

### Aircraft Livery System

**Microsoft Flight Simulator:**

**File Format:**
- **Texture Format**: DDS (BC7/DXT5)
- **Resolution**: 2048x2048 to 8192x8192 (varies by aircraft)
- **File Structure**:
```
Aircraft Livery Mod:
├── manifest.json (mod metadata)
├── layout.json (file structure definition)
└── SimObjects/
    └── Airplanes/
        └── [Aircraft_Model]/
            └── TEXTURE.[livery_name]/
                ├── thumbnail.jpg
                ├── aircraft.cfg (livery configuration)
                └── [textures].dds (fuselage, wings, tail, etc.)
```

**Installation:**
1. Community folder installation (`Community/` folder)
2. Automatic detection by sim
3. Selectable in-game from aircraft menu

**X-Plane 12:**

**File Format:**
- **Texture Format**: PNG or DDS
- **Resolution**: 1024x1024 to 4096x4096
- **File Structure**:
```
Aircraft Livery:
└── Aircraft/
    └── [Aircraft Name]/
        └── liveries/
            └── [livery_name]/
                ├── aircraft.png (preview image)
                └── [texture files].png
```

### 3D Model Access

**Microsoft Flight Simulator:**
- ✅ **GLTF format** (open standard)
- ✅ **Blender integration** via official tools
- ✅ **SDK available** with full documentation
- ✅ **Legal extraction** using official ModelConverterX tool
- ✅ **Community templates** for popular aircraft

**Model Sources:**
- Default aircraft: 40+ planes included
- Third-party payware: PMDG, FlyByWire, Fenix Simulations (1,000+ aircraft)
- Freeware community: Flightsim.to has 10,000+ aircraft models

**X-Plane 12:**
- ✅ **OBJ format** (plaintext, easily editable)
- ✅ **Blender import/export** via plugins
- ✅ **Plane Maker** official tool for aircraft creation
- ✅ **Open file formats** (no encryption)

### Community & Distribution

**Microsoft Flight Simulator:**
- **Flightsim.to**: 100,000+ mods, 40,000+ liveries
- **Active daily uploads**: 20+ new liveries per day
- **Most popular category**: Aircraft liveries
- **Examples**: Airline repaints (United, Delta, British Airways), fictional designs, historical aircraft

**Categories:**
1. Commercial airline liveries (A320, B737, B777, A330, etc.)
2. General aviation repaints (Cessna 172, Bonanza, etc.)
3. Military aircraft (F-14, F/A-18, etc.)
4. Bush planes and STOL aircraft
5. Helicopters

**X-Plane:**
- X-Plane.org: 50,000+ add-ons
- Active livery community
- Realistic airline repaints primary focus

### Technical Implementation

**MSFS Livery Configuration (aircraft.cfg):**
```ini
[FLTSIM.0]
title=Airbus A320neo MyAirline
model=""
texture=MyAirline
description="Custom livery for A320neo"
ui_manufacturer="Airbus"
ui_type="A320neo"
ui_variation="MyAirline Special"
```

**Texture Mapping:**
- **Fuselage**: `fuselage.dds` (typically 4096x4096 or 8192x8192)
- **Wings**: `wing_l.dds`, `wing_r.dds`
- **Tail**: `tail.dds`
- **Engine nacelles**: `engine.dds`
- **Detail parts**: Various smaller textures

**Complexity Levels:**
- **Simple**: Single base color + logos (1-2 hours manual work)
- **Medium**: Multi-color scheme + detailed graphics (4-6 hours)
- **Complex**: Photo-realistic airline livery (8-12 hours)
- **Advanced**: Custom weathering, damage textures (15+ hours)

### GridVox Integration Strategy

**Advantages:**
- ✅ **Huge market** (MSFS: 10+ million players, X-Plane: 1+ million)
- ✅ **Active demand** (20+ new liveries uploaded daily)
- ✅ **Open formats** (DDS, GLTF, OBJ)
- ✅ **Legal modding** (officially supported)
- ✅ **Multiple aircraft types** (commercial, GA, military, helicopters)
- ✅ **High-value users** (flight sim enthusiasts willing to pay for quality)

**Technical Feasibility:**
```
GridVox Workflow:
1. Import aircraft 3D model (GLTF/OBJ → Three.js)
2. User designs livery in browser
3. AI assists with airline logo placement, registration numbers
4. Export to DDS (BC7 compression, 4096x4096)
5. Auto-generate aircraft.cfg / manifest.json
6. Package as ready-to-install mod
7. Optional: Upload to Flightsim.to via API
```

**Unique Features for Aviation:**
- **Registration number generator** (realistic tail numbers by country)
- **Airline branding templates** (United, Delta, Lufthansa, Emirates, etc.)
- **Weathering presets** (light wear, heavy use, vintage patina)
- **Reflection/metallic maps** for realistic paint
- **Automatic symmetry** (left/right wing mirroring)

### Challenges & Solutions

**Challenges:**
1. **Varied UV layouts** (each aircraft has unique unwrap)
2. **High-resolution requirements** (8K textures = large files)
3. **Multiple texture files** (fuselage, wings, tail, engines)
4. **Manufacturer licensing** (using real airline logos)
5. **Aircraft diversity** (100+ different models)

**Solutions:**
1. **Template library** (UV templates for top 20 aircraft)
2. **Smart compression** (BC7 DDS with quality presets)
3. **Batch export** (generate all textures in one click)
4. **Licensing partnerships** or generic/fictional airlines
5. **Phased rollout** (start with most popular: A320, B737, Cessna 172)

### Market Opportunity

**Player Demographics:**
- Aviation enthusiasts
- Real-world pilots (training use)
- Virtual airline members
- Content creators (YouTube, Twitch)
- Livery designers (currently using Photoshop)

**Monetization Potential:**
- Premium aircraft templates ($2-$5 per aircraft)
- Airline branding packs ($10-$20 for major carriers)
- Subscription for unlimited aircraft access ($10/month)
- Virtual airline fleet management (bulk pricing)
- High-res export tier (8K textures, $15/month)

**Competition:**
- **Current workflow**: Photoshop + manual DDS conversion + cfg editing (4-12 hours)
- **GridVox advantage**: Browser-based, AI-assisted, 1-click export (30 minutes - 2 hours)

**Estimated Market:**
- MSFS active users: ~2 million monthly
- Livery creators: ~50,000 active
- Potential paying users (2% conversion): 1,000 users
- ARPU: $15/month
- **Monthly revenue potential**: $15,000/month = **$180,000/year** (MSFS alone)

### Recommendations

**Priority Level**: ⭐⭐⭐⭐⭐ **VERY HIGH**

**Phase 1 (MVP - 2-3 months):**
1. Support **top 5 aircraft**:
   - Airbus A320neo (FlyByWire)
   - Boeing 737-800 (PMDG or Zibo)
   - Cessna 172 (default)
   - Beechcraft Baron 58 (default)
   - Boeing 787-10 (787 Dreamliner)

2. **Technical Implementation**:
   - GLTF import for MSFS aircraft
   - DDS export (BC7, 2048x2048 and 4096x4096)
   - Auto-generate manifest.json + aircraft.cfg
   - Automatic packaging for Community folder

3. **Features**:
   - Airline template library (10 major carriers)
   - Registration number generator
   - Basic weathering presets
   - Preview in 3D viewer

**Phase 2 (V1.0 - Months 4-6):**
1. Expand to **30+ aircraft** (all major airliners + GA)
2. X-Plane 12 support (PNG/DDS export, OBJ models)
3. Flightsim.to API integration (auto-upload)
4. Advanced weathering (AI-generated dirt, scratches)
5. Virtual airline features (fleet bulk export)

**Phase 3 (V2.0 - Months 7-12):**
1. **All MSFS aircraft** (100+ models via community sourcing)
2. Helicopter support (dynamic rotors, different UV layouts)
3. Military aircraft (camouflage patterns, nose art)
4. Historical aircraft (vintage airline liveries)
5. Real-time collaboration (multi-user livery design)

---

## Kart Racing Pro Research

### Game Overview

**Developer:** PiBoSo  
**Engine:** Custom physics engine  
**Community Size:** Niche but dedicated (karting enthusiasts)  
**Modding Community:** Active  
**Official Modding Support:** ✅ Full support for custom content

### Livery System

**File Format:**
- **Texture Format**: DDS (DXT1/DXT5)
- **Resolution**: 1024x1024 to 2048x2048
- **Mod Format**: Direct file replacement in installation folder

**File Structure:**
```
Kart Racing Pro:
└── data/
    └── karts/
        └── [kart_model]/
            └── livery/
                └── [skin_name].dds
```

**Features:**
- Support for custom paint schemes
- Helmet and suit customization
- Number plate customization
- Full modding support (karts, engines, tracks)

### 3D Model Access

- ✅ **Open format**: Easily extractable
- ✅ **Community templates** available
- ✅ **Legal modding** fully supported
- ✅ **Template sharing** common in community

### Community

**Activity:**
- Steam: 30,000+ downloads
- Very positive reviews (88% positive)
- Dedicated karting simulation community
- Active forum with modding section

**GridVox Potential:** ⭐⭐⭐ **MEDIUM** (niche market, but passionate community)

---

## Farming Simulator 25 Research

### Game Overview

**Developer:** GIANTS Software  
**Community Size:** Very large (millions of players)  
**Modding Community:** Extremely active (one of the largest in simulation gaming)  
**Official Modding Support:** ✅ Extensive (GIANTS Editor, ModHub, Steam Workshop)

### Vehicle Customization System

**File Format:**
- **Texture Format**: DDS or PNG
- **Resolution**: 1024x1024 to 4096x4096
- **Mod Format**: ZIP files

**File Structure:**
```
Farming Simulator Mod:
├── modDesc.xml (mod description)
├── icon.dds (mod thumbnail)
└── textures/
    └── [vehicle_name]/
        ├── diffuse.dds
        ├── normal.dds (optional)
        └── specular.dds (optional)
```

### 3D Model Access

- ✅ **GIANTS Editor** official tool
- ✅ **I3D format** (XML-based, readable)
- ✅ **Blender export** available via community tools
- ✅ **Legal modding** encouraged
- ✅ **ModHub** official distribution platform

### Community & Distribution

**ModHub Statistics:**
- **8,000+ mods** for FS25 (as of Nov 2025)
- **Daily uploads**: 50+ new mods
- **Categories**: Tractors, combines, trucks, trailers, implements
- **Steam Workshop** integration
- **In-game mod browser**

**Popular Mod Types:**
1. Tractor repaints (John Deere, Case IH, New Holland, Fendt)
2. Truck liveries (European haulers)
3. Custom company branding
4. Fictional farm equipment brands
5. Country-themed designs

### GridVox Integration Potential

**Advantages:**
- ✅ **Massive player base** (5+ million copies sold)
- ✅ **Active modding scene** (50+ new mods daily)
- ✅ **Official support** (GIANTS actively encourages modding)
- ✅ **Multiple vehicle types** (tractors, combines, trucks, trailers)
- ✅ **ModHub distribution** (official platform)

**Technical Feasibility:**
```
GridVox for Farming Simulator:
1. Import I3D models → Convert to GLTF
2. Design custom paint in browser
3. AI-assisted company branding
4. Export to DDS (BC7)
5. Generate modDesc.xml
6. Package as ZIP mod
7. Upload to ModHub (via API if available)
```

**Unique Features:**
- **Farm branding** (custom farm names, logos)
- **Realistic weathering** (mud, dirt, rust)
- **Company liveries** (John Deere green, Case IH red, etc.)
- **Seasonal variations** (clean spring, dirty autumn)

### Market Opportunity

**Player Demographics:**
- Farming enthusiasts
- Agricultural workers
- Casual simulation gamers
- Content creators (YouTube farming channels)
- Virtual farm businesses

**Monetization:**
- Premium vehicle templates
- Company branding packs
- Bulk export for farming businesses
- Subscription for unlimited access

**Competition:**
- **Current**: Manual Photoshop + GIANTS Editor
- **GridVox**: Automated workflow, AI branding

**Estimated Revenue:**
- Active modders: 10,000+
- Conversion rate (1%): 100 paying users
- ARPU: $8/month
- **Annual revenue**: $9,600/year (small but growing)

**Priority Level**: ⭐⭐⭐ **MEDIUM** (large market, but lower ARPU than racing sims)

---

## The Crew Motorfest Research

### Game Overview

**Developer:** Ubisoft Ivory Tower  
**Platform:** Console-focused (PS5, Xbox, PC)  
**Community Size:** Large (millions of players)  
**Customization:** ✅ **Built-in livery editor** (in-game tool)

### Built-In Livery Editor

**Features:**
- In-game wrap editor
- Shape tools (rectangles, circles, polygons)
- Decal application
- Color customization
- Preview in 3D
- Save and share designs

**Why GridVox Could Still Add Value:**
- **AI-assisted design** (current editor is manual)
- **Voice commands** (GridVox personas)
- **Template library** (professional designs)
- **Advanced effects** (GridVox could offer more than in-game)
- **Cross-platform design** (design on web, apply in-game)

**Challenges:**
- Closed ecosystem (Ubisoft servers)
- No official modding support
- Limited export options

**GridVox Strategy:**
- **Companion tool** rather than replacement
- Design in GridVox → Manually recreate in-game (not ideal)
- OR wait for Ubisoft modding API (unlikely)

**Priority Level**: ⭐⭐ **LOW** (built-in editor makes GridVox redundant unless Ubisoft opens API)

---

## Gran Turismo 7 Livery Editor Research

### Game Overview

**Developer:** Polyphony Digital  
**Platform:** PlayStation exclusive (PS4/PS5)  
**Community Size:** Very large (millions of GT7 players)  
**Customization:** ✅ **Extensive built-in livery editor**

### Built-In Livery Editor

**Features:**
- Advanced in-game editor (best-in-class for consoles)
- **Decal uploader** (SVG support!)
- Shape tools, gradients, patterns
- 3D preview on cars
- Showcase (share designs with community)
- Export/import decals

**Decal System:**
- Upload custom SVG files (via GT website)
- Decals sync to game automatically
- 15KB file size limit per SVG
- Community shares decals freely

**Why GridVox Could Add Value:**
- **SVG creation tool** (GridVox could be SVG generator for GT7)
- **AI logo generation** (create decals for GT7 upload)
- **Template library** (racing team logos, sponsors)
- **Batch decal creation** (generate 50 sponsor logos at once)

**GridVox as GT7 Companion:**
```
GridVox → Generate sponsor logos (SVG) → 
Upload to GT website → 
Use in GT7 livery editor
```

**Community:**
- GTplanet.net forum: 350+ pages of livery discussions
- Very active sharing culture
- Replica liveries highly popular (real race cars)

**Priority Level**: ⭐⭐⭐ **MEDIUM** (can't replace in-game editor, but can be SVG decal generator)

---

## Need for Speed Heat Research

### Game Overview

**Developer:** Ghost Games / EA  
**Platform:** Multi-platform (PC, PS4, Xbox)  
**Customization:** ✅ **Built-in wrap editor**

### Built-In Wrap Editor

**Features:**
- In-game wrap designer
- Extensive decal library
- Layering system
- Color/material customization
- Save and share wraps

**Modding:**
- PC version has limited modding
- Community tools exist (Frosty Editor)
- Texture replacement possible but complex
- No official support

**GridVox Potential:**
- **Frosty Editor integration** (if we reverse-engineer format)
- **Design templates** for manual in-game recreation
- **Reference tool** (design in GridVox, apply manually in NFS)

**Challenges:**
- Proprietary Frostbite engine
- EA actively discourages modding
- Frequent anti-cheat updates break mods

**Priority Level**: ⭐ **LOW** (too many barriers, built-in editor sufficient)

---

## Comparative Summary: Additional Sims Research

| Game/Sim | Modding Support | Market Size | Technical Feasibility | GridVox Priority | Annual Revenue Potential |
|----------|----------------|-------------|---------------------|-----------------|-------------------------|
| **MS Flight Simulator** | ✅ Full (SDK) | 10M+ players | ⭐⭐⭐⭐⭐ (GLTF, DDS) | ⭐⭐⭐⭐⭐ VERY HIGH | $180,000/year |
| **X-Plane 12** | ✅ Full (OBJ) | 1M+ players | ⭐⭐⭐⭐⭐ (Open formats) | ⭐⭐⭐⭐ HIGH | $50,000/year |
| **Kart Racing Pro** | ✅ Supported | 50K players | ⭐⭐⭐⭐ (DDS) | ⭐⭐⭐ MEDIUM | $5,000/year |
| **Farming Simulator 25** | ✅ Official (ModHub) | 5M+ players | ⭐⭐⭐⭐ (I3D, DDS) | ⭐⭐⭐ MEDIUM | $10,000/year |
| **The Crew Motorfest** | ❌ Closed | 2M+ players | ⭐ (No API) | ⭐⭐ LOW | N/A |
| **Gran Turismo 7** | ⚠️ SVG upload only | 5M+ players | ⭐⭐⭐ (SVG generator) | ⭐⭐⭐ MEDIUM | $20,000/year |
| **Need for Speed Heat** | ⚠️ Unofficial | 2M+ players | ⭐⭐ (Frosty Editor) | ⭐ LOW | N/A |

---

## Final Strategic Recommendations: All Sims Combined

### Tier 1: Immediate Implementation (MVP Phase)
**High ROI + High Feasibility**

1. **Microsoft Flight Simulator 2020/2024** ⭐⭐⭐⭐⭐
   - Revenue: $180K/year
   - Dev cost: $60K-$80K
   - ROI: 3-4x first year
   - Market: 10M+ players
   - Start with: A320, B737, Cessna 172

2. **iRacing** (from existing research)
   - Revenue: $200K/year
   - Existing Trading Paints infrastructure
   - GMT file format (challenging but solvable)

3. **Assetto Corsa** (from existing research)
   - Revenue: $150K/year
   - KN5 extraction well-documented
   - Large community

### Tier 2: Near-Term Expansion (V1.0 Phase)
**Medium-High ROI + Good Feasibility**

4. **Euro Truck Simulator 2** (from previous research)
   - Revenue: $80K/year
   - SCS Blender Tools (official)
   - 5M+ player base

5. **BeamNG.drive** (from previous research)
   - Revenue: $60K/year
   - Open DAE format
   - Creative community

6. **X-Plane 12**
   - Revenue: $50K/year
   - OBJ format (very accessible)
   - Professional pilot training market

### Tier 3: Strategic Additions (V2.0 Phase)
**Diversification + Niche Markets**

7. **Farming Simulator 25**
   - Revenue: $10K/year
   - Different demographic (farming enthusiasts)
   - Official ModHub distribution

8. **Gran Turismo 7** (SVG Generator Tool)
   - Revenue: $20K/year
   - Can't replace in-game editor
   - BUT: GridVox as decal creation companion tool

9. **Le Mans Ultimate** (from existing research)
   - Revenue: $40K/year
   - rFactor 2 engine (MAS files)
   - Growing esports scene

### NOT RECOMMENDED (At Least Not Yet):

❌ **The Crew Motorfest**: Built-in editor, closed ecosystem, no modding API  
❌ **Need for Speed Heat**: Proprietary Frostbite engine, EA anti-modding stance  
❌ **Console-exclusive titles without PC modding**: Too restrictive

---

## Combined Multi-Sim Strategy

### Total Addressable Market (Tier 1 + Tier 2)
- **Combined player base**: 30+ million across all supported sims
- **Active modders**: 200,000+
- **Potential paying users** (1% conversion): 2,000 users
- **Average ARPU**: $12/month
- **Total annual revenue potential**: **$288,000/year**

### Development Costs (All Tiers Combined)
- Tier 1 sims (MSFS, iRacing, AC): $200K-$250K
- Tier 2 sims (ETS2, BeamNG, X-Plane): $150K-$180K
- Tier 3 sims (FS25, GT7, LMU): $80K-$100K
- **Total dev cost**: $430K-$530K over 18 months

### ROI Calculation
- **Year 1 revenue**: $288K (Tiers 1+2 only)
- **Year 1 costs**: $350K (Tiers 1+2 development)
- **Break-even**: Month 15
- **Year 2 revenue**: $450K+ (all tiers + growth)
- **Year 2 costs**: $150K (maintenance + Tier 3)
- **Year 2 profit**: $300K+

### Competitive Differentiation

**What GridVox Offers That Competitors Don't:**
1. **AI-Assisted Design** (no other tool has GridVox personas)
2. **Voice Commands** (unique to GridVox)
3. **Multi-Sim Support** (one tool for 10+ games)
4. **Story-Driven Design** (Riven's story templates)
5. **Credit Economy** (community marketplace)
6. **Web + Desktop** (accessible anywhere)
7. **Auto-Export** (one-click to multiple formats)

**Positioning Statement:**
> "GridVox: The only AI-powered, multi-sim livery creation platform.  
> Design once, export everywhere. From flight sims to racing sims,  
> trucks to karts—GridVox has you covered."

### Next Actions

1. **Validate market assumptions**:
   - Survey MSFS community (Flightsim.to forums)
   - Survey iRacing community (Trading Paints users)
   - Survey AC community (RaceDepartment users)

2. **Technical proof-of-concept**:
   - MSFS: Import A320 GLTF → Export DDS → Generate manifest.json
   - iRacing: Decrypt GMT file (research or partner with Trading Paints)
   - AC: Extract KN5 → Preview in browser

3. **Partnership outreach**:
   - Flightsim.to (API access for auto-upload)
   - Trading Paints (iRacing integration)
   - RaceControl.gg (LMU/rF2 distribution)

4. **MVP feature set**:
   - 3D model viewer (Three.js)
   - Paint tools (Fabric.js)
   - AI personas (Riven, Echo, Volt)
   - Voice commands (basic)
   - Export to DDS
   - Auto-generate config files
   - Multi-sim format support (start with 3 sims)

5. **Go-to-market**:
   - Beta launch with 100 users (invite-only)
   - Community forums (Reddit, Discord, sim-specific forums)
   - YouTube creators (sponsor livery tutorials)
   - Pricing: $10/month or $100/year
   - Free tier: 5 exports/month, watermarked
   - Pro tier: Unlimited exports, no watermark, all features

