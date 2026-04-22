import type { StrategyLaneField } from "@/lib/workspace/strategy-lane-types";

export function inferStrategyLaneRefinementField(message: string): StrategyLaneField | null {
  const normalized = message.toLowerCase();

  if (normalized.includes("customer") || normalized.includes("user") || normalized.includes("audience")) {
    return "target";
  }

  if (normalized.includes("offer") || normalized.includes("service") || normalized.includes("product")) {
    return "offer";
  }

  if (normalized.includes("budget") || normalized.includes("$") || normalized.includes("cost")) {
    return "budget";
  }

  if (normalized.includes("launch") || normalized.includes("timeline") || normalized.includes("roadmap")) {
    return "launch";
  }

  if (normalized.includes("website") || normalized.includes("brand") || normalized.includes("operations") || normalized.includes("need")) {
    return "needs";
  }

  if (normalized.includes("business") || normalized.includes("model") || normalized.includes("strategy")) {
    return "concept";
  }

  return null;
}
