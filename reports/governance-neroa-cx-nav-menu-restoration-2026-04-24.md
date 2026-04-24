# NEROA-CX Nav Menu Restoration

Date: 2026-04-24

## Scope

Restore the shared dropdown navigation inventory for the public/front-door header without redesigning the header shell.

## Root Cause

The shared menu control in `components/site/site-nav.tsx` was still mounted, but the shared menu data in `lib/data/site-nav.ts` had been reduced to only a small subset of links. That left the dropdown/button present while most marketing and product destinations were missing from the actual menu.

## Fix Applied

- Restored the shared menu inventory in `lib/data/site-nav.ts` to include:
  - Home
  - Projects
  - Pricing
  - SaaS
  - Budget Logic
  - DIY Build
  - Managed Build
  - Use Cases
  - Blog
  - Instructions
  - Support
  - Contact
  - Start a project
- Updated `components/site/site-nav.tsx` so `Projects` resolves through an auth redirect when the user is signed out, while preserving the existing dropdown style and behavior.

## Verification

- `npm run build` passes.
- Confirmed the restored shared menu data contains `Home`, `Projects`, `Pricing`, `DIY Build`, and the remaining requested links.
- Confirmed the target routes exist in the current app tree for the restored public links.
