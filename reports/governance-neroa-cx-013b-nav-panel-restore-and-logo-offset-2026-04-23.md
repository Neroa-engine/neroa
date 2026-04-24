# Governance Analysis: NEROA-CX-013B Nav Panel Restore And Logo Offset

- Prompt ID: `NEROA-CX-013B-NAV-PANEL-RESTORE-AND-LOGO-OFFSET`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: keep the current larger shared header logo size, restore the nav panel footprint, and move the logo to roughly `2in` from the left screen edge on desktop without changing the logo asset, colors, glow, or route behavior

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-013b-nav-panel-restore-2026-04-23`
- Requested change:
  - keep the current larger logo size
  - restore the nav panel size back
  - keep the logo outside the panel
  - move the logo roughly `2in` from the left edge on desktop
- Desired outcome: the shared public header keeps the current larger approved logo, the nav panel regains its prior footprint, and the logo is visually offset from the left edge while remaining outside the panel

### Scope

- In scope now:
  - shared `SiteHeader` layout-only CSS correction
  - shared `SiteHeader` logo desktop offset correction
  - rendered homepage verification
- Out of scope now:
  - asset changes
  - nav item remapping
  - footer changes
  - route changes
  - color/glow changes

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-013b-nav-panel-restore-2026-04-23`
- Request origin: `Visual correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `None`
- Rebuild radius: `Low`
- Impact category: `low`
- Roadmap revision required: `No`
- Architecture confidence: `97`
- Preliminary gate recommendation: `Approved as a scoped shared-header layout correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-013b-nav-panel-restore-2026-04-23`
- Requested change summary: remove the large logo from nav-panel width calculations, keep the current visual logo size, restore panel footprint, and apply a desktop `2in`-style left offset
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - shared header CSS adjustment
  - rendered desktop/mobile verification
- Explicitly untouched:
  - logo asset
  - header actions and routing
  - footer treatment

## Execution Gate

- Phase map: `Phase 3`
- Gate result: `Approved`
- Execution note: keep the change isolated to shared header layout behavior only
