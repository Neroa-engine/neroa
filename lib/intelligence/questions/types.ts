import type {
  FieldStatus,
  GovernanceRecordMetadata,
  ReadinessState,
  RiskLevel
} from "@/lib/governance";
import type {
  BranchAmbiguitySeverity,
  BranchClassificationResult,
  BranchOverlayKey,
  BranchResolutionTarget
} from "@/lib/intelligence/branching";
import type {
  ExtractionCategoryKey,
  ExtractionFieldKey,
  ExtractionLastUpdateMetadata,
  ExtractionState,
  UnitIntervalConfidence
} from "@/lib/intelligence/extraction";

export const QUESTION_SELECTION_TYPES = [
  "contradiction_resolution",
  "critical_unknown",
  "partial_truth_narrowing",
  "branch_resolution",
  "overlay_confirmation",
  "assumption_confirmation",
  "constraint_clarification",
  "actor_clarification",
  "workflow_clarification",
  "mvp_boundary_clarification",
  "systems_integration_clarification",
  "readiness_blocker_resolution",
  "roadmap_transition_readiness",
  "execution_transition_readiness"
] as const;

export type QuestionSelectionType = (typeof QUESTION_SELECTION_TYPES)[number];

export const QUESTION_TARGET_KINDS = [
  "field",
  "category",
  "assumption",
  "contradiction",
  "unknown",
  "branch",
  "overlay",
  "readiness"
] as const;

export type QuestionTargetKind = (typeof QUESTION_TARGET_KINDS)[number];

export const QUESTION_FOLLOW_UP_MODES = [
  "fresh",
  "narrowing",
  "confirmation",
  "recovery",
  "reopen",
  "transition"
] as const;

export type QuestionFollowUpMode = (typeof QUESTION_FOLLOW_UP_MODES)[number];

export const QUESTION_RESPONSE_SIGNALS = [
  "answered",
  "partial",
  "uncertain",
  "does_not_know",
  "indirect",
  "avoided",
  "contradictory"
] as const;

export type QuestionResponseSignal = (typeof QUESTION_RESPONSE_SIGNALS)[number];

export const QUESTION_PROGRESS_OUTCOMES = [
  "resolved",
  "partial_progress",
  "no_change",
  "reopened",
  "suppressed"
] as const;

export type QuestionProgressOutcome = (typeof QUESTION_PROGRESS_OUTCOMES)[number];

export const QUESTION_SELECTION_STAGES = [
  "extraction",
  "roadmap",
  "execution-prep"
] as const;

export type QuestionSelectionStage = (typeof QUESTION_SELECTION_STAGES)[number];

export const QUESTION_PRIORITY_BUCKETS = [
  "contradiction",
  "critical_unknown",
  "critical_gap",
  "partial_gap",
  "branch_resolution",
  "overlay_confirmation",
  "assumption_confirmation",
  "readiness",
  "refinement"
] as const;

export type QuestionPriorityBucket = (typeof QUESTION_PRIORITY_BUCKETS)[number];

export const QUESTION_CANDIDATE_STATUSES = [
  "selectable",
  "suppressed"
] as const;

export type QuestionCandidateStatus = (typeof QUESTION_CANDIDATE_STATUSES)[number];

export type QuestionRegistryCriticality =
  | "roadmap_critical"
  | "execution_critical"
  | "supporting";

export type QuestionBlockerClass =
  | "contradiction"
  | "unknown"
  | "missing_truth"
  | "partial_truth"
  | "assumption"
  | "readiness"
  | "overlay"
  | "transition";

export interface QuestionTargetReference {
  targetId: string;
  kind: QuestionTargetKind;
  label: string;
  fieldKey?: ExtractionFieldKey;
  categoryKey?: ExtractionCategoryKey;
  assumptionId?: string;
  contradictionId?: string;
  unknownId?: string;
  overlayKey?: BranchOverlayKey;
  readinessStage?: "roadmap" | "execution";
  branchResolutionTarget?: BranchResolutionTarget;
  registryId?: string;
}

export interface QuestionTargetRegistryEntry {
  targetId: string;
  label: string;
  kind: QuestionTargetKind;
  fieldKeys: ExtractionFieldKey[];
  categoryKeys: ExtractionCategoryKey[];
  criticality: QuestionRegistryCriticality;
  branchRelevant: boolean;
  overlayRelevant: boolean;
  commonBlockerClass: QuestionBlockerClass;
  escalationPriority: number;
  defaultQuestionType: QuestionSelectionType;
  recoveryTargetIds: string[];
  narrowingTargetIds: string[];
}

