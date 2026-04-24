# Governance Analysis: NEROA-CX-017C Front-Door Screenshot Restore

- Prompt ID: `NEROA-CX-017C-FRONT-DOOR-SCREENSHOT-RESTORE`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: restore the front-door/header presentation closer to the user-supplied target screenshot after earlier correction passes left the shared header/logo scale oversized

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-017c-2026-04-23`
- Requested change:
  - analyze both supplied screenshots
  - treat the screenshot with the old hero/chat composition as the desired state
  - revert the site look back toward that prior front-door presentation
  - do not claim success without visual verification
- Desired outcome: the homepage/front-door again matches the target screenshot more closely, especially in shared header scale and homepage hero composition
- Source material used for analysis:
  - user-supplied screenshot showing the undesired prompt/start surface
  - user-supplied screenshot showing the desired homepage hero/chat composition
  - current `app/page.tsx`
  - current `components/site-header.tsx`
  - current `app/globals.css`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
  - current phase ownership in `docs/architecture/phase-map-v1.md`

### Scope

- In scope now:
  - homepage screenshot-state restoration
  - shared header/logo scaling rollback
  - build verification
  - fresh homepage and start-surface render verification
- Out of scope now:
  - route redesign
  - auth-flow redesign
  - new component concepts
  - content rewrites outside the already restored homepage CTA row

### Assumptions

- The screenshot with the centered prompt surface represents the undesired current state.
- The screenshot with the left hero copy and right preview chat card is the target state for the front-door presentation.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Shared front-door presentation system`
- Systems touched: `Homepage shell`, `Shared site header`, `Shared logo sizing`
- Trust-layer systems touched: `None`
- Key risk: overshooting the rollback and changing front-door structure beyond the screenshot target

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-017c-2026-04-23`
- Request origin: `Brand / UX corrective rollback`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `None`
- Rebuild radius: `Low`
- Impact category: `low`
- Roadmap revision required: `No`
- Architecture confidence: `98`
- Preliminary gate recommendation: `Approved as a localized front-door corrective rollback`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-017c-2026-04-23`
- Requested change summary: restore the front-door look by keeping the homepage in the target hero/chat composition and scaling the shared header/logo treatment back toward the supplied screenshot
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - homepage shell tuning
  - shared header/logo sizing rollback
  - build and visual verification
- Explicitly untouched:
  - start-flow content
  - auth logic
  - route mappings
  - backend/runtime workflow behavior

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a corrective UI refinement on current public surfaces
  - it introduces no new system capability

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the work focused on the target screenshot state
  - verify the actual rendered front-door after the rollback
  - do not broaden into unrelated runtime behavior changes

