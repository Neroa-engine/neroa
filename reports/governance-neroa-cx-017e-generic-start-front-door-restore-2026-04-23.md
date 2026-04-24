# Governance Analysis: NEROA-CX-017E Generic Start Front-Door Restore

- Prompt ID: `NEROA-CX-017E-GENERIC-START-FRONT-DOOR-RESTORE`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: restore the generic `/start` route so it matches the approved front-door hero/chat surface from the target screenshot, while leaving explicit DIY and managed builder entry flows intact

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-017e-2026-04-23`
- Requested change:
  - compare the wrong screenshot showing the prompt-first `/start` surface with the desired screenshot showing the front-door hero/chat composition
  - revert the user-facing site back to the screenshot-2 look instead of leaving generic `/start` on the prompt-first screen
  - verify the rendered output before claiming success
- Desired outcome: visiting the generic `/start` entry route now produces the same public front-door hero/chat composition as the approved screenshot, while explicit builder entry routes remain available under `/start?entry=diy` and `/start?entry=managed`
- Source material used for analysis:
  - user-supplied screenshot showing the undesired prompt-first `/start` screen
  - user-supplied screenshot showing the desired front-door hero/chat screen
  - current `app/page.tsx`
  - current `app/start/page.tsx`
  - current `components/front-door/neroa-chat-card.tsx`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
  - current phase ownership in `docs/architecture/phase-map-v1.md`

### Scope

- In scope now:
  - restore the generic `/start` route presentation to the approved front-door hero/chat surface
  - keep the homepage and generic `/start` visuals aligned from the same shared component
  - preserve explicit DIY and managed builder entry flows
- Out of scope now:
  - redesigning the explicit guided builder flow
  - changing workspace/project internals
  - changing protected builder execution after `?entry=` routes

### Assumptions

- The user's “site is still not fixed” feedback refers to the fact that the generic `/start` route is still reachable and visually mismatched against the approved front-door screenshot.
- Restoring the generic `/start` presentation to the hero/chat surface is a corrective rollback of user-facing route output rather than a net-new feature.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Public front-door entry routing`
- Systems touched: `Homepage/front-door presentation reuse`, `Generic /start route behavior`
- Trust-layer systems touched: `Auth-gated builder entry behavior` (only by preserving explicit entry gating)
- Key risk: collapsing explicit builder entry paths into the public front door would break planning flows; the restore must remain specific to generic `/start` without an explicit `entry` parameter

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-017e-2026-04-23`
- Request origin: `Front-door corrective rollback`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `Low`
- Rebuild radius: `Medium`
- Impact category: `medium`
- Roadmap revision required: `No`
- Architecture confidence: `95`
- Preliminary gate recommendation: `Approved as a targeted route-output restoration`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-017e-2026-04-23`
- Requested change summary: make the generic `/start` route render the approved front-door hero/chat surface instead of the prompt-first builder, while leaving explicit `?entry=` flows untouched
- Risk level: `medium`
- Change type: `modifying`
- Required rebuild scope:
  - shared front-door hero extraction
  - generic `/start` route presentation restoration
  - rendered route verification for `/` and `/start`
- Explicitly untouched:
  - explicit `/start?entry=diy`
  - explicit `/start?entry=managed`
  - roadmap route behavior
  - workspace/project internals

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a corrective front-door route and presentation refinement
  - it does not introduce a new product capability

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the restore limited to generic `/start`
  - preserve explicit DIY and managed builder entry flows
  - verify the rendered generic `/start` surface against the target screenshot before closing
