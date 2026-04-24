import type {
  BranchFamily,
  ContradictionClass,
  GovernanceSystem,
  RiskLevel
} from "@/lib/governance";
import { BRANCH_DEFINITIONS, OVERLAY_DEFINITIONS } from "@/lib/intelligence/branching";
import {
  EXTRACTION_FIELD_DEFINITIONS,
  type ExtractionCategoryKey,
  type ExtractionFieldKey
} from "@/lib/intelligence/extraction";
import { buildCategoryTargetId, buildFieldTargetId } from "@/lib/intelligence/questions";
import { isWeakPlanningInput } from "@/lib/start/planning-thread";
import { inferStrategyLaneRefinementField } from "@/lib/workspace/strategy-lane-inference";
import {
  buildSourceMapping,
  clampUnitInterval,
  cleanText,
  createAdapterRecordId,
  createListValue,
  createTextValue,
  dedupe,
  hasQuestionMark,
  mergeUnique,
  normalizeText,
  splitIntoSegments,
  splitListLikeText,
  summarizeText
} from "./helpers";
import type {
  ConversationArtifact,
  NormalizedAssumptionSignal,
  NormalizedBranchHint,
  NormalizedContradictionSignal,
  NormalizedConversationArtifact,
  NormalizedFieldSignal,
  NormalizedOverlayHint,
  NormalizedSignalKind,
  NormalizedUnknownSignal
} from "./types";

