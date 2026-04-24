# Governance Analysis: NEROA-CX-006 Full System Brand Repair

- Prompt ID: `NEROA-CX-006-FULL-SYSTEM-BRAND-REPAIR`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: repair the NEROA brand rollout across shared public shells and key signed-in product surfaces by correcting the header/logo treatment, increasing brand color intensity and ambient visibility, and replacing lingering light-shell presentation inside interior product components

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-006-2026-04-23`
- Requested change: compare the current implementation against the approved NEROA brand board, then correct the global rollout in one pass so the logo/header reads as a polished separated brand anchor, the ice-blue and violet system is visibly stronger, the ambient wave/glow reads clearly, and the important interior product surfaces no longer feel like light-shell leftovers
- Why it exists: the current system still under-shoots the approved board in intensity and polish, and the shell-level rollout did not fully convert the reusable interior surface language
- Desired outcome: one consistent NEROA product family across the homepage, landing pages, pricing/support/auth shells, and the signed-in projects / usage / settings / command center / strategy room / workspace surfaces, with the approved premium black depth, visible blue-violet glow identity, restrained active motion, and a deliberate left logo anchor separated from the nav pane
- Source material used for analysis:
  - current homepage implementation screenshot available in the working thread and local verification captures
  - current interior implementation audit from the shared signed-in shell and surface components in repo
  - approved NEROA branding board attached in this thread and stored locally at `C:\Users\Administrator\Documents\Brand Guide Neroa\Website Brand Guide lines.png`
- Visual gap identified before execution:
  - current logo dock is separate from the nav pane but still presents the logo as a nested rectangular badge rather than a polished anchored lockup
  - current public glow and wave behavior remains weaker and flatter than the approved board
  - interior surfaces still render many white / slate utility treatments inside dark shells, so the product pages do not fully inherit the approved NEROA system
  - active states, chips, tabs, side rails, and shared panels still lean too neutral in key signed-in flows

### Scope

- In scope now:
  - shared logo/header presentation across public and signed-in shells
  - shared NEROA color, glow, and motion token correction
  - shared public marketing shell correction
  - shared portal and workspace shell correction
  - reusable interior product surface components and supporting route wrappers
  - responsive and reduced-motion preservation
  - production build verification plus representative browser verification for accessible routes
- Out of scope now:
  - backend logic, auth logic, billing logic, entitlement logic, or protected-routing behavior changes
  - new routes, duplicate pages, or information architecture redesign
  - workflow changes inside command execution, planning logic, or live product logic
  - non-brand feature work unrelated to the requested repair

### Assumptions

- The approved NEROA board is the locked source of truth for visual intensity, black depth, glow balance, and ambient motion.
- The signed-in surfaces should be corrected through shared component and token layers first, then through targeted component updates where the current utilities still force a light appearance.
- The current logo asset may need presentation rework or a derived crop treatment to avoid the nested badge effect while staying faithful to the approved brand mark already present in repo.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Public shell`, `Shared header`, `Portal shell`, `Workspace shell`, `Reusable interior surface components`, `Shared visual tokens`
- Trust-layer systems touched: `Presentation only on signed-in surfaces; no auth, billing, entitlement, or protected-routing logic mutation`
- Key risk: broad shared-surface correction could harm readability or regress common controls if the changes are not centralized and verified across both marketing and signed-in shells

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-006-2026-04-23`
- Request origin: `Brand / UX correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: `4 (presentation-only awareness on trust-adjacent signed-in surfaces)`
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `Presentation only`
- Rebuild radius: `High`
- Impact category: `high`
- Roadmap revision required: `No`
- Architecture confidence: `90`
- Preliminary gate recommendation: `Approved with shared-surface discipline`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-006-2026-04-23`
- Requested change summary: correct the full-system NEROA visual rollout by updating shared tokens, ambient layers, header presentation, and reusable interior/public surface components so the approved dark premium system is consistent end to end
- Risk level: `high`
- Change type: `modifying`
- Required rebuild scope:
  - shared logo/header presentation
  - shared public shell token and atmosphere layers
  - shared portal / workspace shell token and atmosphere layers
  - reusable interior components that still force light cards, tabs, pills, panels, and muted active states
  - representative public and signed-in verification where runtime access allows
- Explicitly untouched:
  - route behavior
  - auth / billing / account logic
  - backend execution
  - product workflow semantics

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a runtime UI repair on existing execution surfaces
  - it does not introduce new architecture branches, future-phase systems, or trust-layer behavior changes
  - the signed-in scope is broader than CX-005, but it remains presentation work inside approved current execution surfaces

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - implement through shared tokens, shared shells, and reusable surface components first
  - preserve nav, route, workflow, and protected-surface behavior
  - keep reduced-motion support intact
  - verify public routes directly and verify accessible signed-in shell outputs without inventing session state

## Implementation Notes

- Preferred implementation path:
  - refine the left logo anchor so it looks intentional instead of nested
  - deepen the existing NEROA token system rather than creating a second theme
  - correct reusable interior panels, tabs, chips, side rails, and shell chrome so signed-in pages stop inheriting light-first visual language

## Completion Addendum

- Follow-up visual analysis compared the live homepage and landing implementation directly against the approved NEROA board again before final edits.
- The remaining gap resolved in this completion slice was:
  - compacting the header lockup into a more deliberate left brand anchor derived from the approved logo asset
  - strengthening the beam-like cyan/violet atmosphere on homepage and landing hero shells
  - converting remaining route-level signed-in holdouts in Billing, Usage, and Settings away from explicit white/slate cards
  - ensuring the document root itself stays on the premium near-black base so public routes do not fall back to white outside the branded shell
- Verification completed:
  - production build passed after the final correction set
  - desktop browser captures passed for `/`, `/ai-app-builder`, `/pricing`, and `/auth`
  - mobile browser captures passed for `/` and `/pricing`
  - reduced-motion verification confirmed wave, glow, CTA, and logo animations resolve to `none`
- Remaining verification limit:
  - authenticated interior browser sign-off is still required because protected routes continue to redirect without a live signed-in session in this environment
