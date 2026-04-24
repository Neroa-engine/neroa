# Governance Analysis: NEROA-CX-018B Homepage Chat Width And Glow Removal

- Prompt ID: `NEROA-CX-018B-HOMEPAGE-CHAT-WIDTH-AND-GLOW-REMOVAL`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: remove the homepage chat glow treatment and widen the homepage chat card to the right by roughly two inches without changing layout hierarchy, copy, routing, or background systems outside the chat presentation

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-018b-2026-04-23`
- Requested change:
  - remove the remaining homepage chat glow
  - widen the homepage chat box to the right by approximately `2in` / `192px`
  - leave the rest of the homepage unchanged
- Desired outcome: homepage chat card stays in the same hero slot and keeps the same content, but no longer carries the dedicated glow layers and presents as a wider desktop card

### Scope

- In scope now:
  - homepage chat-shell pseudo-element removal
  - homepage chat-card perimeter glow removal
  - homepage desktop chat-card width increase
  - rendered homepage verification
- Out of scope now:
  - header/nav changes
  - hero copy changes
  - route changes
  - landing-page changes
  - sitewide button/background changes

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-018b-2026-04-23`
- Request origin: `Visual correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `None`
- Rebuild radius: `Low`
- Impact category: `low`
- Roadmap revision required: `No`
- Architecture confidence: `97`
- Preliminary gate recommendation: `Approved as a scoped homepage chat presentation correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-018b-2026-04-23`
- Requested change summary: remove the homepage chat glow stack and widen the desktop homepage chat card by about `192px`
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - homepage chat-shell CSS update
  - homepage chat-card desktop width update
  - rendered homepage verification
- Explicitly untouched:
  - shared routes
  - navigation behavior
  - hero copy
  - public launch logic

## Execution Gate

- Phase map: `Phase 3`
- Gate result: `Approved`
- Execution note: changes must remain limited to homepage chat presentation and verification artifacts
