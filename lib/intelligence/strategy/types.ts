import type { ReadinessState } from "@/lib/governance";
import type {
  FrameworkConfidenceLevel,
  FrameworkRoadmapClarityLevel,
  FrameworkTruthKey,
  HiddenAlignmentGateResult
} from "@/lib/intelligence/contracts";

export const STRATEGY_PHASE_IDS = [
  "identity",
  "naming",
  "core_idea",
  "product_definition",
  "function",
  "user",
  "goals_outcomes",
  "surface_discovery",
  "systems_integrations_constraints"
] as const;

export type StrategyPhaseId = (typeof STRATEGY_PHASE_IDS)[number];

export const STRATEGY_PHASE_COMPLETION_STATES = [
  "not_started",
  "in_progress",
  "complete",
  "blocked"
] as const;

export type StrategyPhaseCompletionState =
  (typeof STRATEGY_PHASE_COMPLETION_STATES)[number];

export const STRATEGY_BRANCH_IDS = [
  "existing_name_capture",
  "naming_help_requested",
  "naming_deferred",
  "domain_validation_intent",
  "ideation_support",
  "industry_exploration",
  "user_exploration",
  "product_type_narrowing",
  "problem_discovery",
  "monetization_direction",
  "function_capability_narrowing",
  "user_role_clarification",
  "integration_clarification",
  "compliance_screening",
  "ai_usage_clarification",
  "data_structure_clarification",
  "mobile_device_clarification",
  "admin_ops_clarification",
  "execution_not_safe_yet"
] as const;

export type StrategyBranchId = (typeof STRATEGY_BRANCH_IDS)[number];

export const STRATEGY_OVERLAY_IDS = [
  "brandability",
  "domain_intent",
  "market_crowding",
  "monetization",
  "compliance_security",
  "ai_usage",
  "data_structure",
  "mobile_device",
  "admin_ops"
] as const;

export type StrategyOverlayId = (typeof STRATEGY_OVERLAY_IDS)[number];

export const STRATEGY_RESEARCH_INTENT_IDS = [
  "domain_availability",
  "trademark_crowding",
  "market_crowding"
] as const;

export type StrategyResearchIntentId =
  (typeof STRATEGY_RESEARCH_INTENT_IDS)[number];

export const STRATEGY_NAMING_STATUSES = [
  "named",
  "working_name",
  "needs_help",
  "deferred",
  "intentionally_unnamed"
] as const;

export type StrategyNamingStatus = (typeof STRATEGY_NAMING_STATUSES)[number];

export const STRATEGY_NAMING_MATURITY_LEVELS = [
  "low",
  "medium",
  "high"
] as const;

export type StrategyNamingMaturity =
  (typeof STRATEGY_NAMING_MATURITY_LEVELS)[number];

export interface StrategyPhaseExitCriterion {
  criterionId: string;
  label: string;
  description: string;
  truthKeys: FrameworkTruthKey[];
  blocking: boolean;
}

export interface StrategyPhaseDefinition {
  phaseId: StrategyPhaseId;
  order: number;
  label: string;
  description: string;
  requiredTruthKeys: FrameworkTruthKey[];
  optionalTruthKeys: FrameworkTruthKey[];
  branchTriggerIds: StrategyBranchId[];
  overlayIds: StrategyOverlayId[];
  exitCriteria: StrategyPhaseExitCriterion[];
  nextPhaseId: StrategyPhaseId | null;
}

export interface StrategyBranchDefinition {
  branchId: StrategyBranchId;
  label: string;
  description: string;
  phaseIds: StrategyPhaseId[];
  supportingTruthKeys: FrameworkTruthKey[];
  blockingEffect: "non_blocking" | "conditional_blocking" | "blocking";
}

export interface StrategyOverlayDefinition {
  overlayId: StrategyOverlayId;
  label: string;
  description: string;
  supportingTruthKeys: FrameworkTruthKey[];
}

export interface StrategyResearchIntentDefinition {
  intentId: StrategyResearchIntentId;
  label: string;
  description: string;
  supportingTruthKeys: FrameworkTruthKey[];
}

export interface StrategyCapabilityDefinition {
  capabilityId: string;
  label: string;
  description: string;
  keywords: string[];
}

export interface StrategyProductSpecificityFamilyDefinition {
  familyId: string;
  label: string;
  description: string;
  examples: string[];
  keywords: string[];
}

