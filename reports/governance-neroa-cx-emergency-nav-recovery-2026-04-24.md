# NEROA-CX-EMERGENCY-NAV-RECOVERY

Date: 2026-04-24
Owner: Codex

## Scope

Emergency header recovery only.

Restored:
- Home
- account/login access
- Projects

Did not alter:
- hero
- layout
- background
- chat
- broader branding package
- unrelated navigation items

## Root Cause

The front-door routes were switched onto the shared `minimalHeader` / `minimalNavigation` branch during the CX-014 front-door pass.

That reduced branch in `components/site-header.tsx` bypassed the normal shared header controls and only rendered:
- Home
- the primary CTA
- one account button

As a result:
- `Projects` was never rendered in that branch
- the authenticated account menu path was removed from that branch
- the front-door `Home` item depended on the stripped-down branch instead of the stable shared header composition

## Fix

Patched only the `minimalNavigation` branch in `components/site-header.tsx` to restore:
- `Home`
- `Projects`
- `Engine Board` when authenticated
- `Sign in` when unauthenticated
- `PublicAccountMenu` when authenticated
- existing `Open Strategy Room` CTA

`Projects` now resolves to:
- `/projects` when authenticated
- `/auth?next=/projects` through the existing auth redirect helper when unauthenticated

## Verification

- `npm run build` passes
- production render checked on `/`
- `Home`, `Projects`, `Sign in`, and `Open Strategy Room` all present in the homepage DOM
- `Projects` unauthenticated target resolves through the existing auth redirect helper
- mobile header width check passed with `scrollWidth == clientWidth`
