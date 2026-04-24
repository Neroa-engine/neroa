# Branch Logic Map v1.1

## Purpose

This file defines Neroa's primary branch system so product requests can be classified before roadmap or execution.

## Primary Branches

| Branch | Core Shape | Typical First Truth |
| --- | --- | --- |
| Commerce / Ecommerce | Catalog, checkout, conversion, fulfillment | What is being sold, to whom, and through which buying flow? |
| SaaS / Workflow Platform | Recurring software, user workflows, permissions | What ongoing workflow or job must the software support? |
| Marketplace / Multi-Sided Platform | Supply side, demand side, matching, trust | Which sides exist and how are they matched or governed? |
| Internal Operations / Backoffice Tool | Internal users, ops workflows, efficiency | Which internal workflow needs to become more reliable or faster? |
| Content / Community / Membership | Content publishing, community access, recurring membership value | What content/community loop creates value and retention? |
| Booking / Scheduling / Service Delivery | Time slots, staff capacity, service flow | What service gets booked, delivered, and tracked? |
| Hybrid / Composite System | More than one branch is genuinely first-class | Which branch is primary, and what secondary branch changes the model? |
| Developer Platform / API / Infrastructure | APIs, environments, developer workflows, reliability | What developer capability or infrastructure contract is the product offering? |
| Data / Analytics / Intelligence Platform | Data flows, analysis, recommendations, insight loops | What data asset or intelligence output creates the product's value? |

## Overlay Logic

Overlays do not replace the primary branch. They modify it.

Approved overlay types:

- `automation-ai`
- `commerce`
- `multi-tenant-collaboration`
- `content-community`
- `admin-backoffice`
- `browser-live-view`
- `data-intelligence`

Overlay rules:

1. Every request must have one primary branch.
2. A request may carry up to two overlays without becoming hybrid by default.
3. If more than two overlays are required to explain the product, Delta-Analyzer must test for a Hybrid / Composite shift.
4. Overlays add requirements; they do not redefine the core branch economics or workflow.

## Branch Shift Rules

A branch shift is triggered when any of the following become true:

1. The primary user, buyer, or operator changes.
2. The dominant value loop changes.
3. The core workflow changes enough that the current branch no longer explains the system.
4. More than 40 percent of critical capabilities belong to another branch.
5. The current branch creates repeated contradictions in roadmap or phase mapping.

Branch shift handling:

1. Mark current branch as unstable.
2. Re-run extraction against branch-critical categories.
3. Run Delta-Analyzer with branch shift flagged.
4. Require roadmap revision before execution.
5. Remap touched phases.

## Hybrid / Composite Rule

Hybrid / Composite is allowed only when:

- one primary branch remains identifiable,
- the secondary branch materially changes the system architecture,
- both branches are explicitly represented in the roadmap.

Hybrid is not a shortcut for unclear thinking. If the primary branch is not stable, extraction is still incomplete.
