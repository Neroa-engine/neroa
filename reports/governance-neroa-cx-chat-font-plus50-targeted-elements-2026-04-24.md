# NEROA-CX - Chat Font Increase For Targeted Elements

Date: 2026-04-24

## Extraction Snapshot

- Requested change: increase the specified landing chatbox text elements by 50%.
- Primary focus:
  - front-door landing/start chat typography
- Required outcomes:
  - enlarge `Planning chat`
  - enlarge the summary line
  - enlarge the opening `Hi, I'm Neroa. What's your name?` prompt
  - enlarge the `Your name` label
  - enlarge live typed input text
  - enlarge submitted user-entered text in the chat thread
- In scope:
  - `components/front-door/neroa-chat-card.tsx`
  - `app/globals.css`
- Out of scope:
  - chat wording
  - routing
  - navigation
  - button styling
  - unrelated `ai-app-builder` chat typography
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
  - targeted front-door chat text sizing
  - regression check for landing/start chat layout stability
- Regression exposure:
  - targeted chat text size only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a contained visual update with no product behavior change.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm the requested landing/start chat text elements render at 150% of their prior sizes.
- Confirm chat behavior and the rest of the front-door layout remain unchanged.
