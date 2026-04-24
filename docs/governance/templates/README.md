# Neroa Governance Templates v1

This folder contains reusable operating assets for the governance model defined in GOV-001.

These templates are practical working forms. They help teams apply the governance rules consistently, but they do not themselves enforce runtime behavior.

## Recommended Workflow

Use the templates in this order:

1. User Request
2. [Extraction Snapshot Template](./extraction-snapshot-template.md)
3. [Delta-Analyzer Worksheet Template](./delta-analyzer-worksheet-template.md)
4. [Rebuild Impact Report Template](./rebuild-impact-report-template.md)
5. [Roadmap Revision Record Template](./roadmap-revision-record-template.md) if needed
6. [Phase Mapping Decision Template](./phase-mapping-decision-template.md)
7. [Execution Gate Decision Template](./execution-gate-decision-template.md)
8. Only then execution

Supporting templates used during the chain:

- [Assumption Ledger Entry Template](./assumption-ledger-entry-template.md)
- [Contradiction Register Entry Template](./contradiction-register-entry-template.md)
- [Open Questions Entry Template](./open-questions-entry-template.md)

## When To Use Each Template

### Extraction Snapshot Template

Use first when the request still needs product truth capture, branch clarification, or scope clarification before roadmap work.

### Delta-Analyzer Worksheet Template

Use for every requested change after extraction is sufficient enough to analyze change impact.

### Rebuild Impact Report Template

Use immediately after Delta-Analyzer to produce the formal decision-facing report.

### Roadmap Revision Record Template

Use only when the requested change is high-impact or architectural enough to require a controlled roadmap update.

### Phase Mapping Decision Template

Use after impact is understood to assign the work to the correct current or future phase.

### Execution Gate Decision Template

Use last. This is the final non-runtime governance decision before any execution begins.

### Assumption Ledger Entry Template

Use whenever Neroa infers a truth instead of receiving direct confirmation.

### Contradiction Register Entry Template

Use whenever extracted truth, roadmap logic, branch logic, or system boundaries conflict.

### Open Questions Entry Template

Use whenever unresolved product or architecture truth still needs a human answer.

## Practical Notes

- Fill these manually now or programmatically later.
- Keep terminology aligned with GOV-001:
  - statuses: `unanswered`, `partial`, `answered`, `inferred`, `conflicting`, `validated`
  - impact categories: `local`, `medium`, `high`, `architectural`
  - execution outcomes: `Approved as-is`, `Approved but roadmap must be updated first`, `Deferred to later phase`, `Blocked because it causes architectural conflict`
- If a template output conflicts with the source-of-truth docs in `docs/architecture/` or `docs/governance/`, update the template usage, not the runtime product.
