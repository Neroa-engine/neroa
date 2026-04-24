# NEROA-CX-013O - Home CTA Removal, Pill Offset, And Purple Glow Removal

## Scope

- Remove the homepage `DIY Build` hero button.
- Move the five homepage trust pills farther down on desktop.
- Remove the glow effect from shared purple buttons.

## Delta

- Deleted the secondary `Start DIY Build` button from `components/front-door/front-door-home-hero.tsx`.
- Increased the homepage trust-row top margin in `app/globals.css`.
- Removed purple glow layers from shared `.button-primary`, `.button-cta`, and front-door themed primary button styles.
- Removed the two inline purple shadow overrides from the homepage hero and shared header CTA.

## Impact

- Homepage hero layout.
- Shared purple CTA styling across the site.
