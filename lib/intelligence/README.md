# Neroa Intelligence

This namespace is reserved for hidden intelligence layers that future chat and planning systems can depend on safely.

Current contents:
- `extraction/` for canonical extracted-truth state and readiness helpers
- `branching/` for deterministic branch classification, overlay activation, and branch-shift analysis
- `questions/` for deterministic next-question selection, anti-repetition handling, and readiness gating
- `adapters/` for hidden conversation-artifact normalization, extraction updates, branch/question recompute, and replayable intelligence bundling
- `runtime-bridge/` for read-only shadow mirroring of live `/start` planning traffic into the hidden intelligence stack and the env-gated visible strategist switch

This namespace does not, by itself, modify runtime product behavior.
