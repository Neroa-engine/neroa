import type { ProjectTemplateId } from "@/lib/workspace/project-lanes";
import type { LaneId, ModuleId } from "@/lib/workspace/types";

export type NaruaStage = "intake" | "clarification" | "synthesis" | "review";

export type PlanningField =
  | "idea"
  | "projectType"
  | "targetUser"
  | "mainGoal"
  | "mvp"
  | "integrations";

export type PlanningAnswers = {
  idea: string;
  projectType: string;
  targetUser: string;
  mainGoal: string;
  mvp: string;
  integrations: string;
};

export type NaruaMessage = {
  id: string;
  role: "narua" | "user";
  content: string;
};

export type NaruaQuestion = {
  field: PlanningField;
  prompt: string;
};

export type TeammateRecommendation = {
  id: "narua" | "atlas" | "forge" | "repolink";
  name: string;
  provider: "chatgpt" | "claude" | "codex" | "github";
  role: string;
  status: "active" | "recommended" | "standby";
  reason: string;
};

export type GeneratedPlan = {
  title: string;
  projectTemplateId: ProjectTemplateId;
  overview: string;
  projectSummary: string;
  targetUser: string;
  mainGoal: string;
  mvpScope: string[];
  primaryLaneId: LaneId;
  supportingLaneIds: LaneId[];
  recommendedModules: ModuleId[];
  recommendedStack: string[];
  phases: Array<{
    title: string;
    summary: string;
    items: string[];
  }>;
  teammates: TeammateRecommendation[];
  nextSteps: string[];
  expandedSection: {
    title: string;
    paragraphs: string[];
  } | null;
  tasks: string[];
  refinementNotes: string[];
};

export type ReviewAction = "refine" | "expand" | "tasks" | "build_app";

export type NaruaEngineContext = {
  workspaceId: string;
  workspaceName: string;
  workspaceDescription?: string | null;
  engineSlug: string;
  engineTitle: string;
  engineDescription: string;
  recommendedAIStack: string[];
};

export type NaruaWorkspaceContext = {
  workspaceId: string;
  workspaceName: string;
  workspaceDescription?: string | null;
  primaryLaneName: string;
  supportingLaneNames: string[];
  currentGoal?: string | null;
  recommendedMove?: string | null;
  activeBlocker?: string | null;
};

export type WorkspaceIntakeField =
  | "idea"
  | "businessType"
  | "targetCustomer"
  | "services"
  | "operationSize"
  | "budgetTimeline";

export type WorkspaceIntakeQuestion = {
  field: WorkspaceIntakeField;
  prompt: string;
};

export type WorkspaceIntakeAnswers = {
  idea: string;
  businessType: string;
  targetCustomer: string;
  services: string;
  operationSize: string;
  budgetTimeline: string;
};

export type WorkspaceGeneratedSections = {
  overview: string[];
  businessModel: string[];
  offer: string[];
  roadmap: string[];
  budgetModel: string[];
  executionSteps: string[];
};
