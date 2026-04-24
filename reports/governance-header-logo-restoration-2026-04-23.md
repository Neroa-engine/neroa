# Governance Analysis: Header Logo Restoration

- Date: 2026-04-23
- Prepared by: Codex
- Request: Restore the prior public header navigation arrangement and apply only a narrow logo treatment adjustment.
- Scope: Public marketing header only.

## Extraction Snapshot

- Snapshot ID: `ex-header-logo-2026-04-23`
- Request summary: The public header should keep its original nav alignment and order while the logo is unboxed, pulled farther left, and allowed to sit directly in the navigation bar.
- Why it exists: A recent logo treatment change created the impression of a separate boxed logo area and altered the perceived header rhythm.
- Desired outcome: Preserve the prior navigation arrangement while making the brand mark feel like the natural left anchor.
- Current context: The affected implementation lives in [components/site-header.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/site-header.tsx) and [components/logo.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/logo.tsx).

### Branch Classification

- Primary branch: `SaaS / Workflow Platform`
- Secondary branches: none
- Overlays: none required
- Branch confidence: `0.95`
- Branch stability: `Stable`
- Branch shift suspected: `No`

### Product Truth

- Primary users: public site visitors and signed-in customers using the marketing shell
- Primary admins / operators: internal product operators maintaining the public front door
- Core workflow: land on the public site, read the existing nav in its established order, use the same controls in the same positions, and recognize the brand from the left anchor without a header redesign
- Product type: public marketing and entry surface
- Brand direction: preserve the premium floating-nav shell while removing extra logo boxing
- Core success criteria:
  - Home, Open Strategy Room, account/admin affordances, and nav controls stay in their prior positions.
  - The logo no longer reads as boxed, wrapped, or carded.
  - The logo feels naturally left-anchored.
  - No header restructuring occurs beyond logo treatment.

### MVP Boundary

- In scope now:
  - Restore prior header/nav positioning
  - Adjust logo wrapper and placement treatment
  - Slight logo presence tuning if needed after unboxing
- Out of scope now:
  - Reordering nav items
  - Moving Open Strategy Room or account/admin controls
  - Rebalancing nav clusters
  - Header redesign
  - Routing/auth/billing/protected-access changes

### Systems, Constraints, and Risks

- Systems touched: `Product`, `Routing`
- Trust-layer systems touched: `None`
- Constraints:
  - Must not redesign or reorder the header/navigation layout
  - Must preserve current nav cluster structure
- Known risks:
  - Over-correcting the logo footprint could still disturb the header rhythm on large screens
  - Responsive wrapping could regress if the brand anchor footprint changes too aggressively

### Assumptions

| Assumption | Why Inferred | Confidence | Confirmation Required |
| --- | --- | --- | --- |
| The regression is isolated to public header presentation and does not require trust-layer changes. | The user explicitly limited scope to logo treatment and preserving existing nav positioning. | 0.95 | No |

### Unresolved Questions

- None blocking execution

### Readiness

- Architecture confidence estimate: `93`
- Roadmap readiness: `Ready`
- Execution readiness: extraction alone does not authorize execution; downstream governance steps required

## Delta-Analyzer Worksheet

- Worksheet ID: `delta-header-logo-2026-04-23`
- Linked extraction snapshot: `ex-header-logo-2026-04-23`
- Request origin: `Bug / regression`
- Requested change: restore the prior header/nav arrangement and adjust only the logo treatment
- Current approved phase: `3`
- Current branch: `SaaS / Workflow Platform`
- Current roadmap assumption: Phase 3 owns approved product-surface execution, including narrow presentation fixes that do not alter trust or future-phase capabilities.
- Current owning system: `Product`

### Phase Impact

- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Does the request stay inside the current phase: `Yes`
- Sequencing broken if inserted now: `No`

### Systems and Dependencies

- Affected systems: `Product`, `Routing`
- Dependencies touched: public header layout, logo rendering, navigation bar spacing
- Dependency direction crossed: `No`
- Trust-layer impact: `None`

### Assumptions and Contradictions

