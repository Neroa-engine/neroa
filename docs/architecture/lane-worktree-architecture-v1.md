# Lane Worktree Architecture v1

## Purpose

This document defines the lane-based worktree structure that future Neroa
development should use after canonical portal stabilization.

It does not redesign the product. It protects the stabilized active-project
system by making lane ownership explicit before broader extraction begins.

## Protected Canonical Base

The protected base branch is `main`.

The protected canonical active-project interior remains:

1. Strategy Room
2. Project Workspace
3. Command Center
4. Build Room

These rooms must remain mounted through the same active-project shell and route
builders while lane work proceeds in isolated worktrees.

## Lane Architecture

| Lane | Purpose | Owns | Must Not Touch |
| --- | --- | --- | --- |
| `lane/portal-shell` | Own the canonical active-project shell, room nav, portal guards, outer-portal surfaces, and Project Workspace room. | `components/portal/**`, `components/dashboard/**`, `components/account/**`, `app/projects/**`, `app/profile/page.tsx`, `app/settings/page.tsx`, `app/billing/**`, `app/usage/**`, `app/workspace/[workspaceId]/page.tsx`, `components/workspace/workspace-project-page.tsx`, `components/workspace/project-workspace-v1.tsx`, `lib/portal/**` | Strategy Room intelligence, Command Center room logic, Build Room logic, Browser Runtime internals, front-door marketing pages |
| `lane/strategy-room` | Own Strategy Room UI, strategy conversation flow, extraction flow, roadmap/project-definition intelligence, and pre-project strategy surfaces. | `app/workspace/[workspaceId]/strategy-room/page.tsx`, `components/workspace/project-strategy-room-v1.tsx`, `components/onboarding/**`, `lib/start/**`, `app/start/**`, `app/api/start/chat/route.ts` | Portal shell rules, Command Center room, Build Room room, Browser Runtime internals, public marketing shell |
| `lane/command-center` | Own Command Center UI, operator surfaces, summaries, monitoring, reporting, and browser-runtime-facing controls inside the room. | `app/workspace/[workspaceId]/command-center/**`, `components/workspace/project-command-center-v1.tsx`, `components/workspace/command-center-*.tsx`, `lib/workspace/command-center-*.ts`, `app/portal/actions.ts` | Canonical shell/routing rules, Strategy Room intelligence, Build Room room, Browser Runtime core internals |
| `lane/build-room` | Own Build Room UI and execution-facing user surfaces. | `app/workspace/[workspaceId]/build-room/**`, `components/portal/project-room-placeholders.tsx` | Strategy Room, Project Workspace, Command Center, Browser Runtime core internals |
| `lane/browser-runtime` | Own browser runtime sessions, inspections, recordings, captures, and future browser-linked evidence/runtime systems. | `lib/browser-runtime-v2/**`, `lib/live-view/**`, `extensions/neroa-live-view/**`, `app/api/live-view/**`, `components/live-view/**`, browser-runtime-specific slices under `components/workspace/command-center-browser-runtime-panel.tsx` | Portal shell structure, Strategy Room intelligence, public front door |
| `lane/auth-entry` | Own sign-in/sign-up handoff, create/select/open/resume flow, and authenticated redirect rules. | `app/auth/**`, `app/signup/**`, `app/forgot-password/**`, `app/reset-password/**`, `app/dashboard/**`, `app/roadmap/**`, `app/projects/resume/**`, `lib/auth/**` | Public marketing visuals, canonical room shell, room-specific UI logic |
| `lane/front-door-ui` | Own homepage, landing visual system, front-door branding, and public marketing surfaces only. | `app/page.tsx`, `components/layout/page-shells.tsx`, `components/site-header.tsx`, `components/site/**`, `components/support/public-help-chat.tsx`, `components/marketing/**`, `lib/data/public-launch.ts`, public marketing routes such as `app/pricing/**`, `app/blog/**`, `app/contact/**`, `app/use-cases/**` | Signed-in portal shell, active-project room routes, auth redirect rules, browser runtime, project interiors |
| `lane/billing-usage` (optional placeholder) | Future extraction point for account plan, credits, usage, and billing details. | Placeholder only for now; current ownership remains inside `lane/portal-shell` and shared core review. | No active ownership until promoted |
| `lane/growth-layer` (optional placeholder) | Future extraction point for growth/experimentation/public funnel systems. | Placeholder only for now. | No active ownership until promoted |
| `lane/admin-ops` (optional placeholder) | Future extraction point for admin and operational tooling. | Placeholder only for now. | No active ownership until promoted |

