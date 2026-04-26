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
  normalizeProjectDirection,
  normalizeScoringInputs,
  normalizeWalletBoundary,
  splitLooseList
} from "./normalizers.ts";
import { createDeterministicProviderMetadata, type ModelProviderAdapter } from "./provider-adapter.ts";
import { getBlockerSchemaDefinition } from "./schemas.ts";
import {
  structuredAnswerExtractionResultSchema,
  structuredExtractionRequestSchema,
  type BlockerId,
  type BlockerQuestionState,
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
    allowedWriteTargets: definition.allowedWriteTargets,
    providerMetadata: createDeterministicProviderMetadata({
      notes: ["Deterministic invalid result."]
    })
  });
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
      confidence: 0.92
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
    confidence: providers.length > 0 ? 0.96 : 0.75
  });
}

function parseChainsInScope(args: DeterministicParseArgs) {
  const chains = extractCanonicalChains(args.rawAnswer);

  if (chains.length === 0) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
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
    confidence: 0.97
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
    structuredPatch: buildAnsweredInputPatch("firstPosConnector", normalized.displayValue),
    confidence: 0.98
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

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  const projectBriefPatch: NonNullable<StrategyRevisionPatch["projectBrief"]> = {};

  if (normalized.buyerPersonas.length > 0) {
    projectBriefPatch.buyerPersonas = normalized.buyerPersonas;
  }

  if (normalized.operatorPersonas.length > 0) {
    projectBriefPatch.operatorPersonas = normalized.operatorPersonas;
  }

  if (normalized.buyerPersonas.length > 0 && normalized.operatorPersonas.length > 0) {
    return buildParsedResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer,
      normalizedAnswer: normalized,
      structuredPatch: buildProjectBriefPatch(projectBriefPatch),
      confidence: 0.95
    });
  }

  return buildClarificationResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: normalized,
    structuredPatch: buildProjectBriefPatch(projectBriefPatch),
    confidence: 0.7,
    prompt:
      normalized.buyerPersonas.length > 0
        ? "I captured who buys this. Who operates it day to day?"
        : "I captured who operates it. Who buys or owns it?"
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

  if (!normalized) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
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
    confidence: normalized.provider ? 0.95 : 0.88
  });
}

function featureLabelForBlocker(blockerId: BlockerId) {
  switch (blockerId) {
    case "file_upload_requirement":
      return "file uploads";
    case "notifications_requirement":
      return "notifications";
    case "admin_console_requirement":
      return "admin console";
    case "search_filter_requirement":
      return "search and filter";
    case "dashboard_reporting_requirement":
      return "dashboard reporting";
    default:
      return "feature";
  }
}

function parseFeatureRequirement(args: DeterministicParseArgs) {
  const decision = normalizeFeatureRequirementDecision(args.rawAnswer);

  if (!decision) {
    return buildClarificationResult({
      blockerState: args.blockerState,
      rawAnswer: args.rawAnswer
    });
  }

  const featureLabel = featureLabelForBlocker(args.blockerState.blockerId);
  const patch =
    decision === "in_mvp"
      ? buildProjectBriefPatch({
          mustHaveFeatures: [featureLabel]
        })
      : buildProjectBriefPatch({
          excludedFeatures: [featureLabel]
        });

  return buildParsedResult({
    blockerState: args.blockerState,
    rawAnswer: args.rawAnswer,
    normalizedAnswer: {
      feature: featureLabel,
      decision
    },
    structuredPatch: patch,
    confidence: decision === "in_mvp" ? 0.82 : 0.9
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
    case "file_upload_requirement":
    case "notifications_requirement":
    case "admin_console_requirement":
    case "search_filter_requirement":
    case "dashboard_reporting_requirement":
      return parseFeatureRequirement(args);
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
