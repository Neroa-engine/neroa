import type {
  ArchitectureBlueprint,
  ArchitectureInputId
} from "../architecture/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { RoadmapDomainDefaults } from "./defaults.ts";
import {
  acceptanceCriterionSchema,
  notInScopeItemSchema,
  roadmapOpenQuestionSchema,
  roadmapPhaseSchema,
  type RoadmapOpenQuestion,
  type RoadmapPhase
} from "./types.ts";

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function joinList(values: readonly string[]) {
  if (values.length === 0) {
    return null;
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function buildPhaseModuleIds(args: {
  blueprint: ArchitectureBlueprint;
  laneIds: readonly string[];
}) {
  const laneById = new Map(args.blueprint.lanes.map((lane) => [lane.id, lane]));

  return uniqueStrings(
    args.laneIds.flatMap((laneId) => {
      const lane = laneById.get(laneId);

      if (lane) {
        return lane.ownedModuleIds;
      }

      return args.blueprint.modules
        .filter((module) => module.laneId === laneId)
        .map((module) => module.id);
    })
  );
}

function buildPhaseSurfaceNames(args: {
  blueprint: ArchitectureBlueprint;
  moduleIds: readonly string[];
}) {
  const moduleById = new Map(args.blueprint.modules.map((module) => [module.id, module]));

  return uniqueStrings(
    args.moduleIds
      .map((moduleId) => moduleById.get(moduleId)?.ownedSurface ?? null)
      .filter((surface): surface is string => Boolean(surface))
  );
}

function buildPhaseDependencies(args: {
  blueprint: ArchitectureBlueprint;
  laneIds: readonly string[];
  phaseId: string;
  phaseIdByLaneId: Map<string, string>;
  phaseTemplateById: Map<string, RoadmapDomainDefaults["phaseTemplates"][number]>;
}) {
  const laneById = new Map(args.blueprint.lanes.map((lane) => [lane.id, lane]));
  const dependsOnPhaseIds = uniqueStrings([
    ...args.laneIds.flatMap((laneId) => {
      const lane = laneById.get(laneId);

      if (!lane) {
        return [];
      }

      return lane.dependsOnLaneIds
        .map((dependencyLaneId) => args.phaseIdByLaneId.get(dependencyLaneId) ?? null)
        .filter((phaseId): phaseId is string => Boolean(phaseId && phaseId !== args.phaseId));
    }),
    ...(args.phaseTemplateById.get(args.phaseId)?.additionalDependsOnPhaseIds ?? [])
  ]);

  return dependsOnPhaseIds.filter((phaseId) => phaseId !== args.phaseId);
}

function buildPhasePrerequisites(args: {
  dependsOnPhaseIds: readonly string[];
  phaseTemplateById: Map<string, RoadmapDomainDefaults["phaseTemplates"][number]>;
  missingScopeQuestionLabels: readonly string[];
}) {
  return uniqueStrings([
    ...args.dependsOnPhaseIds.map((phaseId) => {
      const template = args.phaseTemplateById.get(phaseId);
      return template ? `Complete ${template.name}` : `Complete ${phaseId}`;
    }),
    ...args.missingScopeQuestionLabels.map((label) => `Confirm ${label}`)
  ]);
}

function buildPhaseDeliverables(args: {
  deliverableHints: readonly string[];
  moduleNames: readonly string[];
  surfaceNames: readonly string[];
}) {
  const deliverables = [...args.deliverableHints];
  const moduleSummary = joinList(args.moduleNames);
  const surfaceSummary = joinList(args.surfaceNames);

  if (moduleSummary) {
    deliverables.push(`Modules in scope: ${moduleSummary}.`);
  }

  if (surfaceSummary) {
    deliverables.push(`Surface scope for this phase: ${surfaceSummary}.`);
  }

  return uniqueStrings(deliverables);
}

function buildPhaseAcceptanceCriteria(args: {
  phaseId: string;
  laneIds: readonly string[];
  moduleIds: readonly string[];
  acceptanceCriteria: RoadmapDomainDefaults["phaseTemplates"][number]["acceptanceCriteria"];
}) {
  return args.acceptanceCriteria.map((criterion, index) =>
    acceptanceCriterionSchema.parse({
      id: `${args.phaseId}-acceptance-${index + 1}`,
      label: criterion.label,
      description: criterion.description,
      moduleIds: [...args.moduleIds],
      laneIds: [...args.laneIds]
    })
  );
}

function buildDynamicNotInScopeItems(args: {
  phaseId: string;
  projectBrief: ProjectBrief;
  missingScopeQuestionLabels: readonly string[];
}) {
  const items = [
    ...args.projectBrief.excludedFeatures.map((feature, index) =>
      notInScopeItemSchema.parse({
        id: `${args.phaseId}-excluded-${slugify(feature) || index + 1}`,
        label: feature,
        reason: "The current ProjectBrief already marks this outside the scoped product boundary.",
        deferredBecause: "mvp_boundary"
      })
    ),
    ...args.missingScopeQuestionLabels.map((label) =>
      notInScopeItemSchema.parse({
        id: `${args.phaseId}-scope-open-${slugify(label)}`,
        label: `Unconfirmed ${label.toLowerCase()}`,
        reason: "This scope choice stays out of the committed phase until Strategy Room resolves it.",
        deferredBecause: "scope_decision"
      })
    )
  ];

  return items.slice(0, 3);
}

function buildPhaseNotInScope(args: {
  phaseId: string;
  projectBrief: ProjectBrief;
  templateItems: RoadmapDomainDefaults["phaseTemplates"][number]["notInScope"];
  missingScopeQuestionLabels: readonly string[];
}) {
  return uniqueStrings(
    [
      ...args.templateItems.map((item) => item.label),
      ...buildDynamicNotInScopeItems(args).map((item) => item.label)
    ]
  ).map((label) => {
    const templateItem = args.templateItems.find((item) => item.label === label);
    const dynamicItem = buildDynamicNotInScopeItems(args).find((item) => item.label === label);

    if (templateItem) {
      return notInScopeItemSchema.parse({
        id: `${args.phaseId}-out-${slugify(templateItem.label)}`,
        label: templateItem.label,
        reason: templateItem.reason,
        deferredBecause: templateItem.deferredBecause
      });
    }

    return dynamicItem!;
  });
}

function buildPhaseRiskNotes(args: {
  templateRiskNotes: readonly string[];
  blueprint: ArchitectureBlueprint;
  moduleIds: readonly string[];
}) {
  const relevantRiskTitles = args.blueprint.architectureRisks
    .filter((risk) => risk.relatedModuleIds.some((moduleId) => args.moduleIds.includes(moduleId)))
    .map((risk) => `Keep visible: ${risk.title}.`);

  return uniqueStrings([...args.templateRiskNotes, ...relevantRiskTitles]);
}

function buildPhaseWorktreeHints(args: {
  blueprint: ArchitectureBlueprint;
  laneIds: readonly string[];
}) {
  return uniqueStrings(
    args.blueprint.worktrees
      .filter((worktree) => args.laneIds.includes(worktree.laneId))
      .map((worktree) => worktree.branchName)
  );
}

export function determineMissingCriticalScopeInputs(args: {
  projectBrief: ProjectBrief;
  defaults: RoadmapDomainDefaults;
}) {
  const missingSlots = new Set(args.projectBrief.missingCriticalSlots);

  return args.defaults.requiredScopeInputs.filter((inputId) => missingSlots.has(inputId));
}

export function buildRoadmapPhases(args: {
  projectBrief: ProjectBrief;
  blueprint: ArchitectureBlueprint;
  defaults: RoadmapDomainDefaults;
  missingCriticalScopeInputs: readonly ArchitectureInputId[];
}) {
  const laneIds = new Set(args.blueprint.lanes.map((lane) => lane.id));
  const moduleById = new Map(args.blueprint.modules.map((module) => [module.id, module]));
  const phaseIdByLaneId = new Map<string, string>();
  const phaseTemplateById = new Map(
    args.defaults.phaseTemplates.map((template) => [template.phaseId, template])
  );

  for (const template of args.defaults.phaseTemplates) {
    for (const laneId of template.laneIds) {
      if (laneIds.has(laneId)) {
        phaseIdByLaneId.set(laneId, template.phaseId);
      }
    }
  }

  return args.defaults.phaseTemplates.map((template) => {
    const activeLaneIds = template.laneIds.filter((laneId) => laneIds.has(laneId));
    const moduleIds = buildPhaseModuleIds({
      blueprint: args.blueprint,
      laneIds: activeLaneIds
    });
    const moduleNames = moduleIds
      .map((moduleId) => moduleById.get(moduleId)?.name ?? null)
      .filter((name): name is string => Boolean(name));
    const surfaceNames = buildPhaseSurfaceNames({
      blueprint: args.blueprint,
      moduleIds
    });
    const dependsOnPhaseIds = buildPhaseDependencies({
      blueprint: args.blueprint,
      laneIds: activeLaneIds,
      phaseId: template.phaseId,
      phaseIdByLaneId,
      phaseTemplateById
    });
    const missingScopeQuestionLabels = uniqueStrings(
      args.blueprint.openQuestions
        .filter(
          (question) =>
            args.missingCriticalScopeInputs.includes(question.inputId) &&
            question.relatedModuleIds.some((moduleId) => moduleIds.includes(moduleId))
        )
        .map((question) => question.label)
    );

    return roadmapPhaseSchema.parse({
      phaseId: template.phaseId,
      name: template.name,
      goal: template.goal,
      deliverables: buildPhaseDeliverables({
        deliverableHints: template.deliverableHints,
        moduleNames,
        surfaceNames
      }),
      moduleIds,
      laneIds: activeLaneIds,
      prerequisites: buildPhasePrerequisites({
        dependsOnPhaseIds,
        phaseTemplateById,
        missingScopeQuestionLabels
      }),
      dependsOnPhaseIds,
      acceptanceCriteria: buildPhaseAcceptanceCriteria({
        phaseId: template.phaseId,
        laneIds: activeLaneIds,
        moduleIds,
        acceptanceCriteria: template.acceptanceCriteria
      }),
      notInScope: buildPhaseNotInScope({
        phaseId: template.phaseId,
        projectBrief: args.projectBrief,
        templateItems: template.notInScope,
        missingScopeQuestionLabels
      }),
      riskNotes: buildPhaseRiskNotes({
        templateRiskNotes: template.riskNotes,
        blueprint: args.blueprint,
        moduleIds
      }),
      worktreeHints: buildPhaseWorktreeHints({
        blueprint: args.blueprint,
        laneIds: activeLaneIds
      }),
      targetOutcome: template.targetOutcome
    });
  });
}

export function orderRoadmapPhases(phases: readonly RoadmapPhase[]) {
  const phaseById = new Map(phases.map((phase) => [phase.phaseId, phase]));
  const inDegree = new Map(phases.map((phase) => [phase.phaseId, 0]));
  const dependents = new Map<string, string[]>();

  for (const phase of phases) {
    for (const dependencyPhaseId of phase.dependsOnPhaseIds) {
      if (!phaseById.has(dependencyPhaseId)) {
        continue;
      }

      inDegree.set(phase.phaseId, (inDegree.get(phase.phaseId) ?? 0) + 1);
      dependents.set(dependencyPhaseId, [
        ...(dependents.get(dependencyPhaseId) ?? []),
        phase.phaseId
      ]);
    }
  }

  const originalOrder = new Map(phases.map((phase, index) => [phase.phaseId, index]));
  const queue = phases
    .filter((phase) => (inDegree.get(phase.phaseId) ?? 0) === 0)
    .sort(
      (left, right) =>
        (originalOrder.get(left.phaseId) ?? 0) - (originalOrder.get(right.phaseId) ?? 0)
    )
    .map((phase) => phase.phaseId);
  const ordered: RoadmapPhase[] = [];

  while (queue.length > 0) {
    const phaseId = queue.shift()!;
    const phase = phaseById.get(phaseId);

    if (!phase) {
      continue;
    }

    ordered.push(phase);

    for (const dependentId of dependents.get(phaseId) ?? []) {
      const nextInDegree = (inDegree.get(dependentId) ?? 0) - 1;
      inDegree.set(dependentId, nextInDegree);

      if (nextInDegree === 0) {
        queue.push(dependentId);
        queue.sort(
          (left, right) =>
            (originalOrder.get(left) ?? 0) - (originalOrder.get(right) ?? 0)
        );
      }
    }
  }

  if (ordered.length !== phases.length) {
    return [...phases];
  }

  return ordered;
}

function buildQuestionRelatedPhaseIds(args: {
  phases: readonly RoadmapPhase[];
  inputId: ArchitectureInputId;
  relatedModuleIds: readonly string[];
}) {
  const directMatches = uniqueStrings(
    args.phases
      .filter((phase) => phase.moduleIds.some((moduleId) => args.relatedModuleIds.includes(moduleId)))
      .map((phase) => phase.phaseId)
  );

  if (directMatches.length > 0) {
    return directMatches;
  }

  if (
    args.inputId === "chainsInScope" ||
    args.inputId === "riskSignalSources" ||
    args.inputId === "firstPosConnector"
  ) {
    return args.phases.slice(0, 2).map((phase) => phase.phaseId);
  }

  if (
    args.inputId === "walletConnectionMvp" ||
    args.inputId === "launchReports" ||
    args.inputId === "analyticsVsStaffWorkflows"
  ) {
    return args.phases.slice(1, 3).map((phase) => phase.phaseId);
  }

  return args.phases.slice(0, 1).map((phase) => phase.phaseId);
}

function buildBlockingLevel(args: {
  inputId: ArchitectureInputId;
  missingCriticalScopeInputs: readonly ArchitectureInputId[];
  stage: RoadmapOpenQuestion["stage"];
}) {
  if (args.missingCriticalScopeInputs.includes(args.inputId)) {
    return args.stage === "roadmap" ? "high" : "medium";
  }

  if (args.stage === "roadmap") {
    return "medium";
  }

  return "low";
}

export function buildRoadmapOpenQuestions(args: {
  blueprint: ArchitectureBlueprint;
  phases: readonly RoadmapPhase[];
  missingCriticalScopeInputs: readonly ArchitectureInputId[];
}) {
  return args.blueprint.openQuestions.map((question, index) =>
    roadmapOpenQuestionSchema.parse({
      id: `roadmap-question-${slugify(question.inputId)}-${index + 1}`,
      inputId: question.inputId,
      label: question.label,
      question: question.question,
      stage: question.stage,
      whyItMatters: question.whyItMatters,
      relatedPhaseIds: buildQuestionRelatedPhaseIds({
        phases: args.phases,
        inputId: question.inputId,
        relatedModuleIds: question.relatedModuleIds
      }),
      blockingLevel: buildBlockingLevel({
        inputId: question.inputId,
        missingCriticalScopeInputs: args.missingCriticalScopeInputs,
        stage: question.stage
      })
    })
  );
}
