# Strategy Extraction Framework v1

## Purpose

This document defines the hidden extraction contract that should sit behind Neroa's intelligent planning chat.

The chat should remain open-conversation in feel, but it must not rely on raw transcript text as the project record. Neroa should extract structured truth, identify missing truth, branch intelligently, and only hand off to roadmap or workspace surfaces when the minimum data gate is satisfied.

This document extends the governance pack. It does not by itself implement runtime behavior.

## Governance Result

### Roadmap validation

- Validated against [Architectural Roadmap v1](../architecture/architectural-roadmap-v1.md).
- Primary phase owner: **Phase 1 - Product Truth Capture**.
- Secondary phase touched: **Phase 2 - Roadmap and Change Control**.
- Not engaged in this pass:
  - Phase 3 runtime execution surfaces
  - Phase 4 auth, billing, account, entitlement, or protected routing
  - Phase 5 browser visual editor and live rebuild tooling
  - Phase 6 orchestration/autonomous delivery
- Roadmap revision required: **no**.

### Delta-Analyzer result

- Requested change: define the Strategy Extraction Framework v1 for Neroa intelligent planning chat, including extraction schema, branching rules, required truths, optional enrichments, exit criteria, minimum data gate, and structured output objects.
- Owning systems:
  - governance docs
  - planning intelligence specs
  - extraction schema rules
  - branch/question-selection rules
  - planning-to-workspace handoff contract
- Dependencies touched:
  - Extraction Schema v1
  - Branch Logic Map v1.1
  - Question Selection Engine Spec v1
  - Architecture Confidence Rules v1
  - Rebuild Impact Report Spec v1
  - Execution Gate Rules v1
- Impact category: **medium**
- Architecture confidence result: **high**
- Recommendation for gate outcome: **Approved as-is** for docs/spec work only.

### Rebuild Impact Report result

Requested Change:
Define the Strategy Extraction Framework v1 for Neroa intelligent planning chat so product truth is extracted structurally before roadmap or workspace handoff.

Affected Phases:
Phase 1 primary, Phase 2 secondary.

Affected Systems:
Governance docs, planning intelligence specifications, extraction readiness rules, handoff gating rules.

Dependencies Touched:
Extraction schema, branch logic, question-selection logic, architecture confidence thresholds, roadmap/handoff governance.

Impact Category:
medium

Risk Level:
moderate

Change Type:
additive and modifying

Roadmap Revision Required:
no

Execution Status:
Approved as-is

What Must Be Rebuilt:
The planning-chat extraction contract, required-truth model, and minimum handoff gate in documentation/spec form.

What Can Remain Untouched:
Runtime chat UI, `/start` behavior, Build Room transport, Browser Runtime Bridge, Command Center UI, outer portal, auth/billing/platform trust logic.

Regression Risk:
Low in this pass because no runtime behavior is changed.

Assumptions Affected:
The current assumption that a heuristic summary or raw conversation can stand in for project truth is no longer acceptable under this framework.

Contradictions Triggered:
None introduced by this docs-only pass. The framework instead exposes existing product contradictions earlier.

### Phase assignment

- Primary phase: **Phase 1 - Product Truth Capture**
- Secondary phase: **Phase 2 - Roadmap and Change Control**
- Phase mapping rationale:
  - the work defines what must be extracted from the conversation,
  - how the conversation branches when truth is incomplete,
  - and when roadmap/workspace outputs may legally be produced.

### Execution-gate outcome

- Outcome: **Approved as-is**
- Scope of approval:
  - docs/governance specification work
  - future docs-backed schema/interface alignment in a separate in-phase pass
- Not approved in this pass:
  - runtime chat logic changes
  - workspace handoff automation
  - browser/runtime or Build Room implementation
  - Command Center or outer-portal changes

## Current State Fit

This framework is needed because the repo already contains hidden intelligence scaffolding, but the visible planning/chat flow still allows too much heuristic interpretation.

Current repo shape:

- hidden extraction, branching, question-selection, and readiness primitives already exist under `lib/intelligence/*`
- runtime `/start` planning chat still relies heavily on message-shape heuristics and transcript-derived summaries
- current workspace strategy flow remains narrower than the truth contract required for reliable handoff

Therefore, the correct move in this pass is to define the governance-first extraction contract before attaching more downstream execution systems.

## Framework Principles

