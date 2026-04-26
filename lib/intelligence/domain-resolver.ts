import type { HiddenIntelligenceBundle } from "@/lib/intelligence/adapters";
import type { ConversationSessionState } from "@/lib/intelligence/conversation";
import type { GuidedBuildSession } from "@/lib/onboarding/build-session";
import type { MobileAppWorkspaceBlueprint } from "@/lib/onboarding/mobile-app-intake";
import type { SaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import { DOMAIN_PACKS, getDomainPack, type DomainPack } from "./domain-packs.ts";
import type { DomainPackId } from "./domain-contracts.ts";

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

export type DomainResolutionInput = {
  projectName?: string | null;
  projectDescription?: string | null;
  conversationState?: ConversationSessionState | null;
  hiddenBundle?: HiddenIntelligenceBundle | null;
  buildSession?: GuidedBuildSession | null;
  saasIntake?: SaasWorkspaceBlueprint | null;
  mobileAppIntake?: MobileAppWorkspaceBlueprint | null;
  explicitDomainPack?: DomainPackId | null;
};

export type DomainResolutionCandidate = {
  domainPackId: DomainPackId;
  score: number;
  matchedHints: string[];
};

export type DomainResolution = {
  domainPackId: DomainPackId;
  domainPack: DomainPack;
  confidenceScore: number;
  matchedHints: string[];
  candidates: DomainResolutionCandidate[];
  corpus: string;
};

export function collectDomainResolutionText(args: DomainResolutionInput) {
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

  appendListBucket(buckets, args.conversationState?.audience.buyerPersonas);
  appendListBucket(buckets, args.conversationState?.audience.operatorPersonas);
  appendListBucket(buckets, args.conversationState?.audience.endCustomerPersonas);
  appendListBucket(buckets, args.conversationState?.audience.adminPersonas);
  appendListBucket(buckets, args.conversationState?.mustHaveFeatures);
  appendListBucket(buckets, args.conversationState?.niceToHaveFeatures);
  appendListBucket(buckets, args.conversationState?.constraintsAndCompliance);
  appendListBucket(buckets, args.conversationState?.integrationsAndDataSources);
  appendListBucket(buckets, args.buildSession?.scope.coreFeatures);
  appendListBucket(buckets, args.buildSession?.scope.keyFeatures);
  appendListBucket(buckets, args.buildSession?.scope.firstBuild);
  appendListBucket(buckets, args.buildSession?.scope.integrationNeeds);
  appendListBucket(buckets, args.saasIntake?.mvpFeatureList);
  appendListBucket(buckets, args.mobileAppIntake?.featureList);
  appendListBucket(buckets, args.mobileAppIntake?.screenList);

  return uniqueStrings(buckets);
}

function scoreDomainPack(pack: DomainPack, text: string, hasSaasSignal: boolean) {
  const matchedHints: string[] = [];
  let score = 0;

  for (const phrase of pack.triggerPhrases) {
    if (!text.includes(phrase.toLowerCase())) {
      continue;
    }

    matchedHints.push(phrase);
    score += phrase.includes(" ") ? 4 : 2.5;
  }

  for (const hint of pack.detectionHints) {
    if (!text.includes(hint.toLowerCase())) {
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

  return {
    domainPackId: pack.id,
    score,
    matchedHints: uniqueStrings(matchedHints)
  } satisfies DomainResolutionCandidate;
}

export function resolveDomainPack(args: DomainResolutionInput): DomainResolution {
  if (args.explicitDomainPack) {
    const domainPack = getDomainPack(args.explicitDomainPack);

    return {
      domainPackId: domainPack.id,
      domainPack,
      confidenceScore: 1,
      matchedHints: ["explicit domain selection"],
      candidates: [
        {
          domainPackId: domainPack.id,
          score: 100,
          matchedHints: ["explicit domain selection"]
        }
      ],
      corpus: collectDomainResolutionText(args).join(" ")
    };
  }

  const corpusParts = collectDomainResolutionText(args);
  const corpus = corpusParts.join(" ").toLowerCase();
  const hasSaasSignal =
    /\b(?:saas|software|platform|dashboard|portal|workflow|analytics|website|web app|tool|app)\b/.test(
      corpus
    );
  const candidates = [
    scoreDomainPack(DOMAIN_PACKS.crypto_analytics, corpus, hasSaasSignal),
    scoreDomainPack(DOMAIN_PACKS.restaurant_sales, corpus, hasSaasSignal),
    scoreDomainPack(DOMAIN_PACKS.generic_saas, corpus, hasSaasSignal)
  ].sort((left, right) => right.score - left.score);
  const genericCandidate =
    candidates.find((candidate) => candidate.domainPackId === "generic_saas") ??
    scoreDomainPack(DOMAIN_PACKS.generic_saas, corpus, hasSaasSignal);
  const bestSpecificCandidate = candidates.find(
    (candidate) => candidate.domainPackId !== "generic_saas"
  );
  const selectedCandidate =
    bestSpecificCandidate &&
    (bestSpecificCandidate.score >= 4 ||
      bestSpecificCandidate.score > genericCandidate.score + 0.75)
      ? bestSpecificCandidate
      : genericCandidate;
  const selectedPack = getDomainPack(selectedCandidate.domainPackId);
  const confidenceScore =
    selectedPack.id === "generic_saas"
      ? hasSaasSignal
        ? 0.58
        : 0.42
      : Math.max(0.6, Math.min(0.97, selectedCandidate.score / 12));

  return {
    domainPackId: selectedPack.id,
    domainPack: selectedPack,
    confidenceScore,
    matchedHints: selectedCandidate.matchedHints,
    candidates,
    corpus: corpusParts.join(" ")
  };
}