- Assumptions affected: the public header can absorb the change locally
- Existing assumptions invalidated: none
- Contradiction risk: `Minor`
- Contradictions introduced or worsened: none

### Rebuild Radius and Risk

- Rebuild radius: `Local`
- Regression exposure: public header spacing and responsive wrap behavior
- Architecture confidence result: `93`
- Confidence threshold met for execution eligibility: `Yes`

### Analyzer Classification

- Impact category: `local`
- Roadmap revision required: `No`
- Preliminary execution status: `Allowed to proceed to Rebuild Impact Report and gate review`
- Recommended gate outcome: `Approved as-is`

## Rebuild Impact Report

- Report ID: `impact-header-logo-2026-04-23`
- Linked Delta-Analyzer worksheet: `delta-header-logo-2026-04-23`
- Linked extraction snapshot: `ex-header-logo-2026-04-23`

### Requested Change

- Summary: restore prior nav positioning and unbox the logo without changing header structure
- Trigger: user-reported regression in logo treatment
- Why now: the unwanted structure change is visible in the public header

### Impact Summary

- Primary phase: `3`
- Secondary phases: none
- Future phases touched: none
- Owning systems: `Product`
- Sensitive systems touched: none
- Dependency edges crossed: none
- Dependency direction concerns: none
- Impact category: `local`
- Risk level: `low`
- Change type: `modifying`
- Roadmap revision required: `no`

### Execution Status

- Outcome: `Approved as-is`

### What Must Be Rebuilt

- Required rebuild scope:
  - logo rendering in the public header
  - brand anchor spacing/placement in the header
- Why rebuild is required:
  - the regression is visual and localized to the header brand treatment

### What Can Remain Untouched

- Explicitly untouched systems:
  - nav order
  - nav cluster balance
  - CTA placement
  - account/admin control placement
  - auth, billing, protected routing, and backend governance
- Why they should remain untouched:
  - the request explicitly forbids broader structure changes

### Regression Risk

- Known regression exposure: responsive nav wrapping and large-screen brand spacing
- Highest-risk dependency: header spacing in the floating-nav shell
- Mitigation note: make the patch in the logo treatment only and verify compile/build after the change

## Phase Mapping Decision

- Decision ID: `phase-header-logo-2026-04-23`
- Linked Rebuild Impact Report: `impact-header-logo-2026-04-23`
- Request summary: public-header logo restoration without nav redesign
- Current workstream: public product shell / header presentation
- Owning system: `Product`
- Current phase candidate: `3`
- Future phase candidate: none
- Secondary phases touched: none

### Decision

- Primary phase assignment: `3`
- Secondary phase assignments: none
- Outcome: `Approved now`
- Why:
  - this is a narrow execution-surface presentation repair
  - it stays inside current product surface ownership
  - it does not introduce future-phase editor behavior or trust-layer changes

## Execution Gate Decision

- Gate decision ID: `gate-header-logo-2026-04-23`
- Linked Delta-Analyzer worksheet: `delta-header-logo-2026-04-23`
- Linked Rebuild Impact Report: `impact-header-logo-2026-04-23`
- Linked phase mapping decision: `phase-header-logo-2026-04-23`

### Confidence Threshold Check

- Architecture confidence result: `93`
- Execution eligibility threshold met (`85+` and critical conditions satisfied): `Yes`
- Critical contradiction unresolved: `No`
- Trust-layer ambiguity unresolved: `No`

### Preconditions

- Extraction sufficiency: satisfied
- Branch classification stable: satisfied
- Delta-Analyzer complete: satisfied
- Rebuild Impact Report complete: satisfied
- Phase mapping complete: satisfied
- Roadmap revision complete if required: not required

### Final Outcome

- `Approved as-is`

### Rationale

- The request is an in-phase Phase 3 presentation fix with local impact only.
- The owning system is clear, trust-layer boundaries remain untouched, and no roadmap revision is needed.
- Execution should proceed as a minimal patch limited to logo wrapper/placement treatment while preserving the original header/nav arrangement.
