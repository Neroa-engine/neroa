# Governance Analysis: NEROA-CX-007 Visual Inspection Correction

- Prompt ID: `NEROA-CX-007-VISUAL-INSPECTION-CORRECTION`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: visually inspect the current homepage/front-door implementation against the approved NEROA board, then correct the logo/header presentation, color balance, glow behavior, and wave/flow shape without redesigning the layout structure

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-007-2026-04-23`
- Requested change: use direct screenshot inspection rather than token assumptions to bring the homepage/front-door atmosphere materially closer to the approved NEROA board
- Why it exists: the current implementation is closer than earlier passes, but the homepage still reads visually off from the approved board in the logo anchor, black depth, colorway, glow concentration, and wave direction
- Desired outcome: the existing homepage structure remains intact while the left header anchor, hero atmosphere, CTA glow, and product-panel edge glow visually align more closely with the approved board
- Source material used for analysis:
  - current homepage screenshot captured locally at `C:\Users\Administrator\Documents\GitHub\neroa\.codex-temp\captures\home-desktop.png`
  - approved NEROA visual source of truth at `C:\Users\Administrator\Documents\Brand Guide Neroa\Website Brand Guide lines.png`
- Visual issues identified before execution:
  - current header logo still reads like a bright poster crop inside a box rather than the board's restrained brand anchor
  - current homepage wave is too broad and sheet-like across the hero, instead of the board's fed-in lower arc and concentrated energy path
  - current cyan/violet energy is present but still too muted in the hero atmosphere compared with the approved board
  - current glow is too evenly diffuse and not concentrated enough around the CTA, wave core, and panel edge

### Scope

- In scope now:
  - shared homepage/front-door header logo presentation
  - homepage/front-door wave shape, glow placement, and black depth
  - shared front-door CTA and panel glow tuning where required by the visual correction
  - responsive and reduced-motion preservation
  - production build plus screenshot-based visual verification
- Out of scope now:
  - information architecture changes
  - nav order or route behavior changes
  - signed-in product workflow logic
  - new routes or duplicate pages
  - unrelated interior-shell changes unless a shared front-door asset or token is reused

### Assumptions

- The approved NEROA board remains the locked visual source of truth.
- This pass should tighten the existing implementation rather than invent a new concept.
- A derived header presentation from the approved logo asset is valid if it produces a cleaner anchor than the current badge-like crop.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Public shell`, `Shared header`, `Homepage/front-door atmosphere`, `Shared visual tokens`
- Trust-layer systems touched: none
- Key risk: visual corrections could accidentally drift into a structural redesign if the changes are not kept constrained to presentation and atmosphere

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-007-2026-04-23`
- Request origin: `Brand / UX correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `None`
- Rebuild radius: `Medium`
- Impact category: `medium`
- Roadmap revision required: `No`
- Architecture confidence: `93`
- Preliminary gate recommendation: `Approved as a constrained front-door correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-007-2026-04-23`
- Requested change summary: refine the live homepage/front-door implementation so the logo anchor, colorway, glow, and wave/flow match the approved NEROA board more closely through presentation-only updates
- Risk level: `medium`
- Change type: `modifying`
- Required rebuild scope:
  - shared header logo presentation on the public shell
  - homepage/front-door atmosphere layers
  - CTA glow and panel edge glow used by the homepage/front-door shell
  - representative public visual verification
- Explicitly untouched:
  - route behavior
  - auth or billing logic
  - nav order and content hierarchy
  - signed-in workflow semantics

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a runtime presentation correction on an existing public execution surface
  - it stays inside the approved current execution baseline
  - it does not introduce new architecture branches or trust-layer behavior changes

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the homepage/front-door structure intact
  - adjust only the presentation layers the screenshot inspection showed to be off
  - preserve reduced-motion support
  - visually verify the updated output against the approved board before claiming completion
