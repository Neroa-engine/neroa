# NEROA-CX - Landing Chatbox Size Trim

Date: 2026-04-24

## Extraction Snapshot

- Requested change: reduce the front-door chatbox height by 25% and width by 15%.
- Primary focus:
  - landing/start hero chatbox sizing
- Required outcomes:
  - trim the visible front-door chatbox footprint
  - keep layout hierarchy, routing, and chat behavior unchanged
- In scope:
  - `app/globals.css`
  - `.homepage-chat-shell .ai-builder-product-card` sizing rules
- Out of scope:
  - chat copy and interaction behavior
  - routing
  - navigation
  - background styling
  - separate `ai-app-builder` chat shell sizing
- Architecture confidence: 99

## Delta-Analyzer

- Owning system: front-door landing presentation
- Primary phase touched: Phase 3
- Rebuild radius: local
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: visual sizing refinement
- Risk level: low
- Required rebuild scope:
  - front-door landing/start chat shell sizing
  - regression check for hero layout stability
- Regression exposure:
  - chatbox size only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a contained presentation update with no product-surface behavior change.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm the landing/start chatbox is about 15% narrower and 25% shorter at the sized desktop/tablet surfaces.
- Confirm the rest of the hero layout and the chat behavior remain unchanged.
