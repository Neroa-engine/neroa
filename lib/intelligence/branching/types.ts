import type {
  BranchFamily,
  BranchStabilityState,
  GovernanceRecordMetadata,
  GovernanceSystem,
  OverlayType as GovernanceOverlayType,
  ReadinessState,
  RiskLevel
} from "@/lib/governance";
import type {
  ExtractionCategoryKey,
  ExtractionFieldKey,
  ExtractionLastUpdateMetadata,
  UnitIntervalConfidence
} from "@/lib/intelligence/extraction";

export const BRANCH_OVERLAY_KEYS = [
  "ai-copilot",
  "multi-tenant-team-workspace",
  "approval-workflow-governance",
  "community-ugc",
  "commerce",
  "mobile-first-native-experience",
  "compliance-security-sensitive-data",
  "international-localization"
] as const;

export type BranchOverlayKey = (typeof BRANCH_OVERLAY_KEYS)[number];

export const BRANCH_OVERLAY_ACTIVATION_STATES = [
  "inactive",
  "possible",
  "active",
  "high-confidence active"
] as const;

export type BranchOverlayActivationState =
  (typeof BRANCH_OVERLAY_ACTIVATION_STATES)[number];

export const BRANCH_AMBIGUITY_SEVERITIES = [
  "none",
  "low",
  "moderate",
  "high",
  "critical"
] as const;

export type BranchAmbiguitySeverity =
  (typeof BRANCH_AMBIGUITY_SEVERITIES)[number];

export const BRANCH_SHIFT_LEVELS = [
  "no_meaningful_branch_shift",
  "mild_drift",
  "significant_branch_shift",
  "architectural_branch_shift"
] as const;

export type BranchShiftLevel = (typeof BRANCH_SHIFT_LEVELS)[number];

export const BRANCH_PROJECT_NAME_PATHS = [
  "unknown",
  "name_exists",
  "naming_help_needed",
  "intentionally_unnamed"
] as const;

export type BranchProjectNamePath = (typeof BRANCH_PROJECT_NAME_PATHS)[number];

export const BRANCH_DOMAIN_PATHS = [
  "unknown",
  "not_needed",
  "later",
  "validate_now"
] as const;

export type BranchDomainPath = (typeof BRANCH_DOMAIN_PATHS)[number];

export const BRANCH_IDEA_CLARITY_STATES = [
  "stable",
  "vague_idea",
  "does_not_know_recovery"
] as const;

export type BranchIdeaClarityState = (typeof BRANCH_IDEA_CLARITY_STATES)[number];

export const BRANCH_TRUTH_CLARITY_STATES = ["clear", "unclear"] as const;

export type BranchTruthClarityState = (typeof BRANCH_TRUTH_CLARITY_STATES)[number];

export const BRANCH_INTEGRATION_CLARITY_STATES = [
  "known",
  "unknown",
  "blocking_unknown"
] as const;

export type BranchIntegrationClarityState =
  (typeof BRANCH_INTEGRATION_CLARITY_STATES)[number];

export const BRANCH_COMPLIANCE_PATHS = [
  "unknown",
  "not_sensitive",
  "sensitive_screened",
  "sensitive_unresolved"
] as const;

export type BranchCompliancePath = (typeof BRANCH_COMPLIANCE_PATHS)[number];

export const BRANCH_MONETIZATION_STATES = [
  "clear",
  "deferred",
  "unclear"
] as const;

export type BranchMonetizationState = (typeof BRANCH_MONETIZATION_STATES)[number];

export const BRANCH_EXECUTION_SAFETY_STATES = [
  "safe",
  "not_safe_yet"
] as const;

export type BranchExecutionSafetyState =
  (typeof BRANCH_EXECUTION_SAFETY_STATES)[number];

export type BranchResolutionTarget = ExtractionCategoryKey | ExtractionFieldKey;

export type BranchSignalKind =
  | "explicit-branch"
  | "keyword"
  | "actor-pattern"
  | "workflow-pattern"
  | "business-model-pattern"
  | "structure-pattern"
  | "overlay-alias"
  | "assumption"
  | "contradiction"
  | "unknown";

export interface BranchSignal {
  signalId: string;
  kind: BranchSignalKind;
  label: string;
  rationale: string;
  matchedKeywords: string[];
  branch: BranchFamily | null;
  overlayKey?: BranchOverlayKey;
  fieldKeys: ExtractionFieldKey[];
  categoryKeys: ExtractionCategoryKey[];
  sourceIds: string[];
  evidenceIds: string[];
  scoreContribution: number;
  confidence: UnitIntervalConfidence;
}

export interface BranchCandidate {
  branch: BranchFamily;
  rawScore: number;
  confidence: UnitIntervalConfidence;
  rationale: string;
  signalIds: string[];
}

export interface BranchSpecialization {
  key: string;
  label: string;
  summary: string;
  confidence: UnitIntervalConfidence;
  basedOnBranches: BranchFamily[];
  sourceFieldKeys: ExtractionFieldKey[];
  signalIds: string[];
}