const DOES_NOT_KNOW_PATTERNS = [
  /\bi do(?:n't| not) know\b/i,
  /\bnot sure\b/i,
  /\bunsure\b/i,
  /\bno idea\b/i,
  /\bhaven'?t decided\b/i,
  /\bstill figuring (?:it )?out\b/i,
  /\btbd\b/i
] as const;

const UNCERTAIN_PATTERNS = [
  /\bmaybe\b/i,
  /\bprobably\b/i,
  /\blikely\b/i,
  /\bmight\b/i,
  /\bkind of\b/i,
  /\bsort of\b/i,
  /\bi think\b/i
] as const;

const AVOIDANCE_PATTERNS = [
  /\bwhat do you think\b/i,
  /\byou tell me\b/i,
  /\byou decide\b/i,
  /\bnot sure what to do\b/i,
  /\bcan you suggest\b/i,
  /\bhelp me decide\b/i
] as const;

const CONTRADICTION_PATTERNS = [
  /\bactually\b/i,
  /\binstead\b/i,
  /\brather than\b/i,
  /\bwe changed\b/i,
  /\bcorrection\b/i,
  /\bpivot(?:ed|ing)?\b/i,
  /\bnot anymore\b/i
] as const;

const PRODUCT_INTRO_PATTERNS = [
  /\b(?:build|launch|create|make|ship|design|develop|turn it into)\b/i,
  /\b(?:app|platform|marketplace|dashboard|portal|tool|site|website|store|membership|community|system)\b/i
] as const;

const ACTOR_KEYWORD_GROUPS = {
  primary_users: [
    "customers",
    "customer",
    "clients",
    "client",
    "users",
    "user",
    "buyers",
    "buyer",
    "members",
    "member",
    "students",
    "student",
    "patients",
    "patient",
    "creators",
    "creator",
    "sellers",
    "seller",
    "providers",
    "provider",
    "teams",
    "team",
    "agencies",
    "agency",
    "founders",
    "founder"
  ],
  primary_buyers: [
    "buyers",
    "buyer",
    "customers",
    "customer",
    "clients",
    "client",
    "companies",
    "company",
    "merchants",
    "merchant",
    "practices",
    "practice",
    "agencies",
    "agency"
  ],
  primary_admins: [
    "admins",
    "admin",
    "operators",
    "operator",
    "staff",
    "managers",
    "manager",
    "moderators",
    "moderator",
    "receptionists",
    "receptionist",
    "coordinators",
    "coordinator"
  ]
} as const;

const WORKFLOW_KEYWORDS = [
  "browse",
  "discover",
  "compare",
  "book",
  "schedule",
  "manage",
  "track",
  "review",
  "approve",
  "upload",
  "search",
  "checkout",
  "pay",
  "order",
  "deliver",
  "message",
  "share",
  "report",
  "analyze",
  "monitor",
  "provision"
] as const;

const BUSINESS_MODEL_PATTERNS: Array<{
  summary: string;
  keywords: readonly string[];
}> = [
  {
    summary: "Subscription / recurring software",
    keywords: ["subscription", "saas", "seat", "monthly", "annual", "recurring"]
  },
  {
    summary: "Marketplace commissions / take rate",
    keywords: ["commission", "take rate", "marketplace fee", "transaction fee"]
  },
  {
    summary: "Direct product sales",
    keywords: ["sell", "store", "checkout", "order", "cart", "retail"]
  },
  {
    summary: "Paid membership / content access",
    keywords: ["membership", "paid content", "member access", "subscriber"]
  },
  {
    summary: "Service / booking fees",
    keywords: ["booking fee", "service fee", "session fee", "appointment fee"]
  }
] as const;

const MVP_IN_SCOPE_PATTERNS = [
  /\b(?:for v1|for the first version|first release|mvp|must have|need first|start with)\b/i,
  /\b(?:initially|to start|phase one|phase 1)\b/i
] as const;

const MVP_OUT_OF_SCOPE_PATTERNS = [
  /\b(?:not for v1|not in v1|not now|later phase|phase two|phase 2|after launch)\b/i,
  /\b(?:out of scope|defer(?:red)?|eventually|later on)\b/i
] as const;

const BRAND_KEYWORDS = [
  "premium",
  "luxury",
  "playful",
  "clean",
  "minimal",
  "modern",
  "editorial",
  "bold",
  "trustworthy",
  "warm",
  "friendly",
  "enterprise",
  "high-end"
] as const;

const NAMING_HELP_PATTERNS = [
  /\bneed help naming\b/i,
  /\bhelp me name\b/i,
  /\bnot sure what to call it\b/i,
  /\bneed a name\b/i
] as const;

const PROJECT_NAME_PATTERNS = [
  /\bcalled\s+["']?[a-z0-9][^.,\n]+/i,
  /\bnamed\s+["']?[a-z0-9][^.,\n]+/i,
  /\bproject name\b/i,
  /\bbrand name\b/i
] as const;

const DOMAIN_NOW_PATTERNS = [
  /\bdomain\b/i,
  /\b\.com\b/i,
  /\burl\b/i,
  /\blaunch[- ]critical\b/i
] as const;

const DOMAIN_LATER_PATTERNS = [
  /\bdomain later\b/i,
  /\bnot now\b/i,
  /\bwe can do the domain later\b/i
] as const;

const SURFACE_PATTERNS: Array<{ label: string; keywords: readonly string[] }> = [
  {
    label: "Web app",
    keywords: ["web app", "website", "site", "landing page", "portal"]
  },
  {
    label: "Dashboard",
    keywords: ["dashboard", "workspace", "member area"]
  },
  {
    label: "Admin console",
    keywords: ["admin", "console", "backoffice", "ops dashboard", "moderation"]
  },
  {
    label: "Mobile app",
    keywords: ["mobile", "ios", "android", "native app", "app store"]
  },
  {
    label: "Internal tool",
    keywords: ["internal tool", "staff tool", "operator tool", "employee portal"]
  }
] as const;

const AI_USAGE_KEYWORDS = [
  "ai",
  "copilot",
  "assistant",
  "agent",
  "llm",
  "model"
] as const;

const MOBILE_EXPECTATION_KEYWORDS = [
  "mobile",
  "ios",
  "android",
  "native app",
  "tablet",
  "device"
] as const;

const ADMIN_OPS_KEYWORDS = [
  "admin",
  "operator",
  "moderation",
  "review queue",
  "approval",
  "reporting",
  "backoffice",
  "staff"
] as const;

const COMPLIANCE_KEYWORDS = [
  "security",
  "compliance",
  "sensitive data",
  "pii",
  "phi",
  "hipaa",
  "gdpr",
  "soc 2",
  "audit",
  "regulated",
  "privacy"
] as const;

const INTEGRATION_KEYWORDS = [
  "stripe",
  "shopify",
  "slack",
  "hubspot",
  "salesforce",
  "quickbooks",
  "google calendar",
  "calendar",
  "zapier",
  "openai",
  "twilio",
  "supabase",
  "webhook",
  "api"
] as const;

const DATA_DEPENDENCY_KEYWORDS = [
  "analytics data",
  "event stream",
  "inventory data",
  "crm data",
  "booking availability",
  "wallet data",
  "transaction data",
  "usage data",
  "metrics",
  "reporting data"
] as const;

const SYSTEM_ALIASES: Array<{
  system: GovernanceSystem;
  keywords: readonly string[];
}> = [
  {
    system: "Auth",
    keywords: ["auth", "authentication", "login", "sign in", "sso", "permissions"]
  },
  {
    system: "Billing / account",
    keywords: ["billing", "payment", "payments", "checkout", "invoice", "subscription"]
  },
  {
    system: "Routing",
    keywords: ["routing", "public pages", "site nav", "landing page", "website"]
  },
  {
    system: "Protected routing",
    keywords: ["protected area", "member area", "private dashboard", "permissions", "portal"]
  },
  {
    system: "Workspace / project surfaces",
    keywords: ["workspace", "project", "team space", "shared dashboard"]
  },
  {
    system: "Backend governance",
    keywords: ["approval", "audit", "review queue", "governance", "escalation"]
  },
  {
    system: "Browser / live-view",
    keywords: ["browser preview", "live view", "visual editor", "browser editor"]
  },
  {
    system: "Backend",
    keywords: ["backend", "api", "database", "sync", "webhook", "queue"]
  },
  {
    system: "Product",
    keywords: ["dashboard", "portal", "storefront", "community", "app", "platform"]
  }
] as const;

const STRATEGY_FIELD_HINT_MAP = {
  concept: "core_concept",
  target: "primary_users",
  offer: "mvp_in_scope",
  launch: "desired_outcome",
  budget: "budget_constraints",
  needs: "systems_touched"
} as const satisfies Record<string, ExtractionFieldKey>;

const HIGH_IMPACT_FIELDS = new Set<ExtractionFieldKey>([
  "primary_branch",
  "product_type",
  "core_workflow",
  "mvp_in_scope",
  "mvp_out_of_scope",
  "systems_touched",
  "constraints"
]);

const HIGH_IMPACT_CATEGORIES = new Set<ExtractionCategoryKey>([
  "branch_product_type",
  "workflow",
  "mvp_boundary",
  "systems_integrations",
  "constraints"
]);

function matchesAny(value: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function includesKeyword(text: string, keyword: string) {
  return text.includes(normalizeText(keyword));
}

function firstSegmentMatching(
  segments: readonly string[],
  keywords: readonly string[]
) {
  return (
    segments.find((segment) =>
      keywords.some((keyword) => includesKeyword(normalizeText(segment), keyword))
    ) ?? null
  );
}

function firstSegmentMatchingPatterns(
  segments: readonly string[],
  patterns: readonly RegExp[]
) {
  return segments.find((segment) => patterns.some((pattern) => pattern.test(segment))) ?? null;
}

function deriveStrategyPromptField(artifact: ConversationArtifact) {
  const inferred = inferStrategyLaneRefinementField(artifact.rawContent);
  return inferred ? STRATEGY_FIELD_HINT_MAP[inferred] : null;
}

function resolvePromptFieldHint(artifact: ConversationArtifact) {
  return (
    artifact.metadata?.promptFieldHint ??
    artifact.metadata?.explicitFieldHints?.[0] ??
    deriveStrategyPromptField(artifact)
  );
}

function resolvePromptCategoryHint(
  artifact: ConversationArtifact,
  promptFieldHint: ExtractionFieldKey | null
) {
  return (
    artifact.metadata?.promptCategoryHint ??
    (promptFieldHint
      ? EXTRACTION_FIELD_DEFINITIONS[promptFieldHint].categoryKey
      : artifact.metadata?.explicitCategoryHints?.[0] ?? null)
  );
}

function resolvePromptTargetId(
  artifact: ConversationArtifact,
  promptFieldHint: ExtractionFieldKey | null,
  promptCategoryHint: ExtractionCategoryKey | null
) {
  if (artifact.metadata?.questionTargetIdHint) {
    return artifact.metadata.questionTargetIdHint;
  }

  if (promptFieldHint) {
    return buildFieldTargetId(promptFieldHint);
  }

  if (promptCategoryHint) {
    return buildCategoryTargetId(promptCategoryHint);
  }

  return null;
}

function buildFieldSignal(args: {
  artifact: ConversationArtifact;
  fieldKey: ExtractionFieldKey;
  kind: Extract<
    NormalizedSignalKind,
    "direct_answer" | "partial_answer" | "inferred_answer" | "contradiction_signal"
  >;
  confidenceScore: number;
  reason: string;
  valueText?: string | null;
  valueItems?: string[];
  explicit: boolean;
  followUpReason?: string;
  dependencyBlockers?: string[];
}) {
  const definition = EXTRACTION_FIELD_DEFINITIONS[args.fieldKey];
  const rawText = cleanText(args.valueText ?? args.artifact.rawContent);
  const listItems =
    args.valueItems ??
    (definition.valueKind === "list" ? splitListLikeText(rawText) : undefined);
  const value =
    definition.valueKind === "list"
      ? createListValue(listItems ?? [], rawText)
      : createTextValue(rawText, rawText, rawText);

  return {
    signalId: createAdapterRecordId(
      "field-signal",
      `${args.artifact.artifactId}-${args.fieldKey}-${args.kind}-${rawText}`
    ),
    kind: args.kind,
    fieldKey: args.fieldKey,
    categoryKey: definition.categoryKey,
    value,
    confidenceScore: clampUnitInterval(args.confidenceScore),
    reason: args.reason,
    explicit: args.explicit,
    followUpReason: args.followUpReason,
    dependencyBlockers: args.dependencyBlockers ?? []
  } satisfies NormalizedFieldSignal;
}

function buildUnknownSignal(args: {
  artifact: ConversationArtifact;
  kind: Extract<NormalizedSignalKind, "unknown_signal" | "weak_signal">;
  categoryKey: ExtractionCategoryKey;
  linkedFieldKeys: ExtractionFieldKey[];
  question: string;
  whyItMatters: string;
  whatItBlocks?: string;
  blockingStage: "none" | "roadmap" | "execution" | "both";
  urgency: RiskLevel;
  recommendedNextQuestionTarget: string;
}) {
  return {
    signalId: createAdapterRecordId(
      "unknown-signal",
      `${args.artifact.artifactId}-${args.categoryKey}-${args.question}`
    ),
    kind: args.kind,
    question: args.question,
    categoryKey: args.categoryKey,
    linkedFieldKeys: args.linkedFieldKeys,
    whyItMatters: args.whyItMatters,
    whatItBlocks: args.whatItBlocks,
    blockingStage: args.blockingStage,
    urgency: args.urgency,
    recommendedNextQuestionTarget: args.recommendedNextQuestionTarget
  } satisfies NormalizedUnknownSignal;
}

function buildAssumptionSignal(args: {
  artifact: ConversationArtifact;
  statement: string;
  whyInferred: string;
  confidenceScore: number;
  linkedFieldKeys: ExtractionFieldKey[];
  linkedCategoryKeys: ExtractionCategoryKey[];
  invalidationTriggers: string[];
  confirmationRequired: boolean;
}) {
  return {
    signalId: createAdapterRecordId(
      "assumption-signal",
      `${args.artifact.artifactId}-${args.statement}`
    ),
    kind: "assumption_signal",
    statement: summarizeText(args.statement, 220),
    whyInferred: args.whyInferred,
    confidenceScore: clampUnitInterval(args.confidenceScore),
    linkedFieldKeys: args.linkedFieldKeys,
    linkedCategoryKeys: args.linkedCategoryKeys,
    invalidationTriggers: args.invalidationTriggers,
    confirmationRequired: args.confirmationRequired
  } satisfies NormalizedAssumptionSignal;
}

function buildContradictionSignal(args: {
  artifact: ConversationArtifact;
  title: string;
  linkedFieldKeys: ExtractionFieldKey[];
  linkedCategoryKeys: ExtractionCategoryKey[];
  conflictingStatements: string[];
  severity: RiskLevel;
  blocked: boolean;
  recommendedResolutionPath: string;
}) {
  return {
    signalId: createAdapterRecordId(
      "contradiction-signal",
      `${args.artifact.artifactId}-${args.title}`
    ),
    kind: "contradiction_signal",
    title: summarizeText(args.title, 160),
    linkedFieldKeys: args.linkedFieldKeys,
    linkedCategoryKeys: args.linkedCategoryKeys,
    conflictingStatements: args.conflictingStatements.map((statement) =>
      summarizeText(statement, 220)
    ),
    severity: args.severity,
    blocked: args.blocked,
    recommendedResolutionPath: args.recommendedResolutionPath
  } satisfies NormalizedContradictionSignal;
}

function responseSignalForArtifact(args: {
  artifact: ConversationArtifact;
  weakInput: boolean;
  fieldSignals: NormalizedFieldSignal[];
}) {
  if (args.artifact.role !== "user") {
    return null;
  }

  if (matchesAny(args.artifact.rawContent, CONTRADICTION_PATTERNS)) {
    return "contradictory" as const;
  }

  if (matchesAny(args.artifact.rawContent, DOES_NOT_KNOW_PATTERNS)) {
    return "does_not_know" as const;
  }

  if (matchesAny(args.artifact.rawContent, AVOIDANCE_PATTERNS)) {
    return "avoided" as const;
  }

  if (matchesAny(args.artifact.rawContent, UNCERTAIN_PATTERNS)) {
    return "uncertain" as const;
  }

  if (args.weakInput && !args.fieldSignals.length) {
    return null;
  }

  if (args.fieldSignals.some((signal) => signal.kind === "partial_answer")) {
    return "partial" as const;
  }

  if (args.fieldSignals.some((signal) => signal.kind === "inferred_answer")) {
    return "indirect" as const;
  }

  if (args.fieldSignals.length > 0) {
    return "answered" as const;
  }

  return hasQuestionMark(args.artifact.rawContent) ? ("indirect" as const) : null;
}

function collectBranchHints(
  normalizedText: string
): NormalizedBranchHint[] {
  const branchHints = Object.values(BRANCH_DEFINITIONS)
    .map((definition) => {
      const matchedKeywords = definition.generalKeywords.filter((keyword) =>
        includesKeyword(normalizedText, keyword)
      );
      const directLabelMatch = includesKeyword(
        normalizedText,
        normalizeText(definition.branch)
      );

      if (!directLabelMatch && matchedKeywords.length === 0) {
        return null;
      }

      return {
        branch: definition.branch,
        confidenceScore: clampUnitInterval(
          directLabelMatch ? 0.94 : 0.44 + matchedKeywords.length * 0.12
        ),
        matchedText: directLabelMatch
          ? definition.branch
          : matchedKeywords.join(", "),
        reason: directLabelMatch
          ? "The artifact names the branch explicitly."
          : `${matchedKeywords.length} branch keywords matched deterministically.`
      } satisfies NormalizedBranchHint;
    })
    .filter((hint): hint is Exclude<typeof hint, null> => hint !== null)
    .sort((left, right) => right.confidenceScore - left.confidenceScore) as NormalizedBranchHint[];

  if (
    branchHints.length >= 2 &&
    Math.abs(branchHints[0].confidenceScore - branchHints[1].confidenceScore) <= 0.08
  ) {
    return branchHints;
  }

  return branchHints.slice(0, 3);
}

function collectOverlayHints(normalizedText: string): NormalizedOverlayHint[] {
  return Object.values(OVERLAY_DEFINITIONS)
    .map((definition) => {
      const matchedKeywords = definition.keywords.filter((keyword) =>
        includesKeyword(normalizedText, keyword)
      );

      if (matchedKeywords.length === 0) {
        return null;
      }

      return {
        overlayKey: definition.key,
        confidenceScore: clampUnitInterval(0.36 + matchedKeywords.length * 0.1),
        matchedText: matchedKeywords.join(", "),
        reason: `${matchedKeywords.length} overlay keywords matched deterministically.`
      } satisfies NormalizedOverlayHint;
    })
    .filter((hint): hint is Exclude<typeof hint, null> => hint !== null)
    .sort((left, right) => right.confidenceScore - left.confidenceScore) as NormalizedOverlayHint[];
}

function deriveProductTypeFromBranch(branch: BranchFamily, normalizedText: string) {
  if (
    branch === "Commerce / Ecommerce" &&
    ["apparel", "fashion", "clothing", "merch"].some((keyword) =>
      normalizedText.includes(keyword)
    )
  ) {
    return "apparel ecommerce";
  }

  if (branch === "Marketplace / Multi-Sided Platform") {
    return normalizedText.includes("booking") || normalizedText.includes("appointment")
      ? "marketplace with booking behavior"
      : "marketplace platform";
  }

  if (branch === "SaaS / Workflow Platform") {
    return normalizedText.includes("analytics")
      ? "analytics saas platform"
      : "saas workflow platform";
  }

  if (branch === "Internal Operations / Backoffice Tool") {
    return normalizedText.includes("portal")
      ? "internal ops with client portal"
      : "internal ops tool";
  }

  if (branch === "Content / Community / Membership") {
    return normalizedText.includes("membership")
      ? "membership content platform"
      : "community content platform";
  }

  if (branch === "Booking / Scheduling / Service Delivery") {
    return "booking and scheduling platform";
  }

  if (branch === "Developer Platform / API / Infrastructure") {
    return "developer platform";
  }

  if (branch === "Data / Analytics / Intelligence Platform") {
    return normalizedText.includes("crypto")
      ? "crypto analytics platform"
      : "analytics intelligence platform";
  }

  return "hybrid product system";
}

function detectActorValues(
  normalizedText: string,
  fieldKey: keyof typeof ACTOR_KEYWORD_GROUPS
) {
  return dedupe(
    ACTOR_KEYWORD_GROUPS[fieldKey].filter((keyword) => includesKeyword(normalizedText, keyword))
  );
}

function detectSystemValues(normalizedText: string) {
  return dedupe(
    SYSTEM_ALIASES.filter((entry) =>
      entry.keywords.some((keyword) => includesKeyword(normalizedText, keyword))
    ).map((entry) => entry.system)
  );
}

function detectIntegrations(normalizedText: string) {
  return dedupe(INTEGRATION_KEYWORDS.filter((keyword) => includesKeyword(normalizedText, keyword)));
}

function detectDataDependencies(normalizedText: string) {
  return dedupe(
    DATA_DEPENDENCY_KEYWORDS.filter((keyword) => includesKeyword(normalizedText, keyword))
  );
}

function detectPrimarySurfaces(normalizedText: string) {
  return dedupe(
    SURFACE_PATTERNS.filter(({ keywords }) =>
      keywords.some((keyword) => includesKeyword(normalizedText, keyword))
    ).map(({ label }) => label)
  );
}

function contradictionClassForField(fieldKey: ExtractionFieldKey): ContradictionClass {
  switch (EXTRACTION_FIELD_DEFINITIONS[fieldKey].categoryKey) {
    case "mvp_boundary":
      return "MVP contradiction";
    case "constraints":
      return "Budget / timeline contradiction";
    case "systems_integrations":
    case "branch_product_type":
      return "Architecture contradiction";
    default:
      return "Scope contradiction";
  }
}

function contradictionSeverityForTarget(
  fieldKey: ExtractionFieldKey | null,
  categoryKey: ExtractionCategoryKey | null
) {
  if (fieldKey && HIGH_IMPACT_FIELDS.has(fieldKey)) {
    return "high" as const;
  }

  if (categoryKey && HIGH_IMPACT_CATEGORIES.has(categoryKey)) {
    return "high" as const;
  }

  return "moderate" as const;
}

function fieldSignalPriority(signal: NormalizedFieldSignal) {
  const kindRank =
    signal.kind === "direct_answer"
      ? 4
      : signal.kind === "partial_answer"
      ? 3
      : signal.kind === "inferred_answer"
      ? 2
      : 1;

  return signal.confidenceScore * 10 + kindRank + (signal.explicit ? 1 : 0);
}

function upsertFieldSignal(
  map: Map<ExtractionFieldKey, NormalizedFieldSignal>,
  signal: NormalizedFieldSignal
) {
  const existing = map.get(signal.fieldKey);

  if (!existing || fieldSignalPriority(signal) >= fieldSignalPriority(existing)) {
    map.set(signal.fieldKey, signal);
  }
}

function buildHintFieldSignals(args: {
  artifact: ConversationArtifact;
  normalizedText: string;
  promptFieldHint: ExtractionFieldKey | null;
  explicitFieldHints: ExtractionFieldKey[];
  branchHints: NormalizedBranchHint[];
  responseSignal: ReturnType<typeof responseSignalForArtifact>;
}) {
  const fieldSignals = new Map<ExtractionFieldKey, NormalizedFieldSignal>();
  const hintedFields = dedupe(
    [args.promptFieldHint, ...args.explicitFieldHints].filter(
      (fieldKey): fieldKey is ExtractionFieldKey => !!fieldKey
    )
  );

  for (const fieldKey of hintedFields) {
    if (args.responseSignal === "does_not_know" || args.responseSignal === "avoided") {
      continue;
    }

    const definition = EXTRACTION_FIELD_DEFINITIONS[fieldKey];
    const kind =
      args.responseSignal === "contradictory"
        ? "contradiction_signal"
        : args.responseSignal === "uncertain" || args.responseSignal === "partial"
        ? "partial_answer"
        : args.artifact.role === "planner_note" || args.artifact.role === "system"
        ? "inferred_answer"
        : "direct_answer";
    const items =
      definition.valueKind === "list"
        ? splitListLikeText(args.artifact.rawContent)
        : undefined;
    const lowCoverageList = definition.valueKind === "list" && (items?.length ?? 0) <= 1;

    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey,
        kind: lowCoverageList && kind === "direct_answer" ? "partial_answer" : kind,
        confidenceScore:
          kind === "contradiction_signal"
            ? 0.42
            : kind === "partial_answer" || lowCoverageList
            ? 0.62
            : kind === "inferred_answer"
            ? 0.58
            : 0.78,
        reason: `The artifact appears to answer the prompted ${definition.label.toLowerCase()} field.`,
        valueText: args.artifact.rawContent,
        valueItems: items,
        explicit: true,
        followUpReason:
          lowCoverageList || kind === "partial_answer"
            ? `${definition.label} still needs narrowing.`
            : undefined
      })
    );
  }

  const topBranch = args.branchHints[0];

  if (topBranch && topBranch.confidenceScore >= 0.78) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "primary_branch",
        kind:
          topBranch.confidenceScore >= 0.9 ? "direct_answer" : "inferred_answer",
        confidenceScore: topBranch.confidenceScore,
        reason: topBranch.reason,
        valueText: topBranch.branch,
        explicit: topBranch.confidenceScore >= 0.9
      })
    );
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "product_type",
        kind: topBranch.confidenceScore >= 0.9 ? "direct_answer" : "inferred_answer",
        confidenceScore: clampUnitInterval(topBranch.confidenceScore - 0.08),
        reason:
          "Product type can be derived deterministically from the branch signals in this artifact.",
        valueText: deriveProductTypeFromBranch(topBranch.branch, args.normalizedText),
        explicit: false,
        followUpReason: "Product type may still need a more concrete user-provided label."
      })
    );
  }

  return [...fieldSignals.values()];
}

