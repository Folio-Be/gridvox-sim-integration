# Template Acquisition Guide

## Summary
Game installations typically **do not** include editable PSD templates with wireframes/AO layers. Templates are distributed separately through official forums, community sites, and SDK downloads.

## Local Game Findings

### Assetto Corsa (AC)
**Installation**: `C:\Program Files (x86)\Steam\steamapps\common\assettocorsa`
**Finding**: Cars use DDS textures directly in `content\cars\{car}\skins\` folders. No PSD templates bundled.
**Action Required**: Download community template packs from:
- RaceDepartment (requires login): https://www.racedepartment.com/downloads/categories/assetto-corsa-skins.14/
- Assetto-DB: https://assetto-db.com/templates
- Search for specific car + "template PSD" on forums

### Assetto Corsa Competizione (ACC)
**Installation**: `C:\Program Files (x86)\Steam\steamapps\common\Assetto Corsa Competizione`
**Finding**: Only SDK server files present. No Customs folder or livery templates.
**Action Required**: Download from:
- Kunos Forum Resources (requires registration): https://www.assettocorsa.net/forum/
- Racing Club International GitHub: https://github.com/racingclubinternational/acc-livery-templates
- Community Google Drive links shared on forums

### Automobilista 2 (AMS2)
**Installation**: `C:\GAMES\Automobilista 2`
**Finding**: Custom liveries use `Vehicles\Textures\CustomLiveries\Overrides\` system but no PSD templates included.
**Action Required**: Download template megapack from:
- Reiza Forum (free registration): https://forum.reizastudios.com/threads/automobilista-2-livery-customization-overview.9745/
- RaceDepartment AMS2 section: https://www.racedepartment.com/downloads/automobilista-2-paint-template-megapack.38852/

### Le Mans Ultimate (LMU)
**Installation**: `C:\Games\Le Mans Ultimate`
**Finding**: Vehicles stored in `Installed\Vehicles\{car}\` as `.mas` archives. No extractable templates.
**Action Required**: Download from:
- Studio 397 Knowledge Base (account required): https://docs.studio-397.com/
- Studio 397 Forum: https://forum.studio-397.com/
- Use rFactor 2 templates as LMU shares same base format

### Microsoft Flight Simulator 2024 (MSFS2024)
**Installation**: `C:\Program Files (x86)\Steam\steamapps\common\MicrosoftFlightSimulator` (minimal launcher only)
**Finding**: Aircraft content managed through in-game Content Manager. SDK not found in Steam folder.
**Action Required**:
1. Download MSFS SDK from DevSupport: https://devsupport.flightsimulator.com/
2. Extract livery samples from SDK `Samples\SimObjects\Airplanes\` folder
3. Alternative: flightsim.to community templates: https://flightsim.to/c/liveries/

### iRacing
**Not installed locally** - Requires active subscription.
**Action Required**:
- Member Portal access: https://members.iracing.com/membersite/member/paintshop.jsp
- Trading Paints mirror (free account): https://www.tradingpaints.com/page/Help/Files

## Next Steps

1. **Register accounts** for gated portals (Reiza, Kunos, Studio 397, RaceDepartment)
2. **Download template bundles** for each sim (aim for 5 representative vehicles per sim)
3. **Extract and organize** into respective `sims/{Sim}/example-templates/` folders
4. **Document sources** in SOURCE.txt files with download date and URL
5. **Verify freshness** by checking file dates against latest sim updates

## Recommended First Downloads

- **AC**: BMW M3 E30, Porsche 911 GT3, Ferrari 458, Lotus Exos
- **ACC**: AMG GT3, Ferrari 488 GT3, Porsche 991 GT3R, Lamborghini Huracan GT3
- **AMS2**: Formula Ultimate, Stock Car, GT3 pack (from megapack)
- **LMU**: Hypercar class templates (Alpine, Toyota, Cadillac)
- **MSFS2024**: Cessna 172, Boeing 747, Airbus A320 (from SDK samples)
- **iRacing**: Popular cars from Trading Paints (GT3, NASCAR, Formula)
