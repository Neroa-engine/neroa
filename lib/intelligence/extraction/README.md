# Extraction Engine Core

This folder contains the hidden extracted-truth state engine for Neroa.

What it is:
- a canonical extraction state object for product truth
- deterministic field status and confidence handling
- assumption, contradiction, and unknown tracking
- readiness evaluation for roadmap and execution movement
- non-runtime helpers that future intelligence layers can build on

What it is not:
- it does not change visible `/start` behavior
- it is not wired into workspace, billing, auth, routing, or backend execution flows
- it is not a live chat extractor yet
- it does not claim runtime governance or runtime intelligence enforcement

Primary future consumers:
- branch classifier work
- question selection engine work
- hidden `/start` state integration
- governance adapter inputs
- later planning intelligence passes

Design notes:
- field state transitions are explicit, not automatic magic
- inferred truth remains traceable through assumptions and evidence
- contradictions and unknowns lower readiness instead of being ignored
- readiness is deterministic and internal, not user-facing