1. The planning chat should feel open and human, not like a rigid form.
2. The extraction system stays hidden behind that conversation.
3. Raw transcript text is evidence, not the project record.
4. Missing truth must be surfaced explicitly.
5. "I don't know" is a supported branch, not a failure state.
6. Neroa may infer temporarily, but all inferences must remain traceable and revisitable.
7. Handoff to roadmap or workspace requires structured extraction plus readiness, not conversational momentum alone.
8. Lane, plan, and build-definition recommendations must be grounded in extracted truth and unresolved assumptions.

## Extraction Schema v1

The field status model, confidence model, contradictions, assumptions, and unknown handling remain governed by [Extraction Schema v1](./extraction-schema-v1.md). This framework adds planning-chat-specific truth requirements and gating.

### Required extraction fields

| Field | Requirement class | What must be captured | Why it matters |
| --- | --- | --- | --- |
| Founder / operator context | Universal required | Who is driving the project, whether it is for an existing business or a new venture, and what operator reality shapes the build | Prevents product planning from floating free of real decision ownership |
| Project name state | Universal required | One of: named, provisional, needs naming help, intentionally unnamed | Prevents anonymous transcript text from becoming the project identity |
| Naming help state | Conditional required | Whether naming help is requested and whether naming is blocking launch identity | Activates the naming branch only when it actually matters |
| Domain intent | Conditional required | Whether a domain matters now, later, or not at all | Separates branding curiosity from launch-critical domain work |
| Domain validation path | Conditional required | Whether Neroa should validate domain viability, alternatives, or naming fit | Keeps domain validation optional unless the launch depends on it |
| Product type | Universal required | SaaS, internal software, external app, mobile app, or another stable product type | Anchors branch and execution-lane reasoning |
| Product function | Universal required | What the product actually does in plain language | Prevents vague idea descriptions from passing as definition |
| Target user | Universal required | The user class the product is meant to serve | Core truth for scope, UX, pricing, and roadmap |
| First user | Conditional required | The first real user Neroa expects to win, especially when distinct from the broader target user | Sharpens launch sequence and MVP shape |
| First use case | Universal required | The first job/workflow/moment the product must handle well | Required for roadmap and MVP boundary clarity |
| Business goal | Universal required | What business outcome matters first | Prevents feature lists from replacing commercial purpose |
| Primary surface(s) | Universal required | Web app, admin console, mobile experience, portal, dashboard, internal tool, or other major surfaces | Anchors build-shape and UX direction |
| Key systems / integrations | Conditional required | External systems, internal systems, or critical integrations already known or assumed | Becomes blocking when the workflow depends on them |
| Constraints | Universal required | Budget, time, staffing, launch, compliance, technical, or operational limits | Required for realistic recommendations |
| Monetization | Conditional required | How the product makes money, if relevant to the business model | Required for SaaS, marketplace, and other revenue-bearing products |
| Compliance / security sensitivity | Universal required | Whether regulated data, permissions, auditability, privacy, or security sensitivity materially changes planning | Required screening before handoff |
| AI usage | Conditional required | Whether AI is core to the value proposition, internal tooling, or optional enhancement | Important when AI changes cost, risk, or system shape |
| Data structure / data source assumptions | Conditional required | What data exists, where it comes from, and what structure the product assumes | Becomes critical when data drives value, logic, or risk |
| Mobile / device expectations | Conditional required | Whether mobile is required now, later, or only as readiness | Prevents accidental over-promising across surfaces |
| Admin / ops complexity | Conditional required | How much back-office, moderation, reporting, or operational control the product needs | Important for internal surfaces and managed recommendations |
| Roadmap clarity level | Universal required (derived) | Low, emerging, workable, or strong clarity based on extraction progress | Makes readiness visible instead of implied |
| Confidence level | Universal required (derived) | Current extraction/roadmap confidence level and reasons | Governs whether Neroa may move forward |
| Unresolved questions | Universal required (derived) | Explicit list of unknowns, assumptions, and decision gaps still open | Keeps uncertainty attached to the project record instead of buried in transcript history |

### Field guidance

- Universal required fields must reach at least `partial` status before roadmap or workspace handoff is allowed.
- Conditional required fields become blocking only when the product shape makes them materially necessary.
- Optional enrichments can improve recommendations but must not silently block every project.

## Branch Logic

The planning chat should branch based on truth gaps, not scripted personality tricks.

