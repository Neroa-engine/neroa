# Architectural Roadmap v1

## Purpose

This roadmap defines the approved macro phases for Neroa. Every future feature, rebuild request, or architectural adjustment must belong to one phase before execution begins.

## Phase Overview

| Phase | Name | Status | Purpose |
| --- | --- | --- | --- |
| 0 | Governance Foundation | Current | Establish architecture rules, decision models, confidence thresholds, and durable operating guidance. |
| 1 | Product Truth Capture | Current | Capture product truth from Strategy Room and related intake systems before roadmap or execution. |
| 2 | Roadmap and Change Control | Current | Analyze change impact, update roadmap when needed, map work to phases, and gate execution. |
| 3 | Core Execution Surfaces | Current | Deliver approved work inside workspace and project execution surfaces without bypassing governance. |
| 4 | Platform Trust and Commerce Control | Current-supporting | Govern auth, billing, account, entitlement, protected routing, and high-risk backend trust boundaries. |
| 5 | Browser Visual Editor and Live Rebuild | Future | Add safe browser-based editing, live rebuild previews, and controlled visual mutation tooling beyond the current-promoted Browser Runtime Core V2 foundation. |
| 6 | System Orchestration and Autonomous Delivery | Future | Coordinate future orchestration layers, autonomous rebuild flows, and multi-system execution. |

## Current Promoted Exception

The current roadmap now promotes the browser runtime foundation needed for immediate execution without promoting the full Phase 5 browser editor or the full Phase 6 orchestration stack:

- Browser Runtime Core V2
- Live Session Design Library Bridge

This promoted scope is part of current execution scope when it:

- may replace the legacy Browser Runtime Bridge v1 as the primary browser/runtime implementation path
- reuses valid existing session truth, tokenized launch/auth, current-vs-historical inspection truth, and project/library destination contracts where those remain sound
- uses one unified browser runtime core for Command Center, Live View, sidepanel, service worker, and content script triggers
- implements deterministic browser open, attach, bind, tab/window targeting, and current-session selection
- implements one command bus, one response contract, one action registry, and one persistence/writeback contract
- exposes one real Inspect action, a truthful Record foundation, a bounded AI walkthrough/test foundation, and an SOP/result-output foundation
- preserves project/library linkage as the canonical destination for runtime outputs
- keeps current truth above stale history and does not leave a second legacy fallback path active in parallel

This promoted scope does **not** include:

- full browser visual editor
- arbitrary click-to-edit or unrestricted direct DOM mutation tooling
- full live rebuild orchestration
- unbounded autonomous multi-system delivery
- a second browser or second design-preview runtime path

## Phase Definitions

### Phase 0 - Governance Foundation

- Purpose: define the governance pack, operating rules, branch system, contradiction handling, assumption ledger model, and execution gate rules.
- Depends on: none.
- Allowed to touch:
  - `docs/architecture/*`
  - `docs/governance/*`
  - `AGENTS.md`
  - future non-runtime governance scaffolding
- Not allowed to touch:
  - runtime product behavior
  - routing, auth, billing, workspace execution, or backend logic
- Boundary: this phase defines the rules for later phases but does not claim runtime enforcement.

### Phase 1 - Product Truth Capture

- Purpose: gather reliable product truth before roadmap drafting.
- Depends on:
  - Phase 0 governance definitions
- Allowed to touch:
  - Strategy Room intake behavior
  - extraction engine logic
  - question selection engine logic
  - product truth capture formats
  - universal domain generalization inside the shared ProjectBrief spine when it enriches product truth with system archetypes, capability profiles, optional vertical overlays, and backward-compatible compatibility mapping for later planning layers
  - shared blocker-definition libraries, blocker-specific schemas, normalization rules, provider adapters, and eval fixtures when they constrain Strategy Room answer extraction to typed write-safe contracts before the shared revision spine persists updates
- Not allowed to touch:
  - billing/account behavior
  - protected routing behavior
  - execution surfaces beyond approved intake contracts
- Boundary: Phase 1 can collect truth and raise contradictions, but it cannot approve execution on its own. Universal archetype and capability inference may extend shared product truth now when it preserves the existing ProjectBrief contract for downstream planning, governance, execution, QA, and billing layers rather than replacing them with a second intelligence path.
  Phase 1 also owns the blocker-library and schema-driven extraction foundation for Strategy Room when app code remains the authority for active blocker selection, allowed schemas/tools, slot write targets, validation, and clarify-vs-advance decisions instead of allowing freeform model-directed state mutation.
  Phase 1 may now expand that blocker-library foundation with broader blocker-family coverage, stricter normalization for real customer phrasing, safe multi-part secondary-hint capture, and larger eval suites when those additions keep blocker-scoped write targets authoritative and do not let the model freestyle unrelated slot mutation.

### Phase 2 - Roadmap and Change Control

- Purpose: turn extracted truth into roadmap structure and control rebuild requests.
- Depends on:
  - Phase 0 rules
  - Phase 1 extraction output
- Allowed to touch:
  - Delta-Analyzer
  - Rebuild Impact Report generation
  - roadmap artifacts
  - phase mapping logic
  - contradiction handling
  - assumption invalidation and rebuild classification
- Not allowed to touch:
  - feature execution without a passed gate
  - direct UI/runtime shortcuts around governance
- Boundary: this phase decides whether work is allowed, revised, deferred, or blocked.

### Phase 3 - Core Execution Surfaces

- Purpose: implement approved work inside the workspace and project delivery surfaces.
- Depends on:
  - approved output from Phases 0 through 2
