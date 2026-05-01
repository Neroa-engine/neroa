# Neroa One Execution Infrastructure Blueprint

## Purpose

This document defines the intended backend execution architecture for Neroa One before further browser intelligence, QC intelligence, or room-like UI surfaces are expanded.

It exists to keep infrastructure purpose ahead of interface naming. No new room, panel, box, or status surface should be introduced unless it maps to a real backend responsibility described here.

This is an architecture blueprint, not a runtime enforcement claim. Existing product behavior remains unchanged until the corresponding backend services, queues, contracts, and storage are implemented.

## Primary Position

- `Command Center` is the customer communication surface.
- `Neroa One / D-Analyzer` is the backend intelligence, routing, and repair-prioritization boundary.
- `Build Room` is a live execution viewport and control surface, not the execution brain.
- `Strategy Room` remains the planning and roadmap decision surface.
- `Evidence / QC Library` is the durable archive for inspection, QC, recording, and result artifacts.
- Browser runtime, QC runtime, and video capture should be treated as DigitalOcean-hosted execution infrastructure that follows the routing foundation, not the other way around.

## Why This Blueprint Exists

The product is currently at risk of creating too many visible rooms before the backend responsibilities are fully separated. This blueprint prevents that drift by requiring each visible surface to map to one of the following system roles:

1. customer communication
2. planning and roadmap decisions
3. execution viewport
4. durable evidence archive
5. internal operational monitoring
6. backend orchestration and review

If a proposed box or panel does not serve one of those roles, it should not be built.

## Intended System Roles

### Neroa One / D-Analyzer

Neroa One is the backend orchestration boundary. It owns:

- request normalization
- Delta-Analyzer execution
- roadmap fit evaluation
- five-outcome routing
- prompt generation and internal task packaging
- execution queue placement
- Codex output review
- repair prioritization
- QC routing decisions
- final internal release readiness

Neroa One must be service-boundary-first. It should be deployable behind a DigitalOcean-hosted endpoint and should not depend on customer-facing UI components to perform classification or routing.

### Five Outcome Queues

Every customer request analyzed by Neroa One must land in exactly one queue:

1. `ready_to_build`
2. `needs_customer_answer`
3. `roadmap_revision_required`
4. `blocked_missing_information`
5. `rejected_outside_scope`

These queues are backend routing states. They are not customer-facing room names.

### Codex Execution Room

This is an internal execution queue and packet boundary for implementation work approved by Neroa One. It is where internal-ready tasks are handed to Codex execution.

### Codex Output Box

This is the storage boundary for raw Codex execution output, logs, patches, structured summaries, and execution metadata before human or service review.

### Neroa One Output Review

This is the post-execution review stage owned by Neroa One. It decides whether output is:

- acceptable for QC
- needs repair
- needs rerun
- needs escalation
- needs customer decision because the implementation exposed a roadmap or scope issue

### QC Station

This is the execution-adjacent runtime used for inspection, browser validation, walkthroughs, video capture, and QC report production. It is an internal infrastructure station, not a customer-facing room.

### Evidence / QC Library

This is the durable archive for:

- QC reports
- recordings
- screenshots and captured frames
- runtime walkthrough outputs
- SOP outputs
- linked execution evidence
- customer-safe result references

### Command Center

This is the customer-facing intake and communication layer. It owns:

- request submission
- customer questions and answers
- decision requests
- revision loops
- status communication
- result delivery

Command Center should display analyzer outcomes, not backend machinery.

### Build Room Viewport

Build Room should only show the state of already-approved internal work. It may expose operational controls such as:

- current execution packet
- relay status
- worker status
- active browser/QC session status
- evidence availability
- next internal operator action

It must not become the place where routing, analyzer decisions, or output review logic live.

### Planning / Strategy Room

Strategy Room owns roadmap changes, architectural shifts, cost/timeline implications, and approved planning decisions. It should receive escalations from Neroa One when analyzer results or output review indicate scope drift.

### Admin Backend Portal

This is an internal operations surface for monitoring service health, queues, stuck runs, failed reviews, QC throughput, artifact integrity, and audit history.

## Customer-Facing Versus Internal-Only

### Customer-Facing

- Command Center
- customer-safe statuses
- revision requests
- clarification requests
- roadmap decision requests
- approved results and evidence references

### Internal-Only

- Neroa One / D-Analyzer
- five outcome queues
- Codex Execution Room
- Codex Output Box
- Neroa One Output Review
- QC Station
- Admin Backend Portal
- prompt generation and internal prompt tasks
- repair prioritization queues

Customers should never be asked to reason about internal prompts, internal boxes, DigitalOcean service labels, or relay infrastructure.

## End-to-End Task Lifecycle

1. Customer submits a request in Command Center.
2. Command Center sends the normalized request payload to Neroa One.
3. Neroa One runs extraction, Delta-Analyzer, rebuild impact logic, phase mapping, and execution gate checks.
4. Neroa One writes the request into exactly one of the five analyzer outcome queues.
5. Command Center receives only the customer-safe review outcome and next required customer action, if any.
6. If the request lands in `ready_to_build`, Neroa One creates an internal execution packet and places it into the Codex Execution Room.
7. Codex execution runs against that packet and writes raw results into the Codex Output Box.
8. Neroa One Output Review evaluates the Codex output and decides whether to:
   - send to QC Station
   - send to repair / rerun
   - escalate to Strategy Room
   - return to Command Center for customer answer
9. If QC is required, QC Station runs browser inspection, walkthroughs, recordings, and report generation against the approved internal build target.
10. QC Station writes evidence into the Evidence / QC Library.
11. Neroa One performs final result review across execution output plus QC evidence.
12. Command Center receives the customer-safe result summary, linked evidence references, or the next customer-facing follow-up request.
13. Admin Backend Portal records monitoring signals and audit history across the entire path.

