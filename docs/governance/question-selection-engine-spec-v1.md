# Question Selection Engine Spec v1

## Purpose

The Question Selection Engine chooses the next best question needed to increase product truth, reduce contradictions, and decide when enough truth exists to move to roadmap work.

## Inputs

- latest extraction snapshot
- field statuses
- field confidence scores
- branch classification
- active contradictions
- assumption ledger
- recent question history
- current roadmap status, if one exists

## Field State Definitions

- `unanswered`: the field has no usable truth
- `partial`: a direction exists, but an execution-relevant gap remains
- `answered`: enough direct truth exists for current decision needs
- `inferred`: accepted temporarily from evidence, but still traceable as an assumption
- `conflicting`: multiple signals produce incompatible decisions
- `validated`: confirmed later by explicit evidence or human confirmation

## Selection Priority

The engine must choose the next question in this order:

1. Resolve critical contradictions.
2. Fill unanswered critical categories.
3. Tighten partial critical categories.
4. Confirm high-dependency inferred truths.
5. Resolve branch ambiguity.
6. Resolve sequencing blockers that prevent roadmap drafting.
7. Refine lower-risk details only after the above are stable.

## Repetition Avoidance

The engine must avoid repeating a question if:

- the same category was just answered adequately,
- the answer did not change the field status,
- no contradiction or confidence drop re-opened the topic.

The engine may re-ask only when:

- an earlier answer was partial,
- a contradiction was detected,
- a prior inference needs explicit confirmation,
- a branch shift is possible,
- a high-impact request now depends on the field.

## Partial Answer Handling

When a user gives a partial answer, the engine must:

1. mark the field `partial`,
2. store the answered portion,
3. identify the smallest remaining decision gap,
4. ask only for the missing part instead of resetting the whole category.

## Enough Truth To Move To Roadmap

The engine may stop asking extraction questions and permit roadmap drafting only when:

1. all critical categories are at least `answered` or `inferred`,
2. branch confidence is stable,
3. no unresolved critical contradiction remains,
4. architecture confidence meets the roadmap threshold,
5. phase candidates can be named without ambiguity.

If those conditions are not met, roadmap work remains blocked.

## Output

Each decision cycle should produce:

- `nextQuestion`
- `targetCategory`
- `reason`
- `blockedBy`
- `expectedConfidenceGain`

The engine is not allowed to ask "nice to know" questions while critical contradictions or unanswered critical categories still exist.
