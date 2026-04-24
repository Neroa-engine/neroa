# Governance Analysis: NEROA-CX-015 Sitewide Button Purple Correction

- Prompt ID: `NEROA-CX-015-SITEWIDE-BUTTON-PURPLE-CORRECTION`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: replace the current blue-led primary button treatment across the site with the purple shown in the supplied screenshot, and verify the current homepage hero no longer contains a DIY Build CTA button to remove

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-015-2026-04-23`
- Requested change:
  - change current blue primary buttons across the site to the purple shown in the attached screenshot
  - apply the change sitewide anywhere the current button treatment is blue
  - remove the homepage DIY Build button in the text area if it is still present
- Desired outcome: shared primary call-to-action buttons read purple across public and interior surfaces, while the current homepage hero remains free of the old DIY Build CTA
- Source material used for analysis:
  - attached screenshot showing the target purple color reference
  - current homepage implementation in `app/page.tsx`
  - shared button styling in `app/globals.css`
  - architecture baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
  - current phase ownership in `docs/architecture/phase-map-v1.md`

### Scope

- In scope now:
  - global `.button-primary` and `.button-cta` color correction
  - front-door theme and front-door scope primary-button color correction
  - homepage direct blue button shadow override correction
  - correction of one-off blue action controls that sit outside the shared CTA classes
  - removal of the current homepage hero DIY Build CTA if it still renders
  - production build verification
- Out of scope now:
  - navigation label changes
  - route or workflow changes
  - non-button accent recoloring
  - logo, layout, or hero copy changes

### Assumptions

- The screenshot color reference is best matched by the existing purple family already present in the site accent system, centered around `#8f7cff` and `#a788fa`.
- "Remove the DIY Build Button in the text" refers to the current homepage hero CTA area rather than to route-navigation labels or sitewide DIY naming.
- The user request is satisfied by removing the homepage secondary hero CTA once live verification confirms that it renders as `Start DIY Build`.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Shared presentation / CTA system`
- Systems touched: `Global button CSS`, `Front-door button CSS`, `Homepage button shadow override`
- Trust-layer systems touched: `None`
- Key risk: changing the shared primary-button system affects both public and signed-in surfaces, so the update must remain stylistic and not reduce contrast or alter behavior

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-015-2026-04-23`
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
- Preliminary gate recommendation: `Approved as a shared presentation-system correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-015-2026-04-23`
- Requested change summary: shift the shared blue-led primary button system to the screenshot-matched purple treatment across the site, while confirming the homepage hero no longer includes the old DIY Build CTA
 - Requested change summary: shift the shared blue-led primary button system to the screenshot-matched purple treatment across the site, and remove the homepage hero DIY Build CTA that still rendered through shared public-action resolution
- Risk level: `medium`
- Change type: `modifying`
- Required rebuild scope:
  - global button style updates
  - front-door theme button style updates
  - homepage one-off shadow cleanup
  - one-off blue button cleanup across public help, account entry, onboarding toggles, and workspace control surfaces
  - homepage hero secondary CTA removal
  - production build and representative route verification
- Explicitly untouched:
  - route behavior
  - navigation structure
  - hero copy
  - logo treatment
  - backend/product logic

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a shared runtime presentation refinement on existing surfaces
  - it adds no new system capability and remains inside current implementation scope

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - keep the change limited to shared button styling and the homepage CTA verification
  - preserve contrast and button behavior
  - verify representative public and signed-in pages after the shared style update

## Completion Addendum

- Implemented:
  - converted the global primary CTA gradient from blue-led to screenshot-matched purple
  - converted the front-door primary CTA treatment and breathing glow to the same purple family
  - converted the front-door scope primary CTA treatment to the same purple family
  - converted the global `button-cta` treatment to the same purple family
  - replaced the homepage one-off blue shadow override with a purple one
  - converted remaining one-off blue action controls to the same purple family in public help, account menu, onboarding toggles, and workspace control panels
  - removed the homepage secondary hero CTA so `Start DIY Build` no longer renders in the main homepage hero
- Verification completed:
  - `npm run build`
  - representative route review for shared primary buttons
- Remaining verification limit:
  - none for this shared button-color correction
