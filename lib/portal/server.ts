import { cookies } from "next/headers";
import type { AccessibleWorkspaceRecord, ServerSupabaseClient } from "@/lib/platform/foundation";
import { listAccessibleWorkspaces } from "@/lib/platform/foundation";
import { APP_ROUTES } from "@/lib/routes";
import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";
import {
  buildProjectModel,
  getFirstProjectLane,
  getProjectLanePhaseForLane,
  type ProjectLanePhaseId
} from "@/lib/workspace/project-lanes";
import {
  ACTIVE_PROJECT_COOKIE,
  loadPersistedActiveProjectId,
  resolveActiveProjectId
} from "@/lib/portal/active-project";
import {
  buildProjectRoomRoute,
  buildProjectWorkspaceRoute
} from "@/lib/portal/routes";
import {
  buildCustomerFacingProjectStatus,
  buildCustomerFacingStageLabel,
  getCustomerFacingProjectState
} from "@/lib/workspace/customer-project-truth";

export type PortalProjectSummary = {
  workspaceId: string;
  projectId: string;
  title: string;
  description: string | null;
  templateLabel: string;
  phaseId: ProjectLanePhaseId;
  phaseLabel: string;
  statusLabel: string;
  archived: boolean;
  customerFacingState: "current" | "archived" | "legacy";
  countsTowardCurrentProjects: boolean;
  accessMode: "owner" | "member";
  workspaceRoute: string;
  strategyRoomRoute: string;
  commandCenterRoute: string;
  buildRoomRoute: string;
};

function firstText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

type PortalWorkspaceSource = Pick<
  AccessibleWorkspaceRecord,
  "id" | "name" | "description" | "created_at" | "owner_id"
> & {
  accessMode: string;
};

export function buildPortalProjectSummary(workspace: PortalWorkspaceSource): PortalProjectSummary {
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const project = buildProjectModel({
    workspaceId: workspace.id,
    projectId: workspace.id,
    title: workspace.name,
    description: parsed.visibleDescription,
    templateId: parsed.metadata?.templateId ?? null,
    customLanes: parsed.metadata?.customLanes ?? []
  });
  const featuredLane = getFirstProjectLane(project);
  const leadingPhase = featuredLane ? getProjectLanePhaseForLane(featuredLane) : null;
  const customerProjectState = getCustomerFacingProjectState(workspace.description);
  const status = buildCustomerFacingProjectStatus({
    phaseId: leadingPhase?.id,
    archived: customerProjectState.archived,
    legacyReason: customerProjectState.legacyReason
  });
  const description = firstText(
    parsed.metadata?.buildSession?.scope.summary,
    parsed.metadata?.saasIntake?.projectSummary,
    parsed.metadata?.mobileAppIntake?.projectSummary,
    parsed.visibleDescription
  );

  return {
    workspaceId: workspace.id,
    projectId: workspace.id,
    title: project.title,
    description,
    templateLabel:
      parsed.metadata?.buildSession?.scope.productTypeLabel ??
      parsed.metadata?.buildSession?.scope.buildTypeLabel ??
      project.templateLabel,
    phaseId: leadingPhase?.id ?? "strategy",
    phaseLabel: buildCustomerFacingStageLabel(leadingPhase?.id),
    statusLabel: status.label,
    archived: customerProjectState.archived,
    customerFacingState: customerProjectState.kind,
    countsTowardCurrentProjects: customerProjectState.countsTowardCurrentProjects,
    accessMode: workspace.accessMode === "member" ? "member" : "owner",
    workspaceRoute: buildProjectWorkspaceRoute(workspace.id),
    strategyRoomRoute: buildProjectRoomRoute(workspace.id, "strategy-room"),
    commandCenterRoute: buildProjectRoomRoute(workspace.id, "command-center"),
    buildRoomRoute: buildProjectRoomRoute(workspace.id, "build-room")
  };
}

export function listSelectablePortalProjects(projects: PortalProjectSummary[]) {
  return projects.filter((project) => project.customerFacingState === "current");
}

export async function loadPortalProjectSummariesForUser(args: {
  supabase: ServerSupabaseClient;
  userId: string;
}) {
  const workspaces = await listAccessibleWorkspaces(args).catch(() => []);
  return workspaces.map((workspace) => buildPortalProjectSummary(workspace));
}

export async function resolveActivePortalProject(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  projects: PortalProjectSummary[];
}) {
  const persistedActiveProjectId = await loadPersistedActiveProjectId({
    supabase: args.supabase,
    userId: args.userId
  }).catch(() => null);
  const selectableProjects = listSelectablePortalProjects(args.projects);
  const activeProjectId = resolveActiveProjectId({
    cookieValue: cookies().get(ACTIVE_PROJECT_COOKIE)?.value ?? null,
    persistedValue: persistedActiveProjectId,
    accessibleWorkspaceIds: selectableProjects.map((project) => project.workspaceId)
  });

  if (!activeProjectId) {
    return null;
  }

  return selectableProjects.find((project) => project.workspaceId === activeProjectId) ?? null;
}

function projectNeedsStrategyResume(project: PortalProjectSummary) {
  return project.phaseId === "strategy" || project.phaseId === "budget";
}

export function resolveSmartResumeDestinationForProject(project: PortalProjectSummary) {
  if (projectNeedsStrategyResume(project)) {
    return project.strategyRoomRoute;
  }

  return project.workspaceRoute;
}

export async function resolveSmartResumeDestination(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  projects: PortalProjectSummary[];
}) {
  const activeProject = await resolveActivePortalProject(args);

  if (activeProject) {
    return resolveSmartResumeDestinationForProject(activeProject);
  }

  const fallbackProject = listSelectablePortalProjects(args.projects)[0] ?? null;

  return fallbackProject
    ? resolveSmartResumeDestinationForProject(fallbackProject)
    : APP_ROUTES.projects;
}

export async function resolveStrategyRoomLaunchDestination(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  projects: PortalProjectSummary[];
}) {
  const activeProject = await resolveActivePortalProject(args);

  if (activeProject) {
    return activeProject.strategyRoomRoute;
  }

  const selectableProjects = listSelectablePortalProjects(args.projects);

  if (selectableProjects.length > 0) {
    return APP_ROUTES.projects;
  }

  return APP_ROUTES.projectsNew;
}
