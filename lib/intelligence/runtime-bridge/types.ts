import type {
  BranchFamily,
  FieldStatus,
  GovernanceRecordMetadata,
  ReadinessState
} from "@/lib/governance";
import type { HiddenIntelligenceBundle } from "@/lib/intelligence/adapters";
import type {
  BranchAmbiguitySeverity,
  BranchClassificationResult,
  BranchOverlayKey,
  BranchShiftAnalysis
} from "@/lib/intelligence/branching";
import type {
  ExtractionCategoryKey,
  ExtractionFieldKey
} from "@/lib/intelligence/extraction";
import type {
  QuestionSelectionResult,
  QuestionSelectionType
} from "@/lib/intelligence/questions";
import type {
  StrategyBranchId,
  StrategyFrameworkOutput,
  StrategyOverlayId,
  StrategyPhaseId
} from "@/lib/intelligence/strategy";
import type {
  PlanningLaneId,
  PlanningMessage,
  PlanningThreadState
} from "@/lib/start/planning-thread";

export const START_SHADOW_MATCH_LEVELS = [
  "exact_target",
  "category_match",
  "related_match",
  "mismatch",
  "unavailable"
] as const;

export type StartShadowMatchLevel = (typeof START_SHADOW_MATCH_LEVELS)[number];

export interface LiveVisibleQuestionTarget {
  questionText: string;
  primaryTargetId: string | null;
  candidateTargetIds: string[];
  label: string;
  confidenceScore: number;
  reason: string;
  relatedFieldKeys: ExtractionFieldKey[];
  relatedCategoryKeys: ExtractionCategoryKey[];
  questionTypeHint: QuestionSelectionType | null;
  branchResolutionRelevant: boolean;
  contradictionRelevant: boolean;
  unknownRelevant: boolean;
}

export interface LiveVisibleQuestionAnalysis {
  questions: string[];
  inferredTargets: LiveVisibleQuestionTarget[];
  asksQuestion: boolean;
  questionCount: number;
  questionSignature: string;
  notes: string[];
}

export interface HiddenQuestionSelectionSnapshot {
  selectedTargetId: string | null;
  selectedTargetLabel: string | null;
  selectedQuestionType: QuestionSelectionType | null;
  whyChosen: string | null;
  priorityScore: number | null;
  relatedFieldKeys: ExtractionFieldKey[];
  relatedCategoryKeys: ExtractionCategoryKey[];
  relatedContradictionIds: string[];
  relatedUnknownIds: string[];
  branchResolutionRelevant: boolean;
  roadmapReadinessRelevant: boolean;
  executionReadinessRelevant: boolean;
  roadmapGateState: ReadinessState;
  executionGateState: ReadinessState;
}

export interface HiddenStrategyFrameworkSnapshot {
  currentPhaseId: StrategyPhaseId;
  nextBestPhaseId: StrategyPhaseId | null;
  activeBranchIds: StrategyBranchId[];
  activeOverlayIds: StrategyOverlayId[];
  currentPhaseCompletionState: StrategyFrameworkOutput["phaseProgress"][StrategyPhaseId]["completionState"];
  currentPhaseMissingRequiredTruthKeys: StrategyFrameworkOutput["phaseProgress"][StrategyPhaseId]["missingRequiredTruthKeys"];
  minimumDataGateReady: boolean;
  minimumDataGateState: ReadinessState;
  workspaceHandoffReady: boolean;
  workspaceHandoffState: ReadinessState;
  readinessConfidence: StrategyFrameworkOutput["progressModel"]["readinessConfidence"];
  unresolvedBlockers: string[];
  summarySafeFields: StrategyFrameworkOutput["summarySafeFields"];
}

export interface ShadowMismatchDetail {
  flag: boolean;
  reason: string | null;
  relatedTargetIds: string[];
  notes: string[];
}

export const SHADOW_COMPARISON_AREA_IDS = [
  "naming_capture",
  "ideation_handling",
  "product_definition_specificity",
  "user_definition_depth",
  "function_capability_discovery",
  "goals_outcomes_depth",
  "surface_discovery_depth",
  "systems_integration_constraint_capture",
  "handoff_gate_readiness_quality",
  "summary_safety_risk"
] as const;

export type ShadowComparisonAreaId =
  (typeof SHADOW_COMPARISON_AREA_IDS)[number];

export const SHADOW_COMPARISON_AREA_STATUSES = [
  "match",
  "hidden_stronger",
  "live_acceptable",
  "both_weak",
  "not_in_focus"
] as const;

export type ShadowComparisonAreaStatus =
  (typeof SHADOW_COMPARISON_AREA_STATUSES)[number];

export interface ShadowComparisonAreaResult {
  areaId: ShadowComparisonAreaId;
  label: string;
  status: ShadowComparisonAreaStatus;
  inFocus: boolean;
  hiddenTargeted: boolean;
  liveTargeted: boolean;
  notes: string[];
}

