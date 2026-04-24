# NEROA-CX - Chat Bottom CTA Lighten And Thread Expansion

Date: 2026-04-24

## Extraction Snapshot

- Requested change: reduce the weight of the bottom chat button and expand the inner chat proportionally.
- Primary focus:
  - landing/start chat bottom composer only
- Required outcomes:
  - make the bottom CTA feel lighter
  - slightly slim the composer footprint
  - let the reclaimed vertical room flow into the internal conversation region
  - keep outer card size, text sizing, layout, and behavior intact
- In scope:
  - `app/globals.css`
  - landing/start chat CTA and composer spacing rules
- Out of scope:
  - outer card dimensions
  - text size changes
  - hero, navigation, background, or routing
  - chat wording or interaction behavior
  - unrelated `ai-app-builder` chat controls
- Architecture confidence: 99

## Delta-Analyzer

- Owning system: front-door landing presentation
- Primary phase touched: Phase 3
- Rebuild radius: local
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: contained control-weight and spacing refinement
- Risk level: low
- Required rebuild scope:
  - landing/start chat CTA treatment
  - regression check for pinned composer and scrollable thread balance
- Regression exposure:
  - front-door chat bottom control area only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a scoped front-door presentation refinement with no route or behavior change.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm the bottom CTA feels visually lighter.
- Confirm the internal chat region gains a proportional bit more visible room.