function buildContentFieldSignals(args: {
  artifact: ConversationArtifact;
  normalizedText: string;
  contentSegments: string[];
  weakInput: boolean;
}) {
  if (args.weakInput && args.artifact.role === "user") {
    return [] as NormalizedFieldSignal[];
  }

  const fieldSignals = new Map<ExtractionFieldKey, NormalizedFieldSignal>();

  if (args.artifact.role === "user") {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "founder_operator_context",
        kind: "inferred_answer",
        confidenceScore: 0.54,
        reason:
          "A direct user planning artifact implies a live founder/operator context behind the request.",
        valueText: "Direct founder/operator planning context is present in the conversation.",
        explicit: false,
        followUpReason:
          "The business or operator context may still need a clearer explicit statement."
      })
    );
  }

  if (
    args.artifact.role !== "assistant" &&
    PRODUCT_INTRO_PATTERNS.every((pattern) => pattern.test(args.artifact.rawContent))
  ) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "request_summary",
        kind: "direct_answer",
        confidenceScore: 0.82,
        reason: "The artifact contains a meaningful product-introduction summary.",
        valueText: args.artifact.rawContent,
        explicit: true
      })
    );
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "core_concept",
        kind: "partial_answer",
        confidenceScore: 0.72,
        reason: "The artifact describes the core concept, but it may still need narrowing.",
        valueText:
          firstSegmentMatchingPatterns(args.contentSegments, PRODUCT_INTRO_PATTERNS) ??
          args.artifact.rawContent,
        explicit: true,
        followUpReason: "The core concept may still need a tighter product-shape label."
      })
    );
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "product_function",
        kind: "partial_answer",
        confidenceScore: 0.68,
        reason:
          "The artifact explains what the product should do, even if the function still needs narrowing.",
        valueText:
          firstSegmentMatchingPatterns(args.contentSegments, PRODUCT_INTRO_PATTERNS) ??
          args.artifact.rawContent,
        explicit: true,
        followUpReason:
          "The product function may still need a cleaner plain-language statement."
      })
    );
  }

  if (matchesAny(args.artifact.rawContent, NAMING_HELP_PATTERNS)) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "project_name_state",
        kind: "direct_answer",
        confidenceScore: 0.84,
        reason: "The artifact explicitly asks for naming help.",
        valueText: "Needs naming help.",
        explicit: true
      })
    );
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "naming_help_state",
        kind: "direct_answer",
        confidenceScore: 0.84,
        reason: "The artifact explicitly requests naming support.",
        valueText: "Naming help requested and may be blocking identity clarity.",
        explicit: true
      })
    );
  } else if (matchesAny(args.artifact.rawContent, PROJECT_NAME_PATTERNS)) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "project_name_state",
        kind: "partial_answer",
        confidenceScore: 0.7,
        reason: "The artifact suggests a current or provisional project name exists.",
        valueText: "Named or provisional project identity exists.",
        explicit: true,
        followUpReason:
          "The project name may still need confirmation as stable or provisional."
      })
    );
  }

  if (matchesAny(args.artifact.rawContent, DOMAIN_NOW_PATTERNS)) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "domain_intent",
        kind: "partial_answer",
        confidenceScore: 0.72,
        reason: "The artifact indicates domain work matters to the current planning path.",
        valueText: "Domain work matters now or during launch preparation.",
        explicit: true
      })
    );
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "domain_validation_path",
        kind: "partial_answer",
        confidenceScore: 0.66,
        reason: "The artifact implies a domain validation path may be needed.",
        valueText: "Validate domain viability or naming fit before launch decisions harden.",
        explicit: false,
        followUpReason:
          "Domain validation may still need a clearer now vs later decision."
      })
    );
  } else if (matchesAny(args.artifact.rawContent, DOMAIN_LATER_PATTERNS)) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "domain_intent",
        kind: "partial_answer",
        confidenceScore: 0.68,
        reason: "The artifact indicates domain work is intentionally deferred.",
        valueText: "Domain work matters later, not in the current planning step.",
        explicit: true
      })
    );
  }

  for (const fieldKey of ["primary_users", "primary_buyers", "primary_admins"] as const) {
    const matches = detectActorValues(args.normalizedText, fieldKey);

    if (matches.length === 0) {
      continue;
    }

    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey,
        kind: matches.length === 1 ? "partial_answer" : "direct_answer",
        confidenceScore: matches.length === 1 ? 0.6 : 0.8,
        reason: `The artifact names likely ${EXTRACTION_FIELD_DEFINITIONS[fieldKey].label.toLowerCase()}.`,
        valueItems: matches,
        valueText: matches.join(", "),
        explicit: true,
        followUpReason:
          matches.length === 1
            ? `${EXTRACTION_FIELD_DEFINITIONS[fieldKey].label} likely need broader role coverage.`
            : undefined
      })
    );
  }

  const firstUserMatches = detectActorValues(args.normalizedText, "primary_users").slice(0, 1);
  if (firstUserMatches.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "first_user",
        kind: "partial_answer",
        confidenceScore: 0.58,
        reason:
          "The artifact hints at a first user even if the broader target user may still need refinement.",
        valueItems: firstUserMatches,
        valueText: firstUserMatches.join(", "),
        explicit: false,
        followUpReason:
          "The first real user may still need to be distinguished from the broader target user."
      })
    );
  }

  const problemSegment = firstSegmentMatching(args.contentSegments, [
    "problem",
    "pain",
    "manual",
    "currently",
    "today",
    "struggle",
    "friction"
  ]);

  if (problemSegment) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "problem_statement",
        kind: "partial_answer",
        confidenceScore: 0.68,
        reason: "The artifact contains a problem-oriented statement.",
        valueText: problemSegment,
        explicit: true,
        followUpReason: "The core problem may still need a more exact first-priority framing."
      })
    );
  }

  const desiredOutcomeSegment = firstSegmentMatching(args.contentSegments, [
    "want",
    "need",
    "goal",
    "so that",
    "outcome",
    "improve",
    "replace",
    "reduce",
    "increase"
  ]);

  if (desiredOutcomeSegment) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "desired_outcome",
        kind: "partial_answer",
        confidenceScore: 0.7,
        reason: "The artifact describes a desired outcome or intended change.",
        valueText: desiredOutcomeSegment,
        explicit: true,
        followUpReason: "The first successful outcome may still need a tighter success definition."
      })
    );
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "business_goal",
        kind: "partial_answer",
        confidenceScore: 0.64,
        reason:
          "The artifact describes the business result the user wants first, even if it still needs sharpening.",
        valueText: desiredOutcomeSegment,
        explicit: true,
        followUpReason:
          "The business goal may still need a firmer commercial or operational success definition."
      })
    );
  }

  const workflowSegment =
    firstSegmentMatching(args.contentSegments, WORKFLOW_KEYWORDS) ??
    firstSegmentMatching(args.contentSegments, ["users can", "customers can", "admins can"]);

  if (workflowSegment) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "core_workflow",
        kind: workflowSegment.split(/\s+/).length >= 8 ? "direct_answer" : "partial_answer",
        confidenceScore: workflowSegment.split(/\s+/).length >= 8 ? 0.78 : 0.64,
        reason: "The artifact contains a deterministic workflow signal.",
        valueText: workflowSegment,
        explicit: true,
        followUpReason:
          workflowSegment.split(/\s+/).length >= 8
            ? undefined
            : "The workflow still needs one or two more decisive steps."
      })
    );
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "first_use_case",
        kind: workflowSegment.split(/\s+/).length >= 8 ? "direct_answer" : "partial_answer",
        confidenceScore: workflowSegment.split(/\s+/).length >= 8 ? 0.76 : 0.62,
        reason: "The artifact names a likely first use case for the product.",
        valueText: workflowSegment,
        explicit: true,
        followUpReason:
          workflowSegment.split(/\s+/).length >= 8
            ? undefined
            : "The first use case may still need a tighter day-one framing."
      })
    );
  }

  const businessModelMatch = BUSINESS_MODEL_PATTERNS.find(({ keywords }) =>
    keywords.some((keyword) => includesKeyword(args.normalizedText, keyword))
  );

  if (businessModelMatch) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "business_model",
        kind: "partial_answer",
        confidenceScore: 0.68,
        reason: "The artifact contains deterministic business-model language.",
        valueText: businessModelMatch.summary,
        explicit: true,
        followUpReason: "The exact packaging or economic model may still need confirmation."
      })
    );
  }

  const mvpInScopeSegment = firstSegmentMatchingPatterns(
    args.contentSegments,
    MVP_IN_SCOPE_PATTERNS
  );

  if (mvpInScopeSegment) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "mvp_in_scope",
        kind: "partial_answer",
        confidenceScore: 0.7,
        reason: "The artifact lists likely in-scope MVP work.",
        valueItems: splitListLikeText(mvpInScopeSegment),
        valueText: mvpInScopeSegment,
        explicit: true,
        followUpReason: "The MVP boundary still needs sharper scope edges."
      })
    );
  }

  const mvpOutOfScopeSegment = firstSegmentMatchingPatterns(
    args.contentSegments,
    MVP_OUT_OF_SCOPE_PATTERNS
  );

  if (mvpOutOfScopeSegment) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "mvp_out_of_scope",
        kind: "partial_answer",
        confidenceScore: 0.7,
        reason: "The artifact lists likely deferred or out-of-scope work.",
        valueItems: splitListLikeText(mvpOutOfScopeSegment),
        valueText: mvpOutOfScopeSegment,
        explicit: true,
        followUpReason: "The deferred boundary may still need clearer exclusions."
      })
    );
  }

  const systemsTouched = detectSystemValues(args.normalizedText);
  const primarySurfaces = detectPrimarySurfaces(args.normalizedText);

  if (primarySurfaces.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "primary_surfaces",
        kind: primarySurfaces.length >= 2 ? "direct_answer" : "partial_answer",
        confidenceScore: primarySurfaces.length >= 2 ? 0.76 : 0.62,
        reason: "The artifact names likely primary product surfaces explicitly.",
        valueItems: primarySurfaces,
        valueText: primarySurfaces.join(", "),
        explicit: true,
        followUpReason:
          primarySurfaces.length >= 2
            ? undefined
            : "The first surface mix may still need confirmation."
      })
    );
  }

  if (systemsTouched.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "systems_touched",
        kind: systemsTouched.length >= 2 ? "direct_answer" : "partial_answer",
        confidenceScore: systemsTouched.length >= 2 ? 0.76 : 0.62,
        reason: "The artifact names system surfaces or trust layers explicitly.",
        valueItems: systemsTouched,
        valueText: systemsTouched.join(", "),
        explicit: true,
        followUpReason:
          systemsTouched.length >= 2
            ? undefined
            : "Additional systems may still need to be confirmed."
      })
    );
  }

  const integrations = detectIntegrations(args.normalizedText);
  if (integrations.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "integrations",
        kind: integrations.length >= 2 ? "direct_answer" : "partial_answer",
        confidenceScore: integrations.length >= 2 ? 0.74 : 0.6,
        reason: "The artifact names likely integrations explicitly.",
        valueItems: integrations,
        valueText: integrations.join(", "),
        explicit: true,
        followUpReason:
          integrations.length >= 2 ? undefined : "The integration surface may still be incomplete."
      })
    );
  }

  const dataDependencies = detectDataDependencies(args.normalizedText);
  if (dataDependencies.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "data_dependencies",
        kind: dataDependencies.length >= 2 ? "direct_answer" : "partial_answer",
        confidenceScore: dataDependencies.length >= 2 ? 0.72 : 0.58,
        reason: "The artifact names likely data dependencies explicitly.",
        valueItems: dataDependencies,
        valueText: dataDependencies.join(", "),
        explicit: false,
        followUpReason:
          dataDependencies.length >= 2 ? undefined : "The data surface may still need confirmation."
      })
    );
  }

  const constraintSegment = firstSegmentMatching(args.contentSegments, [
    "budget",
    "timeline",
    "deadline",
    "compliance",
    "constraint",
    "one developer",
    "small team",
    "limited"
  ]);

  if (constraintSegment) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "constraints",
        kind: "partial_answer",
        confidenceScore: 0.68,
        reason: "The artifact states one or more shaping constraints.",
        valueItems: splitListLikeText(constraintSegment),
        valueText: constraintSegment,
        explicit: true,
        followUpReason: "Constraints may still need clearer prioritization."
      })
    );
  }

  const budgetSegment = firstSegmentMatching(args.contentSegments, [
    "budget",
    "$",
    "cheap",
    "cost",
    "afford",
    "low budget",
    "spend"
  ]);

  if (budgetSegment) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "budget_constraints",
        kind: "partial_answer",
        confidenceScore: 0.72,
        reason: "The artifact includes explicit budget language.",
        valueItems: splitListLikeText(budgetSegment),
        valueText: budgetSegment,
        explicit: true,
        followUpReason: "Budget constraints may still need a firmer ceiling or tradeoff."
      })
    );
  }

  const timelineSegment = firstSegmentMatching(args.contentSegments, [
    "timeline",
    "deadline",
    "launch",
    "this month",
    "this quarter",
    "weeks",
    "months",
    "by "
  ]);

  if (timelineSegment) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "timeline_constraints",
        kind: "partial_answer",
        confidenceScore: 0.72,
        reason: "The artifact includes explicit timing language.",
        valueItems: splitListLikeText(timelineSegment),
        valueText: timelineSegment,
        explicit: true,
        followUpReason: "Timeline constraints may still need a firmer delivery boundary."
      })
    );
  }

  const complianceMatches = COMPLIANCE_KEYWORDS.filter((keyword) =>
    includesKeyword(args.normalizedText, keyword)
  );
  if (complianceMatches.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "compliance_security_sensitivity",
        kind: complianceMatches.length >= 2 ? "direct_answer" : "partial_answer",
        confidenceScore: complianceMatches.length >= 2 ? 0.78 : 0.62,
        reason:
          "The artifact contains explicit security, compliance, privacy, or sensitive-data language.",
        valueText: complianceMatches.join(", "),
        explicit: true,
        followUpReason:
          complianceMatches.length >= 2
            ? undefined
            : "Compliance or security sensitivity may still need a clearer screening outcome."
      })
    );
  }

  const aiUsageMatches = AI_USAGE_KEYWORDS.filter((keyword) =>
    includesKeyword(args.normalizedText, keyword)
  );
  if (aiUsageMatches.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "ai_usage",
        kind: "partial_answer",
        confidenceScore: 0.66,
        reason: "The artifact includes explicit AI or model-driven language.",
        valueText: aiUsageMatches.join(", "),
        explicit: true,
        followUpReason:
          "AI usage may still need clarification around whether it is core, internal, or optional."
      })
    );
  }

  const mobileMatches = MOBILE_EXPECTATION_KEYWORDS.filter((keyword) =>
    includesKeyword(args.normalizedText, keyword)
  );
  if (mobileMatches.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "mobile_expectations",
        kind: "partial_answer",
        confidenceScore: 0.66,
        reason: "The artifact includes explicit mobile or device-expectation language.",
        valueText: mobileMatches.join(", "),
        explicit: true,
        followUpReason:
          "Mobile expectations may still need a clearer now vs later commitment."
      })
    );
  }

  const adminOpsMatches = ADMIN_OPS_KEYWORDS.filter((keyword) =>
    includesKeyword(args.normalizedText, keyword)
  );
  if (adminOpsMatches.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "admin_ops_complexity",
        kind: adminOpsMatches.length >= 2 ? "partial_answer" : "inferred_answer",
        confidenceScore: adminOpsMatches.length >= 2 ? 0.7 : 0.56,
        reason:
          "The artifact suggests meaningful admin, moderation, reporting, or operator complexity.",
        valueText: adminOpsMatches.join(", "),
        explicit: adminOpsMatches.length >= 2,
        followUpReason:
          "The admin and operational surface may still need a clearer scope definition."
      })
    );
  }

  const brandKeywords = BRAND_KEYWORDS.filter((keyword) =>
    includesKeyword(args.normalizedText, keyword)
  );

  if (brandKeywords.length > 0) {
    upsertFieldSignal(
      fieldSignals,
      buildFieldSignal({
        artifact: args.artifact,
        fieldKey: "brand_direction",
        kind: brandKeywords.length >= 2 ? "direct_answer" : "partial_answer",
        confidenceScore: brandKeywords.length >= 2 ? 0.74 : 0.58,
        reason: "The artifact contains explicit brand or experience-direction language.",
        valueText: brandKeywords.join(", "),
        explicit: true,
        followUpReason:
          brandKeywords.length >= 2
            ? undefined
            : "Brand direction may still need richer style guidance."
      })
    );
  }

  return [...fieldSignals.values()];
}

