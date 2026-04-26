import type { ProjectBrief } from "../project-brief.ts";
import type { ArchitectureBlueprint, ArchitectureInputId } from "../architecture/types.ts";
import { getRoadmapDomainDefaults } from "./defaults.ts";
import { buildRoadmapCriticalPath } from "./critical-path.ts";
import {
  buildRoadmapOpenQuestions,
  buildRoadmapPhases,
  determineMissingCriticalScopeInputs,
  orderRoadmapPhases
} from "./phase-planner.ts";
import {
  mvpDefinitionSchema,
  roadmapApprovalReadinessSchema,
  roadmapAssumptionSchema,
  roadmapPlanSchema,
  roadmapRiskSchema,
  type RoadmapPlan
} from "./types.ts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSpace(value).toLowerCase();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalizeSpace(value));
  }

  return items;
}

function buildRoadmapRef(args: {
  workspaceId?: string | null;
  projectId: string;
}) {
  return `${cleanText(args.workspaceId) || "workspace"}:${args.projectId}:roadmap-plan`;
}

function buildArchitectureRef(args: {
  workspaceId?: string | null;
  projectId: string;
}) {
  return `${cleanText(args.workspaceId) || "workspace"}:${args.projectId}:architecture-blueprint`;
}

function scoreRoadmapReadiness(args: {
  architectureBlueprint: ArchitectureBlueprint;
  defaults: ReturnType<typeof getRoadmapDomainDefaults>;
  missingCriticalScopeInputs: readonly ArchitectureInputId[];
}) {
  if (args.defaults.requiredScopeInputs.length === 0) {
    return args.architectureBlueprint.readinessScore;
  }

  const scopeCompletion =
    (args.defaults.requiredScopeInputs.length - args.missingCriticalScopeInputs.length) /
    args.defaults.requiredScopeInputs.length;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(scopeCompletion * 70 + (args.architectureBlueprint.readinessScore / 100) * 30)
    )
  );
}

function buildRoadmapStatus(args: {
  readinessScore: number;
  architectureBlueprint: ArchitectureBlueprint;
  missingCriticalScopeInputs: readonly ArchitectureInputId[];
}) {
  if (
    args.missingCriticalScopeInputs.length === 0 &&
    args.architectureBlueprint.missingCriticalArchitectureInputs.length === 0 &&
    args.readinessScore >= 85
  ) {
    return "approval_ready" as const;
  }

  if (args.readinessScore >= 55) {
    return "review_ready" as const;
  }

  return "draft" as const;
}

function buildMvpDefinition(args: {
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  phases: RoadmapPlan["phases"];
  defaults: ReturnType<typeof getRoadmapDomainDefaults>;
}) {
  const phaseTemplateById = new Map(
    args.defaults.phaseTemplates.map((template) => [template.phaseId, template])
  );
  const mvpPhases = args.phases.filter(
    (phase) => phaseTemplateById.get(phase.phaseId)?.mvpIncluded !== false
  );
  const includedPhaseIds = mvpPhases.map((phase) => phase.phaseId);
  const includedModuleIds = uniqueStrings(mvpPhases.flatMap((phase) => phase.moduleIds));
  const includedLaneIds = uniqueStrings(mvpPhases.flatMap((phase) => phase.laneIds));
  const moduleById = new Map(
    args.architectureBlueprint.modules.map((module) => [module.id, module])
  );
  const includedSurfaces = uniqueStrings([
    ...includedModuleIds
      .map((moduleId) => moduleById.get(moduleId)?.ownedSurface ?? null)
      .filter((surface): surface is string => Boolean(surface)),
    ...args.architectureBlueprint.surfaces
  ]);
  const deferredItems = uniqueStrings([
    ...args.projectBrief.niceToHaveFeatures,
    ...args.projectBrief.excludedFeatures,
    ...args.phases
      .filter((phase) => !includedPhaseIds.includes(phase.phaseId))
      .flatMap((phase) => phase.notInScope.map((item) => item.label)),
    ...mvpPhases.flatMap((phase) => phase.notInScope.map((item) => item.label))
  ]);

  return mvpDefinitionSchema.parse({
    summary: args.defaults.mvpSummary,
    targetPersonas: uniqueStrings([
      ...args.projectBrief.buyerPersonas,
      ...args.projectBrief.operatorPersonas
    ]),
    mustHaveFeatures: [...args.projectBrief.mustHaveFeatures],
    includedPhaseIds,
    includedModuleIds,
    includedLaneIds,
    includedSurfaces,
    deferredItems
  });
}

function buildRoadmapRisks(args: {
  architectureBlueprint: ArchitectureBlueprint;
  phases: RoadmapPlan["phases"];
}) {
  const phaseIdsByModuleId = new Map<string, string[]>();

  for (const phase of args.phases) {
    for (const moduleId of phase.moduleIds) {
      phaseIdsByModuleId.set(moduleId, [
        ...(phaseIdsByModuleId.get(moduleId) ?? []),
        phase.phaseId
      ]);
    }
  }

  return args.architectureBlueprint.architectureRisks.map((risk) =>
    roadmapRiskSchema.parse({
      id: risk.id,
      title: risk.title,
      severity: risk.severity,
      area: risk.area,
      description: risk.description,
      mitigation: risk.mitigation,
      relatedPhaseIds: uniqueStrings(
        risk.relatedModuleIds.flatMap((moduleId) => phaseIdsByModuleId.get(moduleId) ?? [])
      ),
      relatedModuleIds: [...risk.relatedModuleIds]
    })
  );
}

