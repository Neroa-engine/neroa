# Governance Record — NEROA-CX-RETIRE-005 Phase 2 Dependency Cleanup

- Date: 2026-04-25
- Task: Clean dependency links and handoff references that still pointed at retired public routes
- Scope: Pricing, onboarding, example-build handoff wiring, and legacy content CTA registries

## Architectural Validation

This pass preserves the approved front-door and protected product flow by removing stale references to retired public routes while keeping the retired page files on disk for later deletion phases.

## Delta Analyzer

- Change surface: route targets in pricing surfaces, onboarding handoff state, example-build continuation actions, and content registries
- Change type: canonical-route realignment
- Protected product routes: unchanged
- Retired page files: retained

## Rebuild Impact Report

- Impact level: moderate
- User-facing effect:
  - stale public links now point to `/start`, `/pricing`, or `/contact`
  - example-build continuation now hands off to canonical `/start?entry=...` routes
  - legacy CTA registries no longer advertise retired pages
- Risk controls:
  - no retired page files deleted
  - no auth or billing logic redesign
  - build verification required before completion

## Phase Mapping

- Phase: Retirement cleanup, Phase 2
- Execution gate: approved for dependency cleanup only

## Notes

Remaining blockers before page-file deletion are expected to live in the retired page implementations and dormant content registries themselves, not in shared live dependencies.
