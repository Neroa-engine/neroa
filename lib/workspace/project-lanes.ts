import {
  projectLanePhaseOrder,
  projectLanePhaseRegistry,
  projectTemplateRegistry,
  type CustomProjectLaneInput,
  type LaneConversationSnapshot,
  type ProjectLaneBlueprint,
  type ProjectLanePhaseId,
  type ProjectLanePhaseDefinition,
  type ProjectLanePhaseGroup,
  type ProjectLaneRecord,
  type ProjectLaneStatus,
  type ProjectRecord,
  type ProjectTemplateId
} from "@/lib/workspace/project-lane-definitions";
import { normalizeLaneId } from "@/lib/workspace/lanes";
import type { LaneId } from "@/lib/workspace/types";

export * from "@/lib/workspace/project-lane-definitions";

const legacyLaneKeywords: Record<LaneId, string[]> = {
  business: ["strategy", "business-plan", "brand-strategy"],
  branding: ["branding", "domain-search", "brand-strategy"],
  website: ["website", "launch-website", "storefront"],
  "saas-app": ["coding", "mvp-scope", "product-strategy", "architecture"],
  marketing: ["marketing", "growth"],
  sales: ["marketing", "growth"],
  "content-media": ["marketing", "branding"],
  operations: ["operations", "deployment"],
  "automation-ai-systems": ["operations", "architecture"],
  crypto: ["strategy", "budget", "marketing"]
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeLaneBlueprint(
  blueprint: ProjectLaneBlueprint | CustomProjectLaneInput
): ProjectLaneBlueprint {
  return {
    title: blueprint.title,
    description: blueprint.description,
    status: blueprint.status ?? "optional",
    focusLabel: blueprint.focusLabel ?? blueprint.title,
    recommendedAIStack: blueprint.recommendedAIStack ?? ["Neroa Execution Layer"],
    starterPrompts: blueprint.starterPrompts ?? [],
    deliverables: blueprint.deliverables ?? []
  };
}

export function getProjectTemplateDefinition(templateId: ProjectTemplateId) {
  return projectTemplateRegistry[templateId];
}

export function getProjectLanePhaseDefinition(phaseId: ProjectLanePhaseId) {
  return projectLanePhaseRegistry[phaseId];
}

export function getProjectLanePhaseForLane(
  lane: Pick<ProjectLaneRecord, "slug" | "title" | "description">
): ProjectLanePhaseDefinition {
  const text = `${lane.slug} ${lane.title} ${lane.description}`.toLowerCase();

  if (text.includes("budget")) {
    return projectLanePhaseRegistry.budget;
  }

  if (text.includes("scope") || text.includes("mvp")) {
    return projectLanePhaseRegistry.strategy;
  }

  if (
    text.includes("operations") ||
    text.includes("operate") ||
    text.includes("automation") ||
    text.includes("deployment") ||
    text.includes("documentation") ||
    text.includes("maintenance") ||
    text.includes("kpi") ||
    text.includes("fulfillment")
  ) {
    return projectLanePhaseRegistry.operations;
  }

  if (
    text.includes("website") ||
    text.includes("storefront") ||
    text.includes("saas") ||
    text.includes("app") ||
    text.includes("mobile") ||
    text.includes("expo") ||
    text.includes("react native") ||
    text.includes("coding") ||
    text.includes("architecture") ||
    text.includes("mvp") ||
    text.includes("feature") ||
    text.includes("technical") ||
    text.includes("requirements") ||
    text.includes("testing") ||
    text.includes("data model") ||
    text.includes("ui ux")
  ) {
    return projectLanePhaseRegistry.build;
  }

  if (
    text.includes("marketing") ||
    text.includes("growth") ||
    text.includes("sales") ||
    text.includes("campaign") ||
    text.includes("launch") ||
    text.includes("go-live") ||
    text.includes("release") ||
    text.includes("onboarding")
  ) {
    return projectLanePhaseRegistry.launch;
  }

  return projectLanePhaseRegistry.strategy;
}

export function inferProjectTemplate(args: {
  name: string;
  description?: string | null;
  primaryLaneId?: LaneId | null;
}) {
  const text = `${args.name}\n${args.description ?? ""}`.toLowerCase();

  if (
    text.includes("mobile") ||
    text.includes("ios") ||
    text.includes("iphone") ||
    text.includes("android") ||
    text.includes("react native") ||
    text.includes("expo") ||
    text.includes("testflight") ||
    text.includes("play store")
  ) {
    return "mobile-app-build" as const;
  }

  if (
    text.includes("shopify") ||
    text.includes("ecommerce") ||
    text.includes("e-commerce") ||
    text.includes("storefront") ||
    text.includes("product catalog") ||
    text.includes("brand launch")
  ) {
    return "ecommerce-brand" as const;
  }

  if (
    text.includes("coding") ||
    text.includes("codebase") ||
    text.includes("repository") ||
    text.includes("repo") ||
    text.includes("sdk") ||
    text.includes("library") ||
    text.includes("cli") ||
    text.includes("refactor") ||
    text.includes("bug fix")
  ) {
    return "coding-project" as const;
  }

  if (
    args.primaryLaneId === "saas-app" ||
    text.includes("saas") ||
    text.includes("software") ||
    text.includes("app") ||
    text.includes("platform")
  ) {
    return "saas-build" as const;
  }

  return "business-launch" as const;
}

export function createProjectLaneRecord(args: {
  projectId: string;
  sortOrder: number;
  blueprint: ProjectLaneBlueprint | CustomProjectLaneInput;
}) {
  const normalizedBlueprint = normalizeLaneBlueprint(args.blueprint);
  const slug = slugify(normalizedBlueprint.title);

  return {
    id: `${args.projectId}:${slug}`,
    projectId: args.projectId,
    title: normalizedBlueprint.title,
    slug,
    description: normalizedBlueprint.description,
    status: normalizedBlueprint.status,
    sortOrder: args.sortOrder,
    focusLabel: normalizedBlueprint.focusLabel,
    recommendedAIStack: normalizedBlueprint.recommendedAIStack,
    starterPrompts: normalizedBlueprint.starterPrompts,
    deliverables: normalizedBlueprint.deliverables
  } satisfies ProjectLaneRecord;
}

export function buildProjectModel(args: {
  workspaceId: string;
  projectId: string;
  title: string;
  description?: string | null;
  templateId?: ProjectTemplateId | null;
  primaryLaneId?: LaneId | null;
  customLanes?: CustomProjectLaneInput[];
}) {
  const templateId =
    args.templateId ??
    inferProjectTemplate({
      name: args.title,
      description: args.description,
      primaryLaneId: args.primaryLaneId
    });
  const template = getProjectTemplateDefinition(templateId);
  const laneBlueprints = [...template.lanes, ...(args.customLanes ?? [])];
  const lanes = laneBlueprints.map((blueprint, index) =>
    createProjectLaneRecord({
      projectId: args.projectId,
      sortOrder: index,
      blueprint
    })
  );

  return {
    id: args.projectId,
    workspaceId: args.workspaceId,
    templateId,
    templateLabel: template.label,
    title: args.title,
    description: args.description ?? null,
    lanes
  } satisfies ProjectRecord;
}

export function getProjectLaneBySlug(project: ProjectRecord, laneSlug: string) {
  return project.lanes.find((lane) => lane.slug === laneSlug) ?? null;
}

export function sortProjectLanes(lanes: ProjectLaneRecord[]) {
  return [...lanes].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getOrderedProjectLanes(project: ProjectRecord) {
  return sortProjectLanes(project.lanes);
}

export function getProjectLanePhaseGroups(project: ProjectRecord) {
  return projectLanePhaseOrder
    .map((phaseId) => ({
      ...projectLanePhaseRegistry[phaseId],
      lanes: sortProjectLanes(
        project.lanes.filter((lane) => getProjectLanePhaseForLane(lane).id === phaseId)
      )
    }))
    .filter((group): group is ProjectLanePhaseGroup => group.lanes.length > 0);
}

export function getFirstProjectLane(project: ProjectRecord) {
  return getOrderedProjectLanes(project)[0] ?? null;
}

export function getProjectLanesByStatus(
  project: ProjectRecord,
  status: ProjectLaneStatus
) {
  return sortProjectLanes(project.lanes.filter((lane) => lane.status === status));
}

export function resolveProjectLaneSlug(project: ProjectRecord, value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = slugify(value);
  const directMatch = project.lanes.find((lane) => lane.slug === normalizedValue);

  if (directMatch) {
    return directMatch.slug;
  }

  const legacyLaneId = normalizeLaneId(value);

  if (!legacyLaneId) {
    return null;
  }

  const keywordMatch = legacyLaneKeywords[legacyLaneId]
    .flatMap((keyword) => project.lanes.filter((lane) => lane.slug.includes(keyword)))
    .sort((left, right) => left.sortOrder - right.sortOrder)[0];

  return keywordMatch?.slug ?? project.lanes[0]?.slug ?? null;
}

