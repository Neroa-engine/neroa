# Neroa Governance Pack v1

This folder defines the governance chain that future Neroa work must follow before execution.

The governance chain is:

`User Request -> Delta-Analyzer -> Rebuild Impact Report -> Roadmap Adjustment if needed -> Phase Mapping -> Execution Gate -> Execution`

These documents are durable governance guidance. They do not claim runtime enforcement unless runtime enforcement code is implemented later.

## Canonical Read Order

1. [Extraction Schema v1](./extraction-schema-v1.md)
2. [Strategy Extraction Framework v1](./strategy-extraction-framework-v1.md)
3. [Branch Logic Map v1.1](./branch-logic-map-v1.1.md)
4. [Question Selection Engine Spec v1](./question-selection-engine-spec-v1.md)
5. [Architecture Confidence Rules v1](./architecture-confidence-rules-v1.md)
6. [Assumption Ledger Spec v1](./assumption-ledger-spec-v1.md)
7. [Contradiction Detection Spec v1](./contradiction-detection-spec-v1.md)
8. [Delta-Analyzer Spec v1](./delta-analyzer-spec-v1.md)
9. [Rebuild Impact Report Spec v1](./rebuild-impact-report-spec-v1.md)
10. [Execution Gate Rules v1](./execution-gate-rules-v1.md)
11. [Rebuild Trigger Matrix v1](./rebuild-trigger-matrix-v1.md)
12. [Open Questions / Unknowns Register v1](./open-questions-unknowns-register-v1.md)
13. [Governance Templates v1](./templates/README.md)
14. Optional lightweight schemas in `./schemas/*`
15. [Browser Runtime Bridge Promotion v1](./browser-runtime-bridge-promotion-v1.md)

## Non-Negotiable Rule

No functional execution should begin until a change has:

1. sufficient extracted truth,
2. current branch classification,
3. Delta-Analyzer output,
4. Rebuild Impact Report output,
5. phase assignment,
6. execution-gate outcome.

## Operating Assets

Reusable manual and future programmatic working assets now live under:

- [templates/README.md](./templates/README.md)
- `schemas/*`

## Current Promoted Exception

The governance pack now carries one explicit promoted exception:

- Browser Runtime Core V2
- Live Session Design Library Bridge

See [Browser Runtime Bridge Promotion v1](./browser-runtime-bridge-promotion-v1.md) for the approved scope, rebuild impact summary, execution order, and the boundary that still keeps the full browser visual editor and full autonomous orchestration future-scoped.

These assets are helpers for applying the governance model. They do not by themselves implement runtime enforcement.
