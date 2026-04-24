# Delta-Analyzer Worksheet Template

Use this as the mandatory first change-analysis worksheet after extraction is sufficiently complete.

This worksheet informs the final gate decision. It does not itself grant final execution approval.

## Worksheet Metadata

- Worksheet ID:
- Date:
- Prepared by:
- Linked extraction snapshot:
- Related request / ticket:

## 1. Requested Change

- Requested change:
- Request origin:
  - [ ] User request
  - [ ] Bug / regression
  - [ ] Roadmap follow-up
  - [ ] Internal architecture change
  - [ ] Other:
- Reason for request:

## 2. Current Architecture Context

- Current approved phase:
- Current branch:
- Current roadmap assumption:
- Current owning system:

## 3. Phase Impact

- Primary phase touched:
- Secondary phases touched:
- Future phases touched:
- Does the request stay inside the current phase?
  - [ ] Yes
  - [ ] No
- Sequencing broken if inserted now?
  - [ ] No
  - [ ] Yes

## 4. Systems and Dependencies

- Affected systems:
- Dependencies touched:
- Dependency direction crossed:
  - [ ] No
  - [ ] Yes
- Trust-layer impact:
  - [ ] None
  - [ ] Auth
  - [ ] Billing / account
  - [ ] Protected routing
  - [ ] Backend governance

## 5. Assumptions and Contradictions

- Assumptions affected:
- Existing assumptions invalidated:
- Contradiction risk:
  - [ ] Minor
  - [ ] Moderate
  - [ ] High
  - [ ] Critical
- Contradictions introduced or worsened:

## 6. Rebuild Radius and Risk

- Rebuild radius:
  - [ ] Local
  - [ ] Medium
  - [ ] High
  - [ ] Architectural
- Regression exposure:
- Architecture confidence result (`0-100`):
- Confidence threshold met for execution eligibility:
  - [ ] Yes
  - [ ] No

## 7. Analyzer Classification

- Impact category:
  - [ ] local
  - [ ] medium
  - [ ] high
  - [ ] architectural
- Roadmap revision required:
  - [ ] Yes
  - [ ] No
- Preliminary execution status at analyzer stage:
  - [ ] Allowed to proceed to Rebuild Impact Report and gate review
  - [ ] Blocked pending clarification or roadmap revision
- Recommended gate outcome:
  - [ ] Approved as-is
  - [ ] Approved but roadmap must be updated first
  - [ ] Deferred to later phase
  - [ ] Blocked because it causes architectural conflict

## 8. Recommended Next Action

- Recommended next action:
- Why:
- Linked records to create or update:
  - [ ] Rebuild Impact Report
  - [ ] Roadmap Revision Record
  - [ ] Phase Mapping Decision
  - [ ] Assumption Ledger Entry
  - [ ] Contradiction Register Entry
  - [ ] Open Questions Entry
