# Neroa Runtime Bridge

This namespace contains the read-only shadow integration layer for live planning traffic.

What it does:
- mirrors completed `/start` planning-thread artifacts into the hidden intelligence stack
- rebuilds extraction, branch, and question-selection state in the background
- carries the aligned hidden strategy-framework output inside the canonical bundle and trace snapshots
- compares the live visible next-question behavior against the hidden deterministic selector
- classifies mismatch hotspots and produces a hidden replacement-readiness report from accumulated shadow traces
- stores traceable shadow results in a lightweight in-memory server cache
- supports an env-gated visible strategist adapter for `/start` that can consume hidden question selection with strict fallback

What it does not do:
- it does not replace visible `/start` replies
- it does not change tone, wording, sequencing, or UI
- it does not block the live runtime path
- it does not claim runtime governance enforcement

Current scope:
- `start-shadow.ts` provides the read-only `/start` shadow entry point
- `comparison.ts` provides deterministic live-vs-hidden question comparison helpers
- `report.ts` aggregates shadow traces into a readiness decision and smallest-safe replacement recommendation
- `store.ts` provides a lightweight in-memory trace/session cache for debug and verification
- `visible-strategist.ts` provides the env-gated visible strategist switch and safe fallback metadata

Future passes should use this layer for hidden comparison and verification first, then decide whether any visible strategist replacement is justified later.
