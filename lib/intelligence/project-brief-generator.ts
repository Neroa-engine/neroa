import type { HiddenIntelligenceBundle } from "@/lib/intelligence/adapters";
import type { ConversationSessionState } from "@/lib/intelligence/conversation";
import {
  loadPlatformContext,
  type PlatformContext
} from "@/lib/intelligence/platform-context";
import type { GuidedBuildSession } from "@/lib/onboarding/build-session";
import type { MobileAppWorkspaceBlueprint } from "@/lib/onboarding/mobile-app-intake";
import type { SaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import {
  generateArchitectureBlueprint
} from "./architecture/generator.ts";
import type { ArchitectureBlueprint } from "./architecture/types.ts";
import { generateGovernancePolicy } from "./governance/generator.ts";
import type { GovernancePolicy } from "./governance/types.ts";
import { generateRoadmapPlan } from "./roadmap/generator.ts";
import type { RoadmapPlan } from "./roadmap/types.ts";
import {
  type ProjectBriefReadinessStage,
  type ProjectBriefSlotId
} from "./domain-contracts.ts";
import { type DomainPack } from "./domain-packs.ts";
import {
  resolveDomainPack,
  type DomainResolution,
  type DomainResolutionInput
} from "./domain-resolver.ts";
import {
  projectBriefSchema,
  type ProjectBrief,
  type ProjectBriefOpenQuestion
} from "./project-brief.ts";

type SlotStatus = "missing" | "partial" | "inferred" | "filled";

type BriefSlotStateMap = Partial<Record<ProjectBriefSlotId, SlotStatus>>;

const SLOT_STATUS_RANK: Record<SlotStatus, number> = {
  missing: 0,
  partial: 1,
  inferred: 2,
  filled: 3
};

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

function appendTextBucket(bucket: string[], values: Array<string | null | undefined>) {
  for (const value of values) {
    const cleaned = cleanText(value);

    if (!cleaned) {
      continue;
    }

    bucket.push(cleaned);
  }
}

function mergeExplicitAndInferred(args: {
  explicit: readonly string[];
  inferred: readonly string[];
}) {
  return uniqueStrings([...args.explicit, ...args.inferred]);
}

function joinListForSummary(values: readonly string[]) {
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

function splitAudienceText(value?: string | null) {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return [];
  }

  const normalized = cleaned
    .replace(/\b(?:it'?s|it is|for|mainly for|customers?|users?)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return splitLooseList(normalized);
}

function bundleFieldList(
  bundle: HiddenIntelligenceBundle | null | undefined,
  fieldKey:
    | "primary_users"
    | "primary_buyers"
    | "primary_admins"
    | "mvp_in_scope"
    | "mvp_out_of_scope"
    | "integrations"
    | "data_dependencies"
    | "constraints"
    | "primary_surfaces"
) {
  const value = bundle?.extractionState.fields[fieldKey].value;

  if (!value) {
    return [];
  }

  return value.kind === "list" ? value.items : [value.summary];
}

function bundleFieldText(
  bundle: HiddenIntelligenceBundle | null | undefined,
  fieldKey:
    | "product_type"
    | "problem_statement"
    | "desired_outcome"
    | "business_model"
    | "compliance_security_sensitivity"
    | "core_workflow"
    | "request_summary"
    | "core_concept"
) {
  return cleanText(bundle?.extractionState.fields[fieldKey].value?.summary);
}

function scoreSlotState(current: SlotStatus | undefined, next: SlotStatus) {
  if (!current) {
    return next;
  }

  return SLOT_STATUS_RANK[next] > SLOT_STATUS_RANK[current] ? next : current;
}

function markSlotState(
  slotStates: BriefSlotStateMap,
  slotId: ProjectBriefSlotId,
  status: SlotStatus
) {
  slotStates[slotId] = scoreSlotState(slotStates[slotId], status);
}

function slotSatisfied(status: SlotStatus | undefined) {
  return status === "filled" || status === "inferred";
}

function hasExplicitSignals(values: readonly string[], text?: string | null) {
  return values.length > 0 || cleanText(text).length > 0;
}

function inferDefaultProductCategory(pack: DomainPack, explicitCategory?: string | null) {
  const cleanedExplicit = cleanText(explicitCategory);

  if (!cleanedExplicit) {
    return pack.productCategoryLabel;
  }

  return pack.id === "generic_saas" ? cleanedExplicit : pack.productCategoryLabel;
}

function inferProblemStatement(args: {
  domainPack: DomainPack;
  explicitProblem?: string | null;
  resolution: DomainResolution;
}) {
  const cleanedExplicit = cleanText(args.explicitProblem);

  if (cleanedExplicit) {
    return cleanedExplicit;
  }

  const corpus = args.resolution.corpus.toLowerCase();

  if (args.domainPack.id === "crypto_analytics") {
    if (/\b(?:pre-sales|presale|risk engine|risky)\b/.test(corpus)) {
      return "Help crypto investors assess pre-sale project risk before committing capital.";
    }

    return "Help crypto investors evaluate projects with clearer risk visibility.";
  }

  if (args.domainPack.id === "restaurant_sales") {
    return "Give restaurant owners and managers clearer sales visibility across locations and menu performance.";
  }

  return null;
}

function inferOutcomePromise(args: {
  domainPack: DomainPack;
  explicitOutcome?: string | null;
  problemStatement?: string | null;
}) {
  const cleanedExplicit = cleanText(args.explicitOutcome);

  if (cleanedExplicit) {
    return cleanedExplicit;
  }

  if (args.domainPack.id === "crypto_analytics") {
    return "Give investors a faster, more transparent way to compare risky crypto opportunities.";
  }

  if (args.domainPack.id === "restaurant_sales") {
    return "Help owners and managers make faster sales decisions with reliable reporting.";
  }

  if (cleanText(args.problemStatement)) {
    return `Create a clearer first outcome around ${cleanText(args.problemStatement).replace(/[.!?]+$/g, "")}.`;
  }

  return null;
}

function inferSurfaces(args: {
  explicitSurfaces: readonly string[];
  domainPack: DomainPack;
  corpus: string;
}) {
  if (args.explicitSurfaces.length > 0) {
    return uniqueStrings(args.explicitSurfaces);
  }

  const inferred: string[] = [];
  const corpus = args.corpus.toLowerCase();

  if (/\b(?:website|web app|dashboard|portal|analytics platform)\b/.test(corpus)) {
    inferred.push("customer web app");
  }

  if (/\b(?:admin|rules|backoffice|manager|operations)\b/.test(corpus)) {
    inferred.push("admin console");
  }

  if (/\b(?:mobile|iphone|android)\b/.test(corpus)) {
    inferred.push("mobile app");
  }

  return uniqueStrings([...inferred, ...args.domainPack.defaultSurfaces]);
}

function partitionSystems(values: readonly string[]) {
  const integrations: string[] = [];
  const dataSources: string[] = [];

  for (const value of values) {
    const normalized = value.toLowerCase();

    if (
      /\b(?:data|signal|feed|source|metrics|sales data|menu-item|holder|liquidity|metadata|transactions?)\b/.test(
        normalized
      )
    ) {
      dataSources.push(value);
      continue;
    }

    if (
      /\b(?:connector|integration|wallet|stripe|toast|square|clover|pos|provider|supabase|api)\b/.test(
        normalized
      )
    ) {
      integrations.push(value);
      continue;
    }

    integrations.push(value);
  }

  return {
    integrations: uniqueStrings(integrations),
    dataSources: uniqueStrings(dataSources)
  };
}

function buildConstraintDefaults(args: {
  buildSession?: GuidedBuildSession | null;
  saasIntake?: SaasWorkspaceBlueprint | null;
  mobileAppIntake?: MobileAppWorkspaceBlueprint | null;
}) {
  const defaults: string[] = [];

  appendTextBucket(defaults, [
    args.buildSession?.scope.priorityTradeoff,
    args.buildSession?.scope.complexityLevel,
    args.buildSession?.scope.timeEstimate,
    args.buildSession?.scope.estimateRange,
    args.saasIntake?.startupCostEstimate.summary,
    args.mobileAppIntake?.startupCostEstimate.summary
  ]);

  if (cleanText(args.saasIntake?.startupCostEstimate.rangeLabel)) {
    defaults.push(`Budget guardrail: ${args.saasIntake?.startupCostEstimate.rangeLabel}`);
  }

  if (cleanText(args.mobileAppIntake?.answers.budgetGuardrail)) {
    defaults.push(`Budget guardrail: ${args.mobileAppIntake?.answers.budgetGuardrail}`);
  }

  return uniqueStrings(defaults);
}

function inferComplianceFlags(args: {
  domainPack: DomainPack;
  explicitFlags: readonly string[];
  constraints: readonly string[];
  corpus: string;
}) {
  const flags = [...args.explicitFlags];

  if (flags.length === 0) {
    flags.push(...args.domainPack.complianceFlagDefaults);
  }

  if (/\b(?:compliance|regulated|audit|privacy|security)\b/.test(args.corpus.toLowerCase())) {
    flags.push("explicit compliance or security sensitivity");
  }

  return uniqueStrings(flags);
}

function inferTrustRisks(args: {
  domainPack: DomainPack;
  corpus: string;
}) {
  const risks = [...args.domainPack.trustRiskDefaults];

  if (/\b(?:multi-location|multilocation)\b/.test(args.corpus.toLowerCase())) {
    risks.push("Cross-location visibility needs clear permissions and trustworthy reporting.");
  }

  return uniqueStrings(risks);
}

function inferDomainSpecificSlots(args: {
  domainPack: DomainPack;
  corpus: string;
  explicitDataSources: readonly string[];
  explicitFeatures: readonly string[];
}) {
  const slotStates: BriefSlotStateMap = {};
  const assumptionsMade: string[] = [];
  const corpus = args.corpus.toLowerCase();

  if (args.domainPack.id === "crypto_analytics") {
    if (
      /\b(?:ethereum|eth|solana|sol|base|arbitrum|polygon|avalanche|bsc|optimism|tron|sui|aptos)\b/.test(
        corpus
      )
    ) {
      markSlotState(slotStates, "chainsInScope", "filled");
    }

    if (
      /\b(?:wallet connect|wallet connection|connect wallet|metamask|phantom|coinbase wallet)\b/.test(
        corpus
      ) ||
      /\b(?:analytics-only|analytics only|no wallet|without wallet)\b/.test(corpus)
    ) {
      markSlotState(slotStates, "walletConnectionMvp", "filled");
    }

    if (
      /\b(?:not financial advice|analytics-only|analytics only|research only|advice|recommendation|trade signal|signals)\b/.test(
        corpus
      )
    ) {
      markSlotState(slotStates, "adviceAdjacency", "filled");
    }

    if (
      args.explicitDataSources.length > 0 ||
      /\b(?:liquidity|holder concentration|audits?|tokenomics|social signals?|treasury|contract risk|unlock schedule)\b/.test(
        corpus
      )
    ) {
      markSlotState(slotStates, "riskSignalSources", "filled");
    }

    if (!slotStates.chainsInScope) {
      assumptionsMade.push(
        "Assumed a web-first crypto analytics launch, but chain coverage is still unconfirmed."
      );
    }

    return {
      slotStates,
      assumptionsMade: uniqueStrings(assumptionsMade)
    };
  }

  if (args.domainPack.id === "restaurant_sales") {
    if (/\b(?:single-location|single location|multi-location at launch|multi location at launch)\b/.test(corpus)) {
      markSlotState(slotStates, "launchLocationModel", "filled");
    } else if (/\b(?:multi-location if possible|multi location if possible|maybe multi-location)\b/.test(corpus)) {
      markSlotState(slotStates, "launchLocationModel", "partial");
    }

    if (/\b(?:toast|square|clover|lightspeed|revel|shopify pos)\b/.test(corpus)) {
      markSlotState(slotStates, "firstPosConnector", "filled");
    }

    if (
      /\b(?:analytics-only|analytics only|reporting only|staff workflows?|scheduling|approvals|payroll|operations workflow)\b/.test(
        corpus
      )
    ) {
      markSlotState(slotStates, "analyticsVsStaffWorkflows", "filled");
    }

    if (
      args.explicitFeatures.some((feature) => /\breport|export|dashboard\b/i.test(feature)) &&
      /\b(?:daily sales|location|menu-item|menu item|exports?)\b/.test(corpus)
    ) {
      markSlotState(slotStates, "launchReports", "filled");
    }

    if (!slotStates.firstPosConnector) {
      assumptionsMade.push(
        "Assumed restaurant sales reporting depends on a POS connector, but the first connector is still unconfirmed."
      );
    }

    return {
      slotStates,
      assumptionsMade: uniqueStrings(assumptionsMade)
    };
  }

  return {
    slotStates,
    assumptionsMade: []
  };
}

function buildReadiness(args: {
  slotStates: BriefSlotStateMap;
  domainPack: DomainPack;
  hasFocusedQuestionSignal: boolean;
}) {
  const missingArchitecture = args.domainPack.requiredSlotsBeforeArchitectureGeneration.filter(
    (slotId) => !slotSatisfied(args.slotStates[slotId])
  );
  const missingRoadmap = args.domainPack.requiredSlotsBeforeRoadmapApproval.filter(
    (slotId) => !slotSatisfied(args.slotStates[slotId])
  );
  const architectureCompletion =
    (args.domainPack.requiredSlotsBeforeArchitectureGeneration.length - missingArchitecture.length) /
    args.domainPack.requiredSlotsBeforeArchitectureGeneration.length;
  const roadmapCompletion =
    (args.domainPack.requiredSlotsBeforeRoadmapApproval.length - missingRoadmap.length) /
    args.domainPack.requiredSlotsBeforeRoadmapApproval.length;
  const readinessScore = Math.round(
    Math.max(0, Math.min(100, (architectureCompletion * 0.65 + roadmapCompletion * 0.35) * 100))
  );
  const readyForArchitectureGeneration = missingArchitecture.length === 0;
  const readyForRoadmapApproval = missingRoadmap.length === 0;
  const canContinueFocusedQuestions =
    args.hasFocusedQuestionSignal || readinessScore >= 20;
  const stage: ProjectBriefReadinessStage = readyForRoadmapApproval
    ? "ready_for_roadmap_approval"
    : readyForArchitectureGeneration
    ? "ready_for_architecture_generation"
    : canContinueFocusedQuestions
    ? "ready_for_focused_questions"
    : "needs_more_intake";

  return {
    readinessScore,
    readiness: {
      stage,
      canContinueFocusedQuestions,
      readyForArchitectureGeneration,
      readyForRoadmapApproval
    },
    missingArchitecture,
    missingRoadmap
  };
}

function buildOpenQuestions(args: {
  domainPack: DomainPack;
  slotStates: BriefSlotStateMap;
}) {
  return args.domainPack.defaultOpenQuestions.filter(
    (question) => !slotSatisfied(args.slotStates[question.slotId])
  ) as ProjectBriefOpenQuestion[];
}

export type ProjectBriefGeneratorInput = DomainResolutionInput & {
  platformContext?: PlatformContext | null;
};

function buildProjectBriefInternal(args: ProjectBriefGeneratorInput) {
  const resolution = resolveDomainPack(args);
  const domainPack = resolution.domainPack;
  const corpus = resolution.corpus;

  const explicitBuyerPersonas = uniqueStrings([
    ...(args.conversationState?.audience.buyerPersonas ?? []),
    ...splitAudienceText(args.buildSession?.scope.audience),
    ...splitAudienceText(args.buildSession?.scope.targetUsers),
    ...splitAudienceText(args.saasIntake?.answers.customer),
    ...splitAudienceText(args.mobileAppIntake?.answers.audience)
  ]);
  const inferredBuyerPersonas = uniqueStrings([
    ...bundleFieldList(args.hiddenBundle, "primary_buyers"),
    ...(explicitBuyerPersonas.length === 0
      ? domainPack.defaultAudiencePatterns.buyerPersonas
      : [])
  ]);
  const buyerPersonas = mergeExplicitAndInferred({
    explicit: explicitBuyerPersonas,
    inferred: inferredBuyerPersonas
  });

  const explicitOperatorPersonas = uniqueStrings([
    ...(args.conversationState?.audience.operatorPersonas ?? [])
  ]);
  const inferredOperatorPersonas = uniqueStrings([
    ...bundleFieldList(args.hiddenBundle, "primary_users"),
    ...(explicitOperatorPersonas.length === 0 &&
    buyerPersonas.length > 0 &&
    domainPack.defaultAudiencePatterns.copyBuyerToOperatorWhenSelfServe
      ? buyerPersonas
      : domainPack.defaultAudiencePatterns.operatorPersonas)
  ]);
  const operatorPersonas = mergeExplicitAndInferred({
    explicit: explicitOperatorPersonas,
    inferred: inferredOperatorPersonas
  });

  const explicitEndCustomerPersonas = uniqueStrings([
    ...(args.conversationState?.audience.endCustomerPersonas ?? [])
  ]);
  const endCustomerPersonas = mergeExplicitAndInferred({
    explicit: explicitEndCustomerPersonas,
    inferred: domainPack.defaultAudiencePatterns.endCustomerPersonas
  });

  const explicitAdminPersonas = uniqueStrings([
    ...(args.conversationState?.audience.adminPersonas ?? [])
  ]);
  const adminPersonas = mergeExplicitAndInferred({
    explicit: explicitAdminPersonas,
    inferred: [
      ...bundleFieldList(args.hiddenBundle, "primary_admins"),
      ...domainPack.defaultAudiencePatterns.adminPersonas
    ]
  });

  const explicitProductCategory = cleanText(
    args.conversationState?.productCategory ||
      args.buildSession?.scope.productTypeLabel ||
      args.buildSession?.scope.buildTypeLabel ||
      args.saasIntake?.answers.productSummary ||
      args.mobileAppIntake?.answers.appSummary ||
      bundleFieldText(args.hiddenBundle, "product_type")
  );
  const productCategory = inferDefaultProductCategory(domainPack, explicitProductCategory);

  const explicitProblemStatement = cleanText(
    args.conversationState?.problemStatement ||
      args.buildSession?.scope.problem ||
      args.saasIntake?.answers.problem ||
      bundleFieldText(args.hiddenBundle, "problem_statement")
  );
  const problemStatement = inferProblemStatement({
    domainPack,
    explicitProblem: explicitProblemStatement,
    resolution
  });

  const explicitOutcomePromise = cleanText(
    args.conversationState?.outcomePromise ||
      args.buildSession?.scope.businessGoal ||
      args.mobileAppIntake?.answers.proofOutcome ||
      bundleFieldText(args.hiddenBundle, "desired_outcome")
  );
  const outcomePromise = inferOutcomePromise({
    domainPack,
    explicitOutcome: explicitOutcomePromise,
    problemStatement
  });

  const explicitMustHaveFeatures = uniqueStrings([
    ...(args.conversationState?.mustHaveFeatures ?? []),
    ...(args.buildSession?.scope.keyFeatures ?? []),
    ...(args.buildSession?.scope.coreFeatures ?? []),
    ...(args.buildSession?.scope.firstBuild ?? []),
    ...(args.saasIntake?.mvpFeatureList ?? []),
    ...(args.mobileAppIntake?.featureList ?? []),
    ...bundleFieldList(args.hiddenBundle, "mvp_in_scope")
  ]);
  const mustHaveFeatures = mergeExplicitAndInferred({
    explicit: explicitMustHaveFeatures,
    inferred:
      explicitMustHaveFeatures.length > 0
        ? domainPack.likelyFeatureDefaults.mustHave
        : domainPack.likelyFeatureDefaults.mustHave
  });

  const explicitNiceToHaveFeatures = uniqueStrings([
    ...(args.conversationState?.niceToHaveFeatures ?? [])
  ]);
  const niceToHaveFeatures = mergeExplicitAndInferred({
    explicit: explicitNiceToHaveFeatures,
    inferred: domainPack.likelyFeatureDefaults.niceToHave
  });

  const excludedFeatures = mergeExplicitAndInferred({
    explicit: bundleFieldList(args.hiddenBundle, "mvp_out_of_scope"),
    inferred: domainPack.likelyFeatureDefaults.excluded
  });

  const explicitSurfaceSignals = uniqueStrings([
    ...(args.mobileAppIntake ? ["mobile app"] : []),
    ...(cleanText(args.buildSession?.scope.surfaceType)
      ? [args.buildSession?.scope.surfaceType as string]
      : []),
    ...bundleFieldList(args.hiddenBundle, "primary_surfaces")
  ]);
  const surfaces = inferSurfaces({
    explicitSurfaces: explicitSurfaceSignals,
    domainPack,
    corpus
  });

  const explicitSystemSignals = uniqueStrings([
    ...(args.conversationState?.integrationsAndDataSources ?? []),
    ...(args.buildSession?.scope.integrationNeeds ?? []),
    ...bundleFieldList(args.hiddenBundle, "integrations"),
    ...bundleFieldList(args.hiddenBundle, "data_dependencies")
  ]);
  const systemPartition = partitionSystems(explicitSystemSignals);
  const integrations = mergeExplicitAndInferred({
    explicit: systemPartition.integrations,
    inferred: domainPack.likelyIntegrationDefaults
  });
  const dataSources = mergeExplicitAndInferred({
    explicit: systemPartition.dataSources,
    inferred: domainPack.likelyDataSourceDefaults
  });

  const explicitConstraints = uniqueStrings([
    ...(args.conversationState?.constraintsAndCompliance ?? []),
    ...bundleFieldList(args.hiddenBundle, "constraints"),
    ...(cleanText(bundleFieldText(args.hiddenBundle, "compliance_security_sensitivity"))
      ? [bundleFieldText(args.hiddenBundle, "compliance_security_sensitivity")]
      : [])
  ]);
  const constraints = mergeExplicitAndInferred({
    explicit: explicitConstraints,
    inferred: buildConstraintDefaults(args)
  });

  const complianceFlags = inferComplianceFlags({
    domainPack,
    explicitFlags:
      cleanText(bundleFieldText(args.hiddenBundle, "compliance_security_sensitivity")).length > 0
        ? [bundleFieldText(args.hiddenBundle, "compliance_security_sensitivity")]
        : [],
    constraints,
    corpus
  });
  const trustRisks = inferTrustRisks({
    domainPack,
    corpus
  });

  const slotStates: BriefSlotStateMap = {};
  const assumptionsMade: string[] = [];

  if (cleanText(args.conversationState?.founderName)) {
    markSlotState(slotStates, "founderName", "filled");
  }

  const projectName = cleanText(
    args.projectName ||
      args.buildSession?.scope.title ||
      args.saasIntake?.projectName ||
      args.mobileAppIntake?.projectName
  );

  if (projectName) {
    markSlotState(slotStates, "projectName", "filled");
  }

  if (explicitBuyerPersonas.length > 0) {
    markSlotState(slotStates, "buyerPersonas", "filled");
  } else if (buyerPersonas.length > 0) {
    markSlotState(slotStates, "buyerPersonas", "inferred");
    assumptionsMade.push(
      `Assumed the first buyer persona is ${joinListForSummary(buyerPersonas)} based on the domain and intake signals.`
    );
  }

  if (explicitOperatorPersonas.length > 0) {
    markSlotState(slotStates, "operatorPersonas", "filled");
  } else if (operatorPersonas.length > 0) {
    markSlotState(slotStates, "operatorPersonas", "inferred");
    assumptionsMade.push(
      `Assumed the first operator persona is ${joinListForSummary(operatorPersonas)} based on self-serve or domain-default behavior.`
    );
  }

  if (explicitEndCustomerPersonas.length > 0) {
    markSlotState(slotStates, "endCustomerPersonas", "filled");
  } else if (endCustomerPersonas.length > 0) {
    markSlotState(slotStates, "endCustomerPersonas", "inferred");
  }

  if (explicitAdminPersonas.length > 0) {
    markSlotState(slotStates, "adminPersonas", "filled");
  } else if (adminPersonas.length > 0) {
    markSlotState(slotStates, "adminPersonas", "inferred");
  }

  if (explicitProductCategory) {
    markSlotState(slotStates, "productCategory", "filled");
  } else if (productCategory) {
    markSlotState(slotStates, "productCategory", "inferred");
    assumptionsMade.push(
      `Canonicalized the product category to ${productCategory} from the resolved ${domainPack.label} domain pack.`
    );
  }

  if (explicitProblemStatement) {
    markSlotState(slotStates, "problemStatement", "filled");
  } else if (problemStatement) {
    markSlotState(slotStates, "problemStatement", "inferred");
    assumptionsMade.push(
      `Inferred a starting problem statement from the ${domainPack.label.toLowerCase()} domain cues.`
    );
  }

  if (explicitOutcomePromise) {
    markSlotState(slotStates, "outcomePromise", "filled");
  } else if (outcomePromise) {
    markSlotState(slotStates, "outcomePromise", "inferred");
    assumptionsMade.push("Inferred the first outcome promise from the current problem and domain fit.");
  }

  if (explicitMustHaveFeatures.length > 0) {
    markSlotState(slotStates, "mustHaveFeatures", "filled");
  } else if (mustHaveFeatures.length > 0) {
    markSlotState(slotStates, "mustHaveFeatures", "inferred");
    assumptionsMade.push(
      `Seeded must-have features from the ${domainPack.label.toLowerCase()} domain defaults.`
    );
  }

  if (explicitNiceToHaveFeatures.length > 0) {
    markSlotState(slotStates, "niceToHaveFeatures", "filled");
  } else if (niceToHaveFeatures.length > 0) {
    markSlotState(slotStates, "niceToHaveFeatures", "inferred");
  }

  if (excludedFeatures.length > 0) {
    markSlotState(slotStates, "excludedFeatures", "inferred");
  }

  if (explicitSurfaceSignals.length > 0) {
    markSlotState(slotStates, "surfaces", "filled");
  } else if (surfaces.length > 0) {
    markSlotState(slotStates, "surfaces", "inferred");
    assumptionsMade.push(
      `Assumed ${joinListForSummary(surfaces)} as the launch surfaces because the intake still points to a ${domainPack.productCategoryLabel}.`
    );
  }

  if (systemPartition.integrations.length > 0) {
    markSlotState(slotStates, "integrations", "filled");
  } else if (integrations.length > 0) {
    markSlotState(slotStates, "integrations", "inferred");
  }

  if (systemPartition.dataSources.length > 0) {
    markSlotState(slotStates, "dataSources", "filled");
  } else if (dataSources.length > 0) {
    markSlotState(slotStates, "dataSources", "inferred");
  }

  if (explicitConstraints.length > 0) {
    markSlotState(slotStates, "constraints", "filled");
  } else if (constraints.length > 0) {
    markSlotState(slotStates, "constraints", "inferred");
  }

  if (complianceFlags.length > 0) {
    markSlotState(slotStates, "complianceFlags", "inferred");
  }

  const domainSpecific = inferDomainSpecificSlots({
    domainPack,
    corpus,
    explicitDataSources: systemPartition.dataSources,
    explicitFeatures: explicitMustHaveFeatures
  });

  for (const [slotId, status] of Object.entries(domainSpecific.slotStates) as Array<
    [ProjectBriefSlotId, SlotStatus]
  >) {
    markSlotState(slotStates, slotId, status);
  }

  assumptionsMade.push(...domainSpecific.assumptionsMade);

  const readiness = buildReadiness({
    slotStates,
    domainPack,
    hasFocusedQuestionSignal:
      Boolean(productCategory) ||
      buyerPersonas.length > 0 ||
      operatorPersonas.length > 0 ||
      Boolean(problemStatement) ||
      Boolean(outcomePromise)
  });
  const openQuestions = buildOpenQuestions({
    domainPack,
    slotStates
  });
  const missingCriticalSlots = uniqueStrings([
    ...readiness.missingArchitecture,
    ...readiness.missingRoadmap
  ]) as ProjectBriefSlotId[];

  const projectBrief = projectBriefSchema.parse({
    founderName: cleanText(args.conversationState?.founderName) || null,
    projectName: projectName || null,
    domainPack: domainPack.id,
    buyerPersonas,
    operatorPersonas,
    endCustomerPersonas,
    adminPersonas,
    productCategory: productCategory || null,
    problemStatement: problemStatement || null,
    outcomePromise: outcomePromise || null,
    mustHaveFeatures,
    niceToHaveFeatures,
    excludedFeatures,
    surfaces,
    integrations,
    dataSources,
    constraints,
    complianceFlags,
    trustRisks,
    readinessScore: readiness.readinessScore,
    readiness: readiness.readiness,
    openQuestions,
    missingCriticalSlots,
    assumptionsMade: uniqueStrings(assumptionsMade)
  });

  return {
    projectBrief,
    resolution
  };
}

export function generateProjectBrief(args: ProjectBriefGeneratorInput): ProjectBrief {
  return buildProjectBriefInternal(args).projectBrief;
}

export type WorkspaceProjectIntelligence = {
  platformContext: PlatformContext;
  domainResolution: DomainResolution;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
};

export function buildWorkspaceProjectIntelligence(args: {
  workspaceId?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
  projectDescription?: string | null;
  projectMetadata?: StoredProjectMetadata | null;
  hiddenBundle?: HiddenIntelligenceBundle | null;
}) {
  const platformContext = loadPlatformContext(args.projectMetadata?.platformContext);
  const { projectBrief, resolution } = buildProjectBriefInternal({
    platformContext,
    projectName: args.projectTitle,
    projectDescription: args.projectDescription,
    conversationState: args.projectMetadata?.conversationState ?? null,
    hiddenBundle: args.hiddenBundle ?? null,
    buildSession: args.projectMetadata?.buildSession ?? null,
    saasIntake: args.projectMetadata?.saasIntake ?? null,
    mobileAppIntake: args.projectMetadata?.mobileAppIntake ?? null
  });
  const architectureBlueprint = generateArchitectureBlueprint({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectTitle,
    projectBrief
  });
  const roadmapPlan = generateRoadmapPlan({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectTitle,
    projectBrief,
    architectureBlueprint
  });
  const governancePolicy = generateGovernancePolicy({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectTitle,
    projectBrief,
    architectureBlueprint,
    roadmapPlan,
    projectMetadata: args.projectMetadata ?? null
  });

  return {
    platformContext,
    domainResolution: resolution,
    projectBrief,
    architectureBlueprint,
    roadmapPlan,
    governancePolicy
  } satisfies WorkspaceProjectIntelligence;
}
