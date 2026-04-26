# Phase Map v1

## Purpose

This file maps major Neroa workstreams to their owning phase so future requests cannot be force-inserted into unrelated execution areas.

## Current Phase Focus

- Active implementation scope: Phases 0 through 3
- Controlled maintenance scope: Phase 4
- Current promoted exception inside active scope: Browser Runtime Core V2 and Live Session Design Library Bridge
- Future scope only: Phases 5 and 6

## Workstream Mapping

| Workstream | Primary Phase | Status | Depends On | Notes |
| --- | --- | --- | --- | --- |
| Strategy Room | 1 | Current | 0 | Primary truth-capture conversation layer. |
| Extraction engine | 1 | Current | 0 | Turns user input into structured product truth. |
| Question engine | 1 | Current | 0 | Chooses the next question needed to increase truth confidence. |
| Delta-Analyzer | 2 | Current | 0, 1 | Mandatory first analysis step for requested changes. |
| Rebuild Impact Report | 2 | Current | 0, 1, 2 | Formal report emitted after Delta-Analyzer. |
| Backend governance | 2 | Current | 0, 1 | Governs change classification, phase mapping, confidence, and blocking decisions. |
| Universal domain generalization | 1 with 2 and 3 support | Current | 0, 1 | Enriches the shared ProjectBrief with system archetypes, capability profiles, and optional vertical overlays while preserving backward compatibility for downstream planning, governance, execution, QA, and billing layers. |
| Workspace/project surfaces | 3 | Current | 0, 1, 2 | Runtime execution surfaces for approved work only. |
| Execution packet handoff and pending release | 3 | Current | 0, 1, 2, 3 | Turns approved shared intelligence into typed execution packets and releases eligible pending execution through the existing Build Room task/run pipeline without creating a second executor. |
| QA artifact gate and completion validation | 3 | Current | 0, 1, 2, 3 | Derives artifact requirements, acceptance checks, and release readiness from approved shared intelligence plus existing Build Room task/run/artifact outputs without replacing the Build Room relay or statuses. |
| Browser Runtime Core V2 | 3 | Current-promoted | 0, 1, 2, 3, 4 | Unified current-promoted browser runtime core that may replace Browser Runtime Bridge v1 now. Includes deterministic open/attach/bind/tab targeting, unified command lifecycle, real Inspect, Record foundation, bounded AI walkthrough/test foundation, SOP/result output foundation, and project/library linkage. |
| Live Session Design Library Bridge | 3 | Current-promoted | 0, 1, 2, 3, 4 | Lets Design Library run against the same connected Browser Runtime Core V2 session for staged preview/package state only. |
| Billing/account | 4 | Current-supporting | 0, 2, 3 | High-impact trust surface; maintenance only unless roadmap promoted. |
| Browser visual editor | 5 | Future | 0, 1, 2, 3, 4 | Future controlled editing layer. |
| Future system/orchestration layer | 6 | Future | 0, 1, 2, 3, 4, 5 | Future multi-system delivery coordinator. |

## Supporting System Ownership

| System | Owning Phase | Notes |
| --- | --- | --- |
| Planning intelligence | 1 and 2 | Truth capture in Phase 1, roadmap/control in Phase 2. |
| Routing contracts | 3 and 4 | Product routing lives with execution surfaces; protected routing changes are Phase 4. |
| Auth and identity | 4 | Trust boundary. Changes are never hidden inside workspace work. |
| Billing and entitlement | 4 | Trust boundary. High-impact by default. |
| Browser runtime core V2 | 3 | Current-promoted exception for legacy bridge replacement, deterministic open/attach/bind/tab selection, unified command lifecycle, real Inspect, Record foundation, bounded AI walkthrough/test foundation, SOP/result output foundation, and shared Design Library session attachment. |
| Browser/live-view mutation tooling | 5 | Full browser visual editor, unrestricted live manipulation, and full rebuild tooling remain future-phase. |
| Strategy intelligence save-back | 3 with 1 and 2 support | Shared Strategy Room save-back, revision persistence, and derived-intelligence rehydration stay inside the existing ProjectBrief, ArchitectureBlueprint, RoadmapPlan, and GovernancePolicy spine. Material scope or architecture revisions still flow back through Phase 2 governance before execution can widen. |
| Domain archetype and overlay intelligence | 1 with 2 and 3 support | Universal domain generalization may enrich the shared ProjectBrief with typed system archetypes, capability profiles, and optional vertical overlays when it preserves the existing downstream compatibility contract and does not create a second planning path beside the approved ProjectBrief spine. |
| Execution packet intelligence | 3 with 1 and 2 support | Shared execution packets, in-scope pending release, and Build Room handoff derive from the approved intelligence spine and governance decisions. They may not replace the existing Build Room backend contracts or bypass Strategy Room approval authority. |
| QA and completion intelligence | 3 with 1 and 2 support | Shared QA validation, artifact requirements, completion readiness, and release decisions derive from the approved execution spine and existing Build Room task/run/artifact records. They may not create a second QA executor, silently alter Build Room statuses, or bypass governance and approval authority. |

## Phase Assignment Rules

1. Every request receives one primary phase owner.
2. A request may have secondary phases touched, but the primary phase determines sequencing.
3. If a request touches more than one current phase, Delta-Analyzer must classify whether it is:
   - local,
   - medium,
   - high,
   - architectural.
4. Requests inside the explicitly promoted Browser Runtime Core V2 / Live Session Design Library Bridge exception are treated as Phase 3 only when they:
   - use one shared browser runtime core and one shared live session for Browser and Design Library,
   - may replace the legacy Browser Runtime Bridge v1 rather than layering a second runtime path beside it,
   - stay inside deterministic open/attach/bind/tab targeting, unified command lifecycle, real Inspect, truthful Record foundation, bounded AI walkthrough/test foundation, SOP/result output foundation, and project/library linkage,
   - do not introduce a second browser system, unrestricted browser visual editor, or full autonomous orchestration layer.
5. If a request's primary phase is future, it is deferred unless roadmap revision explicitly promotes it.
6. If a request attempts to jump directly from a current phase into a future-phase system, execution is blocked until roadmap revision is approved.

## Canonical Examples

- "Improve question ordering in Strategy Room" -> Phase 1
- "Generalize ProjectBrief domain intelligence with archetypes, capability profiles, and optional overlays while keeping downstream compatibility" -> Phase 1 with 2/3 support
- "Add Delta review before approving change requests" -> Phase 2
- "Adjust approved workspace execution flow after gate passes" -> Phase 3
- "Generate typed execution packets and release eligible pending execution through the existing Build Room pipeline" -> Phase 3
- "Generate typed QA validation and release-readiness results from execution packets and existing Build Room artifacts" -> Phase 3
- "Rebuild Browser Runtime Core V2 with one shared command/session model and bounded Inspect/Record/AI walkthrough/SOP foundations" -> Phase 3 (promoted exception)
- "Reuse existing Live View from Command Center and attach Design Library to the same session" -> Phase 3 (promoted exception)
- "Modify billing entitlement or auth gating" -> Phase 4
- "Add visual drag-and-drop editor" -> Phase 5
- "Auto-coordinate multi-system rebuilds" -> Phase 6
