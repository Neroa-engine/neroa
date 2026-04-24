# NEROA-CX-014 Active Background, Nav Simplification, and Landing Chat Starter

Date: 2026-04-23
Owner: Codex

## Governance Chain

1. Architectural roadmap validation
   - Validated as a front-door UX/polish pass inside the existing branded shell system.
   - No new runtime surface or workflow branch was introduced.
2. Delta-Analyzer
   - Impact is concentrated in shared branded shell presentation, front-door header behavior, and a lightweight landing chat interaction.
3. Rebuild Impact Report
   - Low-to-moderate UI impact because the background layer, shared header, and landing chat component are reused across multiple pages.
   - No backend contract or protected workflow rewrite required.
4. Roadmap revision requirement
   - Not required for this scoped UX/polish pass.
5. Phase mapping
   - Fits the current front-door refinement and branded-shell polish phase.
6. Execution gate
   - Passed for shared-shell UI refinement with no trust-layer or billing/auth contract change.

## Scope Implemented

- Added a second restrained ambient drift layer to the shared `NeroaAtmosphere` background system so the approved background feels active across shared branded shells.
- Added a front-door-only minimal header mode so homepage, landing page, and generic `/start` only show `Home`, `Engine Board`/`Sign in`, and `Open Strategy Room`.
- Converted the landing chat card into a lightweight guided starter interaction:
  - greeting on activation
  - name capture
  - concise Neroa explanation
  - `Let's get started` completion button
- Replaced visible `DIY Build` launch CTA labels with `Start a conversation` across the shared public launch surfaces while preserving canonical launch routing.

## Intentionally Left Unchanged

- Core route architecture
- Auth gating for explicit `/start?entry=*` flows
- Shared product workflow logic outside the requested landing/front-door interaction
- Existing background asset choice and overall page composition

## Verification

- `npm run build` passes.
- Production browser checks completed for:
  - `/`
  - `/auth`
  - `/ai-app-builder`
- Landing chat interaction verified in-browser:
  - initial prompt activates on chat interaction
  - name entry renders `Hey, [Name], I'm Neroa.`
  - explanation renders
  - `Let's get started` button appears
- Reduced-motion verification completed:
  - primary and secondary background drift animations resolve to `none`
