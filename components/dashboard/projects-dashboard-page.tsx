import { OuterPortalShell } from "@/components/portal/portal-shells";
import DashboardBoard, {
  type DashboardBoardProject
} from "@/components/dashboard/dashboard-board";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { syncAccountPlanAccess } from "@/lib/account/plan-usage-server";
import { requireUser } from "@/lib/auth";
import { APP_ROUTES } from "@/lib/routes";
import { getCustomerFacingWorkspacePortfolio } from "@/lib/platform/foundation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";
import {
  buildCustomerFacingPhaseTrack,
  buildCustomerFacingProjectStatus,
  buildCustomerFacingStageLabel,
  buildCustomerFacingStageSummary,
  getCustomerFacingProjectState
} from "@/lib/workspace/customer-project-truth";
import {
  buildProjectModel,
  getFirstProjectLane,
  getProjectLanePhaseForLane
} from "@/lib/workspace/project-lanes";
import {
  buildPortalProjectSummary,
  listSelectablePortalProjects,
  resolveActivePortalProject
} from "@/lib/portal/server";
import { unstable_noStore as noStore } from "next/cache";

type ProjectsDashboardPageProps = {
  entryPath: string;
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

function formatCreatedLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function normalizeProjectSystemLabel(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized.includes("github") || normalized.includes("repo")) {
    return "GitHub";
  }

  if (normalized.includes("supabase")) {
    return "Supabase";
  }

  if (normalized.includes("vercel")) {
    return "Vercel";
  }

  if (normalized.includes("go daddy") || normalized.includes("godaddy")) {
    return "GoDaddy";
  }

  if (normalized.includes("domain") || normalized.includes("dns")) {
    return "Domain";
  }

  if (
    normalized.includes("database") ||
    normalized.includes("postgres") ||
    normalized.includes("postgresql")
  ) {
    return "Database";
  }

  return null;
}

function collectProjectSystems(args: {
  parsed: ReturnType<typeof parseWorkspaceProjectDescription>;
}) {
  const systems = new Map<
    string,
    {
      label: string;
      status: "planned" | "referenced";
    }
  >();

  const plannedSources = [
    ...(args.parsed.metadata?.buildSession?.scope.integrationNeeds ?? []),
    ...(args.parsed.metadata?.buildSession?.scope.stackSystems ?? [])
  ];
  const referencedSources = args.parsed.metadata?.assets?.map((asset) => asset.name) ?? [];

  for (const source of plannedSources) {
    const label = normalizeProjectSystemLabel(source);

    if (!label || systems.has(label)) {
      continue;
    }

    systems.set(label, {
      label,
      status: "planned"
    });
  }

  for (const source of referencedSources) {
    const label = normalizeProjectSystemLabel(source);

    if (!label) {
      continue;
    }

    systems.set(label, {
      label,
      status: "referenced"
    });
  }

  return Array.from(systems.values());
}

