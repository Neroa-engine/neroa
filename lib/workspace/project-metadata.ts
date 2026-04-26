import { normalizeLaneId } from "@/lib/workspace/lanes";
import type { LaneId } from "@/lib/workspace/types";
import type { AgentId } from "@/lib/ai/agents";
import type { SaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import type { MobileAppWorkspaceBlueprint } from "@/lib/onboarding/mobile-app-intake";
import {
  normalizeBuildSession,
  type GuidedBuildSession
} from "@/lib/onboarding/build-session";
import {
  normalizeGuidedBuildHandoff,
  type GuidedBuildHandoff
} from "@/lib/onboarding/guided-handoff";
import {
  getProjectTemplateDefinition,
  inferProjectTemplate,
  type CustomProjectLaneInput,
  type ProjectLaneStatus,
  type ProjectTemplateId
} from "@/lib/workspace/project-lanes";
import {
  normalizeStoredCommandCenterDecision,
  type StoredCommandCenterDecision
} from "@/lib/workspace/command-center-decisions";
import {
  normalizeStoredCommandCenterChangeReview,
  type StoredCommandCenterChangeReview
} from "@/lib/workspace/command-center-change-impact";
import {
  normalizeStoredCommandCenterApprovedDesignPackage,
  normalizeStoredCommandCenterPreviewState,
  type StoredCommandCenterApprovedDesignPackage,
  type StoredCommandCenterPreviewState
} from "@/lib/workspace/command-center-design-preview";
import {
  conversationSessionStateSchema,
  type ConversationSessionState
} from "@/lib/intelligence/conversation";
import {
  normalizeStoredCommandCenterTask,
  type StoredCommandCenterTask
} from "@/lib/workspace/command-center-tasks";
import {
  loadPlatformContext,
  type PlatformContext
} from "@/lib/intelligence/platform-context";

const METADATA_PREFIX = "<!--NEROA_PROJECT_META:";
const METADATA_SUFFIX = "-->";

export type StoredProjectMetadata = {
  version: 1;
  templateId: ProjectTemplateId;
  customLanes: CustomProjectLaneInput[];
  platformContext?: PlatformContext | null;
  conversationState?: ConversationSessionState | null;
  archived?: boolean;
  assets?: StoredProjectAsset[];
  commandCenterBrandSystem?: StoredCommandCenterBrandSystem | null;
  commandCenterDecisions?: StoredCommandCenterDecision[];
  commandCenterChangeReviews?: StoredCommandCenterChangeReview[];
  commandCenterTasks?: StoredCommandCenterTask[];
  commandCenterPreviewState?: StoredCommandCenterPreviewState | null;
  commandCenterApprovedDesignPackage?: StoredCommandCenterApprovedDesignPackage | null;
  guidedFlowPreset?: "saas-app" | "mobile-app";
  guidedEntryContext?: GuidedBuildHandoff | null;
  buildSession?: GuidedBuildSession | null;
  saasIntake?: SaasWorkspaceBlueprint | null;
  mobileAppIntake?: MobileAppWorkspaceBlueprint | null;
};

export type StoredProjectAsset = {
  id: string;
  name: string;
  kind: string;
  sizeLabel: string | null;
  addedAt: string;
};

export type StoredCommandCenterBrandColors = {
  primary: string | null;
  secondary: string | null;
  accent: string | null;
  background: string | null;
  text: string | null;
};

export type StoredCommandCenterBrandSystem = {
  identityMode: string | null;
  motto: string | null;
  typographyPreference: string | null;
  visualMood: string | null;
  buttonStylePreference: string | null;
  colors: StoredCommandCenterBrandColors;
  updatedAt: string | null;
};

export type ParsedWorkspaceProjectDescription = {
  visibleDescription: string | null;
  metadata: StoredProjectMetadata | null;
};

function normalizeStatus(value: unknown): ProjectLaneStatus | undefined {
  if (value === "active" || value === "recommended" || value === "optional") {
    return value;
  }

  return undefined;
}

function normalizeAsset(value: unknown): StoredProjectAsset | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const kind = typeof record.kind === "string" ? record.kind.trim() : "";
  const sizeLabel =
    typeof record.sizeLabel === "string" && record.sizeLabel.trim()
      ? record.sizeLabel.trim()
      : null;
  const addedAt = typeof record.addedAt === "string" ? record.addedAt : new Date(0).toISOString();

  if (!id || !name || !kind) {
    return null;
  }

  return {
    id,
    name,
    kind,
    sizeLabel,
    addedAt
  };
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function normalizeBrandColorValue(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = value.trim();

  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return normalized.toUpperCase();
  }

  return normalized.slice(0, 64);
}

