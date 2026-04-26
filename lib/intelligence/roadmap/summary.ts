import type { RoadmapPlan } from "./types.ts";

function joinList(values: readonly string[]) {
  if (values.length === 0) {
    return null;
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function formatRoadmapStatus(status: RoadmapPlan["status"]) {
  if (status === "approval_ready") {
    return "Approval ready";
  }

  if (status === "review_ready") {
    return "Review ready";
  }

  return "Draft roadmap";
}

export type RoadmapPlanSummary = {
  headline: string;
  statusLabel: string;
  mvpSummary: string;
  phaseNames: string[];
  criticalPathLabels: string[];
  openQuestionLabels: string[];
  notInScopeLabels: string[];
};

export function buildRoadmapPlanSummary(roadmapPlan: RoadmapPlan): RoadmapPlanSummary {
  return {
    headline: `${roadmapPlan.phases.length} phases / ${roadmapPlan.mvpDefinition.targetPersonas.length} core personas`,
    statusLabel: `${formatRoadmapStatus(roadmapPlan.status)} / readiness ${roadmapPlan.readinessScore}`,
    mvpSummary: roadmapPlan.mvpDefinition.summary,
    phaseNames: roadmapPlan.phases.map((phase) => phase.name),
    criticalPathLabels: roadmapPlan.criticalPath.map((step) => step.label),
    openQuestionLabels: roadmapPlan.openQuestions.slice(0, 4).map((question) => question.label),
    notInScopeLabels: Array.from(
      new Set(roadmapPlan.phases.flatMap((phase) => phase.notInScope.map((item) => item.label)))
    ).slice(0, 6)
  };
}

export function buildRoadmapPhaseSummary(roadmapPlan: RoadmapPlan) {
  return joinList(roadmapPlan.phases.map((phase) => phase.name)) ?? "Roadmap phases still need planning.";
}
