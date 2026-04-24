# Contradiction Detection Spec v1

## Purpose

Contradiction detection prevents Neroa from executing against incompatible truths.

## Contradiction Types

| Type | Description | Typical Response |
| --- | --- | --- |
| Scope contradiction | Request exceeds stated MVP or approved phase boundaries | Narrow scope or defer |
| Architecture contradiction | Request breaks dependency direction or system ownership | Block or require roadmap revision |
| Budget/timeline contradiction | Requested scope exceeds stated constraints | Re-scope or defer |
| MVP contradiction | Requested work introduces later-phase capability into current MVP | Defer or revise roadmap |

## Detection Sources

- extraction snapshot
- assumption ledger
- branch logic
- roadmap
- phase map
- dependency map
- scope boundaries
- current change request

## Severity

- `minor`: contradiction is local and easily clarified
- `moderate`: contradiction affects scope or sequencing
- `high`: contradiction changes phase mapping or rebuild radius
- `critical`: contradiction makes execution unsafe or architecturally incoherent

## Required Handling

1. Detect and classify the contradiction.
2. Link it to affected fields, systems, phases, and assumptions.
3. Reduce confidence accordingly.
4. Prevent execution if severity is high or critical.
5. Require either:
   - clarification,
   - roadmap revision,
   - deferral,
   - or full block.

## Non-Negotiable Rule

Neroa must not "work around" contradictions by coding a partial implementation first. Contradictions are resolved before execution, not after.
