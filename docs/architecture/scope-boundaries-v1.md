# Scope Boundaries v1

## Purpose

This file defines what belongs in each major Neroa system and what must not be patched across boundaries.

## System Boundaries

### Governance System

- Belongs here:
  - roadmap
  - phase map
  - Delta-Analyzer rules
  - Rebuild Impact Report rules
  - confidence thresholds
  - contradiction handling
- Must not do:
  - pretend docs are runtime enforcement
  - absorb product feature implementation

### Planning Intelligence System

- Belongs here:
  - extraction schema
  - question selection
  - branch classification
  - assumption capture
- Must not do:
  - change workspace behavior directly
  - patch billing/auth/routing to compensate for missing extraction truth

### Change Control System

- Belongs here:
  - Delta analysis
  - impact classification
  - roadmap revision decisions
  - execution gate decisions
- Must not do:
  - skip ahead to implementation
  - silently convert future-phase work into current work

### Platform Trust System

- Belongs here:
  - auth
  - billing/account
  - entitlements
  - protected routing
  - backend access control
- Must not do:
  - bundle unrelated product features
  - accept hidden behavior changes coming from workspace or UI requests

### Workspace and Product Surface System

- Belongs here:
  - approved execution surfaces
  - workspace and project delivery flows
  - approved planning-to-execution handoff
  - typed execution-packet generation and pending-execution release when they reuse the approved Build Room pipeline
- Must not do:
  - redefine governance
  - bypass trust rules
  - create a second execution backend or silently replace the approved Build Room contracts
  - insert future-phase editor/orchestration capabilities

### Browser / Live-View / Future Editor System

- Belongs here:
  - visual inspection
  - future visual editing
  - safe rebuild previewing
- Must not do:
  - patch platform trust logic
  - directly mutate unrelated backend systems without formal analysis

## Anti-Fragmentation Rules

1. No random feature stacking.
2. No "while we are here" cross-system additions.
3. No patching the nearest file if the real owner lives in another system.
4. No hidden rebuilds that change multiple phases without explicit analysis.
5. No phase-jumping because a request sounds urgent.
6. No branch shift without formal branch reassessment.

## Cross-Boundary Patch Rule

If a request crosses a system boundary, the patch is not automatically allowed. It must first show:

1. why the owning system cannot absorb the change locally,
2. which dependency edge is being crossed,
3. whether roadmap revision is required,
4. whether execution remains in-phase.

If that proof is missing, the request is deferred or blocked.
