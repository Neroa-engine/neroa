import type { ProjectBriefSlotId } from "../intelligence/domain-contracts.ts";
import type { ArchitectureInputId } from "../intelligence/architecture/types.ts";
import {
  blockerDefinitionSchema,
  blockerQuestionStateSchema,
  type BlockerDefinition,
  type BlockerId,
  type BlockerQuestionSource,
  type BlockerQuestionState,
  type StrategyWriteTarget
} from "./types.ts";

const COMMON_NON_FOUNDER_DISALLOWED = [
  "projectBrief.founderName"
] satisfies readonly StrategyWriteTarget[];

const registryEntries = [
  {
    id: "founder_name",
    label: "Founder name",
    description: "Capture the founder or operator name when the planning room still needs it.",
    questionText: "What should I call you?",
    questionFamily: "identity",
    schemaId: "founder_name",
    answerMode: "single_select",
    allowedWriteTargets: ["projectBrief.founderName"],
    disallowedSlotTargets: [],
    allowedNormalizationRules: [],
    validExampleAnswers: ["Tom", "My name is Sarah", "Call me Andre"],
    invalidExampleAnswers: ["no constraint", "OpenAI API"],
    clarificationRules: ["Ask for a short name if the answer does not look like a name."],
    completionCriteria: ["Founder name captured as a short human name."],
    nextBlockerHints: ["project_direction"],
    activeWhen: {
      slotIds: ["founderName"],
      inputIds: [],
      questionTextHints: ["what should i call you", "founder name"],
      capabilityHints: []
    },
    defaultClarificationPrompt: "I can save that once I have the name you'd like Neroa to use here.",
    allowPartialSave: false
  },
  {
    id: "project_direction",
    label: "Project direction",
    description: "Capture the product or system category being planned.",
    questionText: "What kind of product are you building?",
    questionFamily: "product",
    schemaId: "product_direction",
    answerMode: "freeform_structured",
    allowedWriteTargets: ["projectBrief.productCategory"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: [],
    validExampleAnswers: [
      "A donor portal for churches",
      "A restaurant sales analytics platform"
    ],
    invalidExampleAnswers: ["none", "maybe later"],
    clarificationRules: ["Ask for the product type or category if the answer is too vague."],
    completionCriteria: ["Product category captured."],
    nextBlockerHints: ["core_user_roles", "problem_statement"],
    activeWhen: {
      slotIds: ["projectName", "productCategory"],
      inputIds: ["productCategory"],
      questionTextHints: ["what are you building", "product direction", "product category"],
      capabilityHints: []
    },
    defaultClarificationPrompt:
      "I can save that once I know the product direction a little more clearly.",
    allowPartialSave: false
  },
  {
    id: "constraints",
    label: "Constraints",
    description: "Capture launch constraints, risk boundaries, or the explicit absence of them.",
    questionText: "What constraints or compliance boundaries matter right now?",
    questionFamily: "constraints",
    schemaId: "constraints",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["projectBrief.constraints"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["null_style_none"],
    validExampleAnswers: ["no constraint", "HIPAA and SOC 2", "Need to launch in 30 days"],
    invalidExampleAnswers: ["maybe"],
    clarificationRules: ["Ask whether there are any real launch constraints if the answer is vague."],
    completionCriteria: ["Constraints list or explicit no-constraints note captured."],
    nextBlockerHints: ["integrations", "compliance_sensitivity"],
    activeWhen: {
      slotIds: ["constraints"],
      inputIds: ["constraints"],
      questionTextHints: ["constraint", "compliance", "boundary"],
      capabilityHints: []
    },
    defaultClarificationPrompt:
      "I can save that once I know whether there are any real launch constraints or compliance boundaries.",
    allowPartialSave: false
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Capture launch integrations without letting the answer write into unrelated slots.",
    questionText: "Which integrations need to be in scope?",
    questionFamily: "integrations",
    schemaId: "provider_list",
    answerMode: "multi_select",
    allowedWriteTargets: ["projectBrief.integrations", "projectBrief.constraints"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["null_style_none", "provider_aliases"],
    validExampleAnswers: ["CoinMarketCap", "OpenAI API", "Toast and Square"],
    invalidExampleAnswers: ["Tom", "maybe"],
    clarificationRules: ["Ask which provider or integration should be first if the answer is vague."],
    completionCriteria: ["Integration list or explicit no-integration boundary captured."],
    nextBlockerHints: ["data_sources", "ai_integration_boundary"],
    activeWhen: {
      slotIds: ["integrations"],
      inputIds: ["integrations"],
      questionTextHints: ["integration", "connector", "api"],
      capabilityHints: ["connectors_integrations"]
    },
    defaultClarificationPrompt:
      "I can save that once I know which launch integration or provider you mean.",
    allowPartialSave: true
  },
  {
    id: "data_sources",
    label: "Data sources",
    description: "Capture data-source dependencies for analytics, reporting, or scoring.",
    questionText: "Which data sources should Neroa plan around?",
    questionFamily: "integrations",
    schemaId: "provider_list",
    answerMode: "multi_select",
    allowedWriteTargets: ["projectBrief.dataSources", "projectBrief.constraints"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["null_style_none", "provider_aliases"],
    validExampleAnswers: ["CoinMarketCap", "OpenAI API", "on-chain data and Dune"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask which data source matters first if the answer is too vague."],
    completionCriteria: ["Data sources list or explicit no-data-source boundary captured."],
    nextBlockerHints: ["scoring_inputs"],
    activeWhen: {
      slotIds: ["dataSources"],
      inputIds: ["dataSources"],
      questionTextHints: ["data source", "data feed", "signals", "vendor"],
      capabilityHints: ["dashboards_reporting"]
    },
    defaultClarificationPrompt:
      "I can save that once I know which data source or vendor should feed the product.",
    allowPartialSave: true
  },
  {
    id: "chains_in_scope",
    label: "Chains in scope",
    description: "Capture supported launch chains for crypto analytics products.",
    questionText: "Which chains are in scope first?",
    questionFamily: "domain_scope",
    schemaId: "chain_list",
    answerMode: "multi_select",
    allowedWriteTargets: ["answeredInputs.chainsInScope"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["chain_aliases"],
    validExampleAnswers: ["Ethereum and Solana", "Base first"],
    invalidExampleAnswers: ["none"],
    clarificationRules: ["Ask for at least one chain if the answer is still unclear."],
    completionCriteria: ["At least one launch chain captured."],
    nextBlockerHints: ["wallet_boundary", "scoring_inputs"],
    activeWhen: {
      slotIds: ["chainsInScope"],
      inputIds: ["chainsInScope"],
      questionTextHints: ["chains in scope", "supported chains"],
      capabilityHints: ["scoring_rules_engine"]
    },
    defaultClarificationPrompt: "I can save that once I know which chain or chains are in scope first.",
    allowPartialSave: true
  },
  {
    id: "wallet_boundary",
    label: "Wallet connection boundary",
    description: "Capture whether wallet connection belongs in MVP, later, or not at all.",
    questionText: "Is wallet connection in MVP or post-MVP?",
    questionFamily: "domain_scope",
    schemaId: "wallet_boundary",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["answeredInputs.walletConnectionMvp"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["mvp_boundary", "analytics_only"],
    validExampleAnswers: ["not in MVP", "include wallet connection at launch"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether wallet connection is in MVP or later if the answer stays vague."],
    completionCriteria: ["Wallet boundary captured."],
    nextBlockerHints: ["analytics_vs_advice_posture"],
    activeWhen: {
      slotIds: ["walletConnectionMvp"],
      inputIds: ["walletConnectionMvp"],
      questionTextHints: ["wallet connection", "wallet boundary"],
      capabilityHints: []
    },
    defaultClarificationPrompt:
      "I can save that once I know whether wallet connection belongs in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "analytics_vs_advice_posture",
    label: "Analytics vs advice posture",
    description: "Capture whether the product stays analytics-only or crosses into advice-adjacent territory.",
    questionText: "Is the product analytics-only or advice-adjacent?",
    questionFamily: "domain_scope",
    schemaId: "posture_boundary",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["answeredInputs.adviceAdjacency"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["analytics_only"],
    validExampleAnswers: ["analytics only", "not financial advice", "advice-adjacent"],
    invalidExampleAnswers: ["none"],
    clarificationRules: ["Ask whether the product stays analytics-only or enters advice."],
    completionCriteria: ["Posture boundary captured."],
    nextBlockerHints: ["scoring_inputs"],
    activeWhen: {
      slotIds: ["adviceAdjacency"],
      inputIds: ["adviceAdjacency"],
      questionTextHints: ["analytics only", "financial advice", "advice-adjacent"],
      capabilityHints: ["analytics_explainability"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether this stays analytics-only or becomes advice-adjacent.",
    allowPartialSave: false
  },
  {
    id: "scoring_inputs",
    label: "Scoring inputs",
    description: "Capture the signal sources or vendors used by the risk or scoring engine.",
    questionText: "What data or signal sources feed the score?",
    questionFamily: "systems",
    schemaId: "provider_list",
    answerMode: "multi_select",
    allowedWriteTargets: ["answeredInputs.riskSignalSources"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["provider_aliases"],
    validExampleAnswers: ["CoinMarketCap", "audit data and liquidity signals"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask which signal sources matter first if the answer is too vague."],
    completionCriteria: ["At least one scoring signal source captured."],
    nextBlockerHints: ["wallet_boundary"],
    activeWhen: {
      slotIds: ["riskSignalSources"],
      inputIds: ["riskSignalSources"],
      questionTextHints: ["signal source", "scoring input", "vendor source"],
      capabilityHints: ["scoring_rules_engine"]
    },
    defaultClarificationPrompt:
      "I can save that once I know which signal sources or vendors feed the score.",
    allowPartialSave: true
  },
  {
    id: "first_pos_connector",
    label: "First POS connector",
    description: "Capture the first POS connector for restaurant reporting products.",
    questionText: "Which POS connector should launch first?",
    questionFamily: "systems",
    schemaId: "connector_select",
    answerMode: "single_select",
    allowedWriteTargets: ["answeredInputs.firstPosConnector"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["pos_connector_aliases"],
    validExampleAnswers: ["Toast", "Square"],
    invalidExampleAnswers: ["maybe later"],
    clarificationRules: ["Ask which POS should be first if the connector is still unknown."],
    completionCriteria: ["First POS connector captured."],
    nextBlockerHints: ["launch_location_model", "launch_reports"],
    activeWhen: {
      slotIds: ["firstPosConnector"],
      inputIds: ["firstPosConnector"],
      questionTextHints: ["first pos", "pos connector", "toast", "square"],
      capabilityHints: ["connectors_integrations"]
    },
    defaultClarificationPrompt: "I can save that once I know which POS connector should launch first.",
    allowPartialSave: false
  },
  {
    id: "launch_location_model",
    label: "Launch location model",
    description: "Capture whether launch is single-location, multi-location, or phased.",
    questionText: "Is launch single-location or multi-location?",
    questionFamily: "domain_scope",
    schemaId: "location_model",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["answeredInputs.launchLocationModel"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["launch_location_aliases"],
    validExampleAnswers: ["single location", "multi-location later"],
    invalidExampleAnswers: ["none"],
    clarificationRules: ["Ask how launch handles locations if the rollout model is still unclear."],
    completionCriteria: ["Launch location model captured."],
    nextBlockerHints: ["launch_reports"],
    activeWhen: {
      slotIds: ["launchLocationModel"],
      inputIds: ["launchLocationModel"],
      questionTextHints: ["single location", "multi-location", "location model"],
      capabilityHints: ["dashboards_reporting"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether launch is single-location, multi-location, or phased.",
    allowPartialSave: false
  },
  {
    id: "launch_reports",
    label: "Launch reports",
    description: "Capture the first reports or dashboards required at launch.",
    questionText: "Which reports need to exist at launch?",
    questionFamily: "systems",
    schemaId: "reports_list",
    answerMode: "list",
    allowedWriteTargets: ["answeredInputs.launchReports"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["report_aliases"],
    validExampleAnswers: ["sales dashboard", "location reporting and menu-item reporting"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask which report needs to exist first if the answer stays vague."],
    completionCriteria: ["Launch reports captured."],
    nextBlockerHints: ["dashboard_reporting_requirement"],
    activeWhen: {
      slotIds: ["launchReports"],
      inputIds: ["launchReports"],
      questionTextHints: ["launch reports", "reporting", "dashboard"],
      capabilityHints: ["dashboards_reporting"]
    },
    defaultClarificationPrompt:
      "I can save that once I know which reports or dashboards have to exist at launch.",
    allowPartialSave: true
  },
  {
    id: "core_user_roles",
    label: "Core user roles",
    description: "Capture who buys the product and who operates it.",
    questionText: "Who buys this and who uses it day to day?",
    questionFamily: "roles",
    schemaId: "role_split",
    answerMode: "freeform_structured",
    allowedWriteTargets: ["projectBrief.buyerPersonas", "projectBrief.operatorPersonas"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["role_aliases"],
    validExampleAnswers: ["owners and managers", "crypto investors"],
    invalidExampleAnswers: ["none"],
    clarificationRules: ["Ask separately for buyer and operator roles if only one side is known."],
    completionCriteria: ["Buyer or operator roles captured safely."],
    nextBlockerHints: ["project_direction", "launch_location_model"],
    activeWhen: {
      slotIds: ["buyerPersonas", "operatorPersonas"],
      inputIds: ["buyerPersonas", "operatorPersonas"],
      questionTextHints: ["owners and managers", "who is this for", "core user roles"],
      capabilityHints: ["role_based_access"]
    },
    defaultClarificationPrompt:
      "I can save that once I know who buys this and who operates it day to day.",
    allowPartialSave: true
  },
  {
    id: "compliance_sensitivity",
    label: "Compliance sensitivity",
    description: "Capture whether the product has specific compliance or trust sensitivity.",
    questionText: "Are there compliance or trust sensitivities Neroa should plan around?",
    questionFamily: "compliance",
    schemaId: "compliance_sensitivity",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["projectBrief.complianceFlags"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["null_style_none", "compliance_aliases"],
    validExampleAnswers: ["HIPAA", "no special compliance issues"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether there are any compliance sensitivities if the answer is vague."],
    completionCriteria: ["Compliance sensitivity captured or explicitly cleared."],
    nextBlockerHints: ["constraints"],
    activeWhen: {
      slotIds: ["complianceFlags"],
      inputIds: [],
      questionTextHints: ["compliance", "sensitivity", "regulated", "hipaa"],
      capabilityHints: []
    },
    defaultClarificationPrompt:
      "I can save that once I know whether there are any compliance or trust sensitivities to plan around.",
    allowPartialSave: false
  },
  {
    id: "ai_integration_boundary",
    label: "AI integration boundary",
    description: "Capture whether AI is part of launch scope, deferred, or excluded.",
    questionText: "Is AI in scope for launch, and if so which provider boundary matters?",
    questionFamily: "systems",
    schemaId: "ai_integration_boundary",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["projectBrief.integrations", "projectBrief.constraints"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["null_style_none", "provider_aliases", "mvp_boundary"],
    validExampleAnswers: ["OpenAI API", "ChatGPT 5.4", "not right now"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether AI is in MVP now or later if the answer stays vague."],
    completionCriteria: ["AI boundary captured."],
    nextBlockerHints: ["integrations", "data_sources"],
    activeWhen: {
      slotIds: ["integrations", "dataSources"],
      inputIds: ["integrations", "dataSources"],
      questionTextHints: ["ai", "openai", "gpt", "chatgpt"],
      capabilityHints: ["ai_copilot"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether AI is part of launch scope now or later.",
    allowPartialSave: true
  },
  {
    id: "file_upload_requirement",
    label: "File upload requirement",
    description: "Capture whether file uploads belong in MVP or later.",
    questionText: "Do file uploads belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [
      "projectBrief.mustHaveFeatures",
      "projectBrief.excludedFeatures",
      "projectBrief.constraints"
    ],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "mvp_boundary"],
    validExampleAnswers: ["yes", "not in MVP", "post MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether file uploads are in MVP or later if the answer stays vague."],
    completionCriteria: ["File upload boundary captured."],
    nextBlockerHints: ["notifications_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["file upload", "upload files", "documents"],
      capabilityHints: ["file_uploads"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether file uploads belong in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "notifications_requirement",
    label: "Notifications requirement",
    description: "Capture whether notifications belong in MVP or later.",
    questionText: "Do notifications belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [
      "projectBrief.mustHaveFeatures",
      "projectBrief.excludedFeatures",
      "projectBrief.constraints"
    ],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "mvp_boundary"],
    validExampleAnswers: ["yes", "post MVP", "not right now"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether notifications belong in MVP or later if the answer stays vague."],
    completionCriteria: ["Notifications boundary captured."],
    nextBlockerHints: ["admin_console_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["notification", "email alerts", "alerts"],
      capabilityHints: ["notifications"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether notifications belong in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "admin_console_requirement",
    label: "Admin console requirement",
    description: "Capture whether the admin console belongs in MVP or later.",
    questionText: "Does the admin console belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [
      "projectBrief.mustHaveFeatures",
      "projectBrief.excludedFeatures",
      "projectBrief.constraints"
    ],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "mvp_boundary"],
    validExampleAnswers: ["yes", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether the admin console belongs in MVP or later if the answer stays vague."],
    completionCriteria: ["Admin console boundary captured."],
    nextBlockerHints: ["search_filter_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["admin console", "admin controls", "admin"],
      capabilityHints: ["admin_console"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether the admin console belongs in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "search_filter_requirement",
    label: "Search and filter requirement",
    description: "Capture whether search and filter belong in MVP or later.",
    questionText: "Do search and filter belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [
      "projectBrief.mustHaveFeatures",
      "projectBrief.excludedFeatures",
      "projectBrief.constraints"
    ],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "mvp_boundary"],
    validExampleAnswers: ["yes", "post MVP", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether search and filter belong in MVP or later if the answer stays vague."],
    completionCriteria: ["Search/filter boundary captured."],
    nextBlockerHints: ["dashboard_reporting_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["search", "filter", "saved views", "watchlist"],
      capabilityHints: ["search_filter", "watchlists_saved_views"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether search and filter belong in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "dashboard_reporting_requirement",
    label: "Dashboard and reporting requirement",
    description: "Capture whether dashboards/reporting belong in MVP or later.",
    questionText: "Do dashboard reporting features belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [
      "projectBrief.mustHaveFeatures",
      "projectBrief.excludedFeatures",
      "projectBrief.constraints"
    ],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "mvp_boundary", "report_aliases"],
    validExampleAnswers: ["yes", "not in MVP", "sales dashboards at launch"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether reporting belongs in MVP or later if the answer stays vague."],
    completionCriteria: ["Dashboard/reporting boundary captured."],
    nextBlockerHints: ["launch_reports"],
    activeWhen: {
      slotIds: ["mustHaveFeatures", "launchReports"],
      inputIds: ["mustHaveFeatures", "launchReports"],
      questionTextHints: ["dashboard", "report", "reporting"],
      capabilityHints: ["dashboards_reporting", "exports"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether dashboard reporting belongs in MVP or later.",
    allowPartialSave: true
  }
] satisfies readonly BlockerDefinition[];

export const BLOCKER_REGISTRY = new Map<BlockerId, BlockerDefinition>(
  registryEntries.map((entry) => [entry.id, blockerDefinitionSchema.parse(entry)])
);

export function getBlockerDefinition(blockerId: BlockerId) {
  return BLOCKER_REGISTRY.get(blockerId) ?? null;
}

export function listBlockerDefinitions() {
  return [...BLOCKER_REGISTRY.values()];
}

function normalizeQuestionText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
}

const DIRECT_SLOT_BLOCKER_IDS: Partial<Record<ProjectBriefSlotId | ArchitectureInputId, BlockerId>> = {
  founderName: "founder_name",
  productCategory: "project_direction",
  buyerPersonas: "core_user_roles",
  operatorPersonas: "core_user_roles",
  constraints: "constraints",
  integrations: "integrations",
  dataSources: "data_sources",
  chainsInScope: "chains_in_scope",
  walletConnectionMvp: "wallet_boundary",
  adviceAdjacency: "analytics_vs_advice_posture",
  riskSignalSources: "scoring_inputs",
  launchLocationModel: "launch_location_model",
  firstPosConnector: "first_pos_connector",
  launchReports: "launch_reports",
  complianceFlags: "compliance_sensitivity"
};

function matchQuestionHint(
  blockerId: BlockerId,
  questionText: string,
  inputId?: string | null
) {
  const definition = getBlockerDefinition(blockerId);

  if (!definition) {
    return false;
  }

  if (
    inputId &&
    (definition.activeWhen.inputIds.includes(inputId as ArchitectureInputId) ||
      definition.activeWhen.slotIds.includes(inputId as ProjectBriefSlotId))
  ) {
    return true;
  }

  return definition.activeWhen.questionTextHints.some((hint) => questionText.includes(hint));
}

export function resolveBlockerIdFromQuestion(args: {
  inputId?: string | null;
  label?: string | null;
  question?: string | null;
}) {
  const inputId = args.inputId?.trim() ?? "";
  const direct = DIRECT_SLOT_BLOCKER_IDS[inputId as keyof typeof DIRECT_SLOT_BLOCKER_IDS];

  if (direct) {
    const normalizedQuestionText = normalizeQuestionText(`${args.label ?? ""} ${args.question ?? ""}`);

    if (direct === "integrations" && matchQuestionHint("ai_integration_boundary", normalizedQuestionText, inputId)) {
      return "ai_integration_boundary" as const;
    }

    if (inputId === "mustHaveFeatures") {
      if (matchQuestionHint("file_upload_requirement", normalizedQuestionText, inputId)) {
        return "file_upload_requirement" as const;
      }

      if (matchQuestionHint("notifications_requirement", normalizedQuestionText, inputId)) {
        return "notifications_requirement" as const;
      }

      if (matchQuestionHint("admin_console_requirement", normalizedQuestionText, inputId)) {
        return "admin_console_requirement" as const;
      }

      if (matchQuestionHint("search_filter_requirement", normalizedQuestionText, inputId)) {
        return "search_filter_requirement" as const;
      }

      if (matchQuestionHint("dashboard_reporting_requirement", normalizedQuestionText, inputId)) {
        return "dashboard_reporting_requirement" as const;
      }
    }

    return direct;
  }

  const normalizedQuestionText = normalizeQuestionText(`${args.label ?? ""} ${args.question ?? ""}`);

  for (const definition of listBlockerDefinitions()) {
    if (definition.activeWhen.questionTextHints.some((hint) => normalizedQuestionText.includes(hint))) {
      return definition.id;
    }
  }

  return null;
}

export function buildBlockerQuestionState(args: {
  blockerId: BlockerId;
  inputId: string;
  slotId?: ProjectBriefSlotId | null;
  label: string;
  question: string;
  source: BlockerQuestionSource;
  currentValue?: string | null;
}) {
  return blockerQuestionStateSchema.parse({
    blockerId: args.blockerId,
    inputId: args.inputId,
    slotId: args.slotId ?? null,
    label: args.label,
    question: args.question,
    source: args.source,
    currentValue: args.currentValue ? args.currentValue.trim() : null
  });
}
