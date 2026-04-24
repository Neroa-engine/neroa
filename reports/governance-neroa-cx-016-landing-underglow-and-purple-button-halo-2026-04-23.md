# Governance Analysis: NEROA-CX-016 Landing Underglow And Purple Button Halo

- Prompt ID: `NEROA-CX-016-LANDING-UNDERGLOW-AND-PURPLE-BUTTON-HALO`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: correct the `/ai-app-builder` chat-box underglow so it matches the approved reference more closely, remove the circular bottom blobs causing the wrong effect, and add a stronger halo around the site's purple primary buttons without changing layout or route behavior

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-016-2026-04-23`
- Requested change:
  - make the landing-page chat-box glow match the attached reference more closely
  - remove the two circular blob artifacts currently appearing below the landing-page chat box
  - do not change the landing-page background system itself
  - add a clearer glow around the purple buttons
- Desired outcome: the landing-page chat card reads with a tight premium underglow beam beneath the card rather than two circular background blobs, and purple buttons carry a visible soft-edged halo
- Source material used for analysis:
  - attached glow reference screenshot
  - current live capture of `/ai-app-builder`
  - `app/ai-app-builder/page.tsx`
  - `components/front-door/neroa-chat-card.tsx`
  - `app/globals.css`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
  - current phase ownership in `docs/architecture/phase-map-v1.md`

### Scope

- In scope now:
  - landing-page chat underglow correction
  - removal of the circular under-card blob artifacts
  - purple primary button halo enhancement
  - build verification
  - visual landing-page verification against the supplied reference
- Out of scope now:
  - layout restructuring
  - landing-page copy changes
  - background-asset replacement
  - route or workflow changes
  - logo changes

### Assumptions

- The "two circles" the user called out are the current landing underglow pseudo-elements behind the chat card rather than the full-site atmospheric background layer.
- The requested button glow applies to the existing purple primary CTA family, not to secondary or neutral buttons.
- A thin wrapper around the landing chat card is acceptable because it does not redesign the page or alter navigation behavior; it only gives the underglow its own controlled layer.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Shared front-door presentation system`
- Systems touched: `Landing page composition CSS`, `Shared CTA glow system`
- Trust-layer systems touched: `None`
- Key risk: over-correcting the glow could make the landing feel loud rather than premium, so the change must stay localized to the chat shell and purple CTA family

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-016-2026-04-23`
- Request origin: `Brand / UX correction`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `None`
- Rebuild radius: `Medium`
- Impact category: `medium`
- Roadmap revision required: `No`
- Architecture confidence: `97`
- Preliminary gate recommendation: `Approved as a localized presentation-system correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-016-2026-04-23`
- Requested change summary: replace the landing-page chat-box blob-like underglow with a tighter reference-matched under-card beam, and strengthen the visible halo around the current purple button family
- Risk level: `medium`
- Change type: `modifying`
- Required rebuild scope:
  - landing-page visual wrapper adjustment
  - landing underglow CSS replacement
  - shared purple button halo enhancement
  - build and landing-page screenshot verification
- Explicitly untouched:
  - page structure outside the landing chat visual wrapper
  - background asset source
  - copy
  - navigation
  - runtime logic

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a presentation-layer refinement on current public execution surfaces
  - it adds no new system capability and does not widen into future-scoped product work

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the change limited to landing underglow and shared purple CTA glow behavior
  - do not change the landing background asset system
  - verify the result with a fresh landing-page screenshot

## Completion Addendum

- Implemented:
  - added a dedicated landing chat shell so the underglow sits directly beneath the card
  - removed the circular landing underglow blobs from the previous landing visual layer
  - replaced the landing underglow with a tighter cyan-violet-cyan beam that reads closer to the supplied reference
  - strengthened the halo around purple primary buttons
- Verification completed:
  - `npm run build`
  - fresh landing-page screenshot review
