create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create table if not exists public.admin_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique,
  is_active boolean not null default true,
  billing_exempt boolean not null default false,
  plan_override text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pricing_tiers (
  id text primary key,
  label text not null,
  monthly_price numeric(10,2),
  annual_discount_rate numeric(6,4) not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  selected_plan_id text,
  billing_interval text not null default 'monthly',
  plan_status text,
  billing_required boolean not null default false,
  billing_exempt boolean not null default false,
  account_created_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.account_usage_quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selected_plan_id text,
  billing_interval text not null default 'monthly',
  plan_status text,
  billing_required boolean not null default false,
  billing_exempt boolean not null default false,
  plan_override text,
  monthly_engine_credits integer,
  engine_credits_used integer not null default 0,
  engine_credits_remaining integer,
  active_engine_limit integer,
  active_engines_used integer not null default 0,
  seat_limit integer,
  seats_used integer not null default 1,
  overages_allowed boolean not null default false,
  deploy_allowed boolean not null default false,
  launch_allowed text not null default 'false',
  max_workflow_stage text not null default 'strategy',
  max_advanced_modules integer,
  advanced_modules_used integer not null default 0,
  max_ai_heavy_runs integer,
  ai_heavy_runs_used integer not null default 0,
  max_collaborative_workflows integer,
  collaborative_workflows_used integer not null default 0,
  premium_build_categories text[] not null default '{}'::text[],
  monthly_reset_date timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique,
  personal boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.workspaces
add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create table if not exists public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, user_id)
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

create table if not exists public.onboarding_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  decision_payload jsonb not null default '{}'::jsonb,
  summary_payload jsonb not null default '{}'::jsonb,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recommendation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  onboarding_decision_id uuid references public.onboarding_decisions(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  input_snapshot jsonb not null default '{}'::jsonb,
  recommendation_snapshot jsonb not null default '{}'::jsonb,
  user_action text not null default 'accepted',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.framework_selections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  framework_id text not null,
  framework_label text,
  build_category text,
  complexity_score integer,
  recommended_tier_id text,
  selected_module_ids text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, framework_id)
);

create table if not exists public.workspace_module_entitlements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  module_id text not null,
  module_label text,
  entitlement_state text not null check (entitlement_state in ('included', 'available', 'locked')),
  source text,
  complexity_weight integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, module_id)
);

