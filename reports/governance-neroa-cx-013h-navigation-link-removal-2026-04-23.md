# NEROA-CX-013H - Navigation Link Removal

## Scope

- Remove `Pricing`, `SaaS`, `Budget Logic`, `DIY Build`, `Managed Build`, `Use Cases`, `Blog`, and `Contact` from the shared public navigation surfaces.
- Keep the remaining header structure, logo, actions, and routing behavior intact.

## Delta

- Updated `lib/data/site-nav.ts` to leave `Home` as the only top-row main nav item.
- Removed the same destinations from the shared site navigation dataset used by the public menu.

## Impact

- Public navigation surfaces only.
- No page layouts, colors, or route handlers changed.