| Situation | Required branch behavior | Blocking effect |
| --- | --- | --- |
| User already has a project name | Capture the current name, test whether it is stable or provisional, and continue with product definition | Does not block if the name exists or is clearly provisional |
| User needs naming help | Mark `project name state = needs naming help`, continue extracting product truth first, and only then open naming support | Naming help alone should not block project definition unless launch identity is impossible without it |
| User wants domain validation | Record domain intent and open an optional validation path that tests viability, alternatives, or naming fit | Blocks only if the user says domain choice is launch-critical |
| Product idea is vague | Narrow first to product function, target user, business goal, and first use case before discussing broader roadmap | Blocks roadmap and workspace handoff until a stable first use case exists |
| User says "I don't know" | Preserve the unknown explicitly, ask the smallest clarifying question, and offer comparative examples if needed | Does not block automatically, but repeated critical unknowns will block handoff |
| Target user is unclear | Ask who feels the pain first, who would use it first, or who would pay/sponsor it | Blocks roadmap and lane recommendation |
| First use case is unclear | Ask for the first moment that must work on day one | Blocks project definition, MVP recommendation, and workspace handoff |
| Integrations are unknown | Distinguish between nice-to-have and workflow-critical systems | Blocks only when the first use case depends on external systems or regulated data |
| Compliance/security is sensitive | Raise the sensitivity flag, collect data/privacy/access constraints, and lower confidence until screened | Blocks handoff when unresolved sensitivity materially changes architecture or feasibility |
| Monetization is unclear | Determine whether monetization matters for the first release or is intentionally deferred | Blocks SaaS/commercial recommendations when pricing/revenue logic changes the product shape |
| Execution cannot safely proceed yet | Keep the conversation in planning mode, expose the blockers, and refuse workspace handoff | Always blocks workspace population and execution-oriented outputs |

## Required Truths vs Optional Enrichments

### Universal required truths

These truths must exist before Neroa can populate structured project outputs:

| Required truth | Minimum acceptable state |
| --- | --- |
| Founder / operator context | At least `partial` with clear operator reality |
| Project name state | Explicitly named, provisional, or intentionally unresolved |
| Product type | Stable enough to classify the product correctly |
| Product function | Plain-language explanation of what the product should do |
| Target user | At least one stable first user group |
| First use case | One clear first workflow or job to be done |
| Business goal | One clear initial business result |
| Primary surface(s) | At least a first surface direction |
| Constraints | At least partial budget/time/operational reality |
| Compliance / security sensitivity | Explicitly screened, even if the answer is "not sensitive" |
| Roadmap clarity level | Derived and visible |
| Confidence level | Derived and visible |
| Unresolved questions | Explicitly attached to the record |

### Conditional required truths

These truths become blocking when the project shape depends on them:

| Conditional truth | When it becomes blocking |
| --- | --- |
| Naming help state | When project identity is unstable and naming is preventing forward motion |
| Domain intent / validation path | When launch or branding decisions depend on domain availability |
| First user | When the first adopter differs materially from the broader target user |
| Key systems / integrations | When the first workflow depends on external systems or internal stack assumptions |
| Monetization | When pricing/revenue logic shapes MVP or lane recommendations |
| AI usage | When AI meaningfully affects value, cost, risk, or scope |
| Data structure / data source assumptions | When the product relies on data ingestion, analysis, privacy, or migrations |
| Mobile / device expectations | When device support changes the release shape |
| Admin / ops complexity | When moderation, reporting, or operational controls change scope materially |

### Optional enrichments

These improve recommendations but should not block every project:

- naming alternatives after core product truth is already stable
- brand/voice direction
- growth/SEO assumptions
- later-phase integrations
- deeper monetization refinement when intentionally deferred
- team/process preferences
- launch packaging detail beyond the first working release

## Exit Criteria

### Enough clarity for a perceived project

Neroa may generate a **perceived project** only when all of the following are true:

- product type is at least `partial`
- product function is at least `partial`
- target user is at least `partial`
- first use case is at least `partial`
- business goal is at least `partial`
- no unresolved critical contradiction exists

The perceived project is a working interpretation, not yet a final project definition.

### Enough clarity for a roadmap

Neroa may generate a **roadmap** only when:

- all universal required truths are at least `partial`
- branch/product classification is stable enough to roadmap
- no critical contradiction remains open
- triggered conditional truths are either answered or explicitly deferred with visible assumptions
- roadmap confidence meets the governance threshold for roadmap drafting

### Enough clarity for lane / plan / build-definition recommendation