function buildUnknownSignals(args: {
  artifact: ConversationArtifact;
  weakInput: boolean;
  responseSignal: ReturnType<typeof responseSignalForArtifact>;
  promptFieldHint: ExtractionFieldKey | null;
  promptCategoryHint: ExtractionCategoryKey | null;
  fieldSignals: NormalizedFieldSignal[];
}) {
  const unknowns: NormalizedUnknownSignal[] = [];
  const targetField =
    args.promptFieldHint ?? args.fieldSignals[0]?.fieldKey ?? "core_concept";
  const targetCategory =
    args.promptCategoryHint ??
    EXTRACTION_FIELD_DEFINITIONS[targetField].categoryKey ??
    "request_core_concept";
  const targetLabel = EXTRACTION_FIELD_DEFINITIONS[targetField].label;
  const blockingStage =
    EXTRACTION_FIELD_DEFINITIONS[targetField].criticalForRoadmap &&
    EXTRACTION_FIELD_DEFINITIONS[targetField].criticalForExecution
      ? "both"
      : EXTRACTION_FIELD_DEFINITIONS[targetField].criticalForRoadmap
      ? "roadmap"
      : EXTRACTION_FIELD_DEFINITIONS[targetField].criticalForExecution
      ? "execution"
      : "none";

  if (args.weakInput) {
    unknowns.push(
      buildUnknownSignal({
        artifact: args.artifact,
        kind: "weak_signal",
        categoryKey: targetCategory,
        linkedFieldKeys: [targetField],
        question: `No stable truth was captured for ${targetLabel.toLowerCase()} yet.`,
        whyItMatters: "The artifact did not add enough product truth to narrow the next decision safely.",
        whatItBlocks:
          blockingStage === "none"
            ? undefined
            : `${targetLabel} still blocks a later readiness transition.`,
        blockingStage,
        urgency: blockingStage === "both" ? "high" : "moderate",
        recommendedNextQuestionTarget: targetField
      })
    );
  }

  if (args.responseSignal === "does_not_know" || args.responseSignal === "uncertain") {
    unknowns.push(
      buildUnknownSignal({
        artifact: args.artifact,
        kind: "unknown_signal",
        categoryKey: targetCategory,
        linkedFieldKeys: [targetField],
        question: `${targetLabel} is still unresolved.`,
        whyItMatters: `Neroa still needs stable truth for ${targetLabel.toLowerCase()} before it can trust later planning moves.`,
        whatItBlocks:
          blockingStage === "none"
            ? undefined
            : `${targetLabel} still blocks later ${blockingStage === "both" ? "roadmap and execution" : blockingStage} movement.`,
        blockingStage,
        urgency: blockingStage === "both" ? "high" : "moderate",
        recommendedNextQuestionTarget: targetField
      })
    );
  }

  if (args.responseSignal === "avoided") {
    unknowns.push(
      buildUnknownSignal({
        artifact: args.artifact,
        kind: "unknown_signal",
        categoryKey: targetCategory,
        linkedFieldKeys: [targetField],
        question: `${targetLabel} may need a smaller recovery question.`,
        whyItMatters: "The artifact avoided the requested truth directly, so a smaller adjacent question may be safer next.",
        whatItBlocks: "The current target did not advance enough truth to improve readiness.",
        blockingStage,
        urgency: "moderate",
        recommendedNextQuestionTarget: targetField
      })
    );
  }

  return unknowns;
}

