# AC/ACC Template Download Attempts - 2025-11-12

## Summary
All public/anonymous download attempts for Assetto Corsa and Assetto Corsa Competizione templates **FAILED**. Templates exist but require forum registration.

## Attempted Sources

### 1. Dropbox ACC Bundle ❌
**URL:** https://www.dropbox.com/scl/fi/0m1lr35mdm0ggrx7621f7/ACC_Custom_Livery_Templates.zip  
**Method:** Direct curl download  
**Result:** Downloaded 180 KB file  
**Actual Content:** HTML error page (<!DOCTYPE html>)  
**Error:** File not found / link expired / access restricted  
**Hex Header:** `3C 21 44 4F 43 54 59 50 45 20 68 74 6D 6C 3E` (<!DOCTYPE html>)

### 2. Assetto-DB Templates Page ❌
**URL:** https://assetto-db.com/templates  
**Method:** fetch_webpage  
**Result:** HTTP 403 Forbidden  
**Error Message:** "You do not have permission to access this document."  
**Note:** Main site (assetto-db.com) works fine, only /templates endpoint is blocked

### 3. RaceDepartment AC Skins ❌
**URL:** https://www.racedepartment.com/downloads/categories/assetto-corsa-skins.14/  
**Method:** fetch_webpage  
**Result:** Wrong category redirect  
**Actual Content:** F1 2012 skins page (not AC livery templates)  
**Note:** Category ID mismatch or site restructure

### 4. RaceDepartment ACC Templates ❌
**URL:** https://www.racedepartment.com/downloads/acc-custom-livery-templates.50163/  
**Method:** fetch_webpage  
**Result:** Redirected to finished skin mod  
**Actual Content:** "Virtuosi Racing 2022 | Formula RSS 2 V6 ABU DHABI" (not blank template)

### 5. GitHub ACC Templates ❌
**URL:** https://github.com/racingclubinternational/acc-livery-templates  
**Method:** fetch_webpage  
**Result:** 404 Not Found  
**Error:** Repository doesn't exist or was deleted

### 6. Kunos Official Forum ❌
**URL:** https://www.assettocorsa.net/forum/index.php?forums/acc-liveries-helmets.147/  
**Method:** fetch_webpage  
**Result:** 404 "The requested forum could not be found"  
**Note:** Requires login, anonymous access blocked

## Working Sources (Require Registration)

### Kunos Simulazioni Forum (ACC)
**URL:** https://www.assettocorsa.net/forum/  
**Access:** Free registration required  
**Expected Location:** Resources → ACC Custom Livery Templates  
**Format:** Individual PSD files per car (GT3/GT4)  
**Coverage:** All official cars + DLC

### Studio 397 (LMU/rFactor 2)
**URL:** https://docs.studio-397.com/  
**Access:** Studio 397 account (free)  
**Format:** PSD templates compatible with LMU  
**Coverage:** Hypercar, LMP2, GT3 vehicles

## Conclusion

**For ACC/AC:** Manual forum registration is the ONLY reliable path to official templates.

**Alternative (Advanced):** Extract textures directly from game files:
- AC: `assettocorsa\content\cars\{car_name}\skins\`
- ACC: Unpack `.pak` files using UE4 tools

**Recommendation:** Since AMS2 templates are complete and high-quality (14 PSDs, 219 MB), use those for MVP livery builder development. Add ACC/AC support later after forum registration.
