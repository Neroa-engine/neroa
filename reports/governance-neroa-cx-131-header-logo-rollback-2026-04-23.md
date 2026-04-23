# Governance Analysis: NEROA-CX-131 Header Rollback And Logo Unboxing

- Prompt ID: `NEROA-CX-131`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: restore the prior working public header layout footprint and apply only a logo unboxing/alignment fix

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-131-2026-04-23`
- Requested change: restore the previous working header/nav layout order and alignment, then remove the logo wrapper treatment and left-anchor the approved logo asset more naturally
- Why it exists: the prior header change altered navigation layout incorrectly and still did not actually unbox or reposition the logo
- Desired outcome: nav groups return to the prior working arrangement while the logo sits directly in the header bar without a boxed wrapper
- Current context: the affected implementation is limited to [components/site-header.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/site-header.tsx) and [components/logo.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/logo.tsx)

### Scope

- In scope now:
  - restore prior header layout footprint
  - remove decorative logo wrapper/container treatment
  - reduce logo spacing constraints
  - left-anchor the approved logo asset
- Out of scope now:
  - header redesign
  - nav reordering
  - route behavior changes
  - portal logic changes
  - broader front-door visual changes

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Product`, `Routing`
- Trust-layer systems touched: `None`
- Key risk: a logo alignment change could still shift the perceived nav rhythm if the brand anchor footprint grows too much

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-131-2026-04-23`
- Request origin: `Bug / regression`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `None`
- Rebuild radius: `Local`
- Impact category: `local`
- Roadmap revision required: `No`
- Architecture confidence: `95`
- Preliminary gate recommendation: `Approved as-is`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-131-2026-04-23`
- Requested change summary: narrow header rollback and logo-only fix
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - public header brand anchor markup
  - logo asset presentation wrapper
- Explicitly untouched:
  - nav item order
  - nav group structure
  - CTA routing behavior
  - portal logic
  - auth, billing, and protected routing

## Phase Mapping

- Decision ID: `phase-neroa-cx-131-2026-04-23`
- Primary phase assignment: `3`
- Outcome: `Approved now`
- Rationale: this is a local public product-surface regression fix that does not introduce future-phase capability or trust-layer ambiguity

## Execution Gate

- Gate decision ID: `gate-neroa-cx-131-2026-04-23`
- Execution threshold met: `Yes`
- Critical contradiction unresolved: `No`
- Trust-layer ambiguity unresolved: `No`
- Final outcome: `Approved as-is`
- Why: the rollback/fix is in-phase, local, behavior-preserving, and constrained to the existing public header implementation
