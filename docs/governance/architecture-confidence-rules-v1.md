# Architecture Confidence Rules v1

## Purpose

Architecture confidence determines whether Neroa has enough stable truth to move from extraction to roadmap, from roadmap to phase mapping, and from phase mapping to execution.

## Confidence Dimensions

| Dimension | Weight | Meaning |
| --- | --- | --- |
| Truth completeness | 25 | Are critical product truths sufficiently captured? |
| Consistency | 20 | Do the captured truths agree with each other? |
| Branch certainty | 15 | Is the primary branch stable? |
| Dependency clarity | 15 | Are affected systems and dependencies understood? |
| Phase clarity | 15 | Is the owning phase clear and coherent? |
| Delivery feasibility | 10 | Can the requested work fit stated constraints? |

## Thresholds

| Decision | Minimum Overall | Critical Conditions |
| --- | --- | --- |
| Extraction sufficiency | 65 | No critical category below 60 and no unresolved critical contradiction |
| Roadmap drafting | 72 | Branch certainty at least 70 and phase direction not ambiguous |
| Phase mapping | 78 | Dependency clarity at least 75 and touched systems enumerated |
| Execution eligibility | 85 | No critical contradiction and no trust-layer ambiguity |

## Blocking Rules

Execution is blocked when:

- overall architecture confidence is below `85`,
- any critical dimension is below `80` during execution review,
- the primary branch is unstable,
- contradiction severity is critical,
- dependency clarity is too low to predict rebuild radius safely.

## Interpretation

- `0-64`: insufficient truth, continue extraction
- `65-71`: enough truth to structure the problem, but not enough for execution planning
- `72-77`: roadmap can be drafted, but phase mapping is still provisional
- `78-84`: phase mapping can be produced, but execution is still blocked
- `85-100`: execution may be considered if all other gate conditions pass

## Governance Rule

Confidence is not a vibe. It is a gating value tied to evidence, contradictions, and system clarity. If the score is below threshold, execution does not begin.

## Current Promoted Browser Runtime Note

The current-promoted Browser Runtime Core V2 scope is treated as phase-clear for execution when:

- the request stays inside the promoted Browser Runtime Core V2 / Live Session Design Library Bridge boundaries,
- one unified browser runtime core is used,
- current runtime truth wins over stale history,
- project/library linkage reuses the canonical output contracts,
- and the implementation does not expand into the full browser visual editor or full autonomous orchestration layers.

For that promoted workstream, phase clarity is satisfied by the roadmap and promotion-note revisions that explicitly assign Browser Runtime Core V2 to current execution scope.
