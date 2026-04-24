# NEROA-CX-013U - Projects Accent and Minimal Header Balance

Date: 2026-04-24

## Extraction Snapshot

- Requested change: make `Projects` use the same visible accent color as `Home` in the reduced public header and move the navigation dropdown button beside the account/sign-in control with more even spacing.
- Request origin: direct user request.
- Current context: the `minimalNavigation` branch in `components/site-header.tsx` already exposes `Home`, `Projects`, the shared `SiteNav` button, and the account/CTA controls, but the current order makes the row feel visually unbalanced.
- In scope now:
  - shared reduced public header presentation
  - control order within the existing header bubble
  - color parity between existing `Home` and `Projects` links
- Explicitly out of scope now:
  - route changes
  - auth behavior changes
  - dropdown inventory changes
  - logo or hero redesign
- Architecture confidence: 96
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
  - verification of the reduced public header render
- Why rebuild is required:
  - the shared reduced header branch needs its link accent and control ordering updated to match the requested presentation
- What remains untouched:
  - `components/site/site-nav.tsx`
  - `components/site/public-account-menu.tsx`
  - route/auth handlers
  - page content outside the shared header
- Regression exposure:
  - reduced public header alignment only
  - mitigated by keeping the same controls, links, and auth routing behavior

## Phase Mapping Decision

- Request summary: reduced-header visual polish for existing controls
- Current workstream: shared public header surface
- Owning system: Phase 3 execution surface
- Primary phase assignment: Phase 3
- Secondary phase assignments: none
- Outcome: Approved now
- Why: the request stays inside current execution scope and does not introduce a new branch, trust-layer mutation, or future-phase capability.

## Execution Gate Decision

- Confidence threshold met: yes (`96`)
- Extraction sufficiency: satisfied
- Delta-Analyzer complete: satisfied
- Rebuild Impact Report complete: satisfied
- Phase mapping complete: satisfied
- Roadmap revision required first: no
- Final outcome: Approved as-is
- Rationale: this is a local shared-header presentation correction fully contained inside Phase 3 with no architecture conflict.

## Verification Target

- Confirm the reduced public header shows `Projects` with the same accent color used by `Home`.
- Confirm the reduced public header reorders the controls so the navigation menu button sits beside the account/sign-in control and the row spacing is more even.
