# Governance Analysis: NEROA-CX-013 Homepage Chat Scale And Bottom Bubble Removal

- Prompt ID: `NEROA-CX-013-HOMEPAGE-CHAT-SCALE-AND-BOTTOM-BUBBLE-REMOVAL`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: enlarge the homepage right-side chat card, move the homepage stage pills into one centered row below the hero, remove the lower homepage footer bubble, and strengthen the bottom glow beneath the chat surface

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-013-2026-04-23`
- Requested change:
  - increase the current homepage chat box by roughly `75%`
  - center the five homepage stage pills beneath the combined hero row in a single horizontal line
  - increase the pill size by roughly `50%`
  - remove the lower bubble shown in the attached screenshot
  - add a stronger premium glow at the bottom of the homepage chat box using the attached screenshot as reference
- Desired outcome: the homepage remains the same conceptually, but the hero reads with a larger premium chat surface, a centered stage-pill row, no lower footer bubble, and a clearer under-card glow
- Source material used for analysis:
  - attached homepage screenshot showing the current hero state
  - attached screenshot showing the footer bubble to remove
  - attached screenshot showing the desired chat-box scale and under-card glow direction
  - current homepage implementation in `app/page.tsx`
  - shared chat-card implementation in `components/front-door/neroa-chat-card.tsx`
  - current front-door theme styles in `app/globals.css`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
  - current phase ownership in `docs/architecture/phase-map-v1.md`

### Scope

- In scope now:
  - homepage-only hero composition adjustment
  - homepage-only footer bubble removal
  - homepage chat-card sizing and glow refinement
  - homepage stage-pill repositioning and scaling
  - production build plus desktop/mobile verification
- Out of scope now:
  - landing-page route redesign
  - header or logo treatment changes
  - route or auth behavior changes
  - broader public-shell restyling

### Assumptions

- The "five bubbles" are the five primary stage pills the user wants kept in the centered row, so `Refinement` is removed from that homepage strip.
- The lower bubble to remove is the homepage footer panel shown in the screenshot, not a new content section elsewhere on the site.
- A `75%` size increase is best interpreted as a substantially larger homepage chat-card footprint while preserving a workable hero layout on desktop and mobile.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Public front-door presentation`
- Systems touched: `Homepage route`, `Homepage CSS`, `Shared public shell footer visibility`
- Trust-layer systems touched: `None`
- Key risk: enlarging the homepage chat surface and pill row could crowd the hero or create mobile overflow if not constrained carefully

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-013-2026-04-23`
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
- Architecture confidence: `97`
- Preliminary gate recommendation: `Approved as a narrow homepage presentation correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-013-2026-04-23`
- Requested change summary: scale the homepage chat card and stage pills, move the stage pills beneath the full hero row, remove the lower footer bubble on the homepage, and strengthen the under-card glow
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - homepage JSX update
  - homepage front-door CSS adjustments
  - homepage-only footer suppression
  - production build and visual verification
- Explicitly untouched:
  - route behavior
  - hero headline/support copy
  - logo treatment
  - landing-page route composition
  - backend/product logic

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a current-state public presentation refinement on an existing route
  - it introduces no new product system and stays within active runtime surface scope
  - it does not cross into auth, billing, or future-phase tooling

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the change homepage-scoped
  - remove only the lower footer bubble the screenshot identifies
  - preserve mobile cleanliness after enlarging the chat card and pill row
  - verify the rendered result before claiming completion

## Completion Addendum

- Implemented:
  - enlarged the homepage chat-card footprint and widened the homepage hero grid to support it
  - moved the homepage stage pills into one centered row below the full hero and kept five pills in that strip
  - increased the homepage pill sizing
  - removed the lower homepage footer bubble by disabling the homepage footer shell
  - added a stronger under-card glow beneath the homepage chat surface
- Verification completed:
  - `npm run build`
  - fresh production desktop/mobile renders of `/`
- Remaining verification limit:
  - none for this scoped homepage correction
