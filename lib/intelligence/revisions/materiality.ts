import {
  analyzeGovernanceDelta,
  getGovernanceDomainDefaults,
  type DeltaAnalysisResult,
  type GovernancePolicy
} from "../governance";
import type { ArchitectureBlueprint } from "../architecture/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import {
  approvalInvalidationResultSchema,
  type ApprovalInvalidationResult,
  type StrategyChangedArea,
  type StrategyRevisionMateriality,
  type StrategyRevisionPatch
} from "./types.ts";

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

function matchesAny(value: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function listDiff(args: {
  current: readonly string[];
  next?: readonly string[];
}) {
  if (!args.next) {
    return {
      added: [] as string[],
      removed: [] as string[]
    };
  }

  const currentSet = new Set(args.current.map((item) => normalizeSearchText(item)));
  const nextSet = new Set(args.next.map((item) => normalizeSearchText(item)));

  return {
    added: args.next.filter((item) => !currentSet.has(normalizeSearchText(item))),
    removed: args.current.filter((item) => !nextSet.has(normalizeSearchText(item)))
  };
}

function buildAnswerSummaryLabel(inputId: string) {
  if (inputId === "chainsInScope") return "supported chains";
  if (inputId === "walletConnectionMvp") return "wallet connection boundary";
  if (inputId === "adviceAdjacency") return "analytics or advice posture";
  if (inputId === "riskSignalSources") return "risk signal sources";
  if (inputId === "launchLocationModel") return "launch location model";
  if (inputId === "firstPosConnector") return "first POS connector";
  if (inputId === "analyticsVsStaffWorkflows") return "analytics or staff workflow boundary";
  if (inputId === "launchReports") return "launch reports";
  return inputId.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
}

function buildExpansionPhrases(args: {
  patch: StrategyRevisionPatch;
  projectBrief: ProjectBrief;
}) {
  const phrases: string[] = [];
  const projectBriefPatch = args.patch.projectBrief;

  if (projectBriefPatch) {
    phrases.push(
      ...listDiff({
        current: args.projectBrief.mustHaveFeatures,
        next: projectBriefPatch.mustHaveFeatures
      }).added.map((item) => `${item} in MVP`)
    );
    phrases.push(
      ...listDiff({
        current: args.projectBrief.integrations,
        next: projectBriefPatch.integrations
      }).added
    );
    phrases.push(
      ...listDiff({
        current: args.projectBrief.surfaces,
        next: projectBriefPatch.surfaces
      }).added
    );
  }

  for (const answer of args.patch.answeredInputs ?? []) {
    const normalized = normalizeSearchText(answer.value);

    if (answer.inputId === "walletConnectionMvp") {
      if (
        !matchesAny(normalized, [
          /\bnot in mvp\b/,
          /\bout of mvp\b/,
          /\banalytics only\b/,
          /\banalytics only\b/,
          /\bno wallet\b/,
          /\bwithout wallet\b/,
          /\bnot included\b/,
          /\bno\b/
        ])
      ) {
        phrases.push("wallet connection in MVP");
      }

      continue;
    }

    if (answer.inputId === "analyticsVsStaffWorkflows") {
      if (
        matchesAny(normalized, [
          /\bstaff workflow\b/,
          /\bstaff workflows\b/,
          /\bscheduling\b/,
          /\bpayroll\b/,
          /\boperations workflow\b/
        ])
      ) {
        phrases.push(answer.value);
      }

      continue;
    }

    if (answer.inputId === "adviceAdjacency") {
      if (
        matchesAny(normalized, [/\badvice\b/, /\brecommendation\b/, /\bsignal\b/]) &&
        !matchesAny(normalized, [/\bnot financial advice\b/, /\banalytics only\b/, /\bresearch only\b/])
      ) {
        phrases.push(answer.value);
      }

      continue;
    }

    if (answer.inputId === "launchLocationModel") {
      if (matchesAny(normalized, [/\bmulti location\b/, /\bmulti-location\b/, /\bcross location\b/])) {
        phrases.push(answer.value);
      }

      continue;
    }

    if (answer.inputId === "firstPosConnector") {
      if (splitLooseList(answer.value).length > 1 || /\bsecond\b|\banother\b|\bmultiple\b/.test(normalized)) {
        phrases.push(answer.value);
      }
    }
  }

  if (args.patch.architecture?.selectedIntegrations) {
    const addedIntegrations = listDiff({
      current: args.projectBrief.integrations,
      next: args.patch.architecture.selectedIntegrations
    }).added;

    phrases.push(...addedIntegrations);
  }

  return uniqueStrings(phrases);
}

function buildTighteningSignals(args: {
  patch: StrategyRevisionPatch;
  projectBrief: ProjectBrief;
}) {
  const tightening: string[] = [];

  if (args.patch.projectBrief?.excludedFeatures?.length) {
    const added = listDiff({
      current: args.projectBrief.excludedFeatures,
      next: args.patch.projectBrief.excludedFeatures
    }).added;
    tightening.push(...added.map((item) => `explicitly excluded ${item}`));
  }

  if (args.patch.roadmap?.explicitNotInScope?.length) {
    tightening.push(
      ...args.patch.roadmap.explicitNotInScope.map((item) => `deferred ${item}`)
    );
  }

  for (const answer of args.patch.answeredInputs ?? []) {
    const normalized = normalizeSearchText(answer.value);

    if (
      answer.inputId === "walletConnectionMvp" &&
      matchesAny(normalized, [
        /\bnot in mvp\b/,
        /\bout of mvp\b/,
        /\banalytics only\b/,
        /\bwithout wallet\b/,
        /\bnot included\b/
      ])
    ) {
      tightening.push("wallet connection kept out of MVP");
    }

    if (
      answer.inputId === "launchLocationModel" &&
      matchesAny(normalized, [/\bsingle location\b/, /\bsingle-location\b/])
    ) {
      tightening.push("single-location launch boundary confirmed");
    }

    if (
      answer.inputId === "analyticsVsStaffWorkflows" &&
      matchesAny(normalized, [/\banalytics only\b/, /\breporting only\b/])
    ) {
      tightening.push("staff workflow tooling kept out of MVP");
    }

    if (
      answer.inputId === "adviceAdjacency" &&
      matchesAny(normalized, [/\banalytics only\b/, /\bresearch only\b/, /\bnot financial advice\b/])
    ) {
      tightening.push("analytics-only posture confirmed");
    }
  }

  return uniqueStrings(tightening);
}

function patchTouchesOnlyCosmeticFields(patch: StrategyRevisionPatch) {
  const projectBriefKeys = Object.keys(patch.projectBrief ?? {});
  const architectureKeys = Object.keys(patch.architecture ?? {});
  const roadmapKeys = Object.keys(patch.roadmap ?? {});
  const governanceKeys = Object.keys(patch.governance ?? {});

  const cosmeticProjectBriefKeys = new Set(["founderName", "projectName", "outcomePromise"]);
  const cosmeticArchitectureKeys = new Set(["assumptions"]);
  const cosmeticRoadmapKeys = new Set(["phaseNotesById", "assumptions"]);
  const cosmeticGovernanceKeys = new Set(["approvalEvidenceByChecklistId", "requestedAction"]);

  return (
    (patch.answeredInputs?.length ?? 0) === 0 &&
    projectBriefKeys.every((key) => cosmeticProjectBriefKeys.has(key)) &&
    architectureKeys.every((key) => cosmeticArchitectureKeys.has(key)) &&
    roadmapKeys.every((key) => cosmeticRoadmapKeys.has(key)) &&
    governanceKeys.every((key) => cosmeticGovernanceKeys.has(key))
  );
}

export function buildStrategyChangedAreas(
  patch: StrategyRevisionPatch
): StrategyChangedArea[] {
  const changedAreas: StrategyChangedArea[] = [];

  if (patch.projectBrief && Object.keys(patch.projectBrief).length > 0) {
    changedAreas.push("project_brief");
  }

  if (patch.architecture && Object.keys(patch.architecture).length > 0) {
    changedAreas.push("architecture");
  }

  if (patch.roadmap && Object.keys(patch.roadmap).length > 0) {
    changedAreas.push("roadmap");
  }

  if (patch.governance && Object.keys(patch.governance).length > 0) {
    changedAreas.push("governance");
  }

  if ((patch.answeredInputs?.length ?? 0) > 0) {
    changedAreas.push("open_questions");
  }

  return changedAreas;
}

export function buildStrategyRevisionSummary(args: {
  patch: StrategyRevisionPatch;
}) {
  const labels: string[] = [];

  for (const answer of args.patch.answeredInputs ?? []) {
    labels.push(buildAnswerSummaryLabel(answer.inputId));
  }

  if (args.patch.projectBrief?.mustHaveFeatures) {
    labels.push("must-have scope");
  }

  if (args.patch.projectBrief?.excludedFeatures || args.patch.roadmap?.explicitNotInScope) {
    labels.push("MVP boundaries");
  }

  if (args.patch.projectBrief?.integrations || args.patch.architecture?.selectedIntegrations) {
    labels.push("launch integrations");
  }

  if (args.patch.roadmap?.mvpSummary || args.patch.roadmap?.phaseNotesById) {
    labels.push("roadmap clarifications");
  }

  if (args.patch.governance?.approvalEvidenceByChecklistId) {
    labels.push("approval evidence");
  }

  const uniqueLabels = uniqueStrings(labels);

  if (uniqueLabels.length === 0) {
    return "Saved a Strategy Room revision.";
  }

  if (uniqueLabels.length === 1) {
    return `Saved a Strategy Room revision for ${uniqueLabels[0]}.`;
  }

  return `Saved a Strategy Room revision for ${uniqueLabels.slice(0, 3).join(", ")}.`;
}

export function classifyStrategyRevisionMateriality(args: {
  patch: StrategyRevisionPatch;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
}) {
  const changedAreas = buildStrategyChangedAreas(args.patch);
  const expansionPhrases = buildExpansionPhrases({
    patch: args.patch,
    projectBrief: args.projectBrief
  });
  const tighteningSignals = buildTighteningSignals({
    patch: args.patch,
    projectBrief: args.projectBrief
  });
  const summary = buildStrategyRevisionSummary({
    patch: args.patch
  });
  let deltaAnalysis: DeltaAnalysisResult | null = null;
  let materiality: StrategyRevisionMateriality = "non_material";

  if (expansionPhrases.length > 0) {
    deltaAnalysis = analyzeGovernanceDelta({
      request: expansionPhrases.join(". "),
      projectBrief: args.projectBrief,
      architectureBlueprint: args.architectureBlueprint,
      roadmapPlan: args.roadmapPlan,
      governancePolicy: args.governancePolicy,
      defaults: getGovernanceDomainDefaults(args.governancePolicy.domainPack)
    });

    materiality =
      deltaAnalysis.requiresRoadmapRevision ||
      deltaAnalysis.requiresArchitectureRevision ||
      deltaAnalysis.outcome === "governance_blocked"
        ? "material"
        : "scope_tightening";
  } else if (patchTouchesOnlyCosmeticFields(args.patch)) {
    materiality = "non_material";
  } else if (tighteningSignals.length > 0 || changedAreas.length > 0) {
    materiality = "scope_tightening";
  }

  return {
    changedAreas,
    materiality,
    deltaAnalysis,
    summary
  };
}

export function determineApprovalInvalidation(args: {
  governancePolicy: GovernancePolicy;
  materiality: StrategyRevisionMateriality;
  deltaAnalysis?: DeltaAnalysisResult | null;
}) {
  const previousApprovalRecordId =
    args.governancePolicy.scopeApprovalRecord?.approvalRecordId ?? null;

  if (args.materiality !== "material") {
    return approvalInvalidationResultSchema.parse({
      approvalInvalidated: false,
      requiresApprovalReset: false,
      previousApprovalRecordId,
      nextApprovalState: "unchanged",
      reason: "The revision tightens or clarifies existing scope without invalidating approval."
    });
  }

  if (args.deltaAnalysis?.requiresApprovalReset) {
    return approvalInvalidationResultSchema.parse({
      approvalInvalidated: true,
      requiresApprovalReset: true,
      previousApprovalRecordId,
      nextApprovalState: "reset",
      reason:
        args.deltaAnalysis.reason ||
        "A material scope change invalidated the current approval record."
    });
  }

  if (
    args.governancePolicy.currentApprovalState.status === "approval_ready" ||
    args.governancePolicy.currentApprovalState.status === "review_ready"
  ) {
    return approvalInvalidationResultSchema.parse({
      approvalInvalidated: true,
      requiresApprovalReset: false,
      previousApprovalRecordId,
      nextApprovalState: "stale",
      reason:
        "A material revision changed the roadmap or architecture boundary, so Strategy Room needs another review pass before approval."
    });
  }

  return approvalInvalidationResultSchema.parse({
    approvalInvalidated: false,
    requiresApprovalReset: false,
    previousApprovalRecordId,
    nextApprovalState: "unchanged",
    reason:
      "A material revision was recorded, but there was no approved scope record to invalidate yet."
  });
}

export type StrategyRevisionMaterialityBuild = {
  changedAreas: StrategyChangedArea[];
  materiality: StrategyRevisionMateriality;
  deltaAnalysis: DeltaAnalysisResult | null;
  summary: string;
};

export type StrategyApprovalInvalidationBuild = ApprovalInvalidationResult;
