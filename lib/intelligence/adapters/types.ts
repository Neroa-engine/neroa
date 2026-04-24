import type {
  BranchFamily,
  GovernanceRecordMetadata,
  RiskLevel
} from "@/lib/governance";
import type {
  BranchClassificationResult,
  BranchOverlayKey,
  BranchShiftAnalysis
} from "@/lib/intelligence/branching";
import type {
  ExtractionCategoryKey,
  ExtractionFieldKey,
  ExtractionFieldValue,
  ExtractionLastUpdateMetadata,
  ExtractionSourceReference,
  ExtractionState
} from "@/lib/intelligence/extraction";
import type {
  QuestionResponseSignal,
  QuestionSelectionResult,
  QuestionSelectionStage,
  QuestionSelectionHistoryEntry
} from "@/lib/intelligence/questions";
import type { StrategyFrameworkOutput } from "@/lib/intelligence/strategy";

export const CONVERSATION_SOURCE_SURFACES = [
  "start_planning",
  "strategy_room",
  "workspace_strategy_lane",
  "narua_workspace",
  "narua_engine",
  "other_hidden_planning_source"
] as const;

export type ConversationSourceSurface =
  (typeof CONVERSATION_SOURCE_SURFACES)[number];

export const CONVERSATION_ARTIFACT_KINDS = [
  "message",
  "planning_note",
  "thread_snapshot"
] as const;

export type ConversationArtifactKind =
  (typeof CONVERSATION_ARTIFACT_KINDS)[number];

export const CONVERSATION_ARTIFACT_ROLES = [
  "user",
  "assistant",
  "system",
  "planner_note"
] as const;

export type ConversationArtifactRole =
  (typeof CONVERSATION_ARTIFACT_ROLES)[number];

export const NORMALIZED_SIGNAL_KINDS = [
  "direct_answer",
  "partial_answer",
  "inferred_answer",
  "contradiction_signal",
  "assumption_signal",
  "unknown_signal",
  "weak_signal"
] as const;

export type NormalizedSignalKind = (typeof NORMALIZED_SIGNAL_KINDS)[number];

export interface ConversationArtifactMetadata {
  messageIndex?: number;
  workspaceId?: string | null;
  projectId?: string | null;
  laneId?: string | null;
  laneLabel?: string | null;
  contextTitle?: string | null;
  explicitFieldHints?: ExtractionFieldKey[];
  explicitCategoryHints?: ExtractionCategoryKey[];
  promptFieldHint?: ExtractionFieldKey | null;
  promptCategoryHint?: ExtractionCategoryKey | null;
  questionTargetIdHint?: string | null;
  questionSelectionStageHint?: QuestionSelectionStage | null;
  threadUpdatedAt?: string | null;
  importedFrom?: string | null;
  snapshotLabel?: string | null;
}

interface BaseConversationArtifact extends GovernanceRecordMetadata {
  artifactId: string;
  threadId: string;
  sessionId?: string | null;
  sourceSurface: ConversationSourceSurface;
  kind: ConversationArtifactKind;
  role: ConversationArtifactRole;
  rawContent: string;
  createdAt: string;
  metadata?: ConversationArtifactMetadata;
}

export interface ConversationMessageArtifact extends BaseConversationArtifact {
  kind: "message";
  role: "user" | "assistant" | "system";
}

export interface ConversationPlanningNoteArtifact extends BaseConversationArtifact {
  kind: "planning_note";
  role: "planner_note" | "system";
}

export interface ImportedThreadSnapshotArtifact extends BaseConversationArtifact {
  kind: "thread_snapshot";
  role: "system";
  childArtifactIds: string[];
}

export type ConversationArtifact =
  | ConversationMessageArtifact
  | ConversationPlanningNoteArtifact
  | ImportedThreadSnapshotArtifact;

export interface ArtifactSourceMapping {
  sourceId: string;
  source: ExtractionSourceReference;
}

export interface NormalizedFieldSignal {
  signalId: string;
  kind: Extract<
    NormalizedSignalKind,
    "direct_answer" | "partial_answer" | "inferred_answer" | "contradiction_signal"
  >;
  fieldKey: ExtractionFieldKey;
  categoryKey: ExtractionCategoryKey;
  value: ExtractionFieldValue;
  confidenceScore: number;
  reason: string;
  explicit: boolean;
  followUpReason?: string;
  dependencyBlockers: string[];
}

export interface NormalizedAssumptionSignal {
  signalId: string;
  kind: Extract<NormalizedSignalKind, "assumption_signal">;
  statement: string;
  whyInferred: string;
  confidenceScore: number;
  linkedFieldKeys: ExtractionFieldKey[];
  linkedCategoryKeys: ExtractionCategoryKey[];
  invalidationTriggers: string[];
  confirmationRequired: boolean;
}