export interface ShadowMismatchFlags {
  conceptualMismatch: boolean;
  repetitionMismatch: boolean;
  contradictionMiss: boolean;
  unknownHandlingMiss: boolean;
  branchResolutionMiss: boolean;
  roadmapBlockingMiss: boolean;
  executionBlockingMiss: boolean;
  shallowSequencingMismatch: boolean;
  prematureHandoffMismatch: boolean;
  missingRequiredTruthMismatch: boolean;
  vagueProductDefinitionMismatch: boolean;
  weakNamingCaptureMismatch: boolean;
  hiddenLikelyBetter: boolean;
}

export interface ShadowQuestionComparisonResult {
  live: LiveVisibleQuestionAnalysis;
  hidden: HiddenQuestionSelectionSnapshot;
  matchLevel: StartShadowMatchLevel;
  matchesConceptually: boolean;
  summary: string;
  notes: string[];
  coverageAreas: ShadowComparisonAreaResult[];
  repetitionMismatch: ShadowMismatchDetail;
  contradictionHandlingMismatch: ShadowMismatchDetail;
  unknownHandlingMismatch: ShadowMismatchDetail;
  branchResolutionMismatch: ShadowMismatchDetail;
  roadmapBlockingMismatch: ShadowMismatchDetail;
  executionBlockingMismatch: ShadowMismatchDetail;
  shallowSequencingMismatch: ShadowMismatchDetail;
  prematureHandoffMismatch: ShadowMismatchDetail;
  missingRequiredTruthMismatch: ShadowMismatchDetail;
  vagueProductDefinitionMismatch: ShadowMismatchDetail;
  weakNamingCaptureMismatch: ShadowMismatchDetail;
  mismatchFlags: ShadowMismatchFlags;
}

export interface ShadowFieldTransition {
  fieldKey: ExtractionFieldKey;
  previousStatus: FieldStatus;
  nextStatus: FieldStatus;
  previousSummary: string | null;
  nextSummary: string | null;
}

export interface ShadowExtractionChangeSummary {
  changedFieldKeys: ExtractionFieldKey[];
  fieldTransitions: ShadowFieldTransition[];
  newAssumptionIds: string[];
  updatedAssumptionIds: string[];
  newContradictionIds: string[];
  resolvedContradictionIds: string[];
  newUnknownIds: string[];
  resolvedUnknownIds: string[];
  previousRoadmapState: ReadinessState;
  nextRoadmapState: ReadinessState;
  roadmapStateChanged: boolean;
  previousExecutionState: ReadinessState;
  nextExecutionState: ReadinessState;
  executionStateChanged: boolean;
}

export interface ShadowBranchChangeSummary {
  previousPrimaryBranch: BranchFamily | null;
  nextPrimaryBranch: BranchFamily | null;
  previousAmbiguitySeverity: BranchAmbiguitySeverity | null;
  nextAmbiguitySeverity: BranchAmbiguitySeverity;
  overlaysAdded: BranchOverlayKey[];
  overlaysRemoved: BranchOverlayKey[];
  branchResolutionRequiredChanged: boolean;
  shiftLevel: BranchShiftAnalysis["level"] | null;
  notes: string[];
}

export const SHADOW_REPLACEMENT_READINESS_STATUSES = [
  "not_ready",
  "ready_for_narrow_replacement",
  "ready_for_phase_limited_replacement",
  "ready_for_broader_replacement"
] as const;

export type ShadowReplacementReadinessStatus =
  (typeof SHADOW_REPLACEMENT_READINESS_STATUSES)[number];

export interface ShadowReplacementRecommendation {
  scopeId:
    | "naming_capture_only"
    | "unknown_ideation_handling_only"
    | "product_definition_narrowing_only"
    | "user_definition_depth_only"
    | "function_capability_discovery_only"
    | "handoff_gate_enforcement_only"
    | "phase_limited_next_question_replacement";
  label: string;
  why: string;
  evidence: string[];
}

export interface ShadowComparisonAreaAggregate {
  areaId: ShadowComparisonAreaId;
  label: string;
  status: Exclude<ShadowComparisonAreaStatus, "not_in_focus">;
  comparedTraceCount: number;
  counts: Record<Exclude<ShadowComparisonAreaStatus, "not_in_focus">, number>;
  evidence: string[];
}

export interface StartShadowSessionReport extends GovernanceRecordMetadata {
  threadId: string;
  lane: PlanningLaneId;
  traceCount: number;
  comparedTraceCount: number;
  readinessStatus: ShadowReplacementReadinessStatus;
  smallestSafeReplacementScope: ShadowReplacementRecommendation | null;
  hiddenMateriallyStronger: boolean;
  areaSummaries: ShadowComparisonAreaAggregate[];
  whereLiveAndHiddenMatch: ShadowComparisonAreaId[];
  whereHiddenIsStronger: ShadowComparisonAreaId[];
  whereLiveIsStillAcceptable: ShadowComparisonAreaId[];
  whereBothAreWeak: ShadowComparisonAreaId[];
  mismatchHotspots: string[];
  blockerReasons: string[];
  notes: string[];
}

