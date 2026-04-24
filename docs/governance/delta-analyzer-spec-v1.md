# Delta-Analyzer Spec v1

## Purpose

Delta-Analyzer is the mandatory first analysis step for every requested change. Its job is to determine what exactly is changing, what gets touched, whether sequencing breaks, and whether execution is allowed at all.

## Inputs

- current user request
- current extraction snapshot
- current roadmap
- current phase map
- dependency map
- scope boundaries
- assumption ledger
- contradiction register
- current known system ownership

## Required Questions

Delta-Analyzer must answer:

1. What exactly is changing?
2. Which system owns that change?
3. Which phases are touched?
4. Which assumptions are affected?
5. Which dependencies are crossed?
6. Does the request stay inside the current phase?
7. Does sequencing break if this change is inserted now?
8. Is the change local, medium, high, or architectural?

## Required Checks

- phase ownership check
- system boundary check
- branch stability check
- dependency direction check
- contradiction amplification check
- assumption invalidation check
- trust-layer impact check
- rebuild radius check
- regression exposure check
- architecture confidence threshold check

## Impact Categories

- `local`: one owned system, no roadmap change, no cross-phase sequencing risk
- `medium`: multiple related systems or one sensitive boundary, but still governable without architectural rewrite
- `high`: trust-layer or multi-phase impact, likely requires roadmap revision before execution
- `architectural`: branch shift, system-boundary rewrite, dependency inversion, or major sequencing conflict

## Output

Delta-Analyzer must emit:

- requested change summary
- primary phase
- secondary phases touched
- owning systems
- dependencies touched
- assumptions affected
- contradictions introduced or worsened
- impact category
- architecture confidence result
- recommendation for gate outcome

## Gating Rule

Delta-Analyzer does not approve execution on its own. It produces the analysis that feeds the Rebuild Impact Report and the execution gate.

If architecture confidence is below the execution threshold, Delta-Analyzer must recommend `blocked` or `roadmap update first`, never `approved as-is`.
