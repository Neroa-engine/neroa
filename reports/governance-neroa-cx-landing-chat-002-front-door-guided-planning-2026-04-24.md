# NEROA-CX-LANDING-CHAT-002 - Front-Door Guided Planning Conversation

Date: 2026-04-24

## Extraction Snapshot

- Requested change: upgrade the shared front-door landing chatbox into a lightweight guided Neroa planning conversation that asks for the visitor's name, explains the planning-first product path, shows bounded preset question chips, and routes the CTA into the existing auth-aware Strategy Room entry.
- Request origin: direct user request with an approved implementation plan.
- Current context: the shared landing hero chat still uses older starter copy, an outdated post-name CTA, and no bounded preset planning Q&A chips. Both `/` and the no-entry `/start` surface reuse the same hero and chatbox component.
- In scope now:
  - `components/front-door/neroa-chat-card.tsx`
  - `components/front-door/front-door-home-hero.tsx`
  - minimal landing-chat styling in `app/globals.css`
  - auth-aware CTA wording and routing through the existing public launch helper
- Explicitly out of scope now:
  - backend AI chat execution
  - Supabase chat history or schema changes
  - pricing, billing, dashboard, projects, and workspace behavior
  - auth system internals or new route creation
  - broad landing-page redesign outside the chatbox surface
- Architecture confidence: 98
- Readiness result: sufficient extracted truth to proceed through Delta-Analyzer, impact review, phase mapping, and gate review.

## Delta-Analyzer

- Current approved phase: Phase 3
- Owning system: front-door execution surface / shared public landing experience
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
  - `components/front-door/front-door-home-hero.tsx`
  - `app/globals.css`
  - live verification on `/` and the no-entry `/start` landing surface
- Why rebuild is required:
  - the shared front-door chatbox needs coordinated copy, bounded local conversation state, preset chip behavior, and centered CTA layout updates while preserving the existing auth-aware Strategy Room route pattern
- What remains untouched:
  - `components/site/public-action-link.tsx`
  - `lib/data/public-launch.ts`
  - auth pages and auth handlers
  - roadmap/workspace route structure
- Regression exposure:
  - shared landing hero chat surface only
  - mitigated by reusing the existing `PublicActionLink` auth redirect pattern and keeping the upgrade local to the front-door chat component

## Phase Mapping Decision

- Request summary: upgrade the front landing chatbox into a guided planning-first conversation
- Current workstream: shared front-door public execution surface
- Owning system: Phase 3 execution surface
- Primary phase assignment: Phase 3
- Secondary phase assignments: none
- Outcome: Approved now
- Why: the change stays inside the current public execution surface, reuses established auth-aware launch routing, and does not introduce a new trust-layer contract or future-phase capability.

## Execution Gate Decision

- Confidence threshold met: yes (`98`)
- Extraction sufficiency: satisfied
- Delta-Analyzer complete: satisfied
- Rebuild Impact Report complete: satisfied
- Phase mapping complete: satisfied
- Roadmap revision required first: no
- Final outcome: Approved as-is
- Rationale: this is a contained front-door conversation upgrade that preserves existing routing and auth patterns while improving the planning-first public experience.

## Verification Target

- Confirm `/` starts the chatbox with the Neroa introduction and name prompt.
- Confirm submitting a name reveals the detailed planning explanation, bounded preset Q&A chips, and the centered CTA stack.
- Confirm anonymous users see `Create Account` routing through `/auth?next=%2Froadmap`.
- Confirm signed-in users see `Open Strategy Room` routing directly to `/roadmap`.
- Confirm the shared no-entry `/start` page renders the same upgraded chatbox behavior without layout overflow on desktop or mobile.
