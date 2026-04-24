# Open Questions / Unknowns Register v1

## Purpose

This register records the governance decisions that still require human product leadership, rather than pretending the architecture model is fully settled.

| Question | Why It Matters | Affects | Needed By |
| --- | --- | --- | --- |
| Who is the human approver for roadmap revisions? | Governance needs a real approval owner for high-impact changes. | Phases 2 through 6 | Before runtime governance tooling |
| What exact active product phase should be locked for the next delivery window? | Deferral rules need one explicit current delivery focus. | Phase map and execution gating | Before broad feature intake resumes |
| Where should extraction snapshots, assumptions, contradictions, and impact reports live at runtime? | Durable governance records need an eventual system of record. | Backend governance | Before runtime enforcement |
| Should Delta-Analyzer be advisory first or hard-blocking once implemented? | Affects the future rollout path for runtime governance. | Phases 2 and 4 | Before enforcement code |
| How many overlays are allowed before a product must be treated as Hybrid / Composite? | Needed for branch classification consistency. | Phases 1 and 2 | Before advanced branch automation |
| What is the escalation path when confidence remains below threshold but the request is urgent? | Needed to handle pressure without bypassing governance. | Execution gates | Before runtime enforcement |
| Which trust-layer changes always require human sign-off? | Auth, billing, routing, and entitlement changes carry disproportionate risk. | Phase 4 | Before platform hardening work |
| Where should the future browser visual editor sit relative to live-view? | Needed to prevent overlap between Phase 5 systems. | Phase 5 | Before editor work starts |
| When does the orchestration layer become eligible to move from future to active roadmap? | Prevents premature system-layer expansion. | Phase 6 | Before orchestration implementation |

## Governance Rule

If an unknown changes phase mapping, branch stability, trust boundaries, or execution eligibility, it is not a footnote. It must be surfaced during Delta analysis and reflected in the impact report.
