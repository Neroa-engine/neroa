import {
  ARCHITECTURE_CONFIDENCE_THRESHOLDS,
  GOVERNANCE_SYSTEMS,
  type BranchFamily,
  type GovernanceSystem
} from "@/lib/governance";
import type { ExtractionFieldKey, ExtractionState } from "@/lib/intelligence/extraction";
import {
  BRANCH_DEFINITIONS,
  BRANCH_RESOLUTION_PLAYBOOK,
  NON_HYBRID_BRANCH_FAMILIES,
  type NonHybridBranchFamily
} from "./catalog";
import {
  average,
  clampUnitInterval,
  collectExtractionSignalEntries,
  createBranchRecordId,
  dedupe,
  mergeUnique,
  nowIso,
  normalizeText,
  riskLevelFromRank,
  riskLevelRank,
  titleCase,
  toUnitIntervalConfidence
} from "./helpers";
import type { BranchTextSignalEntry } from "./helpers";
import { evaluateOverlayActivations } from "./overlays";
import { detectBranchShift } from "./shifts";
import type {
  BranchCandidate,
  BranchClassificationOptions,
  BranchClassificationResult,
  BranchRoadmapReadiness,
  BranchSignal,
  BranchSpecialization
} from "./types";

const ACTOR_FIELD_KEYS: readonly ExtractionFieldKey[] = [
  "primary_users",
  "first_user",
  "primary_buyers",
  "primary_admins"
] as const;

const WORKFLOW_FIELD_KEYS: readonly ExtractionFieldKey[] = [
  "first_use_case",
  "core_workflow",
  "mvp_in_scope",
  "desired_outcome",
  "business_goal",
  "request_summary",
  "core_concept"
] as const;

const BUSINESS_MODEL_FIELD_KEYS: readonly ExtractionFieldKey[] = [
  "business_model",
  "request_summary",
  "core_concept",
  "desired_outcome"
] as const;

const BRANCH_CATEGORY_FIELD_KEYS: readonly ExtractionFieldKey[] = [
  "primary_branch",
  "product_type",
  "product_function"
] as const;

const SUPPLY_SIDE_KEYWORDS = [
  "vendor",
  "seller",
  "provider",
  "host",
  "merchant",
  "creator"
] as const;

const DEMAND_SIDE_KEYWORDS = [
  "buyer",
  "customer",
  "client",
  "guest",
  "shopper",
  "member"
] as const;

const INTERNAL_ONLY_KEYWORDS = [
  "internal",
  "employee",
  "staff",
  "ops team",
  "operator",
  "backoffice"
] as const;

const EXTERNAL_ACCOUNT_KEYWORDS = [
  "customer account",
  "client account",
  "member account",
  "organization",
  "tenant",
  "workspace"
] as const;

const GENERIC_PRODUCT_TYPE_VALUES = [
  "app",
  "tool",
  "platform",
  "system",
  "website",
  "product"
] as const;

const OVERLAY_COMPLEXITY_BOOSTS = {
  "ai-copilot": { role: 0, trust: 1, workflow: 1, transaction: 0 },
  "multi-tenant-team-workspace": { role: 1, trust: 1, workflow: 1, transaction: 0 },
  "approval-workflow-governance": { role: 0, trust: 1, workflow: 1, transaction: 0 },
  "community-ugc": { role: 1, trust: 1, workflow: 1, transaction: 0 },
  commerce: { role: 0, trust: 0, workflow: 0, transaction: 1 },
  "mobile-first-native-experience": { role: 0, trust: 0, workflow: 1, transaction: 0 },
  "compliance-security-sensitive-data": { role: 0, trust: 2, workflow: 0, transaction: 0 },
  "international-localization": { role: 0, trust: 0, workflow: 1, transaction: 0 }
} as const;

function createSignal(args: {
  branch: BranchFamily | null;
  kind: BranchSignal["kind"];
  label: string;
  rationale: string;
  matchedKeywords: string[];
  entries: BranchTextSignalEntry[];
  scoreContribution: number;
}) {
  return {
    signalId: createBranchRecordId(
      "branch-signal",
      `${args.branch ?? "unscoped"}-${args.label}-${args.matchedKeywords.join("-")}`
    ),
    kind: args.kind,
    label: args.label,
    rationale: args.rationale,
    matchedKeywords: dedupe(args.matchedKeywords.filter(Boolean)),
    branch: args.branch,
    fieldKeys: dedupe(
      args.entries
        .map((entry) => entry.fieldKey)
        .filter((fieldKey): fieldKey is NonNullable<typeof fieldKey> => fieldKey !== null)
    ),
    categoryKeys: dedupe(args.entries.map((entry) => entry.categoryKey)),
    sourceIds: mergeUnique(...args.entries.map((entry) => entry.sourceIds)),
    evidenceIds: mergeUnique(...args.entries.map((entry) => entry.evidenceIds)),
    scoreContribution: args.scoreContribution,
    confidence: toUnitIntervalConfidence(
      clampUnitInterval(args.scoreContribution / 1.55),
      args.rationale
    )
  } satisfies BranchSignal;
}

function entriesForFields(
  entries: BranchTextSignalEntry[],
  fieldKeys: readonly ExtractionFieldKey[]
) {
  return entries.filter(
    (entry) => entry.fieldKey !== null && fieldKeys.includes(entry.fieldKey)
  );
}

function aggregateNormalizedText(entries: BranchTextSignalEntry[]) {
  return entries.map((entry) => entry.normalizedText).join(" ");
}

