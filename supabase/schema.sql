create extension if not exists "pgcrypto";

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.workspaces enable row level security;
alter table public.workspace_messages enable row level security;
alter table public.jobs enable row level security;

drop policy if exists "Users can create their own workspaces" on public.workspaces;
drop policy if exists "Users can view their own workspaces" on public.workspaces;
drop policy if exists "Users can create their own workspace messages" on public.workspace_messages;
drop policy if exists "Users can read messages from their own workspaces" on public.workspace_messages;
drop policy if exists "Users can create their own jobs" on public.jobs;
drop policy if exists "Users can view their own jobs" on public.jobs;
drop policy if exists "Users can update their own jobs" on public.jobs;

create policy "Users can create their own workspaces"
on public.workspaces
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Users can view their own workspaces"
on public.workspaces
for select
to authenticated
using (auth.uid() = owner_id);

create policy "Users can create their own workspace messages"
on public.workspace_messages
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.workspaces
    where public.workspaces.id = workspace_id
      and public.workspaces.owner_id = auth.uid()
  )
);

create policy "Users can read messages from their own workspaces"
on public.workspace_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where public.workspaces.id = workspace_id
      and public.workspaces.owner_id = auth.uid()
  )
);

create policy "Users can create their own jobs"
on public.jobs
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.workspaces
    where public.workspaces.id = workspace_id
      and public.workspaces.owner_id = auth.uid()
  )
);

create policy "Users can view their own jobs"
on public.jobs
for select
to authenticated
using (auth.uid() = owner_id);

create policy "Users can update their own jobs"
on public.jobs
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