function hasMeaningfulConversationState(value: ConversationSessionState) {
  return Boolean(
    value.founderName ||
      value.productCategory ||
      value.problemStatement ||
      value.outcomePromise ||
      value.monetization ||
      value.audience.buyerPersonas.length > 0 ||
      value.audience.operatorPersonas.length > 0 ||
      value.questionHistory.length > 0 ||
      value.processedUserTurnIds.length > 0
  );
}

function normalizeConversationState(value: unknown) {
  const result = conversationSessionStateSchema.safeParse(value);

  if (!result.success) {
    return null;
  }

  return hasMeaningfulConversationState(result.data) ? result.data : null;
}

export function defaultStoredCommandCenterBrandSystem(): StoredCommandCenterBrandSystem {
  return {
    identityMode: null,
    motto: null,
    typographyPreference: null,
    visualMood: null,
    buttonStylePreference: null,
    colors: {
      primary: null,
      secondary: null,
      accent: null,
      background: null,
      text: null
    },
    updatedAt: null
  };
}

export function normalizeStoredCommandCenterBrandSystem(
  value: unknown
): StoredCommandCenterBrandSystem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const colorRecord =
    record.colors && typeof record.colors === "object"
      ? (record.colors as Record<string, unknown>)
      : {};

  const normalized: StoredCommandCenterBrandSystem = {
    identityMode: typeof record.identityMode === "string" ? record.identityMode.trim() || null : null,
    motto: typeof record.motto === "string" ? record.motto.trim() || null : null,
    typographyPreference:
      typeof record.typographyPreference === "string"
        ? record.typographyPreference.trim() || null
        : null,
    visualMood:
      typeof record.visualMood === "string" ? record.visualMood.trim() || null : null,
    buttonStylePreference:
      typeof record.buttonStylePreference === "string"
        ? record.buttonStylePreference.trim() || null
        : null,
    colors: {
      primary: normalizeBrandColorValue(colorRecord.primary),
      secondary: normalizeBrandColorValue(colorRecord.secondary),
      accent: normalizeBrandColorValue(colorRecord.accent),
      background: normalizeBrandColorValue(colorRecord.background),
      text: normalizeBrandColorValue(colorRecord.text)
    },
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null
  };

  const hasMeaningfulContent =
    Boolean(
      normalized.identityMode ||
        normalized.motto ||
        normalized.typographyPreference ||
        normalized.visualMood ||
        normalized.buttonStylePreference ||
        Object.values(normalized.colors).some(Boolean)
    ) || Boolean(normalized.updatedAt);

  return hasMeaningfulContent ? normalized : null;
}


