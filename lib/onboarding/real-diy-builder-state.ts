import type {
  PartialRecord,
  RealBuilderState,
  RealBuilderStepId
} from "@/lib/onboarding/real-diy-builder-options";
import {
  normalizeAutomationLevel,
  normalizeBuildStageId,
  normalizeComplexityLevel,
  normalizeConceptMode,
  normalizeDelimitedList,
  normalizeExperienceStyle,
  normalizeFrameworkId,
  normalizeIndustryId,
  normalizeOpportunityAreaId,
  normalizePlatformStyle,
  normalizePriorityTradeoff,
  normalizeProductTypeId,
  normalizeString,
  normalizeSurfaceType,
  normalizeVentureType
} from "@/lib/onboarding/real-diy-builder-helpers";

export function createEmptyRealBuilderState(): RealBuilderState {
  return {
    productTypeId: null,
    buildStageId: null,
    businessDirection: {
      businessGoal: "",
      conceptMode: null,
      industryId: null,
      opportunityAreaId: null,
      ventureType: null,
      surfaceType: null
    },
    projectDefinition: {
      targetUsers: "",
      coreWorkflow: "",
      keyFeatures: [],
      monetization: "",
      integrationNeeds: [],
      priorityTradeoff: null
    },
    experienceDirection: {
      frameworkId: null,
      experienceStyle: null,
      platformStyle: null,
      automationLevel: null,
      complexityLevel: null
    }
  };
}

export function normalizeRealBuilderState(value: PartialRecord): RealBuilderState {
  const record = value ?? {};
  const businessDirection =
    record.businessDirection && typeof record.businessDirection === "object"
      ? (record.businessDirection as PartialRecord)
      : null;
  const projectDefinition =
    record.projectDefinition && typeof record.projectDefinition === "object"
      ? (record.projectDefinition as PartialRecord)
      : null;
  const experienceDirection =
    record.experienceDirection && typeof record.experienceDirection === "object"
      ? (record.experienceDirection as PartialRecord)
      : null;

  return {
    productTypeId: normalizeProductTypeId(record.productTypeId),
    buildStageId: normalizeBuildStageId(record.buildStageId),
    businessDirection: {
      businessGoal: normalizeString(businessDirection?.businessGoal),
      conceptMode: normalizeConceptMode(businessDirection?.conceptMode),
      industryId: normalizeIndustryId(businessDirection?.industryId),
      opportunityAreaId: normalizeOpportunityAreaId(businessDirection?.opportunityAreaId),
      ventureType: normalizeVentureType(businessDirection?.ventureType),
      surfaceType: normalizeSurfaceType(businessDirection?.surfaceType)
    },
    projectDefinition: {
      targetUsers: normalizeString(projectDefinition?.targetUsers),
      coreWorkflow: normalizeString(projectDefinition?.coreWorkflow),
      keyFeatures: normalizeDelimitedList(projectDefinition?.keyFeatures),
      monetization: normalizeString(projectDefinition?.monetization),
      integrationNeeds: normalizeDelimitedList(projectDefinition?.integrationNeeds),
      priorityTradeoff: normalizePriorityTradeoff(projectDefinition?.priorityTradeoff)
    },
    experienceDirection: {
      frameworkId: normalizeFrameworkId(experienceDirection?.frameworkId),
      experienceStyle: normalizeExperienceStyle(experienceDirection?.experienceStyle),
      platformStyle: normalizePlatformStyle(experienceDirection?.platformStyle),
      automationLevel: normalizeAutomationLevel(experienceDirection?.automationLevel),
      complexityLevel: normalizeComplexityLevel(experienceDirection?.complexityLevel)
    }
  };
}

export function isBuildSetupComplete(state: RealBuilderState) {
  return Boolean(state.productTypeId && state.buildStageId);
}

export function isBusinessDirectionComplete(state: RealBuilderState) {
  const direction = state.businessDirection;
  const hasContext =
    direction.conceptMode === "clear-concept"
      ? Boolean(direction.industryId)
      : direction.conceptMode === "exploring-opportunities"
        ? Boolean(direction.opportunityAreaId)
        : false;

  return Boolean(
    direction.businessGoal &&
      direction.conceptMode &&
      hasContext &&
      direction.ventureType &&
      direction.surfaceType
  );
}

export function isProjectDefinitionComplete(state: RealBuilderState) {
  const definition = state.projectDefinition;

  return Boolean(
    definition.targetUsers &&
      definition.coreWorkflow &&
      definition.keyFeatures.length > 0 &&
      definition.monetization &&
      definition.integrationNeeds.length > 0 &&
      definition.priorityTradeoff
  );
}

export function isFrameworkDirectionComplete(state: RealBuilderState) {
  const direction = state.experienceDirection;

  return Boolean(
    direction.frameworkId &&
      direction.experienceStyle &&
      direction.platformStyle &&
      direction.automationLevel &&
      direction.complexityLevel
  );
}

export function deriveRealBuilderCurrentStep(state: RealBuilderState): RealBuilderStepId {
  if (!isBuildSetupComplete(state)) {
    return "build-setup";
  }

  if (!isBusinessDirectionComplete(state)) {
    return "business-direction";
  }

  if (!isProjectDefinitionComplete(state)) {
    return "project-definition";
  }

  if (!isFrameworkDirectionComplete(state)) {
    return "framework-direction";
  }

  return "build-plan";
}