export interface StrategyPhaseProgress {
  phaseId: StrategyPhaseId;
  label: string;
  completionState: StrategyPhaseCompletionState;
  readinessState: ReadinessState;
  requiredTruthKeys: FrameworkTruthKey[];
  optionalTruthKeys: FrameworkTruthKey[];
  satisfiedRequiredTruthKeys: FrameworkTruthKey[];
  missingRequiredTruthKeys: FrameworkTruthKey[];
  activeBranchIds: StrategyBranchId[];
  activeOverlayIds: StrategyOverlayId[];
  readyToExit: boolean;
  blockers: string[];
}

export interface StrategyOverlayActivation {
  overlayId: StrategyOverlayId;
  label: string;
  active: boolean;
  why: string;
}

export interface StrategyResearchIntentStatus {
  intentId: StrategyResearchIntentId;
  label: string;
  requested: boolean;
  notes: string;
}

export interface StrategyCapabilityMatch {
  capabilityId: string;
  label: string;
  matchedKeywords: string[];
}

export interface StrategyFounderIdentityBlock {
  founderOperatorContext: string | null;
}

export interface StrategyProjectNamingBlock {
  namingStatus: StrategyNamingStatus;
  namingMaturity: StrategyNamingMaturity;
  workingProjectName: string | null;
  displayProjectName: string;
  namingHelpState: string | null;
  domainIntent: string | null;
  domainValidationPath: string | null;
}

export interface StrategyProductDefinitionBlock {
  productType: string | null;
  productFunction: string | null;
  productSpecificityFamilies: string[];
}

export interface StrategyFunctionCapabilityBlock {
  firstUseCase: string | null;
  capabilities: StrategyCapabilityMatch[];
}

export interface StrategyUserBlock {
  targetUser: string | null;
  firstUser: string | null;
  inferredUserRoles: string[];
}

export interface StrategyGoalsOutcomesBlock {
  businessGoal: string | null;
  roadmapClarityLevel: FrameworkRoadmapClarityLevel;
  confidenceLevel: FrameworkConfidenceLevel;
}

export interface StrategySurfaceBlock {
  primarySurfaces: string | null;
  mobileExpectations: string | null;
}

export interface StrategySystemsIntegrationBlock {
  keySystemsIntegrations: string | null;
  constraints: string | null;
  monetization: string | null;
  complianceSecuritySensitivity: string | null;
  aiUsage: string | null;
  dataStructureAssumptions: string | null;
  adminOpsComplexity: string | null;
}

export interface StrategySummarySafeFields {
  displayProjectName: string;
  conciseWhatYouAreBuilding: string | null;
  conciseWhoItsFor: string | null;
  concisePrimaryGoal: string | null;
  conversationSnapshotProduct: string | null;
  conversationSnapshotUsers: string | null;
  conversationSnapshotFocus: string | null;
}

export interface StrategyProgressModel {
  currentPhaseId: StrategyPhaseId;
  nextBestPhaseId: StrategyPhaseId | null;
  phaseCompletionCount: number;
  totalPhaseCount: number;
  readinessConfidence: FrameworkConfidenceLevel;
  workspaceHandoffConfidence: number;
  unresolvedBlockers: string[];
}

export interface StrategyFrameworkOutput {
  founderIdentityBlock: StrategyFounderIdentityBlock;
  projectNamingBlock: StrategyProjectNamingBlock;
  productDefinitionBlock: StrategyProductDefinitionBlock;
  functionCapabilityBlock: StrategyFunctionCapabilityBlock;
  userBlock: StrategyUserBlock;
  goalsOutcomesBlock: StrategyGoalsOutcomesBlock;
  surfaceBlock: StrategySurfaceBlock;
  systemsIntegrationBlock: StrategySystemsIntegrationBlock;
  activeBranchIds: StrategyBranchId[];
  activeOverlays: StrategyOverlayActivation[];
  researchIntentHooks: StrategyResearchIntentStatus[];
  phaseProgress: Record<StrategyPhaseId, StrategyPhaseProgress>;
  minimumDataGate: HiddenAlignmentGateResult;
  workspaceHandoffReadiness: HiddenAlignmentGateResult;
  summarySafeFields: StrategySummarySafeFields;
  progressModel: StrategyProgressModel;
}
