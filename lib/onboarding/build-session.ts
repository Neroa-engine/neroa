import type {
  ExampleBuildPath,
  ExampleBuildProject,
  ExampleBuildSelection,
  ExampleIntentMode,
  ExampleStackRecommendation
} from "@/lib/marketing/example-build-data";
import type { GuidedBuildHandoffSource, GuidedBuildPathId } from "@/lib/onboarding/guided-handoff";

export const BUILD_SESSION_STORAGE_KEY = "neroa:guided-build-session:v1";

export type BuildSessionPhase =
  | "homepage-guide"
  | "example-build"
  | "start-intake"
  | "engine-review"
  | "workspace";

export type BuildSessionScope = {
  productTypeId?: string;
  productTypeLabel?: string;
  buildTypeId?: string;
  buildTypeLabel?: string;
  buildStageId?: string;
  buildStageLabel?: string;
  intentMode?: ExampleIntentMode;
  industryId?: string;
  industryLabel?: string;
  opportunityAreaId?: string;
  opportunityAreaLabel?: string;
  frameworkId?: string;
  frameworkLabel?: string;
  exampleId?: string;
  exampleLabel?: string;
  stackRecommendationLabel?: string;
  stackRecommendationSummary?: string;
  stackSystems?: string[];
  title?: string;
  summary?: string;
  problem?: string;
  audience?: string;
  coreFeatures?: string[];
  keyModules?: string[];
  firstBuild?: string[];
  mvpSummary?: string;
  businessGoal?: string;
  conceptMode?: string;
  ventureType?: string;
  surfaceType?: string;
  businessDirectionSummary?: string;
  projectDefinitionSummary?: string;
  targetUsers?: string;
  coreWorkflow?: string;
  keyFeatures?: string[];
  monetization?: string;
  integrationNeeds?: string[];
  priorityTradeoff?: string;
  experienceDirectionSummary?: string;
  experienceStyle?: string;
  platformStyle?: string;
  automationLevel?: string;
  complexityLevel?: string;
  estimateBaseline?: string;
  estimateRange?: string;
  timeEstimate?: string;
};

export type BuildSessionPath = {
  selectedPathId?: GuidedBuildPathId;
  selectedPathLabel?: string;
  recommendedPathMode?: GuidedBuildPathId;
  recommendedPathLabel?: string;
  recommendationReason?: string;
  recommendedDetailId?: string;
};

export type BuildSessionCredits = {
  source: "example" | "scoped" | "pending";
  estimateLabel?: string;
  estimatedMin?: number;
  estimatedMax?: number;
  estimatedTotal?: number;
  estimatedTimeline?: string;
  note?: string;
};

export type BuildSessionProgress = {
  phase: BuildSessionPhase;
  currentStep: string;
  currentStepLabel?: string;
  currentRoute: string;
  completedSteps: string[];
};

export type GuidedBuildSession = {
  version: 1;
  sessionId: string;
  source: GuidedBuildHandoffSource | "start";
  userIntent?: string;
  preferences?: string[];
  guidedMode?: boolean;
  scope: BuildSessionScope;
  path: BuildSessionPath;
  credits: BuildSessionCredits;
  progress: BuildSessionProgress;
  updatedAt: string;
};

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function normalizePathId(value: unknown): GuidedBuildPathId | undefined {
  return value === "diy" || value === "managed" || value === "pricing" ? value : undefined;
}

function normalizeCreditsValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizePhase(value: unknown): BuildSessionPhase {
  return value === "homepage-guide" ||
    value === "example-build" ||
    value === "start-intake" ||
    value === "engine-review" ||
    value === "workspace"
    ? value
    : "homepage-guide";
}

function normalizeCreditsSource(value: unknown): BuildSessionCredits["source"] {
  return value === "example" || value === "scoped" ? value : "pending";
}

function normalizeSource(value: unknown): GuidedBuildSession["source"] {
  return value === "homepage-guide" || value === "example-build" || value === "start"
    ? value
    : "start";
}

