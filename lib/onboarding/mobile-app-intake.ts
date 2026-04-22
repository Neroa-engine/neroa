import type { AgentId } from "@/lib/ai/agents";

export type MobilePlatformChoice = "iphone" | "android" | "both";
export type MobileBinaryChoice = "yes" | "no" | "not-sure";
export type MobileCompanionChoice =
  | "none"
  | "admin-dashboard"
  | "web-companion"
  | "both"
  | "not-sure";

export type MobileStackRecommendation = {
  primaryBuildPath: "React Native + Expo";
  secondaryMvpPath: "PWA / mobile web";
  advisoryPaths: Array<"Flutter" | "native iOS" | "native Android">;
  recommendedPathLabel: "Primary Build Path" | "Secondary MVP Path" | "Advisory Path";
  recommendedPathValue: string;
  summary: string;
  rationale: string[];
};

export type MobileAppIntakeAnswers = {
  appSummary: string;
  audience: string;
  platformTarget: MobilePlatformChoice;
  needsAccounts: MobileBinaryChoice;
  needsPayments: MobileBinaryChoice;
  needsNotifications: MobileBinaryChoice;
  deviceFeatures: string;
  companionSurface: MobileCompanionChoice;
  mvpVersion: string;
  budgetGuardrail: string;
  proofOutcome: string;
};

export type MobileAppWorkspaceBlueprint = {
  projectName: string;
  projectSummary: string;
  screenList: string[];
  featureList: string[];
  buildComplexity: {
    label: "Lean" | "Moderate" | "Advanced";
    summary: string;
  };
  startupCostEstimate: {
    rangeLabel: string;
    summary: string;
  };
  stackRecommendation: MobileStackRecommendation;
  nextStepChecklist: string[];
  assignedAgents: AgentId[];
  answers: MobileAppIntakeAnswers;
};

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function compactSentence(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
}

function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildProjectName(appSummary: string) {
  const cleaned = compactSentence(appSummary);

  if (!cleaned) {
    return "Mobile App Engine";
  }

  return toTitleCase(cleaned.split(/\s+/).slice(0, 6).join(" "));
}

function hasBudgetPressure(value: string) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("tight") ||
    normalized.includes("lean") ||
    normalized.includes("low") ||
    normalized.includes("small") ||
    normalized.includes("protect") ||
    normalized.includes("under")
  );
}

function hasAggressiveNativeNeed(value: string) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("ar") ||
    normalized.includes("augmented") ||
    normalized.includes("bluetooth") ||
    normalized.includes("background") ||
    normalized.includes("health") ||
    normalized.includes("watch") ||
    normalized.includes("high performance") ||
    normalized.includes("3d") ||
    normalized.includes("graphics")
  );
}

function buildScreenList(answers: MobileAppIntakeAnswers) {
  const screens = ["Onboarding / value intro", "Primary workflow home", "Core task flow"];

  if (answers.needsAccounts !== "no") {
    screens.push("Account / login flow", "Profile / settings");
  }

  if (answers.needsPayments !== "no") {
    screens.push("Pricing or subscription screen", "Checkout / billing state");
  }

  if (answers.companionSurface === "admin-dashboard" || answers.companionSurface === "both") {
    screens.push("Admin dashboard / moderation view");
  }

  if (answers.companionSurface === "web-companion" || answers.companionSurface === "both") {
    screens.push("Web companion or back-office surface");
  }

  if (answers.needsNotifications !== "no") {
    screens.push("Notification settings / permission handoff");
  }

  return Array.from(new Set(screens));
}

function buildFeatureList(answers: MobileAppIntakeAnswers) {
  const features = splitList(answers.mvpVersion);

  if (features.length === 0) {
    features.push("Core mobile workflow", "Basic navigation", "First value-delivery loop");
  }

  if (answers.needsAccounts === "yes") {
    features.push("Account creation and login");
  }

  if (answers.needsPayments === "yes") {
    features.push("Subscription or payment flow");
  }

  if (answers.needsNotifications === "yes") {
    features.push("Push notifications");
  }

  if (answers.deviceFeatures.trim()) {
    features.push(`Device features: ${compactSentence(answers.deviceFeatures)}`);
  }

  return Array.from(new Set(features));
}

function buildComplexity(answers: MobileAppIntakeAnswers) {
  let score = 0;

  if (answers.platformTarget === "both") {
    score += 2;
  } else {
    score += 1;
  }

  if (answers.needsAccounts === "yes") score += 1;
  if (answers.needsPayments === "yes") score += 1;
  if (answers.needsNotifications === "yes") score += 1;
  if (answers.deviceFeatures.trim() && answers.deviceFeatures !== "none") score += 1;
  if (answers.companionSurface === "both") score += 2;
  if (
    answers.companionSurface === "admin-dashboard" ||
    answers.companionSurface === "web-companion"
  ) {
    score += 1;
  }

  if (score <= 3) {
    return {
      label: "Lean" as const,
      summary:
        "The first version can stay relatively tight if the MVP is trimmed aggressively and the first release avoids extra platform or dashboard complexity."
    };
  }

  if (score <= 6) {
    return {
      label: "Moderate" as const,
      summary:
        "The build needs more coordination across auth, payments, notifications, or companion surfaces, but it still fits a disciplined startup mobile path."
    };
  }

  return {
    label: "Advanced" as const,
    summary:
      "The build mixes multi-platform delivery with richer mobile capabilities, supporting surfaces, or deeper systems work that needs tighter sequencing and budget protection."
  };
}