function trimSentence(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function summarizeCustomerText(value: string | null | undefined, maxLength = 180) {
  const trimmed = trimSentence(value);

  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}...`;
}

function splitScopeItems(value: string | null | undefined) {
  const trimmed = trimSentence(value);

  if (!trimmed) {
    return [];
  }

  return trimmed
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function dedupeItems(values: Array<string | null | undefined>, maxItems = 4) {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const value of values) {
    const trimmed = trimSentence(value);

    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push(trimmed);

    if (results.length >= maxItems) {
      break;
    }
  }

  return results;
}

function buildProjectProductSummary(args: {
  parsed: ReturnType<typeof parseWorkspaceProjectDescription>;
  visibleDescription: string | null;
}) {
  const metadata = args.parsed.metadata;

  return (
    summarizeCustomerText(metadata?.buildSession?.scope.summary) ??
    summarizeCustomerText(metadata?.buildSession?.scope.mvpSummary) ??
    summarizeCustomerText(metadata?.buildSession?.scope.projectDefinitionSummary) ??
    summarizeCustomerText(metadata?.guidedEntryContext?.summary) ??
    summarizeCustomerText(metadata?.guidedEntryContext?.projectDefinitionSummary) ??
    summarizeCustomerText(metadata?.saasIntake?.projectSummary) ??
    summarizeCustomerText(metadata?.saasIntake?.answers.productSummary) ??
    summarizeCustomerText(metadata?.mobileAppIntake?.projectSummary) ??
    summarizeCustomerText(metadata?.mobileAppIntake?.answers.appSummary) ??
    summarizeCustomerText(args.visibleDescription)
  );
}

function buildProjectPrimaryUser(args: {
  parsed: ReturnType<typeof parseWorkspaceProjectDescription>;
}) {
  const metadata = args.parsed.metadata;

  return (
    summarizeCustomerText(metadata?.buildSession?.scope.targetUsers, 80) ??
    summarizeCustomerText(metadata?.buildSession?.scope.audience, 80) ??
    summarizeCustomerText(metadata?.saasIntake?.answers.customer, 80) ??
    summarizeCustomerText(metadata?.mobileAppIntake?.answers.audience, 80)
  );
}

function buildProjectScopeSnapshot(args: {
  parsed: ReturnType<typeof parseWorkspaceProjectDescription>;
}) {
  const metadata = args.parsed.metadata;
  const scope = metadata?.buildSession?.scope;

  return dedupeItems([
    ...(scope?.firstBuild ?? []),
    ...(scope?.keyFeatures ?? []),
    ...(scope?.keyModules ?? []),
    ...(scope?.coreFeatures ?? []),
    ...(metadata?.saasIntake?.mvpFeatureList ?? []),
    ...(metadata?.mobileAppIntake?.featureList ?? []),
    ...(metadata?.mobileAppIntake?.screenList ?? []),
    ...splitScopeItems(metadata?.saasIntake?.answers.features)
  ]);
}

function buildProjectEstimate(args: {
  parsed: ReturnType<typeof parseWorkspaceProjectDescription>;
}) {
  const metadata = args.parsed.metadata;
  const buildSession = metadata?.buildSession;
  const label =
    trimSentence(buildSession?.credits.estimateLabel) ??
    trimSentence(buildSession?.scope.estimateRange) ??
    trimSentence(buildSession?.scope.estimateBaseline) ??
    trimSentence(metadata?.guidedEntryContext?.estimateRange) ??
    trimSentence(metadata?.guidedEntryContext?.estimateBaseline) ??
    trimSentence(metadata?.saasIntake?.startupCostEstimate.rangeLabel) ??
    trimSentence(metadata?.mobileAppIntake?.startupCostEstimate.rangeLabel);

  if (!label) {
    return {
      label: null,
      summary: null
    };
  }

  const timeEstimate =
    trimSentence(buildSession?.scope.timeEstimate) ??
    trimSentence(metadata?.guidedEntryContext?.timeEstimate) ??
    trimSentence(buildSession?.credits.estimatedTimeline);
  const complexity =
    trimSentence(buildSession?.scope.complexityLevel) ??
    trimSentence(metadata?.saasIntake?.buildComplexity.label) ??
    trimSentence(metadata?.mobileAppIntake?.buildComplexity.label);

  return {
    label,
    summary: timeEstimate
      ? `Projected build cost for ${timeEstimate.toLowerCase()}.`
      : complexity
        ? `${complexity} scoped build estimate for the current first release.`
        : "Projected build cost based on the current scoped first release."
  };
}

function buildDashboardProject(args: {
  workspace: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    accessMode: "owner" | "member";
  };
  likelyDuplicateCount: number;
  legacyReason: string | null;
  archived: boolean;
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
  const customerStatus = buildCustomerFacingProjectStatus({
    phaseId: leadingPhase?.id,
    archived: args.archived,
    legacyReason: args.legacyReason
  });
  const productSummary = buildProjectProductSummary({
    parsed,
    visibleDescription: parsed.visibleDescription
  });
  const primaryUserLabel = buildProjectPrimaryUser({
    parsed
  });
  const scopeSnapshot = buildProjectScopeSnapshot({
    parsed
  });
  const buildEstimate = buildProjectEstimate({
    parsed
  });
  const assets = parsed.metadata?.assets ?? [];
  const latestAsset = [...assets].sort((left, right) =>
    right.addedAt.localeCompare(left.addedAt)
  )[0];

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    route: `/workspace/${project.workspaceId}`,
    templateLabel:
      parsed.metadata?.buildSession?.scope.productTypeLabel ??
      parsed.metadata?.buildSession?.scope.buildTypeLabel ??
      project.templateLabel,
    statusLabel: customerStatus.label,
    statusTone: customerStatus.tone,
    currentPhaseLabel: buildCustomerFacingStageLabel(leadingPhase?.id),
    currentPhaseSummary: buildCustomerFacingStageSummary(leadingPhase?.id),
    phaseTrack: buildCustomerFacingPhaseTrack(leadingPhase?.id),
    leadingLaneTitle: featuredLane?.title ?? null,
    laneCount: project.lanes.length,
    assetCount: assets.length,
    lastUpdatedLabel: formatUpdatedLabel(latestAsset?.addedAt ?? args.workspace.created_at),
    productSummary,
    primaryUserLabel,
    scopeSnapshot,
    buildEstimateLabel: buildEstimate.label,
    buildEstimateSummary: buildEstimate.summary,
    projectSystems: collectProjectSystems({
      parsed
    }),
    assets,
    createdAtLabel: formatCreatedLabel(args.workspace.created_at),
    accessMode: args.workspace.accessMode,
    likelyDuplicateCount: args.likelyDuplicateCount
  } satisfies DashboardBoardProject;
}

function buildProjectDuplicateKey(args: {
  title: string;
  description: string | null;
  templateLabel: string;
}) {
  return [
    args.title.trim().toLowerCase(),
    args.description?.trim().toLowerCase() ?? "",
    args.templateLabel.trim().toLowerCase()
  ].join("::");
}

export async function ProjectsDashboardPage({
  entryPath,
  searchParams
}: ProjectsDashboardPageProps) {
  noStore();
  const { user } = await requireUser({
    nextPath: entryPath
  });

  const supabase = createSupabaseServerClient();
  const customerFacingPortfolio = await getCustomerFacingWorkspacePortfolio({
    supabase,
    userId: user.id
  }).catch(() => ({
    workspaces: [],
    currentWorkspaceIds: [],
    archivedWorkspaceIds: [],
    legacyWorkspaceIds: [],
    currentCount: 0,
    archivedCount: 0,
    legacyCount: 0
  }));
  const currentWorkspaceIds = new Set(customerFacingPortfolio.currentWorkspaceIds);
  const archivedWorkspaceIds = new Set(customerFacingPortfolio.archivedWorkspaceIds);
  const workspaces = customerFacingPortfolio.workspaces;

  const portalProjects = (workspaces ?? []).map((workspace) => buildPortalProjectSummary(workspace));
  const selectablePortalProjects = listSelectablePortalProjects(portalProjects);
  const activeProject = await resolveActivePortalProject({
    supabase,
    userId: user.id,
    projects: portalProjects
  });

  const workspaceRecords = (workspaces ?? []).map((workspace) => {
    const projectState = getCustomerFacingProjectState(workspace.description);
    const project = buildDashboardProject({
      workspace,
      likelyDuplicateCount: 1,
      legacyReason: projectState.legacyReason,
      archived: projectState.archived
    });

    return {
      project,
      archived: projectState.archived,
      legacy: Boolean(projectState.legacyReason),
      legacyReason: projectState.legacyReason,
      duplicateKey: buildProjectDuplicateKey({
        title: project.title,
        description: project.description,
        templateLabel: project.templateLabel
      })
    };
  });

  const duplicateCounts = new Map<string, number>();

  for (const record of workspaceRecords) {
    duplicateCounts.set(record.duplicateKey, (duplicateCounts.get(record.duplicateKey) ?? 0) + 1);
  }

  const records = workspaceRecords.map((record) => ({
    ...record,
    project: {
      ...record.project,
      likelyDuplicateCount: duplicateCounts.get(record.duplicateKey) ?? 1
    }
  }));

  const openProjects = records
    .filter((record) => currentWorkspaceIds.has(record.project.id))
    .sort((left, right) => left.project.likelyDuplicateCount - right.project.likelyDuplicateCount)
    .map((record) => record.project);
  const archivedProjects = records
    .filter((record) => archivedWorkspaceIds.has(record.project.id))
    .map((record) => record.project);
  const totalAssets = openProjects.reduce((sum, project) => sum + project.assetCount, 0);
  const likelyDuplicateCount = openProjects.filter((project) => project.likelyDuplicateCount > 1).length;
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
    <OuterPortalShell
      currentPath={entryPath === APP_ROUTES.dashboard ? APP_ROUTES.projects : entryPath}
      userEmail={user.email ?? undefined}
      activeProject={activeProject}
      availableProjects={selectablePortalProjects}
    >
      <div className="space-y-6">
        <section className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 xl:px-8">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                Projects
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                Manage your project portfolio and move into one active project when you're ready.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                Projects is the portfolio layer of Neroa. Open the active project, start a new one,
                and keep your work organized without dropping into internal execution surfaces.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="premium-surface-soft p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Current projects
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">
                  {customerFacingPortfolio.currentCount}
                </p>
              </div>
              <div className="premium-surface-soft p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Tracked assets
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{totalAssets}</p>
              </div>
              <div className="premium-surface-soft p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Archived projects
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">
                  {customerFacingPortfolio.archivedCount}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {likelyDuplicateCount} likely duplicate
                  {likelyDuplicateCount === 1 ? "" : "s"} still visible in Current.
                </p>
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
                ? "Free gives you one active project workspace with a guided MVP-first entry."
                : usage.planStatus === "pending_billing"
                  ? "Billing is still marked pending for local MVP testing. Paid activation can be connected before production launch."
                  : "Your plan controls credits, active project limits, and the deeper workflow stages available here."}
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
                  <p className="text-sm font-semibold text-slate-950">Active projects</p>
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
                <a href={APP_ROUTES.pricingDiy} className="button-secondary w-full justify-between">
                  <span>Upgrade plan</span>
                  <span className="text-cyan-700">View pricing</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <DashboardBoard
          projects={openProjects}
          archivedProjects={archivedProjects}
        />
      </div>
    </OuterPortalShell>
  );
}