Neroa may recommend **DIY vs Managed**, and **MVP vs partial vs fuller build**, only when:

- constraints are materially understood
- first use case is clear
- primary surfaces are known
- compliance/security has been screened
- monetization, systems, and ops complexity are understood when relevant
- unresolved questions are attached to the recommendation instead of hidden

### Enough clarity for workspace handoff

Workspace handoff is allowed only when the minimum data gate below is satisfied. If the gate fails, Neroa must continue planning and expose what is still missing.

## Minimum Data Gate

The **Minimum Data Gate v1** is the minimum condition set that must be satisfied before:

- raw conversation becomes structured project truth
- a roadmap is generated as a governed artifact
- workspace population occurs

### Gate rules

1. A structured extraction snapshot must exist.
2. All universal required truths must be present at `partial`, `answered`, `inferred`, or `validated` status.
3. No critical contradiction may remain open.
4. Any triggered conditional truth must either be answered or explicitly deferred with an attached assumption and reason.
5. Branch/product classification must be stable enough to support roadmap work.
6. Roadmap clarity level and confidence level must be explicitly attached to the record.
7. Unresolved questions must be recorded explicitly, even when they are non-blocking.
8. The project summary, roadmap seed, and recommendation objects must be generated from extracted fields, not copied from the transcript.
9. Evidence from the transcript may support the record, but transcript excerpts remain source references only.

### Gate consequence

If the gate is not satisfied:

- Neroa may continue the conversation,
- Neroa may show a working read or clarifying summary,
- but Neroa must not treat that working read as the structured project definition,
- and Neroa must not populate workspace truth as if planning were complete.

## Output Objects

Once the gate is satisfied, the planning chat should be able to produce these structured outputs.

### Perceived project

A concise working read of what Neroa believes the user is building right now.

Must include:

- product type
- product function
- target user
- first use case
- business goal
- project name state

### Structured project definition

The canonical planning output for workspace handoff.

Must include:

- founder/operator context
- project name state
- product type
- product function
- target user
- first user when distinct
- first use case
- business goal
- primary surfaces
- key systems/integrations
- constraints
- monetization state
- compliance/security sensitivity
- AI usage state
- data assumptions
- mobile/device expectations
- admin/ops complexity
- unresolved questions
- confidence level

### Roadmap

A first governed plan structure derived from extracted truth.

Must include:

- first release / MVP direction
- phased sequencing
- critical dependencies
- major assumptions
- major unresolved questions

### Scope summary

A concise statement of:

- what belongs in the current release definition
- what is intentionally deferred
- what remains too unclear to commit yet

### Build-definition recommendation

One recommendation among:

- MVP
- partial build
- fuller build

Must include the reasoning, not only the label.

### Lane recommendation

One recommendation among:

- DIY
- Managed
- conditional / not yet safe to recommend

Must include why the recommendation was made and what unresolved truths still affect it.

### UI/UX direction recommendation

A directional recommendation for the first surface shape and experience level when enough surface truth exists.

### Unresolved assumptions / open questions

An explicit register of:

- assumptions
- unanswered questions
- contradictions
- deferred decisions

### Confidence level

The current confidence state that explains whether the project is:

- still in extraction
- ready for roadmap drafting
- ready for handoff
- or not safe to proceed

## Governance Compatibility Rules

This framework stays aligned with the repo governance pack by enforcing:

- extracted truth before roadmap or workspace handoff
- explicit contradiction and unknown handling
- phase-aware recommendations
- no silent out-of-phase jumps
- no execution-oriented handoff while the project is still insufficiently defined

## Implementation Boundary For This Pass

This pass authorizes only governance/spec work.

Allowed in a later narrow in-phase follow-up:

- docs-backed type/interface alignment for extraction fields
- non-destructive schema object updates
- placeholder structured output objects behind existing intelligence scaffolding

Not authorized in this pass:

- runtime chat rewrites
- workspace population changes
- visible Strategy Room/`/start` behavior changes
- browser/runtime transport
- Build Room execution behavior
- Command Center UI changes

## Recommended Next Safest Step

The next safest implementation step is a **narrow Phase 1 code pass** that aligns the hidden extraction catalog, readiness helpers, and output object types with this framework before any visible planning-chat behavior is changed.

That follow-up should remain limited to hidden intelligence/schema layers first, so Neroa can replace heuristic transcript-to-summary behavior with structured extraction gradually instead of through a risky runtime rewrite.
