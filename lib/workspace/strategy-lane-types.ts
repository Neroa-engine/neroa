import type { NaruaMessage } from "@/lib/narua/planning";
import type { PricingRecommendation } from "@/lib/pricing/recommendation";

export type StrategyLaneField =
  | "concept"
  | "target"
  | "offer"
  | "launch"
  | "budget"
  | "needs";

export type StrategyRoadmapItem = {
  id: string;
  title: string;
  detail: string;
  status: "now" | "next" | "later";
};

export type StrategyBudgetEstimate = {
  title: string;
  rangeLabel: string;
  summary: string;
  lineItems: Array<{
    label: string;
    amountLabel: string;
    note: string;
  }>;
  assumptions: string[];
};

export type StrategyLaneLabels = {
  modelTitle: string;
  targetTitle: string;
  offerTitle: string;
  launchTitle: string;
  budgetTitle: string;
};

export type StrategyLaneAnswers = {
  concept: string;
  target: string;
  offer: string;
  launch: string;
  budget: string;
  needs: string;
};

export type StrategyLaneOutputs = {
  projectSummary: string;
  model: string;
  target: string;
  offer: string;
  launch: string;
  roadmap: StrategyRoadmapItem[];
  budget: StrategyBudgetEstimate;
  recommendedPlan: PricingRecommendation;
  recentActions: string[];
  blockers: string[];
};

export type StrategyLaneSnapshot = {
  version: 1;
  messages: NaruaMessage[];
  draft: string;
  updatedAt: string;
  contextTitle: string | null;
  activeQuestionField: StrategyLaneField | null;
  answers: StrategyLaneAnswers;
  outputs: StrategyLaneOutputs | null;
};

export type StrategyLaneQuestion = {
  field: StrategyLaneField;
  prompt: string;
};