function buildAssumptionSignals(args: {
  artifact: ConversationArtifact;
  promptFieldHint: ExtractionFieldKey | null;
  promptCategoryHint: ExtractionCategoryKey | null;
  fieldSignals: NormalizedFieldSignal[];
  branchHints: NormalizedBranchHint[];
  overlayHints: NormalizedOverlayHint[];
}) {
  const shouldCaptureWholeArtifactAssumption =
    args.artifact.kind === "planning_note" ||
    args.artifact.kind === "thread_snapshot" ||
    matchesAny(args.artifact.rawContent, UNCERTAIN_PATTERNS);

  if (!shouldCaptureWholeArtifactAssumption) {
    return [] as NormalizedAssumptionSignal[];
  }

  const linkedFieldKeys = dedupe(
    [
      args.promptFieldHint,
      ...args.fieldSignals.map((signal) => signal.fieldKey),
      ...(args.branchHints[0] ? ["primary_branch" as const] : [])
    ].filter((fieldKey): fieldKey is ExtractionFieldKey => !!fieldKey)
  );
  const linkedCategoryKeys = dedupe(
    [
      args.promptCategoryHint,
      ...linkedFieldKeys.map((fieldKey) => EXTRACTION_FIELD_DEFINITIONS[fieldKey].categoryKey)
    ].filter((categoryKey): categoryKey is ExtractionCategoryKey => !!categoryKey)
  );

  return [
    buildAssumptionSignal({
      artifact: args.artifact,
      statement: args.artifact.rawContent,
      whyInferred:
        args.artifact.kind === "planning_note" || args.artifact.kind === "thread_snapshot"
          ? "The artifact is a hidden planning note or imported snapshot rather than a direct user answer."
          : "The artifact contains uncertainty markers, so the truth should stay inferred until confirmed.",
      confidenceScore:
        args.artifact.kind === "planning_note" || args.artifact.kind === "thread_snapshot"
          ? 0.54
          : 0.42,
      linkedFieldKeys,
      linkedCategoryKeys,
      invalidationTriggers: [
        "A later direct user answer conflicts with this inferred position.",
        "Branch classification changes materially after more extraction evidence."
      ],
      confirmationRequired:
        linkedFieldKeys.some((fieldKey) => HIGH_IMPACT_FIELDS.has(fieldKey)) ||
        args.overlayHints.some((hint) => hint.confidenceScore >= 0.62)
    })
  ];
}