create table if not exists public.build_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  onboarding_decision_id uuid references public.onboarding_decisions(id) on delete set null,
  status text not null check (status in ('draft', 'queued', 'in_progress', 'review', 'blocked', 'completed', 'cancelled')),
  stage text not null check (stage in ('blueprint', 'execution_setup', 'build', 'review', 'launch')),
  build_configuration jsonb not null default '{}'::jsonb,
  progress_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.build_session_events (
  id uuid primary key default gen_random_uuid(),
  build_session_id uuid not null references public.build_sessions(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'error')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_workspaces_owner_id on public.workspaces(owner_id);
create index if not exists idx_workspaces_organization_id on public.workspaces(organization_id);
create index if not exists idx_workspace_memberships_user_id on public.workspace_memberships(user_id);
create index if not exists idx_workspace_messages_workspace_id on public.workspace_messages(workspace_id);
create index if not exists idx_jobs_workspace_id on public.jobs(workspace_id);
create index if not exists idx_jobs_owner_id on public.jobs(owner_id);
create index if not exists idx_onboarding_decisions_user_id on public.onboarding_decisions(user_id);
create index if not exists idx_onboarding_decisions_workspace_id on public.onboarding_decisions(workspace_id);
create index if not exists idx_recommendation_history_user_id on public.recommendation_history(user_id);
create index if not exists idx_framework_selections_workspace_id on public.framework_selections(workspace_id);
create index if not exists idx_build_sessions_workspace_id on public.build_sessions(workspace_id);
create index if not exists idx_build_sessions_user_id on public.build_sessions(user_id);
create index if not exists idx_platform_events_created_at on public.platform_events(created_at desc);

create or replace function public.current_user_is_platform_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  user_email text;
begin
  user_email := public.current_user_email();

  return user_email = 'admin@neroa.io'
    or exists (
      select 1
      from public.admin_overrides
      where is_active = true
        and (
          user_id = auth.uid()
          or (email is not null and lower(email) = user_email)
        )
    );
end;
$$;

create or replace function public.has_organization_access(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_user_is_platform_admin()
    or exists (
      select 1
      from public.organizations organizations
      where organizations.id = target_organization_id
        and organizations.owner_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.organization_memberships memberships
      where memberships.organization_id = target_organization_id
        and memberships.user_id = auth.uid()
        and memberships.status = 'active'
    );
$$;

create or replace function public.has_workspace_access(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_user_is_platform_admin()
    or exists (
      select 1
      from public.workspaces workspaces
      where workspaces.id = target_workspace_id
        and workspaces.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.workspace_memberships memberships
      where memberships.workspace_id = target_workspace_id
        and memberships.user_id = auth.uid()
        and memberships.status = 'active'
    );
$$;

drop trigger if exists touch_admin_overrides_updated_at on public.admin_overrides;
create trigger touch_admin_overrides_updated_at
before update on public.admin_overrides
for each row execute function public.touch_updated_at();

drop trigger if exists touch_pricing_tiers_updated_at on public.pricing_tiers;
create trigger touch_pricing_tiers_updated_at
before update on public.pricing_tiers
for each row execute function public.touch_updated_at();

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_account_usage_quotas_updated_at on public.account_usage_quotas;
create trigger touch_account_usage_quotas_updated_at
before update on public.account_usage_quotas
for each row execute function public.touch_updated_at();

drop trigger if exists touch_organizations_updated_at on public.organizations;
create trigger touch_organizations_updated_at
before update on public.organizations
for each row execute function public.touch_updated_at();

drop trigger if exists touch_organization_memberships_updated_at on public.organization_memberships;
create trigger touch_organization_memberships_updated_at
before update on public.organization_memberships
for each row execute function public.touch_updated_at();

drop trigger if exists touch_workspace_memberships_updated_at on public.workspace_memberships;
create trigger touch_workspace_memberships_updated_at
before update on public.workspace_memberships
for each row execute function public.touch_updated_at();

drop trigger if exists touch_jobs_updated_at on public.jobs;
create trigger touch_jobs_updated_at
before update on public.jobs
for each row execute function public.touch_updated_at();

drop trigger if exists touch_onboarding_decisions_updated_at on public.onboarding_decisions;
create trigger touch_onboarding_decisions_updated_at
before update on public.onboarding_decisions
for each row execute function public.touch_updated_at();

drop trigger if exists touch_framework_selections_updated_at on public.framework_selections;
create trigger touch_framework_selections_updated_at
before update on public.framework_selections
for each row execute function public.touch_updated_at();

drop trigger if exists touch_workspace_module_entitlements_updated_at on public.workspace_module_entitlements;
create trigger touch_workspace_module_entitlements_updated_at
before update on public.workspace_module_entitlements
for each row execute function public.touch_updated_at();

drop trigger if exists touch_build_sessions_updated_at on public.build_sessions;
create trigger touch_build_sessions_updated_at
before update on public.build_sessions
for each row execute function public.touch_updated_at();

alter table public.admin_overrides enable row level security;
alter table public.pricing_tiers enable row level security;
alter table public.profiles enable row level security;
alter table public.account_usage_quotas enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspace_messages enable row level security;
alter table public.jobs enable row level security;
alter table public.onboarding_decisions enable row level security;
alter table public.recommendation_history enable row level security;
alter table public.framework_selections enable row level security;
alter table public.workspace_module_entitlements enable row level security;
alter table public.build_sessions enable row level security;
alter table public.build_session_events enable row level security;
alter table public.platform_events enable row level security;

drop policy if exists "Users can create their own workspaces" on public.workspaces;
drop policy if exists "Users can view their own workspaces" on public.workspaces;
drop policy if exists "Users can create their own workspace messages" on public.workspace_messages;
drop policy if exists "Users can read messages from their own workspaces" on public.workspace_messages;
drop policy if exists "Users can create their own jobs" on public.jobs;
drop policy if exists "Users can view their own jobs" on public.jobs;
drop policy if exists "Users can update their own jobs" on public.jobs;

drop policy if exists "Platform admins can read admin overrides" on public.admin_overrides;
create policy "Platform admins can read admin overrides"
on public.admin_overrides
for select
to authenticated
using (public.current_user_is_platform_admin());

drop policy if exists "Platform admins can manage admin overrides" on public.admin_overrides;
create policy "Platform admins can manage admin overrides"
on public.admin_overrides
for all
to authenticated
using (public.current_user_is_platform_admin())
with check (public.current_user_is_platform_admin());

drop policy if exists "Pricing tiers are readable" on public.pricing_tiers;
create policy "Pricing tiers are readable"
on public.pricing_tiers
for select
to authenticated, anon
using (active = true or public.current_user_is_platform_admin());

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id or public.current_user_is_platform_admin())
with check (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Users can read their own quotas" on public.account_usage_quotas;
create policy "Users can read their own quotas"
on public.account_usage_quotas
for select
to authenticated
using (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Users can insert their own quotas" on public.account_usage_quotas;
create policy "Users can insert their own quotas"
on public.account_usage_quotas
for insert
to authenticated
with check (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Users can update their own quotas" on public.account_usage_quotas;
create policy "Users can update their own quotas"
on public.account_usage_quotas
for update
to authenticated
using (auth.uid() = user_id or public.current_user_is_platform_admin())
with check (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Members can view organizations" on public.organizations;
create policy "Members can view organizations"
on public.organizations
for select
to authenticated
using (public.has_organization_access(id));

drop policy if exists "Owners can create organizations" on public.organizations;
create policy "Owners can create organizations"
on public.organizations
for insert
to authenticated
with check (auth.uid() = owner_user_id or public.current_user_is_platform_admin());

drop policy if exists "Owners can update organizations" on public.organizations;
create policy "Owners can update organizations"
on public.organizations
for update
to authenticated
using (auth.uid() = owner_user_id or public.current_user_is_platform_admin())
with check (auth.uid() = owner_user_id or public.current_user_is_platform_admin());

drop policy if exists "Members can view organization memberships" on public.organization_memberships;
create policy "Members can view organization memberships"
on public.organization_memberships
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_organization_access(organization_id)
);

drop policy if exists "Owners can create organization memberships" on public.organization_memberships;
create policy "Owners can create organization memberships"
on public.organization_memberships
for insert
to authenticated
with check (
  public.has_organization_access(organization_id)
  or public.current_user_is_platform_admin()
);

drop policy if exists "Owners can update organization memberships" on public.organization_memberships;
create policy "Owners can update organization memberships"
on public.organization_memberships
for update
to authenticated
using (
  public.has_organization_access(organization_id)
  or public.current_user_is_platform_admin()
)
with check (
  public.has_organization_access(organization_id)
  or public.current_user_is_platform_admin()
);

drop policy if exists "Users can create their own workspaces" on public.workspaces;
create policy "Users can create their own workspaces"
on public.workspaces
for insert
to authenticated
with check (
  auth.uid() = owner_id
  or public.current_user_is_platform_admin()
);

drop policy if exists "Users can view their own workspaces" on public.workspaces;
create policy "Users can view their own workspaces"
on public.workspaces
for select
to authenticated
using (
  public.has_workspace_access(id)
  or (organization_id is not null and public.has_organization_access(organization_id))
);

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

drop policy if exists "Members can view workspace memberships" on public.workspace_memberships;
create policy "Members can view workspace memberships"
on public.workspace_memberships
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_workspace_access(workspace_id)
);

drop policy if exists "Owners can create workspace memberships" on public.workspace_memberships;
create policy "Owners can create workspace memberships"
on public.workspace_memberships
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspaces
    where public.workspaces.id = workspace_id
      and public.workspaces.owner_id = auth.uid()
  )
  or public.current_user_is_platform_admin()
);

drop policy if exists "Owners can update workspace memberships" on public.workspace_memberships;
create policy "Owners can update workspace memberships"
on public.workspace_memberships
for update
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where public.workspaces.id = workspace_id
      and public.workspaces.owner_id = auth.uid()
  )
  or public.current_user_is_platform_admin()
)
with check (
  exists (
    select 1
    from public.workspaces
    where public.workspaces.id = workspace_id
      and public.workspaces.owner_id = auth.uid()
  )
  or public.current_user_is_platform_admin()
);

