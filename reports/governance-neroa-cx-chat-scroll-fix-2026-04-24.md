# NEROA-CX - Chat Scroll Fix

Date: 2026-04-24

## Extraction Snapshot

- Requested change: add a real internal vertical scroll area to the front-door chat while keeping the outer card fixed.
- Primary focus:
  - landing/start chat conversation containment
- Required outcomes:
  - keep the current outer chat box size
  - keep current text size and layout
  - make the conversation body scroll internally
  - keep the composer pinned at the bottom
  - use a styled premium scrollbar
- In scope:
  - `components/front-door/neroa-chat-card.tsx`
  - `app/globals.css`
- Out of scope:
  - box dimensions
  - text sizing
  - hero, navigation, background, or routing
  - chat copy and behavior
- Architecture confidence: 99

## Delta-Analyzer

- Owning system: front-door landing presentation
- Primary phase touched: Phase 3
- Rebuild radius: local
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: internal conversation container fix
- Risk level: low
- Required rebuild scope:
  - front-door chat thread overflow containment
  - regression check for pinned composer behavior
- Regression exposure:
  - chat interior scrolling only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a contained front-door UI infrastructure fix with no route or behavior change.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm conversation content stays contained inside the fixed chat card.
- Confirm the thread scrolls internally while the composer stays pinned at the bottom.
- Confirm the scrollbar styling matches the premium UI language.