## Queue and Box Responsibilities

### Analyzer Outcome Queues

Each queue should store:

- request id
- workspace and project ids
- normalized request summary
- analyzer outcome
- analyzer rationale
- roadmap impact summary
- execution gate result
- timestamps
- retry and escalation metadata

### Codex Execution Room

This should store:

- execution packet id
- linked request id
- build intent
- task type
- acceptance criteria
- risk and safety constraints
- input context bundle
- assigned execution target
- run status

### Codex Output Box

This should store:

- raw Codex output
- patch references
- summaries
- logs
- relay metadata
- run timing
- failure reason if any
- linkage to the originating execution packet

### Neroa One Output Review Queue

This should store:

- output review id
- linked Codex output id
- review disposition
- repair priority
- rerun requirement
- QC requirement
- escalation target
- reviewer notes

### QC Station Queue

This should store:

- QC job id
- linked build or output id
- target environment
- browser/runtime target
- required QC actions
- recording requirement
- inspection scope
- completion status

### Evidence / QC Library

This should store:

- report ids
- recording ids
- screenshot/frame references
- walkthrough outputs
- SOP outputs
- page and route associations
- linked request, execution, and output ids
- customer-safe visibility markers

## Build Room Definition

Build Room should be explicitly limited to the following roles:

- viewport into current execution status
- control surface for approved internal actions
- evidence visibility
- operator awareness of active browser/QC state
- audit-friendly visibility into what is running now

Build Room should not own:

- analyzer outcome selection
- routing logic
- prompt generation
- output review decisions
- repair prioritization
- roadmap escalation logic
- final customer result composition

If a future Build Room feature needs one of those responsibilities, that responsibility belongs in Neroa One instead.

## Browser, QC, and Video Hosting Rule

Browser runtime, QC runtime, recording, and video should be treated as DigitalOcean-hosted execution infrastructure that attaches after routing and output-review boundaries are defined.

This means the build order is:

1. define analyzer and queue boundaries
2. define execution packet and output review boundaries
3. define internal monitoring and audit boundaries
4. only then expand browser, QC, recording, and evidence automation

The system should not build more browser intelligence UI until the upstream routing and review responsibilities have a stable backend owner.

## Admin Backend Portal Requirements

The Admin Portal must monitor:

- analyzer queue volume by outcome
- stuck items in any queue
- execution packet age
- Codex relay failures
- worker failures
- output review backlog
- repair loop counts
- QC backlog
- evidence write failures
- missing artifact links
- customer-visible delays caused by internal stalls
- service health for Neroa One, worker execution, QC Station, and evidence storage
- audit trace from customer request through final result

## Proposed Service Boundaries

### Service 1: Neroa One Analyzer API

Owns:

- request intake from Command Center
- analyzer contract
- five-outcome routing contract

### Service 2: Neroa One Execution Router

Owns:

- execution packet creation
- queue placement for Codex execution
- routing into Codex relay

### Service 3: Neroa One Output Review Service

Owns:

- Codex output intake
- post-execution review
- repair prioritization
- routing to QC or rerun

### Service 4: QC Station Service

Owns:

- browser inspection jobs
- recording jobs
- walkthrough jobs
- QC report generation

### Service 5: Evidence Library Service

Owns:

- durable evidence registration
- artifact linkage
- customer-safe visibility classification

### Service 6: Admin Operations Service

Owns:

- monitoring views
- queue health
- stuck-run intervention
- audit trace and operator tooling

## Phased Build Order

### Phase A: Analyzer Foundation

- establish the Neroa One analyzer service boundary
- standardize the five-outcome contract
- route customer task creation through that boundary

### Phase B: Queue and Packet Foundation

- define persistent internal queue contracts
- define the execution packet contract
- separate analyzer outcome storage from Build Room display logic

### Phase C: Output Review Foundation

- define Codex output intake contract
- create Neroa One output review state machine
- define repair prioritization contract

### Phase D: Viewport Realignment

- reduce Build Room responsibilities to viewport and approved controls
- feed Build Room from backend read models instead of decision logic

### Phase E: QC and Evidence Foundation

- define QC Station job contracts
- connect QC outputs to Evidence / QC Library
- define customer-safe evidence publishing rules

### Phase F: Admin Operations

- add queue monitoring
- add stuck-run and failure dashboards
- add audit trace visibility

## Recommended Next Small Codex Tasks

1. Add a typed Neroa One five-outcome queue contract document and backend placeholder module.
2. Add a backend execution packet contract for internal-ready work handed from Neroa One to Codex.
3. Add a Codex output box contract and placeholder storage adapter interface.
4. Add a Neroa One output review contract that can classify `approve_for_qc`, `needs_repair`, `rerun`, `strategy_escalation`, and `customer_followup`.
5. Add a backend read model that supplies Build Room with viewport data only, without introducing new UI behavior.
6. Add a QC Station job contract for inspection, recording, walkthrough, and report generation.
7. Add an evidence-linking contract that ties request id, execution packet id, output id, QC report id, and recording id together.
8. Add an Admin Portal monitoring blueprint document or schema for queue health and stuck-run visibility.
9. Move internal handoff packaging logic behind a Neroa One service module instead of Build Room-oriented helpers.
10. After the above exist, design the DigitalOcean deployment topology for analyzer, worker, QC Station, and evidence services.

## Guardrail For Future Product Work

No future UI surface should be built for:

- analyzer outcomes
- prompt queues
- output review
- repair prioritization
- QC routing
- evidence routing

unless a backend contract, owner, and queue or storage responsibility already exist for that surface.

Visible product surfaces must remain a projection of backend purpose, not a substitute for it.