function normalizeScope(value: unknown): BuildSessionScope {
  if (!value || typeof value !== "object") {
    return {};
  }

  const record = value as Record<string, unknown>;

  return {
    productTypeId: normalizeString(record.productTypeId),
    productTypeLabel: normalizeString(record.productTypeLabel),
    buildTypeId: normalizeString(record.buildTypeId),
    buildTypeLabel: normalizeString(record.buildTypeLabel),
    buildStageId: normalizeString(record.buildStageId),
    buildStageLabel: normalizeString(record.buildStageLabel),
    intentMode:
      record.intentMode === "known-industry" || record.intentMode === "exploring-opportunities"
        ? record.intentMode
        : undefined,
    industryId: normalizeString(record.industryId),
    industryLabel: normalizeString(record.industryLabel),
    opportunityAreaId: normalizeString(record.opportunityAreaId),
    opportunityAreaLabel: normalizeString(record.opportunityAreaLabel),
    frameworkId: normalizeString(record.frameworkId),
    frameworkLabel: normalizeString(record.frameworkLabel),
    exampleId: normalizeString(record.exampleId),
    exampleLabel: normalizeString(record.exampleLabel),
    stackRecommendationLabel: normalizeString(record.stackRecommendationLabel),
    stackRecommendationSummary: normalizeString(record.stackRecommendationSummary),
    stackSystems: normalizeStringArray(record.stackSystems),
    title: normalizeString(record.title),
    summary: normalizeString(record.summary),
    problem: normalizeString(record.problem),
    audience: normalizeString(record.audience),
    coreFeatures: normalizeStringArray(record.coreFeatures),
    keyModules: normalizeStringArray(record.keyModules),
    firstBuild: normalizeStringArray(record.firstBuild),
    mvpSummary: normalizeString(record.mvpSummary),
    businessGoal: normalizeString(record.businessGoal),
    conceptMode: normalizeString(record.conceptMode),
    ventureType: normalizeString(record.ventureType),
    surfaceType: normalizeString(record.surfaceType),
    businessDirectionSummary: normalizeString(record.businessDirectionSummary),
    projectDefinitionSummary: normalizeString(record.projectDefinitionSummary),
    targetUsers: normalizeString(record.targetUsers),
    coreWorkflow: normalizeString(record.coreWorkflow),
    keyFeatures: normalizeStringArray(record.keyFeatures),
    monetization: normalizeString(record.monetization),
    integrationNeeds: normalizeStringArray(record.integrationNeeds),
    priorityTradeoff: normalizeString(record.priorityTradeoff),
    experienceDirectionSummary: normalizeString(record.experienceDirectionSummary),
    experienceStyle: normalizeString(record.experienceStyle),
    platformStyle: normalizeString(record.platformStyle),
    automationLevel: normalizeString(record.automationLevel),
    complexityLevel: normalizeString(record.complexityLevel),
    estimateBaseline: normalizeString(record.estimateBaseline),
    estimateRange: normalizeString(record.estimateRange),
    timeEstimate: normalizeString(record.timeEstimate)
  };
}

function normalizePath(value: unknown): BuildSessionPath {
  if (!value || typeof value !== "object") {
    return {};
  }

  const record = value as Record<string, unknown>;

  return {
    selectedPathId: normalizePathId(record.selectedPathId),
    selectedPathLabel: normalizeString(record.selectedPathLabel),
    recommendedPathMode: normalizePathId(record.recommendedPathMode),
    recommendedPathLabel: normalizeString(record.recommendedPathLabel),
    recommendationReason: normalizeString(record.recommendationReason),
    recommendedDetailId: normalizeString(record.recommendedDetailId)
  };
}

function normalizeCredits(value: unknown): BuildSessionCredits {
  if (!value || typeof value !== "object") {
    return {
      source: "pending"
    };
  }

  const record = value as Record<string, unknown>;

  return {
    source: normalizeCreditsSource(record.source),
    estimateLabel: normalizeString(record.estimateLabel),
    estimatedMin: normalizeCreditsValue(record.estimatedMin),
    estimatedMax: normalizeCreditsValue(record.estimatedMax),
    estimatedTotal: normalizeCreditsValue(record.estimatedTotal),
    estimatedTimeline: normalizeString(record.estimatedTimeline),
    note: normalizeString(record.note)
  };
}

function normalizeProgress(value: unknown): BuildSessionProgress {
  if (!value || typeof value !== "object") {
    return {
      phase: "homepage-guide",
      currentStep: "landing-hero",
      currentRoute: "/",
      completedSteps: []
    };
  }

  const record = value as Record<string, unknown>;

  return {
    phase: normalizePhase(record.phase),
    currentStep: normalizeString(record.currentStep) ?? "landing-hero",
    currentStepLabel: normalizeString(record.currentStepLabel),
    currentRoute: normalizeString(record.currentRoute) ?? "/",
    completedSteps: normalizeStringArray(record.completedSteps) ?? []
  };
}

