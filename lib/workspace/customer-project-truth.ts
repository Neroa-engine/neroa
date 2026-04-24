import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";
import type { ProjectLanePhaseId } from "@/lib/workspace/project-lanes";

export type CustomerFacingProjectStatusTone = "default" | "cyan" | "amber" | "emerald";
export type CustomerFacingProjectStateKind = "current" | "archived" | "legacy";
export type CustomerFacingWorkspaceClassification = {
  currentWorkspaceIds: string[];
  archivedWorkspaceIds: string[];
  legacyWorkspaceIds: string[];
  currentCount: number;
  archivedCount: number;
  legacyCount: number;
};

const customerProjectStageOrder = [
  "Planning",
  "Scope",
  "Build",
  "Launch",
  "Operate"
] as const;

function mapPhaseIdToStageIndex(phaseId: ProjectLanePhaseId | null | undefined) {
  switch (phaseId) {
    case "budget":
      return 1;
    case "build":
      return 2;
    case "launch":
      return 3;
    case "operations":
      return 4;
    case "strategy":
    default:
      return 0;
  }
}

export function buildCustomerFacingStageSummary(phaseId: ProjectLanePhaseId | null | undefined) {
  switch (phaseId) {
    case "budget":
      return "Sizing the first version, operating constraints, and the shape of the initial scope.";
    case "build":
      return "Turning the approved scope into a build-ready product and execution plan.";
    case "launch":
      return "Preparing release readiness, rollout motion, and launch follow-through.";
    case "operations":
      return "Running the project through ongoing execution, maintenance, and follow-through.";
    case "strategy":
    default:
      return "Clarifying the product direction, audience, and first version before execution widens.";
  }
}

export function buildCustomerFacingStageLabel(phaseId: ProjectLanePhaseId | null | undefined) {
  return customerProjectStageOrder[mapPhaseIdToStageIndex(phaseId)];
}

export function buildCustomerFacingProjectStatus(args: {
  phaseId: ProjectLanePhaseId | null | undefined;
  archived: boolean;
  legacyReason: string | null;
}) {
  if (args.archived) {
    return {
      label: "Archived",
      tone: "amber"
    } satisfies { label: string; tone: CustomerFacingProjectStatusTone };
  }

  if (args.legacyReason) {
    return {
      label: "Legacy",
      tone: "amber"
    } satisfies { label: string; tone: CustomerFacingProjectStatusTone };
  }

  switch (args.phaseId) {
    case "operations":
      return {
        label: "Live",
        tone: "emerald"
      } satisfies { label: string; tone: CustomerFacingProjectStatusTone };
    case "launch":
      return {
        label: "Launch Prep",
        tone: "cyan"
      } satisfies { label: string; tone: CustomerFacingProjectStatusTone };
    case "build":
      return {
        label: "In Build",
        tone: "cyan"
      } satisfies { label: string; tone: CustomerFacingProjectStatusTone };
    case "budget":
      return {
        label: "Scoping",
        tone: "default"
      } satisfies { label: string; tone: CustomerFacingProjectStatusTone };
    case "strategy":
    default:
      return {
        label: "Planning",
        tone: "default"
      } satisfies { label: string; tone: CustomerFacingProjectStatusTone };
  }
}

export function buildCustomerFacingPhaseTrack(phaseId: ProjectLanePhaseId | null | undefined) {
  const currentIndex = mapPhaseIdToStageIndex(phaseId);

  return customerProjectStageOrder.map((label, index) => ({
    label,
    state:
      index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming"
  })) as Array<{
    label: string;
    state: "complete" | "current" | "upcoming";
  }>;
}

export function getCustomerFacingLegacyProjectReason(description: string | null) {
  const parsed = parseWorkspaceProjectDescription(description);
  const metadata = parsed.metadata;

  if (!metadata) {
    return "Created before Neroa stored structured planning metadata.";
  }

  if (
    metadata.buildSession ||
    metadata.guidedEntryContext ||
    metadata.saasIntake ||
    metadata.mobileAppIntake
  ) {
    return null;
  }

  return "Missing the current planning-center metadata, so it is being treated as a legacy record.";
}

export function getCustomerFacingProjectState(description: string | null) {
  const parsed = parseWorkspaceProjectDescription(description);
  const archived = Boolean(parsed.metadata?.archived);
  const legacyReason = archived ? null : getCustomerFacingLegacyProjectReason(description);
  const kind: CustomerFacingProjectStateKind = archived
    ? "archived"
    : legacyReason
      ? "legacy"
      : "current";

  return {
    parsed,
    archived,
    legacyReason,
    kind,
    countsTowardCurrentProjects: !archived && !legacyReason
  };
}

export function classifyCustomerFacingWorkspaces<
  TWorkspace extends {
    id: string;
    description: string | null;
  }
>(workspaces: TWorkspace[]): CustomerFacingWorkspaceClassification {
  const currentWorkspaceIds: string[] = [];
  const archivedWorkspaceIds: string[] = [];
  const legacyWorkspaceIds: string[] = [];

  for (const workspace of workspaces) {
    const state = getCustomerFacingProjectState(workspace.description);

    if (state.kind === "archived") {
      archivedWorkspaceIds.push(workspace.id);
      continue;
    }

    if (state.kind === "legacy") {
      legacyWorkspaceIds.push(workspace.id);
      continue;
    }

    currentWorkspaceIds.push(workspace.id);
  }

  return {
    currentWorkspaceIds,
    archivedWorkspaceIds,
    legacyWorkspaceIds,
    currentCount: currentWorkspaceIds.length,
    archivedCount: archivedWorkspaceIds.length,
    legacyCount: legacyWorkspaceIds.length
  };
}
