# Neroa Question Selection Engine

This folder contains the hidden deterministic question-selection layer for Neroa.

What it is:
- A non-runtime intelligence primitive that turns extraction state and branch state into a next-question decision.
- A structured candidate engine for contradictions, unknowns, partial truth, branch ambiguity, overlays, assumptions, and readiness transitions.
- A deterministic readiness-gating layer for roadmap and execution movement.

What it is not:
- It is not wired into visible `/start` behavior yet.
- It does not change chat wording, UI, routing, auth, billing, workspace behavior, or backend execution paths.
- It is not an LLM prompt bank or freeform response generator.

Future passes should use this layer by:
- feeding conversation artifacts into extraction state updates
- deriving branch state from extraction truth
- calling the question-selection engine read-only
- rendering the returned target and rationale later in a separate visible integration pass