function resolveStorage(storage?: StorageLike | null) {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function deriveModeFromExamplePath(path: ExampleBuildPath | null | undefined): GuidedBuildPathId {
  if (!path) {
    return "diy";
  }

  return path.id === "managed" ? "managed" : "diy";
}

export function parseExampleCreditEstimate(value: string | null | undefined) {
  if (!value?.trim()) {
    return {
      min: undefined,
      max: undefined
    };
  }

  const matches = value.match(/\d[\d,]*/g)?.map((item) => Number(item.replace(/,/g, ""))) ?? [];

  if (matches.length === 0) {
    return {
      min: undefined,
      max: undefined
    };
  }

  if (matches.length === 1) {
    return {
      min: matches[0],
      max: matches[0]
    };
  }

  return {
    min: Math.min(matches[0], matches[1]),
    max: Math.max(matches[0], matches[1])
  };
}

export function scopeProject(args: {
  productTypeId?: string | null;
  productTypeLabel?: string | null;
  buildTypeId?: string | null;
  buildTypeLabel?: string | null;
  selection?: ExampleBuildSelection | null;
  stackRecommendation?: ExampleStackRecommendation | null;
  project?: ExampleBuildProject | null;
  title?: string | null;
  summary?: string | null;
  userIntent?: string | null;
}): BuildSessionScope {
  const project = args.project;
  const title =
    normalizeString(args.title) ??
    project?.title;
  const summary =
    normalizeString(args.summary) ??
    project?.summary ??
    (args.userIntent ? `Starting intent: ${args.userIntent.trim()}` : undefined);

  return {
    productTypeId:
      normalizeString(args.productTypeId) ??
      normalizeString(args.selection?.productTypeId) ??
      project?.typeId ??
      normalizeString(args.buildTypeId) ??
      project?.typeId,
    productTypeLabel:
      normalizeString(args.productTypeLabel) ??
      project?.typeLabel ??
      normalizeString(args.buildTypeLabel) ??
      undefined,
    buildTypeId: normalizeString(args.buildTypeId) ?? project?.typeId,
    buildTypeLabel:
      normalizeString(args.buildTypeLabel) ??
      project?.typeLabel ??
      undefined,
    intentMode: args.selection?.intentMode ?? project?.intentMode,
    industryId: normalizeString(args.selection?.industryId) ?? project?.industryId,
    industryLabel: project?.industryLabel,
    opportunityAreaId:
      normalizeString(args.selection?.opportunityAreaId) ?? project?.opportunityAreaId,
    opportunityAreaLabel: project?.opportunityAreaLabel,
    frameworkId: normalizeString(args.selection?.frameworkId) ?? project?.frameworkId,
    frameworkLabel: project?.frameworkLabel,
    exampleId: project?.id,
    exampleLabel: project?.title,
    stackRecommendationLabel: args.stackRecommendation?.headline ?? project?.stackRecommendation.headline,
    stackRecommendationSummary:
      args.stackRecommendation?.summary ?? project?.stackRecommendation.summary,
    stackSystems:
      args.stackRecommendation?.systems.map((system) => system.label) ??
      project?.stackRecommendation.systems.map((system) => system.label),
    title,
    summary,
    problem: project?.problem,
    audience: project?.audience,
    coreFeatures: project?.coreFeatures,
    keyModules: project?.keyModules,
    firstBuild: project?.firstBuild,
    mvpSummary: project?.mvpSummary
  };
}

export function estimateCredits(args: {
  project?: ExampleBuildProject | null;
}): BuildSessionCredits {
  if (args.project) {
    const parsed = parseExampleCreditEstimate(args.project.creditEstimate);
    return {
      source: "example",
      estimateLabel: args.project.creditEstimate,
      estimatedMin: parsed.min,
      estimatedMax: parsed.max,
      estimatedTotal: parsed.max,
      note: args.project.estimateNote
    };
  }

  return {
    source: "pending"
  };
}

export function recommendBuildPath(args: {
  selectedPathId?: GuidedBuildPathId | null;
  selectedPathLabel?: string | null;
  project?: ExampleBuildProject | null;
}): BuildSessionPath {
  const selectedPathId = normalizePathId(args.selectedPathId);
  const selectedPathLabel = normalizeString(args.selectedPathLabel);

  if (args.project) {
    const recommendedPath = args.project.buildPaths.find((path) => path.recommended) ?? args.project.buildPaths[0];
    return {
      selectedPathId,
      selectedPathLabel,
      recommendedPathMode: deriveModeFromExamplePath(recommendedPath),
      recommendedPathLabel: recommendedPath?.label,
      recommendationReason: recommendedPath?.summary,
      recommendedDetailId: recommendedPath?.id
    };
  }

  return {
    selectedPathId,
    selectedPathLabel
  };
}

export function createBuildSession(args?: Partial<GuidedBuildSession>): GuidedBuildSession {
  const now = new Date().toISOString();

  return {
    version: 1,
    sessionId: args?.sessionId ?? createSessionId(),
    source: args?.source ?? "start",
    userIntent: normalizeString(args?.userIntent),
    preferences: normalizeStringArray(args?.preferences),
    guidedMode: typeof args?.guidedMode === "boolean" ? args.guidedMode : undefined,
    scope: normalizeScope(args?.scope),
    path: normalizePath(args?.path),
    credits: normalizeCredits(args?.credits),
    progress: normalizeProgress(args?.progress),
    updatedAt: normalizeString(args?.updatedAt) ?? now
  };
}

export function normalizeBuildSession(value: unknown): GuidedBuildSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  return createBuildSession({
    sessionId: normalizeString(record.sessionId) ?? createSessionId(),
    source: normalizeSource(record.source),
    userIntent: normalizeString(record.userIntent),
    preferences: normalizeStringArray(record.preferences),
    guidedMode: typeof record.guidedMode === "boolean" ? record.guidedMode : undefined,
    scope: normalizeScope(record.scope),
    path: normalizePath(record.path),
    credits: normalizeCredits(record.credits),
    progress: normalizeProgress(record.progress),
    updatedAt: normalizeString(record.updatedAt)
  });
}

