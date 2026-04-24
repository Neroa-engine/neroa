# NEROA-CX - Front-Door Header Logo Refinement

Date: 2026-04-24

## Extraction Snapshot

- Requested change: refine the Neroa front-door branding without changing layout, routing, chat behavior, or background treatment.
- Primary focus: shared header logo only.
- Required outcomes:
  - remove the wing flourishes from the current logo
  - make the logo more subtle
  - align the mark with the current site color family while reducing the blue / purple / deep purple split
- In scope:
  - `components/logo.tsx`
  - minimal logo-only support styling in `app/globals.css` if needed
- Out of scope:
  - layout hierarchy
  - routing
  - chat behavior
  - nav structure
  - page glow/background system
  - broader front-door component restyling
- Architecture confidence: 99

## Delta-Analyzer

- Owning system: shared public header branding
- Primary phase touched: Phase 3
- Rebuild radius: local
- Trust-layer impact: none
- Roadmap revision required: no

## Rebuild Impact Report

- Change type: visual refinement
- Risk level: low
- Required rebuild scope:
  - `components/logo.tsx`
  - visual verification of front-door header rendering
- Regression exposure:
  - header brand rendering only

## Phase Mapping Decision

- Phase assignment: Phase 3
- Outcome: approved now
- Why: this is a contained front-door branding refinement with no behavior or trust-layer changes.

## Execution Gate Decision

- Confidence threshold met: yes
- Delta-Analyzer complete: yes
- Rebuild impact complete: yes
- Roadmap revision required first: no
- Final outcome: approved as-is

## Verification Target

- Confirm the header logo no longer includes wing flourishes.
- Confirm the logo reads as subtler and more integrated with the current dark front-door styling.
- Confirm the page layout, nav, CTA placement, and chat behavior remain unchanged.
