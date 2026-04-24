# Governance Record

- Task: `NEROA-CX-VERCEL-FIX-001-COMMAND-CENTER-FILESYSTEM`
- Date: `2026-04-24`
- Phase mapping: Phase 3 stabilization / deployment-hardening pass
- Scope: Guard local disk-backed Live View, Command Center runtime, and QC storage from running on Vercel/serverless production

# Delta Summary

- Problem: Command Center and related Live View/QC flows attempt to create local runtime directories under `process.cwd()`, which resolves to `/var/task` on Vercel production.
- Impact: Deployed Command Center crashes with `ENOENT` / filesystem write failures before it can fall back safely.
- Allowed execution: Local/dev behavior may remain disk-backed; deployed/serverless behavior must stop attempting local filesystem writes and return safe unsupported or empty-state behavior instead.

# Execution Notes

- Add one shared runtime-storage capability guard.
- Gate all Live View / Browser Runtime V2 / project QC local-disk stores behind that guard.
- Return empty lists / null sessions on read paths when storage is unavailable.
- Return explicit unsupported errors on create/write paths so routes and pages can fail safely without crashing.
- Preserve the existing Command Center UI structure and keep the user in a safe, non-crashing state.
