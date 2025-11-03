# Subproject: AMS2 Race Configuration

Purpose: Deliver a reliable way for GridVox to configure single-player race sessions and championships in Automobilista 2 (AMS2) using two approaches:
- Direct File Manipulation (reverse-engineering session/championship config files)
- UI Automation (input simulation to configure races in-game menus)

Status: Initiation Complete → Ready for Execution (Nov 3, 2025)
Owner: GridVox Desktop Team
Current Phase: M1 (Research Environment Ready)

Scope
- Research and reverse engineering of AMS2 race session and championship file formats
- Build safe read/write utilities for track, car, opponent, weather, and session settings
- Design and prototype resilient UI automation for AMS2 race configuration screens
- Integrate with GridVox voice commands (confirmation workflow)

Out of Scope (for this subproject)
- Vehicle setup tuning (suspension, aero, tire pressures - different subproject)
- Real-time memory writes (not feasible/unsafe)
- Multiplayer server automation

Deliverables
- 01-deep-research.md: Evidence-based research for both approaches
- 02-attack-plan.md: Phases, milestones, estimates, and success criteria
- 03-lab-protocol-ams2-config-re.md: Repeatable protocol to map race config file structure
- 04-ui-automation-design.md: Robust plan for automation + resilience
- 05-risk-log.md: Risk register and mitigations
- 06-next-steps.md: Current status assessment and recommended immediate actions
- 07-session-log-2025-11-03.md: Development session log and findings
- 08-reiza-contact-research.md: Strategy for contacting Reiza Studios about file format
- 09-action-checklist.md: Quick action plan for Reiza contact
- EMAIL-TEMPLATE-Reiza-Professional.txt: Ready-to-send professional email
- FORUM-POST-TEMPLATE-Reiza.txt: Ready-to-post forum message
- TWITTER-TEMPLATES-Reiza.txt: Social media contact templates

KPIs / Success Criteria
- Configure at least 20 distinct race sessions programmatically without corruption
- 95%+ success rate applying changes (track, car, opponents, weather, time of day)
- Automated backup/restore with zero data loss incidents in testing
- UI automation flow configures a race in < 30s with 90% reliability (1080p/1440p)

Dependencies
- Access to AMS2 with ability to create custom races and championships
- Hex editor, diff tools, Node/Python env for utilities

Links
- Parent doc: ../../AMS2-Race-Configuration-Research.md


