# Governance Analysis: NEROA-CX-010 Logo Rebuild From Branded Assets

- Prompt ID: `NEROA-CX-010-LOGO-REBUILD-FROM-BRANDED-ASSETS`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: remove the shared black-box logo treatment, keep the existing header/navigation structure intact, and rebuild shared branded logo integration directly from the official repo asset in `public/logo`

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-010-2026-04-23`
- Requested change: remove the boxed/docked logo treatment completely and use the approved logo asset directly anywhere the shared branded header/footer/logo treatment appears
- Why it exists: the current shared shells still wrap the official logo asset in an extra black dock, which makes the brand anchor look boxed rather than naturally integrated
- Desired outcome: one official logo treatment across the shared public and interior shells, with the official asset rendered sharply, proportionally, and without a synthetic dock, crop, or alternate lockup
- Source material used for analysis:
  - approved logo asset at `C:\Users\Administrator\Documents\GitHub\neroa\public\logo\neroa.png`
  - current shared header implementation in `components/site-header.tsx`
  - current shared portal/interior shell headers in `components/portal/portal-shells.tsx`
  - current Live View branded header in `app/workspace/[workspaceId]/project/[projectId]/live-view/page.tsx`
  - current footer brand placement in `components/site/public-footer.tsx`
  - current shared logo CSS in `app/globals.css`
- Implementation gap identified before execution:
  - the official asset is already wired, but the shared shells still add a separate black dock around it
  - the shared logo CSS still injects synthetic border/background/glow wrapper behavior
  - the footer brand placement uses the same logo asset but needs to stay consistent with the new unboxed shared treatment
  - the repo only contains one official logo file in `public/logo`, so the repair must use that exact asset rather than creating another derived lockup

### Scope

- In scope now:
  - shared public header logo treatment
  - shared portal/interior header logo treatment
  - shared footer logo treatment
  - shared logo CSS cleanup and integration polish
  - production build verification
- Out of scope now:
  - navigation order or structure changes
  - route behavior changes
  - new logo assets or derivative logo crops
  - non-logo visual redesign work

### Assumptions

- `public/logo/neroa.png` is the only approved official logo asset currently available in-repo and must therefore be used directly.
- The visible black-box problem is primarily caused by the shared wrapper and dock styling, not by a need for a second alternate logo style.
- A shared-shell fix is the correct execution path because the request spans public pages, landing pages, portal shells, and Live View.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Shared logo component`, `Shared public header`, `Shared portal/interior headers`, `Shared footer`, `Shared dark-shell CSS`
- Trust-layer systems touched: `Presentation only on signed-in shells; no auth, billing, or protected-route behavior changes`
- Key risk: the official asset is an opaque branded PNG, so removing the wrapper cleanly requires shell-level integration that preserves the asset presentation without inventing a second logo treatment

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-010-2026-04-23`
- Request origin: `Brand / UX correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: `4 (presentation-only awareness on signed-in branded shells)`
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `Presentation only`
- Rebuild radius: `Medium`
- Impact category: `medium`
- Roadmap revision required: `No`
- Architecture confidence: `95`
- Preliminary gate recommendation: `Approved with shared-shell logo treatment cleanup`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-010-2026-04-23`
- Requested change summary: remove the extra boxed logo dock from shared public and interior shells and rebuild the shared logo presentation directly from the official repo asset without changing navigation behavior
- Risk level: `medium`
- Change type: `modifying`
- Required rebuild scope:
  - shared logo component source cleanup
  - shared logo CSS wrapper removal
  - shared header/footer logo integration in public and interior shells
  - representative public verification
- Explicitly untouched:
  - navigation order
  - header control layout
  - route wiring
  - auth or workflow logic
  - non-logo atmosphere changes

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a current-state runtime presentation correction on existing shared shells
  - it does not add new systems or future-phase behavior
  - it keeps the work limited to a brand-integration repair inside the active product surface baseline

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - use only the official asset already present in `public/logo`
  - do not create another logo crop, mark, or alternate lockup
  - preserve header/nav structure and route behavior
  - verify the built output before claiming completion

## Completion Addendum

- Implemented:
  - removed the shared black-box dock wrapper from public and interior shell headers
  - rebuilt shared footer brand placement to use the same official unboxed logo treatment
  - standardized the shared logo source to the exact official file path in `public/logo`
  - removed synthetic dock/background/border/glow wrapper CSS from the shared logo treatment
- Verification completed:
  - `npm run build` passed
  - representative public routes were checked in a fresh production run for header/footer logo rendering
- Remaining verification limit:
  - protected interior routes still need a signed-in browser pass for final visual sign-off beyond auth redirection
