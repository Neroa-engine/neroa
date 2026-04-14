import type { AgentId } from "@/lib/ai/agents";
import { buildWorkspaceName } from "@/lib/narua/planning";

export type SaasBinaryChoice = "yes" | "no" | "not-sure";
export type SaasGuidanceMode = "roadmap-only" | "guide-build";

export type SaasIntakeAnswers = {
  productSummary: string;
  customer: string;
  problem: string;
  features: string;
  needsAccounts: SaasBinaryChoice;
  takesPayments: SaasBinaryChoice;
  needsAdminDashboard: SaasBinaryChoice;
  guidanceMode: SaasGuidanceMode;
};

export type SaasWorkspaceBlueprint = {
  projectName: string;
  projectSummary: string;
  mvpFeatureList: string[];
  buildComplexity: {
    label: "Lean" | "Moderate" | "Advanced";
    summary: string;
  };
  startupCostEstimate: {
    rangeLabel: string;
    summary: string;
  };
  nextStepChecklist: string[];
  assignedAgents: AgentId[];
  answers: SaasIntakeAnswers;
};

const saasAssignedAgents: AgentId[] = ["narua", "forge", "atlas", "repolink", "ops"];

function normalizeFeatureList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function toSentenceList(items: string[]) {
  if (items.length === 0) {
    return "a focused first feature set";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function estimateComplexity(args: {
  featureCount: number;
  needsAccounts: SaasBinaryChoice;
  takesPayments: SaasBinaryChoice;
  needsAdminDashboard: SaasBinaryChoice;
  guidanceMode: SaasGuidanceMode;
}) {
  let score = 0;

  if (args.featureCount >= 5) {
    score += 2;
  } else if (args.featureCount >= 3) {
    score += 1;
  }

  if (args.needsAccounts === "yes") {
    score += 1;
  }

  if (args.takesPayments === "yes") {
    score += 2;
  }

  if (args.needsAdminDashboard === "yes") {
    score += 1;
  }

  if (args.guidanceMode === "guide-build") {
    score += 1;
  }

  if (score <= 2) {
    return {
      label: "Lean" as const,
      summary:
        "This looks like a lean SaaS MVP. Naroa can keep the first release tight around one primary workflow and a smaller delivery surface."
    };
  }

  if (score <= 5) {
    return {
      label: "Moderate" as const,
      summary:
        "This is a moderate SaaS build. The product has enough moving parts that roadmap control, feature trimming, and build sequencing matter early."
    };
  }

  return {
    label: "Advanced" as const,
    summary:
      "This is an advanced SaaS build. The combination of product scope, admin needs, payments, and delivery depth means Naroa should guide execution closely."
  };
}

function estimateStartupCost(args: {
  complexity: "Lean" | "Moderate" | "Advanced";
  guidanceMode: SaasGuidanceMode;
  takesPayments: SaasBinaryChoice;
  needsAdminDashboard: SaasBinaryChoice;
}) {
  const base =
    args.complexity === "Lean"
      ? { low: 6000, high: 15000 }
      : args.complexity === "Moderate"
        ? { low: 15000, high: 35000 }
        : { low: 35000, high: 80000 };

  let low = base.low;
  let high = base.high;

  if (args.guidanceMode === "guide-build") {
    low += 1500;
    high += 5000;
  }

  if (args.takesPayments === "yes") {
    low += 1000;
    high += 3500;
  }

  if (args.needsAdminDashboard === "yes") {
    low += 1200;
    high += 4500;
  }

  return {
    rangeLabel: `$${low.toLocaleString("en-US")} - $${high.toLocaleString("en-US")}`,
    summary:
      args.guidanceMode === "roadmap-only"
        ? "This estimate assumes Neroa is helping shape the roadmap, scope, and first build plan before heavier delivery work begins."
        : "This estimate assumes Neroa is guiding both the roadmap and the build sequence, including execution structure and first release planning."
  };
}

export function buildSaasWorkspaceBlueprint(
  answers: SaasIntakeAnswers
): SaasWorkspaceBlueprint {
  const mvpFeatureList = normalizeFeatureList(answers.features);
  const projectName = buildWorkspaceName(answers.productSummary);
  const complexity = estimateComplexity({
    featureCount: mvpFeatureList.length,
    needsAccounts: answers.needsAccounts,
    takesPayments: answers.takesPayments,
    needsAdminDashboard: answers.needsAdminDashboard,
    guidanceMode: answers.guidanceMode
  });
  const startupCostEstimate = estimateStartupCost({
    complexity: complexity.label,
    guidanceMode: answers.guidanceMode,
    takesPayments: answers.takesPayments,
    needsAdminDashboard: answers.needsAdminDashboard
  });

  const nextStepChecklist = [
    `Lock the first customer around ${answers.customer}.`,
    `Trim the MVP to ${toSentenceList(mvpFeatureList)}.`,
    answers.needsAccounts === "yes"
      ? "Map the account and login flow before adding secondary features."
      : "Confirm whether the first release can stay account-light to keep the build lean.",
    answers.takesPayments === "yes"
      ? "Decide how payments, pricing, and billing should work in version one."
      : "Decide whether payments belong in the first release or a later launch phase.",
    answers.needsAdminDashboard === "yes"
      ? "Scope the admin dashboard to the minimum operational controls needed at launch."
      : "Keep internal tooling lean unless operations clearly require an admin layer.",
    answers.guidanceMode === "guide-build"
      ? "Move from roadmap into build guidance with Forge, RepoLink, and Ops active."
      : "Use Naroa to finalize the roadmap before widening into build execution."
  ];

  return {
    projectName,
    projectSummary: `${projectName} is being shaped as a SaaS product for ${answers.customer}. It is designed to solve ${answers.problem} with an MVP centered on ${toSentenceList(
      mvpFeatureList
    )}.`,
    mvpFeatureList,
    buildComplexity: complexity,
    startupCostEstimate,
    nextStepChecklist,
    assignedAgents: saasAssignedAgents,
    answers
  };
}
