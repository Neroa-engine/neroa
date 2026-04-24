# Governance Analysis: NEROA-CX-013 Logo Size And Position

- Prompt ID: `NEROA-CX-013-LOGO-SIZE-AND-POSITION`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: double the current shared public header logo size and move it farther left in the header without changing the logo asset, header/nav structure, colors, glow, or route behavior

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-013-logo-size-position-2026-04-23`
- Requested change:
  - double the current header logo size
  - move the logo farther left in the header
  - keep the current asset and treatment
  - keep the current header/nav structure
- Desired outcome: the shared public header keeps the same layout and behavior, but the logo renders at 2x its current header size and sits visibly farther left on desktop while remaining clean on tablet/mobile

### Scope

- In scope now:
  - shared public `SiteHeader` logo sizing
  - shared public `SiteHeader` horizontal logo offset
  - rendered homepage verification
- Out of scope now:
  - nav item order/alignment changes
  - footer changes
  - route changes
  - color/glow changes
  - logo asset or treatment changes

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-013-logo-size-position-2026-04-23`
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
- Preliminary gate recommendation: `Approved as a scoped shared-header presentation correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-013-logo-size-position-2026-04-23`
- Requested change summary: add shared `SiteHeader`-only logo size overrides and a leftward desktop offset while keeping the existing approved asset and header structure
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - `Logo` class passthrough support
  - shared `SiteHeader` header-only class wiring
  - header CSS overrides
  - rendered verification
- Explicitly untouched:
  - header nav mapping
  - CTA behavior
  - footer logo presentation
  - portal routing/auth logic

## Execution Gate

- Phase map: `Phase 3`
- Gate result: `Approved`
- Execution note: keep the change isolated to `SiteHeader` so footer and non-header logo surfaces are not restyled by accident