function normalizeSaasIntake(value: unknown): SaasWorkspaceBlueprint | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const projectName = typeof record.projectName === "string" ? record.projectName.trim() : "";
  const projectSummary =
    typeof record.projectSummary === "string" ? record.projectSummary.trim() : "";
  const mvpFeatureList = normalizeStringArray(record.mvpFeatureList) ?? [];
  const nextStepChecklist = normalizeStringArray(record.nextStepChecklist) ?? [];
  const assignedAgents =
    (normalizeStringArray(record.assignedAgents) ?? []).filter(
      (item): item is AgentId =>
        item === "narua" ||
        item === "forge" ||
        item === "atlas" ||
        item === "repolink" ||
        item === "nova" ||
        item === "pulse" ||
        item === "ops"
    );
  const buildComplexityValue =
    record.buildComplexity && typeof record.buildComplexity === "object"
      ? (record.buildComplexity as Record<string, unknown>)
      : null;
  const startupCostValue =
    record.startupCostEstimate && typeof record.startupCostEstimate === "object"
      ? (record.startupCostEstimate as Record<string, unknown>)
      : null;
  const answersValue =
    record.answers && typeof record.answers === "object"
      ? (record.answers as Record<string, unknown>)
      : null;

  if (!projectName || !projectSummary || !buildComplexityValue || !startupCostValue || !answersValue) {
    return null;
  }

  const complexityLabel =
    buildComplexityValue.label === "Lean" ||
    buildComplexityValue.label === "Moderate" ||
    buildComplexityValue.label === "Advanced"
      ? buildComplexityValue.label
      : null;
  const complexitySummary =
    typeof buildComplexityValue.summary === "string" ? buildComplexityValue.summary.trim() : "";
  const rangeLabel =
    typeof startupCostValue.rangeLabel === "string" ? startupCostValue.rangeLabel.trim() : "";
  const startupSummary =
    typeof startupCostValue.summary === "string" ? startupCostValue.summary.trim() : "";
  const normalizeChoice = (choice: unknown) =>
    choice === "yes" || choice === "no" || choice === "not-sure" ? choice : null;
  const guidanceMode =
    answersValue.guidanceMode === "roadmap-only" || answersValue.guidanceMode === "guide-build"
      ? answersValue.guidanceMode
      : null;

  if (!complexityLabel || !complexitySummary || !rangeLabel || !startupSummary || !guidanceMode) {
    return null;
  }

  const productSummary =
    typeof answersValue.productSummary === "string" ? answersValue.productSummary.trim() : "";
  const customer = typeof answersValue.customer === "string" ? answersValue.customer.trim() : "";
  const problem = typeof answersValue.problem === "string" ? answersValue.problem.trim() : "";
  const features = typeof answersValue.features === "string" ? answersValue.features.trim() : "";
  const needsAccounts = normalizeChoice(answersValue.needsAccounts);
  const takesPayments = normalizeChoice(answersValue.takesPayments);
  const needsAdminDashboard = normalizeChoice(answersValue.needsAdminDashboard);

  if (
    !productSummary ||
    !customer ||
    !problem ||
    !features ||
    !needsAccounts ||
    !takesPayments ||
    !needsAdminDashboard
  ) {
    return null;
  }

  return {
    projectName,
    projectSummary,
    mvpFeatureList,
    buildComplexity: {
      label: complexityLabel,
      summary: complexitySummary
    },
    startupCostEstimate: {
      rangeLabel,
      summary: startupSummary
    },
    nextStepChecklist,
    assignedAgents,
    answers: {
      productSummary,
      customer,
      problem,
      features,
      needsAccounts,
      takesPayments,
      needsAdminDashboard,
      guidanceMode
    }
  };
}

