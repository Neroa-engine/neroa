import { createBuildSession } from "@/lib/onboarding/build-session";
import type { GuidedBuildPathId } from "@/lib/onboarding/guided-handoff";
import { getPricingPlan, type PricingPlanId } from "@/lib/pricing/config";

export const FRONT_DOOR_INTAKE_STORAGE_KEY = "neroa:front-door-intake:v2";
export const FRONT_DOOR_PUBLIC_PRODUCT_TYPE = "saas" as const;

export type FrontDoorProductTypeId = typeof FRONT_DOOR_PUBLIC_PRODUCT_TYPE;
export type FrontDoorBuildMode = "mvp" | "full-build";
export type FrontDoorIntakeStage = "name" | "build-mode" | "description" | "recommendation";
export type FrontDoorStartingPointId = PricingPlanId | "managed";

export type FrontDoorRoadmapStep = {
  label: string;
  summary: string;
};

export type FrontDoorPreview = {
  title: string;
  productTypeId: FrontDoorProductTypeId;
  productTypeLabel: string;
  buildMode: FrontDoorBuildMode;
  buildModeLabel: string;
  shortProductDescription: string;
  roadmap: FrontDoorRoadmapStep[];
  pricingRangeLabel: string;
  pricingSummary: string;
  timelineLabel: string;
  timelineSummary: string;
  likelyPathId: GuidedBuildPathId;
  likelyPathLabel: string;
  likelyPathSummary: string;
  recommendedStartingPointId: FrontDoorStartingPointId;
  recommendedStartingPointLabel: string;
  recommendedStartingPointSummary: string;
  recommendationHeadline: string;
  mobileReadySummary: string;
  suggestedNextStep: string;
};

export type FrontDoorIntakeDraft = {
  version: 2;
  userName: string;
  productTypeId: FrontDoorProductTypeId;
  buildMode: FrontDoorBuildMode | null;
  shortProductDescription: string;
  concerns: string[];
  intakeStage: FrontDoorIntakeStage;
  completed: boolean;
  updatedAt: string;
};

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

const publicSaasOffer = {
  label: "SaaS",
  explanation:
    "SaaS means software people or teams return to regularly to complete a workflow, manage data, and run part of the business through one product.",
  mobileReadySummary:
    "NEROA shapes SaaS to be mobile-ready from day one so a strong mobile experience can be added later without rebuilding the core product logic.",
  roadmapMvp: [
    {
      label: "Strategy",
      summary: "Tighten the problem, customer, and first commercial angle before the product surface spreads."
    },
    {
      label: "Scope",
      summary: "Reduce the first release to one strong customer workflow with the right admin and account logic."
    },
    {
      label: "MVP",
      summary: "Define the smallest SaaS version worth validating, not a dashboard shell with weak product logic."
    },
    {
      label: "Build",
      summary: "Set the first systems, billing assumptions, integrations, and launch checkpoints in a practical order."
    }
  ] as FrontDoorRoadmapStep[],
  roadmapFull: [
    {
      label: "Strategy",
      summary: "Frame positioning, user roles, and revenue assumptions before the product becomes too broad."
    },
    {
      label: "Scope",
      summary: "Map the product lanes, customer journey, admin requirements, and integration depth with clearer boundaries."
    },
    {
      label: "Build plan",
      summary: "Sequence the MVP, deeper modules, integrations, QA work, and launch dependencies in the right order."
    },
    {
      label: "Launch",
      summary: "Prepare onboarding, support, handoff, and the operating logic required once customers are live."
    }
  ] as FrontDoorRoadmapStep[],
  pricing: {
    mvp: {
      range: "$6k-$18k starting build range",
      summary:
        "A tighter SaaS MVP usually stays practical when the first release focuses on one customer workflow, lighter integrations, and a disciplined feature cut line."
    },
    "full-build": {
      range: "$18k-$65k+ early planning range",
      summary:
        "Fuller SaaS products rise in cost as billing depth, permissions, reporting, integrations, and operational requirements all widen."
    }
  },
  timeline: {
    mvp: {
      label: "Typical first release timing: 6-12 weeks managed, or paced DIY cycles",
      summary:
        "A serious SaaS MVP still needs enough room for scope discipline, testing, and launch prep before it goes live."
    },
    "full-build": {
      label: "Typical fuller build timing: 3-6+ months depending on scope",
      summary:
        "Full SaaS builds move slower because the customer journey, admin controls, integrations, and operating requirements all deepen."
    }
  },
  systems: ["GitHub", "Next.js", "Supabase", "Vercel", "Auth", "Stripe", "PostHog", "Resend"]
} as const;