export interface StartShadowTrace extends GovernanceRecordMetadata {
  traceId: string;
  threadId: string;
  lane: PlanningLaneId;
  artifactSignature: string;
  mirroredArtifactIds: string[];
  liveQuestionAnalysis: LiveVisibleQuestionAnalysis;
  hiddenQuestionSelection: HiddenQuestionSelectionSnapshot;
  visibleStrategist: StartVisibleStrategistLog | null;
  strategyFramework: HiddenStrategyFrameworkSnapshot;
  comparison: ShadowQuestionComparisonResult;
  extractionChanges: ShadowExtractionChangeSummary;
  branchChanges: ShadowBranchChangeSummary;
  warnings: string[];
  decisionNotes: string[];
  createdAt: string;
}

export interface StartShadowSessionRecord extends GovernanceRecordMetadata {
  threadId: string;
  lane: PlanningLaneId;
  latestArtifactSignature: string;
  latestBundle: HiddenIntelligenceBundle;
  latestTrace: StartShadowTrace | null;
  latestComparison: ShadowQuestionComparisonResult | null;
  latestReport: StartShadowSessionReport | null;
  latestMirroredAt: string;
  traces: StartShadowTrace[];
  warnings: string[];
}

export interface StartPlanningShadowInput extends GovernanceRecordMetadata {
  threadState: PlanningThreadState;
  assistantMessage: PlanningMessage;
  visibleStrategist?: StartVisibleStrategistLog | null;
  title?: string | null;
  summary?: string | null;
  forceRebuild?: boolean;
}

export interface StartPlanningShadowResult {
  enabled: boolean;
  skipped: boolean;
  reason: string | null;
  bundle: HiddenIntelligenceBundle | null;
  trace: StartShadowTrace | null;
  comparison: ShadowQuestionComparisonResult | null;
  report: StartShadowSessionReport | null;
  session: StartShadowSessionRecord | null;
}

export interface CompareLiveAndHiddenQuestionTargetsInput {
  assistantReply: string;
  questionSelection: QuestionSelectionResult;
  branchState: BranchClassificationResult;
  strategyFramework: StrategyFrameworkOutput;
  visibleStrategist?: StartVisibleStrategistLog | null;
  previousTrace?: StartShadowTrace | null;
}

export interface StartVisibleStrategistLog {
  enabled: boolean;
  usedHidden: boolean;
  visibleConversationState:
    | "greeting"
    | "intake_grounding"
    | "product_shaping"
    | null;
  greetingModeActive: boolean;
  greetingQuestionOnly: boolean;
  hiddenTargetSelected: string | null;
  renderedTargetSelected: string | null;
  hiddenQuestionType: QuestionSelectionType | null;
  renderedQuestionType: QuestionSelectionType | null;
  questionStyleType:
    | "narrowing"
    | "contradiction"
    | "unknown"
    | "branch_resolution"
    | "assumption_confirmation"
    | "readiness_blocker"
    | "overlay_confirmation"
    | "recovery"
    | "fallback"
    | null;
  questionConfidenceLevel: "low" | "medium" | "high" | null;
  questionConfidenceScore: number | null;
  forcedEarlyNarrowing: boolean;
  contradictionSurfaced: boolean;
  branchAmbiguitySurfaced: boolean;
  lowConfidenceRecoveryMode: boolean;
  renderedTopicCategory:
    | "product_shape"
    | "actors"
    | "outcome"
    | "workflow"
    | "business_model"
    | "mvp_scope"
    | "product_surfaces"
    | "data_integrations"
    | "experience"
    | "constraints"
    | "contradiction"
    | "branch_model"
    | "assumption"
    | "overlay"
    | "readiness"
    | "generic"
    | null;
  repeatedPhrasePrevented: boolean;
  echoSuppressed: boolean;
  architectureDiscoveryAsked: boolean;
  adminSurfaceDiscoveryAsked: boolean;
  customerPortalDiscoveryAsked: boolean;
  apiIntegrationDiscoveryAsked: boolean;
  experientialDiscoveryAsked: boolean;
  suggestionOffered: boolean;
  intakeGroundingBlockedShaping: boolean;
  recentCategorySuppressed: boolean;
  repeatedCategoryPrevented: boolean;
  echoReplayPrevented: boolean;
  shapeLanguageBlocked: boolean;
  fallbackUsed: boolean;
  fallbackPhrasingUsed: boolean;
  fallbackReason: string | null;
  preservedGreetingFlow: boolean;
  branchAmbiguityState: BranchAmbiguitySeverity | null;
  contradictionBlockerPresent: boolean;
  unknownBlockerPresent: boolean;
  roadmapReadinessState: ReadinessState | null;
  executionReadinessState: ReadinessState | null;
}

export interface StartVisibleStrategistInput extends GovernanceRecordMetadata {
  threadState: PlanningThreadState;
  latestUserMessage: string;
}

export interface StartVisibleStrategistDecision {
  enabled: boolean;
  usedHidden: boolean;
  bundle: HiddenIntelligenceBundle | null;
  renderedQuestion: string | null;
  renderedTargetId: string | null;
  renderedQuestionType: QuestionSelectionType | null;
  strategistLeadIn: string | null;
  blockingReason: string | null;
  whyChosen: string | null;
  fallbackUsed: boolean;
  fallbackReason: string | null;
  log: StartVisibleStrategistLog;
}