function buildContradictionSignals(args: {
  artifact: ConversationArtifact;
  promptFieldHint: ExtractionFieldKey | null;
  promptCategoryHint: ExtractionCategoryKey | null;
  fieldSignals: NormalizedFieldSignal[];
  branchHints: NormalizedBranchHint[];
  responseSignal: ReturnType<typeof responseSignalForArtifact>;
}) {
  if (
    args.responseSignal !== "contradictory" &&
    !matchesAny(args.artifact.rawContent, CONTRADICTION_PATTERNS)
  ) {
    return [] as NormalizedContradictionSignal[];
  }

  const linkedFieldKeys = dedupe(
    [
      args.promptFieldHint,
      ...args.fieldSignals.map((signal) => signal.fieldKey),
      ...(args.branchHints.length >= 2 ? ["primary_branch" as const] : [])
    ].filter((fieldKey): fieldKey is ExtractionFieldKey => !!fieldKey)
  );
  const linkedCategoryKeys = dedupe(
    [
      args.promptCategoryHint,
      ...linkedFieldKeys.map((fieldKey) => EXTRACTION_FIELD_DEFINITIONS[fieldKey].categoryKey)
    ].filter((categoryKey): categoryKey is ExtractionCategoryKey => !!categoryKey)
  );
  const anchorField = linkedFieldKeys[0] ?? null;
  const anchorCategory = linkedCategoryKeys[0] ?? null;
  const severity = contradictionSeverityForTarget(anchorField, anchorCategory);
  const targetLabel = anchorField
    ? EXTRACTION_FIELD_DEFINITIONS[anchorField].label
    : anchorCategory ?? "current truth";

  return [
    buildContradictionSignal({
      artifact: args.artifact,
      title: `Potential contradiction for ${targetLabel}`,
      linkedFieldKeys,
      linkedCategoryKeys,
      conflictingStatements: [args.artifact.rawContent],
      severity,
      blocked: severity === "high",
      recommendedResolutionPath: anchorField
        ? `Ask a direct resolving question for ${targetLabel.toLowerCase()}.`
        : "Ask a direct resolving question for the conflicting category."
    })
  ];
}

