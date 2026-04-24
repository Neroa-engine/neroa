# Dependency Map v1

## Purpose

This file defines which systems depend on which others so future patches do not silently break sequencing.

## System Layers

1. Governance source of truth
2. Planning intelligence and truth capture
3. Change control and roadmap governance
4. Platform trust layer
5. Workspace and product execution surfaces
6. Browser/live-view and future editor layers
7. Future orchestration layer

## Dependency Graph

| System | Depends On | Why |
| --- | --- | --- |
| Governance (`roadmap`, `phase map`, `boundaries`, `specs`) | none | Source of truth for all later decisions. |
| Planning intelligence | Governance | Questioning and extraction must follow approved branch and confidence rules. |
| Delta-Analyzer / Rebuild Impact Report | Governance, Planning intelligence | Change analysis needs roadmap, phase map, extracted truth, assumptions, and contradictions. |
| Auth | Governance | Identity changes are governed trust-layer work. |
| Billing/account | Governance, Auth | Entitlements depend on identity and approved platform rules. |
| Routing | Governance, Auth, Billing/account | Protected routing and capability access must honor trust decisions. |
| Backend governance | Governance, Planning intelligence, Delta-Analyzer | Backend gate logic relies on extracted truth and approved rules. |
| Workspace/project surfaces | Governance, Planning intelligence, Routing, Auth, Billing/account, Backend governance | Execution surfaces should only expose approved work to approved users. |
| Browser/live-view | Governance, Routing, Auth, Workspace/project surfaces | Live-view must respect access and execution boundaries. |
| Future visual editor | Governance, Browser/live-view, Workspace/project surfaces, Backend governance | Editor changes require safe previews and impact awareness. |
| Future orchestration layer | All prior systems | Orchestration is downstream of every governed layer. |

## Approved Dependency Direction

- Governance -> everything
- Planning intelligence -> change control
- Change control -> execution permission
- Auth/billing/account -> routing and execution permission
- Workspace surfaces -> may consume approved outputs, not define governance rules
- Browser/live-view -> may consume workspace state, not redefine platform trust rules
- Orchestration -> may coordinate approved systems, not override governance decisions

## Prohibited Dependency Direction

- Workspace UI -> direct billing rule changes
- Workspace UI -> direct auth rule changes
- Browser/live-view -> hidden routing rewrites
- Editor/live-view -> silent data model or entitlement changes
- Billing/auth changes -> opportunistic UI feature stacking
- Any runtime surface -> bypass of Delta-Analyzer or phase mapping

## Dependency Risk Notes

- `Auth`, `billing/account`, `routing`, and `backend governance` are trust-critical.
- `Workspace/project surfaces` are execution-critical.
- `Browser/live-view` and future editor layers are rebuild-sensitive because they can widen the change radius quickly.
- Requests touching trust-critical and execution-critical systems together should be treated as high-impact until proven otherwise.
