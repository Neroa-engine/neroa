# Governance Analysis: NEROA-CX-001 Front-Door Brand Refresh

- Prompt ID: `NEROA-CX-001`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: update the public homepage and shared front-door shell to the locked NEROA brand system without redesigning the approved homepage structure

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-001-2026-04-23`
- Requested change: bring the front-door homepage into the locked NEROA visual system with the approved logo asset, dark premium shell, restrained wave/glow motion, and a refined right-side product panel while preserving the informational homepage composition
- Why it exists: the current front door still uses the earlier light glass system and does not yet match the approved black / ice-blue / restrained-violet brand direction
- Desired outcome: homepage composition remains intact while the shell, hero, right-side product panel, supporting sections, CTA band, and footer present the locked NEROA brand faithfully
- Current context: primary runtime surface lives in [app/page.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/app/page.tsx), [app/globals.css](/C:/Users/Administrator/Documents/GitHub/neroa/app/globals.css), [components/layout/page-shells.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/layout/page-shells.tsx), [components/site-header.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/site-header.tsx), [components/site/site-nav.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/site/site-nav.tsx), [components/site/public-account-menu.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/site/public-account-menu.tsx), and [components/site/public-footer.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/site/public-footer.tsx)

### Scope

- In scope now:
  - homepage brand-system refresh
  - approved logo asset usage in front-door brand placements
  - dark front-door shell styling for homepage header and footer
  - restrained ambient wave and glow system
  - right-side homepage product panel refinement
  - responsive and reduced-motion handling for the homepage shell
- Out of scope now:
  - homepage information architecture redesign
  - nav order or route changes
  - portal logic changes
  - backend or trust-layer changes
  - broader marketing-site redesign beyond the front door

### Assumptions

- The approved informational homepage composition is the current structure in [app/page.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/app/page.tsx), so the implementation should preserve its major blocks instead of swapping to an older landing model.
- The approved logo asset is the canonical public file already referenced by [components/logo.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/logo.tsx).
- Any trust-logo treatment needed for the homepage should be implemented inside the existing informational composition without introducing a new route or a new content architecture.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Product`, `Marketing shell`, `Routing presentation`
- Trust-layer systems touched: `None`
- Key risk: a visual refresh could accidentally drift into structure changes or spill the dark theme into unrelated public pages if the shell is not scoped carefully

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-001-2026-04-23`
- Request origin: `Brand / UX implementation`
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
- Architecture confidence: `94`
- Preliminary gate recommendation: `Approved as-is`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-001-2026-04-23`
- Requested change summary: front-door visual-system refresh using locked brand rules on the existing homepage composition
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - homepage composition styling
  - homepage hero and right-panel treatment
  - front-door shell styling for header and footer on the homepage
  - reusable ambient wave/glow styling tokens
- Explicitly untouched:
  - route behavior
  - auth and billing behavior
  - protected routing
  - portal interaction logic
  - backend execution surfaces

## Phase Mapping

- Decision ID: `phase-neroa-cx-001-2026-04-23`
- Primary phase assignment: `3`
- Outcome: `Approved now`
- Rationale: the request is a local execution-surface refresh inside the public product shell and does not introduce future-phase editor/orchestration capability or trust-layer mutation

## Execution Gate

- Gate decision ID: `gate-neroa-cx-001-2026-04-23`
- Execution threshold met: `Yes`
- Critical contradiction unresolved: `No`
- Trust-layer ambiguity unresolved: `No`
- Final outcome: `Approved as-is`
- Why: the change is phase-aligned, local to the public front door, behavior-preserving, and bounded to visual/system-shell implementation rather than platform trust or future-phase product capability
