# Branch Classifier + Overlay Engine

This folder contains the hidden branch-classification and overlay engine for Neroa.

What it is:
- a deterministic classifier that reads extracted truth and estimates primary and secondary branches
- a hidden overlay engine that activates richer overlays from structured signals
- branch ambiguity, roadmap-readiness, and branch-shift helpers
- advisory architecture hints for future roadmap and Delta-Analyzer work

What it is not:
- it does not change visible `/start` behavior
- it is not wired into workspace, billing, auth, routing, or backend execution paths
- it is not a freeform LLM router
- it does not claim runtime governance or runtime enforcement

Primary future consumers:
- question selection engine work
- hidden `/start` state integration
- governance adapter inputs
- future branch-resolution prompts
- later roadmap-gating work

Design notes:
- primary and secondary branches are scored deterministically from extracted truth
- overlays use explicit activation states: inactive, possible, active, high-confidence active
- ambiguity and branch shifts remain explicit instead of being hidden behind one guessed label
- architecture hints are advisory only in this pass