export interface BranchOverlayActivation {
  overlayKey: BranchOverlayKey;
  label: string;
  state: BranchOverlayActivationState;
  confidence: UnitIntervalConfidence;
  reason: string;
  signalIds: string[];
  sourceFieldKeys: ExtractionFieldKey[];
  sourceIds: string[];
  evidenceIds: string[];
  likelyAffectedSystems: GovernanceSystem[];
  governanceOverlayAliases: GovernanceOverlayType[];
}

export interface BranchBlocker {
  blockerId: string;
  severity: RiskLevel;
  reason: string;
  linkedFieldKeys: ExtractionFieldKey[];
  linkedCategoryKeys: ExtractionCategoryKey[];
  missingInformationNeeded: string[];
  recommendedQuestionTarget?: BranchResolutionTarget;
  blocksRoadmap: boolean;
}

export interface BranchAmbiguity {
  severity: BranchAmbiguitySeverity;
  competingBranches: BranchCandidate[];
  reason: string;
  branchResolutionRequired: boolean;
  missingInformationNeeded: string[];
  recommendedQuestionTarget?: BranchResolutionTarget;
  blocksRoadmap: boolean;
}

export interface BranchArchitectureHints {
  likelyRequiredSystems: GovernanceSystem[];
  likelyRoleComplexity: RiskLevel;
  likelyTrustSensitivity: RiskLevel;
  likelyWorkflowComplexity: RiskLevel;
  likelyTransactionComplexity: RiskLevel;
  notes: string[];
}

export interface BranchFrameworkCases {
  projectNamePath: BranchProjectNamePath;
  domainPath: BranchDomainPath;
  ideaClarity: BranchIdeaClarityState;
  targetUserClarity: BranchTruthClarityState;
  firstUseCaseClarity: BranchTruthClarityState;
  integrationClarity: BranchIntegrationClarityState;
  compliancePath: BranchCompliancePath;
  monetizationClarity: BranchMonetizationState;
  executionSafety: BranchExecutionSafetyState;
  notes: string[];
}

export interface BranchRoadmapReadiness {
  state: ReadinessState;
  ready: boolean;
  confidence: UnitIntervalConfidence;
  blockers: string[];
  missingInformationNeeded: string[];
  recommendedQuestionTarget?: BranchResolutionTarget;
}

export interface BranchClassificationHistoryEntry {
  at: string;
  reason: string;
  previousPrimaryBranch: BranchFamily | null;
  nextPrimaryBranch: BranchFamily | null;
  previousAmbiguitySeverity: BranchAmbiguitySeverity;
  nextAmbiguitySeverity: BranchAmbiguitySeverity;
  shiftLevel: BranchShiftLevel;
}

export interface BranchClassificationResult extends GovernanceRecordMetadata {
  version: 1;
  primaryBranch: BranchCandidate | null;
  secondaryBranches: BranchCandidate[];
  branchStability: BranchStabilityState;
  specialization: BranchSpecialization | null;
  overlays: Record<BranchOverlayKey, BranchOverlayActivation>;
  ambiguity: BranchAmbiguity;
  blockers: BranchBlocker[];
  branchResolutionRequired: boolean;
  architectureShiftRisk: RiskLevel;
  architectureHints: BranchArchitectureHints;
  frameworkCases: BranchFrameworkCases;
  roadmapReadiness: BranchRoadmapReadiness;
  sourceFieldKeys: ExtractionFieldKey[];
  sourceIds: string[];
  evidenceIds: string[];
  signals: BranchSignal[];
  history: BranchClassificationHistoryEntry[];
  lastUpdate: ExtractionLastUpdateMetadata;
}

export interface BranchShiftAnalysis {
  level: BranchShiftLevel;
  previousPrimaryBranch: BranchFamily | null;
  nextPrimaryBranch: BranchFamily | null;
  changedPrimaryBranch: boolean;
  overlaysAdded: BranchOverlayKey[];
  overlaysRemoved: BranchOverlayKey[];
  previousSpecialization: string | null;
  nextSpecialization: string | null;
  reason: string;
  triggerDeltaAnalyzer: boolean;
  triggerRoadmapRevision: boolean;
}

export interface BranchClassificationOptions {
  previous?: BranchClassificationResult | null;
  updatedBy?: string;
  updateReason?: string;
}

export interface BranchConflictInput extends GovernanceRecordMetadata {
  reason: string;
  competingBranches: BranchFamily[];
  severity?: BranchAmbiguitySeverity;
  missingInformationNeeded?: string[];
  recommendedQuestionTarget?: BranchResolutionTarget;
}

export interface ResolveBranchAmbiguityInput extends GovernanceRecordMetadata {
  selectedPrimaryBranch: BranchFamily;
  reason: string;
  reducedSeverity?: BranchAmbiguitySeverity;
}