function normalizeMobileAppIntake(value: unknown): MobileAppWorkspaceBlueprint | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const projectName = typeof record.projectName === "string" ? record.projectName.trim() : "";
  const projectSummary =
    typeof record.projectSummary === "string" ? record.projectSummary.trim() : "";
  const screenList = normalizeStringArray(record.screenList) ?? [];
  const featureList = normalizeStringArray(record.featureList) ?? [];
  const nextStepChecklist = normalizeStringArray(record.nextStepChecklist) ?? [];
  const assignedAgents =
    (normalizeStringArray(record.assignedAgents) ?? []).filter(
      (item): item is AgentId =>
        item === "narua" ||
        item === "forge" ||
        item === "atlas" ||
        item === "repolink" ||
        item === "nova" ||
        item === "pulse" ||
        item === "ops"
    );
  const buildComplexityValue =
    record.buildComplexity && typeof record.buildComplexity === "object"
      ? (record.buildComplexity as Record<string, unknown>)
      : null;
  const startupCostValue =
    record.startupCostEstimate && typeof record.startupCostEstimate === "object"
      ? (record.startupCostEstimate as Record<string, unknown>)
      : null;
  const stackRecommendationValue =
    record.stackRecommendation && typeof record.stackRecommendation === "object"
      ? (record.stackRecommendation as Record<string, unknown>)
      : null;
  const answersValue =
    record.answers && typeof record.answers === "object"
      ? (record.answers as Record<string, unknown>)
      : null;

  if (
    !projectName ||
    !projectSummary ||
    !buildComplexityValue ||
    !startupCostValue ||
    !stackRecommendationValue ||
    !answersValue
  ) {
    return null;
  }

  const complexityLabel =
    buildComplexityValue.label === "Lean" ||
    buildComplexityValue.label === "Moderate" ||
    buildComplexityValue.label === "Advanced"
      ? buildComplexityValue.label
      : null;
  const complexitySummary =
    typeof buildComplexityValue.summary === "string" ? buildComplexityValue.summary.trim() : "";
  const rangeLabel =
    typeof startupCostValue.rangeLabel === "string" ? startupCostValue.rangeLabel.trim() : "";
  const startupSummary =
    typeof startupCostValue.summary === "string" ? startupCostValue.summary.trim() : "";
  const primaryBuildPath =
    stackRecommendationValue.primaryBuildPath === "React Native + Expo"
      ? "React Native + Expo"
      : null;
  const secondaryMvpPath =
    stackRecommendationValue.secondaryMvpPath === "PWA / mobile web"
      ? "PWA / mobile web"
      : null;
  const advisoryPaths = (normalizeStringArray(stackRecommendationValue.advisoryPaths) ?? []).filter(
    (item): item is "Flutter" | "native iOS" | "native Android" =>
      item === "Flutter" || item === "native iOS" || item === "native Android"
  );
  const recommendedPathLabel =
    stackRecommendationValue.recommendedPathLabel === "Primary Build Path" ||
    stackRecommendationValue.recommendedPathLabel === "Secondary MVP Path" ||
    stackRecommendationValue.recommendedPathLabel === "Advisory Path"
      ? stackRecommendationValue.recommendedPathLabel
      : null;
  const recommendedPathValue =
    typeof stackRecommendationValue.recommendedPathValue === "string"
      ? stackRecommendationValue.recommendedPathValue.trim()
      : "";
  const recommendationSummary =
    typeof stackRecommendationValue.summary === "string"
      ? stackRecommendationValue.summary.trim()
      : "";
  const rationale = normalizeStringArray(stackRecommendationValue.rationale) ?? [];

  const normalizeBinary = (choice: unknown) =>
    choice === "yes" || choice === "no" || choice === "not-sure" ? choice : null;
  const platformTarget =
    answersValue.platformTarget === "iphone" ||
    answersValue.platformTarget === "android" ||
    answersValue.platformTarget === "both"
      ? answersValue.platformTarget
      : null;
  const companionSurface =
    answersValue.companionSurface === "none" ||
    answersValue.companionSurface === "admin-dashboard" ||
    answersValue.companionSurface === "web-companion" ||
    answersValue.companionSurface === "both" ||
    answersValue.companionSurface === "not-sure"
      ? answersValue.companionSurface
      : null;
  const appSummary = typeof answersValue.appSummary === "string" ? answersValue.appSummary.trim() : "";
  const audience = typeof answersValue.audience === "string" ? answersValue.audience.trim() : "";
  const deviceFeatures =
    typeof answersValue.deviceFeatures === "string" ? answersValue.deviceFeatures.trim() : "";
  const mvpVersion =
    typeof answersValue.mvpVersion === "string" ? answersValue.mvpVersion.trim() : "";
  const budgetGuardrail =
    typeof answersValue.budgetGuardrail === "string" ? answersValue.budgetGuardrail.trim() : "";
  const proofOutcome =
    typeof answersValue.proofOutcome === "string" ? answersValue.proofOutcome.trim() : "";
  const needsAccounts = normalizeBinary(answersValue.needsAccounts);
  const needsPayments = normalizeBinary(answersValue.needsPayments);
  const needsNotifications = normalizeBinary(answersValue.needsNotifications);

  if (
    !complexityLabel ||
    !complexitySummary ||
    !rangeLabel ||
    !startupSummary ||
    !primaryBuildPath ||
    !secondaryMvpPath ||
    !recommendedPathLabel ||
    !recommendedPathValue ||
    !recommendationSummary ||
    !platformTarget ||
    !companionSurface ||
    !appSummary ||
    !audience ||
    !mvpVersion ||
    !budgetGuardrail ||
    !proofOutcome ||
    !needsAccounts ||
    !needsPayments ||
    !needsNotifications
  ) {
    return null;
  }

  return {
    projectName,
    projectSummary,
    screenList,
    featureList,
    buildComplexity: {
      label: complexityLabel,
      summary: complexitySummary
    },
    startupCostEstimate: {
      rangeLabel,
      summary: startupSummary
    },
    stackRecommendation: {
      primaryBuildPath,
      secondaryMvpPath,
      advisoryPaths,
      recommendedPathLabel,
      recommendedPathValue,
      summary: recommendationSummary,
      rationale
    },
    nextStepChecklist,
    assignedAgents,
    answers: {
      appSummary,
      audience,
      platformTarget,
      needsAccounts,
      needsPayments,
      needsNotifications,
      deviceFeatures,
      companionSurface,
      mvpVersion,
      budgetGuardrail,
      proofOutcome
    }
  };
}

