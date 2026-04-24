# Neroa Agent Operating Rules

This repository follows the Neroa Architecture and Governance Pack v1.

Canonical governance docs:

- [docs/architecture/README.md](/C:/Users/Administrator/Documents/GitHub/neroa/docs/architecture/README.md)
- [docs/governance/README.md](/C:/Users/Administrator/Documents/GitHub/neroa/docs/governance/README.md)

These docs are the source of truth for future execution planning. They do not themselves implement runtime enforcement.

## Mandatory Pre-Execution Chain

Before any non-doc feature or product change is implemented, the task must pass through this chain:

1. validate against the Architectural Roadmap
2. run Delta-Analyzer
3. produce a Rebuild Impact Report
4. revise the roadmap first if the report requires it
5. map the work to a phase
6. apply the execution gate
7. only then begin execution

## Current Promoted Exception

The current docs explicitly promote the Browser Runtime Core V2 workstream into executable scope after the normal governance chain completes:

- Browser Runtime Core V2
- Live Session Design Library Bridge

This promotion is valid when the implementation:

- may replace the legacy Browser Runtime Bridge v1 now
- uses one unified browser runtime core across Command Center, Live View, sidepanel, service worker, and content script surfaces
- reuses valid existing session truth, tokenized launch/auth, inspection truth separation, and project/library/QC destination contracts where they remain sound
- implements deterministic browser open/attach/bind/tab targeting, unified command/response lifecycle, real Inspect, truthful Record foundation, bounded AI walkthrough/test foundation, SOP/result output foundation, and project/library linkage
- lets Design Library run against that same live session for staged preview/package updates only

This promotion does **not** promote the full browser visual editor or the full autonomous orchestration layer. The following remain future-scoped:

- full browser visual editor
- arbitrary click-to-edit or unrestricted DOM mutation tooling
- live rebuild orchestration
- unbounded AI visual QC automation and multi-system autonomous delivery
- a second browser or design-preview runtime path

## Durable Rules

1. No functional code generation before Architectural Roadmap validation.
2. Every feature must be phase-mapped before execution.
3. Every requested change must trigger Delta-Analyzer first.
4. High-impact changes require roadmap revision before execution.
5. Out-of-phase requests are deferred, not force-inserted.
6. Execution is blocked when architecture confidence is below threshold.
7. No runtime product surface may silently redefine governance, branch ownership, or phase ownership.
8. No trust-layer change in auth, billing, account, entitlement, or protected routing should be treated as a casual local patch.

## Scope Discipline

- Do not drift from a governance task into feature implementation.
- Do not bundle "while we are here" product changes across system boundaries.
- Do not claim runtime governance exists unless runtime enforcement code has actually been built.

## Documentation-Only Exception

If the user explicitly asks for a docs-only or governance-only pass, keep changes limited to:

- `docs/architecture/*`
- `docs/governance/*`
- `AGENTS.md`
- other explicitly requested non-runtime guidance files

Do not modify runtime product behavior during that kind of pass.
