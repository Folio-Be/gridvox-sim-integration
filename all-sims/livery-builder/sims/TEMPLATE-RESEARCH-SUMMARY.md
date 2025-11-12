# Livery Template Research Summary - All Sims

**Research Date:** 2025-11-12  
**Status:** AMS2 (PSD) ✅, LMU (TGA) ✅, MSFS2024 (DDS) ✅, ACC/AC pending Google Drive download

## Successfully Downloaded Templates

### Automobilista 2 (AMS2) ✅ COMPLETE
**Source:** Official Reiza Studios repository  
**Thread:** https://forum.reizastudios.com/threads/ams2-user-livery-overrides.14819/  
**Format:** RAR archives containing **PSD templates** with wireframe/AO layers  

**Downloaded (4 templates, 50.5 MB compressed → 219 MB extracted):**
1. Alpine A424 (LMDh) - 4.05 MB → 29.2 MB (9 files, 3 PSDs)
2. BMW M4 GT3 - 1.88 MB → 36.9 MB (10 files, 4 PSDs)
3. Lamborghini Huracan GT3 EVO2 - 7.92 MB → 50.3 MB (9 files, 5 PSDs)
4. Formula V10 - 36.65 MB → 102.9 MB (5 files, 2 PSDs)

**Total:** 14 PSD files (main liveries, number plates, wheel rims, banners)  
**Extraction Status:** ✅ All extracted and documented in `AMS2/PSD-LAYER-ANALYSIS.md`  
**POC Integration:** ✅ Implemented with @webtoon/psd loader

**Additional Available (100+ vehicles):**
- All GT3, GT4, LMDh, Formula, Stock Car, Classic/Vintage cars
- Helmet and driver outfit templates
- Updated regularly with new car releases

---

### Le Mans Ultimate (LMU) ✅ COMPLETE
**Source:** Community liveries  
**Format:** RAR archives containing **TGA finished liveries** (not templates)

**Downloaded (3 liveries, 4.82 MB compressed → 210 MB extracted):**
1. Aston Martin GT3 (Toy Story) - 1.03 MB → 4.08 MB (2 TGAs)
2. BMW M4 EVO (Drift Brother) - 1.25 MB → 5.37 MB (2 TGAs)
3. LIGIER JS P325 LMP3 (Jordan 191) - 2.54 MB → 100.66 MB (2 TGAs, uncompressed)

**File Structure:**
- `customskin.tga` - Main livery (4096x4096, 24-bit RGB)
- `customskin_region.tga` - Region/team texture (4096x4096, 24-bit RGB)

**Extraction Status:** ✅ All extracted and documented in `LMU/TGA-LIVERY-ANALYSIS.md`  
**POC Integration:** ✅ Implemented with tga-js loader

---

### Microsoft Flight Simulator 2024 (MSFS) ✅ COMPLETE
**Source:** Community liveries (flightsim.to)  
**Format:** Complete livery packages with **DDS textures**

**Downloaded (2 packages, ~700 MB total):**
1. Lufthansa A330-900 Neo by aaMasih (~500 MB)
   - 70+ DDS files (albedo, normal, composite maps)
   - Components: AIRFRAME, COCKPIT, WINGS, ENGINES, LANDING_GEAR
   - Resolution: 4K-8K textures
   
2. Pitts S2-S Pimped by ensiferrum (~200 MB)
   - Smaller aircraft, fewer components
   - Similar DDS structure

**File Structure:**
```
livery_package/
├── manifest.json           # Package metadata
├── layout.json            # File listing
└── SimObjects/Airplanes/model/texture.variant/
    ├── AIRFRAME_BOTTOM_ALBD.PNG.DDS  (21.33 MB, color map)
    ├── AIRFRAME_BOTTOM_NORM.PNG.DDS  (21.33 MB, normal map)
    ├── AIRFRAME_BOTTOM_COMP.PNG.DDS  (10.67 MB, composite)
    └── [50-70 more DDS files]
```

**Extraction Status:** ✅ Analyzed and documented in `MSFS2024/MSFS-FORMAT-ANALYSIS.md`  
**POC Integration:** ⚠️ Pending DDS parser implementation

---

## Templates Found (Pending Download)

### Assetto Corsa Competizione (ACC) ✅ GOOGLE DRIVE FOUND
**Source:** Google Drive community collection  
**URL:** https://drive.google.com/drive/folders/1er3RbPLwVHSFcs_5S_vNEJZvLewK5M9l  
**Access:** ✅ Public folder (no login required)  
**Format:** Expected DDS liveries + possible PSD templates  
**Coverage:** GT3/GT4 cars  
**Download Status:** ⚠️ Pending manual download

**Alternative Sources:**
- Kunos Forum (requires free registration)
- Dropbox links (dead/protected)

---

### Assetto Corsa (AC) ✅ GOOGLE DRIVE FOUND
**Source:** Same Google Drive collection as ACC  
**URL:** https://drive.google.com/drive/folders/1er3RbPLwVHSFcs_5S_vNEJZvLewK5M9l  
**Access:** ✅ Public folder (no login required)  
**Format:** Expected DDS/PNG liveries  
**Coverage:** Various cars (original + mods)  
**Download Status:** ⚠️ Pending manual download

