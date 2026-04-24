# Extraction Schema v1

## Purpose

The extraction schema formalizes the product truth Neroa must gather before roadmap drafting or execution.

## Canonical Record Shape

```text
ExtractionSnapshot
- request
- branch
- actors
- outcome
- scope
- workflow
- systems
- data
- integrations
- constraints
- risks
- assumptions
- contradictions
- unknowns
- confidence
```

## Required Categories

| Category | Required | Description |
| --- | --- | --- |
| Request identity | Yes | What was requested, by whom, in what context, and for what reason. |
| Primary branch classification | Yes | Which branch the request actually belongs to. |
| User / buyer / operator | Yes | Who the system serves first. |
| Core outcome | Yes | What must become true if the request succeeds. |
| MVP scope | Yes | What is in and out of scope for the current phase. |
| Workflow truth | Yes | The core workflow or sequence Neroa is trying to support. |
| Systems touched | Yes | Product, backend, auth, billing, routing, workspace, planning, governance, editor, live-view. |
| Data / integrations | Yes | External systems, data dependencies, and internal state assumptions. |
| Constraints | Yes | Budget, timeline, staffing, compliance, operational limits. |
| Success criteria | Yes | How success will be measured or recognized. |
| Assumptions | Yes | What Neroa is inferring rather than knowing. |
| Unknowns | Yes | What remains unresolved and needs more truth. |

## Field Status Model

Each critical extracted field must carry one status:

- `unanswered`: no usable truth captured yet
- `partial`: some truth exists, but it is not enough to make a stable decision
- `answered`: directly stated with adequate detail
- `inferred`: not directly stated, but reasonably derived from evidence
- `conflicting`: multiple signals disagree or produce incompatible implications
- `validated`: confirmed by later evidence or explicit human confirmation

## Confidence Model

- Field confidence: `0.00` to `1.00`
- Category confidence: average of its critical fields, adjusted down by contradiction severity
- Snapshot confidence: weighted roll-up across required categories
- Architecture confidence: separate governance score calculated later from extraction, consistency, dependency clarity, and phase clarity

## Critical Extraction Minimum

Roadmap work must not begin until all of the following are at least `partial` and above `0.60` confidence:

- branch
- user / buyer / operator
- core outcome
- MVP scope
- systems touched
- constraints

If any of those are `unanswered` or `conflicting`, extraction continues and execution is blocked.

## Output Contract

An extraction snapshot must answer:

1. What is the product or system being changed?
2. Who is it for?
3. What outcome matters first?
4. What is in-scope and out-of-scope?
5. Which branch does it belong to?
6. Which systems are touched?
7. What constraints limit execution?
8. Which facts are inferred rather than confirmed?
9. Which contradictions remain unresolved?