- Allowed to touch:
  - workspace surfaces
  - project surfaces
  - stable backend execution paths already mapped by roadmap
  - planning-to-execution handoff interfaces
  - typed execution-packet generation and approved-scope packet release when they reuse the existing Build Room task, relay, and run contracts
  - typed QA and acceptance validation derived from the approved execution packet, roadmap acceptance criteria, governance QA rules, and existing Build Room task, run, and artifact outputs
  - shared Strategy Room save-back, revision persistence, and intelligence rehydration when they stay inside the existing ProjectBrief, ArchitectureBlueprint, RoadmapPlan, and GovernancePolicy spine
  - persisted Strategy Room thread continuity and reopen hydration when existing projects must prefer their saved project-specific planning thread/history over starter onboarding content without changing approval semantics or backend contracts
  - chat-primary Strategy Room blocker resolution when unresolved planning questions are answered in the main planning thread, auto-persist through the existing shared revision spine, and leave the right rail as supportive read-only intelligence instead of a second answer-entry system
  - Strategy Room chat-submit reliability corrections when valid short semantic answers must stay visible in-thread, persist through the shared revision spine, update blocker/readiness state when possible, and surface explicit save failures instead of silently disappearing
  - Strategy Room short-answer persistence hardening when valid negative or null-style answers such as "no constraint," "none," or "not in MVP" must count as real blocker responses, remain visible in-thread, and either advance, clarify, or show an explicit save error instead of silently no-oping
  - Strategy Room blocker-orchestrator integration when the room resolves the active blocker from the shared blocker library, runs only the blocker-specific extraction contract, persists safe patches through the existing revision spine, and keeps message rendering separate from structured save logic
  - Browser Runtime Core V2 and Live Session Design Library Bridge when they stay inside the promoted exception above
- Not allowed to touch:
  - unapproved new branches
  - out-of-phase capability insertion
  - a second execution system or replacement Build Room contract path beside the approved Build Room pipeline
  - a second QA executor, separate completion engine, or replacement acceptance gate outside the shared intelligence spine and existing Build Room records
  - billing/auth/platform trust changes unless Phase 4 is explicitly engaged
- Boundary: execution must remain inside the approved phase and approved systems list. Phase 3 now owns the current-promoted Browser Runtime Core V2 foundation for deterministic browser open/attach/bind/tab targeting, unified command lifecycle, Inspect, Record foundation, bounded AI walkthrough/test foundation, SOP/result output foundation, and shared Design Library session attachment. Phase 3 also owns deterministic execution-packet generation, pending-execution release, typed QA/completion validation, persisted Strategy Room thread continuity, chat-primary Strategy Room blocker resolution, and Strategy Room chat-submit reliability corrections when they derive from the approved ProjectBrief, ArchitectureBlueprint, RoadmapPlan, GovernancePolicy, Strategy revision spine, and existing Build Room task/run/artifact records, then map back into the current Build Room pipeline without redefining execution gates, trust-layer rules, or backend contracts. That includes treating valid short semantic answers as real project-room blocker responses, persisting them through the shared save-back spine, and surfacing explicit save failures instead of silently dropping them. Phase 3 still may not absorb the full Phase 5 browser visual editor or the full Phase 6 orchestration layer.
  Strategy Room may now integrate the shared blocker library and typed extraction orchestrator from Phase 1 when that integration preserves the current chat-first UI, uses the shared revision/save-back spine as the only write authority, and does not create a second mutation path beside the approved project intelligence loader.
  Strategy Room may also consume broader blocker coverage, stronger clarification rules, and safe secondary-hint capture from that same Phase 1 library when those runtime integrations remain blocker-scoped, preserve chat-first delivery, and keep unrelated write targets blocked by app code instead of model preference.

### Phase 4 - Platform Trust and Commerce Control

- Purpose: manage the highest-risk product boundaries that affect access, money, identity, and entitlement.
- Depends on:
  - Phases 0 through 3
- Allowed to touch:
  - auth
  - billing/account
  - entitlements
  - protected routing
  - backend governance enforcement paths
- Not allowed to touch:
  - opportunistic feature additions through billing/auth work
  - workspace or UI feature stacking hidden inside trust-layer changes
- Boundary: this phase is current-supporting only. Changes here are high-impact by default and usually require roadmap review first.

### Phase 5 - Browser Visual Editor and Live Rebuild

- Purpose: introduce safe browser editing and rebuild preview capabilities.
- Depends on:
  - stable outputs from Phases 0 through 4
- Allowed to touch:
  - browser visual editor
  - live-view mutation surfaces
  - preview and controlled rebuild orchestration
- Not allowed to touch:
  - direct platform trust mutation
  - ungoverned cross-system rewrites
- Boundary: editor work remains future-phase until explicitly promoted. The current promoted Browser Runtime Core V2 / Live Session Design Library Bridge exception authorizes the runtime core and bounded browser action foundations only; it does not promote the full browser visual editor, unrestricted DOM mutation tooling, or full live rebuild orchestration.

### Phase 6 - System Orchestration and Autonomous Delivery

- Purpose: coordinate multi-system execution once governance, trust, and editor layers are stable.
- Depends on:
  - Phases 0 through 5
- Allowed to touch:
  - orchestration layer
  - autonomous delivery policies
  - future system-wide coordination
- Not allowed to touch:
  - governance bypasses
  - implicit phase promotion
- Boundary: orchestration is blocked until earlier phases have durable controls.

## Current Execution Rule

The current approved execution baseline is:

- fully active: Phases 0, 1, 2, and 3
- maintenance only: Phase 4
- current promoted exception: Browser Runtime Core V2 and Live Session Design Library Bridge
- future only: Phases 5 and 6

Out-of-phase work must be deferred or routed through roadmap revision before implementation.
