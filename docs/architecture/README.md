# Neroa Architecture Pack v1

This folder is the architectural source of truth for Neroa's quality-first operating model.

It defines what must be true before execution begins. It does not enforce runtime behavior by itself. Runtime enforcement, if desired later, must be implemented explicitly in product or platform code.

## Canonical Read Order

1. [Architectural Roadmap v1](./architectural-roadmap-v1.md)
2. [Phase Map v1](./phase-map-v1.md)
3. [Dependency Map v1](./dependency-map-v1.md)
4. [Scope Boundaries v1](./scope-boundaries-v1.md)
5. [Governance Pack v1](../governance/README.md)

## Operating Principle

No future feature work should proceed unless it has:

1. passed extraction sufficiency,
2. been checked by Delta-Analyzer,
3. been mapped to an approved phase,
4. received the correct execution-gate outcome.

## Current Program State

- Active governance baseline: Phases 0 through 3
- Controlled maintenance only: Phase 4
- Current promoted exception: Browser Runtime Core V2 and Live Session Design Library Bridge may proceed now inside current execution scope when they replace the legacy browser runtime core with one shared runtime system, preserve canonical session/library truth, and stay short of the full browser visual editor or full autonomous orchestration layers. See [Browser Runtime Bridge Promotion v1](../governance/browser-runtime-bridge-promotion-v1.md).
- Future phases: Phases 5 and 6

Anything that falls outside the active baseline must be deferred or routed through roadmap revision before implementation.
