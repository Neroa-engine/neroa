# Rebuild Impact Report Spec v1

## Purpose

The Rebuild Impact Report is the required output after Delta-Analyzer. It makes the decision visible before execution begins.

## Required Output Format

Each report must contain the following sections in this order:

1. `Requested Change`
2. `Affected Phases`
3. `Affected Systems`
4. `Dependencies Touched`
5. `Impact Category`
6. `Risk Level`
7. `Change Type`
8. `Roadmap Revision Required`
9. `Execution Status`
10. `What Must Be Rebuilt`
11. `What Can Remain Untouched`
12. `Regression Risk`
13. `Assumptions Affected`
14. `Contradictions Triggered`

## Required Field Meanings

- `Impact Category`: local, medium, high, architectural
- `Risk Level`: low, moderate, high, critical
- `Change Type`: additive, modifying, destructive
- `Execution Status`: Approved as-is, Approved but roadmap must be updated first, Deferred to later phase, Blocked because it causes architectural conflict

## Canonical Template

```text
Requested Change:
Affected Phases:
Affected Systems:
Dependencies Touched:
Impact Category:
Risk Level:
Change Type:
Roadmap Revision Required:
Execution Status:
What Must Be Rebuilt:
What Can Remain Untouched:
Regression Risk:
Assumptions Affected:
Contradictions Triggered:
```

## Usage Rules

1. No execution begins without this report.
2. If the report marks `Roadmap Revision Required: yes`, roadmap work happens before code work.
3. If the report marks `Execution Status: Deferred to later phase` or `Blocked because it causes architectural conflict`, implementation does not begin.
4. If the report marks `Execution Status: Approved but roadmap must be updated first`, roadmap work happens before implementation.
5. The report must separate what truly needs rebuilding from what should remain untouched, so Neroa avoids broad hidden regressions.
