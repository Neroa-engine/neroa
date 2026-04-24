# Governance Analysis: NEROA-CX-014 Homepage Chat Underglow Correction

- Prompt ID: `NEROA-CX-014-HOMEPAGE-CHAT-UNDERGLOW-CORRECTION`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: strengthen and reshape the homepage under-chat glow to match the attached visual reference more closely

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-014-2026-04-23`
- Requested change:
  - increase the current homepage chat-box underglow by roughly `75%`
  - use the attached screenshot as direct visual guidance
  - make the glow read much closer to the screenshot with a premium cyan/violet bloom beneath the current chat box
- Desired outcome: the homepage hero remains structurally unchanged, but the under-card atmospheric glow beneath the right-side chat surface becomes wider, brighter, and closer to the supplied reference
- Source material used for analysis:
  - attached glow-reference screenshot
  - current homepage implementation in `app/page.tsx`
  - current homepage chat-glow styles in `app/globals.css`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
  - current phase ownership in `docs/architecture/phase-map-v1.md`

### Scope

- In scope now:
  - homepage-only under-chat glow refinement
  - homepage-only CSS update
  - production build and screenshot verification
- Out of scope now:
  - chat-card content changes
  - hero layout changes
  - footer or header changes
  - route logic changes

### Assumptions

- "Increase it by 75%" refers to the under-card glow footprint and perceived glow presence, not another resize of the chat-card component itself.
- The screenshot is the locked directional reference for color placement and glow spread beneath the current chat surface.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Public front-door presentation`
- Systems touched: `Homepage CSS only`
- Trust-layer systems touched: `None`
- Key risk: a stronger glow could become harsh or spill too far into the hero if the bloom is widened without preserving soft edges

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-014-2026-04-23`
- Request origin: `Brand / UX correction`
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
- Preliminary gate recommendation: `Approved as a narrow homepage visual correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-014-2026-04-23`
- Requested change summary: strengthen and widen the cyan/violet glow beneath the homepage chat card using the attached screenshot as the visual target
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - homepage chat-shell CSS glow layer updates
  - production build
  - refreshed screenshot verification
- Explicitly untouched:
  - route behavior
  - hero copy
  - layout hierarchy
  - logo treatment
  - backend/product logic

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a current-state front-door presentation refinement on an existing route
  - it adds no new system capability and remains inside active runtime surface scope

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the change homepage-scoped
  - tune only the under-card glow treatment
  - verify the rendered result visually before claiming completion

## Completion Addendum

- Implemented:
  - widened the homepage chat underglow footprint
  - increased branded asset bloom beneath the card
  - strengthened cyan edge glows and violet center support to read closer to the supplied screenshot
- Verification completed:
  - `npm run build`
  - fresh production homepage screenshot review
- Remaining verification limit:
  - none for this scoped homepage glow correction