export interface QuestionSelectionHistoryEntry extends GovernanceRecordMetadata {
  questionId?: string;
  targetId: string;
  questionType: QuestionSelectionType;
  askedAt: string;
  responseSignal: QuestionResponseSignal;
  outcome: QuestionProgressOutcome;
  relatedFieldKeys: ExtractionFieldKey[];
  relatedCategoryKeys: ExtractionCategoryKey[];
  fieldStatusSnapshot?: Partial<Record<ExtractionFieldKey, FieldStatus>>;
  branchAmbiguitySeverityAfter?: BranchAmbiguitySeverity;
  notes?: string;
}

export interface QuestionCandidate extends GovernanceRecordMetadata {
  questionId: string;
  target: QuestionTargetReference;
  questionType: QuestionSelectionType;
  priorityBucket: QuestionPriorityBucket;
  priorityScore: number;
  whyChosen: string;
  smallestDecisionGap: string;
  blockingReason?: string;
  selectionHint: string;
  relatedFieldKeys: ExtractionFieldKey[];
  relatedCategoryKeys: ExtractionCategoryKey[];
  relatedAssumptionIds: string[];
  relatedContradictionIds: string[];
  relatedUnknownIds: string[];
  branchResolutionRelevant: boolean;
  roadmapReadinessRelevant: boolean;
  executionReadinessRelevant: boolean;
  blocksRoadmapMovement: boolean;
  blocksExecutionMovement: boolean;
  followUpMode: QuestionFollowUpMode;
  status: QuestionCandidateStatus;
  suppressionReasons: string[];
  sourceIds: string[];
  evidenceIds: string[];
  expectedConfidenceGain: UnitIntervalConfidence;
}

export interface QuestionReadinessGate {
  stage: "roadmap" | "execution";
  canMove: boolean;
  state: ReadinessState;
  confidence: UnitIntervalConfidence;
  blockingQuestionIds: string[];
  blockingTargetIds: string[];
  reasons: string[];
}

export interface QuestionSelectionResult extends GovernanceRecordMetadata {
  version: 1;
  selectedQuestion: QuestionCandidate | null;
  selectedQuestionTarget: QuestionTargetReference | null;
  selectedQuestionType: QuestionSelectionType | null;
  whyChosen: string | null;
  priorityScore: number | null;
  blockingReason?: string;
  relatedFieldKeys: ExtractionFieldKey[];
  relatedCategoryKeys: ExtractionCategoryKey[];
  relatedAssumptionIds: string[];
  relatedContradictionIds: string[];
  relatedUnknownIds: string[];
  branchResolutionRelevant: boolean;
  roadmapReadinessRelevant: boolean;
  executionReadinessRelevant: boolean;
  followUpMode: QuestionFollowUpMode | null;
  sourceIds: string[];
  evidenceIds: string[];
  candidatePool: QuestionCandidate[];
  suppressedCandidates: QuestionCandidate[];
  roadmapBlockingQuestions: QuestionCandidate[];
  executionBlockingQuestions: QuestionCandidate[];
  roadmapGate: QuestionReadinessGate;
  executionGate: QuestionReadinessGate;
  lastUpdate: ExtractionLastUpdateMetadata;
}

export interface QuestionSelectionInput extends GovernanceRecordMetadata {
  extractionState: ExtractionState;
  branchClassification?: BranchClassificationResult | null;
  history?: QuestionSelectionHistoryEntry[];
  currentStage?: QuestionSelectionStage;
  lastResponseSignal?: QuestionResponseSignal;
}

export interface QuestionSelectionCandidateContext extends GovernanceRecordMetadata {
  extractionState: ExtractionState;
  branchClassification: BranchClassificationResult;
  history: QuestionSelectionHistoryEntry[];
  currentStage: QuestionSelectionStage;
  lastResponseSignal?: QuestionResponseSignal;
}

export interface QuestionSelectionRecalculationOptions
  extends Omit<QuestionSelectionInput, "extractionState"> {
  updateReason?: string;
}

export interface QuestionSelectionUpdateOptions {
  updatedBy?: string;
  updateReason?: string;
}

export interface QuestionSelectionSuppression {
  suppressed: boolean;
  reasons: string[];
}
