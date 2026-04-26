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
  - shared ProjectBrief enrichment through system archetypes, capability profiles, optional vertical overlays, and backward-compatible domain compatibility mapping
  - shared blocker libraries, blocker-specific output schemas, normalization helpers, provider adapters, and eval fixtures for typed Strategy Room answer extraction
  - blocker-library coverage expansion for broader feature, access, surface, billing, workflow, and marketplace planning answers when active blocker routing and write-target safety stay app-controlled
  - deterministic blocker-runtime libraries for queue construction, active-blocker selection, question planning, clarification/completion policy, and reopen rules when the runtime remains layered on top of the shared blocker library and revision spine
- Must not do:
  - change workspace behavior directly
  - patch billing/auth/routing to compensate for missing extraction truth
  - create a second planning or domain-intelligence path beside the approved ProjectBrief spine
  - allow freeform model-selected slot mutation outside app-controlled blocker definitions and write-target rules

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
  - persisted Strategy Room thread continuity when existing projects must reopen into their saved planning conversation instead of starter onboarding content
  - Strategy Room chat-primary blocker resolution when the main thread captures answers, shared revisions/intelligence update automatically, and the right rail remains supportive instead of acting like a second answer form
  - Strategy Room chat-submit reliability fixes when valid short semantic answers must remain visible in-thread, map into the shared save-back spine when possible, and surface explicit failure states instead of silently disappearing
  - Strategy Room blocker-orchestrator integration when the active blocker is resolved from the shared intent library, extraction is restricted to that blocker's schema/write targets, and safe structured patches flow through the existing revision persistence path
  - Strategy Room use of blocker-library partial parses, clarification prompts, and safe secondary hints when the room still renders one chat thread, persists through the same revision spine, and never allows cross-blocker freeform writes
  - Strategy Room use of the shared blocker-runtime queue, question planner, clarification/completion engine, and deterministic reopen policy when answers still land in the main chat and save through the same revision spine
  - typed execution-packet generation and pending-execution release when they reuse the approved Build Room pipeline
  - typed QA and acceptance validation when they derive from approved shared intelligence plus the existing Build Room task, run, and artifact records
- Must not do:
  - redefine governance
  - bypass trust rules
  - create a second execution backend or silently replace the approved Build Room contracts
  - create a second QA executor or completion engine beside the shared execution spine and current Build Room records
  - insert future-phase editor/orchestration capabilities
  - let the model freestyle slot writes outside the shared blocker-definition and revision-saveback contracts

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
