import type { ArchitectureBlueprint } from "../architecture/types.ts";
import type { GovernancePolicy } from "../governance/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import type { ExecutionPacket } from "../execution/types.ts";
import {
  artifactRequirementSchema,
  type ArtifactRequirement
} from "./types.ts";

type QAChangeProfile = {
  touchesUserFacingSurface: boolean;
  touchesConnectorOrDataFlow: boolean;
  touchesScoringOrMethodology: boolean;
  touchesPermissionsOrScope: boolean;
  requiresHumanReview: boolean;
  requiresRollbackPlan: boolean;
};

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value: string) {
  return normalizeSpace(value).toLowerCase();
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

function includesAny(values: readonly string[], candidates: readonly string[]) {
  return candidates.some((candidate) => values.includes(candidate));
}

function textIncludesAny(corpus: string, signals: readonly string[]) {
  return signals.some((signal) => corpus.includes(signal));
}

function buildRequestCorpus(args: {
  executionPacket: ExecutionPacket;
}) {
  return normalizeSearchText(
    [
      args.executionPacket.requestSummary
    ].join(" ")
  );
}

function buildCriteriaCorpus(args: {
  executionPacket: ExecutionPacket;
}) {
  return normalizeSearchText(args.executionPacket.acceptanceCriteria.join(" "));
}

export function buildQAChangeProfile(args: {
  executionPacket: ExecutionPacket;
  architectureBlueprint: ArchitectureBlueprint;
  governancePolicy: GovernancePolicy;
  projectBrief: ProjectBrief;
  roadmapPlan: RoadmapPlan;
}) {
  const modulesById = new Map(
    args.architectureBlueprint.modules.map((module) => [module.id, module] as const)
  );
  const lanes = args.executionPacket.laneIds;
  const modules = args.executionPacket.moduleIds;
  const requestCorpus = buildRequestCorpus({
    executionPacket: args.executionPacket
  });
  const criteriaCorpus = buildCriteriaCorpus({
    executionPacket: args.executionPacket
  });
  const touchedOwnedSurfaces = modules
    .map((moduleId) => modulesById.get(moduleId)?.ownedSurface ?? null)
    .filter((item): item is string => Boolean(item));
  const touchesUserFacingSurface =
    touchedOwnedSurfaces.length > 0 ||
    includesAny(lanes, ["product_web", "admin_console", "admin_reporting"]) ||
    textIncludesAny(`${requestCorpus} ${criteriaCorpus}`, [
      "dashboard",
      "search",
      "filter",
      "watchlist",
      "profile",
      "report",
      "reports",
      "export",
      "panel",
      "console"
    ]);
  const touchesConnectorOrDataFlow =
    includesAny(lanes, ["data_ingestion", "connectors", "integrations"]) ||
    includesAny(modules, [
      "data_ingestion_pipeline",
      "source_normalization",
      "pos_connector_layer",
      "normalized_sales_store",
      "connector_health",
      "integration_hub",
      "reporting_engine"
    ]) ||
    textIncludesAny(`${requestCorpus} ${criteriaCorpus}`, [
      "connector",
      "sync",
      "ingestion",
      "normalize",
      "normalization",
      "data flow",
      "report",
      "reporting"
    ]);
  const touchesScoringOrMethodology =
    includesAny(lanes, ["risk_engine"]) ||
    includesAny(modules, [
      "risk_engine",
      "score_explanation",
      "admin_rules_console"
    ]) ||
    textIncludesAny(requestCorpus, [
      "score",
      "scoring",
      "methodology",
      "risk engine",
      "rules",
      "factor",
      "explanation"
    ]);
  const touchesPermissionsOrScope =
    includesAny(modules, [
      "auth_identity",
      "tenant_workspace",
      "admin_controls",
      "org_location_hierarchy",
      "role_access_control"
    ]) ||
    textIncludesAny(requestCorpus, [
      "permission",
      "permissions",
      "role",
      "roles",
      "access",
      "location visibility",
      "multi location",
      "multi-location"
    ]);
  const requiresHumanReview =
    args.executionPacket.riskLevel === "high" ||
    touchesScoringOrMethodology ||
    touchesPermissionsOrScope;
  const requiresRollbackPlan =
    args.governancePolicy.qaRules.rollbackPlanRequiredForRiskyChanges &&
    args.executionPacket.riskLevel === "high";

  return {
    touchesUserFacingSurface,
    touchesConnectorOrDataFlow,
    touchesScoringOrMethodology,
    touchesPermissionsOrScope,
    requiresHumanReview,
    requiresRollbackPlan
  } satisfies QAChangeProfile;
}

function buildRequirement(args: {
  id: string;
  kind: ArtifactRequirement["kind"];
  label: string;
  reason: string;
  executionPacket: ExecutionPacket;
  riskLevels?: ArtifactRequirement["requiredForRiskLevels"];
  taskTypes?: ArtifactRequirement["requiredForTaskTypes"];
}) {
  return artifactRequirementSchema.parse({
    id: args.id,
    kind: args.kind,
    label: args.label,
    required: true,
    reason: args.reason,
    relatedPhaseIds: uniqueStrings(args.executionPacket.phaseIds),
    relatedLaneIds: uniqueStrings(args.executionPacket.laneIds),
    relatedModuleIds: uniqueStrings(args.executionPacket.moduleIds),
    requiredForRiskLevels:
      args.riskLevels ?? ["low", "medium", "high"],
    requiredForTaskTypes:
      args.taskTypes ?? [
        "implementation",
        "bug_fix",
        "qa",
        "research",
        "operations"
      ]
  });
}

export function buildArtifactRequirements(args: {
  executionPacket: ExecutionPacket;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
}) {
  const profile = buildQAChangeProfile(args);
  const requirements: ArtifactRequirement[] = [];

  if (args.governancePolicy.qaRules.acceptanceArtifactsRequired) {
    requirements.push(
      buildRequirement({
        id: "execution_result",
        kind: "execution_result",
        label: "Execution result artifact",
        reason:
          "A stored run result is required before Neroa can validate that the execution actually finished.",
        executionPacket: args.executionPacket
      })
    );
  }

  if (profile.touchesUserFacingSurface) {
    requirements.push(
      buildRequirement({
        id: "surface_evidence",
        kind: "surface_evidence",
        label:
          args.projectBrief.domainPack === "restaurant_sales"
            ? "Dashboard or reporting evidence"
            : "User-facing evidence",
        reason:
          "Changes that touch visible product surfaces need artifact evidence before the task can be presented as complete.",
        executionPacket: args.executionPacket
      })
    );
  }

  if (profile.touchesConnectorOrDataFlow) {
    requirements.push(
      buildRequirement({
        id: "connector_evidence",
        kind: "connector_evidence",
        label:
          args.projectBrief.domainPack === "crypto_analytics"
            ? "Data-ingestion evidence"
            : "Connector or reporting evidence",
        reason:
          args.projectBrief.domainPack === "crypto_analytics"
            ? "Ingestion, normalization, or reporting-affecting changes need explicit evidence that the approved source scope still holds."
            : "Connector, reporting, or data-flow work needs evidence that the approved operational scope still behaves correctly.",
        executionPacket: args.executionPacket,
        riskLevels: ["medium", "high"]
      })
    );
  }

  if (profile.touchesScoringOrMethodology) {
    requirements.push(
      buildRequirement({
        id: "logic_review_evidence",
        kind: "logic_review_evidence",
        label: "Methodology or scoring review evidence",
        reason:
          "Risk-engine, score explanation, or rules changes need stronger evidence before they can be treated as accepted work.",
        executionPacket: args.executionPacket,
        riskLevels: ["high"]
      })
    );
  }

  if (profile.touchesPermissionsOrScope) {
    requirements.push(
      buildRequirement({
        id: "permissions_evidence",
        kind: "permissions_evidence",
        label:
          args.projectBrief.domainPack === "restaurant_sales"
            ? "Role and location visibility evidence"
            : "Permissions or scope evidence",
        reason:
          "Access-boundary changes need explicit evidence that the approved visibility and permissions model still holds.",
        executionPacket: args.executionPacket,
        riskLevels: ["medium", "high"]
      })
    );
  }

  if (profile.requiresRollbackPlan) {
    requirements.push(
      buildRequirement({
        id: "rollback_plan",
        kind: "rollback_plan",
        label: "Rollback evidence",
        reason:
          "High-risk execution work needs a rollback or recovery note before it can be release-ready.",
        executionPacket: args.executionPacket,
        riskLevels: ["high"]
      })
    );
  }

  if (profile.requiresHumanReview) {
    requirements.push(
      buildRequirement({
        id: "review_evidence",
        kind: "review_evidence",
        label: "Explicit review evidence",
        reason:
          "This change needs human review evidence before it can move from run-finished to accepted.",
        executionPacket: args.executionPacket,
        riskLevels: ["medium", "high"]
      })
    );
  }

  return {
    profile,
    artifactRequirements: requirements
  };
}