function normalizeCustomLane(value: unknown): CustomProjectLaneInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const description = typeof record.description === "string" ? record.description.trim() : "";

  if (!title || !description) {
    return null;
  }

  return {
    title,
    description,
    status: normalizeStatus(record.status),
    focusLabel: typeof record.focusLabel === "string" ? record.focusLabel.trim() : undefined,
    recommendedAIStack: normalizeStringArray(record.recommendedAIStack),
    starterPrompts: normalizeStringArray(record.starterPrompts),
    deliverables: normalizeStringArray(record.deliverables)
  };
}

export function parseCustomProjectLanes(value: string | null | undefined) {
  if (!value?.trim()) {
    return [] as CustomProjectLaneInput[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeCustomLane(item))
      .filter((item): item is CustomProjectLaneInput => Boolean(item));
  } catch {
    return [];
  }
}

export function normalizeProjectTemplateId(
  value: unknown
): ProjectTemplateId | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  return getProjectTemplateDefinition(value as ProjectTemplateId)
    ? (value as ProjectTemplateId)
    : null;
}

export function buildStoredProjectMetadata(args: {
  title: string;
  description?: string | null;
  templateId?: string | ProjectTemplateId | null;
  primaryLaneId?: LaneId | string | null;
  customLanes?: CustomProjectLaneInput[];
  platformContext?: PlatformContext | null;
  conversationState?: ConversationSessionState | null;
  archived?: boolean;
  assets?: StoredProjectAsset[];
  commandCenterBrandSystem?: StoredCommandCenterBrandSystem | null;
  commandCenterDecisions?: StoredCommandCenterDecision[];
  commandCenterChangeReviews?: StoredCommandCenterChangeReview[];
  commandCenterTasks?: StoredCommandCenterTask[];
  commandCenterPreviewState?: StoredCommandCenterPreviewState | null;
  commandCenterApprovedDesignPackage?: StoredCommandCenterApprovedDesignPackage | null;
  guidedFlowPreset?: "saas-app" | "mobile-app";
  guidedEntryContext?: GuidedBuildHandoff | null;
  buildSession?: GuidedBuildSession | null;
  saasIntake?: SaasWorkspaceBlueprint | null;
  mobileAppIntake?: MobileAppWorkspaceBlueprint | null;
}) {
  const normalizedPrimaryLaneId = normalizeLaneId(
    typeof args.primaryLaneId === "string" ? args.primaryLaneId : null
  );
  const resolvedTemplateId =
    normalizeProjectTemplateId(args.templateId) ??
    inferProjectTemplate({
      name: args.title,
      description: args.description,
      primaryLaneId: normalizedPrimaryLaneId
    });

  return {
    version: 1 as const,
    templateId: resolvedTemplateId,
    customLanes: args.customLanes ?? [],
    platformContext: loadPlatformContext(args.platformContext),
    conversationState: normalizeConversationState(args.conversationState),
    archived: args.archived ?? false,
    assets: args.assets ?? [],
    commandCenterBrandSystem: args.commandCenterBrandSystem ?? null,
    commandCenterDecisions: args.commandCenterDecisions ?? [],
    commandCenterChangeReviews: args.commandCenterChangeReviews ?? [],
    commandCenterTasks: args.commandCenterTasks ?? [],
    commandCenterPreviewState: args.commandCenterPreviewState ?? null,
    commandCenterApprovedDesignPackage: args.commandCenterApprovedDesignPackage ?? null,
    guidedFlowPreset: args.guidedFlowPreset,
    guidedEntryContext: args.guidedEntryContext ?? null,
    buildSession: args.buildSession ?? null,
    saasIntake: args.saasIntake ?? null,
    mobileAppIntake: args.mobileAppIntake ?? null
  };
}

