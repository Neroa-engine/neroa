# NEROA-CX - Chat Height Increase By Half Inch

Date: 2026-04-24

## Extraction Snapshot

- Requested change: increase the front-door chat box height by `0.5"` and increase the inner chat region by `0.5"`.
- Primary focus:
  - landing/start chat shell height only
- Required outcomes:
  - add `0.5in` to the fixed landing/start chat card height
  - give the internal conversation region the same added room while keeping the composer pinned
  - keep the current text size, layout language, and behavior
- In scope:
  - `app/globals.css`
  - landing/start chat card height rules
- Out of scope:
  - text sizing
  - hero, navigation, background, or routing
  - chat wording or behavior
  - unrelated `ai-app-builder` chat sizing
- Architecture confidence: 99

## Delta-Analyzer

- Owning system: front-door landing presentation
- Primary phase touched: Phase 3
- Rebuild radius: local
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: contained sizing refinement
- Risk level: low
- Required rebuild scope:
  - landing/start chat card height
  - regression check for internal chat containment and pinned composer behavior
- Regression exposure:
  - front-door chat shell height only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a contained front-door presentation adjustment with no behavior or route change.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm the landing/start chat card is `0.5in` taller than before.
- Confirm the internal conversation region gains the added vertical room while the composer remains pinned.
