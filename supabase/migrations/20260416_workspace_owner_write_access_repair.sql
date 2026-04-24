-- Repair owner write access on workspaces for authenticated sessions.
-- Runtime QA showed owner-scoped updates/deletes were silently no-oping against
-- the current database, which blocks archive/restore/rename/delete flows.

alter table public.workspaces enable row level security;

grant update, delete on table public.workspaces to authenticated;
grant update, delete on table public.workspaces to service_role;

drop policy if exists "Users can update their own workspaces" on public.workspaces;
create policy "Users can update their own workspaces"
on public.workspaces
for update
to authenticated
using (
  auth.uid() = owner_id
  or public.current_user_is_platform_admin()
)
with check (
  auth.uid() = owner_id
  or public.current_user_is_platform_admin()
);

drop policy if exists "Users can delete their own workspaces" on public.workspaces;
create policy "Users can delete their own workspaces"
on public.workspaces
for delete
to authenticated
using (
  auth.uid() = owner_id
  or public.current_user_is_platform_admin()
);
