# Governance Analysis: NEROA-CX-012 Correct Bottom Section Placement

- Prompt ID: `NEROA-CX-012-CORRECT-BOTTOM-SECTION-PLACEMENT`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: correct the `/ai-app-builder` landing-page composition so the hero stays left, the premium chat card stays right and square, the six pill buttons form a centered row beneath the hero, and the uploaded `NEROA is ready to help frame and route your SaaS the right way.` panel remains only at the bottom of the page

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-012-2026-04-23`
- Requested change: keep the landing-page hero copy on the left, keep a large premium square chat box on the right, move the six labeled pill buttons into a centered horizontal row, and ensure the uploaded lower panel content is used only as the page-bottom section
- Why it exists: the landing page composition needs a clearer separation between hero content, the central signal row, and the lower branded panel so the bottom section does not read like part of the top hero composition
- Desired outcome: one landing page with the requested left/right hero split, a centered pill row, and the branded lower panel clearly anchored at the bottom of the route
- Source material used for analysis:
  - current landing route implementation in `app/ai-app-builder/page.tsx`
  - current landing styles in `app/globals.css`
  - shared front-door shell in `components/layout/page-shells.tsx`
  - existing landing bottom-panel implementation derived from the uploaded footer proof
  - architectural baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
- Implementation gap identified before execution:
  - the lower panel already existed at the bottom of the landing page, so it should stay there rather than be rebuilt elsewhere
  - the six pill buttons were still embedded inside the left hero column instead of sitting in their own centered row
  - the right-side chat card needed a stronger square presentation on desktop to match the required composition more directly

### Scope

- In scope now:
  - `/ai-app-builder` markup composition updates
  - landing-specific CSS for hero alignment, centered pill row, and squarer chat card proportions
  - governance reporting
  - production build and visual verification
- Out of scope now:
  - homepage changes
  - route rewiring
  - bottom-panel content rewrite
  - shared footer changes on other routes
  - color system or atmosphere redesign

### Assumptions

- The route referred to as the landing page is `/ai-app-builder`, which already contains the uploaded lower panel implementation.
- The lower panel is supposed to remain as the custom bottom section for this route, not move into the shared footer or hero area.
- The existing in-card conversation CTA remains valid because the user asked to preserve the square chat-box direction and premium landing concept.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Public front-door presentation`
- Systems touched: `Landing page route`, `Landing-specific CSS`, `Governance report`
- Trust-layer systems touched: `None`
- Key risk: composition changes must stay localized to the landing route and not accidentally spill into other public shells

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-012-2026-04-23`
- Request origin: `Brand / UX composition correction`
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
- Preliminary gate recommendation: `Approved as a landing-route-only composition correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-012-2026-04-23`
- Requested change summary: correct the `/ai-app-builder` landing-page composition so the lower panel remains only at the bottom, the hero copy stays left, the chat card stays right and more square, and the six pill labels move into their own centered row
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - landing route markup update in `app/ai-app-builder/page.tsx`
  - landing-specific CSS refinement in `app/globals.css`
  - representative browser verification for desktop and mobile
- Explicitly untouched:
  - headline wording
  - color system and atmosphere
  - bottom-panel content itself
  - shared shell behavior on other routes
  - route behavior and product logic

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a current-state presentation correction on an existing public landing route
  - it introduces no new capability or future-scope system
  - it remains within the active front-door product-surface scope

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the lower branded panel as the bottom section only
  - preserve the existing headline wording, atmosphere, and premium dark visual system
  - keep the right-side card as the main chat/product surface
  - verify the rendered landing page before claiming completion

## Completion Addendum

- Implemented:
  - moved the six landing pill labels into their own centered row beneath the hero
  - kept the main hero copy on the left and the premium chat/product card on the right
  - tuned the chat card to a more square desktop presentation
  - preserved the existing branded lower panel as the bottom section of the landing page
- Verification completed:
  - `npm run build` passed
  - fresh production desktop and mobile landing renders were visually checked
- Remaining verification limit:
  - none for this scoped landing-page composition correction
