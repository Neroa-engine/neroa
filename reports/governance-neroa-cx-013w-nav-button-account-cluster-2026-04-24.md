# NEROA-CX-013W - Nav Button Account Cluster Alignment

Date: 2026-04-24

## Extraction Snapshot

- Requested change: move the shared navigation dropdown button next to the account control in the public header.
- Request origin: direct user request.
- Current context: the full public header branch still places the shared `SiteNav` button in the middle navigation cluster while the account button/avatar remains in the right cluster, so the controls feel split across the header.
- In scope now:
  - shared full public header control order
  - right-side account/nav clustering
  - local spacing alignment for existing controls
- Explicitly out of scope now:
  - route changes
  - auth behavior changes
  - dropdown content changes
  - logo, hero, or footer changes
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
  - live verification of the full public header render
- Why rebuild is required:
  - the shared full header branch needs its control order updated so the navigation button and account control render as one right-side cluster
- What remains untouched:
  - `components/site/site-nav.tsx`
  - `components/site/public-account-menu.tsx`
  - routes and auth handlers
  - page content outside the shared header
- Regression exposure:
  - full public header alignment only
  - mitigated by preserving the same controls and moving only their placement

## Phase Mapping Decision

- Request summary: move the nav dropdown into the account cluster on the full header
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
- Rationale: this is a local shared-header ordering correction contained fully inside Phase 3 with no architectural conflict.

## Verification Target

- Confirm the full public header shows the nav button beside the account control on `/pricing`.
- Confirm the middle header cluster still renders the remaining controls correctly after the nav button moves right.
