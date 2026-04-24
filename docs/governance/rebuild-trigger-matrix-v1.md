# Rebuild Trigger Matrix v1

## Purpose

This matrix gives concrete examples of low, medium, high, and architectural changes across Neroa branches. It does not replace Delta-Analyzer; it helps standardize initial classification.

| Branch | Low | Medium | High | Architectural |
| --- | --- | --- | --- | --- |
| Commerce / Ecommerce | adjust copy inside existing product page | add a new purchase step inside existing checkout flow | change fulfillment model or entitlement behavior | shift from store to marketplace economics |
| SaaS / Workflow Platform | tweak one approved workflow screen | add a new workflow step touching existing state | change permissions, tenant model, or execution sequencing | shift from single workflow tool to multi-branch platform |
| Marketplace / Multi-Sided Platform | adjust one side's content or onboarding text | add a new trust or matching rule | change payout, trust, or cross-side workflow logic | change core side structure or matching model |
| Internal Operations / Backoffice Tool | change one internal report field | add an approval step to an existing ops flow | change internal workflow ownership or system-of-record behavior | convert internal tool into external product or platform |
| Content / Community / Membership | add content within current model | add a gated membership state or moderation rule | change access, retention, or community governance logic | shift from content product to workflow or marketplace model |
| Booking / Scheduling / Service Delivery | adjust a service detail field | add new scheduling rule or service constraint | change capacity, availability, or delivery model | change from service delivery to marketplace or SaaS core |
| Hybrid / Composite System | refine one already-approved hybrid edge | add a second-system dependency within approved roadmap | rebalance primary and secondary branch responsibilities | primary branch changes or hybrid becomes unstable |
| Developer Platform / API / Infrastructure | add docs for existing API capability | add one new endpoint within stable contract | change authentication, versioning, or reliability contract | change platform model, ownership boundaries, or core contract |
| Data / Analytics / Intelligence Platform | add one report field | add new derived metric or recommendation input | change data model, pipeline ownership, or access model | change core intelligence product shape or data ownership model |

## Usage Rule

If a request matches `high` or `architectural`, roadmap revision must be considered before execution. If a request crosses branches or trust boundaries, treat it as at least `high` until Delta-Analyzer proves otherwise.
