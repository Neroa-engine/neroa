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
| Workspace/project surfaces | 3 | Current | 0, 1, 2 | Runtime execution surfaces for approved work only. |
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
- "Add Delta review before approving change requests" -> Phase 2
- "Adjust approved workspace execution flow after gate passes" -> Phase 3
- "Rebuild Browser Runtime Core V2 with one shared command/session model and bounded Inspect/Record/AI walkthrough/SOP foundations" -> Phase 3 (promoted exception)
- "Reuse existing Live View from Command Center and attach Design Library to the same session" -> Phase 3 (promoted exception)
- "Modify billing entitlement or auth gating" -> Phase 4
- "Add visual drag-and-drop editor" -> Phase 5
- "Auto-coordinate multi-system rebuilds" -> Phase 6