function shouldAdvanceReadiness(args: {
  artifact: ConversationArtifact;
  weakInput: boolean;
  responseSignal: ReturnType<typeof responseSignalForArtifact>;
  fieldSignals: NormalizedFieldSignal[];
  contradictionSignals: NormalizedContradictionSignal[];
}) {
  if (args.artifact.role === "assistant") {
    return false;
  }

  if (args.weakInput) {
    return false;
  }

  if (args.responseSignal === "does_not_know" || args.responseSignal === "avoided") {
    return false;
  }

  return args.fieldSignals.length > 0 || args.contradictionSignals.length > 0;
}

export function normalizeConversationArtifact(
  artifact: ConversationArtifact,
  preparedBy?: string
) {
  const normalizedText = normalizeText(artifact.rawContent);
  const contentSegments = splitIntoSegments(artifact.rawContent);
  const promptFieldHint = resolvePromptFieldHint(artifact);
  const promptCategoryHint = resolvePromptCategoryHint(artifact, promptFieldHint);
  const promptTargetId = resolvePromptTargetId(
    artifact,
    promptFieldHint,
    promptCategoryHint
  );
  const branchHints = collectBranchHints(normalizedText);
  const overlayHints = collectOverlayHints(normalizedText);
  const weakInput =
    artifact.role === "user" ? isWeakPlanningInput(artifact.rawContent) : false;
  const initialResponseSignal = responseSignalForArtifact({
    artifact,
    weakInput,
    fieldSignals: []
  });
  const hintFieldSignals = buildHintFieldSignals({
    artifact,
    normalizedText,
    promptFieldHint,
    explicitFieldHints: artifact.metadata?.explicitFieldHints ?? [],
    branchHints,
    responseSignal: initialResponseSignal
  });
  const contentFieldSignals = buildContentFieldSignals({
    artifact,
    normalizedText,
    contentSegments,
    weakInput
  });
  const fieldSignals = new Map<ExtractionFieldKey, NormalizedFieldSignal>();

  for (const signal of [...hintFieldSignals, ...contentFieldSignals]) {
    upsertFieldSignal(fieldSignals, signal);
  }

  const fieldSignalsList = [...fieldSignals.values()];
  const responseSignal = responseSignalForArtifact({
    artifact,
    weakInput,
    fieldSignals: fieldSignalsList
  });
  const contradictionSignals = buildContradictionSignals({
    artifact,
    promptFieldHint,
    promptCategoryHint,
    fieldSignals: fieldSignalsList,
    branchHints,
    responseSignal
  });
  const assumptionSignals = buildAssumptionSignals({
    artifact,
    promptFieldHint,
    promptCategoryHint,
    fieldSignals: fieldSignalsList,
    branchHints,
    overlayHints
  });
  const unknownSignals = buildUnknownSignals({
    artifact,
    weakInput,
    responseSignal,
    promptFieldHint,
    promptCategoryHint,
    fieldSignals: fieldSignalsList
  });
  const warnings: string[] = [];

  if (weakInput && fieldSignalsList.length === 0) {
    warnings.push("Artifact carried weak or low-traction input and did not add stable field truth.");
  }

  return {
    artifact,
    sourceMapping: buildSourceMapping(artifact, preparedBy ?? artifact.preparedBy),
    normalizedText,
    contentSegments,
    promptTargetId,
    promptFieldHint,
    promptCategoryHint,
    responseSignal,
    weakInput,
    shouldAdvanceReadiness: shouldAdvanceReadiness({
      artifact,
      weakInput,
      responseSignal,
      fieldSignals: fieldSignalsList,
      contradictionSignals
    }),
    fieldSignals: fieldSignalsList.sort((left, right) =>
      left.fieldKey.localeCompare(right.fieldKey)
    ),
    assumptionSignals,
    contradictionSignals,
    unknownSignals,
    branchHints,
    overlayHints,
    warnings
  } satisfies NormalizedConversationArtifact;
}

