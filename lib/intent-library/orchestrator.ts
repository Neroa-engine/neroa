import type { ProjectBrief } from "../intelligence/project-brief.ts";
import { hasStrategyRevisionPatchContent } from "../intelligence/revisions/index.ts";
import {
  strategyRevisionPatchSchema,
  type StrategyRevisionPatch
} from "../intelligence/revisions/types.ts";
import { getBlockerDefinition } from "./blockers.ts";
import {
  cleanIntentText,
  extractCanonicalChains,
  extractCanonicalProviders,
  extractRecognizedFeatureSignals,
  formatProviderDisplay,
  getNormalizationRulesForBlocker,
  humanizeList,
  isMaybeLaterAnswer,
  isNullStyleAnswer,
  normalizeAiIntegrationBoundary,
  normalizeAnalyticsAdvicePosture,
  normalizeComplianceSensitivity,
  normalizeConstraintAnswer,
  normalizeCoreUserRoles,
  normalizeFeatureRequirementDecision,
  normalizeFirstPosConnector,
  normalizeFounderName,
  normalizeLaunchLocationModel,
  normalizeLaunchReports,
  normalizeNotificationChannels,
  normalizePricingModel,
  normalizeProjectDirection,
  normalizeScoringInputs,
  normalizeSurfaceBoundary,
  normalizeTenancyRequirement,
  normalizeWalletBoundary,
  splitLooseList
} from "./normalizers.ts";
import { createDeterministicProviderMetadata, type ModelProviderAdapter } from "./provider-adapter.ts";
import { getBlockerSchemaDefinition } from "./schemas.ts";
import {
  structuredAnswerSecondaryHintSchema,
  structuredAnswerExtractionResultSchema,
  structuredExtractionRequestSchema,
  type BlockerId,
  type BlockerQuestionState,
  type StructuredAnswerSecondaryHint,
  type StrategyWriteTarget,
  type StructuredAnswerExtractionResult
} from "./types.ts";

const ANSWERED_INPUT_TARGETS = {
  chainsInScope: "answeredInputs.chainsInScope",
  walletConnectionMvp: "answeredInputs.walletConnectionMvp",
  adviceAdjacency: "answeredInputs.adviceAdjacency",
  riskSignalSources: "answeredInputs.riskSignalSources",
  launchLocationModel: "answeredInputs.launchLocationModel",
  firstPosConnector: "answeredInputs.firstPosConnector",
  launchReports: "answeredInputs.launchReports"
} satisfies Record<string, StrategyWriteTarget>;

const PROJECT_BRIEF_TARGETS = {
  founderName: "projectBrief.founderName",
  projectName: "projectBrief.projectName",
  buyerPersonas: "projectBrief.buyerPersonas",
  operatorPersonas: "projectBrief.operatorPersonas",
  endCustomerPersonas: "projectBrief.endCustomerPersonas",
  adminPersonas: "projectBrief.adminPersonas",
  productCategory: "projectBrief.productCategory",
  problemStatement: "projectBrief.problemStatement",
  outcomePromise: "projectBrief.outcomePromise",
  mustHaveFeatures: "projectBrief.mustHaveFeatures",
  niceToHaveFeatures: "projectBrief.niceToHaveFeatures",
  excludedFeatures: "projectBrief.excludedFeatures",
  surfaces: "projectBrief.surfaces",
  integrations: "projectBrief.integrations",
  dataSources: "projectBrief.dataSources",
  constraints: "projectBrief.constraints",
  complianceFlags: "projectBrief.complianceFlags",
  trustRisks: "projectBrief.trustRisks"
} satisfies Record<string, StrategyWriteTarget>;

type DeterministicParseArgs = {
  blockerState: BlockerQuestionState;
  rawAnswer: string;
  projectBrief?: ProjectBrief | null;
};

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = value.trim().toLowerCase();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(value.trim());
  }

  return items;
}