export interface NormalizedContradictionSignal {
  signalId: string;
  kind: Extract<NormalizedSignalKind, "contradiction_signal">;
  title: string;
  linkedFieldKeys: ExtractionFieldKey[];
  linkedCategoryKeys: ExtractionCategoryKey[];
  conflictingStatements: string[];
  severity: RiskLevel;
  blocked: boolean;
  recommendedResolutionPath: string;
}

export interface NormalizedUnknownSignal {
  signalId: string;
  kind: Extract<NormalizedSignalKind, "unknown_signal" | "weak_signal">;
  question: string;
  categoryKey: ExtractionCategoryKey;
  linkedFieldKeys: ExtractionFieldKey[];
  whyItMatters: string;
  whatItBlocks?: string;
  blockingStage: "none" | "roadmap" | "execution" | "both";
  urgency: RiskLevel;
  recommendedNextQuestionTarget: string;
}

export interface NormalizedBranchHint {
  branch: BranchFamily;
  confidenceScore: number;
  matchedText: string;
  reason: string;
}

export interface NormalizedOverlayHint {
  overlayKey: BranchOverlayKey;
  confidenceScore: number;
  matchedText: string;
  reason: string;
}

export interface NormalizedConversationArtifact {
  artifact: ConversationArtifact;
  sourceMapping: ArtifactSourceMapping;
  normalizedText: string;
  contentSegments: string[];
  promptTargetId: string | null;
  promptFieldHint: ExtractionFieldKey | null;
  promptCategoryHint: ExtractionCategoryKey | null;
  responseSignal: QuestionResponseSignal | null;
  weakInput: boolean;
  shouldAdvanceReadiness: boolean;
  fieldSignals: NormalizedFieldSignal[];
  assumptionSignals: NormalizedAssumptionSignal[];
  contradictionSignals: NormalizedContradictionSignal[];
  unknownSignals: NormalizedUnknownSignal[];
  branchHints: NormalizedBranchHint[];
  overlayHints: NormalizedOverlayHint[];
  warnings: string[];
}

export interface ProcessedArtifactRecord {
  artifactId: string;
  duplicateKey: string;
  processedAt: string;
  responseSignal: QuestionResponseSignal | null;
  sourceId: string;
  skippedAsDuplicate: boolean;
}

export interface IntelligenceTraceEntry {
  artifactId: string;
  sourceSurface: ConversationSourceSurface;
  responseSignal: QuestionResponseSignal | null;
  appliedFieldKeys: ExtractionFieldKey[];
  assumptionIds: string[];
  contradictionIds: string[];
  unknownIds: string[];
  previousPrimaryBranch: BranchClassificationResult["primaryBranch"];
  nextPrimaryBranch: BranchClassificationResult["primaryBranch"];
  previousQuestionTargetId: string | null;
  nextQuestionTargetId: string | null;
  warnings: string[];
  notes: string[];
}

export interface IntelligenceRecomputeMetadata {
  mode: "incremental" | "rebuild" | "manual_recalc";
  processedArtifactIds: string[];
  newSourceIds: string[];
  newEvidenceIds: string[];
  rebuiltFromScratch: boolean;
  decisionNotes: string[];
}

export interface HiddenIntelligenceBundle extends GovernanceRecordMetadata {
  version: 1;
  extractionState: ExtractionState;
  branchState: BranchClassificationResult;
  branchShiftAnalysis: BranchShiftAnalysis | null;
  questionSelection: QuestionSelectionResult;
  questionHistory: QuestionSelectionHistoryEntry[];
  strategyFramework: StrategyFrameworkOutput;
  processedArtifacts: ProcessedArtifactRecord[];
  processedArtifactIds: string[];
  processedDuplicateKeys: string[];
  trace: IntelligenceTraceEntry[];
  warnings: string[];
  recompute: IntelligenceRecomputeMetadata;
  lastUpdate: ExtractionLastUpdateMetadata;
}

export interface ExtractionAdapterResult {
  extractionState: ExtractionState;
  appliedFieldKeys: ExtractionFieldKey[];
  assumptionIds: string[];
  contradictionIds: string[];
  unknownIds: string[];
  newSourceIds: string[];
  newEvidenceIds: string[];
  warnings: string[];
  notes: string[];
}

export interface BranchAdapterResult {
  branchState: BranchClassificationResult;
  branchShiftAnalysis: BranchShiftAnalysis | null;
  extractionState: ExtractionState;
  warnings: string[];
}

export interface QuestionAdapterResult {
  questionSelection: QuestionSelectionResult;
  questionHistory: QuestionSelectionHistoryEntry[];
  warnings: string[];
}

export interface ArtifactOrchestrationOptions extends GovernanceRecordMetadata {
  currentStage?: QuestionSelectionStage;
  ignoreDuplicates?: boolean;
  rebuiltFromScratch?: boolean;
}
