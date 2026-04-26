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

create table if not exists public.build_room_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  lane_slug text,
  title text not null,
  task_type text not null check (task_type in ('implementation', 'bug_fix', 'qa', 'research', 'operations')),
  requested_output_mode text not null check (requested_output_mode in ('plan_only', 'patch_proposal', 'implementation_guidance')),
  user_request text not null,
  acceptance_criteria text,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  status text not null check (
    status in (
      'draft',
      'queued_for_codex',
      'codex_running',
      'codex_complete',
      'needs_revision',
      'approved_for_worker',
      'worker_running',
      'worker_complete',
      'worker_failed'
    )
  ) default 'draft',
  codex_request_payload jsonb,
  codex_response_payload jsonb,
  approved_for_execution boolean not null default false,
  worker_run_status text not null check (worker_run_status in ('idle', 'queued', 'running', 'complete', 'failed')) default 'idle',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.build_room_task_messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.build_room_tasks(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  role text not null check (role in ('user', 'system', 'codex', 'worker')),
  message_kind text not null,
  content text not null,
  payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.build_room_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.build_room_tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  triggered_by_user_id uuid references auth.users(id) on delete set null,
  run_type text not null check (run_type in ('codex', 'worker')),
  status text not null check (status in ('queued', 'running', 'complete', 'failed')),
  provider text not null,
  external_job_id text,
  request_payload jsonb,
  response_payload jsonb,
  log_excerpt text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.build_room_artifacts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.build_room_tasks(id) on delete cascade,
  run_id uuid references public.build_room_runs(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  artifact_type text not null check (artifact_type in ('task_packet', 'codex_result', 'worker_packet', 'worker_result', 'worker_log')),
  title text not null,
  text_content text,
  payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists build_room_tasks_workspace_project_idx
  on public.build_room_tasks (workspace_id, project_id, updated_at desc);

create index if not exists build_room_task_messages_task_idx
  on public.build_room_task_messages (task_id, created_at asc);

create index if not exists build_room_runs_task_idx
  on public.build_room_runs (task_id, created_at desc);

create index if not exists build_room_artifacts_task_idx
  on public.build_room_artifacts (task_id, created_at desc);

alter table public.build_room_tasks enable row level security;
alter table public.build_room_task_messages enable row level security;
alter table public.build_room_runs enable row level security;
alter table public.build_room_artifacts enable row level security;

drop policy if exists "Users can create Build Room tasks" on public.build_room_tasks;
drop policy if exists "Users can read Build Room tasks" on public.build_room_tasks;
drop policy if exists "Users can update Build Room tasks" on public.build_room_tasks;
drop policy if exists "Users can create Build Room task messages" on public.build_room_task_messages;
drop policy if exists "Users can read Build Room task messages" on public.build_room_task_messages;
drop policy if exists "Users can create Build Room runs" on public.build_room_runs;
drop policy if exists "Users can read Build Room runs" on public.build_room_runs;
drop policy if exists "Users can update Build Room runs" on public.build_room_runs;
drop policy if exists "Users can create Build Room artifacts" on public.build_room_artifacts;
drop policy if exists "Users can read Build Room artifacts" on public.build_room_artifacts;

create policy "Users can create Build Room tasks"
on public.build_room_tasks
for insert
to authenticated
with check (auth.uid() = created_by_user_id);

create policy "Users can read Build Room tasks"
on public.build_room_tasks
for select
to authenticated
using (auth.uid() = owner_id or auth.uid() = created_by_user_id);

create policy "Users can update Build Room tasks"
on public.build_room_tasks
for update
to authenticated
using (auth.uid() = owner_id or auth.uid() = created_by_user_id)
with check (auth.uid() = owner_id or auth.uid() = created_by_user_id);

create policy "Users can create Build Room task messages"
on public.build_room_task_messages
for insert
to authenticated
with check (auth.uid() = owner_id or auth.uid() = author_user_id);

create policy "Users can read Build Room task messages"
on public.build_room_task_messages
for select
to authenticated
using (auth.uid() = owner_id or auth.uid() = author_user_id);

create policy "Users can create Build Room runs"
on public.build_room_runs
for insert
to authenticated
with check (auth.uid() = owner_id or auth.uid() = triggered_by_user_id);

create policy "Users can read Build Room runs"
on public.build_room_runs
for select
to authenticated
using (auth.uid() = owner_id or auth.uid() = triggered_by_user_id);

create policy "Users can update Build Room runs"
on public.build_room_runs
for update
to authenticated
using (auth.uid() = owner_id or auth.uid() = triggered_by_user_id)
with check (auth.uid() = owner_id or auth.uid() = triggered_by_user_id);

create policy "Users can create Build Room artifacts"
on public.build_room_artifacts
for insert
to authenticated
with check (auth.uid() = owner_id or auth.uid() = created_by_user_id);

create policy "Users can read Build Room artifacts"
on public.build_room_artifacts
for select
to authenticated
using (auth.uid() = owner_id or auth.uid() = created_by_user_id);
