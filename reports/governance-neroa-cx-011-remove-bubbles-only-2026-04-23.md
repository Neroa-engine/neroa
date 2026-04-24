# Governance Analysis: NEROA-CX-011 Remove Bubbles Only

- Prompt ID: `NEROA-CX-011-REMOVE-BUBBLES-ONLY`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: remove only the screenshot-matched homepage bubble/data sections and close the spacing cleanly without redesigning the rest of the page

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-011-2026-04-23`
- Requested change: remove the attached screenshot content blocks and their internal data only, leaving the rest of the page exactly the same
- Why it exists: the homepage still contains large informational data/bubble sections that the user explicitly wants stripped out in a remove-only cleanup pass
- Desired outcome: the screenshot-matched content groups are gone, the surrounding page stays visually intact, and no empty wrappers or ghost spacing remain
- Source material used for analysis:
  - attached screenshot showing `One guided thread from first idea to approved next move.` and the four numbered cards
  - attached screenshot showing `Neroa should feel like a product platform, not a stack of tools.` and the three lower cards
  - attached screenshot showing `One guided thread across roadmap, preview, and approvals.` and the surrounding floating bubble/data cards
  - current homepage implementation in `app/page.tsx`
  - current homepage/front-door styling in `app/globals.css`
  - architectural baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
- Implementation gap identified before execution:
  - the screenshot-matched groups live on the homepage route in `app/page.tsx`
  - the requested removal is narrower than a redesign and should not alter the hero copy, CTA strip, background system, header, or footer
  - spacing closure must happen by removing the exact wrappers rather than restyling adjacent sections

### Scope

- In scope now:
  - homepage bubble/data board removal
  - homepage guided-strip removal
  - homepage lower three-card informational section removal
  - spacing cleanup caused by those removals
  - production build and visual verification
- Out of scope now:
  - hero copy changes
  - header/nav/logo changes
  - CTA structure changes
  - landing-route redesign
  - broader brand-system changes

### Assumptions

- The screenshots are the authoritative match signal, even though the user called this the landing page and the matched content currently lives on the homepage route.
- The `ConversionStrip` block stays in place because the user explicitly said to keep CTA structure unchanged and did not list that section in the numbered removals.
- A remove-only pass should favor deleting the exact JSX wrappers over introducing broader layout or styling rewrites.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Public front-door presentation`
- Systems touched: `Homepage route content`, `Governance report`
- Trust-layer systems touched: `None`
- Key risk: removing the right-side hero data board must not accidentally collapse the homepage into a new layout concept or disturb the preserved CTA section

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-011-2026-04-23`
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
- Preliminary gate recommendation: `Approved as a scoped remove-only homepage cleanup`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-011-2026-04-23`
- Requested change summary: remove the screenshot-matched homepage bubble/data sections while preserving the rest of the homepage structure, styling, and CTA flow
- Risk level: `low`
- Change type: `removing`
- Required rebuild scope:
  - homepage JSX cleanup in `app/page.tsx`
  - remove now-unused local content arrays/imports
  - representative visual verification for desktop and mobile
- Explicitly untouched:
  - header/nav structure
  - hero copy and hero CTA buttons
  - chat/landing route composition
  - bottom CTA strip
  - shared background, glow, and theme systems

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a current-state presentation cleanup on an existing public route
  - it adds no new capability and does not extend into future-phase systems
  - it stays within the active public product-surface scope

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - remove only the screenshot-matched data groups
  - do not redesign the remaining page composition
  - preserve the CTA strip and hero copy
  - verify no ghost spacing or wrapper artifacts remain

## Completion Addendum

- Implemented:
  - removed the homepage right-side hero data board and attached floating bubble cards
  - removed the four-card guided strip section
  - removed the three-card `Why this feels different` section
  - removed the now-unused homepage content arrays/imports that powered those deleted blocks
- Verification completed:
  - `npm run build` passed
  - representative homepage desktop and mobile renders were visually checked after removal
- Remaining verification limit:
  - none for this scoped remove-only cleanup
