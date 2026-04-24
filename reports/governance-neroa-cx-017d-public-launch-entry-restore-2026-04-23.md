# Governance Analysis: NEROA-CX-017D Public Launch Entry Restore

- Prompt ID: `NEROA-CX-017D-PUBLIC-LAUNCH-ENTRY-RESTORE`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: restore the public `Open Strategy Room` entry path so the front-door CTA returns to the roadmap flow instead of the prompt-first `/start` surface

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-017d-2026-04-23`
- Requested change:
  - compare the screenshot showing the undesired prompt/start surface with the screenshot showing the desired homepage/front-door look
  - revert the front-door entry behavior so the site matches the prior experience more closely
  - make sure the fix is actually implemented and verified
- Desired outcome: homepage/front-door strategy-room CTAs no longer drop into the prompt-first `/start` page unexpectedly and instead follow the earlier roadmap entry behavior
- Source material used for analysis:
  - user-supplied screenshot showing the prompt/start surface
  - user-supplied screenshot showing the desired homepage/front-door surface
  - current `lib/data/public-launch.ts`
  - current `components/site-header.tsx`
  - promoted earlier snapshot at `.tmp-cx126-fix/lib/data/public-launch.ts`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
  - current phase ownership in `docs/architecture/phase-map-v1.md`

### Scope

- In scope now:
  - restore the public launch entry mapping for `Open Strategy Room`
  - preserve the DIY and managed start paths
  - verify the resolved route behavior
- Out of scope now:
  - redesigning the start flow
  - removing the `/start` route
  - changing auth logic or entitlement rules

### Assumptions

- The prompt/start screenshot is undesirable in this context because it is being reached from a front-door Strategy Room entry path that used to resolve differently.
- Restoring the strategy-room CTA mapping is a legitimate corrective rollback rather than a new feature decision.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Front-door launch routing`
- Systems touched: `Public launch route resolution`, `Shared header CTA treatment`
- Trust-layer systems touched: `Protected-route entry behavior` (indirectly via auth redirect)
- Key risk: changing the entry mapping too broadly could alter unrelated launch CTAs; the rollback must remain specific to Strategy Room entry semantics

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-017d-2026-04-23`
- Request origin: `Brand / UX corrective rollback`
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
- Preliminary gate recommendation: `Approved as a targeted launch-entry rollback`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-017d-2026-04-23`
- Requested change summary: restore `Open Strategy Room` to the roadmap entry flow while leaving the dedicated DIY and managed start flows intact
- Risk level: `medium`
- Change type: `modifying`
- Required rebuild scope:
  - public launch route resolution update
  - header CTA styling condition update
  - route-resolution verification
- Explicitly untouched:
  - `/start` implementation
  - workspace/project internals
  - billing/auth internals

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a corrective refinement of an existing public entry path
  - it does not add a new product capability

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the rollback limited to Strategy Room entry semantics
  - preserve DIY and managed flows
  - verify the actual resolved href behavior after the patch