**Alternative Sources:**
- RaceDepartment (requires registration)
- AssettoLand, Assetto-DB (various access requirements)

---

## Templates Requiring Account Registration

**Alternative:** Assetto-DB template archive - ❌ FAILED  
**URL:** https://assetto-db.com/templates  
**Status:** 403 Forbidden (templates page blocked)  
**Note:** Main site works but templates section is access-restricted

**Download Status:** ⚠️ No public template repositories found for AC  

### Le Mans Ultimate (LMU)
**Official Source:** Studio 397 Knowledge Base  
**URL:** https://docs.studio-397.com/  
**Access:** Studio 397 account required  
**Format:** PSD/DDS (shares rFactor 2 format)  
**Coverage:** All official Hypercar/LMP2/GT3 vehicles  

**Alternative:** rFactor 2 templates (compatible)  
**URL:** https://forum.studio-397.com/  
**Access:** Forum registration required

### iRacing
**Official Source:** iRacing Member Portal Paint Shop  
**URL:** https://members.iracing.com/membersite/member/paintshop.jsp  
**Access:** Active iRacing subscription required ($)  
**Format:** TGA files with spec maps  
**Coverage:** All official iRacing cars and series  

**Community Mirror:** Trading Paints  
**URL:** https://www.tradingpaints.com/  
**Access:** Free account (requires iRacing link)  
**Format:** Web-based painter + downloadable templates  
**Coverage:** Most popular cars mirrored publicly

### Microsoft Flight Simulator 2024 (MSFS2024)
**Official Source:** MSFS DevSupport SDK  
**URL:** https://devsupport.flightsimulator.com/  
**Access:** Microsoft account + SDK forum access request  
**Format:** PSD livery kits + glTF material templates  
**Coverage:** All Official/Premium aircraft  

**Community:** flightsim.to  
**URL:** https://flightsim.to/c/liveries/  
**Access:** Free account  
**Format:** Varies (PSD, PNG, livery.json)  
**Coverage:** Community-created templates for popular aircraft

## Template Quality Comparison

| Sim | Official PSDs | Wireframes | AO Maps | Resolution | Update Frequency |
|-----|---------------|------------|---------|------------|------------------|
| AMS2 | ✅ Yes | ✅ Yes | ✅ Yes | 4K-8K | Quarterly |
| ACC | ✅ Yes | ✅ Yes | ✅ Yes | 4K-8K | Per DLC |
| AC | ⚠️ Community | ⚠️ Varies | ⚠️ Varies | 2K-4K | Inactive |
| LMU | ✅ Yes | ✅ Yes | ✅ Yes | 4K | Per update |
| iRacing | ✅ Yes | ✅ Yes | ✅ Yes | 2K-4K | Monthly |
| MSFS2024 | ✅ Yes | ⚠️ Partial | ❌ No | 4K-8K | Per aircraft |

## Next Steps

### Immediate (Public Downloads)
- [x] AMS2: Downloaded 4 representative templates ✅
- [x] ACC: Attempted Dropbox download - FAILED (HTML error page)
- [x] AC: Searched Assetto-DB and RaceDepartment - BLOCKED (403/wrong category)

### Requires Registration (Free Accounts) - **RECOMMENDED PATH**
- [ ] ACC: Register at Kunos forum (https://www.assettocorsa.net/forum/), download latest GT3 pack
- [ ] LMU: Register at Studio 397 (https://docs.studio-397.com/), download Hypercar templates
- [ ] MSFS2024: Register at flightsim.to (https://flightsim.to/c/liveries/), download Boeing 747/A320 kits

### Requires Paid Access - **LOW PRIORITY**
- [ ] iRacing: Requires active subscription ($) OR use Trading Paints free tier (requires iRacing link)

### Alternative: Extract from Game Files
- [ ] AC: Extract DDS from `C:\Program Files (x86)\Steam\steamapps\common\assettocorsa\content\cars\`
- [ ] ACC: Extract from game Pak files (requires UE4 unpacker)
- [ ] LMU: Extract from `C:\Games\Le Mans Ultimate\Installed\Vehicles\` (rFactor 2 format)

## Implementation Priority

**For MVP Livery Builder:**
1. **AMS2** - Complete ✅ (official templates acquired)
2. **ACC** - High priority (GT3 is most popular class)
3. **AC** - Medium priority (large existing community)
4. **LMU** - Medium priority (growing sim)
5. **iRacing** - Low priority (subscription barrier)
6. **MSFS2024** - Low priority (different audience/workflow)

## Storage Structure

Templates organized as:
```
all-sims/livery-builder/sims/
├── AMS2/
│   └── example-templates/
│       ├── AMS2_alpine_a424_template.rar
│       ├── AMS2_bmw_m4_gt3_template.rar
│       ├── AMS2_lamborghini_huracan_gt3_evo2_template.rar
│       ├── AMS2_FV10_Template.rar
│       └── SOURCE.txt
├── ACC/
│   └── example-templates/
│       └── (pending registration)
├── AC/
│   └── example-templates/
│       └── (pending public downloads)
├── LMU/
│   └── example-templates/
│       └── (pending registration)
├── iRacing/
│   └── example-templates/
│       └── (requires subscription)
└── MSFS2024/
    └── example-templates/
        └── (pending registration)
```