function uniqueSecondaryHints(values: readonly StructuredAnswerSecondaryHint[]) {
  const seen = new Set<string>();
  const items: StructuredAnswerSecondaryHint[] = [];

  for (const value of values) {
    const key = `${value.blockerId}:${JSON.stringify(value.normalizedValue ?? null)}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push(value);
  }

  return items;
}

function buildSecondaryHint(args: {
  blockerId: BlockerId;
  summary: string;
  normalizedValue?: Record<string, unknown> | null;
}) {
  return structuredAnswerSecondaryHintSchema.parse({
    blockerId: args.blockerId,
    summary: args.summary,
    normalizedValue: args.normalizedValue ?? null
  });
}

function canEmitSecondaryHint(primaryBlockerId: BlockerId, secondaryBlockerId: BlockerId) {
  const definition = getBlockerDefinition(primaryBlockerId);
  return definition?.safeSecondaryHintBlockerIds.includes(secondaryBlockerId) ?? false;
}

function formatListForConstraint(values: readonly string[]) {
  return humanizeList(values.map((value) => value.trim()).filter(Boolean));
}

const CONSTRAINT_SIGNAL_PATTERN =
  /\b(?:constraint|budget|timeline|deadline|compliance|risk|hard limit|limit|flexible|blocker)\b/i;

function buildProjectBriefPatch(
  patch: NonNullable<StrategyRevisionPatch["projectBrief"]>
) {
  return strategyRevisionPatchSchema.parse({
    projectBrief: patch
  });
}

function buildAnsweredInputPatch(
  inputId: keyof typeof ANSWERED_INPUT_TARGETS,
  value: string
) {
  return strategyRevisionPatchSchema.parse({
    answeredInputs: [
      {
        inputId,
        value
      }
    ]
  });
}

function collectPatchWriteTargets(patch: StrategyRevisionPatch) {
  const targets: StrategyWriteTarget[] = [];

  for (const key of Object.keys(patch.projectBrief ?? {})) {
    const target = PROJECT_BRIEF_TARGETS[key as keyof typeof PROJECT_BRIEF_TARGETS];

    if (target) {
      targets.push(target);
    }
  }

  for (const answer of patch.answeredInputs ?? []) {
    const target = ANSWERED_INPUT_TARGETS[answer.inputId as keyof typeof ANSWERED_INPUT_TARGETS];

    if (target) {
      targets.push(target);
    }
  }

  return uniqueStrings(targets) as StrategyWriteTarget[];
}

function sanitizePatchForBlocker(args: {
  patch: StrategyRevisionPatch | null;
  allowedWriteTargets: readonly StrategyWriteTarget[];
}) {
  if (!args.patch) {
    return {
      patch: null,
      writeTargets: [] as StrategyWriteTarget[],
      blockedWriteTargets: [] as StrategyWriteTarget[]
    };
  }

  const allowed = new Set(args.allowedWriteTargets);
  const blockedWriteTargets: StrategyWriteTarget[] = [];
  const sanitizedProjectBrief: NonNullable<StrategyRevisionPatch["projectBrief"]> = {};
  const sanitizedAnsweredInputs: NonNullable<StrategyRevisionPatch["answeredInputs"]> = [];

  for (const [key, value] of Object.entries(args.patch.projectBrief ?? {})) {
    const target = PROJECT_BRIEF_TARGETS[key as keyof typeof PROJECT_BRIEF_TARGETS];

    if (!target) {
      continue;
    }

    if (allowed.has(target)) {
      sanitizedProjectBrief[key as keyof typeof sanitizedProjectBrief] = value as never;
    } else {
      blockedWriteTargets.push(target);
    }
  }

  for (const answer of args.patch.answeredInputs ?? []) {
    const target = ANSWERED_INPUT_TARGETS[answer.inputId as keyof typeof ANSWERED_INPUT_TARGETS];

    if (!target) {
      continue;
    }

    if (allowed.has(target)) {
      sanitizedAnsweredInputs.push(answer);
    } else {
      blockedWriteTargets.push(target);
    }
  }

  const patch = strategyRevisionPatchSchema.parse({
    ...(Object.keys(sanitizedProjectBrief).length > 0 ? { projectBrief: sanitizedProjectBrief } : {}),
    ...(sanitizedAnsweredInputs.length > 0 ? { answeredInputs: sanitizedAnsweredInputs } : {})
  });

  return {
    patch: hasStrategyRevisionPatchContent(patch) ? patch : null,
    writeTargets: collectPatchWriteTargets(patch),
    blockedWriteTargets: uniqueStrings(blockedWriteTargets) as StrategyWriteTarget[]
  };
}

function buildResult(args: {
  blockerId: BlockerId;
  rawAnswer: string;
  normalizedAnswer?: Record<string, unknown> | null;
  structuredPatch?: StrategyRevisionPatch | null;
  confidence: number;
  status: StructuredAnswerExtractionResult["status"];
  clarificationPrompt?: string | null;
  notes?: readonly string[];
  secondaryHints?: readonly StructuredAnswerSecondaryHint[];
  allowedWriteTargets: readonly StrategyWriteTarget[];
  providerMetadata?: StructuredAnswerExtractionResult["providerMetadata"];
}) {
  const sanitized = sanitizePatchForBlocker({
    patch: args.structuredPatch ?? null,
    allowedWriteTargets: args.allowedWriteTargets
  });

  return structuredAnswerExtractionResultSchema.parse({
    blockerId: args.blockerId,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: args.normalizedAnswer ?? null,
    structuredPatch: sanitized.patch,
    confidence: Math.max(0, Math.min(1, args.confidence)),
    status: args.status,
    clarificationPrompt: args.clarificationPrompt ?? null,
    writeTargets: sanitized.writeTargets,
    blockedWriteTargets: sanitized.blockedWriteTargets,
    secondaryHints: uniqueSecondaryHints([...(args.secondaryHints ?? [])]),
    notes: [...(args.notes ?? [])],
    providerMetadata: args.providerMetadata ?? null
  });
}

function buildClarificationResult(args: {
  blockerState: BlockerQuestionState;
  rawAnswer: string;
  normalizedAnswer?: Record<string, unknown> | null;
  structuredPatch?: StrategyRevisionPatch | null;
  confidence?: number;
  prompt?: string | null;
  notes?: readonly string[];
  secondaryHints?: readonly StructuredAnswerSecondaryHint[];
}) {
  const definition = getBlockerDefinition(args.blockerState.blockerId)!;
  return buildResult({
    blockerId: args.blockerState.blockerId,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: args.normalizedAnswer ?? null,
    structuredPatch: args.structuredPatch ?? null,
    confidence: args.confidence ?? 0.45,
    status: args.structuredPatch ? "partial" : "needs_clarification",
    clarificationPrompt: args.prompt ?? definition.defaultClarificationPrompt,
    notes: args.notes,
    secondaryHints: args.secondaryHints,
    allowedWriteTargets: definition.allowedWriteTargets,
    providerMetadata: createDeterministicProviderMetadata({
      notes: ["Deterministic clarification result."]
    })
  });
}

function buildParsedResult(args: {
  blockerState: BlockerQuestionState;
  rawAnswer: string;
  normalizedAnswer?: Record<string, unknown> | null;
  structuredPatch: StrategyRevisionPatch;
  confidence?: number;
  notes?: readonly string[];
  secondaryHints?: readonly StructuredAnswerSecondaryHint[];
}) {
  const definition = getBlockerDefinition(args.blockerState.blockerId)!;
  return buildResult({
    blockerId: args.blockerState.blockerId,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: args.normalizedAnswer ?? null,
    structuredPatch: args.structuredPatch,
    confidence: args.confidence ?? 0.92,
    status: "parsed",
    notes: args.notes,
    secondaryHints: args.secondaryHints,
    allowedWriteTargets: definition.allowedWriteTargets,
    providerMetadata: createDeterministicProviderMetadata({
      notes: ["Deterministic parse result."]
    })
  });
}

function buildInvalidResult(args: {
  blockerState: BlockerQuestionState;
  rawAnswer: string;
  prompt?: string | null;
  notes?: readonly string[];
  secondaryHints?: readonly StructuredAnswerSecondaryHint[];
}) {
  const definition = getBlockerDefinition(args.blockerState.blockerId)!;
  return buildResult({
    blockerId: args.blockerState.blockerId,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: null,
    structuredPatch: null,
    confidence: 0.1,
    status: "invalid",
    clarificationPrompt: args.prompt ?? definition.defaultClarificationPrompt,
    notes: args.notes,
    secondaryHints: args.secondaryHints,
    allowedWriteTargets: definition.allowedWriteTargets,
    providerMetadata: createDeterministicProviderMetadata({
      notes: ["Deterministic invalid result."]
    })
  });
}

function buildProjectBriefPatchFromValues(
  values: {
    [K in keyof NonNullable<StrategyRevisionPatch["projectBrief"]>]?: NonNullable<
      StrategyRevisionPatch["projectBrief"]
    >[K] extends Array<infer T>
      ? readonly T[]
      : NonNullable<StrategyRevisionPatch["projectBrief"]>[K];
  }
) {
  const patch: NonNullable<StrategyRevisionPatch["projectBrief"]> = {};

  for (const [key, rawValue] of Object.entries(values)) {
    if (rawValue == null) {
      continue;
    }

    if (typeof rawValue === "string") {
      const cleaned = rawValue.trim();

      if (!cleaned) {
        continue;
      }

      patch[key as keyof typeof patch] = cleaned as never;
      continue;
    }

    if (Array.isArray(rawValue)) {
      const cleaned = uniqueStrings(rawValue.map((value) => String(value).trim()).filter(Boolean));

      if (cleaned.length === 0) {
        continue;
      }

      patch[key as keyof typeof patch] = cleaned as never;
    }
  }

  return buildProjectBriefPatch(patch);
}

function buildFeatureRequirementPatch(args: {
  decision: "in_mvp" | "post_mvp" | "not_in_scope";
  includedFeatures?: readonly string[];
  excludedFeatures?: readonly string[];
  integrations?: readonly string[];
  surfaces?: readonly string[];
  constraints?: readonly string[];
  complianceFlags?: readonly string[];
  trustRisks?: readonly string[];
}) {
  return buildProjectBriefPatchFromValues({
    ...(args.decision === "in_mvp" && args.includedFeatures
      ? { mustHaveFeatures: [...args.includedFeatures] }
      : {}),
    ...(args.decision !== "in_mvp" && args.excludedFeatures
      ? { excludedFeatures: [...args.excludedFeatures] }
      : {}),
    ...(args.integrations ? { integrations: [...args.integrations] } : {}),
    ...(args.surfaces ? { surfaces: [...args.surfaces] } : {}),
    ...(args.constraints ? { constraints: [...args.constraints] } : {}),
    ...(args.complianceFlags ? { complianceFlags: [...args.complianceFlags] } : {}),
    ...(args.trustRisks ? { trustRisks: [...args.trustRisks] } : {})
  });
}

function filterProvidersForBlocker(blockerId: BlockerId, providers: ReturnType<typeof extractCanonicalProviders>) {
  switch (blockerId) {
    case "payments_billing_requirement":
      return providers.filter((provider) =>
        ["stripe", "quickbooks", "square_pos", "shopify"].includes(provider.canonicalId)
      );
    case "file_storage_requirement":
      return providers.filter((provider) => ["amazon_s3"].includes(provider.canonicalId));
    default:
      return providers;
  }
}

function parseFounderName(args: DeterministicParseArgs) {
  const founderName = normalizeFounderName(args.rawAnswer);

  if (!founderName) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      notes: ["The answer did not look like a short human name."]
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      founderName
    },
    structuredPatch: buildProjectBriefPatch({
      founderName
    }),
    confidence: 0.99
  });
}

function parseProjectDirection(args: DeterministicParseArgs) {
  const productCategory = normalizeProjectDirection(args.rawAnswer);

  if (!productCategory) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      productCategory
    },
    structuredPatch: buildProjectBriefPatch({
      productCategory
    }),
    confidence: 0.88
  });
}

function parseConstraints(args: DeterministicParseArgs) {
  const normalized = normalizeConstraintAnswer(args.rawAnswer);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      constraintMode: normalized.mode,
      constraints: normalized.constraints
    },
    structuredPatch: buildProjectBriefPatch({
      constraints: normalized.constraints
    }),
    confidence: normalized.mode === "none" ? 0.97 : 0.82
  });
}

function parseProvidersIntoPatch(args: DeterministicParseArgs & {
  target: "integrations" | "dataSources";
  boundaryNote: string;
}) {
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (isNullStyleAnswer(args.rawAnswer) || isMaybeLaterAnswer(args.rawAnswer)) {
    return buildParsedResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: {
        mode: "none"
      },
      structuredPatch: buildProjectBriefPatch({
        constraints: [args.boundaryNote]
      }),
      confidence: 0.92,
      secondaryHints
    });
  }

  const providers = extractCanonicalProviders(args.rawAnswer);
  const genericValues =
    providers.length > 0 ? providers.map((provider) => provider.displayName) : splitLooseList(args.rawAnswer);

  if (genericValues.length === 0) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      providers,
      values: genericValues
    },
    structuredPatch: buildProjectBriefPatch({
      [args.target]: genericValues
    }),
    confidence: providers.length > 0 ? 0.96 : 0.75,
    secondaryHints
  });
}

function parseChainsInScope(args: DeterministicParseArgs) {
  const chains = extractCanonicalChains(args.rawAnswer);
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (chains.length === 0) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      secondaryHints
    });
  }

  const displayValue =
    /\bfirst\b/i.test(args.rawAnswer) && chains.length === 1
      ? `${chains[0].displayName} first`
      : humanizeList(chains.map((chain) => chain.displayName));

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      chains
    },
    structuredPatch: buildAnsweredInputPatch("chainsInScope", displayValue),
    confidence: 0.97,
    secondaryHints
  });
}

function parseWalletBoundary(args: DeterministicParseArgs) {
  const normalized = normalizeWalletBoundary(args.rawAnswer);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildAnsweredInputPatch(
      "walletConnectionMvp",
      normalized.displayValue
    ),
    confidence: normalized.boundary === "excluded_from_mvp" ? 0.96 : 0.84
  });
}

function parseAnalyticsAdvicePosture(args: DeterministicParseArgs) {
  const normalized = normalizeAnalyticsAdvicePosture(args.rawAnswer);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildAnsweredInputPatch("adviceAdjacency", normalized.displayValue),
    confidence: normalized.posture === "analytics_only" ? 0.97 : 0.84
  });
}

function parseScoringInputs(args: DeterministicParseArgs) {
  const normalized = normalizeScoringInputs(args.rawAnswer);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildAnsweredInputPatch("riskSignalSources", humanizeList(normalized.items)),
    confidence: normalized.providers.length > 0 ? 0.94 : 0.72
  });
}

function parseFirstPosConnector(args: DeterministicParseArgs) {
  const normalized = normalizeFirstPosConnector(args.rawAnswer);
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      secondaryHints
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildAnsweredInputPatch("firstPosConnector", normalized.displayValue),
    confidence: 0.98,
    secondaryHints
  });
}

function parseLaunchLocationModel(args: DeterministicParseArgs) {
  const normalized = normalizeLaunchLocationModel(args.rawAnswer);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildAnsweredInputPatch("launchLocationModel", normalized.displayValue),
    confidence: 0.96
  });
}

function parseLaunchReports(args: DeterministicParseArgs) {
  const reports = normalizeLaunchReports(args.rawAnswer);

  if (!reports) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      reports
    },
    structuredPatch: buildAnsweredInputPatch("launchReports", humanizeList(reports)),
    confidence: 0.84
  });
}

function parseCoreUserRoles(args: DeterministicParseArgs) {
  const normalized = normalizeCoreUserRoles(args.rawAnswer);
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      secondaryHints
    });
  }

  const projectBriefPatch: NonNullable<StrategyRevisionPatch["projectBrief"]> = {};

  if (normalized.buyerPersonas.length > 0) {
    projectBriefPatch.buyerPersonas = normalized.buyerPersonas;
  }

  if (normalized.operatorPersonas.length > 0) {
    projectBriefPatch.operatorPersonas = normalized.operatorPersonas;
  }

  if (normalized.endCustomerPersonas.length > 0) {
    projectBriefPatch.endCustomerPersonas = normalized.endCustomerPersonas;
  }

  if (normalized.adminPersonas.length > 0) {
    projectBriefPatch.adminPersonas = normalized.adminPersonas;
  }

  const hasBuyer = normalized.buyerPersonas.length > 0;
  const hasOperator = normalized.operatorPersonas.length > 0;
  const hasAdmin = normalized.adminPersonas.length > 0;
  const hasEndCustomer = normalized.endCustomerPersonas.length > 0;

  if (hasBuyer && hasOperator && (hasAdmin || hasEndCustomer)) {
    return buildParsedResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: normalized,
      structuredPatch: buildProjectBriefPatch(projectBriefPatch),
      confidence: 0.95,
      secondaryHints
    });
  }

  let prompt = "I can save that once I know who buys this and who operates it day to day.";

  if (hasBuyer && !hasOperator) {
    prompt = "I captured who buys this. Who operates it day to day?";
  } else if (!hasBuyer && hasOperator) {
    prompt = "I captured who operates it. Who buys or owns it?";
  } else if (hasBuyer && hasOperator && !hasAdmin && !hasEndCustomer) {
    prompt = "I captured the buyer and operator roles. Is there also an admin or separate customer-facing login role?";
  }

  return buildClarificationResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildProjectBriefPatch(projectBriefPatch),
    confidence: 0.7,
    prompt,
    secondaryHints
  });
}

function parseComplianceSensitivity(args: DeterministicParseArgs) {
  const flags = normalizeComplianceSensitivity(args.rawAnswer);

  if (!flags) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      complianceFlags: flags
    },
    structuredPatch: buildProjectBriefPatch({
      complianceFlags: flags
    }),
    confidence: isNullStyleAnswer(args.rawAnswer) ? 0.94 : 0.82
  });
}

function parseAiIntegrationBoundary(args: DeterministicParseArgs) {
  const normalized = normalizeAiIntegrationBoundary(args.rawAnswer);
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      secondaryHints
    });
  }

  const projectBriefPatch: NonNullable<StrategyRevisionPatch["projectBrief"]> = {};

  if (normalized.provider) {
    projectBriefPatch.integrations = [normalized.provider.displayName];
    projectBriefPatch.constraints = normalized.provider.modelId
      ? [`AI model boundary: ${normalized.provider.modelId}`]
      : [`AI integration boundary: ${normalized.boundary}`];
  } else {
    projectBriefPatch.constraints = ["AI integration is not in launch scope right now"];
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      boundary: normalized.boundary,
      provider: normalized.provider
    },
    structuredPatch: buildProjectBriefPatch(projectBriefPatch),
    confidence: normalized.provider ? 0.95 : 0.88,
    secondaryHints
  });
}

function featureLabelForBlocker(blockerId: BlockerId) {
  switch (blockerId) {
    case "payments_billing_requirement":
      return "payments and billing";
    case "marketplace_listings_requirement":
      return "marketplace listings";
    case "scheduling_dispatch_requirement":
      return "scheduling and dispatch";
    case "customer_portal_requirement":
      return "customer portal";
    case "exports_requirement":
      return "exports";
    case "role_based_access_requirement":
      return "role-based access";
    case "workflow_approval_requirement":
      return "workflow approvals";
    case "document_case_intake_requirement":
      return "document intake";
    case "api_access_requirement":
      return "API access";
    case "reporting_depth_requirement":
    case "dashboard_reporting_requirement":
      return "dashboard reporting";
    case "admin_permissions_requirement":
      return "admin permissions";
    case "notification_channels":
    case "notifications_requirement":
      return "notifications";
    case "file_storage_requirement":
      return "file storage";
    case "support_human_review_requirement":
      return "human review queue";
    case "mobile_priority_requirement":
      return "mobile app";
    case "search_saved_views_requirement":
      return "saved views";
    case "audit_trail_requirement":
      return "audit trail";
    case "file_upload_requirement":
      return "file uploads";
    case "admin_console_requirement":
      return "admin console";
    case "search_filter_requirement":
      return "search and filter";
    default:
      return "feature";
  }
}

function collectSecondaryHintsForAnswer(args: {
  blockerState: BlockerQuestionState;
  rawAnswer: string;
}) {
  const primaryBlockerId = args.blockerState.blockerId;
  const hints: StructuredAnswerSecondaryHint[] = [];

  if (canEmitSecondaryHint(primaryBlockerId, "constraints")) {
    const normalizedConstraint = normalizeConstraintAnswer(args.rawAnswer);

    if (normalizedConstraint && CONSTRAINT_SIGNAL_PATTERN.test(args.rawAnswer)) {
      hints.push(
        buildSecondaryHint({
          blockerId: "constraints",
          summary: `Possible constraint signal: ${formatListForConstraint(
            normalizedConstraint.constraints
          )}`,
          normalizedValue: {
            constraintMode: normalizedConstraint.mode,
            constraints: normalizedConstraint.constraints
          }
        })
      );
    }
  }

  if (canEmitSecondaryHint(primaryBlockerId, "analytics_vs_advice_posture")) {
    const normalizedPosture = normalizeAnalyticsAdvicePosture(args.rawAnswer);

    if (normalizedPosture) {
      hints.push(
        buildSecondaryHint({
          blockerId: "analytics_vs_advice_posture",
          summary: `Possible posture signal: ${normalizedPosture.displayValue}`,
          normalizedValue: normalizedPosture
        })
      );
    }
  }

  if (canEmitSecondaryHint(primaryBlockerId, "ai_integration_boundary")) {
    const normalizedAiBoundary = normalizeAiIntegrationBoundary(args.rawAnswer);

    if (normalizedAiBoundary?.provider) {
      hints.push(
        buildSecondaryHint({
          blockerId: "ai_integration_boundary",
          summary: `Possible AI provider boundary: ${normalizedAiBoundary.provider.displayName}`,
          normalizedValue: normalizedAiBoundary
        })
      );
    }
  }

  if (canEmitSecondaryHint(primaryBlockerId, "wallet_boundary")) {
    const normalizedWallet = normalizeWalletBoundary(args.rawAnswer);

    if (normalizedWallet) {
      hints.push(
        buildSecondaryHint({
          blockerId: "wallet_boundary",
          summary: `Possible wallet boundary: ${normalizedWallet.displayValue}`,
          normalizedValue: normalizedWallet
        })
      );
    }
  }

  if (canEmitSecondaryHint(primaryBlockerId, "launch_location_model")) {
    const normalizedLocation = normalizeLaunchLocationModel(args.rawAnswer);

    if (normalizedLocation) {
      hints.push(
        buildSecondaryHint({
          blockerId: "launch_location_model",
          summary: `Possible launch location model: ${normalizedLocation.displayValue}`,
          normalizedValue: normalizedLocation
        })
      );
    }
  }

  if (canEmitSecondaryHint(primaryBlockerId, "mobile_priority_requirement")) {
    const normalizedSurface = normalizeSurfaceBoundary(args.rawAnswer);

    if (normalizedSurface?.surfaceMode === "mobile_later" || normalizedSurface?.surfaceMode === "mobile_first") {
      hints.push(
        buildSecondaryHint({
          blockerId: "mobile_priority_requirement",
          summary: `Possible mobile priority signal: ${normalizedSurface.displayValue}`,
          normalizedValue: normalizedSurface
        })
      );
    }
  }

  if (canEmitSecondaryHint(primaryBlockerId, "pricing_model")) {
    const normalizedPricing = normalizePricingModel(args.rawAnswer);

    if (normalizedPricing) {
      hints.push(
        buildSecondaryHint({
          blockerId: "pricing_model",
          summary: `Possible pricing model: ${normalizedPricing.displayValue}`,
          normalizedValue: normalizedPricing
        })
      );
    }
  }

  if (canEmitSecondaryHint(primaryBlockerId, "exports_requirement")) {
    const normalizedFeatureDecision = normalizeFeatureRequirementDecision(args.rawAnswer, {
      treatRecognizedSignalsAsInMvp: /\bexports?\b|\bcsv\b|\bpdf\b/i.test(args.rawAnswer)
    });

    if (normalizedFeatureDecision && /\bexports?\b|\bcsv\b|\bpdf\b/i.test(args.rawAnswer)) {
      hints.push(
        buildSecondaryHint({
          blockerId: "exports_requirement",
          summary: "Possible exports requirement captured in the same answer.",
          normalizedValue: {
            decision: normalizedFeatureDecision
          }
        })
      );
    }
  }

  if (canEmitSecondaryHint(primaryBlockerId, "search_saved_views_requirement")) {
    const normalizedFeatureDecision = normalizeFeatureRequirementDecision(args.rawAnswer, {
      treatRecognizedSignalsAsInMvp: /\bwatchlists?\b|\bwatchlist\b|\bsaved views?\b|\bsaved search\b/i.test(
        args.rawAnswer
      )
    });

    if (
      normalizedFeatureDecision &&
      /\bwatchlists?\b|\bwatchlist\b|\bsaved views?\b|\bsaved search\b/i.test(args.rawAnswer)
    ) {
      hints.push(
        buildSecondaryHint({
          blockerId: "search_saved_views_requirement",
          summary: "Possible saved-views or watchlist requirement captured in the same answer.",
          normalizedValue: {
            decision: normalizedFeatureDecision
          }
        })
      );
    }
  }

  return uniqueSecondaryHints(hints);
}

function parsePricingModel(args: DeterministicParseArgs) {
  const normalized = normalizePricingModel(args.rawAnswer);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildProjectBriefPatchFromValues({
      constraints: [`Pricing model: ${normalized.displayValue}`]
    }),
    confidence: 0.9
  });
}

function parseProviderRequirement(args: DeterministicParseArgs) {
  const featureLabel = featureLabelForBlocker(args.blockerState.blockerId);
  const providers = filterProvidersForBlocker(
    args.blockerState.blockerId,
    extractCanonicalProviders(args.rawAnswer)
  );
  const recognizedFeatures = extractRecognizedFeatureSignals(args.rawAnswer);
  const decision = normalizeFeatureRequirementDecision(args.rawAnswer, {
    treatRecognizedSignalsAsInMvp: providers.length > 0 || recognizedFeatures.length > 0
  });
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (!decision && providers.length === 0 && recognizedFeatures.length === 0) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      secondaryHints
    });
  }

  const patchValues: Partial<NonNullable<StrategyRevisionPatch["projectBrief"]>> = {};

  if (providers.length > 0) {
    patchValues.integrations = providers.map((provider) => formatProviderDisplay(provider));
  }

  if (decision === "in_mvp") {
    patchValues.mustHaveFeatures = [featureLabel];
  } else if (decision) {
    patchValues.excludedFeatures = [featureLabel];
  }

  if (!decision && providers.length > 0) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: {
        providers,
        recognizedFeatures
      },
      structuredPatch: buildProjectBriefPatchFromValues(patchValues),
      confidence: 0.72,
      prompt: `I captured ${formatListForConstraint(
        providers.map((provider) => provider.displayName)
      )}. Should ${featureLabel} ship in MVP or later?`,
      secondaryHints
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      decision,
      providers,
      recognizedFeatures
    },
    structuredPatch: buildProjectBriefPatchFromValues(patchValues),
    confidence: providers.length > 0 ? 0.93 : 0.84,
    secondaryHints
  });
}

function parseSurfaceRequirement(args: DeterministicParseArgs) {
  const featureLabel = featureLabelForBlocker(args.blockerState.blockerId);
  const surfaceBoundary = normalizeSurfaceBoundary(args.rawAnswer);
  const decision = normalizeFeatureRequirementDecision(args.rawAnswer, {
    treatRecognizedSignalsAsInMvp: Boolean(
      surfaceBoundary?.surfaceMode || /\bcustomer portal\b|\bcustomer login\b|\bmobile\b/i.test(args.rawAnswer)
    )
  });
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (!surfaceBoundary && !decision) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      secondaryHints
    });
  }

  if (args.blockerState.blockerId === "public_vs_internal_surface") {
    if (!surfaceBoundary) {
      return buildClarificationResult({
        blockerState: args.blockerState,
        rawAnswer: args.rawAnswer,
        secondaryHints
      });
    }

    return buildParsedResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: surfaceBoundary,
      structuredPatch: buildProjectBriefPatchFromValues({
        surfaces: surfaceBoundary.surfaces.length > 0 ? surfaceBoundary.surfaces : [surfaceBoundary.displayValue]
      }),
      confidence: 0.92,
      secondaryHints
    });
  }

  const patchValues: Partial<NonNullable<StrategyRevisionPatch["projectBrief"]>> = {
    ...(surfaceBoundary?.surfaces?.length ? { surfaces: surfaceBoundary.surfaces } : {})
  };

  if (decision === "in_mvp" && args.blockerState.blockerId === "customer_portal_requirement") {
    patchValues.mustHaveFeatures = [featureLabel];
  } else if (decision && decision !== "in_mvp") {
    patchValues.excludedFeatures = [featureLabel];
  }

  if (
    args.blockerState.blockerId === "mobile_priority_requirement" &&
    surfaceBoundary &&
    (surfaceBoundary.surfaceMode === "mobile_later" || surfaceBoundary.surfaceMode === "desktop_primary")
  ) {
    patchValues.constraints = [`Mobile priority: ${surfaceBoundary.displayValue}`];
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      decision,
      surfaceBoundary
    },
    structuredPatch: buildProjectBriefPatchFromValues(patchValues),
    confidence: surfaceBoundary?.surfaceMode === "mobile_later" ? 0.88 : 0.93,
    secondaryHints
  });
}

function parseTenancyRequirement(args: DeterministicParseArgs) {
  const normalized = normalizeTenancyRequirement(args.rawAnswer);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildProjectBriefPatchFromValues({
      constraints: [`Tenancy model: ${normalized.displayValue}`]
    }),
    confidence: 0.9
  });
}

function parseNotificationChannelsRequirement(args: DeterministicParseArgs) {
  const normalized = normalizeNotificationChannels(args.rawAnswer);

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  const patchValues: Partial<NonNullable<StrategyRevisionPatch["projectBrief"]>> = {};

  if (normalized.decision === "in_mvp") {
    patchValues.mustHaveFeatures = ["notifications"];
  } else {
    patchValues.excludedFeatures = ["notifications"];
  }

  if (normalized.channels.length > 0) {
    patchValues.constraints = [
      `Notification channels: ${formatListForConstraint(normalized.channels)}`
    ];
  }

  if (normalized.decision === "in_mvp" && normalized.channels.length === 0) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: normalized,
      structuredPatch: buildProjectBriefPatchFromValues(patchValues),
      confidence: 0.72,
      prompt: "I captured that notifications are in scope. Which channels matter first?"
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildProjectBriefPatchFromValues(patchValues),
    confidence: normalized.channels.length > 0 ? 0.94 : 0.86
  });
}

function parseReportingDepthRequirement(args: DeterministicParseArgs) {
  const reports = normalizeLaunchReports(args.rawAnswer);
  const decision = normalizeFeatureRequirementDecision(args.rawAnswer, {
    treatRecognizedSignalsAsInMvp: Boolean(reports && reports.length > 0)
  });
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (!reports && !decision) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      secondaryHints
    });
  }

  const patch = buildFeatureRequirementPatch({
    decision: decision ?? "in_mvp",
    includedFeatures: ["dashboard reporting"],
    excludedFeatures: ["dashboard reporting"]
  });

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      decision: decision ?? "in_mvp",
      reports: reports ?? []
    },
    structuredPatch: patch,
    confidence: reports && reports.length > 0 ? 0.91 : 0.82,
    secondaryHints
  });
}

function parseCoreAccessFeatureRequirement(args: DeterministicParseArgs) {
  const featureLabel = featureLabelForBlocker(args.blockerState.blockerId);
  const normalizedRoles = normalizeCoreUserRoles(args.rawAnswer);
  const decision = normalizeFeatureRequirementDecision(args.rawAnswer, {
    treatRecognizedSignalsAsInMvp: Boolean(normalizedRoles)
  });

  if (!normalizedRoles && !decision) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  const patch = buildFeatureRequirementPatch({
    decision: decision ?? "in_mvp",
    includedFeatures: [featureLabel],
    excludedFeatures: [featureLabel]
  });

  if (normalizedRoles && !decision) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: {
        roles: normalizedRoles
      },
      structuredPatch: patch,
      confidence: 0.7,
      prompt: "I captured the access pattern. Should role-based access ship in MVP or later?"
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      decision: decision ?? "in_mvp",
      roles: normalizedRoles
    },
    structuredPatch: patch,
    confidence: normalizedRoles ? 0.88 : 0.82
  });
}

function parseGenericFeatureRequirement(args: DeterministicParseArgs) {
  const featureLabel = featureLabelForBlocker(args.blockerState.blockerId);
  const recognizedFeatures = extractRecognizedFeatureSignals(args.rawAnswer);
  const decision = normalizeFeatureRequirementDecision(args.rawAnswer, {
    treatRecognizedSignalsAsInMvp:
      recognizedFeatures.length > 0 ||
      new RegExp(featureLabel.replace(/\s+/g, "\\s+"), "i").test(args.rawAnswer)
  });
  const secondaryHints = collectSecondaryHintsForAnswer(args);

  if (!decision) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      secondaryHints
    });
  }

  const patch = buildFeatureRequirementPatch({
    decision,
    includedFeatures: [featureLabel],
    excludedFeatures: [featureLabel],
    ...(args.blockerState.blockerId === "audit_trail_requirement" && decision === "in_mvp"
      ? { complianceFlags: ["Audit trail review required"] }
      : {}),
    ...(args.blockerState.blockerId === "support_human_review_requirement" && decision === "in_mvp"
      ? { trustRisks: ["Human review required in launch workflow"] }
      : {})
  });

  if (args.blockerState.blockerId === "exports_requirement" && decision === "in_mvp" && !/\bcsv\b|\bpdf\b/i.test(args.rawAnswer)) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: {
        decision,
        recognizedFeatures
      },
      structuredPatch: patch,
      confidence: 0.74,
      prompt: "I captured that exports are in scope. Do CSV, PDF, or both matter first?",
      secondaryHints
    });
  }

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      feature: featureLabel,
      decision,
      recognizedFeatures
    },
    structuredPatch: patch,
    confidence: decision === "in_mvp" ? 0.86 : 0.9,
    secondaryHints
  });
}

function deterministicParse(args: DeterministicParseArgs) {
  switch (args.blockerState.blockerId) {
    case "founder_name":
      return parseFounderName(args);
    case "project_direction":
      return parseProjectDirection(args);
    case "constraints":
      return parseConstraints(args);
    case "integrations":
      return parseProvidersIntoPatch({
        ...args,
        target: "integrations",
        boundaryNote: "No required integrations identified right now"
      });
    case "data_sources":
      return parseProvidersIntoPatch({
        ...args,
        target: "dataSources",
        boundaryNote: "No required external data sources identified right now"
      });
    case "chains_in_scope":
      return parseChainsInScope(args);
    case "wallet_boundary":
      return parseWalletBoundary(args);
    case "analytics_vs_advice_posture":
      return parseAnalyticsAdvicePosture(args);
    case "scoring_inputs":
      return parseScoringInputs(args);
    case "first_pos_connector":
      return parseFirstPosConnector(args);
    case "launch_location_model":
      return parseLaunchLocationModel(args);
    case "launch_reports":
      return parseLaunchReports(args);
    case "core_user_roles":
      return parseCoreUserRoles(args);
    case "compliance_sensitivity":
      return parseComplianceSensitivity(args);
    case "ai_integration_boundary":
      return parseAiIntegrationBoundary(args);
    case "pricing_model":
      return parsePricingModel(args);
    case "payments_billing_requirement":
    case "file_storage_requirement":
      return parseProviderRequirement(args);
    case "customer_portal_requirement":
    case "mobile_priority_requirement":
    case "public_vs_internal_surface":
      return parseSurfaceRequirement(args);
    case "multi_tenancy_requirement":
      return parseTenancyRequirement(args);
    case "notification_channels":
      return parseNotificationChannelsRequirement(args);
    case "reporting_depth_requirement":
      return parseReportingDepthRequirement(args);
    case "role_based_access_requirement":
      return parseCoreAccessFeatureRequirement(args);
    case "marketplace_listings_requirement":
    case "scheduling_dispatch_requirement":
    case "workflow_approval_requirement":
    case "document_case_intake_requirement":
    case "api_access_requirement":
    case "admin_permissions_requirement":
    case "support_human_review_requirement":
    case "search_saved_views_requirement":
    case "audit_trail_requirement":
    case "file_upload_requirement":
    case "notifications_requirement":
    case "admin_console_requirement":
    case "exports_requirement":
    case "search_filter_requirement":
    case "dashboard_reporting_requirement":
      return parseGenericFeatureRequirement(args);
    default:
      return buildInvalidResult({
        blockerState: args.blockerState,
        rawAnswer: args.rawAnswer,
        notes: ["No deterministic parser exists for this blocker."]
      });
  }
}

export async function extractStructuredAnswerForBlocker(args: {
  blockerState: BlockerQuestionState;
  rawAnswer: string;
  projectBrief?: ProjectBrief | null;
  providerAdapter?: ModelProviderAdapter | null;
}) {
  const blocker = getBlockerDefinition(args.blockerState.blockerId);
  const schema = blocker ? getBlockerSchemaDefinition(blocker.schemaId) : null;

  if (!blocker || !schema) {
    return buildInvalidResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      prompt: "Neroa could not map that answer to the current blocker yet. Please clarify it in one short sentence.",
      notes: ["Missing blocker definition or schema."]
    });
  }

  const deterministic = deterministicParse({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    projectBrief: args.projectBrief ?? null
  });

  if (
    deterministic.status === "parsed" ||
    deterministic.status === "partial" ||
    !args.providerAdapter
  ) {
    return deterministic;
  }

  const providerRequest = structuredExtractionRequestSchema.parse({
    blocker,
    blockerState: args.blockerState,
    schema,
    rawAnswer: cleanIntentText(args.rawAnswer),
    normalizedAnswerPreview: deterministic.normalizedAnswer,
    allowedWriteTargets: blocker.allowedWriteTargets,
    blockedWriteTargets: blocker.disallowedSlotTargets,
    knownProjectSignals: uniqueStrings([
      args.projectBrief?.projectName ?? "",
      args.projectBrief?.productCategory ?? "",
      args.projectBrief?.problemStatement ?? "",
      ...(args.projectBrief?.mustHaveFeatures ?? [])
    ])
  });

  try {
    const providerResult = await args.providerAdapter.extractStructuredAnswer(providerRequest);
    const sanitized = buildResult({
      blockerId: providerResult.blockerId,
      rawAnswer: providerResult.rawAnswer,
      normalizedAnswer: providerResult.normalizedAnswer,
      structuredPatch: providerResult.structuredPatch,
      confidence: providerResult.confidence,
      status: providerResult.status,
      clarificationPrompt:
        providerResult.clarificationPrompt ?? deterministic.clarificationPrompt,
      notes: [...deterministic.notes, ...providerResult.notes],
      secondaryHints: [...deterministic.secondaryHints, ...providerResult.secondaryHints],
      allowedWriteTargets: blocker.allowedWriteTargets,
      providerMetadata: providerResult.providerMetadata
    });

    return sanitized;
  } catch (error) {
    return buildResult({
      blockerId: args.blockerState.blockerId,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: deterministic.normalizedAnswer,
      structuredPatch: deterministic.structuredPatch,
      confidence: deterministic.confidence,
      status: deterministic.status === "invalid" ? "invalid" : "failed",
      clarificationPrompt:
        deterministic.clarificationPrompt ??
        "Neroa could not apply that answer yet. Please clarify it in one short sentence.",
      notes: [
        ...deterministic.notes,
        error instanceof Error ? error.message : "Provider extraction failed."
      ],
      secondaryHints: deterministic.secondaryHints,
      allowedWriteTargets: blocker.allowedWriteTargets,
      providerMetadata: createDeterministicProviderMetadata({
        providerId: args.providerAdapter.providerId,
        modelId: args.providerAdapter.modelId,
        notes: ["Provider extraction failed before a safe patch could be applied."]
      })
    });
  }
}

export function buildStrategyThreadClarificationMessage(result: StructuredAnswerExtractionResult) {
  if (result.status === "parsed") {
    return null;
  }

  const prompt = result.clarificationPrompt?.trim();

  if (prompt?.includes("?")) {
    return prompt;
  }

  const definition = getBlockerDefinition(result.blockerId);

  if (definition?.questionText) {
    return definition.questionText;
  }

  return prompt || "Neroa could not apply that answer yet. Please clarify.";
}

export function resultHasSafePatch(result: StructuredAnswerExtractionResult) {
  return Boolean(result.structuredPatch && hasStrategyRevisionPatchContent(result.structuredPatch));
}
