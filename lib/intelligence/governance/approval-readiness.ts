import {
  validateArchitectureBlueprintReferences
} from "../architecture/dependencies.ts";
import type { ArchitectureBlueprint } from "../architecture/types.ts";
import { validateRoadmapPlanReferences } from "../roadmap/critical-path.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { GovernanceDomainDefaults } from "./defaults.ts";
import {
  approvalChecklistItemSchema,
  approvalReadinessSchema,
  type ApprovalChecklistItem,
  type ApprovalReadiness,
  type GovernancePolicy,
  type RoadmapRevisionRecord
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

function mentionsMultiLocation(args: {
  projectBrief: ProjectBrief;
  roadmapPlan: RoadmapPlan;
}) {
  const corpus = [
    args.projectBrief.productCategory,
    args.projectBrief.problemStatement,
    args.projectBrief.outcomePromise,
    ...args.projectBrief.mustHaveFeatures,
    ...args.projectBrief.operatorPersonas,
    ...args.projectBrief.constraints,
    ...args.roadmapPlan.phases.flatMap((phase) => phase.deliverables),
    ...args.roadmapPlan.phases.flatMap((phase) => phase.notInScope.map((item) => item.label)),
    args.roadmapPlan.mvpDefinition.summary
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /\b(?:multi-location|multi location|cross-location|cross location)\b/.test(corpus);
}

function requirementApplies(args: {
  requirement: GovernanceDomainDefaults["inputRequirements"][number];
  projectBrief: ProjectBrief;
  roadmapPlan: RoadmapPlan;
}) {
  if (!args.requirement.condition || args.requirement.condition === "always") {
    return true;
  }

  if (args.requirement.condition === "if_multi_location_positioned") {
    return mentionsMultiLocation({
      projectBrief: args.projectBrief,
      roadmapPlan: args.roadmapPlan
    });
  }

  return true;
}

function buildStructuralChecklistItems(args: {
  roadmapPlan: RoadmapPlan;
  architectureBlueprint: ArchitectureBlueprint;
  activeRevision: RoadmapRevisionRecord | null;
}) {
  const architectureValidation = validateArchitectureBlueprintReferences(
    args.architectureBlueprint
  );
  const roadmapValidation = validateRoadmapPlanReferences({
    roadmapPlan: args.roadmapPlan,
    architectureBlueprint: args.architectureBlueprint
  });
  const dependenciesCoherent =
    architectureValidation.unknownDependencyModuleIds.length === 0 &&
    architectureValidation.unknownLaneModuleIds.length === 0 &&
    architectureValidation.unknownWorktreeLaneIds.length === 0 &&
    roadmapValidation.unknownPhaseModuleIds.length === 0 &&
    roadmapValidation.unknownPhaseLaneIds.length === 0 &&
    roadmapValidation.unknownCriticalPathPhaseIds.length === 0 &&
    roadmapValidation.unknownCriticalPathDependencyIds.length === 0 &&
    args.roadmapPlan.criticalPath.length > 0;
  const mvpBoundaryExplicit =
    args.roadmapPlan.mvpDefinition.mustHaveFeatures.length > 0 &&
    args.roadmapPlan.mvpDefinition.includedPhaseIds.length > 0 &&
    args.roadmapPlan.mvpDefinition.includedLaneIds.length > 0;
  const notInScopeExplicit =
    args.roadmapPlan.phases.length > 0 &&
    args.roadmapPlan.phases.every((phase) => phase.notInScope.length > 0) &&
    args.roadmapPlan.mvpDefinition.deferredItems.length > 0;

  return [
    approvalChecklistItemSchema.parse({
      id: "governance-roadmap-phases-defined",
      label: "Roadmap phases are explicitly defined",
      status: args.roadmapPlan.phases.length > 0 ? "satisfied" : "blocked",
      blockerLevel: "blocking",
      reason:
        args.roadmapPlan.phases.length > 0
          ? "The roadmap already has explicit phases and phase boundaries."
          : "Strategy Room still needs a usable phase plan before approval can move forward.",
      relatedScopeArea: "roadmap",
      relatedPhaseId: args.roadmapPlan.phases[0]?.phaseId ?? null,
      relatedInputId: null
    }),
    approvalChecklistItemSchema.parse({
      id: "governance-mvp-boundary-explicit",
      label: "MVP boundary is explicit",
      status: mvpBoundaryExplicit ? "satisfied" : "blocked",
      blockerLevel: "blocking",
      reason: mvpBoundaryExplicit
        ? "The roadmap includes an explicit MVP definition and included phase set."
        : "Strategy Room still needs a clearer MVP definition before approval can move forward.",
      relatedScopeArea: "roadmap",
      relatedPhaseId: args.roadmapPlan.mvpDefinition.includedPhaseIds[0] ?? null,
      relatedInputId: null
    }),
    approvalChecklistItemSchema.parse({
      id: "governance-not-in-scope-explicit",
      label: "Not-in-scope boundaries are explicit",
      status: notInScopeExplicit ? "satisfied" : "blocked",
      blockerLevel: "blocking",
      reason: notInScopeExplicit
        ? "Each roadmap phase already carries explicit not-in-scope boundaries."
        : "Phase boundaries still need explicit not-in-scope protection before approval can move forward.",
      relatedScopeArea: "roadmap",
      relatedPhaseId: args.roadmapPlan.phases[0]?.phaseId ?? null,
      relatedInputId: null
    }),
    approvalChecklistItemSchema.parse({
      id: "governance-dependencies-coherent",
      label: "Architecture and roadmap dependencies are coherent",
      status: dependenciesCoherent ? "satisfied" : "blocked",
      blockerLevel: "blocking",
      reason: dependenciesCoherent
        ? "Architecture references, lane ownership, and the roadmap critical path are internally coherent."
        : "Architecture or roadmap references still need cleanup before approval can move forward.",
      relatedScopeArea: "execution_logic",
      relatedPhaseId: args.roadmapPlan.phases[0]?.phaseId ?? null,
      relatedInputId: null
    }),
    approvalChecklistItemSchema.parse({
      id: "governance-revision-state-clear",
      label: "No unresolved roadmap revision is forcing approval reset",
      status:
        args.activeRevision && args.activeRevision.status !== "resolved"
          ? "blocked"
          : "satisfied",
      blockerLevel: "blocking",
      reason:
        args.activeRevision && args.activeRevision.status !== "resolved"
          ? `The roadmap revision "${args.activeRevision.revisionId}" is still active and requires another approval pass.`
          : "No active roadmap revision is currently forcing approval reset.",
      relatedScopeArea: "roadmap",
      relatedPhaseId: null,
      relatedInputId: null
    })
  ] satisfies ApprovalChecklistItem[];
}

function buildInputChecklistItems(args: {
  defaults: GovernanceDomainDefaults;
  projectBrief: ProjectBrief;
  roadmapPlan: RoadmapPlan;
  architectureBlueprint: ArchitectureBlueprint;
}) {
  const missingInputs = new Set([
    ...args.roadmapPlan.missingCriticalScopeInputs,
    ...args.architectureBlueprint.missingCriticalArchitectureInputs
  ]);

  return args.defaults.inputRequirements
    .filter((requirement) =>
      requirementApplies({
        requirement,
        projectBrief: args.projectBrief,
        roadmapPlan: args.roadmapPlan
      })
    )
    .map((requirement) => {
      const openQuestion =
        args.roadmapPlan.openQuestions.find(
          (question) => question.inputId === requirement.inputId
        ) ??
        args.architectureBlueprint.openQuestions.find(
          (question) => question.inputId === requirement.inputId
        ) ??
        null;
      const unresolved =
        missingInputs.has(requirement.inputId) ||
        Boolean(openQuestion);
      const relatedPhaseId =
        openQuestion && "relatedPhaseIds" in openQuestion
          ? openQuestion.relatedPhaseIds[0] ?? null
          : null;

      return approvalChecklistItemSchema.parse({
        id: `approval-input-${slugify(requirement.inputId)}`,
        label: requirement.label,
        status: unresolved
          ? requirement.blockerLevel === "blocking"
            ? "blocked"
            : "open"
          : "satisfied",
        blockerLevel: requirement.blockerLevel,
        reason: unresolved
          ? openQuestion?.question ??
            "This input still needs explicit approval before governance can clear it."
          : "This approval input is explicitly covered in the current roadmap and architecture draft.",
        relatedScopeArea: requirement.relatedScopeArea,
        relatedPhaseId,
        relatedInputId: requirement.inputId
      });
    });
}

function buildApprovalStatus(args: {
  checklist: readonly ApprovalChecklistItem[];
  roadmapPlan: RoadmapPlan;
  activeRevision: RoadmapRevisionRecord | null;
}) {
  const satisfiedChecklistItemIds = args.checklist
    .filter((item) => item.status === "satisfied")
    .map((item) => item.id);
  const unresolvedItems = args.checklist.filter((item) => item.status !== "satisfied");
  const unresolvedChecklistItemIds = unresolvedItems.map((item) => item.id);
  const blockers = uniqueStrings(
    unresolvedItems
      .filter((item) => item.blockerLevel === "blocking")
      .map((item) => item.label)
  );
  const completionRatio =
    args.checklist.length > 0 ? satisfiedChecklistItemIds.length / args.checklist.length : 0;
  let readinessScore = Math.round(
    Math.max(
      0,
      Math.min(100, args.roadmapPlan.readinessScore * 0.55 + completionRatio * 45)
    )
  );

  if (args.activeRevision && args.activeRevision.requiresApprovalReset) {
    readinessScore = Math.min(readinessScore, 64);
  }

  const reviewReady =
    blockers.length === 0 &&
    args.roadmapPlan.phases.length > 0 &&
    readinessScore >= 55;
  const approvalAllowed =
    unresolvedItems.length === 0 &&
    readinessScore >= 85 &&
    args.roadmapPlan.status !== "draft" &&
    !args.activeRevision;
  const status = approvalAllowed
    ? "approval_ready"
    : reviewReady
      ? "review_ready"
      : "not_ready";

  return approvalReadinessSchema.parse({
    status,
    blockers:
      blockers.length > 0
        ? blockers
        : uniqueStrings(unresolvedItems.map((item) => item.label)).slice(0, 4),
    satisfiedChecklistItemIds,
    unresolvedChecklistItemIds,
    readinessScore,
    reviewReady,
    approvalAllowed
  });
}

export function buildGovernanceApprovalReadiness(args: {
  defaults: GovernanceDomainDefaults;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  roadmapRevisionRecords?: readonly RoadmapRevisionRecord[];
}) {
  const activeRevision =
    [...(args.roadmapRevisionRecords ?? [])]
      .reverse()
      .find((record) => record.status !== "resolved" && record.status !== "superseded") ??
    null;
  const checklist = [
    ...buildStructuralChecklistItems({
      roadmapPlan: args.roadmapPlan,
      architectureBlueprint: args.architectureBlueprint,
      activeRevision
    }),
    ...buildInputChecklistItems(args)
  ] satisfies ApprovalChecklistItem[];
  const approvalReadiness = buildApprovalStatus({
    checklist,
    roadmapPlan: args.roadmapPlan,
    activeRevision
  });

  return {
    approvalChecklist: checklist,
    approvalReadiness,
    activeRevision
  } satisfies {
    approvalChecklist: ApprovalChecklistItem[];
    approvalReadiness: ApprovalReadiness;
    activeRevision: GovernancePolicy["roadmapRevisionRecords"][number] | null;
  };
}
