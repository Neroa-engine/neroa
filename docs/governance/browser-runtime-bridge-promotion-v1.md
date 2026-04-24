# Browser Runtime Promotion v2

## Purpose

This note records the roadmap/governance promotion that now allows Browser Runtime Core V2 to proceed immediately without promoting the full Phase 5 browser visual editor or the full Phase 6 orchestration stack.

## Promoted Scope

The following work is now explicitly allowed inside current execution scope:

- Browser Runtime Core V2
- Live Session Design Library Bridge

The legacy Browser Runtime Bridge v1 is now approved for replacement by Browser Runtime Core V2. It may remain only as temporary migration scaffolding during the V2 implementation sequence and must not remain as a competing runtime path after V2 lands.

That promoted scope includes:

- one unified browser runtime core for Command Center, Live View, extension sidepanel, service worker, and content script triggers
- one shared command bus, one response contract, one session model, one target-tab selector, one action registry, and one persistence/writeback contract
- deterministic browser open, attach, bind, reconnect, and current-tab/window selection
- real Inspect action exposed on approved user-facing surfaces
- Record action foundation with truthful lifecycle and truthful partial-output handling when media pipeline pieces are still incomplete
- bounded AI walkthrough/test foundation focused on browser walkthrough/testing rather than general autonomous agents
- SOP/result-output foundation with structured writeback and project/library linkage
- reusing valid existing session truth, tokenized launch/auth, inspection truth separation, and QC/library destination contracts where those remain sound
- letting Design Library run against that same connected browser runtime session for staged preview/package state updates

## Execution Order For CX-089

Browser Runtime Core V2 is approved for immediate execution in this sequence:

1. define the shared Browser Runtime Core V2 modules and contracts
2. replace the legacy browser command/response lifecycle with the unified V2 command bus
3. rebuild deterministic browser open, attach, bind, and target-tab selection on that core
4. land Inspect as the first fully real shared action across Command Center, Live View, and sidepanel
5. land Record action foundation with truthful lifecycle and persistence contracts
6. land bounded AI walkthrough/test foundation on the same shared action/runtime system
7. land SOP/result-output foundation and connect it to the project/library history layer
8. retire or bypass legacy unstable runtime paths so V2 becomes the primary browser runtime path

## Still Deferred

The following remain future-scoped and are **not** promoted by this note:

- full browser visual editor
- arbitrary click-to-edit or unrestricted direct DOM mutation tooling
- full live rebuild orchestration
- unbounded autonomous multi-system delivery
- broad AI visual QC automation beyond the bounded inspection/walkthrough/output foundations above
- preview-vs-implementation repair automation
- any second browser system or second design-preview runtime

## Governance Note

This promotion is allowed because the repo already contains reusable browser/runtime pieces that are sufficient to support a clean V2 rebuild now without inventing a second browser system. The promoted work stays inside workspace/project execution surfaces, preserves one runtime path, and explicitly authorizes replacement of the legacy browser/runtime core. It does **not** authorize the broader Phase 5 browser editor or the full Phase 6 orchestration layer.

## Delta / Rebuild Impact Summary

Requested Change:
Promote Browser Runtime Core V2 so Neroa can replace the legacy browser/runtime core now with one deterministic runtime system for browser open/attach/bind/tab targeting, unified command lifecycle, Inspect, Record foundation, bounded AI walkthrough/test foundation, SOP/result output foundation, and project/library linkage.

Affected Phases:
Phase 3 (current-promoted owner), with limited Browser Runtime Core V2 capability promoted now while the full Phase 5 browser visual editor and full Phase 6 orchestration layers remain future boundaries.

Affected Systems:
Command Center browser controls, Live View surfaces, extension sidepanel, content script, service worker, browser command/response lifecycle, live-view session store, inspection truth model, recording/output contracts, AI walkthrough/test foundation, SOP/result-output writeback, Design Library preview/session bridge, and project/library linkage.

Dependencies Touched:
Existing Live View route, session creation/attach flow, extension bind flow, session persistence/store, inspection truth model, target-tab selection, preview-state model, approved package model, QC/library contracts, and project/library history surfaces.

Impact Category:
Architectural

Risk Level:
Critical

Change Type:
Destructive

Roadmap Revision Required:
Yes - completed by this promotion note together with the linked roadmap, phase-map, and gate updates.

Execution Status:
Approved as-is

What Must Be Rebuilt:
The browser runtime core, action registry, command bus, response lifecycle, deterministic attach/bind/tab targeting, Inspect action path, Record foundation, bounded AI walkthrough/test foundation, SOP/result-output foundation, and the project/library writeback path that anchors those outputs.

What Can Remain Untouched:
Outer portal, billing/account, unrelated auth flows beyond required runtime session launch/auth, Build Room internals, Codex transport, full browser visual editor tooling, full autonomous orchestration, and unrelated browser systems.

Regression Risk:
High if implementation keeps legacy and V2 paths active in parallel, introduces a second runtime path, fakes readiness, or expands into full browser editing/orchestration without another roadmap revision.

Assumptions Affected:
Valid current session truth, tokenized launch/auth, inspection truth separation, and QC/library contracts can be reused; the legacy bridge can be replaced now; Browser and Design Library can share one runtime session under V2 without requiring the full browser visual editor.

Contradictions Triggered:
None if implementation stays inside this promoted scope. A contradiction is triggered if the work expands into unrestricted live editing, separate preview/runtime engines, or full autonomous orchestration without further roadmap revision.
