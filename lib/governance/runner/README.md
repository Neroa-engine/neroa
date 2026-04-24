# Governance Runner

This folder contains the read-only governance runner introduced after GOV-003.

What it does:
- accepts a structured governance request payload
- builds an Extraction Snapshot
- runs deterministic Delta-Analyzer logic
- generates a Rebuild Impact Report
- returns an Execution Gate Decision using the four approved outcomes only

What it does not do:
- it does not change runtime product behavior
- it is not wired into `/start`, workspace flows, auth, billing, routing, or backend execution
- it does not enforce governance inside live product flows yet

Primary entry point:
- `runGovernanceAnalysis(input)`

Recommended future use:
- read-only governance runners
- extraction-engine integration work
- Delta-Analyzer implementation work
- Rebuild Impact Report generation

This namespace is intentionally deterministic and side-effect free so later governance and intelligence passes can depend on it safely.
