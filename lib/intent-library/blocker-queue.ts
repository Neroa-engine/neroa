import type { ArchitectureBlueprint, ArchitectureInputId } from "../intelligence/architecture";
import type { ProjectBriefSlotId } from "../intelligence/domain-contracts";
import type { GovernancePolicy } from "../intelligence/governance";
import type { ProjectBrief } from "../intelligence/project-brief";
import type { RoadmapPlan } from "../intelligence/roadmap";
import type { StoredProjectMetadata } from "../workspace/project-metadata";
import {
  getBlockerDefinition,
  listBlockerDefinitions,
  resolveBlockerIdFromQuestion
} from "./blockers.ts";
import type { BlockerId } from "./types.ts";
import {
  blockerQueueSchema,
  blockerQueueEntrySchema,
  type BlockerPriority,
  type BlockerQueue,
  type BlockerQueueEntry,
  type BlockerQueueSourceLayer
} from "./runtime-types.ts";

type RuntimeBuildArgs = {
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
};

type QueueAccumulator = {
  blockerId: BlockerId;
  label: string;
  inputId: string | null;
  sourceLayer: BlockerQueueSourceLayer;
  reasons: Set<string>;
  unresolvedFields: Set<string>;
  requiredForApproval: boolean;
  requiredForArchitecture: boolean;
  requiredForRoadmap: boolean;
  currentQuestionText: string;
  currentValue: string | null;
};

const SOURCE_LAYER_RANK: Record<BlockerQueueSourceLayer, number> = {
  governance: 0,
  revision: 1,
  roadmap: 2,
  architecture: 3,
  project_brief: 4,
  runtime: 5
};

const PRIORITY_RANK: Record<BlockerPriority, number> = {
  approval_critical: 0,
  scope_defining: 1,
  architecture_shaping: 2,
  roadmap_tightening: 3,
  secondary_enrichment: 4,
  deferred: 5
};

const BLOCKER_ORDER = new Map(
  listBlockerDefinitions().map((definition, index) => [definition.id, index])
);

const BLOCKER_DEPENDENCIES: Partial<Record<BlockerId, readonly BlockerId[]>> = {
  founder_name: [],
  project_direction: [],
  core_user_roles: ["project_direction"],
  constraints: ["project_direction"],
  integrations: ["project_direction"],
  data_sources: ["project_direction"],
  chains_in_scope: ["project_direction"],
  wallet_boundary: ["project_direction"],
  analytics_vs_advice_posture: ["project_direction"],
  scoring_inputs: ["project_direction", "analytics_vs_advice_posture"],
  first_pos_connector: ["project_direction"],
  launch_location_model: ["project_direction", "core_user_roles"],
  launch_reports: ["project_direction", "launch_location_model"],
  compliance_sensitivity: ["project_direction"],
  ai_integration_boundary: ["project_direction"],
  pricing_model: ["project_direction"],
  payments_billing_requirement: ["project_direction"],
  marketplace_listings_requirement: ["project_direction", "public_vs_internal_surface"],
  scheduling_dispatch_requirement: ["project_direction"],
  customer_portal_requirement: ["public_vs_internal_surface"],
  exports_requirement: ["dashboard_reporting_requirement"],
  role_based_access_requirement: ["core_user_roles"],
  multi_tenancy_requirement: ["project_direction"],
  workflow_approval_requirement: ["project_direction"],
  document_case_intake_requirement: ["project_direction"],
  api_access_requirement: ["project_direction"],
  reporting_depth_requirement: ["dashboard_reporting_requirement"],
  admin_permissions_requirement: ["core_user_roles", "admin_console_requirement"],
  notification_channels: ["notifications_requirement"],
  file_storage_requirement: ["file_upload_requirement"],
  support_human_review_requirement: ["project_direction"],
  mobile_priority_requirement: ["public_vs_internal_surface"],
  public_vs_internal_surface: ["project_direction"],
  search_saved_views_requirement: ["search_filter_requirement"],
  audit_trail_requirement: ["compliance_sensitivity"],
  file_upload_requirement: ["project_direction"],
  notifications_requirement: ["project_direction"],
  admin_console_requirement: ["project_direction"],
  search_filter_requirement: ["project_direction"],
  dashboard_reporting_requirement: ["project_direction"]
};

