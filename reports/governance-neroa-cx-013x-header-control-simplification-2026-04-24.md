# NEROA-CX-013X - Header Control Simplification

Date: 2026-04-24

## Extraction Snapshot

- Requested change: remove the standalone `Projects` header button, rename `Engine Board` to `Project Board`, move `Home` next to the account control, keep the remaining controls spaced evenly, and shrink the shared navigation panel.
- Request origin: direct user request.
- Current context: the shared header still carries a now-unwanted standalone `Projects` button in the reduced branch, the authenticated board button still says `Engine Board`, and the full header splits `Home` away from the account/nav cluster while the shared nav bubble remains wider than needed.
- In scope now:
  - shared public header control inventory
  - shared public header control order
  - authenticated board button label
  - shared nav-pane width refinement
- Explicitly out of scope now:
  - dropdown inventory changes
  - route/auth behavior changes
  - logo/hero/footer changes
  - account menu internals outside the top-level shared header controls
- Architecture confidence: 97
- Readiness result: sufficient extracted truth to proceed through Delta-Analyzer, impact review, phase mapping, and gate review.

## Delta-Analyzer

- Current approved phase: Phase 3
- Owning system: shared public header / execution surface presentation
- Primary phase touched: Phase 3
- Secondary phases touched: none
- Future phases touched: none
- Trust-layer impact: none
- Dependency direction crossed: no
- Rebuild radius: local
- Contradiction risk: minor
- Impact category: `local`
- Roadmap revision required: no
- Analyzer recommendation: allowed to proceed to impact report and gate review

## Rebuild Impact Report

- Change type: modifying
- Risk level: low
- Required rebuild scope:
  - `components/site-header.tsx`
  - `app/globals.css`
  - live verification on the current public header render
- Why rebuild is required:
  - the shared header needs its visible control set, label wording, control order, and pane width updated together so the public header matches the requested presentation
- What remains untouched:
  - `components/site/site-nav.tsx`
  - `components/site/public-account-menu.tsx`
  - routes and auth handlers
  - page content outside the shared header
- Regression exposure:
  - shared header presentation only
  - mitigated by preserving existing routes and reusing the same controls rather than adding new ones

## Phase Mapping Decision

- Request summary: simplify and rebalance the shared header controls
- Current workstream: shared public header surface
- Owning system: Phase 3 execution surface
- Primary phase assignment: Phase 3
- Secondary phase assignments: none
- Outcome: Approved now
- Why: the request stays inside current Phase 3 execution scope and does not introduce a new branch, trust-layer mutation, or future-phase capability.

## Execution Gate Decision

- Confidence threshold met: yes (`97`)
- Extraction sufficiency: satisfied
- Delta-Analyzer complete: satisfied
- Rebuild Impact Report complete: satisfied
- Phase mapping complete: satisfied
- Roadmap revision required first: no
- Final outcome: Approved as-is
- Rationale: this is a contained shared-header presentation correction with no architectural conflict.

## Verification Target

- Confirm the public `/pricing` header removes the standalone `Projects` button and keeps the remaining controls balanced.
- Confirm the public header places `Home` beside the account control cluster and renders the nav panel narrower.
- Confirm the authenticated top-level board button label is now `Project Board` in code.
