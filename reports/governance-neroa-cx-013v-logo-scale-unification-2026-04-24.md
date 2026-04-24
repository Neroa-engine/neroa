# NEROA-CX-013V - Logo Scale Unification

Date: 2026-04-24

## Extraction Snapshot

- Requested change: make the shared header logo use the same landing-page size and brand presentation on all pages.
- Request origin: direct user request.
- Current context: the landing page explicitly uses landing-sized prominent branding, while other shared shells still fall back to smaller or less prominent header defaults.
- In scope now:
  - shared header logo scale defaults
  - shared marketing shell defaults
  - shared page-to-page visual consistency for the header logo
- Explicitly out of scope now:
  - logo asset swaps
  - navigation structure changes
  - route changes
  - footer/logo sizing outside the shared header
- Architecture confidence: 97
- Readiness result: sufficient extracted truth to proceed through Delta-Analyzer, impact review, phase mapping, and gate review.

## Delta-Analyzer

- Current approved phase: Phase 3
- Owning system: shared public/workspace header presentation
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
  - `components/layout/page-shells.tsx`
  - live verification on at least the landing page and one non-landing page
- Why rebuild is required:
  - the shared header and shell defaults currently allow page-to-page header-brand drift instead of matching the landing page
- What remains untouched:
  - `components/logo.tsx`
  - navigation/auth behavior
  - page body layouts outside the shared header
- Regression exposure:
  - shared header presentation only
  - mitigated by changing defaults instead of per-page ad hoc overrides

## Phase Mapping Decision

- Request summary: unify shared header logo scale to the landing-page size
- Current workstream: shared execution-surface header presentation
- Owning system: Phase 3 execution surface
- Primary phase assignment: Phase 3
- Secondary phase assignments: none
- Outcome: Approved now
- Why: the request is a local Phase 3 presentation refinement and does not introduce a new branch, trust-layer mutation, or future-phase capability.

## Execution Gate Decision

- Confidence threshold met: yes (`97`)
- Extraction sufficiency: satisfied
- Delta-Analyzer complete: satisfied
- Rebuild Impact Report complete: satisfied
- Phase mapping complete: satisfied
- Roadmap revision required first: no
- Final outcome: Approved as-is
- Rationale: this is a low-risk shared-header consistency correction contained fully inside current Phase 3 execution scope.

## Verification Target

- Confirm the header logo on `/` remains at the landing-page size.
- Confirm the header logo on another non-landing page such as `/pricing` matches that same size after the default change.
