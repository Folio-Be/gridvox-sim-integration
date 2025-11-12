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