drop policy if exists "Users can create their own workspace messages" on public.workspace_messages;
create policy "Users can create their own workspace messages"
on public.workspace_messages
for insert
to authenticated
with check (
  auth.uid() = author_id
  and public.has_workspace_access(workspace_id)
);

drop policy if exists "Users can read messages from their own workspaces" on public.workspace_messages;
create policy "Users can read messages from their own workspaces"
on public.workspace_messages
for select
to authenticated
using (public.has_workspace_access(workspace_id));

drop policy if exists "Users can create their own jobs" on public.jobs;
create policy "Users can create their own jobs"
on public.jobs
for insert
to authenticated
with check (
  auth.uid() = owner_id
  and public.has_workspace_access(workspace_id)
);

drop policy if exists "Users can view their own jobs" on public.jobs;
create policy "Users can view their own jobs"
on public.jobs
for select
to authenticated
using (
  auth.uid() = owner_id
  or public.has_workspace_access(workspace_id)
);

drop policy if exists "Users can update their own jobs" on public.jobs;
create policy "Users can update their own jobs"
on public.jobs
for update
to authenticated
using (auth.uid() = owner_id or public.current_user_is_platform_admin())
with check (auth.uid() = owner_id or public.current_user_is_platform_admin());

drop policy if exists "Users can read onboarding decisions" on public.onboarding_decisions;
create policy "Users can read onboarding decisions"
on public.onboarding_decisions
for select
to authenticated
using (
  auth.uid() = user_id
  or (workspace_id is not null and public.has_workspace_access(workspace_id))
  or public.current_user_is_platform_admin()
);