const buildModeRegistry = {
  mvp: {
    label: "MVP"
  },
  "full-build": {
    label: "Full Build"
  }
} as const;

type Recommendation = {
  pathId: GuidedBuildPathId;
  pathLabel: string;
  pathSummary: string;
  startingPointId: FrontDoorStartingPointId;
  startingPointLabel: string;
  startingPointSummary: string;
  headline: string;
};

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBuildMode(value: unknown): FrontDoorBuildMode | null {
  return value === "mvp" || value === "full-build" ? value : null;
}

function normalizeStage(value: unknown): FrontDoorIntakeStage {
  return value === "name" ||
    value === "build-mode" ||
    value === "description" ||
    value === "recommendation"
    ? value
    : "name";
}

function nowIso() {
  return new Date().toISOString();
}

function getBudgetSensitivity(draft: FrontDoorIntakeDraft) {
  return /budget|lower plan|smaller budget|smaller plan|afford|bootstrap|cheap|lower-cost|low-cost|cost/i.test(
    draft.concerns.join(" ")
  );
}

function countComplexitySignals(description: string) {
  const complexitySignals = [
    "billing",
    "payments",
    "payment",
    "subscription",
    "multi-tenant",
    "multi tenant",
    "multiple roles",
    "multi-role",
    "marketplace",
    "integrations",
    "integration",
    "api",
    "analytics",
    "real-time",
    "realtime",
    "ai",
    "workflow engine",
    "automation",
    "mobile",
    "ios",
    "android",
    "crm",
    "admin portal",
    "white-label",
    "white label"
  ];

  return complexitySignals.reduce(
    (count, signal) => (description.includes(signal) ? count + 1 : count),
    0
  );
}

function buildPlanLabel(planId: PricingPlanId) {
  return getPricingPlan(planId)?.label ?? planId.charAt(0).toUpperCase() + planId.slice(1);
}

function deriveRecommendation(draft: FrontDoorIntakeDraft): Recommendation {
  const description = draft.shortProductDescription.toLowerCase();
  const complexitySignals = countComplexitySignals(description);
  const budgetSensitive = getBudgetSensitivity(draft);
  const heavierMvp = draft.buildMode === "mvp" && complexitySignals >= 4;
  const managedFullBuild =
    draft.buildMode === "full-build" && (complexitySignals >= 3 || description.length > 220);

  if (managedFullBuild || heavierMvp) {
    return {
      pathId: "managed",
      pathLabel: "Managed",
      pathSummary:
        "This looks like a SaaS that will benefit from more structured execution help, tighter delivery oversight, and a clearer managed planning path.",
      startingPointId: "managed",
      startingPointLabel: "Managed planning",
      startingPointSummary:
        "Best when the SaaS already points toward heavier integrations, broader workflow depth, or more execution coordination than a self-paced lane should carry.",
      headline: "I would start this on the Managed path."
    };
  }

  if (draft.buildMode === "full-build" || complexitySignals >= 2) {
    return {
      pathId: "diy",
      pathLabel: "DIY",
      pathSummary:
        "The product can still start in DIY, but it wants a deeper starting tier because the scope already points beyond a light MVP.",
      startingPointId: "builder",
      startingPointLabel: buildPlanLabel("builder"),
      startingPointSummary:
        "Builder is the better starting subscription when the SaaS already needs more module depth, stronger build support, or a faster path into launch work.",
      headline: "I would start this on a deeper DIY build path."
    };
  }

  if (budgetSensitive) {
    return {
      pathId: "diy",
      pathLabel: "DIY",
      pathSummary:
        "The idea looks lean enough to start carefully, keep the first release tight, and protect budget before the build widens.",
      startingPointId: "free",
      startingPointLabel: buildPlanLabel("free"),
      startingPointSummary:
        "Free is a workable starting point when the immediate goal is to clarify the SaaS, cut the MVP, and stay highly budget-aware before moving deeper.",
      headline: "I would start by keeping the first SaaS roadmap lean."
    };
  }

  return {
    pathId: "diy",
    pathLabel: "DIY",
    pathSummary:
      "A focused SaaS MVP is usually a good fit for the guided DIY path when the first release stays disciplined and the budget needs to stay practical.",
    startingPointId: "starter",
    startingPointLabel: buildPlanLabel("starter"),
    startingPointSummary:
      "Starter is the strongest opening subscription when you want a serious SaaS MVP with clearer scope, budget, testing, and decision guardrails.",
    headline: "I would start this as a focused DIY SaaS MVP."
  };
}

