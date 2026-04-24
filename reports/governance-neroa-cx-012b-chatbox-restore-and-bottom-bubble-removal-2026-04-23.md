# Governance Analysis: NEROA-CX-012B Chatbox Restore And Bottom Bubble Removal

- Prompt ID: `NEROA-CX-012B-CHATBOX-RESTORE-AND-BOTTOM-BUBBLE-REMOVAL`
- Date: `2026-04-23`
- Prepared by: `Codex`
- Scope: remove the lower `NEROA is ready to help frame and route your SaaS the right way.` bubble from the `/ai-app-builder` landing route and restore a visible right-side chat box on the screenshot-matching homepage route

## Extraction Snapshot

- Snapshot ID: `ex-neroa-cx-012b-2026-04-23`
- Requested change: remove the lower bubble containing `NEROA is ready to help frame and route your SaaS the right way.` plus its support paragraph, and fix the missing chat box shown in the attached screenshot
- Why it exists: the reported issue spans two related public front-door routes: the removable lower bubble text exists on `/ai-app-builder`, while the attached screenshot showing the missing chat box matches the homepage `/`
- Desired outcome: no lower `NEROA is ready...` bubble on the landing route, and a visible right-side premium chat surface on the homepage so the rendered page matches the expected composition
- Source material used for analysis:
  - attached screenshot showing the homepage hero with no visible right-side chat box
  - current homepage implementation in `app/page.tsx`
  - current `/ai-app-builder` landing implementation in `app/ai-app-builder/page.tsx`
  - current shared landing chat-box styling in `app/globals.css`
  - architectural baseline in `docs/architecture/README.md`
  - governance baseline in `docs/governance/README.md`
- Implementation gap identified before execution:
  - the homepage route had an empty right-side visual shell after earlier remove-only cleanup work
  - the landing route still contained the lower branded bubble the user now wants removed
  - the premium chat surface already existed on `/ai-app-builder`, so the most reliable repair path was to reuse that same chat-card implementation on the homepage

### Scope

- In scope now:
  - homepage right-side chat surface restoration
  - `/ai-app-builder` lower bubble removal
  - shared reusable chat-card extraction for those two public routes
  - minimal supporting CSS for homepage chat-card placement
  - production build and browser verification
- Out of scope now:
  - navigation changes
  - logo treatment changes
  - broader landing/homepage redesign
  - auth, workflow, or backend logic changes

### Assumptions

- The attached screenshot is the authoritative reference for the route that is missing the chat box, and it matches the homepage `/`.
- The lower bubble removal request applies to the `NEROA is ready...` section on `/ai-app-builder`.
- Reusing the existing premium chat surface is safer and more faithful than inventing a second chat-box variant for the homepage.

### Systems And Risk

- Primary branch: `SaaS / Workflow Platform`
- Owning system: `Public front-door presentation`
- Systems touched: `Homepage route`, `AI app builder landing route`, `Shared public chat-card component`, `Landing/homepage CSS`
- Trust-layer systems touched: `None`
- Key risk: the fix must restore the homepage chat box without disturbing the surrounding hero composition or reintroducing removed bubble/data sections

## Delta-Analyzer

- Worksheet ID: `delta-neroa-cx-012b-2026-04-23`
- Request origin: `Brand / UX correction`
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
- Architecture confidence: `97`
- Preliminary gate recommendation: `Approved as a narrow public-route correction`

## Rebuild Impact Report

- Report ID: `impact-neroa-cx-012b-2026-04-23`
- Requested change summary: remove the landing-route lower bubble and restore the missing homepage chat box using the existing premium chat-card treatment
- Risk level: `low`
- Change type: `modifying`
- Required rebuild scope:
  - homepage JSX update
  - landing-route JSX cleanup
  - shared chat-card extraction
  - minimal CSS support for homepage chat-card placement
  - desktop/mobile verification
- Explicitly untouched:
  - route behavior
  - headline wording
  - logo treatment
  - global theme system
  - backend/product logic

## Phase Mapping

- Phase assignment: `Phase 3`
- Reasoning:
  - this is a current-state public presentation correction across existing routes
  - it adds no new capability and stays within active front-door scope
  - the shared extraction of an existing chat surface is a presentation-layer reuse, not a new system

## Execution Gate

- Gate result: `Proceed`
- Conditions:
  - remove only the targeted lower bubble content on `/ai-app-builder`
  - restore the homepage chat box using the existing premium chat treatment
  - verify rendered output on the affected public routes before claiming completion

## Completion Addendum

- Implemented:
  - extracted the existing premium chat surface into a reusable front-door chat-card component
  - restored the right-side homepage chat box using that shared component
  - removed the lower `NEROA is ready...` bubble section from `/ai-app-builder`
  - suppressed the shared footer brand-copy bubble on the homepage so that same `NEROA is ready...` text no longer appears there either
  - added only the minimal homepage CSS needed to position the restored chat card cleanly
- Verification completed:
  - `npm run build` passed
  - fresh production desktop/mobile renders were checked for `/` and `/ai-app-builder`
- Remaining verification limit:
  - none for this scoped public-route correction