drop policy if exists "Users can create onboarding decisions" on public.onboarding_decisions;
create policy "Users can create onboarding decisions"
on public.onboarding_decisions
for insert
to authenticated
with check (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Users can update onboarding decisions" on public.onboarding_decisions;
create policy "Users can update onboarding decisions"
on public.onboarding_decisions
for update
to authenticated
using (auth.uid() = user_id or public.current_user_is_platform_admin())
with check (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Users can read recommendation history" on public.recommendation_history;
create policy "Users can read recommendation history"
on public.recommendation_history
for select
to authenticated
using (
  auth.uid() = user_id
  or (workspace_id is not null and public.has_workspace_access(workspace_id))
  or public.current_user_is_platform_admin()
);

drop policy if exists "Users can create recommendation history" on public.recommendation_history;
create policy "Users can create recommendation history"
on public.recommendation_history
for insert
to authenticated
with check (auth.uid() = user_id or public.current_user_is_platform_admin());

drop policy if exists "Members can read framework selections" on public.framework_selections;
create policy "Members can read framework selections"
on public.framework_selections
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_workspace_access(workspace_id)
  or public.current_user_is_platform_admin()
);

drop policy if exists "Members can create framework selections" on public.framework_selections;
create policy "Members can create framework selections"
on public.framework_selections
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.has_workspace_access(workspace_id)
);

drop policy if exists "Members can update framework selections" on public.framework_selections;
create policy "Members can update framework selections"
on public.framework_selections
for update
to authenticated
using (
  auth.uid() = user_id
  or public.current_user_is_platform_admin()
)
with check (
  auth.uid() = user_id
  or public.current_user_is_platform_admin()
);

