# Implementation Checklist - Track Enrichment Suite

**Scope:** Deliver the AI-assisted track enrichment capabilities outlined in `docs/AI-TRACK-ENRICHMENT-RESEARCH.md`, covering corner naming, scenery assets, historical context, and confidence tooling.

---

## Phase 0: Foundations (Priority: Critical)
- [ ] Define enrichment artifact schema (`corner.json`, `scenery.json`, `history.md`, `provenance.json`) plus shared typing in `src/types/enrichment.ts`.
- [ ] Scaffold versioned output directories (`enrichment/<track>/<yyyymmdd>/...`) and register with the existing CLI export pathing.
- [ ] Implement prompt-response cache with hashing and disk persistence to control LLM cost and ensure reproducibility.
- [ ] Provision API credentials (Gemini Vision, Bing Maps, OpenStreetMap, fallback models) and wire them through secure config loading.
- [ ] Add cost and latency telemetry (per provider, per track) to support budgeting in later phases.

---

## Phase 1: Corner Naming Pipeline (Priority: Critical)
- [ ] Build reference ingestion module to scrape/parse official guides, wikis, and user-submitted corner lists into a normalized dataset.
- [ ] Implement LLM-based extraction pass with deterministic templates for PDFs/images and OCR fallback for map callouts.
- [ ] Develop corner matching logic that aligns extracted names with telemetry-derived corner geometry (distance snapping, tolerance heuristics, manual override JSON).
- [ ] Produce enriched corner metadata (`corner.json`) including naming, type classification, speeds, and linkbacks to source material.
- [ ] Integrate pipeline into `scripts/enrich-track.ts`, adding CLI switches for dry-run, cache warmup, and diff reporting against previous runs.

---

## Phase 2: Scenery & Building Enrichment (Priority: High)
- [ ] Implement satellite tile fetcher with graceful degradation between Gemini Vision, Bing, and OSM imagery.
- [ ] Add structure detection using vision APIs plus OSM footprint fusion; label asset types (grandstands, pit buildings, hospitality, notable landmarks).
- [ ] Generate simplified meshes (marching squares extrusion or billboard proxies) and attach materials or labels suitable for in-game overlays.
- [ ] Calculate per-asset confidence and flag ambiguous detections for human review in the output metadata.
- [ ] Export scenery artifacts (`scenery.json`, optional `.glb` overlays) and reference them in the core CLI workflow.

---

## Phase 3: Historical Documentation Bundle (Priority: High)
- [ ] Stand up retrieval pipeline (vector store + curated motorsport sources) with citation scoring and recency weighting.
- [ ] Generate track overview, era timeline, and notable corner anecdotes using RAG prompts; embed citations alongside paragraphs.
- [ ] Automate supporting media collection (licensed photos, race programs) with metadata describing usage rights.
- [ ] Produce human-readable `history.md` plus machine-friendly JSON summaries for integration in other apps.
- [ ] Wire documentation export into the CLI, with options for summary-only vs. full historical bundle.

---

## Phase 4: Historic Layout Variants (Priority: Medium, Optional)
- [ ] Aggregate legacy track layouts from KML archives, FIA yearbooks, and community datasets; normalize coordinate frames.
- [ ] Align variant layouts with current telemetry baseline and compute geometric diffs (added/removed sections, length deltas).
- [ ] Output `variants.json` describing each historical layout with era, references, and confidence markers.
- [ ] Provide CLI flag to include or skip historic variants, defaulting to off until data coverage is validated.

---

## Phase 5: Confidence, QA, and Human Review (Priority: High)
- [ ] Implement per-artifact confidence scoring and aggregate into a heatmap overlay for the desktop viewer.
- [ ] Generate auto-review packets listing low-confidence corners/assets with hyperlinks to source evidence.
- [ ] Add regression tests that diff enrichment outputs between runs to catch prompt drift or API regressions.
- [ ] Document manual QA checklist and expected turnaround for reviewers inside `docs/QA-GUIDE.md`.

---

## Phase 6: Creative Enhancements (Priority: Medium)
- [ ] Produce synthetic commentator callouts per corner using enriched metadata and configurable tone presets.
- [ ] Build cultural context packs (local weather norms, pit radio slang, event traditions) sourced from travel and motorsport references.
- [ ] Add change-detection workflow comparing fresh imagery to stored baselines to flag renovations or demolitions.
- [ ] Prototype community feedback intake (JSON schema + CLI import) to crowd-verify enrichment data.

---

## Phase 7: Packaging & Rollout (Priority: High)
- [ ] Bundle enrichment outputs into distributable archives (`.zip` with manifest) and publish via the existing release channel.
- [ ] Update user-facing documentation (`README.md`, `QUICKSTART.md`, desktop viewer help) with new features and review workflow.
- [ ] Create pilot run plan for two contrasting circuits (e.g., street vs. permanent) and capture metrics (accuracy, cost, review time).
- [ ] Prepare post-pilot iteration backlog based on reviewer feedback and telemetry insights.

---

## Reporting & Timeline
- [ ] Establish weekly status report template summarizing progress, cost burn, and blocker list.
- [ ] Produce high-level roadmap slide linking phases to milestone dates for stakeholder review.

---

**Next Action:** Confirm resource availability for Phase 0 setup and schedule API provision funding approval.
