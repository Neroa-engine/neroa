# Governance Analysis: NEROA-CX-005 Global Brand Correction

- Prompt ID: `NEROA-CX-005-GLOBAL-BRAND-CORRECTION`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: correct the shared NEROA brand intensity, wave/glow visibility, and global header/logo treatment across both public-facing pages and the key signed-in product shells, while preserving existing route wiring, page purpose, and workflow logic

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-005-2026-04-23`
- Requested change: use the attached current implementation screenshot and approved branding reference as direct visual source material, then close the gap by strengthening ice-blue and violet presence, increasing visible premium glow and wave behavior, and moving the logo into its own dark box to the left of the navigation pane across public and interior shells
- Why it exists: the current rollout is still too muted relative to the approved board, the logo is still visually trapped inside the navigation pane treatment, and key signed-in surfaces still do not feel like part of the same NEROA system
- Desired outcome: one consistent NEROA dark premium shell across marketing and key interior product pages, with brighter white text, stronger branded accents, visible but restrained ambient motion, and a consistent separated left-logo-box header treatment
- Source material used for analysis:
  - attached current implementation screenshot from this task thread
  - attached approved branding board from this task thread
- Visual gap identified before execution:
  - current implementation underplays cyan / ice-blue energy
  - violet support is too faint to read as part of the brand identity
  - active wave and glow are too subtle compared with the approved board
  - the logo remains visually embedded in the nav pane instead of acting as its own left brand anchor
  - public and interior shells still diverge in atmosphere and contrast

### Scope

- In scope now:
  - shared NEROA color, glow, and motion correction
  - shared header treatment correction with separate left logo box
  - public marketing/front-door shells and routes
  - signed-in portal shells and key project room shells
  - representative verification across public and interior routes
  - preservation of responsive behavior and reduced-motion support
- Out of scope now:
  - new routes, duplicate pages, or information-architecture redesign
  - backend, billing logic, auth logic, protected-routing logic, or workflow behavior changes
  - arbitrary product-flow rewrites
  - non-shell product features unrelated to the brand correction

### Assumptions

- The attached approved branding board is the locked source of truth for color intensity, glow balance, and ambient wave presence.
- The correction should land through shared tokens, shared shell layers, and shared header structures rather than page-by-page reinvention.
- Interior shells should adopt the same system language as the front door without collapsing all signed-in pages into the same layout.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Public shell`, `Portal shell`, `Lane/board workspace shell`, `Shared header`, `Shared visual tokens`
- Trust-layer systems touched: `Presentation only on signed-in surfaces; no auth, billing, or entitlement logic mutation`
- Key risk: a global shell correction could unintentionally disturb route chrome, account navigation, or interior readability if the shared theme and header changes are not centralized carefully

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-005-2026-04-23`
- Request origin: `Brand / UX correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: `4 (presentation-only boundary awareness across signed-in surfaces)`
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `Presentation only`
- Rebuild radius: `High`
- Impact category: `high`
- Roadmap revision required: `No`
- Architecture confidence: `89`
- Preliminary gate recommendation: `Approved with shared-shell discipline`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-005-2026-04-23`
- Requested change summary: strengthen the already-approved NEROA brand system and extend it consistently across public and key interior shells by updating shared shell layers, header structure, color/glow tokens, and ambient motion
- Risk level: `high`
- Change type: `modifying`
- Required rebuild scope:
  - shared atmosphere and token layer
  - shared public header
  - shared signed-in portal header
  - shared marketing shell
  - shared portal / workspace shell surfaces
  - representative public and interior verification in production output
- Explicitly untouched:
  - route behavior
  - auth/billing/account logic
  - backend execution
  - information architecture beyond shell/header presentation

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is still a presentation-layer correction across already-existing product surfaces
  - it modifies shared runtime product UI but does not create new architectural branches or cross into autonomous/future-scoped systems
  - the signed-in scope expands the presentation boundary, but not the trust or workflow boundary

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - implement through shared shell/token/header systems first
  - preserve route and workflow behavior
  - preserve reduced-motion support
  - verify both public and signed-in representative routes before claiming completion

## Implementation Notes

- Preferred implementation path:
  - strengthen the existing dark-shell token set rather than introducing a second competing brand system
  - reuse one shared ambient system where practical across public, portal, and workspace shells
  - introduce one shared separated logo-box header treatment and apply it consistently to all relevant shell families
