import type { ModuleDefinition, ModuleId } from "@/lib/workspace/types";

export const moduleRegistry: Record<ModuleId, ModuleDefinition> = {
  overview: {
    id: "overview",
    name: "Overview",
    description: "Shared summary, priorities, and current focus for the workspace.",
    category: "core"
  },
  roadmap: {
    id: "roadmap",
    name: "Roadmap",
    description: "High-level phases, sequencing, and milestones.",
    category: "core"
  },
  tasks: {
    id: "tasks",
    name: "Tasks",
    description: "Actionable work items and execution checklists.",
    category: "core"
  },
  files: {
    id: "files",
    name: "Files",
    description: "Docs, assets, references, and source artifacts.",
    category: "core"
  },
  "business-plan": {
    id: "business-plan",
    name: "Business Plan",
    description: "Model the offer, positioning, audience, and economics.",
    category: "planning"
  },
  strategy: {
    id: "strategy",
    name: "Strategy",
    description: "Clarify positioning, market angle, and decision criteria.",
    category: "planning"
  },
  budget: {
    id: "budget",
    name: "Budget",
    description: "Track cost assumptions, runway, and investment needs.",
    category: "planning"
  },
  "launch-plan": {
    id: "launch-plan",
    name: "Launch Plan",
    description: "Organize launch sequencing, readiness, and rollout.",
    category: "planning"
  },
  "site-plan": {
    id: "site-plan",
    name: "Site Plan",
    description: "Structure site goals, user journeys, and page hierarchy.",
    category: "content"
  },
  "domain-brand": {
    id: "domain-brand",
    name: "Domain / Brand",
    description: "Capture naming, domain, and brand direction decisions.",
    category: "content"
  },
  pages: {
    id: "pages",
    name: "Pages",
    description: "Outline the page set, page roles, and destination paths.",
    category: "content"
  },
  copy: {
    id: "copy",
    name: "Copy",
    description: "Draft headline, product, and conversion messaging.",
    category: "content"
  },
  "product-brief": {
    id: "product-brief",
    name: "Product Brief",
    description: "Define the product concept, user, and success criteria.",
    category: "planning"
  },
  "mvp-scope": {
    id: "mvp-scope",
    name: "MVP Scope",
    description: "Scope the smallest valuable first release.",
    category: "planning"
  },
  features: {
    id: "features",
    name: "Features",
    description: "Capture user-facing capabilities and decisions.",
    category: "planning"
  },
  "tech-stack": {
    id: "tech-stack",
    name: "Tech Stack",
    description: "Recommend implementation architecture and dependencies.",
    category: "planning"
  },
  "marketing-plan": {
    id: "marketing-plan",
    name: "Marketing Plan",
    description: "Plan channels, positioning, and campaign direction.",
    category: "campaign"
  },
  campaigns: {
    id: "campaigns",
    name: "Campaigns",
    description: "Track campaigns, tests, and launch initiatives.",
    category: "campaign"
  },
  funnels: {
    id: "funnels",
    name: "Funnels",
    description: "Map traffic, conversion steps, and nurture paths.",
    category: "campaign"
  },
  "content-calendar": {
    id: "content-calendar",
    name: "Content Calendar",
    description: "Coordinate publishing, promotion, and asset sequencing.",
    category: "campaign"
  },
  sops: {
    id: "sops",
    name: "SOPs",
    description: "Capture repeatable processes and operating procedures.",
    category: "workflow"
  },
  "workflow-map": {
    id: "workflow-map",
    name: "Workflow Map",
    description: "Visualize systems, handoffs, and operational movement.",
    category: "workflow"
  },
  "data-entry": {
    id: "data-entry",
    name: "Data Entry",
    description: "Organize structured repetitive work and support flows.",
    category: "workflow"
  },
  "advertising-ops": {
    id: "advertising-ops",
    name: "Advertising Ops",
    description: "Manage recurring ad operations and execution routines.",
    category: "workflow"
  },
  "automation-ideas": {
    id: "automation-ideas",
    name: "Automation Ideas",
    description: "Identify high-leverage AI and automation opportunities.",
    category: "workflow"
  },
  "project-concept": {
    id: "project-concept",
    name: "Project Concept",
    description: "Frame the concept, thesis, and value proposition.",
    category: "planning"
  },
  "community-plan": {
    id: "community-plan",
    name: "Community Plan",
    description: "Support audience, ecosystem, and community growth strategy.",
    category: "campaign"
  },
  "risk-notes": {
    id: "risk-notes",
    name: "Risk Notes",
    description: "Capture dependencies, unknowns, and downside scenarios.",
    category: "planning"
  }
};

export function getModuleDefinitions(moduleIds: ModuleId[]) {
  return moduleIds.map((moduleId) => moduleRegistry[moduleId]).filter(Boolean);
}