## Shared Core

These areas remain protected shared core. They are not single-lane free-for-all
surfaces and require boundary review when touched:

- `lib/portal/routes.ts`
- `components/portal/portal-shells.tsx`
- `lib/portal/server.ts`
- `lib/workspace/server.ts`
- `lib/workspace/project-context-summary.ts`
- `lib/auth/routes.ts`
- `lib/auth.ts`
- `lib/supabase/server.ts`
- shared design tokens and global styling primitives in `app/globals.css`

Shared core rules:

- no lane may bypass canonical route builders,
- no lane may introduce an alternate active-project shell,
- no lane may silently change workspace/project guard semantics,
- no lane may repurpose shared auth/session primitives without explicit review.

## Worktree Strategy

### Protected Base

- protected base branch: `main`
- all lane worktrees branch from the current verified `main`
- no lane merges directly into another lane branch

### Recommended Worktree Root

Create lane worktrees as siblings of the main repo:

- recommended root: `../neroa-worktrees`

That keeps the canonical repo stable while making lane branches easy to inspect
and clean up.

### Recommended Branch / Worktree Mapping

| Lane | Branch | Worktree Path |
| --- | --- | --- |
| `lane/portal-shell` | `codex/lane-portal-shell` | `../neroa-worktrees/lane-portal-shell` |
| `lane/strategy-room` | `codex/lane-strategy-room` | `../neroa-worktrees/lane-strategy-room` |
| `lane/command-center` | `codex/lane-command-center` | `../neroa-worktrees/lane-command-center` |
| `lane/build-room` | `codex/lane-build-room` | `../neroa-worktrees/lane-build-room` |
| `lane/browser-runtime` | `codex/lane-browser-runtime` | `../neroa-worktrees/lane-browser-runtime` |
| `lane/auth-entry` | `codex/lane-auth-entry` | `../neroa-worktrees/lane-auth-entry` |
| `lane/front-door-ui` | `codex/lane-front-door-ui` | `../neroa-worktrees/lane-front-door-ui` |
| `lane/billing-usage` | `codex/lane-billing-usage` | `../neroa-worktrees/lane-billing-usage` |
| `lane/growth-layer` | `codex/lane-growth-layer` | `../neroa-worktrees/lane-growth-layer` |
| `lane/admin-ops` | `codex/lane-admin-ops` | `../neroa-worktrees/lane-admin-ops` |

### Worktree Lifecycle

1. branch from the current verified `main`
2. do lane-local work only
3. rebase from `main` before merge
4. run lane validation plus impacted canonical room checks
5. merge back into `main`
6. remove the worktree when the lane task is done

## Cross-Lane Work

If a task genuinely spans lanes:

1. name the primary owning lane,
2. list the secondary lane touchpoints,
3. call out the shared-core files explicitly,
4. run validation for every impacted canonical room,
5. do not silently slide a second lane change into a "small fix."

## Safe Extraction Notes

What this pass organizes now:

- lane ownership boundaries
- protected shared core boundaries
- branch/worktree naming strategy
- worktree creation scaffold
- merge and no-drift rules

What stays intentionally in place for now:

- current file locations
- current canonical portal shell and route structure
- current Strategy Room intelligence
- current Command Center room implementation
- current Build Room room implementation

File movement and deeper lane extraction should happen later, lane by lane, from
the protected base once each subsystem is being actively worked.
