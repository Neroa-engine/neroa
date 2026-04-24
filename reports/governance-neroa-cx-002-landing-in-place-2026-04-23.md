# Governance Analysis: NEROA-CX-002 Landing In Place

- Prompt ID: `NEROA-CX-002-LANDING-IN-PLACE`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: rebuild the current landing page route in place using the already-implemented NEROA front-door brand system, without changing the homepage or unrelated public routes

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-002-2026-04-23`
- Requested change: redesign the current landing page in place so it becomes a cleaner premium conversion page with left hero copy, a compact right-side premium chat/product card, restrained ambient motion, and the locked NEROA black / ice-blue / restrained-violet brand system
- Why it exists: the current landing surface still uses the older lighter informational landing template, includes more supporting content than needed, and does not yet match the simplified premium conversion direction requested after the homepage groundwork
- Desired outcome: one route is rebuilt in place as a focused landing page with a cleaner hero, fewer sections, a stronger right-side product-card treatment, and reused CX-001 brand tokens/components
- Current context: the route-specific implementation currently lives in [app/ai-app-builder/page.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/app/ai-app-builder/page.tsx) and inherits shared shell behavior from [components/layout/page-shells.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/layout/page-shells.tsx), [components/logo.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/logo.tsx), and [app/globals.css](/C:/Users/Administrator/Documents/GitHub/neroa/app/globals.css)

### Scope

- In scope now:
  - the existing `/ai-app-builder` landing route only
  - route-local layout/content simplification
  - a compact premium right-side chat/product card for that route
  - reuse of the CX-001 dark front-door shell, logo treatment, and wave/glow system
  - responsive and reduced-motion handling for this landing route
- Out of scope now:
  - homepage changes
  - shared SEO landing-template redesign across other routes
  - nav structure changes
  - route wiring changes
  - backend, auth, billing, or trust-layer behavior changes
  - additional landing routes or duplicate page creation

### Assumptions

- The "current landing page" referenced by the prompt maps to the singular public [app/ai-app-builder/page.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/app/ai-app-builder/page.tsx) route because it is the broadest standalone landing surface and changing the shared [components/marketing/seo-landing-template.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/marketing/seo-landing-template.tsx) would spill the redesign into unrelated front-door routes.
- The locked brand groundwork from CX-001 is already present and should be reused rather than re-authored.
- The approved logo asset remains the canonical file already mediated by [components/logo.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/logo.tsx).

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Marketing shell`, `Public route presentation`
- Trust-layer systems touched: `None`
- Key risk: route-specific redesign work could accidentally leak into other public landing routes if implemented through shared template changes instead of a route-local rebuild

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-002-2026-04-23`
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
- Architecture confidence: `91`
- Preliminary gate recommendation: `Approved as-is`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-002-2026-04-23`
- Requested change summary: in-place redesign of the `/ai-app-builder` landing route using the existing NEROA brand system with a cleaner conversion-first structure
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - `/ai-app-builder` route layout/content
  - route-specific premium chat/product card treatment
  - route-scoped dark landing styles in the shared CSS token layer
  - reuse of existing front-door wave/glow shell behavior
- Explicitly untouched:
  - homepage composition
  - shared landing-template behavior on other routes
  - auth, billing, and protected-route logic
  - backend execution surfaces

## Phase Mapping

- Decision ID: `phase-neroa-cx-002-2026-04-23`
- Primary phase assignment: `3`
- Outcome: `Approved now`
- Rationale: the work is a local public execution-surface redesign that stays inside current marketing/product presentation boundaries and does not introduce future-phase capability or trust-layer mutation

## Execution Gate

- Gate decision ID: `gate-neroa-cx-002-2026-04-23`
- Execution threshold met: `Yes`
- Critical contradiction unresolved: `No`
- Trust-layer ambiguity unresolved: `No`
- Final outcome: `Approved as-is`
- Why: the request is bounded to one public route, reuses approved brand groundwork, preserves routing contracts, and avoids both shared-template spillover and protected/trust-layer behavior changes
