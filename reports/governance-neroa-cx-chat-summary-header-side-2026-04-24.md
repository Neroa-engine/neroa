# NEROA-CX - Chat Summary Header Placement

Date: 2026-04-24

## Extraction Snapshot

- Requested change: move the front-door chat summary copy up and to the right of the title `Start with a guided planning conversation.`
- Primary focus:
  - landing/start chat header layout
- Required outcomes:
  - reposition the existing summary copy into the header area
  - place it to the right of the title on the front-door surface
  - keep chat behavior, hero structure, and other shared uses intact
- In scope:
  - `components/front-door/neroa-chat-card.tsx`
  - `components/front-door/front-door-home-hero.tsx`
  - `app/globals.css`
- Out of scope:
  - chat wording
  - routing
  - hero or navigation redesign
  - unrelated `ai-app-builder` chat layout
- Architecture confidence: 99

## Delta-Analyzer

- Owning system: front-door landing presentation
- Primary phase touched: Phase 3
- Rebuild radius: local
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: targeted header layout refinement
- Risk level: low
- Required rebuild scope:
  - front-door chat header composition
  - regression check for shared card reuse boundaries
- Regression exposure:
  - landing/start chat header layout only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a scoped presentation refinement with no product behavior change.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm the summary copy sits above and to the right of the main chat title on the landing/start surface.
- Confirm other shared uses of `NeroaChatCard` keep their prior summary placement.
