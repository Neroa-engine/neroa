# Governance Analysis: NEROA-CX-011B Remove Last Bubble

- Prompt ID: `NEROA-CX-011B-REMOVE-LAST-BUBBLE`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: remove only the last remaining homepage bubble/section shown in the screenshot, remove the explicitly requested small hero labels, and enlarge the current shared header logo treatment by 75% without altering its style

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-011b-2026-04-23`
- Requested change: remove the final lower homepage section containing `Start with the product idea, then let Neroa carry the path forward.`, remove the small hero `Neroa` pill and `Strategy Room first` kicker after follow-up clarification, and increase the current logo size by 75% while keeping the treatment otherwise unchanged
- Why it exists: the prior cleanup left one last screenshot-matched homepage section in place, and the header logo still needs a size-only adjustment
- Desired outcome: the remaining lower section is gone, the two small hero labels are gone, the current header logo treatment is visibly larger but otherwise unchanged, and the surrounding page stays intact
- Source material used for analysis:
  - attached screenshot of the remaining lower section containing `Start with the product idea, then let Neroa carry the path forward.`
  - attached screenshot of the small hero `Neroa` pill and `Strategy Room first` kicker
  - current homepage implementation in `app/page.tsx`
  - current shared logo component in `components/logo.tsx`
  - current shared public header in `components/site-header.tsx`
  - current logo sizing rules in `app/globals.css`
  - architectural baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
- Implementation gap identified before execution:
  - the final removable section is the homepage `ConversionStrip`
  - the small hero pill and kicker are standalone elements and can be removed without changing the hero structure
  - the current homepage header uses the shared `neroa-logo-header-prominent` size path, so a size-only change can remain narrowly scoped

### Scope

- In scope now:
  - homepage `ConversionStrip` removal
  - homepage hero `Neroa` pill removal
  - homepage hero `Strategy Room first` kicker removal
  - current prominent header logo size increase
  - production build and visual verification
- Out of scope now:
  - header/nav structure changes
  - logo treatment or asset changes
  - hero copy rewrites
  - background, glow, or atmosphere changes
  - broader layout redesign

### Assumptions

- The requested logo change applies to the current shared prominent header treatment visible on the homepage screenshot.
- The user’s follow-up explicitly overrides the earlier `leave the hero section exactly as-is` rule for the small pill and kicker only.
- Closing spacing cleanly is best achieved by removing the full `ConversionStrip` wrapper rather than hiding its inner content.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Public front-door presentation`
- Systems touched: `Homepage route`, `Shared header logo sizing`, `Governance report`
- Trust-layer systems touched: `None`
- Key risk: the 75% logo increase must preserve the same treatment and avoid disturbing the current header layout, especially on mobile

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-011b-2026-04-23`
- Request origin: `Brand / UX cleanup`
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
- Architecture confidence: `96`
- Preliminary gate recommendation: `Approved as a narrow homepage cleanup plus shared header logo size adjustment`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-011b-2026-04-23`
- Requested change summary: remove the last screenshot-matched homepage section, remove the two small hero labels, and enlarge the current shared header logo without changing its treatment
- Risk level: `low`
- Change type: `removing and tuning`
- Required rebuild scope:
  - homepage JSX cleanup in `app/page.tsx`
  - shared prominent header logo size update in `app/globals.css`
  - representative visual verification for desktop and mobile
- Explicitly untouched:
  - navigation order and structure
  - logo asset and styling treatment
  - hero main copy and CTA buttons
  - background, atmosphere, glow, and theme systems
  - route behavior

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a current-state presentation cleanup and sizing correction on an existing public route and shared header treatment
  - it introduces no new system or future-phase behavior
  - it stays within the active public product-surface scope

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - remove only the targeted remaining lower section and explicitly requested hero labels
  - keep the existing logo treatment unchanged except for size
  - verify the larger logo does not break desktop or mobile rendering

## Completion Addendum

- Implemented:
  - removed the homepage `ConversionStrip` section containing `Start with the product idea, then let Neroa carry the path forward.`
  - removed the small hero `Neroa` pill and `Strategy Room first` kicker
  - increased the current shared prominent header logo height by 75% while leaving the asset and treatment unchanged
- Verification completed:
  - `npm run build` passed
  - representative homepage desktop and mobile renders were visually checked after removal and logo sizing
- Remaining verification limit:
  - none for this scoped cleanup and logo-size pass
