import { DashboardBoardShell } from "@/components/layout/page-shells";
import DashboardBoard, {
  type DashboardBoardProject
} from "@/components/dashboard/dashboard-board";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { requireUser } from "@/lib/auth";
import { syncAccountPlanAccess } from "@/lib/account/plan-usage-server";
import { listAccessibleWorkspaces } from "@/lib/platform/foundation";
import { getProjectAiCollaboration } from "@/lib/ai/collaboration";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";
import {
  buildProjectModel,
  getFirstProjectLane,
  getProjectLanePhaseForLane
} from "@/lib/workspace/project-lanes";

type DashboardPageProps = {
  searchParams?: {
    error?: string;
  };
};

function formatPlanStatus(value: string | null) {
  if (!value) {
    return "not set";
  }

  return value.replace(/_/g, " ");
}

function formatUpdatedLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function buildDashboardProject(args: {
  workspace: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
  };
}) {
  const parsed = parseWorkspaceProjectDescription(args.workspace.description);
  const project = buildProjectModel({
    workspaceId: args.workspace.id,
    projectId: args.workspace.id,
    title: args.workspace.name,
    description: parsed.visibleDescription,
    templateId: parsed.metadata?.templateId ?? null,
    customLanes: parsed.metadata?.customLanes ?? []
  });
  const featuredLane = getFirstProjectLane(project);
  const leadingPhase = featuredLane ? getProjectLanePhaseForLane(featuredLane) : null;
  const activeAiStack = getProjectAiCollaboration(project).map((agent) =>
    agent.id === "repolink"
      ? "RepoLink"
      : agent.id.charAt(0).toUpperCase() + agent.id.slice(1)
  );
  const assets = parsed.metadata?.assets ?? [];
  const latestAsset = [...assets].sort((left, right) =>
    right.addedAt.localeCompare(left.addedAt)
  )[0];

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    route: `/workspace/${project.workspaceId}/project/${project.id}`,
    templateLabel: parsed.metadata?.guidedBuildIntake?.categoryLabel ?? project.templateLabel,
    statusLabel: leadingPhase ? `${leadingPhase.label} leading` : "Ready",
    currentPhaseLabel: leadingPhase?.label ?? null,
    currentPhaseSummary: leadingPhase?.summary ?? null,
    leadingLaneTitle: featuredLane?.title ?? null,
    laneCount: project.lanes.length,
    assetCount: assets.length,
    lastUpdatedLabel: formatUpdatedLabel(latestAsset?.addedAt ?? args.workspace.created_at),
    activeAiStack,
    recentOutputs: project.lanes.slice(0, 3).map((lane) => lane.deliverables[0] ?? lane.focusLabel),
    assets
  } satisfies DashboardBoardProject;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { user } = await requireUser({ nextPath: "/dashboard" });

  const supabase = createSupabaseServerClient();
  const workspaces = await listAccessibleWorkspaces({
    supabase,
    userId: user.id
  }).catch(() => []);

  const projects = (workspaces ?? []).map((workspace) => buildDashboardProject({ workspace }));
  const openProjects = projects.filter((project) => {
    const parsed = parseWorkspaceProjectDescription(
      workspaces?.find((item) => item.id === project.id)?.description
    );

    return !parsed.metadata?.archived;
  });
  const archivedProjects = projects.filter((project) => {
    const parsed = parseWorkspaceProjectDescription(
      workspaces?.find((item) => item.id === project.id)?.description
    );

    return Boolean(parsed.metadata?.archived);
  });
  const totalAssets = openProjects.reduce((sum, project) => sum + project.assetCount, 0);
  const activeAiCount = new Set(openProjects.flatMap((project) => project.activeAiStack)).size;
  const usage = await syncAccountPlanAccess({
    supabase,
    user,
    activeEnginesUsed: openProjects.length
  }).catch(() =>
    resolveAccountPlanAccess(user, {
      activeEnginesUsed: openProjects.length
    })
  );

  return (
    <DashboardBoardShell userEmail={user.email ?? undefined} ctaHref="/start" ctaLabel="New Engine">
        <div className="space-y-6">
          <section className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 xl:px-8">
            <div className="floating-wash rounded-[38px]" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                  Dashboard / Engine Board
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                  Manage your engines, assets, and AI execution in one command surface.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                  The dashboard is now your engine board. Open active engines, manage assets, and move directly into the next execution step without losing context.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="premium-surface-soft p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Open engines
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{openProjects.length}</p>
                </div>
                <div className="premium-surface-soft p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Tracked assets
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{totalAssets}</p>
                </div>
                <div className="premium-surface-soft p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Active AI systems
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{activeAiCount}</p>
                </div>
              </div>
            </div>
          </section>

          {searchParams?.error ? (
            <div className="rounded-2xl border border-rose-300/50 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
              {searchParams.error}
            </div>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="premium-surface rounded-[28px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Current plan
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {usage.planName ?? "Plan required"}
                </h2>
                <span className="premium-pill text-slate-500">
                  {formatPlanStatus(usage.planStatus)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {usage.selectedPlanId === "free"
                  ? "Free gets one active Engine through MVP planning with a hard monthly credit cap."
                  : usage.planStatus === "pending_billing"
                    ? "Billing is still marked pending for local MVP testing. Paid activation can be connected before production launch."
                    : "Your plan controls Engine Credits, active Engine limits, and the deeper workflow stages available here."}
              </p>
            </div>

            <div className="premium-surface rounded-[28px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Usage summary
              </p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Engine Credits</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {usage.engineCreditsUsed.toLocaleString("en-US")} used
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-cyan-700">
                    {usage.engineCreditsRemaining === null
                      ? "Custom"
                      : `${usage.engineCreditsRemaining.toLocaleString("en-US")} left`}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Active Engines</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {usage.activeEnginesUsed.toLocaleString("en-US")} in use
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-cyan-700">
                    {usage.activeEngineLimit === null
                      ? "Custom"
                      : `${usage.activeEnginesUsed}/${usage.activeEngineLimit}`}
                  </p>
                </div>
                <div className="pt-2">
                  <a href="/pricing" className="button-secondary w-full justify-between">
                    <span>Upgrade plan</span>
                    <span className="text-cyan-700">View pricing</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <DashboardBoard projects={openProjects} archivedProjects={archivedProjects} />
        </div>
    </DashboardBoardShell>
  );
}