function buildAssumptions(args: {
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  phases: RoadmapPlan["phases"];
  missingCriticalScopeInputs: readonly ArchitectureInputId[];
}) {
  const phaseIds = args.phases.map((phase) => phase.phaseId);
  const assumptions = uniqueStrings([
    ...args.projectBrief.assumptionsMade,
    ...args.architectureBlueprint.assumptionsMade,
    "Sequenced roadmap phases from the architecture lane dependencies instead of freeform transcript parsing."
  ]);
  const scopedAssumptions = [...assumptions];

  if (args.missingCriticalScopeInputs.includes("walletConnectionMvp")) {
    scopedAssumptions.push(
      "Assumed wallet connection stays out of the MVP critical path until Strategy Room confirms it."
    );
  }

  if (args.missingCriticalScopeInputs.includes("firstPosConnector")) {
    scopedAssumptions.push(
      "Assumed the MVP roadmap lands one POS connector before any broader connector catalog."
    );
  }

  if (args.missingCriticalScopeInputs.includes("launchReports")) {
    scopedAssumptions.push(
      "Assumed launch reporting stays tight around the minimum owner and manager report set until it is explicitly confirmed."
    );
  }

  return uniqueStrings(scopedAssumptions).map((statement, index) =>
    roadmapAssumptionSchema.parse({
      id: `roadmap-assumption-${index + 1}`,
      statement,
      affectsPhaseIds: [...phaseIds]
    })
  );
}

function buildSequencingNotes(args: {
  defaults: ReturnType<typeof getRoadmapDomainDefaults>;
  roadmapStatus: RoadmapPlan["status"];
  missingCriticalScopeInputs: readonly ArchitectureInputId[];
  openQuestionLabels: readonly string[];
}) {
  const sequencingNotes = [...args.defaults.sequencingNotes];

  if (args.missingCriticalScopeInputs.length > 0 && args.openQuestionLabels.length > 0) {
    sequencingNotes.push(
      `Treat this roadmap as ${args.roadmapStatus.replace(/_/g, " ")} until ${args.openQuestionLabels.join(
        ", "
      )} are resolved.`
    );
  }

  return uniqueStrings(sequencingNotes);
}

export type RoadmapPlanGeneratorInput = {
  workspaceId?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
};

export function generateRoadmapPlan(args: RoadmapPlanGeneratorInput): RoadmapPlan {
  const defaults = getRoadmapDomainDefaults(args.projectBrief.domainPack);
  const workspaceId = cleanText(args.workspaceId) || args.architectureBlueprint.workspaceId || null;
  const projectId = cleanText(args.projectId) || args.architectureBlueprint.projectId;
  const projectName =
    cleanText(args.projectName) || args.architectureBlueprint.projectName || null;
  const missingCriticalScopeInputs = determineMissingCriticalScopeInputs({
    projectBrief: args.projectBrief,
    defaults
  });
  const unorderedPhases = buildRoadmapPhases({
    projectBrief: args.projectBrief,
    blueprint: args.architectureBlueprint,
    defaults,
    missingCriticalScopeInputs
  });
  const phases = orderRoadmapPhases(unorderedPhases);
  const criticalPath = buildRoadmapCriticalPath({
    phases,
    blueprint: args.architectureBlueprint
  });
  const openQuestions = buildRoadmapOpenQuestions({
    blueprint: args.architectureBlueprint,
    phases,
    missingCriticalScopeInputs
  });
  const readinessScore = scoreRoadmapReadiness({
    architectureBlueprint: args.architectureBlueprint,
    defaults,
    missingCriticalScopeInputs
  });
  const status = buildRoadmapStatus({
    readinessScore,
    architectureBlueprint: args.architectureBlueprint,
    missingCriticalScopeInputs
  });
  const mvpDefinition = buildMvpDefinition({
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    phases,
    defaults
  });
  const roadmapRisks = buildRoadmapRisks({
    architectureBlueprint: args.architectureBlueprint,
    phases
  });
  const assumptionsMade = buildAssumptions({
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    phases,
    missingCriticalScopeInputs
  });
  const sequencingNotes = buildSequencingNotes({
    defaults,
    roadmapStatus: status,
    missingCriticalScopeInputs,
    openQuestionLabels: openQuestions
      .filter((question) => question.blockingLevel !== "low")
      .map((question) => question.label)
  });
  const approvalReadiness = roadmapApprovalReadinessSchema.parse({
    status,
    readyForStrategyReview: phases.length > 0,
    readyForApproval: status === "approval_ready"
  });

  return roadmapPlanSchema.parse({
    roadmapId: buildRoadmapRef({
      workspaceId,
      projectId
    }),
    workspaceId,
    projectId,
    projectName,
    sourceProjectBriefRef:
      args.architectureBlueprint.sourceProjectBriefRef ||
      `${workspaceId || "workspace"}:${projectId}:project-brief`,
    sourceArchitectureBlueprintRef: buildArchitectureRef({
      workspaceId,
      projectId
    }),
    domainPack: args.projectBrief.domainPack,
    status,
    approvalReadiness,
    mvpDefinition,
    phases,
    criticalPath,
    sequencingNotes,
    roadmapRisks,
    openQuestions,
    readinessScore,
    missingCriticalScopeInputs,
    assumptionsMade
  });
}
