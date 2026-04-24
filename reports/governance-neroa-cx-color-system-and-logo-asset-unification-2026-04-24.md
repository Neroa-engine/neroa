# NEROA-CX - Color System And Header Logo Asset Unification

Date: 2026-04-24

## Extraction Snapshot

- Requested change: unify the site button and CTA color system around a deeper purple treatment and rebuild the approved branded header logo without its black background.
- Primary focus:
  - shared button and CTA treatments used across the public site
  - header logo, account control, and navigation entry surfaces
- Required outcomes:
  - replace blue and light-purple button treatments with a deeper purple family
  - align shared button and CTA states more closely with the landing-page direction
  - use the approved branded logo asset rather than the temporary custom header mark
  - remove the black background from the approved logo presentation and keep the logo more subtle
- In scope:
  - `app/globals.css`
  - `components/logo.tsx`
  - `components/site-header.tsx`
  - `components/site/public-account-menu.tsx`
  - `components/site/site-nav.tsx`
  - approved public logo asset handling under `public/logo/*` if needed
- Out of scope:
  - layout hierarchy
  - routing
  - chat behavior
  - page background structure
  - pricing logic, billing logic, projects, dashboard behavior, or auth internals
- Architecture confidence: 98

## Delta-Analyzer

- Owning system: shared public branding and interaction shell
- Primary phase touched: Phase 3
- Rebuild radius: shared public visual system
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: shared visual-system refinement
- Risk level: medium-low
- Required rebuild scope:
  - shared button classes and front-door button overrides
  - public header logo rendering
  - public header navigation and account control accent states
- Regression exposure:
  - button appearance across public and shared shell surfaces
  - header/logo sizing and visual balance

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a bounded branding and interface-consistency pass with no product-flow or trust-layer change.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm shared button and CTA classes render in a deeper purple family.
- Confirm public header/account/nav button states no longer lean cyan.
- Confirm the header logo uses the approved branded asset treatment without a black background.
- Confirm layout, routing, chat behavior, and background composition remain unchanged.