function encodeMetadata(metadata: StoredProjectMetadata) {
  return encodeURIComponent(JSON.stringify(metadata));
}

function decodeMetadata(value: string) {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<StoredProjectMetadata> | null;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const templateId = normalizeProjectTemplateId(parsed.templateId);

    if (!templateId) {
      return null;
    }

    return {
      version: 1 as const,
      templateId,
      customLanes: Array.isArray(parsed.customLanes)
        ? parsed.customLanes
            .map((item) => normalizeCustomLane(item))
            .filter((item): item is CustomProjectLaneInput => Boolean(item))
        : [],
      platformContext: loadPlatformContext(parsed.platformContext),
      conversationState: normalizeConversationState(parsed.conversationState),
      archived: Boolean(parsed.archived),
      assets: Array.isArray(parsed.assets)
        ? parsed.assets
            .map((item) => normalizeAsset(item))
            .filter((item): item is StoredProjectAsset => Boolean(item))
        : [],
      commandCenterBrandSystem: normalizeStoredCommandCenterBrandSystem(
        parsed.commandCenterBrandSystem
      ),
      commandCenterDecisions: Array.isArray(parsed.commandCenterDecisions)
        ? parsed.commandCenterDecisions
            .map((item) => normalizeStoredCommandCenterDecision(item))
            .filter((item): item is StoredCommandCenterDecision => Boolean(item))
        : [],
      commandCenterChangeReviews: Array.isArray(parsed.commandCenterChangeReviews)
        ? parsed.commandCenterChangeReviews
            .map((item) => normalizeStoredCommandCenterChangeReview(item))
            .filter((item): item is StoredCommandCenterChangeReview => Boolean(item))
        : [],
      commandCenterTasks: Array.isArray(parsed.commandCenterTasks)
        ? parsed.commandCenterTasks
            .map((item) => normalizeStoredCommandCenterTask(item))
            .filter((item): item is StoredCommandCenterTask => Boolean(item))
        : [],
      commandCenterPreviewState: normalizeStoredCommandCenterPreviewState(
        parsed.commandCenterPreviewState
      ),
      commandCenterApprovedDesignPackage:
        normalizeStoredCommandCenterApprovedDesignPackage(
          parsed.commandCenterApprovedDesignPackage
        ),
      guidedFlowPreset:
        parsed.guidedFlowPreset === "saas-app" || parsed.guidedFlowPreset === "mobile-app"
          ? parsed.guidedFlowPreset
          : undefined,
      guidedEntryContext: normalizeGuidedBuildHandoff(parsed.guidedEntryContext),
      buildSession: normalizeBuildSession(parsed.buildSession),
      saasIntake: normalizeSaasIntake(parsed.saasIntake),
      mobileAppIntake: normalizeMobileAppIntake(parsed.mobileAppIntake)
    };
  } catch {
    return null;
  }
}

export function encodeWorkspaceProjectDescription(
  visibleDescription: string | null | undefined,
  metadata: StoredProjectMetadata | null
) {
  const cleanDescription = visibleDescription?.trim() || "";

  if (!metadata) {
    return cleanDescription || null;
  }

  const payload = `${METADATA_PREFIX}${encodeMetadata(metadata)}${METADATA_SUFFIX}`;

  return cleanDescription ? `${cleanDescription}\n\n${payload}` : payload;
}

export function parseWorkspaceProjectDescription(
  value: string | null | undefined
): ParsedWorkspaceProjectDescription {
  if (!value?.trim()) {
    return {
      visibleDescription: null,
      metadata: null
    };
  }

  const trimmed = value.trim();
  const markerIndex = trimmed.lastIndexOf(METADATA_PREFIX);

  if (markerIndex === -1 || !trimmed.endsWith(METADATA_SUFFIX)) {
    return {
      visibleDescription: trimmed || null,
      metadata: null
    };
  }

  const metadataValue = trimmed
    .slice(markerIndex + METADATA_PREFIX.length, trimmed.length - METADATA_SUFFIX.length)
    .trim();
  const metadata = decodeMetadata(metadataValue);
  const visibleDescription = trimmed.slice(0, markerIndex).trim();

  return {
    visibleDescription: visibleDescription || null,
    metadata
  };
}