function hasKeyword(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function buildKeywordSignal(args: {
  branch: NonHybridBranchFamily;
  label: string;
  rationale: string;
  keywords: readonly string[];
  entries: BranchTextSignalEntry[];
  kind: BranchSignal["kind"];
  baseWeight: number;
}) {
  const matchedEntries = args.entries.filter((entry) =>
    args.keywords.some((keyword) => entry.normalizedText.includes(keyword))
  );

  if (matchedEntries.length === 0) {
    return null;
  }

  const matchedKeywords = dedupe(
    args.keywords.filter((keyword) =>
      matchedEntries.some((entry) => entry.normalizedText.includes(keyword))
    )
  );
  const scoreContribution =
    average(matchedEntries.map((entry) => entry.confidenceMultiplier)) *
    Math.min(args.baseWeight + matchedKeywords.length * 0.08, args.baseWeight + 0.32);

  return createSignal({
    branch: args.branch,
    kind: args.kind,
    label: args.label,
    rationale: args.rationale,
    matchedKeywords,
    entries: matchedEntries,
    scoreContribution
  });
}

function buildExplicitBranchSignals(state: ExtractionState, entries: BranchTextSignalEntry[]) {
  const signals: BranchSignal[] = [];
  const primaryBranchField = state.fields.primary_branch;
  const explicitValue =
    primaryBranchField.value?.kind === "text" ? primaryBranchField.value.summary : null;

  if (
    explicitValue &&
    [...NON_HYBRID_BRANCH_FAMILIES, "Hybrid / Composite System"].includes(
      explicitValue as BranchFamily
    )
  ) {
    signals.push(
      createSignal({
        branch: explicitValue as BranchFamily,
        kind: "explicit-branch",
        label: "Explicit branch field",
        rationale: "The extraction state already carries an explicit branch answer.",
        matchedKeywords: [explicitValue],
        entries: entriesForFields(entries, BRANCH_CATEGORY_FIELD_KEYS),
        scoreContribution:
          explicitValue === "Hybrid / Composite System"
            ? 1.3 * primaryBranchField.confidence.score
            : 1.55 * primaryBranchField.confidence.score
      })
    );
  }

  if (state.branchClassification.primaryBranch) {
    signals.push(
      createSignal({
        branch: state.branchClassification.primaryBranch,
        kind: "explicit-branch",
        label: "Branch classification reference",
        rationale:
          "The extraction engine already carries a branch classification reference.",
        matchedKeywords: [state.branchClassification.primaryBranch],
        entries: entriesForFields(entries, BRANCH_CATEGORY_FIELD_KEYS),
        scoreContribution: 1.35 * state.branchClassification.confidence.score
      })
    );
  }

  return signals;
}

function buildStructuralSignals(
  entries: BranchTextSignalEntry[]
) {
  const signals: BranchSignal[] = [];
  const actorEntries = entriesForFields(entries, ACTOR_FIELD_KEYS);
  const workflowEntries = entriesForFields(entries, WORKFLOW_FIELD_KEYS);
  const businessEntries = entriesForFields(entries, BUSINESS_MODEL_FIELD_KEYS);
  const actorText = aggregateNormalizedText(actorEntries);
  const workflowText = aggregateNormalizedText(workflowEntries);
  const businessText = aggregateNormalizedText(businessEntries);
  const fullText = aggregateNormalizedText(entries);

  const hasSupplySide = hasKeyword(actorText, SUPPLY_SIDE_KEYWORDS);
  const hasDemandSide = hasKeyword(actorText, DEMAND_SIDE_KEYWORDS);
  const hasBookingBehavior =
    hasKeyword(workflowText, [
      "booking",
      "schedule",
      "appointment",
      "reservation",
      "calendar",
      "availability",
      "timeslot"
    ]) || hasKeyword(fullText, ["booking", "schedule", "appointment"]);
  const hasCommerceBehavior =
    hasKeyword(workflowText, ["checkout", "cart", "fulfill", "ship", "browse"]) &&
    hasKeyword(fullText, ["catalog", "order", "storefront", "inventory", "product"]);
  const hasInternalOnlyActors =
    hasKeyword(actorText, INTERNAL_ONLY_KEYWORDS) && !hasKeyword(actorText, DEMAND_SIDE_KEYWORDS);
  const hasExternalAccounts = hasKeyword(actorText, EXTERNAL_ACCOUNT_KEYWORDS);
  const hasContentMembershipMix =
    hasKeyword(fullText, ["content", "community", "member", "membership"]) &&
    hasKeyword(fullText, ["publish", "course", "newsletter", "discussion"]);
  const hasDeveloperContract =
    hasKeyword(fullText, ["api", "sdk", "cli"]) &&
    hasKeyword(fullText, ["developer", "engineer", "infrastructure", "webhook"]);
  const hasDataProduct =
    hasKeyword(fullText, ["analytics", "dashboard", "reporting", "insight"]) &&
    hasKeyword(fullText, ["data", "metrics", "forecast", "intelligence"]);
  const hasSaasRecurring =
    hasKeyword(fullText, ["subscription", "workspace", "team", "dashboard"]) &&
    (hasKeyword(businessText, ["subscription", "seat", "recurring"]) ||
      hasKeyword(actorText, ["team", "manager", "admin"]));

  if (hasSupplySide && hasDemandSide) {
    signals.push(
      createSignal({
        branch: "Marketplace / Multi-Sided Platform",
        kind: "actor-pattern",
        label: "Multi-sided actor pattern",
        rationale: "Separate supply-side and demand-side actors are both present.",
        matchedKeywords: [...SUPPLY_SIDE_KEYWORDS, ...DEMAND_SIDE_KEYWORDS],
        entries: actorEntries,
        scoreContribution: 1.42 * average(actorEntries.map((entry) => entry.confidenceMultiplier))
      })
    );
  }

  if (hasBookingBehavior && (hasSupplySide || hasKeyword(actorText, ["staff", "practitioner"]))) {
    signals.push(
      createSignal({
        branch: "Booking / Scheduling / Service Delivery",
        kind: "workflow-pattern",
        label: "Booking workflow pattern",
        rationale:
          "Scheduling or appointment behavior appears with provider or service-delivery actors.",
        matchedKeywords: ["booking", "schedule", "appointment"],
        entries: [...actorEntries, ...workflowEntries],
        scoreContribution:
          1.35 *
          average([...actorEntries, ...workflowEntries].map((entry) => entry.confidenceMultiplier))
      })
    );
  }

  if (hasCommerceBehavior) {
    signals.push(
      createSignal({
        branch: "Commerce / Ecommerce",
        kind: "workflow-pattern",
        label: "Commerce transaction pattern",
        rationale: "Checkout, order, and fulfillment behavior is present in the workflow.",
        matchedKeywords: ["checkout", "catalog", "order", "fulfillment"],
        entries,
        scoreContribution: 1.28 * average(entries.map((entry) => entry.confidenceMultiplier))
      })
    );
  }

  if (hasInternalOnlyActors) {
    signals.push(
      createSignal({
        branch: "Internal Operations / Backoffice Tool",
        kind: "actor-pattern",
        label: "Internal-only operator pattern",
        rationale: "Actors look internal and operational rather than public-facing.",
        matchedKeywords: [...INTERNAL_ONLY_KEYWORDS],
        entries: actorEntries,
        scoreContribution: 1.18 * average(actorEntries.map((entry) => entry.confidenceMultiplier))
      })
    );
  }

  if (hasSaasRecurring || hasExternalAccounts) {
    signals.push(
      createSignal({
        branch: "SaaS / Workflow Platform",
        kind: "business-model-pattern",
        label: "Recurring software pattern",
        rationale:
          "The request carries recurring software, team workflow, or account-based usage signals.",
        matchedKeywords: ["subscription", "workspace", "team", "account"],
        entries,
        scoreContribution: 1.12 * average(entries.map((entry) => entry.confidenceMultiplier))
      })
    );
  }

  if (hasContentMembershipMix) {
    signals.push(
      createSignal({
        branch: "Content / Community / Membership",
        kind: "structure-pattern",
        label: "Content and membership pattern",
        rationale: "Publishing and community/member access both appear in the extracted truth.",
        matchedKeywords: ["content", "community", "membership"],
        entries,
        scoreContribution: 1.2 * average(entries.map((entry) => entry.confidenceMultiplier))
      })
    );
  }

  if (hasDeveloperContract) {
    signals.push(
      createSignal({
        branch: "Developer Platform / API / Infrastructure",
        kind: "structure-pattern",
        label: "Developer contract pattern",
        rationale: "The request talks about API or infrastructure contracts for developers.",
        matchedKeywords: ["api", "sdk", "developer", "infrastructure"],
        entries,
        scoreContribution: 1.28 * average(entries.map((entry) => entry.confidenceMultiplier))
      })
    );
  }

  if (hasDataProduct) {
    signals.push(
      createSignal({
        branch: "Data / Analytics / Intelligence Platform",
        kind: "structure-pattern",
        label: "Data product pattern",
        rationale: "Analytics and data/intelligence output appear to be central product signals.",
        matchedKeywords: ["analytics", "dashboard", "data", "intelligence"],
        entries,
        scoreContribution: 1.22 * average(entries.map((entry) => entry.confidenceMultiplier))
      })
    );
  }

  return signals;
}

function buildBranchSignals(state: ExtractionState, entries: BranchTextSignalEntry[]) {
  const signals = [...buildExplicitBranchSignals(state, entries), ...buildStructuralSignals(entries)];

  for (const branch of NON_HYBRID_BRANCH_FAMILIES) {
    const definition = BRANCH_DEFINITIONS[branch];
    const actorEntries = entriesForFields(entries, ACTOR_FIELD_KEYS);
    const workflowEntries = entriesForFields(entries, WORKFLOW_FIELD_KEYS);
    const businessEntries = entriesForFields(entries, BUSINESS_MODEL_FIELD_KEYS);

    const generalSignal = buildKeywordSignal({
      branch,
      label: `${branch} general keywords`,
      rationale: `${branch} keyword signals appear across the extracted truth.`,
      keywords: definition.generalKeywords,
      entries,
      kind: "keyword",
      baseWeight: 0.96
    });
    const actorSignal = buildKeywordSignal({
      branch,
      label: `${branch} actor keywords`,
      rationale: `${branch} actor signals appear in the user, buyer, or admin truth.`,
      keywords: definition.actorKeywords,
      entries: actorEntries,
      kind: "actor-pattern",
      baseWeight: 1.08
    });
    const workflowSignal = buildKeywordSignal({
      branch,
      label: `${branch} workflow keywords`,
      rationale: `${branch} workflow signals appear in the extracted workflow truth.`,
      keywords: definition.workflowKeywords,
      entries: workflowEntries,
      kind: "workflow-pattern",
      baseWeight: 1.14
    });
    const businessSignal = buildKeywordSignal({
      branch,
      label: `${branch} business-model keywords`,
      rationale: `${branch} economic or packaging signals appear in the business model truth.`,
      keywords: definition.businessModelKeywords,
      entries: businessEntries,
      kind: "business-model-pattern",
      baseWeight: 1.1
    });

    for (const signal of [generalSignal, actorSignal, workflowSignal, businessSignal]) {
      if (signal) {
        signals.push(signal);
      }
    }
  }

  return signals;
}

function scoreBranches(signals: BranchSignal[]) {
  const scores = new Map<BranchFamily, { rawScore: number; signalIds: string[] }>();

  for (const signal of signals) {
    if (!signal.branch) {
      continue;
    }

    const current = scores.get(signal.branch) ?? { rawScore: 0, signalIds: [] };
    current.rawScore += signal.scoreContribution;
    current.signalIds.push(signal.signalId);
    scores.set(signal.branch, current);
  }

  return scores;
}

function fieldHasStableTruth(state: ExtractionState, fieldKey: ExtractionFieldKey) {
  const status = state.fields[fieldKey].status;

  return (
    status === "partial" ||
    status === "answered" ||
    status === "inferred" ||
    status === "validated"
  );
}

function fieldSummary(state: ExtractionState, fieldKey: ExtractionFieldKey) {
  return state.fields[fieldKey].value?.summary ?? "";
}

function summaryIncludes(
  state: ExtractionState,
  fieldKey: ExtractionFieldKey,
  keywords: readonly string[]
) {
  const summary = normalizeText(fieldSummary(state, fieldKey));

  return keywords.some((keyword) => summary.includes(normalizeText(keyword)));
}

function candidateConfidence(args: {
  score: number;
  topScore: number;
  secondScore: number;
  signalCount: number;
  blockerPenalty: number;
}) {
  const scoreStrength = clampUnitInterval(args.score / 2.9);
  const gapStrength =
    args.topScore <= 0
      ? 0
      : clampUnitInterval((args.score - args.secondScore) / Math.max(args.topScore, 0.8));
  const signalCoverage = clampUnitInterval(args.signalCount / 4);

  return clampUnitInterval(
    0.16 +
      scoreStrength * 0.46 +
      gapStrength * 0.22 +
      signalCoverage * 0.16 -
      args.blockerPenalty
  );
}

function buildCandidates(
  state: ExtractionState,
  signals: BranchSignal[]
) {
  const scored = [...scoreBranches(signals).entries()]
    .map(([branch, summary]) => ({
      branch,
      rawScore: summary.rawScore,
      signalIds: summary.signalIds
    }))
    .sort((left, right) => right.rawScore - left.rawScore);
  const topScore = scored[0]?.rawScore ?? 0;
  const secondScore = scored[1]?.rawScore ?? 0;
  const blockerPenalty =
    state.contradictions.length * 0.08 + state.unknowns.length * 0.05;

  return scored.map((candidate) => ({
    branch: candidate.branch,
    rawScore: candidate.rawScore,
    confidence: toUnitIntervalConfidence(
      candidateConfidence({
        score: candidate.rawScore,
        topScore,
        secondScore,
        signalCount: candidate.signalIds.length,
        blockerPenalty: Math.min(0.26, blockerPenalty)
      }),
      `Deterministic branch score for ${candidate.branch}.`,
      candidate.branch === scored[0]?.branch
        ? ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapBranchCertaintyMinimum / 100
        : undefined
    ),
    rationale:
      candidate.signalIds.length > 0
        ? `${candidate.signalIds.length} deterministic signals support ${candidate.branch}.`
        : `No deterministic signals support ${candidate.branch} yet.`,
    signalIds: dedupe(candidate.signalIds)
  })) as BranchCandidate[];
}

function samePair(
  left: readonly [BranchFamily, BranchFamily],
  right: readonly [BranchFamily, BranchFamily]
) {
  return (
    (left[0] === right[0] && left[1] === right[1]) ||
    (left[0] === right[1] && left[1] === right[0])
  );
}

function ambiguitySeverity(args: {
  top: BranchCandidate | null;
  second: BranchCandidate | null;
  missingFieldCount: number;
  contradictionCount: number;
}) {
  if (!args.top || args.top.rawScore < 0.4) {
    return "high" as const;
  }

  if (
    args.second &&
    args.second.rawScore >= 0.72 &&
    args.second.rawScore / Math.max(args.top.rawScore, 0.01) >= 0.88
  ) {
    return "high" as const;
  }

  if (
    args.second &&
    args.second.rawScore >= 0.55 &&
    args.second.rawScore / Math.max(args.top.rawScore, 0.01) >= 0.72
  ) {
    return "moderate" as const;
  }

  if (args.missingFieldCount > 0 || args.contradictionCount > 0) {
    return "low" as const;
  }

  return "none" as const;
}

function pickResolutionPlaybook(
  top: BranchCandidate | null,
  second: BranchCandidate | null
) {
  if (!top || !second) {
    return null;
  }

  return (
    BRANCH_RESOLUTION_PLAYBOOK.find((playbook) =>
      samePair(playbook.branches, [top.branch, second.branch])
    ) ?? null
  );
}

function buildAmbiguity(args: {
  state: ExtractionState;
  primary: BranchCandidate | null;
  candidates: BranchCandidate[];
}) {
  const second = args.candidates[1] ?? null;
  const contradictions = args.state.contradictions.filter((contradiction) =>
    contradiction.linkedCategoryKeys.some((categoryKey) =>
      [
        "branch_product_type",
        "actors",
        "workflow",
        "business_model",
        "request_core_concept"
      ].includes(categoryKey)
    )
  );
  const missingFieldKeys = [
    "primary_branch",
    "product_type",
    "product_function",
    "primary_users",
    "first_use_case",
    "business_model"
  ].filter((fieldKey) => {
    const field = args.state.fields[fieldKey as ExtractionFieldKey];
    return field.status === "unanswered" || field.status === "partial";
  }) as ExtractionFieldKey[];
  const playbook = pickResolutionPlaybook(args.primary, second);
  const severity = ambiguitySeverity({
    top: args.primary,
    second,
    missingFieldCount: missingFieldKeys.length,
    contradictionCount: contradictions.length
  });
  const branchResolutionRequired =
    !args.primary ||
    severity === "moderate" ||
    severity === "high" ||
    contradictions.some((contradiction) => contradiction.blocked);

  return {
    severity,
    competingBranches: args.candidates.slice(0, 3),
    reason:
      playbook?.reason ??
      (!args.primary
        ? "Not enough deterministic branch truth exists yet."
        : second && severity !== "none"
        ? `${args.primary.branch} and ${second.branch} are both materially supported.`
        : "The current branch candidate is stable."),
    branchResolutionRequired,
    missingInformationNeeded: playbook
      ? [...playbook.missingInformationNeeded]
      : missingFieldKeys.map((fieldKey) => `More stable truth is needed for ${fieldKey}.`),
    recommendedQuestionTarget: playbook?.recommendedQuestionTarget ?? missingFieldKeys[0],
    blocksRoadmap: branchResolutionRequired
  };
}

function buildBlockers(args: {
  state: ExtractionState;
  ambiguity: ReturnType<typeof buildAmbiguity>;
  primary: BranchCandidate | null;
}) {
  const blockers = [] as BranchClassificationResult["blockers"];
  const missingFieldKeys = [
    "primary_branch",
    "product_type",
    "product_function",
    "primary_users",
    "first_use_case",
    "business_model"
  ].filter((fieldKey) => {
    const field = args.state.fields[fieldKey as ExtractionFieldKey];
    return field.status === "unanswered" || field.status === "partial";
  }) as ExtractionFieldKey[];

  if (missingFieldKeys.length > 0) {
    blockers.push({
      blockerId: createBranchRecordId("branch-blocker", missingFieldKeys.join("-")),
      severity: missingFieldKeys.length >= 3 ? "high" : "moderate",
      reason: "Branch-critical fields are still missing or only partial.",
      linkedFieldKeys: [...missingFieldKeys],
      linkedCategoryKeys: ["branch_product_type", "actors", "workflow", "business_model"],
      missingInformationNeeded: missingFieldKeys.map(
        (fieldKey) => `Confirm stable truth for ${fieldKey}.`
      ),
      recommendedQuestionTarget: args.ambiguity.recommendedQuestionTarget,
      blocksRoadmap: true
    });
  }

  for (const contradiction of args.state.contradictions.filter((item) =>
    item.linkedCategoryKeys.some((categoryKey) =>
      [
        "branch_product_type",
        "actors",
        "workflow",
        "business_model",
        "request_core_concept"
      ].includes(categoryKey)
    )
  )) {
    blockers.push({
      blockerId: contradiction.contradictionId,
      severity: contradictionSeverityToRiskLevel(contradiction.severity),
      reason: contradiction.title,
      linkedFieldKeys: contradiction.linkedFieldKeys,
      linkedCategoryKeys: contradiction.linkedCategoryKeys,
      missingInformationNeeded: [contradiction.recommendedResolutionPath],
      recommendedQuestionTarget:
        contradiction.linkedFieldKeys[0] ?? contradiction.linkedCategoryKeys[0],
      blocksRoadmap: contradiction.blocked || contradiction.severity === "high"
    });
  }

  for (const unknown of args.state.unknowns.filter((item) =>
    [
      "branch_product_type",
      "actors",
      "workflow",
      "business_model",
      "request_core_concept"
    ].includes(item.categoryKey)
  )) {
    blockers.push({
      blockerId: unknown.unknownId,
      severity: unknown.urgency,
      reason: unknown.question,
      linkedFieldKeys: unknown.linkedFieldKeys,
      linkedCategoryKeys: [unknown.categoryKey],
      missingInformationNeeded: [unknown.whyItMatters],
      recommendedQuestionTarget: unknown.recommendedNextQuestionTarget as ExtractionFieldKey,
      blocksRoadmap: unknown.blockingStage === "roadmap" || unknown.blockingStage === "both"
    });
  }

  if (args.ambiguity.branchResolutionRequired) {
    blockers.push({
      blockerId: createBranchRecordId(
        "branch-ambiguity",
        `${args.primary?.branch ?? "none"}-${args.ambiguity.severity}`
      ),
      severity:
        args.ambiguity.severity === "high"
          ? "high"
          : "moderate",
      reason: args.ambiguity.reason,
      linkedFieldKeys: [],
      linkedCategoryKeys: ["branch_product_type"],
      missingInformationNeeded: [...args.ambiguity.missingInformationNeeded],
      recommendedQuestionTarget: args.ambiguity.recommendedQuestionTarget,
      blocksRoadmap: args.ambiguity.blocksRoadmap
    });
  }

  return blockers;
}

function buildFrameworkCases(args: {
  state: ExtractionState;
  blockers: BranchClassificationResult["blockers"];
}) {
  const hasCoreConceptTruth =
    fieldHasStableTruth(args.state, "core_concept") ||
    fieldHasStableTruth(args.state, "product_function");
  const hasRecoveryUnknown = args.state.unknowns.some(
    (unknown) =>
      !unknown.resolved &&
      (unknown.categoryKey === "request_core_concept" ||
        unknown.linkedFieldKeys.some((fieldKey) =>
          ["core_concept", "product_function", "first_use_case"].includes(fieldKey)
        ))
  );
  const targetUserUnknown = args.state.unknowns.some(
    (unknown) => !unknown.resolved && unknown.categoryKey === "actors"
  );
  const firstUseCaseUnknown = args.state.unknowns.some(
    (unknown) =>
      !unknown.resolved &&
      (unknown.categoryKey === "workflow" ||
        unknown.linkedFieldKeys.includes("first_use_case"))
  );
  const integrationUnknown = args.state.unknowns.some(
    (unknown) => !unknown.resolved && unknown.categoryKey === "systems_integrations"
  );
  const monetizationUnknown = args.state.unknowns.some(
    (unknown) =>
      !unknown.resolved &&
      (unknown.categoryKey === "business_model" ||
        unknown.linkedFieldKeys.includes("business_model"))
  );
  const complianceUnknown = args.state.unknowns.some(
    (unknown) =>
      !unknown.resolved &&
      (unknown.linkedFieldKeys.includes("compliance_security_sensitivity") ||
        unknown.categoryKey === "constraints")
  );
  const complianceSummary = normalizeText(
    fieldSummary(args.state, "compliance_security_sensitivity")
  );
  const domainIntentSummary = normalizeText(fieldSummary(args.state, "domain_intent"));
  const domainValidationSummary = normalizeText(
    fieldSummary(args.state, "domain_validation_path")
  );
  const projectNameSummary = normalizeText(fieldSummary(args.state, "project_name_state"));
  const businessModelSummary = normalizeText(fieldSummary(args.state, "business_model"));
  const notes: string[] = [];
  const executionSafety =
    args.blockers.some((blocker) => blocker.blocksRoadmap) ||
    args.state.executionReadiness.state === "blocked"
      ? "not_safe_yet"
      : "safe";

  if (executionSafety === "not_safe_yet") {
    notes.push("Execution is not yet safe because roadmap or execution blockers remain open.");
  }

  return {
    projectNamePath: summaryIncludes(args.state, "project_name_state", [
      "needs naming help",
      "naming help"
    ])
      ? "naming_help_needed"
      : summaryIncludes(args.state, "project_name_state", [
          "intentionally unnamed",
          "unnamed"
        ])
      ? "intentionally_unnamed"
      : fieldHasStableTruth(args.state, "project_name_state")
      ? "name_exists"
      : "unknown",
    domainPath:
      domainValidationSummary.includes("validate") ||
      domainValidationSummary.includes("viability") ||
      domainValidationSummary.includes("alternative")
        ? "validate_now"
        : domainIntentSummary.includes("later") ||
          domainIntentSummary.includes("not now") ||
          domainIntentSummary.includes("defer")
        ? "later"
        : domainIntentSummary.includes("not at all") ||
          domainIntentSummary.includes("not needed") ||
          domainIntentSummary.includes("no domain")
        ? "not_needed"
        : "unknown",
    ideaClarity:
      !hasCoreConceptTruth && hasRecoveryUnknown
        ? "does_not_know_recovery"
        : !hasCoreConceptTruth || !fieldHasStableTruth(args.state, "first_use_case")
        ? "vague_idea"
        : "stable",
    targetUserClarity:
      fieldHasStableTruth(args.state, "primary_users") && !targetUserUnknown
        ? "clear"
        : "unclear",
    firstUseCaseClarity:
      (fieldHasStableTruth(args.state, "first_use_case") ||
        fieldHasStableTruth(args.state, "core_workflow")) &&
      !firstUseCaseUnknown
        ? "clear"
        : "unclear",
    integrationClarity:
      integrationUnknown &&
      !(
        fieldHasStableTruth(args.state, "systems_touched") ||
        fieldHasStableTruth(args.state, "integrations") ||
        fieldHasStableTruth(args.state, "data_dependencies")
      )
        ? "blocking_unknown"
        : integrationUnknown
        ? "unknown"
        : fieldHasStableTruth(args.state, "systems_touched") ||
          fieldHasStableTruth(args.state, "integrations") ||
          fieldHasStableTruth(args.state, "data_dependencies")
        ? "known"
        : "unknown",
    compliancePath:
      complianceSummary.includes("not sensitive") || complianceSummary.includes("not regulated")
        ? "not_sensitive"
        : complianceUnknown &&
          (complianceSummary.includes("sensitive") ||
            complianceSummary.includes("regulated") ||
            complianceSummary.includes("security") ||
            complianceSummary.includes("privacy"))
        ? "sensitive_unresolved"
        : fieldHasStableTruth(args.state, "compliance_security_sensitivity")
        ? "sensitive_screened"
        : "unknown",
    monetizationClarity:
      businessModelSummary.includes("defer") ||
      businessModelSummary.includes("later") ||
      businessModelSummary.includes("not for v1")
        ? "deferred"
        : fieldHasStableTruth(args.state, "business_model") && !monetizationUnknown
        ? "clear"
        : "unclear",
    executionSafety,
    notes
  } satisfies BranchClassificationResult["frameworkCases"];
}

function contradictionSeverityToRiskLevel(
  severity: ExtractionState["contradictions"][number]["severity"]
) {
  switch (severity) {
    case "critical":
      return "critical" as const;
    case "high":
      return "high" as const;
    case "moderate":
      return "moderate" as const;
    default:
      return "low" as const;
  }
}

function buildSpecialization(args: {
  state: ExtractionState;
  primary: BranchCandidate | null;
  secondaryBranches: BranchCandidate[];
  overlayKeys: string[];
  signalIds: string[];
}) {
  if (!args.primary) {
    return null;
  }

  const productTypeField = args.state.fields.product_type;
  const productTypeText =
    productTypeField.value?.kind === "text" ? productTypeField.value.summary.trim() : "";
  const normalizedProductType = normalizeText(productTypeText);

  if (
    productTypeText &&
    !GENERIC_PRODUCT_TYPE_VALUES.includes(
      normalizedProductType as (typeof GENERIC_PRODUCT_TYPE_VALUES)[number]
    ) &&
    !normalizeText(args.primary.branch).includes(normalizedProductType)
  ) {
    return {
      key: createBranchRecordId("specialization", normalizedProductType),
      label: titleCase(productTypeText),
      summary: "Specialization taken directly from extracted product type truth.",
      confidence: productTypeField.confidence,
      basedOnBranches: [
        args.primary.branch,
        ...args.secondaryBranches.map((branch) => branch.branch)
      ],
      sourceFieldKeys: ["product_type"],
      signalIds: []
    } satisfies BranchSpecialization;
  }

  const fullText = aggregateNormalizedText(collectExtractionSignalEntries(args.state));
  const branches = [args.primary.branch, ...args.secondaryBranches.map((branch) => branch.branch)];

  if (
    args.primary.branch === "Commerce / Ecommerce" &&
    ["apparel", "fashion", "clothing", "merch"].some((keyword) => fullText.includes(keyword))
  ) {
    return {
      key: "apparel-ecommerce",
      label: "Apparel ecommerce",
      summary: "Commerce signals are paired with apparel or fashion specialization.",
      confidence: toUnitIntervalConfidence(0.82),
      basedOnBranches: branches,
      sourceFieldKeys: ["request_summary", "core_concept"],
      signalIds: args.signalIds
    } satisfies BranchSpecialization;
  }

  if (
    branches.includes("Marketplace / Multi-Sided Platform") &&
    branches.includes("Booking / Scheduling / Service Delivery")
  ) {
    return {
      key: "marketplace-booking",
      label: "Marketplace with booking behavior",
      summary:
        "The product mixes multi-sided supply/demand with booking or appointment flow.",
      confidence: toUnitIntervalConfidence(0.78),
      basedOnBranches: branches,
      sourceFieldKeys: ["primary_users", "core_workflow"],
      signalIds: args.signalIds
    } satisfies BranchSpecialization;
  }

  if (
    args.primary.branch === "Internal Operations / Backoffice Tool" &&
    ["portal", "client portal", "customer portal", "external client"].some((keyword) =>
      fullText.includes(keyword)
    )
  ) {
    return {
      key: "internal-ops-client-portal",
      label: "Internal ops with client portal",
      summary:
        "The core remains internal operations, but an external client-facing portal is also implied.",
      confidence: toUnitIntervalConfidence(0.74),
      basedOnBranches: branches,
      sourceFieldKeys: ["core_workflow", "primary_users"],
      signalIds: args.signalIds
    } satisfies BranchSpecialization;
  }

  if (
    ["SaaS / Workflow Platform", "Data / Analytics / Intelligence Platform"].includes(
      args.primary.branch
    ) &&
    args.overlayKeys.includes("ai-copilot") &&
    ["analytics", "dashboard", "intelligence", "data"].some((keyword) =>
      fullText.includes(keyword)
    )
  ) {
    return {
      key: "analytics-saas-ai",
      label: "Analytics SaaS with AI overlay",
      summary:
        "Analytics or intelligence value is paired with recurring software workflow and AI assistance.",
      confidence: toUnitIntervalConfidence(0.76),
      basedOnBranches: branches,
      sourceFieldKeys: ["core_workflow", "business_model", "product_type"],
      signalIds: args.signalIds
    } satisfies BranchSpecialization;
  }

  if (
    args.primary.branch === "Content / Community / Membership" &&
    ["membership", "member"].some((keyword) => fullText.includes(keyword)) &&
    ["content", "newsletter", "course", "library"].some((keyword) =>
      fullText.includes(keyword)
    )
  ) {
    return {
      key: "membership-content-hybrid",
      label: "Membership / content hybrid",
      summary: "Membership access and content publishing are both materially first-class.",
      confidence: toUnitIntervalConfidence(0.79),
      basedOnBranches: branches,
      sourceFieldKeys: ["business_model", "core_workflow"],
      signalIds: args.signalIds
    } satisfies BranchSpecialization;
  }

  return null;
}

function buildArchitectureHints(args: {
  state: ExtractionState;
  primary: BranchCandidate | null;
  secondaryBranches: BranchCandidate[];
  activeOverlayKeys: string[];
}): BranchClassificationResult["architectureHints"] {
  if (!args.primary) {
    return {
      likelyRequiredSystems: ["Planning intelligence"],
      likelyRoleComplexity: "moderate",
      likelyTrustSensitivity: "moderate",
      likelyWorkflowComplexity: "moderate",
      likelyTransactionComplexity: "low",
      notes: ["Branch classification is still weak, so architecture hints remain provisional."]
    };
  }

  const definition =
    args.primary.branch === "Hybrid / Composite System"
      ? null
      : BRANCH_DEFINITIONS[args.primary.branch as NonHybridBranchFamily];
  const baseSystems = definition?.likelyRequiredSystems ?? [
    "Product",
    "Auth",
    "Billing / account",
    "Protected routing"
  ];
  let roleRank = riskLevelRank(definition?.baseRoleComplexity ?? "high");
  let trustRank = riskLevelRank(definition?.baseTrustSensitivity ?? "high");
  let workflowRank = riskLevelRank(definition?.baseWorkflowComplexity ?? "high");
  let transactionRank = riskLevelRank(definition?.baseTransactionComplexity ?? "moderate");
  const systems = [...baseSystems];

  for (const overlayKey of args.activeOverlayKeys) {
    const boosts =
      OVERLAY_COMPLEXITY_BOOSTS[
        overlayKey as keyof typeof OVERLAY_COMPLEXITY_BOOSTS
      ];

    if (!boosts) {
      continue;
    }

    roleRank += boosts.role;
    trustRank += boosts.trust;
    workflowRank += boosts.workflow;
    transactionRank += boosts.transaction;
  }

  for (const branch of args.secondaryBranches) {
    if (branch.confidence.score >= 0.55) {
      roleRank += 1;
      workflowRank += 1;
    }
  }

  const systemsField = args.state.fields.systems_touched.value;

  if (systemsField?.kind === "list") {
    for (const item of systemsField.items) {
      if (GOVERNANCE_SYSTEMS.includes(item as GovernanceSystem)) {
        systems.push(item as GovernanceSystem);
      }
    }
  }

  return {
    likelyRequiredSystems: dedupe(systems) as GovernanceSystem[],
    likelyRoleComplexity: riskLevelFromRank(roleRank),
    likelyTrustSensitivity: riskLevelFromRank(trustRank),
    likelyWorkflowComplexity: riskLevelFromRank(workflowRank),
    likelyTransactionComplexity: riskLevelFromRank(transactionRank),
    notes: [
      "These hints are advisory only and do not change runtime behavior.",
      args.primary.branch === "Marketplace / Multi-Sided Platform"
        ? "Expect elevated role, trust, and payout/governance complexity."
        : args.primary.branch === "SaaS / Workflow Platform"
        ? "Expect account, permission, and recurring workflow complexity."
        : "Use these hints to scope later roadmap and Delta-Analyzer work."
    ]
  };
}

function buildRoadmapReadiness(args: {
  state: ExtractionState;
  primary: BranchCandidate | null;
  blockers: BranchClassificationResult["blockers"];
  ambiguity: ReturnType<typeof buildAmbiguity>;
}) {
  const blockingAssumptions = args.state.assumptions.filter(
    (assumption) =>
      assumption.confirmationRequired &&
      assumption.highSensitivity &&
      assumption.linkedCategoryKeys.some((categoryKey) =>
        ["branch_product_type", "actors", "workflow", "business_model"].includes(categoryKey)
      )
  );
  const blockerReasons = [
    ...args.blockers.filter((blocker) => blocker.blocksRoadmap).map((blocker) => blocker.reason),
    ...blockingAssumptions.map((assumption) => assumption.statement)
  ];
  const penalty = args.blockers.length * 0.08 + blockingAssumptions.length * 0.06;
  const baseScore = args.primary?.confidence.score ?? 0;
  const confidenceScore = clampUnitInterval(baseScore - penalty);
  const ready =
    !!args.primary &&
    !args.ambiguity.branchResolutionRequired &&
    blockerReasons.length === 0 &&
    confidenceScore >= ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapBranchCertaintyMinimum / 100;

  return {
    state: ready
      ? "ready"
      : blockerReasons.length > 0 || args.ambiguity.blocksRoadmap
      ? "blocked"
      : args.primary
      ? "provisional"
      : "not_ready",
    ready,
    confidence: toUnitIntervalConfidence(
      confidenceScore,
      "Branch readiness for roadmap drafting.",
      ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapBranchCertaintyMinimum / 100
    ),
    blockers: blockerReasons,
    missingInformationNeeded: [
      ...args.ambiguity.missingInformationNeeded,
      ...blockingAssumptions.map(
        (assumption) => `Confirm assumption: ${assumption.statement}`
      )
    ],
    recommendedQuestionTarget: args.ambiguity.recommendedQuestionTarget
  } satisfies BranchRoadmapReadiness;
}

export function classifyBranchesFromExtractionState(
  state: ExtractionState,
  options?: BranchClassificationOptions
) {
  const entries = collectExtractionSignalEntries(state);
  const branchSignals = buildBranchSignals(state, entries);
  const candidates = buildCandidates(state, branchSignals);
  const explicitHybrid =
    state.branchClassification.primaryBranch === "Hybrid / Composite System" ||
    (state.fields.primary_branch.value?.kind === "text" &&
      state.fields.primary_branch.value.summary === "Hybrid / Composite System");
  const primaryBranch = explicitHybrid
    ? candidates.find((candidate) => candidate.branch === "Hybrid / Composite System") ?? null
    : candidates[0] ?? null;
  const secondaryBranches = primaryBranch
    ? candidates.filter((candidate) => candidate.branch !== primaryBranch.branch).slice(0, 3)
    : candidates.slice(0, 3);
  const overlayEvaluation = evaluateOverlayActivations({
    state,
    entries,
    primaryBranch,
    secondaryBranches
  });
  const signals = [...branchSignals, ...overlayEvaluation.signals];
  const activeOverlayKeys = Object.values(overlayEvaluation.overlays)
    .filter((overlay) => overlay.state === "active" || overlay.state === "high-confidence active")
    .map((overlay) => overlay.overlayKey);
  const specialization = buildSpecialization({
    state,
    primary: primaryBranch,
    secondaryBranches,
    overlayKeys: activeOverlayKeys,
    signalIds: signals.map((signal) => signal.signalId)
  });
  const ambiguity = buildAmbiguity({
    state,
    primary: primaryBranch,
    candidates
  });
  const blockers = buildBlockers({
    state,
    ambiguity,
    primary: primaryBranch
  });
  const branchStability =
    primaryBranch &&
    !ambiguity.branchResolutionRequired &&
    primaryBranch.confidence.score >= 0.72 &&
    blockers.filter((blocker) => blocker.blocksRoadmap).length === 0
      ? "Stable"
      : "Unstable";
  const architectureHints = buildArchitectureHints({
    state,
    primary: primaryBranch,
    secondaryBranches,
    activeOverlayKeys
  });
  const frameworkCases = buildFrameworkCases({
    state,
    blockers
  });
  const roadmapReadiness = buildRoadmapReadiness({
    state,
    primary: primaryBranch,
    blockers,
    ambiguity
  });
  const architectureShiftRisk: BranchClassificationResult["architectureShiftRisk"] =
    branchStability === "Unstable" || activeOverlayKeys.length >= 3
      ? ("high" as const)
      : (architectureHints.likelyTrustSensitivity as BranchClassificationResult["architectureShiftRisk"]);
  const sourceFieldKeys = dedupe(signals.flatMap((signal) => signal.fieldKeys));
  const sourceIds = dedupe(signals.flatMap((signal) => signal.sourceIds));
  const evidenceIds = dedupe(signals.flatMap((signal) => signal.evidenceIds));
  const result = {
    id:
      options?.previous?.id ??
      createBranchRecordId(
        "branch-classification",
        state.requestSummary.requestedChangeOrInitiative
      ),
    date: nowIso(),
    preparedBy: options?.updatedBy,
    version: 1,
    primaryBranch,
    secondaryBranches,
    branchStability,
    specialization,
    overlays: overlayEvaluation.overlays,
    ambiguity,
    blockers,
    branchResolutionRequired: ambiguity.branchResolutionRequired,
    architectureShiftRisk,
    architectureHints,
    frameworkCases,
    roadmapReadiness,
    sourceFieldKeys,
    sourceIds,
    evidenceIds,
    signals,
    history: options?.previous?.history ? [...options.previous.history] : [],
    lastUpdate: {
      updatedAt: nowIso(),
      updatedBy: options?.updatedBy,
      updateReason:
        options?.updateReason ?? "Classified branches and overlays from extraction state."
    }
  } satisfies BranchClassificationResult;

  if (options?.previous) {
    const shift = detectBranchShift(options.previous, result);
    result.history.push({
      at: nowIso(),
      reason: options.updateReason ?? "Updated branch classification.",
      previousPrimaryBranch: options.previous.primaryBranch?.branch ?? null,
      nextPrimaryBranch: result.primaryBranch?.branch ?? null,
      previousAmbiguitySeverity: options.previous.ambiguity.severity,
      nextAmbiguitySeverity: result.ambiguity.severity,
      shiftLevel: shift.level
    });
  }

  return result;
}
