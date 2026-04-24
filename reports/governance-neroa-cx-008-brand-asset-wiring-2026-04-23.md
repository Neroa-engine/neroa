# Governance Analysis: NEROA-CX-008 Brand Asset Wiring

- Prompt ID: `NEROA-CX-008-BRAND-ASSET-WIRING`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: replace improvised logo and atmosphere treatments with the approved repo assets, then wire those assets through the shared public and interior shells with restrained motion and stronger premium glow

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-008-2026-04-23`
- Requested change: stop synthesizing the Neroa logo and wave treatment in code, use the approved `public/logo` asset as the official logo everywhere, and use the approved `public/brand` background asset as the shared full-site atmospheric base
- Why it exists: the current implementation still relies on cropped/experimental logo derivatives and CSS-generated wave systems even though the approved assets now exist in-repo
- Desired outcome: homepage, landing, public marketing pages, and the signed-in shell family all inherit the same approved background image, the same official logo asset, stronger but soft atmospheric bloom, and subtle ambient movement without redesigning structure or changing behavior
- Source material used for analysis:
  - approved brand background asset at `C:\Users\Administrator\Documents\GitHub\neroa\public\brand\brand.png`
  - approved logo asset at `C:\Users\Administrator\Documents\GitHub\neroa\public\logo\neroa.png`
  - current shared atmosphere implementation in `components/layout/neroa-atmosphere.tsx`
  - current shared logo/header implementation in `components/logo.tsx`
  - current shared public and interior shells in `components/layout/page-shells.tsx`, `components/portal/portal-shells.tsx`, and `app/workspace/[workspaceId]/project/[projectId]/live-view/page.tsx`
- Implementation gap identified before execution:
  - the shared atmosphere still depends on CSS-generated wave and glow layers instead of the approved background asset
  - the header still uses experimental/cropped header-mark presentation instead of the official approved logo asset
  - homepage-specific hero layers still reference generated logo-wave imagery rather than the approved atmospheric background
  - the current glow system is materially weaker than requested and needs to be intensified while staying soft-edged and premium

### Scope

- In scope now:
  - shared approved logo wiring across public and interior branded surfaces
  - shared approved background wiring across public and interior branded shells
  - glow and ambient motion retuning needed to support the approved asset across the site
  - reduced-motion preservation
  - production build and representative browser verification
- Out of scope now:
  - information architecture changes
  - route behavior changes
  - auth, billing, entitlement, or workflow logic changes
  - duplicate routes or alternate visual concepts

### Assumptions

- `public\brand\brand.png` is the approved atmospheric base the user wants site-wide.
- `public\logo\neroa.png` is the approved official logo and should replace experimental header lockups and synthetic wordmarks wherever branded logo rendering is needed.
- Shared-shell asset wiring is the correct implementation path because the required scope spans both public and interior surfaces.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Shared logo`, `Shared public shell`, `Shared portal/workspace shell`, `Homepage hero atmosphere`, `Landing page atmosphere`, `Shared visual tokens`
- Trust-layer systems touched: `Presentation only on signed-in shells; no auth, billing, or protected-route behavior changes`
- Key risk: replacing the generated wave system with the approved background asset could reduce readability or create scaling issues if the asset is not layered and animated carefully across long pages and mobile layouts

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-008-2026-04-23`
- Request origin: `Brand / UX correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: `4 (presentation-only awareness on signed-in branded shells)`
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `Presentation only`
- Rebuild radius: `High`
- Impact category: `high`
- Roadmap revision required: `No`
- Architecture confidence: `92`
- Preliminary gate recommendation: `Approved with shared-shell asset wiring`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-008-2026-04-23`
- Requested change summary: wire the approved background and logo assets into the shared public and interior shells, retire synthetic/cropped treatments, and strengthen the ambient bloom around the new asset-driven atmosphere
- Risk level: `high`
- Change type: `modifying`
- Required rebuild scope:
  - shared logo component and header/footer brand rendering
  - shared atmosphere component used by public and interior shells
  - shared theme CSS for asset layering, glow intensity, motion, and reduced-motion fallbacks
  - homepage and landing page hero-specific atmospheric overlays that still depend on generated wave assets
  - representative public verification and accessible interior-shell verification
- Explicitly untouched:
  - route wiring
  - auth or billing logic
  - workspace workflow logic
  - page content hierarchy

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a runtime presentation correction on existing public and signed-in execution surfaces
  - it does not introduce future-scope systems or alter product behavior
  - it is a shared visual-system repair aligned to the approved current execution baseline

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - use the approved repo assets rather than generating new wave or logo derivatives
  - route the change through shared components first so public and interior shells remain consistent
  - preserve readability, responsive behavior, and reduced-motion support
  - verify the built output before claiming completion

## Completion Addendum

- Implemented:
  - shared logo rendering now uses only `public/logo/neroa.png`
  - shared atmosphere rendering now uses `public/brand/brand.png` as the full-site ambient base
  - experimental header lockup assets were removed from `public/logo`
  - homepage and landing hero overlays now derive emphasis from the approved background asset or glow layers rather than generated wave files
  - shared CTA, panel-edge, and ambient bloom intensity were increased while keeping soft edges
- Verification completed:
  - `npm run build` passed
  - fresh production screenshots were captured for `/`, `/ai-app-builder`, `/pricing`, `/auth`, and mobile `/`
  - protected route requests for `/projects`, `/billing`, and `/workspace/demo/command-center` resolved into the branded auth shell without a live signed-in session, confirming the shared public asset wiring is active on those entry surfaces
- Remaining verification limit:
  - a final signed-in browser pass is still needed to visually inspect the interior room shells after authentication because protected routes cannot be rendered past auth in this environment
