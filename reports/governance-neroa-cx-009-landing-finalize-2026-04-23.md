# Governance Analysis: NEROA-CX-009 Landing Finalize

- Prompt ID: `NEROA-CX-009-LANDING-FINALIZE`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: finalize the current `/ai-app-builder` landing page in place using the approved background asset and the uploaded visual proof, while keeping the existing landing concept and shell structure intact

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-009-2026-04-23`
- Requested change: refine the current landing page with exact approved hero text, move the main conversation CTA inside the chat surface, increase the existing official logo size by 50 percent for this landing page, strengthen the visible atmospheric background, and replace the current lower landing stack with a bottom section based on the uploaded footer proof
- Why it exists: the landing page concept is already close, but the hero copy is not the approved copy, the main conversation action is not yet inside the chat surface, the official logo needs a larger landing treatment, and the bottom of the page should reflect the provided lower-section reference more directly
- Desired outcome: one cleaner premium landing page that preserves the existing left-copy/right-chat concept, uses the approved background asset visibly across the page, enlarges the current official logo on this route without changing the asset, and closes with a custom lower panel derived from the provided footer screenshot
- Source material used for analysis:
  - approved atmospheric background asset at `C:\Users\Administrator\Documents\GitHub\neroa\public\brand\brand.png`
  - approved official logo asset at `C:\Users\Administrator\Documents\GitHub\neroa\public\logo\neroa.png`
  - uploaded hero proof showing the exact approved headline and support copy treatment
  - uploaded lower-section proof showing the desired bottom panel treatment
  - current landing route implementation in `app/ai-app-builder/page.tsx`
  - current landing styles in `app/globals.css`
  - current shared front-door shell in `components/layout/page-shells.tsx`
- Implementation gap identified before execution:
  - the landing hero headline and support paragraph do not match the approved exact text
  - the chat card is not yet carrying the primary conversation action inside the surface
  - the approved background asset is present site-wide but not emphasized enough on the landing page itself
  - the current landing lower stack does not yet reflect the uploaded footer treatment closely enough
  - the current official logo needs a larger landing-page-only presentation without swapping the asset

### Scope

- In scope now:
  - `/ai-app-builder` content refinement in place
  - landing-only chat surface refinement
  - landing-only custom lower panel based on the uploaded proof
  - landing-only larger official logo treatment through shared shell props
  - shared shell support needed to hide the generic footer on this route and pass a landing-only header logo scale
  - production build and browser verification
- Out of scope now:
  - homepage redesign
  - new routes
  - shared footer redesign for the rest of the public site
  - auth, billing, or workflow logic changes
  - alternate logo assets or logo redesign

### Assumptions

- The uploaded hero proof is the authoritative copy and atmospheric reference for the landing page refinement.
- The uploaded lower screenshot is intended to replace the current generic landing lower stack with a more integrated branded bottom panel on this route.
- The requested 50 percent logo increase applies to the current official logo asset presentation on this landing page, not to a logo redesign or asset swap.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Product`
- Systems touched: `Landing page`, `Shared marketing shell props`, `Shared logo component sizing`, `Landing-specific front-door styles`
- Trust-layer systems touched: `Presentation only`
- Key risk: landing-only footer replacement and larger header brand treatment could accidentally spill into the wider public shell if not isolated via route-level props and landing-specific classes

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-009-2026-04-23`
- Request origin: `Brand / UX refinement`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `Presentation only`
- Rebuild radius: `Medium`
- Impact category: `medium`
- Roadmap revision required: `No`
- Architecture confidence: `95`
- Preliminary gate recommendation: `Approved with landing-only shared-shell extensions`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-009-2026-04-23`
- Requested change summary: finalize the current landing page in place by replacing the hero copy, moving the conversation CTA into the chat card, making the approved background asset more visibly present on the page, enlarging the existing official logo presentation for this route, and replacing the current lower support/CTA stack with a bottom section based on the uploaded footer proof
- Risk level: `medium`
- Change type: `modifying`
- Required rebuild scope:
  - landing route markup and content
  - landing-specific CSS
  - shared marketing shell props for footer visibility and header logo scale
  - shared logo sizing support
  - production build and browser verification
- Explicitly untouched:
  - page route wiring
  - homepage layout
  - shared public footer on non-landing routes
  - product workflows

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a current-state runtime presentation refinement on an existing public landing page
  - it does not introduce future-scope systems or alter product logic
  - the work remains inside the approved current visual-system rollout

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the current landing route and concept in place
  - use the existing official logo and background assets
  - keep navigation structure intact
  - verify the final rendered output before claiming completion

## Completion Addendum

- Implemented:
  - replaced the landing hero headline and support paragraph with the exact approved text
  - moved the main conversation action into the chat card
  - intensified landing-page visibility of the approved `brand.png` background asset
  - introduced a landing-only 50 percent larger official logo treatment through shared shell props and logo sizing classes
  - replaced the prior landing support/CTA lower stack with an integrated bottom panel derived from the uploaded footer proof
  - suppressed the generic shared footer on this route only so the new bottom section closes the page cleanly
- Verification completed:
  - `npm run build` passed
  - fresh production browser verification was run on the landing page for desktop and mobile
- Remaining verification limit:
  - no implementation blocker remains; only optional final art-direction sign-off remains if desired
