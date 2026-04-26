import type { StoredGovernanceState, StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import type { ProjectBriefSlotId } from "../domain-contracts.ts";
import { buildDomainGuidanceModel } from "../domain-generalization.ts";
import {
  projectBriefReadinessSchema,
  projectBriefSchema,
  type ProjectBrief
} from "../project-brief.ts";
import { generateArchitectureBlueprint } from "../architecture/generator.ts";
import { architectureBlueprintSchema, type ArchitectureBlueprint } from "../architecture/types.ts";
import { generateRoadmapPlan } from "../roadmap/generator.ts";
import {
  notInScopeItemSchema,
  roadmapAssumptionSchema,
  roadmapPlanSchema,
  type RoadmapPlan
} from "../roadmap/types.ts";
import { generateGovernancePolicy } from "../governance/generator.ts";
import {
  governanceAssumptionSchema,
  governancePolicySchema,
  type GovernancePolicy
} from "../governance/types.ts";
import type { StrategyAnsweredInput, StrategyOverrideState } from "./types.ts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value: string) {
  return normalizeSpace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSearchText(value);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalizeSpace(value));
  }

  return items;
}

function splitLooseList(value?: string | null) {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return [];
  }

  return uniqueStrings(
    cleaned
      .split(/\s*(?:,|\/| and | & )\s*/i)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function mergeStringList(current: readonly string[], next?: readonly string[]) {
  return next && next.length > 0 ? uniqueStrings(next) : [...current];
}

function removeMatchingItems(values: readonly string[], pattern: RegExp) {
  return values.filter((value) => !pattern.test(value.toLowerCase()));
}

function upsertLabeledValue(values: readonly string[], label: string, value: string) {
  const normalizedLabel = label.toLowerCase();
  const filtered = values.filter((item) => !item.toLowerCase().startsWith(normalizedLabel));
  return uniqueStrings([...filtered, `${label} ${normalizeSpace(value)}`]);
}

function upsertFeature(values: readonly string[], feature: string) {
  return uniqueStrings([...values, feature]);
}

function removeFeature(values: readonly string[], pattern: RegExp) {
  return values.filter((value) => !pattern.test(value.toLowerCase()));
}

function answerMap(answeredInputs: readonly StrategyAnsweredInput[]) {
  return new Map(answeredInputs.map((item) => [item.inputId, item.value]));
}

function isWalletOutOfMvp(value: string) {
  return /\bnot in mvp\b|\bout of mvp\b|\banalytics only\b|\bwithout wallet\b|\bnot included\b/.test(
    normalizeSearchText(value)
  );
}

function isAnalyticsOnly(value: string) {
  return /\banalytics only\b|\breporting only\b|\bresearch only\b|\bnot financial advice\b/.test(
    normalizeSearchText(value)
  );
}

function isSingleLocation(value: string) {
  return /\bsingle location\b|\bsingle-location\b/.test(normalizeSearchText(value));
}

function applyAnsweredInputToBrief(args: {
  answer: StrategyAnsweredInput;
  brief: ProjectBrief;
}) {
  const value = normalizeSpace(args.answer.value);

  if (args.answer.inputId === "chainsInScope") {
    args.brief.constraints = upsertLabeledValue(args.brief.constraints, "Launch chains:", value);
    return;
  }

  if (args.answer.inputId === "walletConnectionMvp") {
    args.brief.constraints = upsertLabeledValue(
      args.brief.constraints,
      "Wallet connection boundary:",
      value
    );

    if (isWalletOutOfMvp(value)) {
      args.brief.excludedFeatures = upsertFeature(
        args.brief.excludedFeatures,
        "wallet connection"
      );
      args.brief.mustHaveFeatures = removeFeature(
        args.brief.mustHaveFeatures,
        /\bwallet connection\b/
      );
    } else {
      args.brief.mustHaveFeatures = upsertFeature(
        args.brief.mustHaveFeatures,
        "wallet connection"
      );
      args.brief.excludedFeatures = removeFeature(
        args.brief.excludedFeatures,
        /\bwallet connection\b/
      );
    }

    return;
  }

  if (args.answer.inputId === "adviceAdjacency") {
    args.brief.constraints = upsertLabeledValue(args.brief.constraints, "Advice posture:", value);

    if (isAnalyticsOnly(value)) {
      args.brief.complianceFlags = upsertFeature(
        args.brief.complianceFlags,
        "analytics-only posture"
      );
      args.brief.excludedFeatures = upsertFeature(
        args.brief.excludedFeatures,
        "investment recommendations"
      );
    } else {
      args.brief.complianceFlags = upsertFeature(
        args.brief.complianceFlags,
        "advice-adjacent review required"
      );
      args.brief.trustRisks = upsertFeature(
        args.brief.trustRisks,
        "Advice-adjacent posture needs explicit compliance review."
      );
      args.brief.excludedFeatures = removeFeature(
        args.brief.excludedFeatures,
        /\binvestment recommendations\b/
      );
    }

    return;
  }

  if (args.answer.inputId === "riskSignalSources") {
    args.brief.constraints = upsertLabeledValue(args.brief.constraints, "Risk signal sources:", value);
    args.brief.dataSources = uniqueStrings([
      ...args.brief.dataSources,
      ...splitLooseList(value)
    ]);
    return;
  }

  if (args.answer.inputId === "launchLocationModel") {
    args.brief.constraints = upsertLabeledValue(
      args.brief.constraints,
      "Launch location model:",
      value
    );

    if (isSingleLocation(value)) {
      args.brief.excludedFeatures = upsertFeature(
        args.brief.excludedFeatures,
        "multi-location launch depth"
      );
    }

    return;
  }

  if (args.answer.inputId === "firstPosConnector") {
    args.brief.constraints = upsertLabeledValue(
      args.brief.constraints,
      "First POS connector:",
      value
    );
    args.brief.integrations = uniqueStrings([
      ...args.brief.integrations,
      ...splitLooseList(value)
    ]);
    return;
  }

  if (args.answer.inputId === "analyticsVsStaffWorkflows") {
    args.brief.constraints = upsertLabeledValue(args.brief.constraints, "Workflow scope:", value);

    if (isAnalyticsOnly(value)) {
      args.brief.excludedFeatures = upsertFeature(
        args.brief.excludedFeatures,
        "staff workflow tooling"
      );
      args.brief.mustHaveFeatures = removeFeature(
        args.brief.mustHaveFeatures,
        /\bstaff workflow tooling\b/
      );
    } else {
      args.brief.mustHaveFeatures = upsertFeature(
        args.brief.mustHaveFeatures,
        "staff workflow tooling"
      );
      args.brief.excludedFeatures = removeFeature(
        args.brief.excludedFeatures,
        /\bstaff workflow tooling\b/
      );
    }

    return;
  }

  if (args.answer.inputId === "launchReports") {
    args.brief.constraints = upsertLabeledValue(args.brief.constraints, "Launch reports:", value);
    args.brief.mustHaveFeatures = uniqueStrings([
      ...args.brief.mustHaveFeatures,
      ...splitLooseList(value).map((item) =>
        /report/i.test(item) ? item : `${item} report`
      )
    ]);
  }
}

function deriveSatisfiedSlots(args: {
  brief: ProjectBrief;
  answeredInputs: readonly StrategyAnsweredInput[];
}) {
  const satisfied = new Set<ProjectBriefSlotId>();
  const answered = answerMap(args.answeredInputs);

  const markIfText = (slotId: ProjectBriefSlotId, value?: string | null) => {
    if (cleanText(value)) {
      satisfied.add(slotId);
    }
  };
  const markIfList = (slotId: ProjectBriefSlotId, values: readonly string[]) => {
    if (values.length > 0) {
      satisfied.add(slotId);
    }
  };

  markIfText("founderName", args.brief.founderName);
  markIfText("projectName", args.brief.projectName);
  markIfList("buyerPersonas", args.brief.buyerPersonas);
  markIfList("operatorPersonas", args.brief.operatorPersonas);
  markIfList("endCustomerPersonas", args.brief.endCustomerPersonas);
  markIfList("adminPersonas", args.brief.adminPersonas);
  markIfText("productCategory", args.brief.productCategory);
  markIfText("problemStatement", args.brief.problemStatement);
  markIfText("outcomePromise", args.brief.outcomePromise);
  markIfList("mustHaveFeatures", args.brief.mustHaveFeatures);
  markIfList("niceToHaveFeatures", args.brief.niceToHaveFeatures);
  markIfList("excludedFeatures", args.brief.excludedFeatures);
  markIfList("surfaces", args.brief.surfaces);
  markIfList("integrations", args.brief.integrations);
  markIfList("dataSources", args.brief.dataSources);
  markIfList("constraints", args.brief.constraints);
  markIfList("complianceFlags", args.brief.complianceFlags);

  for (const slotId of [
    "chainsInScope",
    "walletConnectionMvp",
    "adviceAdjacency",
    "riskSignalSources",
    "launchLocationModel",
    "firstPosConnector",
    "analyticsVsStaffWorkflows",
    "launchReports"
  ] as const) {
    if (answered.has(slotId)) {
      satisfied.add(slotId);
    }
  }

  if (args.brief.constraints.some((item) => /^Launch chains:/i.test(item))) {
    satisfied.add("chainsInScope");
  }

  if (args.brief.constraints.some((item) => /^Wallet connection boundary:/i.test(item))) {
    satisfied.add("walletConnectionMvp");
  }

  if (args.brief.constraints.some((item) => /^Advice posture:/i.test(item))) {
    satisfied.add("adviceAdjacency");
  }

  if (args.brief.constraints.some((item) => /^Risk signal sources:/i.test(item))) {
    satisfied.add("riskSignalSources");
  }

  if (args.brief.constraints.some((item) => /^Launch location model:/i.test(item))) {
    satisfied.add("launchLocationModel");
  }

  if (args.brief.constraints.some((item) => /^First POS connector:/i.test(item))) {
    satisfied.add("firstPosConnector");
  }

  if (args.brief.constraints.some((item) => /^Workflow scope:/i.test(item))) {
    satisfied.add("analyticsVsStaffWorkflows");
  }

  if (args.brief.constraints.some((item) => /^Launch reports:/i.test(item))) {
    satisfied.add("launchReports");
  }

  return satisfied;
}

function buildProjectBriefReadiness(args: {
  brief: ProjectBrief;
  answeredInputs: readonly StrategyAnsweredInput[];
}) {
  const guidance = buildDomainGuidanceModel({
    systemArchetype: args.brief.systemArchetype,
    capabilityProfile: args.brief.capabilityProfile,
    primaryDomainPack: args.brief.primaryDomainPack,
    matchedOverlays: args.brief.matchedOverlays
  });
  const satisfiedSlots = deriveSatisfiedSlots({
    brief: args.brief,
    answeredInputs: args.answeredInputs
  });
  const missingArchitecture = guidance.requiredSlotsBeforeArchitectureGeneration.filter(
    (slotId) => !satisfiedSlots.has(slotId)
  );
  const missingRoadmap = guidance.requiredSlotsBeforeRoadmapApproval.filter(
    (slotId) => !satisfiedSlots.has(slotId)
  );
  const architectureCompletion =
    (guidance.requiredSlotsBeforeArchitectureGeneration.length - missingArchitecture.length) /
    guidance.requiredSlotsBeforeArchitectureGeneration.length;
  const roadmapCompletion =
    (guidance.requiredSlotsBeforeRoadmapApproval.length - missingRoadmap.length) /
    guidance.requiredSlotsBeforeRoadmapApproval.length;
  const readinessScore = Math.round(
    Math.max(0, Math.min(100, (architectureCompletion * 0.65 + roadmapCompletion * 0.35) * 100))
  );
  const readyForArchitectureGeneration = missingArchitecture.length === 0;
  const readyForRoadmapApproval = missingRoadmap.length === 0;
  const canContinueFocusedQuestions = readinessScore >= 20;
  const stage = readyForRoadmapApproval
    ? "ready_for_roadmap_approval"
    : readyForArchitectureGeneration
      ? "ready_for_architecture_generation"
      : canContinueFocusedQuestions
        ? "ready_for_focused_questions"
        : "needs_more_intake";
  const openQuestions = guidance.openQuestionTemplates.filter(
    (question) => !satisfiedSlots.has(question.slotId)
  );

  return {
    openQuestions,
    missingRoadmap,
    readinessScore,
    readiness: projectBriefReadinessSchema.parse({
      stage,
      canContinueFocusedQuestions,
      readyForArchitectureGeneration,
      readyForRoadmapApproval
    })
  };
}

export function applyStrategyOverrideStateToProjectBrief(args: {
  projectBrief: ProjectBrief;
  overrideState: StrategyOverrideState;
}) {
  const briefPatch = args.overrideState.projectBrief;
  const architecturePatch = args.overrideState.architecture;
  const answeredInputs = args.overrideState.answeredInputs ?? [];
  const nextBrief: ProjectBrief = {
    ...args.projectBrief,
    buyerPersonas: [...args.projectBrief.buyerPersonas],
    operatorPersonas: [...args.projectBrief.operatorPersonas],
    endCustomerPersonas: [...args.projectBrief.endCustomerPersonas],
    adminPersonas: [...args.projectBrief.adminPersonas],
    mustHaveFeatures: [...args.projectBrief.mustHaveFeatures],
    niceToHaveFeatures: [...args.projectBrief.niceToHaveFeatures],
    excludedFeatures: [...args.projectBrief.excludedFeatures],
    surfaces: [...args.projectBrief.surfaces],
    integrations: [...args.projectBrief.integrations],
    dataSources: [...args.projectBrief.dataSources],
    constraints: [...args.projectBrief.constraints],
    complianceFlags: [...args.projectBrief.complianceFlags],
    trustRisks: [...args.projectBrief.trustRisks],
    assumptionsMade: [...args.projectBrief.assumptionsMade]
  };

  if (briefPatch?.founderName) nextBrief.founderName = briefPatch.founderName;
  if (briefPatch?.projectName) nextBrief.projectName = briefPatch.projectName;
  if (briefPatch?.productCategory) nextBrief.productCategory = briefPatch.productCategory;
  if (briefPatch?.problemStatement) nextBrief.problemStatement = briefPatch.problemStatement;
  if (briefPatch?.outcomePromise) nextBrief.outcomePromise = briefPatch.outcomePromise;

  nextBrief.buyerPersonas = mergeStringList(nextBrief.buyerPersonas, briefPatch?.buyerPersonas);
  nextBrief.operatorPersonas = mergeStringList(
    nextBrief.operatorPersonas,
    briefPatch?.operatorPersonas
  );
  nextBrief.endCustomerPersonas = mergeStringList(
    nextBrief.endCustomerPersonas,
    briefPatch?.endCustomerPersonas
  );
  nextBrief.adminPersonas = mergeStringList(nextBrief.adminPersonas, briefPatch?.adminPersonas);
  nextBrief.mustHaveFeatures = mergeStringList(
    nextBrief.mustHaveFeatures,
    briefPatch?.mustHaveFeatures
  );
  nextBrief.niceToHaveFeatures = mergeStringList(
    nextBrief.niceToHaveFeatures,
    briefPatch?.niceToHaveFeatures
  );
  nextBrief.excludedFeatures = mergeStringList(
    nextBrief.excludedFeatures,
    briefPatch?.excludedFeatures
  );
  nextBrief.surfaces = mergeStringList(nextBrief.surfaces, briefPatch?.surfaces);
  nextBrief.integrations = mergeStringList(nextBrief.integrations, briefPatch?.integrations);
  nextBrief.dataSources = mergeStringList(nextBrief.dataSources, briefPatch?.dataSources);
  nextBrief.constraints = mergeStringList(nextBrief.constraints, briefPatch?.constraints);
  nextBrief.complianceFlags = mergeStringList(
    nextBrief.complianceFlags,
    briefPatch?.complianceFlags
  );
  nextBrief.trustRisks = mergeStringList(nextBrief.trustRisks, briefPatch?.trustRisks);

  if (architecturePatch?.selectedIntegrations?.length) {
    nextBrief.integrations = uniqueStrings([
      ...nextBrief.integrations,
      ...architecturePatch.selectedIntegrations
    ]);
  }

  for (const answer of answeredInputs) {
    applyAnsweredInputToBrief({
      answer,
      brief: nextBrief
    });
  }

  nextBrief.mustHaveFeatures = uniqueStrings(nextBrief.mustHaveFeatures);
  nextBrief.excludedFeatures = uniqueStrings(nextBrief.excludedFeatures);
  nextBrief.integrations = uniqueStrings(nextBrief.integrations);
  nextBrief.dataSources = uniqueStrings(nextBrief.dataSources);
  nextBrief.constraints = uniqueStrings(nextBrief.constraints);
  nextBrief.complianceFlags = uniqueStrings(nextBrief.complianceFlags);
  nextBrief.trustRisks = uniqueStrings(nextBrief.trustRisks);

  const readinessBuild = buildProjectBriefReadiness({
    brief: nextBrief,
    answeredInputs
  });

  return projectBriefSchema.parse({
    ...nextBrief,
    openQuestions: readinessBuild.openQuestions,
    missingCriticalSlots: readinessBuild.missingRoadmap,
    readinessScore: readinessBuild.readinessScore,
    readiness: readinessBuild.readiness
  });
}

function applyArchitectureOverrides(args: {
  architectureBlueprint: ArchitectureBlueprint;
  overrideState: StrategyOverrideState;
}) {
  const assumptions = uniqueStrings([
    ...args.architectureBlueprint.assumptionsMade,
    ...(args.overrideState.architecture?.assumptions ?? [])
  ]);

  return architectureBlueprintSchema.parse({
    ...args.architectureBlueprint,
    assumptionsMade: assumptions
  });
}

function applyRoadmapOverrides(args: {
  roadmapPlan: RoadmapPlan;
  overrideState: StrategyOverrideState;
}) {
  const roadmapPatch = args.overrideState.roadmap;

  if (!roadmapPatch) {
    return args.roadmapPlan;
  }

  const phases = args.roadmapPlan.phases.map((phase) => {
    const note = roadmapPatch.phaseNotesById?.[phase.phaseId];
    return {
      ...phase,
      deliverables: note
        ? uniqueStrings([...phase.deliverables, `Scope clarification: ${note}`])
        : [...phase.deliverables]
    };
  });
  const targetPhaseId =
    args.roadmapPlan.mvpDefinition.includedPhaseIds[
      args.roadmapPlan.mvpDefinition.includedPhaseIds.length - 1
    ] ??
    args.roadmapPlan.phases[args.roadmapPlan.phases.length - 1]?.phaseId ??
    null;
  const phasesWithNotInScope = phases.map((phase) => {
    if (!targetPhaseId || phase.phaseId !== targetPhaseId) {
      return phase;
    }

    const additionalNotInScope = (roadmapPatch.explicitNotInScope ?? []).map((item) =>
      notInScopeItemSchema.parse({
        id: `strategy-not-in-scope-${normalizeSearchText(item).replace(/\s+/g, "-") || "item"}`,
        label: item,
        reason: "Added in Strategy Room to keep the MVP boundary explicit.",
        deferredBecause: "mvp_boundary"
      })
    );

    return {
      ...phase,
      notInScope: uniqueStrings([
        ...phase.notInScope.map((item) => `${item.label}::${item.reason}`),
        ...additionalNotInScope.map((item) => `${item.label}::${item.reason}`)
      ]).map((entry) => {
        const [label, reason] = entry.split("::");
        return (
          phase.notInScope.find(
            (item) => item.label === label && item.reason === reason
          ) ??
          additionalNotInScope.find(
            (item) => item.label === label && item.reason === reason
          )!
        );
      })
    };
  });
  const mvpDefinition = {
    ...args.roadmapPlan.mvpDefinition,
    summary: roadmapPatch.mvpSummary ?? args.roadmapPlan.mvpDefinition.summary,
    deferredItems: uniqueStrings([
      ...args.roadmapPlan.mvpDefinition.deferredItems,
      ...(roadmapPatch.explicitNotInScope ?? [])
    ])
  };
  const assumptionsMade = uniqueStrings([
    ...args.roadmapPlan.assumptionsMade.map((item) => item.statement),
    ...(roadmapPatch.assumptions ?? [])
  ]).map((statement, index) =>
    roadmapAssumptionSchema.parse({
      id: `roadmap-override-assumption-${index + 1}`,
      statement,
      affectsPhaseIds: phasesWithNotInScope.map((phase) => phase.phaseId)
    })
  );

  return roadmapPlanSchema.parse({
    ...args.roadmapPlan,
    mvpDefinition,
    phases: phasesWithNotInScope,
    assumptionsMade
  });
}

function applyGovernanceOverrides(args: {
  governancePolicy: GovernancePolicy;
  overrideState: StrategyOverrideState;
}) {
  const evidenceEntries = Object.entries(
    args.overrideState.governance?.approvalEvidenceByChecklistId ?? {}
  );

  if (evidenceEntries.length === 0) {
    return args.governancePolicy;
  }

  const assumptionsMade = [
    ...args.governancePolicy.assumptionsMade,
    ...evidenceEntries.map(([checklistId, evidence], index) =>
      governanceAssumptionSchema.parse({
        id: `governance-evidence-${index + 1}`,
        statement: `Approval evidence recorded for ${checklistId}: ${evidence}`
      })
    )
  ];

  return governancePolicySchema.parse({
    ...args.governancePolicy,
    assumptionsMade
  });
}

export function applyStrategyOverrideStateToLayers(args: {
  workspaceId?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  projectMetadata?: StoredProjectMetadata | null;
  governanceStateOverride?: StoredGovernanceState | null;
  projectBrief: ProjectBrief;
  overrideState: StrategyOverrideState;
}) {
  const revisedProjectBrief = applyStrategyOverrideStateToProjectBrief({
    projectBrief: args.projectBrief,
    overrideState: args.overrideState
  });
  const revisedArchitectureBase = generateArchitectureBlueprint({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectName,
    projectBrief: revisedProjectBrief
  });
  const architectureBlueprint = applyArchitectureOverrides({
    architectureBlueprint: revisedArchitectureBase,
    overrideState: args.overrideState
  });
  const revisedRoadmapBase = generateRoadmapPlan({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectName,
    projectBrief: revisedProjectBrief,
    architectureBlueprint
  });
  const roadmapPlan = applyRoadmapOverrides({
    roadmapPlan: revisedRoadmapBase,
    overrideState: args.overrideState
  });
  const projectMetadata =
    args.projectMetadata || args.governanceStateOverride
      ? ({
          ...(args.projectMetadata ?? {}),
          governanceState:
            args.governanceStateOverride ?? args.projectMetadata?.governanceState ?? null
        } as StoredProjectMetadata)
      : null;
  const governancePolicyBase = generateGovernancePolicy({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectName,
    projectBrief: revisedProjectBrief,
    architectureBlueprint,
    roadmapPlan,
    projectMetadata
  });
  const governancePolicy = applyGovernanceOverrides({
    governancePolicy: governancePolicyBase,
    overrideState: args.overrideState
  });

  return {
    projectBrief: revisedProjectBrief,
    architectureBlueprint,
    roadmapPlan,
    governancePolicy
  };
}
