# Governance Analysis: NEROA-CX-017B Homepage Screenshot Restore

- Prompt ID: `NEROA-CX-017B-HOMEPAGE-SCREENSHOT-RESTORE`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: restore the homepage composition to the user-supplied screenshot state after a prior glow correction drifted the page away from the approved layout

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-017b-2026-04-23`
- Requested change:
  - fix the homepage back to the supplied screenshot state
  - keep the homepage hero composition intact
  - restore the missing second CTA
  - reduce the oversized homepage chat card back toward the screenshot scale
  - leave the rest of the site unchanged
- Desired outcome: the homepage again matches the screenshot composition, with the right-side chat card, the two hero CTAs, and the centered five-chip row preserved
- Source material used for analysis:
  - user-supplied screenshot showing `Home` active in the nav
  - current `app/page.tsx`
  - current `app/globals.css`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
  - current phase ownership in `docs/architecture/phase-map-v1.md`

### Scope

- In scope now:
  - homepage-only hero CTA restoration
  - homepage-only chat-card sizing rollback
  - build verification
  - homepage screenshot verification
- Out of scope now:
  - landing-page layout changes
  - sitewide button redesign
  - copy rewrites outside the restored homepage CTA row
  - routing or auth logic changes

### Assumptions

- The screenshot is the current source of truth for this corrective pass because it reflects the desired pre-drift homepage state.
- The user’s current request overrides the earlier removal of the homepage DIY hero CTA.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Shared front-door presentation system`
- Systems touched: `Homepage hero markup`, `Homepage hero sizing CSS`
- Trust-layer systems touched: `None`
- Key risk: changing more than the homepage correction set would reintroduce the same drift the user is calling out

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-017b-2026-04-23`
- Request origin: `Brand / UX corrective rollback`
- Current approved phase: `3`
- Primary phase touched: `3`
- Secondary phases touched: none
- Future phases touched: none
- Request stays in current phase: `Yes`
- Dependency direction crossed: `No`
- Trust-layer impact: `None`
- Rebuild radius: `Low`
- Impact category: `low`
- Roadmap revision required: `No`
- Architecture confidence: `98`
- Preliminary gate recommendation: `Approved as a localized homepage corrective rollback`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-017b-2026-04-23`
- Requested change summary: restore the homepage to the supplied screenshot composition by putting back the second hero CTA and reducing the oversized chat-card footprint
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - homepage hero CTA row restoration
  - homepage chat-card size rollback
  - build and homepage render verification
- Explicitly untouched:
  - landing page
  - shared header structure
  - background system
  - footer routing
  - auth and public-launch logic

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a corrective UI refinement on an existing public surface
  - it introduces no new system capability

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the correction homepage-only
  - match the supplied screenshot state rather than inventing a new layout
  - verify with a fresh homepage render and build

