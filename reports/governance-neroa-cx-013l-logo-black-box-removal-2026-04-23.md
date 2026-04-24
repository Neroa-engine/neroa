# NEROA-CX-013L - Logo Black Box Removal

## Scope

- Remove the visible black box around the shared NEROA logo.
- Keep the header layout and logo treatment otherwise unchanged.

## Delta

- Generated a transparent-background version of the existing logo asset at `public/logo/neroa-transparent.png`.
- Switched the shared logo component to use the transparent asset.
- Removed the dark-theme screen-blend workaround from the shared logo class.

## Impact

- Shared logo rendering across public and interior shells.
- No navigation structure or route behavior changes.
