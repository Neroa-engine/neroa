# NEROA-CX - Home Hero Headline Copy Pass

Date: 2026-04-24

## Extraction Snapshot

- Requested change: replace the left hero headline copy only.
- Source surface: shared front-door hero used by `/` and the no-entry `/start` page.
- In scope:
  - `components/front-door/front-door-home-hero.tsx`
- Out of scope:
  - hero summary paragraph
  - chat wording and behavior
  - layout, spacing, styling, nav, buttons, background, and glow
- Architecture confidence: 99

## Delta-Analyzer

- Owning system: public front-door landing surface
- Primary phase touched: Phase 3
- Rebuild radius: local
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: copy-only modification
- Risk level: low
- Required rebuild scope:
  - `components/front-door/front-door-home-hero.tsx`
- Regression exposure:
  - hero headline text only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a bounded public-surface copy update with no route, state, or trust-layer changes.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm the hero headline reads:
  - `Share the idea.`
  - `We’ll build the path.`
- Confirm the paragraph below remains unchanged.