export function saveSession(
  session: GuidedBuildSession,
  storage?: StorageLike | null
): GuidedBuildSession {
  const normalized = createBuildSession({
    ...session,
    updatedAt: new Date().toISOString()
  });
  const target = resolveStorage(storage);

  if (target) {
    try {
      target.setItem(BUILD_SESSION_STORAGE_KEY, JSON.stringify(normalized));
    } catch {}
  }

  return normalized;
}

export function loadSavedSession(storage?: StorageLike | null) {
  const target = resolveStorage(storage);

  if (!target) {
    return null;
  }

  try {
    const raw = target.getItem(BUILD_SESSION_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return normalizeBuildSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearSavedSession(storage?: StorageLike | null) {
  const target = resolveStorage(storage);

  if (!target) {
    return;
  }

  try {
    target.removeItem(BUILD_SESSION_STORAGE_KEY);
  } catch {}
}

export function buildBuildSessionSummary(session: GuidedBuildSession | null) {
  if (!session) {
    return "";
  }

  const lines = [
    session.scope.productTypeLabel || session.scope.buildTypeLabel
      ? `Product type: ${session.scope.productTypeLabel ?? session.scope.buildTypeLabel}.`
      : null,
    session.scope.buildStageLabel ? `Build stage: ${session.scope.buildStageLabel}.` : null,
    session.scope.intentMode === "known-industry" && session.scope.industryLabel
      ? `Industry: ${session.scope.industryLabel}.`
      : null,
    session.scope.intentMode === "exploring-opportunities" && session.scope.opportunityAreaLabel
      ? `Opportunity area: ${session.scope.opportunityAreaLabel}.`
      : null,
    session.scope.frameworkLabel ? `Framework: ${session.scope.frameworkLabel}.` : null,
    session.scope.exampleLabel ? `Example explored: ${session.scope.exampleLabel}.` : null,
    session.path.selectedPathLabel ? `Selected path: ${session.path.selectedPathLabel}.` : null,
    session.path.recommendedPathLabel
      ? `Recommended path: ${session.path.recommendedPathLabel}.`
      : null,
    session.credits.estimateLabel ? `Credits: ${session.credits.estimateLabel}.` : null,
    session.scope.summary ? `Scope: ${session.scope.summary}.` : null,
    session.scope.timeEstimate ? `Timing: ${session.scope.timeEstimate}.` : null
  ].filter((line): line is string => Boolean(line));

  return lines.join(" ");
}
