export type LaneStatus = "active" | "beta" | "hidden" | "internal";

export type LaneLayout = "planning" | "content" | "campaign" | "workflow";

export type LaneId =
  | "business"
  | "branding"
  | "website"
  | "saas-app"
  | "marketing"
  | "sales"
  | "content-media"
  | "operations"
  | "automation-ai-systems"
  | "crypto";

export type ModuleId =
  | "overview"
  | "roadmap"
  | "tasks"
  | "files"
  | "business-plan"
  | "strategy"
  | "budget"
  | "launch-plan"
  | "site-plan"
  | "domain-brand"
  | "pages"
  | "copy"
  | "product-brief"
  | "mvp-scope"
  | "features"
  | "tech-stack"
  | "marketing-plan"
  | "campaigns"
  | "funnels"
  | "content-calendar"
  | "sops"
  | "workflow-map"
  | "data-entry"
  | "advertising-ops"
  | "automation-ideas"
  | "project-concept"
  | "community-plan"
  | "risk-notes";

export type LaneDefinition = {
  id: LaneId;
  name: string;
  description: string;
  icon: string;
  status: LaneStatus;
  layoutType: LaneLayout;
  defaultModules: ModuleId[];
  recommendedAIStack: string[];
  starterPrompts: string[];
  supportingLanes: LaneId[];
};

export type ModuleDefinition = {
  id: ModuleId;
  name: string;
  description: string;
  category: "core" | "planning" | "content" | "campaign" | "workflow";
};
