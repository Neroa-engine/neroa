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

type BlockerRegistryEntry = Omit<BlockerDefinition, "safeSecondaryHintBlockerIds"> & {
  safeSecondaryHintBlockerIds?: readonly BlockerId[];
};

const FEATURE_BOUNDARY_WRITE_TARGETS = [
  "projectBrief.mustHaveFeatures",
  "projectBrief.excludedFeatures",
  "projectBrief.constraints"
] satisfies readonly StrategyWriteTarget[];

const SURFACE_BOUNDARY_WRITE_TARGETS = [
  "projectBrief.surfaces",
  "projectBrief.excludedFeatures",
  "projectBrief.constraints"
] satisfies readonly StrategyWriteTarget[];

const PROVIDER_REQUIREMENT_WRITE_TARGETS = [
  "projectBrief.integrations",
  "projectBrief.mustHaveFeatures",
  "projectBrief.excludedFeatures",
  "projectBrief.constraints"
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
    safeSecondaryHintBlockerIds: ["constraints", "ai_integration_boundary"],
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
    safeSecondaryHintBlockerIds: ["constraints", "ai_integration_boundary"],
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
    safeSecondaryHintBlockerIds: ["analytics_vs_advice_posture", "wallet_boundary"],
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
    safeSecondaryHintBlockerIds: ["launch_location_model", "exports_requirement"],
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
    allowedWriteTargets: [
      "projectBrief.buyerPersonas",
      "projectBrief.operatorPersonas",
      "projectBrief.endCustomerPersonas",
      "projectBrief.adminPersonas"
    ],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["role_aliases"],
    validExampleAnswers: ["owners and managers", "crypto investors"],
    invalidExampleAnswers: ["none"],
    clarificationRules: ["Ask separately for buyer and operator roles if only one side is known."],
    completionCriteria: ["Buyer or operator roles captured safely."],
    nextBlockerHints: ["project_direction", "launch_location_model"],
    safeSecondaryHintBlockerIds: ["mobile_priority_requirement"],
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
    id: "pricing_model",
    label: "Pricing model",
    description: "Capture the pricing or revenue model without letting it drift into unrelated slots.",
    questionText: "What pricing or revenue model should Neroa plan around?",
    questionFamily: "product",
    schemaId: "pricing_model",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["projectBrief.constraints"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["pricing_aliases"],
    validExampleAnswers: ["subscription", "usage based", "donation"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask how the product expects to make money if pricing is still unclear."],
    completionCriteria: ["Pricing model captured or explicitly deferred."],
    nextBlockerHints: ["payments_billing_requirement"],
    activeWhen: {
      slotIds: ["constraints"],
      inputIds: ["constraints"],
      questionTextHints: ["pricing", "revenue model", "billing model", "monetization"],
      capabilityHints: ["payments_or_billing"]
    },
    defaultClarificationPrompt:
      "I can save that once I know the first pricing or revenue model Neroa should plan around.",
    allowPartialSave: false
  },
  {
    id: "payments_billing_requirement",
    label: "Payments and billing requirement",
    description: "Capture whether payments or billing belong in scope, plus any provider boundary.",
    questionText: "Do payments or billing belong in scope for launch?",
    questionFamily: "integrations",
    schemaId: "provider_requirement",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [...PROVIDER_REQUIREMENT_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: [
      "feature_requirement_aliases",
      "feature_signal_aliases",
      "provider_aliases",
      "mvp_boundary"
    ],
    validExampleAnswers: ["Stripe", "Stripe and QuickBooks", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether payments must ship on day one and which provider matters first."],
    completionCriteria: ["Payments/billing boundary captured."],
    nextBlockerHints: ["pricing_model"],
    safeSecondaryHintBlockerIds: ["pricing_model"],
    activeWhen: {
      slotIds: ["integrations", "mustHaveFeatures"],
      inputIds: ["integrations", "mustHaveFeatures"],
      questionTextHints: ["payments", "billing", "stripe", "quickbooks"],
      capabilityHints: ["payments_or_billing"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether payments or billing belong in launch scope and which provider matters first.",
    allowPartialSave: true
  },
  {
    id: "marketplace_listings_requirement",
    label: "Marketplace listings requirement",
    description: "Capture whether listings and marketplace behavior belong in MVP or later.",
    questionText: "Do marketplace listings belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "mvp_boundary"],
    validExampleAnswers: ["listing marketplace", "yes", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether listings must exist at launch if the answer is still vague."],
    completionCriteria: ["Marketplace-listings boundary captured."],
    nextBlockerHints: ["search_filter_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["marketplace", "listing", "listings"],
      capabilityHints: ["marketplace_listings"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether marketplace listings belong in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "scheduling_dispatch_requirement",
    label: "Scheduling and dispatch requirement",
    description: "Capture whether scheduling, dispatch, or a calendar board belong in launch scope.",
    questionText: "Do scheduling or dispatch workflows belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "mvp_boundary"],
    validExampleAnswers: ["dispatch board", "schedule calendar", "post launch"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether scheduling or dispatch must ship on day one if the answer is still vague."],
    completionCriteria: ["Scheduling/dispatch boundary captured."],
    nextBlockerHints: ["mobile_priority_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["dispatch", "scheduling", "calendar"],
      capabilityHints: ["scheduling_dispatch"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether scheduling or dispatch belongs in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "customer_portal_requirement",
    label: "Customer portal requirement",
    description: "Capture whether a customer-facing portal belongs in launch scope.",
    questionText: "Does a customer portal belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "surface_boundary",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [...SURFACE_BOUNDARY_WRITE_TARGETS, "projectBrief.mustHaveFeatures"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "surface_aliases", "feature_signal_aliases", "mvp_boundary"],
    validExampleAnswers: ["customer portal", "customer login", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether the portal is public/customer-facing now or later if the answer stays vague."],
    completionCriteria: ["Customer-portal boundary captured."],
    nextBlockerHints: ["public_vs_internal_surface"],
    safeSecondaryHintBlockerIds: ["public_vs_internal_surface"],
    activeWhen: {
      slotIds: ["mustHaveFeatures", "surfaces"],
      inputIds: ["mustHaveFeatures", "surfaces"],
      questionTextHints: ["customer portal", "portal", "customer login"],
      capabilityHints: ["customer_portal"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether the customer portal belongs in MVP or later.",
    allowPartialSave: true
  },
  {
    id: "exports_requirement",
    label: "Exports requirement",
    description: "Capture whether export functionality belongs in launch scope and which export formats matter.",
    questionText: "Do exports belong in MVP, and if so which export formats matter?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "report_aliases", "mvp_boundary"],
    validExampleAnswers: ["exports too", "CSV export", "PDF export", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask which export formats matter if the answer only says exports."],
    completionCriteria: ["Export boundary captured."],
    nextBlockerHints: ["reporting_depth_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures", "launchReports"],
      inputIds: ["mustHaveFeatures", "launchReports"],
      questionTextHints: ["export", "csv", "pdf"],
      capabilityHints: ["exports"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether exports belong in MVP and which export formats matter first.",
    allowPartialSave: true
  },
  {
    id: "role_based_access_requirement",
    label: "Role-based access requirement",
    description: "Capture whether role-based access belongs in scope and any high-level access boundary.",
    questionText: "Does role-based access belong in MVP or later?",
    questionFamily: "roles",
    schemaId: "feature_requirement",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "role_aliases", "mvp_boundary"],
    validExampleAnswers: ["admin only", "team members too", "yes"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask what access boundary matters first if the answer only hints at permissions."],
    completionCriteria: ["Role-based-access boundary captured."],
    nextBlockerHints: ["admin_permissions_requirement"],
    activeWhen: {
      slotIds: ["buyerPersonas", "operatorPersonas", "mustHaveFeatures"],
      inputIds: ["buyerPersonas", "operatorPersonas", "mustHaveFeatures"],
      questionTextHints: ["role based access", "permissions", "admin only", "team members"],
      capabilityHints: ["role_based_access"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether role-based access belongs in MVP or later.",
    allowPartialSave: true
  },
  {
    id: "multi_tenancy_requirement",
    label: "Multi-tenancy requirement",
    description: "Capture the account or tenant model Neroa should plan around.",
    questionText: "What tenancy or account model should Neroa plan around at launch?",
    questionFamily: "systems",
    schemaId: "tenancy_requirement",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["projectBrief.constraints"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["tenancy_aliases", "launch_location_aliases"],
    validExampleAnswers: ["multi-tenant", "one account per client", "internal team only"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether each client has its own account or the product is shared across tenants if the answer is still vague."],
    completionCriteria: ["Tenancy requirement captured."],
    nextBlockerHints: ["public_vs_internal_surface"],
    activeWhen: {
      slotIds: ["constraints", "launchLocationModel"],
      inputIds: ["constraints", "launchLocationModel"],
      questionTextHints: ["multi tenant", "tenant", "account model", "one account per client"],
      capabilityHints: ["multi_tenancy"]
    },
    defaultClarificationPrompt:
      "I can save that once I know the tenancy or account model Neroa should plan around.",
    allowPartialSave: false
  },
  {
    id: "workflow_approval_requirement",
    label: "Workflow approval requirement",
    description: "Capture whether approval workflows belong in MVP or later.",
    questionText: "Do workflow approvals belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "mvp_boundary"],
    validExampleAnswers: ["approval workflow", "yes", "phase two"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether approvals must exist at launch if the answer is still vague."],
    completionCriteria: ["Workflow-approval boundary captured."],
    nextBlockerHints: ["document_case_intake_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["approval workflow", "approval", "workflow approvals"],
      capabilityHints: ["workflow_approvals"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether workflow approvals belong in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "document_case_intake_requirement",
    label: "Document or case intake requirement",
    description: "Capture whether intake forms, document intake, or case intake belong in launch scope.",
    questionText: "Does document or case intake belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "mvp_boundary"],
    validExampleAnswers: ["intake form", "application queue", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether intake must exist at launch if the answer is still vague."],
    completionCriteria: ["Document/case-intake boundary captured."],
    nextBlockerHints: ["workflow_approval_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["intake form", "case intake", "document intake", "application queue"],
      capabilityHints: ["document_or_case_intake"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether document or case intake belongs in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "api_access_requirement",
    label: "API access requirement",
    description: "Capture whether API access belongs in MVP or later.",
    questionText: "Does API access belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "mvp_boundary"],
    validExampleAnswers: ["API access", "developer API", "post launch"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether API access is launch-critical if the answer is still vague."],
    completionCriteria: ["API-access boundary captured."],
    nextBlockerHints: ["integrations"],
    activeWhen: {
      slotIds: ["mustHaveFeatures", "integrations"],
      inputIds: ["mustHaveFeatures", "integrations"],
      questionTextHints: ["api access", "developer api", "public api"],
      capabilityHints: ["api_access"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether API access belongs in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "reporting_depth_requirement",
    label: "Reporting depth requirement",
    description: "Capture the first reporting depth needed at launch, including dashboards and exports.",
    questionText: "What reporting depth has to exist at launch?",
    questionFamily: "feature_boundary",
    schemaId: "reports_list",
    answerMode: "list",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["report_aliases", "feature_signal_aliases", "feature_requirement_aliases"],
    validExampleAnswers: ["dashboard", "dashboard plus CSV export", "analytics and exports too"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask which specific reporting outputs matter first if the answer is too vague."],
    completionCriteria: ["Reporting-depth boundary captured."],
    nextBlockerHints: ["exports_requirement", "launch_reports"],
    safeSecondaryHintBlockerIds: ["exports_requirement", "search_saved_views_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures", "launchReports"],
      inputIds: ["mustHaveFeatures", "launchReports"],
      questionTextHints: ["reporting depth", "dashboard", "analytics", "reporting"],
      capabilityHints: ["dashboards_reporting"]
    },
    defaultClarificationPrompt:
      "I can save that once I know which reporting outputs have to exist at launch.",
    allowPartialSave: true
  },
  {
    id: "admin_permissions_requirement",
    label: "Admin permissions requirement",
    description: "Capture whether admin permissions or admin controls belong in launch scope.",
    questionText: "Do admin permissions belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "boolean",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "mvp_boundary"],
    validExampleAnswers: ["admin only", "admin permissions", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether admin permissions are needed at launch if the answer is still vague."],
    completionCriteria: ["Admin-permissions boundary captured."],
    nextBlockerHints: ["role_based_access_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["admin permissions", "admin only", "admin controls"],
      capabilityHints: ["admin_console", "role_based_access"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether admin permissions belong in MVP or later.",
    allowPartialSave: false
  },
  {
    id: "notification_channels",
    label: "Notification channels",
    description: "Capture whether notifications belong in scope and which channels matter first.",
    questionText: "If notifications are in scope, which channels matter first?",
    questionFamily: "systems",
    schemaId: "notification_channels",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["notification_channel_aliases", "feature_requirement_aliases", "mvp_boundary"],
    validExampleAnswers: ["email and SMS", "push", "not right now"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask which channels matter first if the answer only says notifications."],
    completionCriteria: ["Notification channel boundary captured."],
    nextBlockerHints: ["notifications_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["notification channels", "email", "sms", "push", "slack"],
      capabilityHints: ["notifications"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether notifications belong in scope and which channels matter first.",
    allowPartialSave: true
  },
  {
    id: "file_storage_requirement",
    label: "File storage requirement",
    description: "Capture whether file storage belongs in launch scope and whether any provider boundary matters.",
    questionText: "Does file storage belong in MVP or later?",
    questionFamily: "systems",
    schemaId: "provider_requirement",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [...PROVIDER_REQUIREMENT_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "provider_aliases", "mvp_boundary"],
    validExampleAnswers: ["file storage", "S3 later", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether file storage is needed at launch and whether a specific provider matters."],
    completionCriteria: ["File-storage boundary captured."],
    nextBlockerHints: ["file_upload_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures", "integrations"],
      inputIds: ["mustHaveFeatures", "integrations"],
      questionTextHints: ["file storage", "storage", "blob", "s3", "drive"],
      capabilityHints: ["file_uploads"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether file storage belongs in MVP or later and whether a specific provider matters.",
    allowPartialSave: true
  },
  {
    id: "support_human_review_requirement",
    label: "Support or human review requirement",
    description: "Capture whether support review or human-review steps belong in launch scope.",
    questionText: "Does human review or support review belong in the launch workflow?",
    questionFamily: "compliance",
    schemaId: "feature_requirement",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [
      "projectBrief.mustHaveFeatures",
      "projectBrief.excludedFeatures",
      "projectBrief.constraints",
      "projectBrief.trustRisks"
    ],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "mvp_boundary"],
    validExampleAnswers: ["human review", "manual review", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether a person has to review cases at launch if the answer is still vague."],
    completionCriteria: ["Human-review boundary captured."],
    nextBlockerHints: ["compliance_sensitivity"],
    activeWhen: {
      slotIds: ["constraints", "complianceFlags", "mustHaveFeatures"],
      inputIds: ["constraints", "mustHaveFeatures"],
      questionTextHints: ["human review", "manual review", "support review"],
      capabilityHints: []
    },
    defaultClarificationPrompt:
      "I can save that once I know whether human review belongs in the launch workflow or later.",
    allowPartialSave: true
  },
  {
    id: "mobile_priority_requirement",
    label: "Mobile priority requirement",
    description: "Capture whether mobile is first, later, or out of launch scope.",
    questionText: "How important is mobile for launch?",
    questionFamily: "feature_boundary",
    schemaId: "surface_boundary",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [...SURFACE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["surface_aliases", "feature_requirement_aliases", "mvp_boundary"],
    validExampleAnswers: ["mobile first", "mobile matters later", "desktop first"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether mobile must exist at launch or is a later priority if the answer is still vague."],
    completionCriteria: ["Mobile-priority boundary captured."],
    nextBlockerHints: ["public_vs_internal_surface"],
    activeWhen: {
      slotIds: ["surfaces", "mustHaveFeatures"],
      inputIds: ["surfaces", "mustHaveFeatures"],
      questionTextHints: ["mobile", "ios", "android", "desktop first"],
      capabilityHints: []
    },
    defaultClarificationPrompt:
      "I can save that once I know whether mobile is first, later, or out of launch scope.",
    allowPartialSave: true
  },
  {
    id: "public_vs_internal_surface",
    label: "Public vs internal surface",
    description: "Capture whether the primary launch surface is internal-only, customer-facing, or public.",
    questionText: "Is the launch surface internal-only, customer-facing, or public?",
    questionFamily: "product",
    schemaId: "surface_boundary",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: ["projectBrief.surfaces", "projectBrief.constraints"],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["surface_aliases"],
    validExampleAnswers: ["internal only", "customer portal", "public app"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether the first surface is internal-only or customer-facing if the answer is still vague."],
    completionCriteria: ["Primary surface boundary captured."],
    nextBlockerHints: ["customer_portal_requirement"],
    activeWhen: {
      slotIds: ["surfaces"],
      inputIds: ["surfaces"],
      questionTextHints: ["internal only", "public", "customer facing", "customer portal"],
      capabilityHints: ["customer_portal"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether the launch surface is internal-only, customer-facing, or public.",
    allowPartialSave: false
  },
  {
    id: "search_saved_views_requirement",
    label: "Search and saved views requirement",
    description: "Capture whether search, filter, saved views, or watchlists belong in launch scope.",
    questionText: "Do search, filter, or saved views belong in MVP or later?",
    questionFamily: "feature_boundary",
    schemaId: "feature_requirement",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [...FEATURE_BOUNDARY_WRITE_TARGETS],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "report_aliases", "mvp_boundary"],
    validExampleAnswers: ["saved views", "watchlist", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether saved views or watchlists must exist at launch if the answer is still vague."],
    completionCriteria: ["Search/saved-views boundary captured."],
    nextBlockerHints: ["search_filter_requirement"],
    activeWhen: {
      slotIds: ["mustHaveFeatures"],
      inputIds: ["mustHaveFeatures"],
      questionTextHints: ["saved views", "watchlist", "watchlists", "saved search"],
      capabilityHints: ["search_filter", "watchlists_saved_views"]
    },
    defaultClarificationPrompt:
      "I can save that once I know whether search, saved views, or watchlists belong in MVP or later.",
    allowPartialSave: true
  },
  {
    id: "audit_trail_requirement",
    label: "Audit trail requirement",
    description: "Capture whether audit logs or audit trails belong in launch scope.",
    questionText: "Does an audit trail belong in MVP or later?",
    questionFamily: "compliance",
    schemaId: "feature_requirement",
    answerMode: "enum_plus_notes",
    allowedWriteTargets: [
      "projectBrief.mustHaveFeatures",
      "projectBrief.excludedFeatures",
      "projectBrief.complianceFlags",
      "projectBrief.constraints"
    ],
    disallowedSlotTargets: [...COMMON_NON_FOUNDER_DISALLOWED],
    allowedNormalizationRules: ["feature_requirement_aliases", "feature_signal_aliases", "compliance_aliases", "mvp_boundary"],
    validExampleAnswers: ["audit trail", "audit log", "not in MVP"],
    invalidExampleAnswers: ["Tom"],
    clarificationRules: ["Ask whether audit history is launch-critical if the answer is still vague."],
    completionCriteria: ["Audit-trail boundary captured."],
    nextBlockerHints: ["compliance_sensitivity"],
    activeWhen: {
      slotIds: ["mustHaveFeatures", "complianceFlags", "constraints"],
      inputIds: ["mustHaveFeatures", "constraints"],
      questionTextHints: ["audit trail", "audit log", "history"],
      capabilityHints: []
    },
    defaultClarificationPrompt:
      "I can save that once I know whether an audit trail belongs in MVP or later.",
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
] satisfies readonly BlockerRegistryEntry[];

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

const QUESTION_ROUTED_BLOCKERS_BY_INPUT_ID: Partial<
  Record<ProjectBriefSlotId | ArchitectureInputId, readonly BlockerId[]>
> = {
  constraints: [
    "pricing_model",
    "multi_tenancy_requirement",
    "support_human_review_requirement",
    "audit_trail_requirement",
    "constraints"
  ],
  integrations: [
    "payments_billing_requirement",
    "ai_integration_boundary",
    "file_storage_requirement",
    "api_access_requirement",
    "integrations"
  ],
  dataSources: [
    "ai_integration_boundary",
    "data_sources"
  ],
  mustHaveFeatures: [
    "payments_billing_requirement",
    "marketplace_listings_requirement",
    "scheduling_dispatch_requirement",
    "customer_portal_requirement",
    "exports_requirement",
    "role_based_access_requirement",
    "workflow_approval_requirement",
    "document_case_intake_requirement",
    "api_access_requirement",
    "admin_permissions_requirement",
    "notification_channels",
    "file_storage_requirement",
    "support_human_review_requirement",
    "mobile_priority_requirement",
    "search_saved_views_requirement",
    "audit_trail_requirement",
    "file_upload_requirement",
    "notifications_requirement",
    "admin_console_requirement",
    "search_filter_requirement",
    "dashboard_reporting_requirement",
    "reporting_depth_requirement"
  ],
  surfaces: [
    "customer_portal_requirement",
    "mobile_priority_requirement",
    "public_vs_internal_surface"
  ],
  launchReports: [
    "launch_reports",
    "dashboard_reporting_requirement",
    "reporting_depth_requirement",
    "exports_requirement"
  ]
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
    !questionText &&
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
  const normalizedQuestionText = normalizeQuestionText(`${args.label ?? ""} ${args.question ?? ""}`);
  const routedCandidates =
    QUESTION_ROUTED_BLOCKERS_BY_INPUT_ID[
      inputId as keyof typeof QUESTION_ROUTED_BLOCKERS_BY_INPUT_ID
    ] ?? [];

  if (normalizedQuestionText && routedCandidates.length > 0) {
    for (const blockerId of routedCandidates) {
      if (matchQuestionHint(blockerId, normalizedQuestionText, inputId)) {
        return blockerId;
      }
    }
  }

  const direct = DIRECT_SLOT_BLOCKER_IDS[inputId as keyof typeof DIRECT_SLOT_BLOCKER_IDS];

  if (direct) {
    if (direct === "integrations" && matchQuestionHint("ai_integration_boundary", normalizedQuestionText, inputId)) {
      return "ai_integration_boundary" as const;
    }

    return direct;
  }

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
