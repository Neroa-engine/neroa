# Lane Merge Rules v1

## Purpose

These rules harden the lane/worktree model so future work does not reintroduce
duplicate shells, alternate route trees, or hidden cross-lane drift after the
canonical portal stabilization pass.

## Merge Rules

1. No lane may silently modify another lane's owned surfaces without an explicit
   boundary note.
2. No lane may introduce an alternate active-project shell or active-project
   route tree.
3. No lane may bypass canonical route builders in `lib/portal/routes.ts`.
4. No lane may repurpose `workspaceId` and `projectId` interchangeably outside
   the canonical guard rules.
5. No lane merges directly into another lane branch. All merges return to the
   protected base branch.
6. No merge without duplication/fragmentation review against the impacted
   active-project surfaces.
7. No merge without build/typecheck for the lane worktree.
8. No merge without verifying every impacted canonical room.

## Validation Rules Before Merge

Every lane merge must complete:

- `npm.cmd run build`
- boundary review for any shared-core file touched
- explicit check that no alternate active-project shell was introduced
- explicit check that no stale non-canonical route target or prefetch was added

### Impacted Canonical Room Checks

- If `lane/portal-shell` changes: verify all four rooms
- If `lane/strategy-room` changes: verify Strategy Room plus shell continuity
- If `lane/command-center` changes: verify Command Center plus shell continuity
- If `lane/build-room` changes: verify Build Room plus shell continuity
- If `lane/browser-runtime` changes: verify Command Center and Build Room plus
  runtime degradation behavior
- If `lane/auth-entry` changes: verify sign-in/create/resume/open flow lands in
  canonical portal destinations only
- If `lane/front-door-ui` changes: verify public pages only and confirm no
  signed-in portal shell regression

## No-Drift Rules

- No lane may add a second room wrapper for Strategy Room, Project Workspace,
  Command Center, or Build Room.
- No lane may reintroduce retired `/workspace/[workspaceId]/project/[projectId]`
  interior behavior.
- No lane may add a stale `/library` or other non-canonical interior target
  without an explicit approved route.
- No lane may add background prefetch or fallback behavior that lands a signed-in
  project flow on a public-shell page.

## Shared-Core Review Rules

Touches to the following always require boundary review:

- `components/portal/portal-shells.tsx`
- `lib/portal/routes.ts`
- `lib/portal/server.ts`
- `lib/workspace/server.ts`
- `lib/auth/routes.ts`
- `lib/auth.ts`
- `lib/supabase/server.ts`
- `app/globals.css`

Boundary review must state:

1. why the shared-core change is necessary,
2. which lane owns the primary intent,
3. which canonical rooms are impacted,
4. what prevents duplication or route drift after the merge.

## Cross-Lane Work Handling

If a change touches more than one lane:

1. declare the primary owning lane in the PR/commit notes,
2. list the secondary lanes touched,
3. list every shared-core file touched,
4. run the union of validation checks for all impacted lanes,
5. block merge if the change can be split cleanly and was bundled only for convenience.

## Worktree Hygiene Rules

- Keep one active concern per lane worktree.
- Remove stale lane worktrees after merge.
- Rebase lane worktrees from verified `main` before merge.
- Do not promote a lane branch as a new protected base.
