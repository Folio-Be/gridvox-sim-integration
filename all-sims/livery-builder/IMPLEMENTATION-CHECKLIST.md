# Livery Builder – Implementation Checklist

## Phase 0 – Discovery & Access
- [x] Verify official template sources for each target sim (AMS2, ACC, AC, LMU, iRacing, MSFS 2024) and capture their latest release dates. *Verified local game installations; templates require external downloads per ACQUISITION-GUIDE.md (2025-11-12).*
- [x] Identify registration or licensing requirements for gated template repositories and document request process. *Recorded access prerequisites per sim in sims/README.md (2025-11-12).* 

## Phase 1 – Acquisition
- [x] Download or request official template bundles for covered base vehicles per simulator. *AMS2: Downloaded 4 official Reiza PSD templates (Alpine A424, BMW M4 GT3, Lamborghini Huracan GT3, Formula V10) from downloads.game-automobilista2.com (2025-11-12).*
- [ ] Mirror community-maintained template packs to fill vehicle or resolution gaps.
- [x] Organize template storage with semantic versioning and per-sim folder hierarchy. *Created per-sim/example-templates directories (2025-11-12).* 

## Phase 2 – Validation
- [ ] Validate each template’s resolution, UV layout alignment, and alpha-channel usage against in-sim exporters.
- [ ] Document required export formats and compression settings per simulator workflow.
- [ ] Generate thumbnail previews and metadata JSON for ingestion into the asset service.

## Phase 3 – Documentation & Handoff
- [ ] Update internal docs with access instructions, licensing notes, and revision changelog.
- [ ] Publish a template coverage matrix (sim × vehicle × resolution) for product planning and UI surfacing.