drop policy if exists "Members can read module entitlements" on public.workspace_module_entitlements;
create policy "Members can read module entitlements"
on public.workspace_module_entitlements
for select
to authenticated
using (public.has_workspace_access(workspace_id));

drop policy if exists "Owners can manage module entitlements" on public.workspace_module_entitlements;
create policy "Owners can manage module entitlements"
on public.workspace_module_entitlements
for all
to authenticated
using (
  exists (
    select 1
    from public.workspaces
    where public.workspaces.id = workspace_id
      and public.workspaces.owner_id = auth.uid()
  )
  or public.current_user_is_platform_admin()
)
with check (
  exists (
    select 1
    from public.workspaces
    where public.workspaces.id = workspace_id
      and public.workspaces.owner_id = auth.uid()
  )
  or public.current_user_is_platform_admin()
);

drop policy if exists "Members can read build sessions" on public.build_sessions;
create policy "Members can read build sessions"
on public.build_sessions
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_workspace_access(workspace_id)
  or public.current_user_is_platform_admin()
);

drop policy if exists "Members can create build sessions" on public.build_sessions;
create policy "Members can create build sessions"
on public.build_sessions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.has_workspace_access(workspace_id)
);

drop policy if exists "Members can update build sessions" on public.build_sessions;
create policy "Members can update build sessions"
on public.build_sessions
for update
to authenticated
using (
  auth.uid() = user_id
  or public.current_user_is_platform_admin()
)
with check (
  auth.uid() = user_id
  or public.current_user_is_platform_admin()
);

drop policy if exists "Members can read build session events" on public.build_session_events;
create policy "Members can read build session events"
on public.build_session_events
for select
to authenticated
using (
  exists (
    select 1
    from public.build_sessions
    where public.build_sessions.id = build_session_id
      and (
        public.build_sessions.user_id = auth.uid()
        or public.has_workspace_access(public.build_sessions.workspace_id)
        or public.current_user_is_platform_admin()
      )
  )
);

drop policy if exists "Members can create build session events" on public.build_session_events;
create policy "Members can create build session events"
on public.build_session_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.build_sessions
    where public.build_sessions.id = build_session_id
      and (
        public.build_sessions.user_id = auth.uid()
        or public.has_workspace_access(public.build_sessions.workspace_id)
        or public.current_user_is_platform_admin()
      )
  )
);

drop policy if exists "Platform admins can read platform events" on public.platform_events;
create policy "Platform admins can read platform events"
on public.platform_events
for select
to authenticated
using (public.current_user_is_platform_admin());

drop policy if exists "Authenticated users can create platform events" on public.platform_events;
create policy "Authenticated users can create platform events"
on public.platform_events
for insert
to authenticated
with check (auth.uid() = user_id or user_id is null or public.current_user_is_platform_admin());

insert into public.pricing_tiers (id, label, monthly_price, metadata)
values
  ('free', 'Free', 0, jsonb_build_object('engine_credits', 300, 'active_engine_limit', 1, 'seat_limit', 1)),
  ('starter', 'Starter', 29, jsonb_build_object('engine_credits', 2500, 'active_engine_limit', 1, 'seat_limit', 1)),
  ('builder', 'Builder', 79, jsonb_build_object('engine_credits', 9000, 'active_engine_limit', 3, 'seat_limit', 1)),
  ('pro', 'Pro', 179, jsonb_build_object('engine_credits', 22000, 'active_engine_limit', 6, 'seat_limit', 1)),
  ('command-center', 'Agency / Command Center', 399, jsonb_build_object('engine_credits', 60000, 'active_engine_limit', 15, 'seat_limit', 2, 'additional_seat_price', 99))
on conflict (id) do update
set
  label = excluded.label,
  monthly_price = excluded.monthly_price,
  metadata = excluded.metadata,
  updated_at = timezone('utc', now());
