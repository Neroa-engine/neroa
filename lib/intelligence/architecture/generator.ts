import { getDomainPack } from "../domain-packs.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { ProjectBriefQuestionStage } from "../domain-contracts.ts";
import { getArchitectureDomainDefaults } from "./defaults.ts";
import { buildDependencyGraph } from "./dependencies.ts";
import { buildArchitectureLanes } from "./lane-planner.ts";
import {
  architectureBlueprintSchema,
  architectureInputIdSchema,
  architectureRiskSchema,
  architectureOpenQuestionSchema,
  integrationRequirementSchema,
  type ArchitectureBlueprint,
  type ArchitectureInputId,
  type ArchitectureRisk,
  type ArchitectureSystemType,
  type DataEntity,
  type IntegrationRequirement,
  type SystemModule,
  type TenancyModel
} from "./types.ts";
import { buildWorktreePlans } from "./worktree-planner.ts";

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildProjectId(args: {
  projectId?: string | null;
  projectName?: string | null;
  projectBrief: ProjectBrief;
}) {
  const explicitProjectId = cleanText(args.projectId);

  if (explicitProjectId) {
    return explicitProjectId;
  }

  const seed =
    cleanText(args.projectName) ||
    cleanText(args.projectBrief.projectName) ||
    cleanText(args.projectBrief.productCategory) ||
    args.projectBrief.domainPack;

  return slugify(seed) || "project";
}

function mergeArchitectureSurfaces(args: {
  domainPackId: ProjectBrief["domainPack"];
  projectBrief: ProjectBrief;
  surfaceDefaults: readonly string[];
}) {
  const explicitSurfaces = [...args.projectBrief.surfaces];
  const lowered = explicitSurfaces.map((surface) => surface.toLowerCase());
  const filteredExplicitSurfaces = explicitSurfaces.filter((surface) => {
    const normalized = surface.toLowerCase();

    if (args.domainPackId === "crypto_analytics") {
      if (normalized === "customer web app") {
        return false;
      }

      if (normalized === "admin console") {
        return false;
      }
    }

    if (args.domainPackId === "restaurant_sales") {
      if (normalized === "operator analytics dashboard") {
        return false;
      }

      if (normalized === "admin access controls") {
        return false;
      }
    }

    if (
      normalized === "admin console" &&
      lowered.some((candidate) => /admin\/|admin /.test(candidate))
    ) {
      return false;
    }

    return true;
  });

  return uniqueStrings([...args.surfaceDefaults, ...filteredExplicitSurfaces]);
}