function resolveStorage(storage?: StorageLike | null) {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function normalizeDraft(value: unknown): FrontDoorIntakeDraft {
  if (!value || typeof value !== "object") {
    return createEmptyFrontDoorIntakeDraft();
  }

  const record = value as Record<string, unknown>;
  const userName = normalizeString(record.userName);
  const buildMode = normalizeBuildMode(record.buildMode);
  const shortProductDescription = normalizeString(record.shortProductDescription);
  const concerns = normalizeStringArray(record.concerns);
  const completed = Boolean(userName && buildMode && shortProductDescription);
  const intakeStage = completed ? "recommendation" : normalizeStage(record.intakeStage);

  return {
    version: 2,
    userName,
    productTypeId: FRONT_DOOR_PUBLIC_PRODUCT_TYPE,
    buildMode,
    shortProductDescription,
    concerns,
    intakeStage,
    completed,
    updatedAt: normalizeString(record.updatedAt) || nowIso()
  };
}

export const frontDoorBuildModes = (
  Object.entries(buildModeRegistry) as Array<
    [FrontDoorBuildMode, (typeof buildModeRegistry)[FrontDoorBuildMode]]
  >
).map(([id, value]) => ({
  id,
  label: value.label
}));

export function createEmptyFrontDoorIntakeDraft(
  overrides?: Partial<FrontDoorIntakeDraft> | null
): FrontDoorIntakeDraft {
  const draft: FrontDoorIntakeDraft = {
    version: 2,
    userName: "",
    productTypeId: FRONT_DOOR_PUBLIC_PRODUCT_TYPE,
    buildMode: null,
    shortProductDescription: "",
    concerns: [],
    intakeStage: "name",
    completed: false,
    updatedAt: nowIso()
  };

  return normalizeDraft({
    ...draft,
    ...(overrides ?? {})
  });
}

export function normalizeFrontDoorIntakeDraft(value: unknown) {
  return normalizeDraft(value);
}

export function loadFrontDoorIntakeDraft(storage?: StorageLike | null) {
  const target = resolveStorage(storage);

  if (!target) {
    return createEmptyFrontDoorIntakeDraft();
  }

  try {
    return normalizeDraft(JSON.parse(target.getItem(FRONT_DOOR_INTAKE_STORAGE_KEY) ?? "null"));
  } catch {
    return createEmptyFrontDoorIntakeDraft();
  }
}

export function saveFrontDoorIntakeDraft(
  draft: FrontDoorIntakeDraft,
  storage?: StorageLike | null
) {
  const normalized = normalizeDraft({
    ...draft,
    updatedAt: nowIso()
  });
  const target = resolveStorage(storage);

  if (!target) {
    return normalized;
  }

  target.setItem(FRONT_DOOR_INTAKE_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearFrontDoorIntakeDraft(storage?: StorageLike | null) {
  const target = resolveStorage(storage);

  if (!target) {
    return;
  }

  target.removeItem(FRONT_DOOR_INTAKE_STORAGE_KEY);
}

export function getFrontDoorProductType() {
  return publicSaasOffer;
}

export function explainFrontDoorProductType() {
  return publicSaasOffer.explanation;
}

export function buildFrontDoorProjectTitle(draft: FrontDoorIntakeDraft) {
  const description = draft.shortProductDescription.trim();

  if (description) {
    const trimmed = description
      .replace(/\.$/, "")
      .split(/[.!?]/)[0]
      .trim();

    if (trimmed.length <= 72) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
  }

  const owner = draft.userName ? `${draft.userName}'s` : "New";
  return `${owner} SaaS project`;
}

export function buildFrontDoorPreview(draft: FrontDoorIntakeDraft): FrontDoorPreview | null {
  if (!draft.buildMode || !draft.shortProductDescription.trim()) {
    return null;
  }

  const buildMode = buildModeRegistry[draft.buildMode];
  const recommendation = deriveRecommendation(draft);
  const roadmap =
    draft.buildMode === "mvp" ? publicSaasOffer.roadmapMvp : publicSaasOffer.roadmapFull;
  const pricing = publicSaasOffer.pricing[draft.buildMode];
  const timeline = publicSaasOffer.timeline[draft.buildMode];

  return {
    title: buildFrontDoorProjectTitle(draft),
    productTypeId: FRONT_DOOR_PUBLIC_PRODUCT_TYPE,
    productTypeLabel: publicSaasOffer.label,
    buildMode: draft.buildMode,
    buildModeLabel: buildMode.label,
    shortProductDescription: draft.shortProductDescription.trim(),
    roadmap,
    pricingRangeLabel: pricing.range,
    pricingSummary: pricing.summary,
    timelineLabel: timeline.label,
    timelineSummary: timeline.summary,
    likelyPathId: recommendation.pathId,
    likelyPathLabel: recommendation.pathLabel,
    likelyPathSummary: recommendation.pathSummary,
    recommendedStartingPointId: recommendation.startingPointId,
    recommendedStartingPointLabel: recommendation.startingPointLabel,
    recommendedStartingPointSummary: recommendation.startingPointSummary,
    recommendationHeadline: recommendation.headline,
    mobileReadySummary: publicSaasOffer.mobileReadySummary,
    suggestedNextStep:
      recommendation.pathId === "managed"
        ? "Create your account to unlock the roadmap and continue into managed SaaS planning."
        : "Create your account to unlock the roadmap and continue into your guided SaaS build path."
  };
}

export function buildFrontDoorBuildSession(draft: FrontDoorIntakeDraft) {
  const preview = buildFrontDoorPreview(draft);

  if (!preview) {
    return null;
  }

  const keyModules = ["Accounts", "Core workflow", "Admin dashboard", "Reporting"];
  const firstBuild = preview.buildMode === "mvp" ? keyModules.slice(0, 2) : keyModules;

  return createBuildSession({
    source: "homepage-guide",
    userIntent: preview.shortProductDescription,
    preferences: [
      preview.buildModeLabel,
      preview.likelyPathLabel,
      preview.recommendedStartingPointLabel,
      ...draft.concerns.slice(0, 2)
    ].filter(Boolean),
    scope: {
      productTypeId: preview.productTypeId,
      productTypeLabel: preview.productTypeLabel,
      buildTypeId: preview.productTypeId,
      buildTypeLabel: preview.productTypeLabel,
      title: preview.title,
      summary: preview.shortProductDescription,
      problem: preview.shortProductDescription,
      keyModules,
      firstBuild,
      mvpSummary:
        preview.buildMode === "mvp"
          ? "Start with a focused SaaS MVP that proves the first workflow without widening too early."
          : "Plan the fuller SaaS build in sequenced phases so the execution path stays practical.",
      stackRecommendationLabel: "SaaS starter systems",
      stackRecommendationSummary: `NEROA will likely shape this around ${publicSaasOffer.systems.join(", ")}.`,
      stackSystems: [...publicSaasOffer.systems]
    },
    path: {
      recommendedPathMode: preview.likelyPathId,
      recommendedPathLabel: preview.likelyPathLabel,
      recommendationReason: `${preview.likelyPathSummary} ${preview.recommendedStartingPointSummary}`
    },
    credits: {
      source: "pending",
      estimatedTimeline: preview.timelineLabel,
      note: `${preview.pricingRangeLabel}. ${preview.pricingSummary}`
    },
    progress: {
      phase: "homepage-guide",
      currentStep: "roadmap",
      currentStepLabel: "Roadmap landing",
      currentRoute: "/roadmap",
      completedSteps: ["Landing", "Intake chat", "Plan fit"]
    }
  });
}