export function normalizeConversationArtifacts(
  artifacts: readonly ConversationArtifact[],
  preparedBy?: string
) {
  return artifacts.map((artifact) => normalizeConversationArtifact(artifact, preparedBy));
}

export function buildNormalizedArtifactEvidenceNotes(
  artifact: NormalizedConversationArtifact
) {
  return dedupe([
    ...artifact.fieldSignals.map((signal) => signal.reason),
    ...artifact.assumptionSignals.map((signal) => signal.whyInferred),
    ...artifact.contradictionSignals.map((signal) => signal.recommendedResolutionPath),
    ...artifact.unknownSignals.map((signal) => signal.whyItMatters)
  ]);
}

export function deriveLikelyAffectedSystems(
  artifact: NormalizedConversationArtifact
) {
  return dedupe(
    mergeUnique(
      ...artifact.overlayHints.map((hint) =>
        OVERLAY_DEFINITIONS[hint.overlayKey].likelyAffectedSystems
      ),
      artifact.fieldSignals
        .filter((signal) => signal.fieldKey === "systems_touched")
        .flatMap((signal) =>
          signal.value.kind === "list"
            ? signal.value.items.filter((item): item is GovernanceSystem =>
                SYSTEM_ALIASES.some((entry) => entry.system === item)
              )
            : []
        )
    )
  );
}

export function buildPotentialContradictionClass(
  artifact: NormalizedConversationArtifact
) {
  const firstFieldKey = artifact.fieldSignals[0]?.fieldKey ?? null;
  const firstCategoryKey = artifact.fieldSignals[0]?.categoryKey ?? artifact.promptCategoryHint;

  if (firstFieldKey) {
    return contradictionClassForField(firstFieldKey);
  }

  if (firstCategoryKey === "constraints") {
    return "Budget / timeline contradiction" as const;
  }

  if (
    firstCategoryKey === "branch_product_type" ||
    firstCategoryKey === "systems_integrations"
  ) {
    return "Architecture contradiction" as const;
  }

  return "Scope contradiction" as const;
}
