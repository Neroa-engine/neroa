# Assumption Ledger Spec v1

## Purpose

The assumption ledger stores inferred truths separately from confirmed truths so Neroa can act carefully without pretending uncertainty does not exist.

## Required Ledger Fields

| Field | Description |
| --- | --- |
| Assumption ID | Stable identifier |
| Statement | The inferred truth |
| Category | Which extraction category it belongs to |
| Source evidence | What user input or artifact led to the inference |
| Confidence | `0.00` to `1.00` confidence score |
| Status | open, validated, invalidated, replaced |
| Affected systems | Which systems depend on this assumption |
| Affected phases | Which phases would be impacted if wrong |
| Expiry trigger | What new information would force re-check |
| Owner | Who must resolve it |

## Rules

1. Inferred truth must be logged instead of silently upgraded to fact.
2. Any assumption that affects branch choice, roadmap shape, phase mapping, auth/billing, routing, or workspace execution is high-sensitivity.
3. High-sensitivity assumptions must be revisited before execution.
4. If a request invalidates an existing assumption, Delta-Analyzer must re-run.

## Lifecycle

1. Create assumption when truth is inferred.
2. Link it to affected phases and systems.
3. Use it to calculate confidence penalties.
4. Validate or invalidate it when new evidence arrives.
5. If invalidated, re-run contradiction detection and impact analysis.

## Invalidating an Assumption

When an assumption is invalidated:

1. mark it `invalidated`,
2. identify all dependent roadmap and phase decisions,
3. trigger Delta-Analyzer again,
4. update the Rebuild Impact Report if execution was pending.
