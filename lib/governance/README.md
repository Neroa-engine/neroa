# Neroa Typed Governance Scaffolding v1

This folder contains typed, reusable governance primitives that mirror GOV-001 and GOV-002.

It exists to make the governance model structurally usable in code. It does not, by itself, enforce runtime behavior.

## What This Is

- stable literal sets for governance vocabulary
- typed data shapes for extraction, Delta analysis, rebuild impact reporting, assumptions, contradictions, roadmap revision, and phase mapping
- lightweight non-runtime validation guards
- a single import surface for future governance and intelligence work
- a deterministic read-only governance runner and example fixtures for isolated analysis

## What This Is Not

- live runtime enforcement
- a connected part of `/start`, workspace, auth, billing, routing, or backend execution flows
- a permission system
- a feature implementation layer

## Intended Future Consumers

- a read-only governance runner
- deterministic governance analysis in isolation
- extraction engine implementations
- Delta-Analyzer implementations
- Rebuild Impact Report generators
- future internal governance forms or tooling

## Usage

Import governance primitives from:

- `@/lib/governance`

Until a later pass explicitly wires these primitives into runtime or tooling, they remain structural scaffolding only.