function buildCostEstimate(
  answers: MobileAppIntakeAnswers,
  complexity: MobileAppWorkspaceBlueprint["buildComplexity"]
) {
  const advisoryNeed = hasAggressiveNativeNeed(answers.deviceFeatures);
  const budgetPressure = hasBudgetPressure(answers.budgetGuardrail);

  if (budgetPressure && answers.needsNotifications === "no" && !answers.deviceFeatures.trim()) {
    return {
      rangeLabel: "$8,000 - $24,000",
      summary:
        "Neroa sees a budget-protected MVP path here. A PWA or lighter mobile-web route may prove the product before a full app-store build expands the spend."
    };
  }

  if (advisoryNeed || complexity.label === "Advanced") {
    return {
      rangeLabel: "$70,000 - $220,000",
      summary:
        "This scope is closer to a heavier mobile build with richer backend, testing, native-feature, or app-store readiness needs. Neroa should protect scope hard before execution widens."
    };
  }

  if (complexity.label === "Moderate") {
    return {
      rangeLabel: "$30,000 - $95,000",
      summary:
        "This is a realistic startup mobile-app range for React Native + Expo, backend setup, testing, store-prep, and first-release polish without letting the scope sprawl."
    };
  }

  return {
    rangeLabel: "$18,000 - $45,000",
    summary:
      "The first mobile release can stay inside a leaner range if the MVP stays narrow, the build path is disciplined, and the companion surface remains light."
  };
}

function buildStackRecommendation(answers: MobileAppIntakeAnswers): MobileStackRecommendation {
  const advisoryNeed = hasAggressiveNativeNeed(answers.deviceFeatures);
  const budgetPressure = hasBudgetPressure(answers.budgetGuardrail);
  const minimalNativeSurface =
    answers.needsPayments !== "yes" &&
    answers.needsNotifications !== "yes" &&
    !answers.deviceFeatures.trim();

  if (budgetPressure && minimalNativeSurface) {
    return {
      primaryBuildPath: "React Native + Expo",
      secondaryMvpPath: "PWA / mobile web",
      advisoryPaths: ["Flutter", "native iOS", "native Android"],
      recommendedPathLabel: "Secondary MVP Path",
      recommendedPathValue: "PWA / mobile web",
      summary:
        "Neroa recommends starting with a PWA or mobile-web MVP to protect budget and validate the workflow faster before committing to full app-store delivery.",
      rationale: [
        "Budget protection matters more than immediate app-store packaging.",
        "Native features look light enough to delay full device-specific work.",
        "The product can still prove demand before React Native + Expo becomes necessary."
      ]
    };
  }

  if (advisoryNeed) {
    return {
      primaryBuildPath: "React Native + Expo",
      secondaryMvpPath: "PWA / mobile web",
      advisoryPaths: ["Flutter", "native iOS", "native Android"],
      recommendedPathLabel: "Advisory Path",
      recommendedPathValue: "native iOS / native Android",
      summary:
        "Neroa sees signs that platform-specific capability or performance may matter. React Native + Expo stays the launch default, but native iOS or Android should be reviewed before scope locks.",
      rationale: [
        "The requested device capabilities suggest deeper platform access.",
        "Native performance or OS-specific behavior may become a deciding factor.",
        "Neroa should still scope the MVP in React Native terms first so cost tradeoffs stay visible."
      ]
    };
  }

  return {
    primaryBuildPath: "React Native + Expo",
    secondaryMvpPath: "PWA / mobile web",
    advisoryPaths: ["Flutter", "native iOS", "native Android"],
    recommendedPathLabel: "Primary Build Path",
    recommendedPathValue: "React Native + Expo",
    summary:
      "Neroa recommends React Native + Expo as the main mobile build path because it keeps speed, budget discipline, iPhone/Android coverage, and real app-store delivery in one practical stack.",
    rationale: [
      answers.platformTarget === "both"
        ? "You need a cross-platform route that can cover both iPhone and Android."
        : "React Native + Expo is still the fastest disciplined path for a startup mobile MVP.",
      "Supabase can carry backend, auth, and data cleanly for the first release.",
      answers.needsPayments === "yes"
        ? "Stripe can handle subscription or payment flows when they belong in the first version."
        : "Payments can stay optional without breaking the default stack.",
      answers.needsNotifications === "yes"
        ? "Expo Notifications fits the requested push-notification layer."
        : "The default stack stays lighter because notifications are not the main complexity driver."
    ]
  };
}

export function buildMobileAppWorkspaceBlueprint(
  answers: MobileAppIntakeAnswers
): MobileAppWorkspaceBlueprint {
  const projectName = buildProjectName(answers.appSummary);
  const complexity = buildComplexity(answers);
  const startupCostEstimate = buildCostEstimate(answers, complexity);
  const stackRecommendation = buildStackRecommendation(answers);
  const screenList = buildScreenList(answers);
  const featureList = buildFeatureList(answers);

  return {
    projectName,
    projectSummary: `${compactSentence(answers.appSummary)} for ${compactSentence(
      answers.audience
    )}, scoped toward ${answers.platformTarget === "both" ? "iPhone and Android" : answers.platformTarget}. Neroa is protecting ${compactSentence(
      answers.mvpVersion
    )} as the first launchable version and measuring success against ${compactSentence(
      answers.proofOutcome
    )}.`,
    screenList,
    featureList,
    buildComplexity: complexity,
    startupCostEstimate,
    stackRecommendation,
    nextStepChecklist: [
      `Lock the first-screen sequence around ${featureList[0] ?? "the core mobile workflow"}.`,
      `Decide whether ${stackRecommendation.recommendedPathValue} should be the first execution route.`,
      "Confirm backend, auth, and data model requirements before design or coding widens.",
      "Prepare the first validation test before app-store prep becomes the priority."
    ],
    assignedAgents: ["narua", "forge", "atlas", "repolink", "ops"],
    answers
  };
}