const REVISION_REOPEN_HINTS: Array<{
  pattern: RegExp;
  blockerIds: readonly BlockerId[];
}> = [
  {
    pattern: /\bwallet\b/i,
    blockerIds: ["wallet_boundary", "integrations"]
  },
  {
    pattern: /\banalytics only\b|\badvice\b|\brecommendation\b/i,
    blockerIds: ["analytics_vs_advice_posture", "compliance_sensitivity"]
  },
  {
    pattern: /\bmulti[- ]location\b|\bsingle location\b/i,
    blockerIds: ["launch_location_model", "launch_reports", "role_based_access_requirement"]
  },
  {
    pattern: /\btoast\b|\bsquare\b/i,
    blockerIds: ["first_pos_connector", "launch_reports"]
  },
  {
    pattern: /\bdashboard\b|\breport\b|\bexport\b/i,
    blockerIds: ["launch_reports", "dashboard_reporting_requirement", "exports_requirement"]
  },
  {
    pattern: /\bethereum\b|\bsolana\b|\bbase\b|\bchain\b/i,
    blockerIds: ["chains_in_scope"]
  }
];

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLookupText(value?: string | null) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(value);
    const normalized = cleaned.toLowerCase();

    if (!cleaned || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(cleaned);
  }

  return items;
}

