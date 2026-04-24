# NEROA-CX - Targeted Chat Font Adjustment

Date: 2026-04-24

## Extraction Snapshot

- Requested change: increase the landing chatbox font size to 14 for the summary line and the opening Neroa prompt.
- Primary focus:
  - front-door chatbox typography only
- Required outcomes:
  - set the highlighted summary copy to 14px
  - set the opening "Hi, I'm Neroa. What's your name?" prompt to 14px
  - keep layout, routing, and chat behavior unchanged
- In scope:
  - `components/front-door/neroa-chat-card.tsx`
  - `app/globals.css`
- Out of scope:
  - chat flow copy
  - routing
  - navigation
  - button styling
  - broader chat typography outside the targeted lines
- Architecture confidence: 99

## Delta-Analyzer

- Owning system: front-door landing presentation
- Primary phase touched: Phase 3
- Rebuild radius: local
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: visual typography refinement
- Risk level: low
- Required rebuild scope:
  - targeted front-door chat copy sizing
  - regression check for landing chat layout stability
- Regression exposure:
  - targeted chat text size only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a contained visual adjustment with no product behavior impact.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm the specified summary line and opening prompt render at 14px.
- Confirm the rest of the chatbox behavior and layout remain unchanged.
