import { z } from "zod";
import type { HiddenIntelligenceBundle } from "@/lib/intelligence/adapters";
import type { ConversationSessionState } from "@/lib/intelligence/conversation";
import type { GuidedBuildSession } from "@/lib/onboarding/build-session";
import type { MobileAppWorkspaceBlueprint } from "@/lib/onboarding/mobile-app-intake";
import type { SaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import {
  getSystemArchetypeDefinition,
  resolveSystemArchetype,
  systemArchetypeSchema,
  mergeProjectBriefSlotSets,
  type SystemArchetype
} from "./archetypes.ts";
import {
  capabilityProfileSchema,
  getCapabilityDefinitions,
  resolveCapabilityProfile,
  type CapabilityProfile,
  type CapabilityTag
} from "./capability-profile.ts";
import {
  domainOpenQuestionTemplateSchema,
  domainPackIdSchema,
  type DomainOpenQuestionTemplate,
  type DomainPackId,
  type ProjectBriefSlotId
} from "./domain-contracts.ts";
import {
  DOMAIN_PACKS,
  domainPackSchema,
  getDomainPack,
  type DomainPack
} from "./domain-packs.ts";

const trimmedStringSchema = z.string().trim().min(1);

export const verticalOverlaySchema = domainPackSchema;
export type VerticalOverlay = z.infer<typeof verticalOverlaySchema>;

export const archetypeResolutionCandidateSchema = z
  .object({
    archetype: systemArchetypeSchema,
    score: z.number().min(0),
    matchedSignals: z.array(trimmedStringSchema)
  })
  .strict();

export const archetypeResolutionResultSchema = z
  .object({
    systemArchetype: systemArchetypeSchema,
    archetypeConfidence: z.number().min(0).max(1),
    matchedSignals: z.array(trimmedStringSchema),
    candidates: z.array(archetypeResolutionCandidateSchema)
  })
  .strict();

export type ArchetypeResolutionResult = z.infer<
  typeof archetypeResolutionResultSchema
>;

export const overlayResolutionCandidateSchema = z
  .object({
    domainPackId: domainPackIdSchema,
    score: z.number().min(0),
    matchedHints: z.array(trimmedStringSchema),
    confidence: z.number().min(0).max(1)
  })
  .strict();

export const overlayResolutionResultSchema = z
  .object({
    primaryDomainPack: domainPackIdSchema,
    matchedOverlays: z.array(domainPackIdSchema),
    overlayConfidence: z.number().min(0).max(1),
    matchedHints: z.array(trimmedStringSchema),
    candidates: z.array(overlayResolutionCandidateSchema)
  })
  .strict();

export type OverlayResolutionResult = z.infer<
  typeof overlayResolutionResultSchema
>;

export const domainGeneralizationResultSchema = z
  .object({
    systemArchetype: systemArchetypeSchema,
    archetypeConfidence: z.number().min(0).max(1),
    capabilityProfile: capabilityProfileSchema,
    matchedOverlays: z.array(domainPackIdSchema),
    primaryDomainPack: domainPackIdSchema,
    overlayConfidence: z.number().min(0).max(1),
    unresolvedDomainSpecifics: z.array(trimmedStringSchema),
    assumptionsMade: z.array(trimmedStringSchema),
    classificationNotes: z.array(trimmedStringSchema),
    summary: trimmedStringSchema
  })
  .strict();

export type DomainGeneralizationResult = z.infer<
  typeof domainGeneralizationResultSchema
>;

export type DomainGeneralizationInput = {
  projectName?: string | null;
  projectDescription?: string | null;
  conversationState?: ConversationSessionState | null;
  hiddenBundle?: HiddenIntelligenceBundle | null;
  buildSession?: GuidedBuildSession | null;
  saasIntake?: SaasWorkspaceBlueprint | null;
  mobileAppIntake?: MobileAppWorkspaceBlueprint | null;
  explicitDomainPack?: DomainPackId | null;
};

export type DomainGeneralizationSignals = {
  corpusParts: string[];
  corpus: string;
  productCategory: string | null;
  problemStatement: string | null;
  outcomePromise: string | null;
  mustHaveFeatures: string[];
  surfaces: string[];
  integrations: string[];
  dataSources: string[];
  constraints: string[];
};

export type DomainGuidanceModel = {
  primaryDomainPack: DomainPackId;
  primaryOverlay: DomainPack;
  matchedOverlayPacks: DomainPack[];
  systemArchetype: SystemArchetype;
  capabilityProfile: CapabilityProfile;
  productCategoryLabel: string;
  defaultSurfaces: string[];
  featureDefaults: {
    mustHave: string[];
    niceToHave: string[];
    excluded: string[];
  };
  likelyIntegrationDefaults: string[];
  likelyDataSourceDefaults: string[];
  complianceFlagDefaults: string[];
  trustRiskDefaults: string[];
  openQuestionTemplates: DomainOpenQuestionTemplate[];
  requiredSlotsBeforeArchitectureGeneration: ProjectBriefSlotId[];
  requiredSlotsBeforeRoadmapApproval: ProjectBriefSlotId[];
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

function appendListBucket(bucket: string[], values?: readonly string[] | null) {
  if (!values) {
    return;
  }

  appendTextBucket(bucket, [...values]);
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

function bundleFieldSummary(
  bundle: HiddenIntelligenceBundle | null | undefined,
  fieldKey:
    | "product_type"
    | "core_concept"
    | "problem_statement"
    | "desired_outcome"
    | "primary_users"
    | "primary_buyers"
    | "primary_admins"
    | "mvp_in_scope"
    | "integrations"
    | "data_dependencies"
    | "constraints"
) {
  return bundle?.extractionState.fields[fieldKey].value?.summary ?? null;
}

function bundleFieldList(
  bundle: HiddenIntelligenceBundle | null | undefined,
  fieldKey:
    | "primary_users"
    | "primary_buyers"
    | "primary_admins"
    | "mvp_in_scope"
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
    | "compliance_security_sensitivity"
) {
  return cleanText(bundle?.extractionState.fields[fieldKey].value?.summary);
}

function partitionSystems(values: readonly string[]) {
  const integrations: string[] = [];
  const dataSources: string[] = [];

  for (const value of values) {
    const normalized = value.toLowerCase();

    if (
      /\b(?:data|signal|feed|source|metrics|sales data|menu-item|holder|liquidity|metadata|transactions?|records?|cases?)\b/.test(
        normalized
      )
    ) {
      dataSources.push(value);
      continue;
    }

    if (
      /\b(?:connector|integration|wallet|stripe|toast|square|clover|pos|provider|supabase|api|payment|calendar)\b/.test(
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

export function collectDomainGeneralizationSignals(
  args: DomainGeneralizationInput
): DomainGeneralizationSignals {
  const buckets: string[] = [];

  appendTextBucket(buckets, [
    args.projectName,
    args.projectDescription,
    args.conversationState?.founderName,
    args.conversationState?.productCategory,
    args.conversationState?.problemStatement,
    args.conversationState?.outcomePromise,
    args.conversationState?.monetization,
    args.buildSession?.scope.title,
    args.buildSession?.scope.summary,
    args.buildSession?.scope.problem,
    args.buildSession?.scope.audience,
    args.buildSession?.scope.targetUsers,
    args.buildSession?.scope.businessGoal,
    args.buildSession?.scope.projectDefinitionSummary,
    args.buildSession?.scope.businessDirectionSummary,
    args.buildSession?.scope.coreWorkflow,
    args.saasIntake?.projectName,
    args.saasIntake?.projectSummary,
    args.saasIntake?.answers.customer,
    args.saasIntake?.answers.problem,
    args.saasIntake?.answers.features,
    args.mobileAppIntake?.projectName,
    args.mobileAppIntake?.projectSummary,
    args.mobileAppIntake?.answers.audience,
    args.mobileAppIntake?.answers.deviceFeatures,
    args.mobileAppIntake?.answers.mvpVersion,
    bundleFieldSummary(args.hiddenBundle, "product_type"),
    bundleFieldSummary(args.hiddenBundle, "core_concept"),
    bundleFieldSummary(args.hiddenBundle, "problem_statement"),
    bundleFieldSummary(args.hiddenBundle, "desired_outcome"),
    bundleFieldSummary(args.hiddenBundle, "primary_users"),
    bundleFieldSummary(args.hiddenBundle, "primary_buyers"),
    bundleFieldSummary(args.hiddenBundle, "primary_admins"),
    bundleFieldSummary(args.hiddenBundle, "mvp_in_scope"),
    bundleFieldSummary(args.hiddenBundle, "integrations"),
    bundleFieldSummary(args.hiddenBundle, "data_dependencies"),
    bundleFieldSummary(args.hiddenBundle, "constraints"),
    args.hiddenBundle?.extractionState.requestSummary.requestedChangeOrInitiative
  ]);

  const mustHaveFeatures = uniqueStrings([
    ...(args.conversationState?.mustHaveFeatures ?? []),
    ...(args.conversationState?.niceToHaveFeatures ?? []),
    ...(args.buildSession?.scope.keyFeatures ?? []),
    ...(args.buildSession?.scope.coreFeatures ?? []),
    ...(args.buildSession?.scope.firstBuild ?? []),
    ...(args.saasIntake?.mvpFeatureList ?? []),
    ...(args.mobileAppIntake?.featureList ?? []),
    ...(args.mobileAppIntake?.screenList ?? []),
    ...bundleFieldList(args.hiddenBundle, "mvp_in_scope")
  ]);
  appendListBucket(buckets, mustHaveFeatures);

  const surfaces = uniqueStrings([
    ...(args.mobileAppIntake ? ["mobile app"] : []),
    ...bundleFieldList(args.hiddenBundle, "primary_surfaces"),
    ...(cleanText(args.buildSession?.scope.surfaceType)
      ? [args.buildSession?.scope.surfaceType as string]
      : [])
  ]);
  appendListBucket(buckets, surfaces);

  const explicitSystems = uniqueStrings([
    ...(args.conversationState?.integrationsAndDataSources ?? []),
    ...(args.buildSession?.scope.integrationNeeds ?? []),
    ...bundleFieldList(args.hiddenBundle, "integrations"),
    ...bundleFieldList(args.hiddenBundle, "data_dependencies")
  ]);
  const partitionedSystems = partitionSystems(explicitSystems);
  appendListBucket(buckets, partitionedSystems.integrations);
  appendListBucket(buckets, partitionedSystems.dataSources);

  const constraints = uniqueStrings([
    ...(args.conversationState?.constraintsAndCompliance ?? []),
    ...bundleFieldList(args.hiddenBundle, "constraints"),
    ...(cleanText(bundleFieldText(args.hiddenBundle, "compliance_security_sensitivity"))
      ? [bundleFieldText(args.hiddenBundle, "compliance_security_sensitivity")]
      : [])
  ]);
  appendListBucket(buckets, constraints);

  const productCategory = cleanText(
    args.conversationState?.productCategory ||
      args.buildSession?.scope.productTypeLabel ||
      args.buildSession?.scope.buildTypeLabel ||
      args.saasIntake?.answers.productSummary ||
      args.mobileAppIntake?.answers.appSummary ||
      bundleFieldText(args.hiddenBundle, "product_type")
  );
  const problemStatement = cleanText(
    args.conversationState?.problemStatement ||
      args.buildSession?.scope.problem ||
      args.saasIntake?.answers.problem ||
      bundleFieldText(args.hiddenBundle, "problem_statement")
  );
  const outcomePromise = cleanText(
    args.conversationState?.outcomePromise ||
      args.buildSession?.scope.businessGoal ||
      args.mobileAppIntake?.answers.proofOutcome ||
      bundleFieldText(args.hiddenBundle, "desired_outcome")
  );

  appendListBucket(buckets, args.conversationState?.audience.buyerPersonas);
  appendListBucket(buckets, args.conversationState?.audience.operatorPersonas);
  appendListBucket(buckets, args.conversationState?.audience.endCustomerPersonas);
  appendListBucket(buckets, args.conversationState?.audience.adminPersonas);
  appendListBucket(buckets, splitAudienceText(args.buildSession?.scope.audience));
  appendListBucket(buckets, splitAudienceText(args.buildSession?.scope.targetUsers));
  appendListBucket(buckets, splitAudienceText(args.saasIntake?.answers.customer));
  appendListBucket(buckets, splitAudienceText(args.mobileAppIntake?.answers.audience));

  const corpusParts = uniqueStrings(buckets);

  return {
    corpusParts,
    corpus: corpusParts.join(" "),
    productCategory: productCategory || null,
    problemStatement: problemStatement || null,
    outcomePromise: outcomePromise || null,
    mustHaveFeatures,
    surfaces,
    integrations: partitionedSystems.integrations,
    dataSources: partitionedSystems.dataSources,
    constraints
  };
}

function scoreOverlayPack(pack: DomainPack, signalCorpus: string, hasSaasSignal: boolean) {
  const matchedHints: string[] = [];
  let score = 0;

  for (const phrase of pack.triggerPhrases) {
    if (!signalCorpus.includes(phrase.toLowerCase())) {
      continue;
    }

    matchedHints.push(phrase);
    score += phrase.includes(" ") ? 4 : 2.5;
  }

  for (const hint of pack.detectionHints) {
    if (!signalCorpus.includes(hint.toLowerCase())) {
      continue;
    }

    matchedHints.push(hint);
    score += 1.25;
  }

  if (pack.id === "generic_saas" && hasSaasSignal) {
    matchedHints.push("generic saas signal");
    score += 2;
  }

  if (pack.id !== "generic_saas" && matchedHints.length > 0 && hasSaasSignal) {
    score += 0.75;
  }

  const confidence =
    pack.id === "generic_saas"
      ? hasSaasSignal
        ? 0.58
        : 0.42
      : Math.max(0.6, Math.min(0.97, score / 12));

  return {
    domainPackId: pack.id,
    score,
    matchedHints: uniqueStrings(matchedHints),
    confidence
  };
}

export function resolveOverlays(args: {
  signals: DomainGeneralizationSignals;
  explicitDomainPack?: DomainPackId | null;
}) {
  if (args.explicitDomainPack) {
    const explicitPrimary =
      args.explicitDomainPack === "generic_saas" ? [] : [args.explicitDomainPack];

    return overlayResolutionResultSchema.parse({
      primaryDomainPack: args.explicitDomainPack,
      matchedOverlays: explicitPrimary,
      overlayConfidence: 1,
      matchedHints: ["explicit domain selection"],
      candidates: [
        {
          domainPackId: args.explicitDomainPack,
          score: 100,
          matchedHints: ["explicit domain selection"],
          confidence: 1
        }
      ]
    });
  }

  const signalCorpus = args.signals.corpus.toLowerCase();
  const hasSaasSignal =
    /\b(?:saas|software|platform|dashboard|portal|workflow|analytics|website|web app|tool|app|marketplace)\b/.test(
      signalCorpus
    );
  const candidates = [
    scoreOverlayPack(DOMAIN_PACKS.crypto_analytics, signalCorpus, hasSaasSignal),
    scoreOverlayPack(DOMAIN_PACKS.restaurant_sales, signalCorpus, hasSaasSignal),
    scoreOverlayPack(DOMAIN_PACKS.generic_saas, signalCorpus, hasSaasSignal)
  ].sort((left, right) => right.score - left.score);
  const genericCandidate =
    candidates.find((candidate) => candidate.domainPackId === "generic_saas") ??
    scoreOverlayPack(DOMAIN_PACKS.generic_saas, signalCorpus, hasSaasSignal);
  const specificCandidates = candidates.filter(
    (candidate) => candidate.domainPackId !== "generic_saas" && candidate.score >= 3.5
  );
  const primarySpecific = specificCandidates[0] ?? null;
  const primaryDomainPack =
    primarySpecific &&
    (primarySpecific.score >= 4 ||
      primarySpecific.score > genericCandidate.score + 0.75)
      ? primarySpecific.domainPackId
      : ("generic_saas" as const);
  const primaryCandidate =
    candidates.find((candidate) => candidate.domainPackId === primaryDomainPack) ??
    genericCandidate;

  return overlayResolutionResultSchema.parse({
    primaryDomainPack,
    matchedOverlays: specificCandidates.map((candidate) => candidate.domainPackId),
    overlayConfidence: primaryCandidate.confidence,
    matchedHints: primaryCandidate.matchedHints,
    candidates
  });
}

function mergeOpenQuestionTemplates(
  ...templateGroups: ReadonlyArray<readonly DomainOpenQuestionTemplate[]>
) {
  const ordered = new Map<ProjectBriefSlotId, DomainOpenQuestionTemplate>();

  for (const templateGroup of templateGroups) {
    for (const template of templateGroup) {
      ordered.set(template.slotId, template);
    }
  }

  return [...ordered.values()];
}

function mergeCapabilityDefaults(
  capabilityProfile: CapabilityProfile
) {
  const definitions = getCapabilityDefinitions(capabilityProfile.allCapabilities);

  return {
    featureMustHave: uniqueStrings(definitions.flatMap((definition) => definition.defaultFeatures)),
    surfaceDefaults: uniqueStrings(definitions.flatMap((definition) => definition.defaultSurfaces)),
    integrationDefaults: uniqueStrings(
      definitions.flatMap((definition) => definition.defaultIntegrations)
    ),
    dataSourceDefaults: uniqueStrings(
      definitions.flatMap((definition) => definition.defaultDataSources)
    ),
    complianceDefaults: uniqueStrings(
      definitions.flatMap((definition) => definition.defaultComplianceFlags)
    ),
    trustRiskDefaults: uniqueStrings(
      definitions.flatMap((definition) => definition.defaultTrustRisks)
    )
  };
}

export function buildDomainGuidanceModel(args: {
  systemArchetype: SystemArchetype;
  capabilityProfile: CapabilityProfile;
  primaryDomainPack: DomainPackId;
  matchedOverlays: readonly DomainPackId[];
}) {
  const archetype = getSystemArchetypeDefinition(args.systemArchetype);
  const overlayPackIds =
    args.matchedOverlays.length > 0
      ? args.matchedOverlays
      : [args.primaryDomainPack];
  const overlayPacks = overlayPackIds.map((overlayId) => getDomainPack(overlayId));
  const primaryOverlay = getDomainPack(args.primaryDomainPack);
  const capabilityDefaults = mergeCapabilityDefaults(args.capabilityProfile);

  return {
    primaryDomainPack: args.primaryDomainPack,
    primaryOverlay,
    matchedOverlayPacks: overlayPacks,
    systemArchetype: args.systemArchetype,
    capabilityProfile: args.capabilityProfile,
    productCategoryLabel:
      args.primaryDomainPack !== "generic_saas"
        ? primaryOverlay.productCategoryLabel
        : archetype.productCategoryLabel,
    defaultSurfaces: uniqueStrings([
      ...archetype.defaultSurfaces,
      ...capabilityDefaults.surfaceDefaults,
      ...overlayPacks.flatMap((pack) => pack.defaultSurfaces)
    ]),
    featureDefaults: {
      mustHave: uniqueStrings([
        ...archetype.defaultFeatureDefaults.mustHave,
        ...capabilityDefaults.featureMustHave,
        ...overlayPacks.flatMap((pack) => pack.likelyFeatureDefaults.mustHave)
      ]),
      niceToHave: uniqueStrings([
        ...archetype.defaultFeatureDefaults.niceToHave,
        ...overlayPacks.flatMap((pack) => pack.likelyFeatureDefaults.niceToHave)
      ]),
      excluded: uniqueStrings([
        ...archetype.defaultFeatureDefaults.excluded,
        ...overlayPacks.flatMap((pack) => pack.likelyFeatureDefaults.excluded)
      ])
    },
    likelyIntegrationDefaults: uniqueStrings([
      ...archetype.defaultIntegrationDefaults,
      ...capabilityDefaults.integrationDefaults,
      ...overlayPacks.flatMap((pack) => pack.likelyIntegrationDefaults)
    ]),
    likelyDataSourceDefaults: uniqueStrings([
      ...archetype.defaultDataSourceDefaults,
      ...capabilityDefaults.dataSourceDefaults,
      ...overlayPacks.flatMap((pack) => pack.likelyDataSourceDefaults)
    ]),
    complianceFlagDefaults: uniqueStrings([
      ...archetype.complianceFlagDefaults,
      ...capabilityDefaults.complianceDefaults,
      ...overlayPacks.flatMap((pack) => pack.complianceFlagDefaults)
    ]),
    trustRiskDefaults: uniqueStrings([
      ...archetype.trustRiskDefaults,
      ...capabilityDefaults.trustRiskDefaults,
      ...overlayPacks.flatMap((pack) => pack.trustRiskDefaults)
    ]),
    openQuestionTemplates: mergeOpenQuestionTemplates(
      archetype.defaultOpenQuestions,
      ...overlayPacks.map((pack) => pack.defaultOpenQuestions)
    ),
    requiredSlotsBeforeArchitectureGeneration: mergeProjectBriefSlotSets(
      archetype.requiredSlotsBeforeArchitectureGeneration,
      ...overlayPacks.map((pack) => pack.requiredSlotsBeforeArchitectureGeneration)
    ),
    requiredSlotsBeforeRoadmapApproval: mergeProjectBriefSlotSets(
      archetype.requiredSlotsBeforeRoadmapApproval,
      ...overlayPacks.map((pack) => pack.requiredSlotsBeforeRoadmapApproval)
    )
  } satisfies DomainGuidanceModel;
}

function buildGeneralizationSummary(args: {
  systemArchetype: SystemArchetype;
  capabilityProfile: CapabilityProfile;
  matchedOverlays: readonly DomainPackId[];
}) {
  const archetypeLabel = getSystemArchetypeDefinition(args.systemArchetype).label;
  const capabilities = args.capabilityProfile.primaryCapabilities
    .slice(0, 4)
    .join(", ");
  const overlaySummary =
    args.matchedOverlays.length > 0
      ? `Matched overlays: ${args.matchedOverlays.join(", ")}.`
      : "No bespoke overlay matched strongly enough, so the generic SaaS compatibility pack stays primary.";

  return `${archetypeLabel} with primary capabilities ${capabilities || "not yet explicit"}. ${overlaySummary}`;
}

export function generalizeDomainIntelligence(args: DomainGeneralizationInput) {
  const signals = collectDomainGeneralizationSignals(args);
  const baseArchetypeResolution = resolveSystemArchetype({
    corpus: signals.corpus,
    productCategory: signals.productCategory,
    problemStatement: signals.problemStatement,
    outcomePromise: signals.outcomePromise,
    mustHaveFeatures: signals.mustHaveFeatures,
    surfaces: signals.surfaces,
    integrations: signals.integrations,
    constraints: signals.constraints
  });
  const overlayResolution = resolveOverlays({
    signals,
    explicitDomainPack: args.explicitDomainPack ?? null
  });
  const archetypeResolution =
    overlayResolution.primaryDomainPack === "crypto_analytics" &&
    (baseArchetypeResolution.systemArchetype === "generic_saas_fallback" ||
      baseArchetypeResolution.archetypeConfidence < 0.72)
      ? archetypeResolutionResultSchema.parse({
          ...baseArchetypeResolution,
          systemArchetype: "analytics_platform",
          archetypeConfidence: Math.max(
            baseArchetypeResolution.archetypeConfidence,
            0.82
          ),
          matchedSignals: uniqueStrings([
            ...baseArchetypeResolution.matchedSignals,
            "overlay:crypto_analytics"
          ])
        })
      : overlayResolution.primaryDomainPack === "restaurant_sales" &&
          (baseArchetypeResolution.systemArchetype === "generic_saas_fallback" ||
            baseArchetypeResolution.archetypeConfidence < 0.72)
        ? archetypeResolutionResultSchema.parse({
            ...baseArchetypeResolution,
            systemArchetype: "analytics_platform",
            archetypeConfidence: Math.max(
              baseArchetypeResolution.archetypeConfidence,
              0.78
            ),
            matchedSignals: uniqueStrings([
              ...baseArchetypeResolution.matchedSignals,
              "overlay:restaurant_sales"
            ])
          })
        : archetypeResolutionResultSchema.parse(baseArchetypeResolution);
  const capabilityProfile = resolveCapabilityProfile({
    corpus: signals.corpus,
    systemArchetype: archetypeResolution.systemArchetype,
    primaryDomainPack: overlayResolution.primaryDomainPack,
    matchedOverlays: overlayResolution.matchedOverlays,
    mustHaveFeatures: signals.mustHaveFeatures,
    surfaces: signals.surfaces,
    integrations: signals.integrations,
    constraints: signals.constraints
  });
  const classificationNotes = uniqueStrings([
    `Resolved ${archetypeResolution.systemArchetype} from ${archetypeResolution.matchedSignals.join(", ") || "generic SaaS signals"}.`,
    overlayResolution.primaryDomainPack === "generic_saas"
      ? "No bespoke overlay was strong enough, so generic_saas remains the compatibility pack."
      : `Matched the ${overlayResolution.primaryDomainPack} overlay from ${overlayResolution.matchedHints.join(", ")}.`
  ]);

  return {
    signals,
    archetypeResolution: archetypeResolutionResultSchema.parse(archetypeResolution),
    overlayResolution,
    result: domainGeneralizationResultSchema.parse({
      systemArchetype: archetypeResolution.systemArchetype,
      archetypeConfidence: archetypeResolution.archetypeConfidence,
      capabilityProfile,
      matchedOverlays: overlayResolution.matchedOverlays,
      primaryDomainPack: overlayResolution.primaryDomainPack,
      overlayConfidence: overlayResolution.overlayConfidence,
      unresolvedDomainSpecifics: [],
      assumptionsMade: [],
      classificationNotes,
      summary: buildGeneralizationSummary({
        systemArchetype: archetypeResolution.systemArchetype,
        capabilityProfile,
        matchedOverlays: overlayResolution.matchedOverlays
      })
    })
  };
}

export function buildDomainSpecificLabels(args: {
  openQuestionTemplates: readonly DomainOpenQuestionTemplate[];
  missingSlots: readonly ProjectBriefSlotId[];
}) {
  const missing = new Set<ProjectBriefSlotId>(args.missingSlots);

  return uniqueStrings(
    args.openQuestionTemplates
      .filter((template) => missing.has(template.slotId))
      .map((template) => template.label)
  );
}
