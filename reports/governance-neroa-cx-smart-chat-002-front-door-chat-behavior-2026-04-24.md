# NEROA-CX-SMART-CHAT-002 - Front-Door Smart Chat Behavior

Date: 2026-04-24

## Extraction Snapshot

- Requested change: simplify the shared front-door landing chat into a lightweight smart first-touch interaction that asks for the visitor's name, responds with a concise Neroa explanation, ends with `Let's get started.`, and shows one auth-aware CTA button.
- Request origin: direct user request.
- Current context: the shared landing chat was recently upgraded into a larger planning-first flow with additional explanation depth, preset chips, and a Strategy Room CTA. The new request narrows that experience back down to a shorter name capture and a lighter handoff.
- In scope now:
  - `components/front-door/neroa-chat-card.tsx`
  - existing shared landing hero usage on `/` and no-entry `/start`
  - auth-aware CTA target selection using existing route contracts
- Explicitly out of scope now:
  - backend AI chat
  - persistence or memory
  - streaming
  - broad landing-page redesign
  - auth system internals
  - new route creation
- Architecture confidence: 98
- Readiness result: sufficient extracted truth to proceed through Delta-Analyzer, impact review, phase mapping, and gate review.

## Delta-Analyzer

- Current approved phase: Phase 3
- Owning system: shared front-door execution surface / public landing interaction
- Primary phase touched: Phase 3
- Secondary phases touched: none
- Future phases touched: none
- Trust-layer impact: none
- Dependency direction crossed: no
- Rebuild radius: local
- Contradiction risk: minor
- Impact category: `local`
- Roadmap revision required: no
- Analyzer recommendation: allowed to proceed to impact report and gate review

## Rebuild Impact Report

- Change type: modifying
- Risk level: low
- Required rebuild scope:
  - `components/front-door/neroa-chat-card.tsx`
  - live verification on `/` and no-entry `/start`
- Why rebuild is required:
  - the front-door chat behavior needs a lighter local interaction state, shorter guided copy, and a revised auth-aware handoff CTA while preserving the existing premium card presentation
- What remains untouched:
  - `components/front-door/front-door-home-hero.tsx`
  - `components/site/public-action-link.tsx`
  - `lib/data/public-launch.ts`
  - auth pages and protected route behavior
- Regression exposure:
  - shared landing chat interaction only
  - mitigated by reusing existing route constants and the existing start-page auth guard

## Phase Mapping Decision

- Request summary: refine the landing chatbox into a lighter first-touch guided interaction
- Current workstream: shared front-door public execution surface
- Owning system: Phase 3 execution surface
- Primary phase assignment: Phase 3
- Secondary phase assignments: none
- Outcome: Approved now
- Why: the request is a contained public-surface behavior change that reuses existing route and auth contracts.

## Execution Gate Decision

- Confidence threshold met: yes (`98`)
- Extraction sufficiency: satisfied
- Delta-Analyzer complete: satisfied
- Rebuild Impact Report complete: satisfied
- Phase mapping complete: satisfied
- Roadmap revision required first: no
- Final outcome: Approved as-is
- Rationale: this is a bounded front-door interaction refinement with no new trust-layer or route surface.

## Verification Target

- Confirm clicking into the landing chat reveals `Hi, I’m Neroa. What’s your name?`
- Confirm name submission shows `Hi, [Name]. I’m Neroa.` plus the required concise explanation.
- Confirm the conversation ends with `Let’s get started.` and shows one `Let’s get started` button.
- Confirm the button points signed-out users into the existing setup/start path and signed-in users to `/projects`.