function humanizeToken(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readAnsweredInputValue(args: {
  inputId: string | null | undefined;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  const inputId = cleanText(args.inputId);

  if (!inputId) {
    return "";
  }

  return (
    args.projectMetadata?.strategyState?.overrideState?.answeredInputs.find(
      (item) => item.inputId === inputId
    )?.value ?? ""
  );
}

function readRuntimeCurrentValue(args: {
  inputId: string | null;
  projectBrief: ProjectBrief;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  const answeredValue = readAnsweredInputValue(args);

  if (answeredValue) {
    return answeredValue;
  }

  switch (args.inputId) {
    case "founderName":
      return cleanText(args.projectBrief.founderName);
    case "projectName":
      return cleanText(args.projectBrief.projectName);
    case "buyerPersonas":
      return args.projectBrief.buyerPersonas.join(", ");
    case "operatorPersonas":
      return args.projectBrief.operatorPersonas.join(", ");
    case "endCustomerPersonas":
      return args.projectBrief.endCustomerPersonas.join(", ");
    case "adminPersonas":
      return args.projectBrief.adminPersonas.join(", ");
    case "productCategory":
      return cleanText(args.projectBrief.productCategory);
    case "problemStatement":
      return cleanText(args.projectBrief.problemStatement);
    case "outcomePromise":
      return cleanText(args.projectBrief.outcomePromise);
    case "mustHaveFeatures":
      return args.projectBrief.mustHaveFeatures.join(", ");
    case "niceToHaveFeatures":
      return args.projectBrief.niceToHaveFeatures.join(", ");
    case "excludedFeatures":
      return args.projectBrief.excludedFeatures.join(", ");
    case "surfaces":
      return args.projectBrief.surfaces.join(", ");
    case "integrations":
      return args.projectBrief.integrations.join(", ");
    case "dataSources":
      return args.projectBrief.dataSources.join(", ");
    case "constraints":
      return args.projectBrief.constraints.join(", ");
    case "complianceFlags":
      return args.projectBrief.complianceFlags.join(", ");
    case "chainsInScope":
    case "walletConnectionMvp":
    case "adviceAdjacency":
    case "riskSignalSources":
    case "launchLocationModel":
    case "firstPosConnector":
    case "launchReports":
      return readAnsweredInputValue(args);
    default:
      return "";
  }
}

function blockerAlreadyKnown(args: {
  blockerId: BlockerId;
  projectBrief: ProjectBrief;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  if (args.blockerId === "founder_name") {
    return Boolean(cleanText(args.projectBrief.founderName));
  }

  if (args.blockerId === "project_direction") {
    return Boolean(
      cleanText(args.projectBrief.productCategory) ||
        cleanText(args.projectBrief.problemStatement) ||
        cleanText(args.projectBrief.outcomePromise) ||
        cleanText(args.projectBrief.projectName)
    );
  }

  return false;
}

function pickPreferredSourceLayer(
  current: BlockerQueueSourceLayer,
  next: BlockerQueueSourceLayer
) {
  return SOURCE_LAYER_RANK[next] < SOURCE_LAYER_RANK[current] ? next : current;
}

function findAccumulatorByGovernanceText(
  accumulators: Map<BlockerId, QueueAccumulator>,
  value: string
) {
  const normalizedValue = normalizeLookupText(value);

  if (!normalizedValue) {
    return null;
  }

  for (const accumulator of accumulators.values()) {
    if (normalizeLookupText(accumulator.label) === normalizedValue) {
      return accumulator;
    }

    for (const reason of accumulator.reasons) {
      if (normalizeLookupText(reason) === normalizedValue) {
        return accumulator;
      }
    }
  }

  return null;
}

function resolveGovernanceBlockerId(args: {
  accumulators: Map<BlockerId, QueueAccumulator>;
  label?: string | null;
  reason?: string | null;
  relatedInputId?: string | null;
}) {
  const directInputMatch = cleanText(args.relatedInputId)
    ? resolveBlockerIdFromQuestion({
        inputId: args.relatedInputId
      })
    : null;

  if (directInputMatch) {
    return directInputMatch;
  }

  const fromLabel =
    findAccumulatorByGovernanceText(args.accumulators, args.label ?? "") ??
    findAccumulatorByGovernanceText(args.accumulators, args.reason ?? "");

  if (fromLabel) {
    return fromLabel.blockerId;
  }

  const normalizedLabel = normalizeLookupText(args.label);
  const exactDefinition = listBlockerDefinitions().find((definition) => {
    const exactCandidates = [
      definition.label,
      definition.questionText,
      ...definition.completionCriteria
    ];

    return exactCandidates.some(
      (candidate) => normalizeLookupText(candidate) === normalizedLabel
    );
  });

  return exactDefinition?.id ?? null;
}

function registerCandidate(args: {
  accumulators: Map<BlockerId, QueueAccumulator>;
  blockerId: BlockerId | null;
  label?: string | null;
  inputId?: string | null;
  questionText?: string | null;
  sourceLayer: BlockerQueueSourceLayer;
  reason: string;
  requiredForApproval?: boolean;
  requiredForArchitecture?: boolean;
  requiredForRoadmap?: boolean;
  projectBrief: ProjectBrief;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  if (!args.blockerId) {
    return;
  }

  const definition = getBlockerDefinition(args.blockerId);

  if (!definition) {
    return;
  }

  if (
    blockerAlreadyKnown({
      blockerId: args.blockerId,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    })
  ) {
    return;
  }

  const currentValue = readRuntimeCurrentValue({
    inputId: args.inputId ?? null,
    projectBrief: args.projectBrief,
    projectMetadata: args.projectMetadata
  });
  const existing = args.accumulators.get(args.blockerId);

  if (!existing) {
    args.accumulators.set(args.blockerId, {
      blockerId: args.blockerId,
      label: cleanText(args.label) || definition.label,
      inputId: cleanText(args.inputId) || null,
      sourceLayer: args.sourceLayer,
      reasons: new Set(uniqueStrings([args.reason])),
      unresolvedFields: new Set(
        uniqueStrings([cleanText(args.inputId) || definition.id])
      ),
      requiredForApproval: Boolean(args.requiredForApproval),
      requiredForArchitecture: Boolean(args.requiredForArchitecture),
      requiredForRoadmap: Boolean(args.requiredForRoadmap),
      currentQuestionText: cleanText(args.questionText) || definition.questionText,
      currentValue: currentValue || null
    });
    return;
  }

  existing.sourceLayer = pickPreferredSourceLayer(existing.sourceLayer, args.sourceLayer);
  existing.requiredForApproval ||= Boolean(args.requiredForApproval);
  existing.requiredForArchitecture ||= Boolean(args.requiredForArchitecture);
  existing.requiredForRoadmap ||= Boolean(args.requiredForRoadmap);
  existing.reasons.add(cleanText(args.reason) || definition.description);

  if (cleanText(args.inputId)) {
    existing.unresolvedFields.add(cleanText(args.inputId));
  }

  if (!existing.inputId && cleanText(args.inputId)) {
    existing.inputId = cleanText(args.inputId);
  }

  const incomingQuestion = cleanText(args.questionText);

  if (
    incomingQuestion &&
    (existing.currentQuestionText === definition.questionText ||
      args.sourceLayer === "project_brief" ||
      args.sourceLayer === "architecture" ||
      args.sourceLayer === "roadmap")
  ) {
    existing.currentQuestionText = incomingQuestion;
  }

  if (!existing.currentValue && currentValue) {
    existing.currentValue = currentValue;
  }
}

function collectEquivalentProjectBriefBlockers(args: RuntimeBuildArgs) {
  const accumulators = new Map<BlockerId, QueueAccumulator>();

  for (const question of args.projectBrief.openQuestions) {
    registerCandidate({
      accumulators,
      blockerId: resolveBlockerIdFromQuestion({
        inputId: question.slotId,
        label: question.label,
        question: question.question
      }),
      label: question.label,
      inputId: question.slotId,
      questionText: question.question,
      sourceLayer: "project_brief",
      reason: question.whyItMatters,
      requiredForArchitecture: question.stage === "architecture",
      requiredForRoadmap: question.stage === "roadmap",
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }

  for (const slotId of args.projectBrief.missingCriticalSlots) {
    registerCandidate({
      accumulators,
      blockerId: resolveBlockerIdFromQuestion({
        inputId: slotId
      }),
      inputId: slotId,
      sourceLayer: "project_brief",
      reason: `${humanizeToken(slotId)} is still unresolved in the project brief.`,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }

  for (const unresolved of args.projectBrief.unresolvedDomainSpecifics) {
    registerCandidate({
      accumulators,
      blockerId: resolveBlockerIdFromQuestion({
        label: unresolved,
        question: unresolved
      }),
      label: unresolved,
      sourceLayer: "project_brief",
      reason: unresolved,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }

  return accumulators;
}

function collectArchitectureBlockers(args: RuntimeBuildArgs, accumulators: Map<BlockerId, QueueAccumulator>) {
  for (const question of args.architectureBlueprint.openQuestions) {
    registerCandidate({
      accumulators,
      blockerId: resolveBlockerIdFromQuestion({
        inputId: question.inputId,
        label: question.label,
        question: question.question
      }),
      label: question.label,
      inputId: question.inputId,
      questionText: question.question,
      sourceLayer: "architecture",
      reason: question.whyItMatters,
      requiredForArchitecture: true,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }

  for (const inputId of args.architectureBlueprint.missingCriticalArchitectureInputs) {
    registerCandidate({
      accumulators,
      blockerId: resolveBlockerIdFromQuestion({
        inputId
      }),
      inputId,
      sourceLayer: "architecture",
      reason: `${humanizeToken(inputId)} is still required before architecture can stabilize.`,
      requiredForArchitecture: true,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }
}

function collectRoadmapBlockers(args: RuntimeBuildArgs, accumulators: Map<BlockerId, QueueAccumulator>) {
  for (const question of args.roadmapPlan.openQuestions) {
    registerCandidate({
      accumulators,
      blockerId: resolveBlockerIdFromQuestion({
        inputId: question.inputId,
        label: question.label,
        question: question.question
      }),
      label: question.label,
      inputId: question.inputId,
      questionText: question.question,
      sourceLayer: "roadmap",
      reason: question.whyItMatters,
      requiredForRoadmap: true,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }

  for (const inputId of args.roadmapPlan.missingCriticalScopeInputs) {
    registerCandidate({
      accumulators,
      blockerId: resolveBlockerIdFromQuestion({
        inputId
      }),
      inputId,
      sourceLayer: "roadmap",
      reason: `${humanizeToken(inputId)} is still required before roadmap approval can stabilize.`,
      requiredForRoadmap: true,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }
}

function collectGovernanceBlockers(args: RuntimeBuildArgs, accumulators: Map<BlockerId, QueueAccumulator>) {
  for (const checklistItem of args.governancePolicy.approvalChecklist) {
    if (checklistItem.status === "satisfied") {
      continue;
    }

    registerCandidate({
      accumulators,
      blockerId: resolveGovernanceBlockerId({
        accumulators,
        label: checklistItem.label,
        reason: checklistItem.reason,
        relatedInputId: checklistItem.relatedInputId
      }),
      label: checklistItem.label,
      inputId: checklistItem.relatedInputId,
      questionText: checklistItem.label,
      sourceLayer: "governance",
      reason: checklistItem.reason,
      requiredForApproval: checklistItem.blockerLevel === "blocking",
      requiredForArchitecture: checklistItem.relatedScopeArea === "integrations",
      requiredForRoadmap:
        checklistItem.relatedScopeArea === "roadmap" ||
        checklistItem.relatedScopeArea === "product_scope",
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }

  for (const blocker of args.governancePolicy.approvalReadiness.blockers) {
    const blockerId = resolveGovernanceBlockerId({
      accumulators,
      label: blocker,
      reason: blocker,
      relatedInputId: null
    });

    if (!blockerId) {
      continue;
    }

    registerCandidate({
      accumulators,
      blockerId,
      label: blocker,
      sourceLayer: "governance",
      reason: blocker,
      requiredForApproval: true,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }
}

function deriveRevisionHintBlockersFromValue(args: {
  inputId?: string | null;
  value: string;
}) {
  const blockerIds = new Set<BlockerId>();
  const mapped =
    resolveBlockerIdFromQuestion({
      inputId: cleanText(args.inputId) || null,
      label: args.value,
      question: args.value
    }) ??
    resolveBlockerIdFromQuestion({
      label: args.value,
      question: args.value
    });

  if (mapped) {
    blockerIds.add(mapped);
  }

  for (const hint of REVISION_REOPEN_HINTS) {
    if (hint.pattern.test(args.value)) {
      for (const blockerId of hint.blockerIds) {
        blockerIds.add(blockerId);
      }
    }
  }

  return [...blockerIds];
}

function collectRevisionBlockers(args: RuntimeBuildArgs, accumulators: Map<BlockerId, QueueAccumulator>) {
  const activeRevisionId = cleanText(args.governancePolicy.currentApprovalState.activeRevisionId);
  const activeRevision =
    args.projectMetadata?.strategyState?.revisionRecords?.find(
      (record) => record.revisionId === activeRevisionId
    ) ??
    [...(args.projectMetadata?.strategyState?.revisionRecords ?? [])]
      .reverse()
      .find((record) => record.materiality === "material" && record.status === "applied");

  if (!activeRevision) {
    return;
  }

  const candidateBlockerIds = new Set<BlockerId>();

  for (const answeredInput of activeRevision.patchPayload.answeredInputs ?? []) {
    for (const blockerId of deriveRevisionHintBlockersFromValue({
      inputId: answeredInput.inputId,
      value: answeredInput.value
    })) {
      candidateBlockerIds.add(blockerId);
    }
  }

  for (const [field, value] of Object.entries(activeRevision.patchPayload.projectBrief ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        for (const blockerId of deriveRevisionHintBlockersFromValue({
          inputId: field,
          value: item
        })) {
          candidateBlockerIds.add(blockerId);
        }
      }
      continue;
    }

    if (typeof value === "string") {
      for (const blockerId of deriveRevisionHintBlockersFromValue({
        inputId: field,
        value
      })) {
        candidateBlockerIds.add(blockerId);
      }
    }
  }

  for (const blockerId of candidateBlockerIds) {
    registerCandidate({
      accumulators,
      blockerId,
      sourceLayer: "revision",
      reason: activeRevision.summary,
      requiredForApproval: activeRevision.requiresApprovalReset,
      requiredForArchitecture: false,
      requiredForRoadmap: activeRevision.requiresApprovalReset,
      projectBrief: args.projectBrief,
      projectMetadata: args.projectMetadata
    });
  }
}

function determinePriority(args: {
  blockerId: BlockerId;
  sourceLayer: BlockerQueueSourceLayer;
  requiredForApproval: boolean;
  requiredForArchitecture: boolean;
  requiredForRoadmap: boolean;
  canAskNow: boolean;
}) {
  if (!args.canAskNow) {
    return "deferred" satisfies BlockerPriority;
  }

  if (args.requiredForApproval || args.sourceLayer === "governance") {
    return "approval_critical" satisfies BlockerPriority;
  }

  if (
    args.sourceLayer === "project_brief" ||
    args.sourceLayer === "revision" ||
    getBlockerDefinition(args.blockerId)?.questionFamily === "identity" ||
    getBlockerDefinition(args.blockerId)?.questionFamily === "product" ||
    getBlockerDefinition(args.blockerId)?.questionFamily === "constraints" ||
    getBlockerDefinition(args.blockerId)?.questionFamily === "roles" ||
    getBlockerDefinition(args.blockerId)?.questionFamily === "domain_scope"
  ) {
    return "scope_defining" satisfies BlockerPriority;
  }

  if (args.requiredForArchitecture || args.sourceLayer === "architecture") {
    return "architecture_shaping" satisfies BlockerPriority;
  }

  if (args.requiredForRoadmap || args.sourceLayer === "roadmap") {
    return "roadmap_tightening" satisfies BlockerPriority;
  }

  return "secondary_enrichment" satisfies BlockerPriority;
}

function buildQueueEntry(accumulator: QueueAccumulator, unresolvedBlockers: ReadonlySet<BlockerId>) {
  const definition = getBlockerDefinition(accumulator.blockerId)!;
  const dependsOnBlockerIds = [
    ...(BLOCKER_DEPENDENCIES[accumulator.blockerId] ?? [])
  ];
  const unresolvedDependencies = dependsOnBlockerIds.filter((blockerId) =>
    unresolvedBlockers.has(blockerId)
  );
  const canAskNow = unresolvedDependencies.length === 0;
  const priority = determinePriority({
    blockerId: accumulator.blockerId,
    sourceLayer: accumulator.sourceLayer,
    requiredForApproval: accumulator.requiredForApproval,
    requiredForArchitecture: accumulator.requiredForArchitecture,
    requiredForRoadmap: accumulator.requiredForRoadmap,
    canAskNow
  });

  return blockerQueueEntrySchema.parse({
    blockerId: accumulator.blockerId,
    label: accumulator.label,
    inputId: accumulator.inputId,
    status: canAskNow ? "unresolved" : "deferred",
    priority,
    sourceLayer: accumulator.sourceLayer,
    reason: uniqueStrings([...accumulator.reasons]).join(" "),
    requiredForApproval: accumulator.requiredForApproval,
    requiredForArchitecture: accumulator.requiredForArchitecture,
    requiredForRoadmap: accumulator.requiredForRoadmap,
    currentQuestionText: accumulator.currentQuestionText || definition.questionText,
    completionCriteriaSummary:
      definition.completionCriteria[0] ?? definition.description,
    unresolvedFields: uniqueStrings([...accumulator.unresolvedFields]),
    relatedWriteTargets: [...definition.allowedWriteTargets],
    dependsOnBlockerIds,
    canAskNow,
    deferReason:
      unresolvedDependencies.length > 0
        ? `Waiting on ${unresolvedDependencies
            .map((blockerId) => getBlockerDefinition(blockerId)?.label ?? humanizeToken(blockerId))
            .join(", ")} first.`
        : null,
    currentValue: accumulator.currentValue
  });
}

export function buildBlockerQueue(args: RuntimeBuildArgs): BlockerQueue {
  const accumulators = collectEquivalentProjectBriefBlockers(args);
  collectArchitectureBlockers(args, accumulators);
  collectRoadmapBlockers(args, accumulators);
  collectGovernanceBlockers(args, accumulators);
  collectRevisionBlockers(args, accumulators);

  const unresolvedBlockers = new Set(accumulators.keys());
  const entries = [...accumulators.values()]
    .map((accumulator) => buildQueueEntry(accumulator, unresolvedBlockers))
    .sort((left, right) => {
      const priorityDelta = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      const sourceDelta =
        SOURCE_LAYER_RANK[left.sourceLayer] - SOURCE_LAYER_RANK[right.sourceLayer];

      if (sourceDelta !== 0) {
        return sourceDelta;
      }

      return (
        (BLOCKER_ORDER.get(left.blockerId) ?? Number.MAX_SAFE_INTEGER) -
        (BLOCKER_ORDER.get(right.blockerId) ?? Number.MAX_SAFE_INTEGER)
      );
    });

  return blockerQueueSchema.parse({
    entries,
    unresolvedCount: entries.filter((entry) => entry.status !== "resolved").length,
    approvalCriticalCount: entries.filter(
      (entry) => entry.requiredForApproval && entry.status !== "resolved"
    ).length
  });
}