function inferSystemType(args: {
  projectBrief: ProjectBrief;
  defaultSystemType: ArchitectureSystemType;
}) {
  const corpus = [
    args.projectBrief.productCategory,
    args.projectBrief.problemStatement,
    args.projectBrief.outcomePromise,
    ...args.projectBrief.mustHaveFeatures
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (args.projectBrief.domainPack === "crypto_analytics") {
    return /\b(?:risk|score|signal|intelligence)\b/.test(corpus)
      ? ("intelligence_platform" as const)
      : ("analytics_platform" as const);
  }

  if (args.projectBrief.domainPack === "restaurant_sales") {
    return "ops_reporting_platform" as const;
  }

  if (/\b(?:analytics|reporting|dashboard)\b/.test(corpus)) {
    return "analytics_platform" as const;
  }

  return args.defaultSystemType;
}

function inferTenancyModel(args: {
  projectBrief: ProjectBrief;
  defaultTenancyModel: TenancyModel;
}) {
  const corpus = [
    args.projectBrief.problemStatement,
    args.projectBrief.outcomePromise,
    ...args.projectBrief.mustHaveFeatures,
    ...args.projectBrief.constraints
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (args.projectBrief.domainPack === "restaurant_sales") {
    return "multi_location_hierarchy" as const;
  }

  if (/\b(?:single tenant|internal-only|internal tool|single workspace)\b/.test(corpus)) {
    return "single_workspace" as const;
  }

  return args.defaultTenancyModel;
}

function cloneModules(modules: readonly SystemModule[]) {
  return modules.map((module) => ({
    ...module,
    dependsOn: [...module.dependsOn]
  }));
}

function cloneDataEntities(entities: readonly DataEntity[]) {
  return entities.map((entity) => ({
    ...entity,
    sourceIntegrationIds: [...entity.sourceIntegrationIds]
  }));
}

function matchIntegrationCategory(name: string): IntegrationRequirement["category"] {
  const normalized = name.toLowerCase();

  if (/\bauth|identity|sso|oauth\b/.test(normalized)) {
    return "auth";
  }

  if (/\bwallet|metamask|phantom|coinbase wallet\b/.test(normalized)) {
    return "wallet";
  }

  if (/\bpos|toast|square|clover|revel|lightspeed\b/.test(normalized)) {
    return "pos";
  }

  if (/\bdata|provider|feed|chain|market|api\b/.test(normalized)) {
    return "data_provider";
  }

  if (/\bexport|csv|xls|excel\b/.test(normalized)) {
    return "export";
  }

  return "generic";
}

function resolveIntegrationModules(args: {
  category: IntegrationRequirement["category"];
  modules: readonly SystemModule[];
}) {
  const moduleIds = new Set(args.modules.map((module) => module.id));

  if (args.category === "auth") {
    return moduleIds.has("auth_identity") ? ["auth_identity"] : [];
  }

  if (args.category === "wallet") {
    return ["auth_identity", "watchlist"].filter((id) => moduleIds.has(id));
  }

  if (args.category === "pos") {
    return ["pos_connector_layer", "normalized_sales_store", "connector_health"].filter((id) =>
      moduleIds.has(id)
    );
  }

  if (args.category === "data_provider") {
    return [
      "integration_hub",
      "data_ingestion_pipeline",
      "source_normalization",
      "risk_engine"
    ].filter((id) => moduleIds.has(id));
  }

  if (args.category === "export") {
    return ["exports_service", "admin_controls", "reporting_engine"].filter((id) =>
      moduleIds.has(id)
    );
  }

  return ["integration_hub"].filter((id) => moduleIds.has(id));
}

function resolveIntegrationDataEntities(args: {
  category: IntegrationRequirement["category"];
  dataEntities: readonly DataEntity[];
}) {
  const entityIds = new Set(args.dataEntities.map((entity) => entity.id));

  if (args.category === "auth") {
    return ["user"].filter((id) => entityIds.has(id));
  }

  if (args.category === "wallet") {
    return ["user", "watchlist_item"].filter((id) => entityIds.has(id));
  }

  if (args.category === "pos") {
    return ["sales_event", "menu_item", "connector_sync", "report_snapshot"].filter((id) =>
      entityIds.has(id)
    );
  }

  if (args.category === "data_provider") {
    return ["project_token", "chain_source", "risk_score", "score_factor"].filter((id) =>
      entityIds.has(id)
    );
  }

  if (args.category === "export") {
    return ["report_snapshot"].filter((id) => entityIds.has(id));
  }

  return [];
}

function buildIntegrations(args: {
  projectBrief: ProjectBrief;
  templates: readonly IntegrationRequirement[];
  modules: readonly SystemModule[];
  dataEntities: readonly DataEntity[];
}) {
  const built = new Map<string, IntegrationRequirement>();

  for (const template of args.templates) {
    built.set(template.id, {
      ...template,
      moduleIds: [...template.moduleIds],
      dataEntityIds: [...template.dataEntityIds]
    });
  }

  for (const integrationName of args.projectBrief.integrations) {
    const normalizedKey = slugify(integrationName);

    if (
      Array.from(built.values()).some((integration) => {
        return (
          integration.id === normalizedKey ||
          integration.name.toLowerCase() === integrationName.toLowerCase()
        );
      })
    ) {
      continue;
    }

    const category = matchIntegrationCategory(integrationName);

    built.set(
      normalizedKey,
      integrationRequirementSchema.parse({
        id: normalizedKey,
        name: integrationName,
        category,
        purpose: `Connect ${integrationName} to the product architecture without widening other lanes.`,
        requiredForMvp: true,
        moduleIds: resolveIntegrationModules({
          category,
          modules: args.modules
        }),
        dataEntityIds: resolveIntegrationDataEntities({
          category,
          dataEntities: args.dataEntities
        }),
        notes: "Derived from the current ProjectBrief integration signals."
      })
    );
  }

  return Array.from(built.values());
}

function mapQuestionToRelatedModules(args: {
  inputId: ArchitectureInputId;
  modules: readonly SystemModule[];
}) {
  const moduleIds = new Set(args.modules.map((module) => module.id));

  switch (args.inputId) {
    case "surfaces":
      return [
        "product_web",
        "investor_dashboard",
        "owner_manager_dashboards",
        "admin_controls",
        "admin_rules_console",
        "admin_reporting_console"
      ].filter((moduleId) => moduleIds.has(moduleId));
    case "integrations":
    case "dataSources":
      return [
        "integration_hub",
        "data_ingestion_pipeline",
        "source_normalization",
        "pos_connector_layer"
      ].filter((moduleId) => moduleIds.has(moduleId));
    case "chainsInScope":
    case "riskSignalSources":
      return ["data_ingestion_pipeline", "source_normalization", "risk_engine"].filter((moduleId) =>
        moduleIds.has(moduleId)
      );
    case "walletConnectionMvp":
      return ["auth_identity", "watchlist"].filter((moduleId) => moduleIds.has(moduleId));
    case "adviceAdjacency":
      return ["risk_engine", "score_explanation", "investor_dashboard"].filter((moduleId) =>
        moduleIds.has(moduleId)
      );
    case "launchLocationModel":
      return ["org_location_hierarchy", "role_access_control"].filter((moduleId) =>
        moduleIds.has(moduleId)
      );
    case "firstPosConnector":
      return ["pos_connector_layer", "connector_health"].filter((moduleId) =>
        moduleIds.has(moduleId)
      );
    case "analyticsVsStaffWorkflows":
    case "launchReports":
      return ["reporting_engine", "exports_service", "owner_manager_dashboards"].filter((moduleId) =>
        moduleIds.has(moduleId)
      );
    default:
      return args.modules
        .filter((module) => module.kind !== "observability")
        .slice(0, 3)
        .map((module) => module.id);
  }
}

function buildOpenQuestions(args: {
  projectBrief: ProjectBrief;
  modules: readonly SystemModule[];
}) {
  return args.projectBrief.openQuestions
    .map((question) => {
      const parsedInputId = architectureInputIdSchema.safeParse(question.slotId);

      if (!parsedInputId.success) {
        return null;
      }

      return architectureOpenQuestionSchema.parse({
        inputId: parsedInputId.data,
        label: question.label,
        question: question.question,
        stage: question.stage as ProjectBriefQuestionStage,
        whyItMatters: question.whyItMatters,
        relatedModuleIds: mapQuestionToRelatedModules({
          inputId: parsedInputId.data,
          modules: args.modules
        })
      });
    })
    .filter((question): question is ArchitectureBlueprint["openQuestions"][number] =>
      Boolean(question)
    );
}

function determineMissingCriticalArchitectureInputs(args: {
  projectBrief: ProjectBrief;
  requiredArchitectureInputs: readonly ArchitectureInputId[];
}) {
  const missingSlots = new Set(args.projectBrief.missingCriticalSlots);

  return args.requiredArchitectureInputs.filter((inputId) => missingSlots.has(inputId));
}

function scoreArchitectureReadiness(args: {
  requiredArchitectureInputs: readonly ArchitectureInputId[];
  missingCriticalArchitectureInputs: readonly ArchitectureInputId[];
}) {
  if (args.requiredArchitectureInputs.length === 0) {
    return 100;
  }

  const completionRatio =
    (args.requiredArchitectureInputs.length - args.missingCriticalArchitectureInputs.length) /
    args.requiredArchitectureInputs.length;

  return Math.max(0, Math.min(100, Math.round(completionRatio * 100)));
}

function buildAssumptions(args: {
  projectBrief: ProjectBrief;
  domainPackLabel: string;
  surfaces: readonly string[];
  systemType: ArchitectureSystemType;
  tenancyModel: TenancyModel;
}) {
  const assumptions = [...args.projectBrief.assumptionsMade];

  assumptions.push(
    `Mapped the architecture to ${args.systemType.replace(/_/g, " ")} from the ${args.domainPackLabel.toLowerCase()} brief.`,
    `Planned around ${args.tenancyModel.replace(/_/g, " ")} as the default tenancy model for this domain.`,
    `Seeded architecture surfaces from ${args.surfaces.join(", ")} so later roadmap work can inherit a stable surface list.`
  );

  if (
    args.projectBrief.domainPack === "crypto_analytics" &&
    args.projectBrief.missingCriticalSlots.includes("chainsInScope")
  ) {
    assumptions.push(
      "Assumed chain-aware ingestion and normalization modules are required even though exact chain coverage is still open."
    );
  }

  if (
    args.projectBrief.domainPack === "restaurant_sales" &&
    args.projectBrief.missingCriticalSlots.includes("launchLocationModel")
  ) {
    assumptions.push(
      "Assumed an organization-to-location hierarchy even though the launch location model is still unresolved."
    );
  }

  return uniqueStrings(assumptions);
}

function severityFromTrustRisk(value: string): ArchitectureRisk["severity"] {
  const normalized = value.toLowerCase();

  if (/\b(?:regulatory|permissions?|expose|trust|advice|provenance|security)\b/.test(normalized)) {
    return "high";
  }

  return "medium";
}

function areaFromTrustRisk(value: string) {
  const normalized = value.toLowerCase();

  if (/\bpermission|access\b/.test(normalized)) {
    return "access control";
  }

  if (/\bdata|provenance|sync|signal\b/.test(normalized)) {
    return "data quality";
  }

  if (/\bwallet|security|identity\b/.test(normalized)) {
    return "identity and trust";
  }

  if (/\bscore|advice|report\b/.test(normalized)) {
    return "decision quality";
  }

  return "architecture";
}

function buildArchitectureRisks(args: {
  projectBrief: ProjectBrief;
  defaults: ReturnType<typeof getArchitectureDomainDefaults>;
  missingCriticalArchitectureInputs: readonly ArchitectureInputId[];
}) {
  const risks: ArchitectureRisk[] = args.defaults.riskTemplates.map((risk) => ({
    ...risk,
    relatedModuleIds: [...risk.relatedModuleIds],
    relatedInputIds: [...risk.relatedInputIds]
  }));
  const missingInputSet = new Set(args.missingCriticalArchitectureInputs);

  for (const trustRisk of args.projectBrief.trustRisks) {
    const id = `brief-risk-${slugify(trustRisk)}`;

    if (risks.some((risk) => risk.id === id)) {
      continue;
    }

    risks.push(
      architectureRiskSchema.parse({
        id,
        title: trustRisk,
        severity: severityFromTrustRisk(trustRisk),
        area: areaFromTrustRisk(trustRisk),
        description: trustRisk,
        mitigation:
          "Keep the risk visible in Strategy Room, map it to the owning lane, and avoid widening execution until the open architecture inputs are answered.",
        relatedModuleIds: [],
        relatedInputIds: []
      })
    );
  }

  return risks
    .map((risk) => {
      if (
        risk.relatedInputIds.length > 0 &&
        risk.relatedInputIds.some((inputId) => missingInputSet.has(inputId))
      ) {
        const upgradedSeverity =
          risk.severity === "low"
            ? "medium"
            : risk.severity === "medium"
              ? "high"
              : risk.severity;

        return {
          ...risk,
          severity: upgradedSeverity
        };
      }

      return risk;
    })
    .sort((left, right) => {
      const severityRank: Record<ArchitectureRisk["severity"], number> = {
        high: 0,
        medium: 1,
        low: 2
      };

      return (
        severityRank[left.severity as ArchitectureRisk["severity"]] -
        severityRank[right.severity as ArchitectureRisk["severity"]]
      );
    });
}

export type ArchitectureBlueprintGeneratorInput = {
  workspaceId?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  projectBrief: ProjectBrief;
};

export function generateArchitectureBlueprint(
  args: ArchitectureBlueprintGeneratorInput
): ArchitectureBlueprint {
  const domainPack = getDomainPack(args.projectBrief.domainPack);
  const defaults = getArchitectureDomainDefaults(args.projectBrief.domainPack);
  const projectId = buildProjectId(args);
  const projectName =
    cleanText(args.projectName) || cleanText(args.projectBrief.projectName) || null;
  const systemType = inferSystemType({
    projectBrief: args.projectBrief,
    defaultSystemType: defaults.systemType
  });
  const tenancyModel = inferTenancyModel({
    projectBrief: args.projectBrief,
    defaultTenancyModel: defaults.tenancyModel
  });
  const surfaces = mergeArchitectureSurfaces({
    domainPackId: args.projectBrief.domainPack,
    projectBrief: args.projectBrief,
    surfaceDefaults: defaults.surfaceDefaults
  });
  const modules = cloneModules(defaults.moduleTemplates);
  const dataEntities = cloneDataEntities(defaults.dataEntityTemplates);
  const integrations = buildIntegrations({
    projectBrief: args.projectBrief,
    templates: defaults.integrationTemplates,
    modules,
    dataEntities
  });
  const dependencyGraph = buildDependencyGraph(modules);
  const lanes = buildArchitectureLanes({
    laneTemplates: defaults.laneTemplates,
    modules,
    dependencyGraph
  });
  const worktrees = buildWorktreePlans({
    projectId,
    projectName,
    lanes
  });
  const missingCriticalArchitectureInputs = determineMissingCriticalArchitectureInputs({
    projectBrief: args.projectBrief,
    requiredArchitectureInputs: defaults.requiredArchitectureInputs
  });
  const readinessScore = scoreArchitectureReadiness({
    requiredArchitectureInputs: defaults.requiredArchitectureInputs,
    missingCriticalArchitectureInputs
  });
  const openQuestions = buildOpenQuestions({
    projectBrief: args.projectBrief,
    modules
  });
  const assumptionsMade = buildAssumptions({
    projectBrief: args.projectBrief,
    domainPackLabel: domainPack.label,
    surfaces,
    systemType,
    tenancyModel
  });
  const architectureRisks = buildArchitectureRisks({
    projectBrief: args.projectBrief,
    defaults,
    missingCriticalArchitectureInputs
  });

  return architectureBlueprintSchema.parse({
    workspaceId: cleanText(args.workspaceId) || null,
    projectId,
    projectName,
    sourceProjectBriefRef: `${cleanText(args.workspaceId) || "workspace"}:${projectId}:project-brief`,
    domainPack: args.projectBrief.domainPack,
    systemType,
    tenancyModel,
    surfaces,
    modules,
    dataEntities,
    integrations,
    dependencyGraph,
    lanes,
    worktrees,
    architectureRisks,
    openQuestions,
    readinessScore,
    missingCriticalArchitectureInputs,
    assumptionsMade
  });
}
