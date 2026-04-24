# Governance Analysis: NEROA-CX-003 Public Pages Brand Rollout

- Prompt ID: `NEROA-CX-003-PUBLIC-PAGES-BRAND-ROLLOUT`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: apply the locked NEROA front-door brand system across the remaining public-facing pages that use the shared public marketing shell, while preserving page purpose, route wiring, and the already-approved homepage treatment

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-003-2026-04-23`
- Requested change: propagate the existing NEROA dark premium shell, ice-blue / restrained-violet accent system, approved logo treatment, and restrained ambient wave/glow behavior across the rest of the public-facing site instead of leaving the homepage as the only branded surface
- Why it exists: the homepage/front door now reflects the approved NEROA visual system, but other public pages still present the older light marketing shell and therefore break brand continuity
- Desired outcome: public pricing, explainers, use cases, blog, contact/support, and other marketing-facing routes inherit the approved front-door shell consistently without duplicating routes or redesigning each page’s information architecture
- Current context: the shared public shell and brand system currently live in [components/layout/page-shells.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/layout/page-shells.tsx), [app/globals.css](/C:/Users/Administrator/Documents/GitHub/neroa/app/globals.css), [components/logo.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/logo.tsx), [components/site-header.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/site-header.tsx), and [components/site/public-footer.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/site/public-footer.tsx), while many public routes still render through [components/marketing/public-page-sections.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/marketing/public-page-sections.tsx), [components/marketing/seo-landing-template.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/marketing/seo-landing-template.tsx), [components/marketing/blog-article-template.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/marketing/blog-article-template.tsx), [components/marketing/use-case-template.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/marketing/use-case-template.tsx), [components/marketing/use-case-focus-template.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/marketing/use-case-focus-template.tsx), [components/pricing/public-pricing-content.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/pricing/public-pricing-content.tsx), [components/pricing/managed-pricing-content.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/pricing/managed-pricing-content.tsx), and [components/support/public-contact-form.tsx](/C:/Users/Administrator/Documents/GitHub/neroa/components/support/public-contact-form.tsx)

### Scope

- In scope now:
  - shared public-shell rollout of the locked NEROA brand system
  - public marketing routes using `MarketingInfoShell`
  - reusable marketing/pricing/blog/contact/use-case templates and component surfaces
  - responsive and reduced-motion consistency across the public shell
  - preservation of the already-approved homepage/front-door treatment
- Out of scope now:
  - homepage structural redesign
  - workspace/project interiors
  - dashboard or private execution surfaces
  - route creation, deletion, or duplication
  - backend, auth logic, billing logic, entitlement logic, or protected-routing changes
  - private platform trust behavior

### Assumptions

- The source of truth for the public visual system is the existing CX-001 homepage/front-door implementation, not a new reinterpretation of the provided brand board.
- The routes that should inherit this rollout are the public-facing pages already using the shared marketing shell or shared marketing templates.
- If public account-entry pages inherit the public shell during this rollout, they may receive presentation-only updates, but no auth, billing, routing, or trust behavior may change.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Marketing shell`, `Public route presentation`, `Public account-entry presentation`
- Trust-layer systems touched: `Presentation only on public account-entry surfaces; no auth/billing logic`
- Key risk: a shared-shell rollout could either miss light-era utility panels embedded in older templates or unintentionally spill into private interiors if the theme boundary is not kept strictly on the public marketing shell

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-003-2026-04-23`
- Request origin: `Brand / UX implementation`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: `4 (presentation-only boundary awareness, no trust logic mutation)`
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `Presentation only`
- Rebuild radius: `Medium`
- Impact category: `medium`
- Roadmap revision required: `No`
- Architecture confidence: `90`
- Preliminary gate recommendation: `Approved as-is`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-003-2026-04-23`
- Requested change summary: roll the locked NEROA front-door brand system across the remaining public-facing pages by updating the shared public shell and the reusable public marketing components that still present the old light treatment
- Risk level: `medium`
- Change type: `modifying`
- Required rebuild scope:
  - shared `MarketingInfoShell` theme behavior
  - reusable public marketing templates and content components
  - reusable public form/input and card surfaces inside the front-door theme
  - representative public route verification across desktop/mobile/reduced-motion
- Explicitly untouched:
  - homepage content architecture
  - workspace/project interiors
  - dashboard/lane shells
  - route behavior and link targets
  - auth logic, billing logic, protected routing, or backend execution surfaces

## Phase Mapping

- Decision ID: `phase-neroa-cx-003-2026-04-23`
- Primary phase assignment: `3`
- Outcome: `Approved now`
- Rationale: the request is a shared public execution-surface branding rollout that preserves route behavior and platform trust behavior while extending an already-approved visual system across the remaining public shell

## Execution Gate

- Gate decision ID: `gate-neroa-cx-003-2026-04-23`
- Execution threshold met: `Yes`
- Critical contradiction unresolved: `No`
- Trust-layer ambiguity unresolved: `No`
- Final outcome: `Approved as-is`
- Why: the work is bounded to public-shell presentation, keeps the homepage treatment as source of truth, does not introduce new routes or architecture, and stays out of private execution surfaces and trust-layer behavior changes
