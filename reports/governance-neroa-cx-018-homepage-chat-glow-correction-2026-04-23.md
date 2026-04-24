# Governance Analysis: NEROA-CX-018 Homepage Chat Glow Correction

- Prompt ID: `NEROA-CX-018-HOMEPAGE-CHAT-GLOW-CORRECTION`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: remove the round side bubbles around the homepage chat card and tighten the under-card glow to match the user-supplied glow reference without changing layout, copy, routing, or background composition

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-018-2026-04-23`
- Requested change:
  - inspect the supplied homepage screenshot, bubble close-up, and glow close-up
  - remove the visible round glow bubbles at the sides of the homepage chat card
  - make the chat under-glow read like the supplied cyan-violet reference beam
  - do not redesign the site or change anything outside the glow treatment
- Desired outcome: homepage chat card keeps the same placement and structure, but the side circles disappear and the glow under the card reads as one premium beam attached to the card
- Source material used for analysis:
  - user-supplied full homepage screenshot
  - user-supplied bubble close-up
  - user-supplied glow reference close-up
  - current `app/globals.css`
  - current `components/front-door/neroa-chat-card.tsx`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`

### Scope

- In scope now:
  - homepage chat-shell pseudo-element glow correction
  - homepage chat-card edge halo adjustment
  - visual verification of the homepage render
- Out of scope now:
  - layout changes
  - copy changes
  - route changes
  - background-system changes outside the chat-shell glow layers

### Assumptions

- The visible round forms at the sides of the chat are coming from the chat-shell glow pseudo-elements rather than from the page-wide background asset itself.
- Tightening those pseudo-elements is a corrective visual adjustment, not a redesign.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Front-door homepage presentation`
- Systems touched: `Homepage chat-shell CSS glow layers`
- Trust-layer systems touched: none
- Key risk: broad changes to the atmospheric layer could unintentionally alter the whole page; the correction must stay scoped to the chat shell

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-018-2026-04-23`
- Request origin: `Visual correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `None`
- Rebuild radius: `Low`
- Impact category: `low`
- Roadmap revision required: `No`
- Architecture confidence: `97`
- Preliminary gate recommendation: `Approved as a scoped homepage glow correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-018-2026-04-23`
- Requested change summary: replace the homepage chat-shell side-circle glow with a tighter under-card beam and slightly stronger perimeter halo
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - homepage chat-shell pseudo-element update
  - homepage chat-card perimeter glow update
  - rendered homepage verification
- Explicitly untouched:
  - header/nav
  - homepage copy
  - button layout
  - global background asset system
  - route behavior

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a corrective refinement of an existing front-door surface
  - it does not introduce a new product capability

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the fix scoped to homepage chat glow layers
  - do not reintroduce side circles
  - verify the rendered homepage visually before closing
