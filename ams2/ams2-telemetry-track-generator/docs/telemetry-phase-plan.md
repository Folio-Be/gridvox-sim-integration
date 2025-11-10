# Telemetry Capture Roadmap

## Phase 1 – Recording Flow Hardening
- [ ] Launch telemetry capture and walk through LiveRecording → Processing without sidebar regressions.
- [ ] Verify curb detection indicator responds to rumble strip terrain codes and ignores grass.
- [ ] Capture any UI or telemetry issues discovered during the smoke test and file follow-up tasks.
- [x] Add debug console logging for curb detection transitions to support verification.

## Phase 2 – Export Pipeline Readiness
- [ ] Replace simulated progress with real processing events and wire `onComplete` transitions.
- [ ] Persist export gating so assignments survive restarts.
- [ ] Add resilience checks for failed processing runs and user-facing recovery paths.

## Phase 3 – Polish & Coverage
- [ ] Stream live processing logs into the UI in place of placeholders.
- [ ] Expand automated coverage for curb detection and run-type gating logic.
- [ ] Conduct accessibility and visual QA pass before release.
