# Livery Builder - Implementation Checklist

## Phase 0 - Discovery & Access
- [x] Verify official template sources for each target sim (AMS2, ACC, AC, LMU, iRacing, MSFS 2024) and capture their latest release dates. *Verified local game installations; templates require external downloads per ACQUISITION-GUIDE.md (2025-11-12).*
- [x] Identify registration or licensing requirements for gated template repositories and document request process. *Recorded access prerequisites per sim in sims/README.md (2025-11-12).*
- [ ] Enumerate which sims/vehicles must be supported in the MVP scope vs follow-on release. *Pending; needs PM prioritization to bound feature set.*

## Phase 1 - Acquisition
- [x] Download or request official template bundles for covered base vehicles per simulator. *AMS2: Downloaded 4 official Reiza PSD templates (Alpine A424, BMW M4 GT3, Lamborghini Huracan GT3, Formula V10) from downloads.game-automobilista2.com (2025-11-12).*
- [ ] Mirror community-maintained template packs to fill vehicle or resolution gaps. *Pending; requires curation policy + attribution checklist.*
- [x] Organize template storage with semantic versioning and per-sim folder hierarchy. *Created per-sim/example-templates directories (2025-11-12).*
- [ ] Capture change notifications (RSS, Discord, forums) for template updates so ingest scripts can flag deltas. *Pending; alerts not wired.*

## Phase 2 - Validation
- [ ] Validate each template's resolution, UV layout alignment, and alpha-channel usage against in-sim exporters. *Pending; tooling spike needed.*
- [ ] Document required export formats and compression settings per simulator workflow. *Pending; consolidate from sims docs.*
- [ ] Generate thumbnail previews and metadata JSON for ingestion into the asset service. *Pending; blocked by validation outputs.*
- [ ] Smoke-test template imports in existing PSD/paint apps for parity with Fabric rendering. *Pending; ensures no color-space drift.*

## Phase 3 - Documentation & Handoff
- [ ] Update internal docs with access instructions, licensing notes, and revision changelog. *Pending; requires Phase 2 data.*
- [ ] Publish a template coverage matrix (sim x vehicle x resolution) for product planning and UI surfacing. *Pending; data entry blocked.*
- [ ] Draft contributor guidelines for adding new vehicle templates + QA checklist. *Pending; needs stakeholder review.*

## Phase 4 - Editor Foundations
- [x] Consolidate Fabric.js research against the editor spec (object tree, mask flows, pixel tools, filters). *Reviewed local research set + latest Fabric docs (2025-11-14).*
- [ ] Record unresolved requirements/clarifications for the LIVERY-BUILDER-EDITOR scope. *Pending; capture open questions within spec margin.*
- [ ] Spike Fabric extensions for mask folders, mirror regions, and pixel container painting. *Pending; gated on requirements doc.*
- [ ] Define data contracts/interfaces between Fabric scene graph, React state, and upcoming backend API. *Pending; schema design TBD.*

## Phase 5 - Stitch Layout Integration
- [ ] Translate `ui/main_editor_skin_refresh/code.html` into JSX with 100% pixel-parity wrappers (header, tabs, toolbars, panels). *In progress; partial scaffolding exists but needs full rewire.*
- [ ] Port CSS tokens/utilities (`simvox-gray-*`, gradients, drop shadows, tab states) into the React/Vite stack without regressions. *Pending; only base palette stubbed.*
- [ ] Replace legacy "File/Edit" chrome with thumbnail/name block plus Save/Export CTA as per mock. *Pending; tied to JSX rewrite.*
- [ ] Implement centered tab strip with no close icons and auto-fit behavior. *Pending; requires custom flex math.*
- [ ] Embed reference + preview boxes bottom-right with tabbed reference browser and static preview frame. *Pending; layout placeholders only.*

## Phase 6 - Fabric Canvas & Object Tooling
- [ ] Mount Fabric canvas sized to Stitch mock proportions, including car_body.dds scaling controls. *Pending; waiting on layout completion.*
- [ ] Build object creation workflow per tool (Select, Pen, Shapes with dropdown, Pencil/Brush toggle, Type, Picture, Pixel, Mirror). *Pending; requires Fabric commands.*
- [ ] Render OM/OTS menus contextually (alignments vs tool-specific controls) centered below tabs. *Pending; needs UI state machine.*
- [ ] Implement hierarchical object tree (folders, mask rows, UV row, background chip) with drag/drop + iconography. *Pending; mock data not wired.*
- [ ] Surface lock/visibility/delete toggles inline on selection. *Pending; UI assets not yet exported.*

## Phase 7 - Data Layer & Backend Prep
- [ ] Introduce mock project data service that feeds tabs, thumbnails, object tree, and reference sets. *Pending; spec allows mock for now.*
- [ ] Define backend integration contract (REST/WebSocket) matching SimVox MVP stack (per poc-08). *Pending; coordinate with backend.*
- [ ] Add save/export pipeline hooking UI actions to mocked persistence, ensuring later swap to real endpoints. *Pending; stub handlers only.*
- [ ] Wire telemetry/logging hooks for state mutations for eventual analytics. *Pending; instrumentation not started.*

## Phase 8 - Packaging & QA
- [ ] Validate layout + interactions inside Tauri shell (per poc-08 baseline) for desktop parity. *Pending; blocked by Fabric work.*
- [ ] Cross-browser smoke (Chromium, Gecko) for editor as standalone component before MVP embed. *Pending; schedule later.*
- [ ] Create regression test checklist covering toolbar, tree, reference tabs, canvas manipulations. *Pending; requires feature completion.*
- [ ] Finalize release notes + deployment steps for SimVox MVP integration. *Pending; depends on prior phases.*
