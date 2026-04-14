import { getPricingPlan, type PricingPlan, type PricingPlanId } from "@/lib/pricing/config";
import type { ProjectTemplateId } from "@/lib/workspace/project-lanes";

export type UsageComplexityBand = "light" | "moderate" | "high" | "intense" | "enterprise";

export type PricingRecommendation = {
  recommendedPlanId: PricingPlanId;
  recommendedPlan: PricingPlan;
  projectedUsageBand: UsageComplexityBand;
  projectedMonthlyExecutionCredits: number;
  estimatedCostToServeMonthly: {
    low: number;
    high: number;
  };
  rationale: string[];
  upgradeSignals: string[];
  usageHeadline: string;
};

type BuildPricingRecommendationArgs = {
  templateId: ProjectTemplateId;
  laneCount: number;
  concept: string;
  target: string;
  offer: string;
  launch: string;
  budget: string;
  needs: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseBudgetHint(value: string) {
  const normalized = value.replace(/,/g, "");
  const matches = normalized.match(/\$?\d+(?:\.\d+)?/g);

  if (!matches || matches.length === 0) {
    return null;
  }

  const numbers = matches
    .map((item) => Number(item.replace(/\$/g, "")))
    .filter((item) => Number.isFinite(item));

  if (numbers.length === 0) {
    return null;
  }

  return Math.max(...numbers);
}

function scoreKeywordComplexity(text: string) {
  const normalized = text.toLowerCase();
  let score = 0;

  const keywordGroups = [
    ["saas", "software", "app", "platform", "api", "dashboard"],
    ["automation", "integrations", "sync", "workflow", "multi-step", "orchestration"],
    ["developer", "technical", "repo", "github", "deploy", "build"],
    ["multi-project", "enterprise", "team", "approval", "permissions", "handoff"]
  ];

  for (const group of keywordGroups) {
    if (group.some((keyword) => normalized.includes(keyword))) {
      score += 1;
    }
  }

  return score;
}

function baseScoreByTemplate(templateId: ProjectTemplateId) {
  switch (templateId) {
    case "business-launch":
      return 1;
    case "ecommerce-brand":
      return 2;
    case "saas-build":
      return 4;
    case "mobile-app-build":
      return 4;
    case "coding-project":
      return 4;
  }
}

function getComplexityBand(score: number): UsageComplexityBand {
  if (score >= 8) {
    return "enterprise";
  }

  if (score >= 6) {
    return "intense";
  }

  if (score >= 4) {
    return "high";
  }

  if (score >= 2) {
    return "moderate";
  }

  return "light";
}

function getExecutionCreditsByScore(score: number, templateId: ProjectTemplateId) {
  const templateBase =
    templateId === "business-launch"
      ? 200
      : templateId === "ecommerce-brand"
        ? 500
        : templateId === "saas-build"
          ? 1800
          : templateId === "mobile-app-build"
            ? 2200
          : 1500;

  return templateBase + score * 600;
}

function getCostToServeRange(credits: number, band: UsageComplexityBand) {
  const multiplierLow =
    band === "light"
      ? 0.03
      : band === "moderate"
        ? 0.05
        : band === "high"
          ? 0.09
          : band === "intense"
            ? 0.14
            : 0.2;
  const multiplierHigh =
    band === "light"
      ? 0.06
      : band === "moderate"
        ? 0.1
        : band === "high"
          ? 0.16
          : band === "intense"
            ? 0.24
            : 0.34;

  return {
    low: Math.round(credits * multiplierLow),
    high: Math.round(credits * multiplierHigh)
  };
}

function recommendPlanId(args: {
  templateId: ProjectTemplateId;
  score: number;
  band: UsageComplexityBand;
}): PricingPlanId {
  if (args.band === "enterprise") {
    return "command-center";
  }

  if (
    args.templateId === "saas-build" ||
    args.templateId === "coding-project" ||
    args.templateId === "mobile-app-build"
  ) {
    if (args.score >= 6) {
      return "pro";
    }

    if (args.score >= 3) {
      return "builder";
    }

    return "starter";
  }

  if (args.score >= 6) {
    return "pro";
  }

  if (args.score >= 3) {
    return "builder";
  }

  if (args.score >= 2) {
    return "starter";
  }

  return "free";
}

function createUsageHeadline(
  plan: PricingPlan,
  credits: number,
  band: UsageComplexityBand
) {
  const bandLabel =
    band === "enterprise"
      ? "enterprise-level orchestration"
      : band === "intense"
        ? "heavy execution planning"
        : band === "high"
          ? "build-oriented planning"
          : band === "moderate"
            ? "active planning"
            : "light guided planning";

  return `${plan.shortLabel} fits this scope at roughly ${credits.toLocaleString("en-US")} monthly Engine Credits for ${bandLabel}.`;
}

export function buildPricingRecommendation(
  args: BuildPricingRecommendationArgs
): PricingRecommendation {
  const budgetHint = parseBudgetHint(args.budget) ?? 0;
  const keywordText = [args.concept, args.offer, args.launch, args.needs].join(" ");
  const keywordScore = scoreKeywordComplexity(keywordText);
  const laneScore = args.laneCount >= 8 ? 2 : args.laneCount >= 5 ? 1 : 0;
  const budgetScore = budgetHint >= 50000 ? 2 : budgetHint >= 15000 ? 1 : 0;
  const score = clamp(baseScoreByTemplate(args.templateId) + keywordScore + laneScore + budgetScore, 1, 9);
  const band = getComplexityBand(score);
  const credits = getExecutionCreditsByScore(score, args.templateId);
  const estimatedCostToServeMonthly = getCostToServeRange(credits, band);
  const recommendedPlanId = recommendPlanId({
    templateId: args.templateId,
    score,
    band
  });
  const recommendedPlan = getPricingPlan(recommendedPlanId);

  if (!recommendedPlan) {
    throw new Error(`Missing pricing plan configuration for ${recommendedPlanId}`);
  }

  const rationale = [
    `${
      args.templateId === "saas-build" ||
      args.templateId === "coding-project" ||
      args.templateId === "mobile-app-build"
        ? "Build-heavy"
        : "Planning-heavy"
    } workflow detected from the current strategy inputs.`,
    args.target.trim()
      ? `Naroa is planning around ${args.target.trim()} as the first audience or user group.`
      : "Naroa is planning around a still-forming first audience.",
    budgetHint > 0
      ? `The stated budget signal of about $${budgetHint.toLocaleString("en-US")} suggests ${band} support needs.`
      : "No firm budget was provided yet, so Naroa is using the current scope and lane complexity."
  ];

  const upgradeSignals = [
    recommendedPlan.upgradeTrigger,
    band === "high" || band === "intense" || band === "enterprise"
      ? "Projected usage is high enough that Naroa should watch for heavier monthly Engine Credit demand."
      : "Upgrade once strategy work turns into deeper multi-lane or build-heavy execution.",
    args.templateId === "saas-build" ||
    args.templateId === "coding-project" ||
    args.templateId === "mobile-app-build"
      ? "Technical scoping and implementation planning should stay inside Builder or Pro, not the preview tiers."
      : "Move into Builder once the work becomes implementation-heavy or export-heavy."
  ];

  return {
    recommendedPlanId,
    recommendedPlan,
    projectedUsageBand: band,
    projectedMonthlyExecutionCredits: credits,
    estimatedCostToServeMonthly,
    rationale,
    upgradeSignals,
    usageHeadline: createUsageHeadline(recommendedPlan, credits, band)
  };
}
