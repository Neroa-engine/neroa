# Execution Gate Rules v1

## Purpose

After Delta-Analyzer and the Rebuild Impact Report are complete, Neroa may produce only one of four outcomes.

## Allowed Outcomes

### 1. Approved as-is

Use only when:

- the change is in-phase,
- the owning system is clear,
- architecture confidence meets the execution threshold,
- no roadmap revision is required,
- sequencing remains intact.

The current docs now include one promoted browser/runtime exception that can also be treated as in-phase:

- Browser Runtime Core V2
- Live Session Design Library Bridge

That promoted scope is Approved as-is when the implementation:

- uses one unified browser runtime core rather than layering a second runtime path beside the legacy bridge
- may replace the legacy Browser Runtime Bridge v1 now
- uses one shared live session for Browser and Design Library
- stays inside deterministic launch, attach, bind, reconnect, and tab/window targeting
- uses one command bus, one response lifecycle, one action registry, and one persistence/writeback contract
- implements real Inspect, truthful Record foundation, bounded AI walkthrough/test foundation, SOP/result output foundation, and project/library linkage
- does not introduce the full browser visual editor, unrestricted live rebuild tooling, or full autonomous orchestration.

### 2. Approved but roadmap must be updated first

Use when:

- the change is coherent,
- the change is high-impact or cross-phase,
- roadmap or phase assignments must change before implementation,
- the request should proceed only after architecture is updated.

### 3. Deferred to later phase

Use when:

- the request is legitimate,
- but its primary phase is not currently active,
- or it would inject future-phase capability into current execution.

Browser/live-view or Design Library work that goes beyond the promoted Browser Runtime Core V2 / Live Session Design Library Bridge scope still falls into this outcome.

### 4. Blocked because it causes architectural conflict

Use when:

- the request contradicts branch logic,
- the request breaks system boundaries,
- sequencing would become incoherent,
- architecture confidence is below the minimum threshold,
- or the request introduces an unresolved critical contradiction.

## Non-Negotiable Rule

No fifth outcome exists. Neroa should not invent "soft approval", "temporary bypass", or "just do a small version" when the gate result is defer or block.
