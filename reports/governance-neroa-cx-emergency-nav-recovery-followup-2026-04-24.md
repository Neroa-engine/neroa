# NEROA-CX-EMERGENCY-NAV-RECOVERY Follow-up

Date: 2026-04-24

## Scope

Restore only the missing marketing-sites navigation picker button in the reduced front-door header branch.

## Root Cause

The prior emergency recovery restored `Home`, `Projects`, and account/login access in the `minimalNavigation` branch of `components/site-header.tsx`, but that reduced branch still omitted the shared `SiteNav` control that opens the marketing/public navigation menu.

## Fix Applied

- Reinserted `SiteNav` into the `minimalNavigation` branch in `components/site-header.tsx`.
- Kept the existing reduced-header styling and ordering intact.
- Did not change hero, chat, background, layout, or unrelated navigation items.

## Verification

- `npm run build` passes.
- Verified the rendered front-door homepage output includes:
  - `Home`
  - `Projects`
  - `Open navigation menu`
  - `Open Strategy Room`
  - `Sign in`
- Verified this through a fresh local production render on `http://127.0.0.1:3232/`.
