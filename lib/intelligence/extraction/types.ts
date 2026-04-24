import type {
  ArchitecturalPhaseId,
  AssumptionStatus,
  BranchFamily,
  BranchStabilityState,
  ContradictionClass,
  ContradictionSeverity,
  ContradictionStatus,
  FieldStatus,
  GovernanceRecordMetadata,
  GovernanceSystem,
  OverlayType,
  ReadinessState,
  RiskLevel
} from "@/lib/governance";
import type { ExtractionCategoryKey, ExtractionFieldKey } from "./catalog";

export type UnitIntervalConfidence = {
  score: number;
  scale: "unit_interval";
  minimum?: number;
  passed?: boolean;
  notes?: string;
};

export type ExtractionFieldValue =
  | {
      kind: "text";
      summary: string;
      detail?: string;
      rawValue?: string;
    }
  | {
      kind: "list";
      summary: string;
      items: string[];
      rawValue?: string[];
    };

export type ExtractionSourceKind =
  | "message"
  | "artifact"
  | "document"
  | "manual"
  | "inference"
  | "system"
  | "other";

export interface ExtractionSourceReference extends GovernanceRecordMetadata {
  sourceId: string;
  kind: ExtractionSourceKind;
  label: string;
  excerpt?: string;
  messageId?: string;
  artifactPath?: string;
  threadId?: string;
}

export interface ExtractionEvidenceReference extends GovernanceRecordMetadata {
  evidenceId: string;
  summary: string;
  sourceId: string;
  relatedFieldKeys: ExtractionFieldKey[];
  relatedCategoryKeys: ExtractionCategoryKey[];
  confidenceContribution?: UnitIntervalConfidence;
}

export interface ExtractionFieldTransition {
  at: string;
  fromStatus: FieldStatus | null;
  toStatus: FieldStatus;
  reason: string;
  previousValueSummary?: string;
  nextValueSummary?: string;
  sourceIds: string[];
  evidenceIds: string[];
}

export interface ExtractionFieldState extends GovernanceRecordMetadata {
  fieldKey: ExtractionFieldKey;
  categoryKey: ExtractionCategoryKey;
  label: string;
  valueKind: "text" | "list";
  status: FieldStatus;
  value: ExtractionFieldValue | null;
  confidence: UnitIntervalConfidence;
  evidenceIds: string[];
  sourceIds: string[];
  followUpRequired: boolean;
  followUpReason?: string;
  dependencyBlockers: string[];
  history: ExtractionFieldTransition[];
}

export interface ExtractionBranchClassificationReference {
  status: FieldStatus;
  primaryBranch: BranchFamily | null;
  secondaryBranches: BranchFamily[];
  branchStability: BranchStabilityState;
  branchShiftSuspected: boolean;
  confidence: UnitIntervalConfidence;
  sourceFieldKeys: ExtractionFieldKey[];
  evidenceIds: string[];
}

export interface ExtractionOverlayActivationReference {
  overlayType: OverlayType;
  determination: "unknown" | "active" | "inactive";
  confidence: UnitIntervalConfidence;
  rationale?: string;
  sourceFieldKeys: ExtractionFieldKey[];
  evidenceIds: string[];
}

export interface ExtractionAssumptionRecord extends GovernanceRecordMetadata {
  assumptionId: string;
  statement: string;
  categoryKey?: ExtractionCategoryKey;
  linkedFieldKeys: ExtractionFieldKey[];
  linkedCategoryKeys: ExtractionCategoryKey[];
  evidenceIds: string[];
  sourceIds: string[];
  confidence: UnitIntervalConfidence;
  whyInferred: string;
  invalidationTriggers: string[];
  confirmationRequired: boolean;
  highSensitivity: boolean;
  affectedSystems: GovernanceSystem[];
  affectedPhases: ArchitecturalPhaseId[];
  status: AssumptionStatus;
}

export interface ExtractionContradictionRecord extends GovernanceRecordMetadata {
  contradictionId: string;
  title: string;
  contradictionClass: ContradictionClass;
  severity: ContradictionSeverity;
  status: ContradictionStatus;
  blocked: boolean;
  conflictingStatements: string[];
  linkedFieldKeys: ExtractionFieldKey[];
  linkedCategoryKeys: ExtractionCategoryKey[];
  affectedSystems: GovernanceSystem[];
  affectedPhases: ArchitecturalPhaseId[];
  relatedAssumptionIds: string[];
  sourceIds: string[];
  evidenceIds: string[];
  recommendedResolutionPath: string;
}

export interface ExtractionUnknownRecord extends GovernanceRecordMetadata {
  unknownId: string;
  question: string;
  categoryKey: ExtractionCategoryKey;
  linkedFieldKeys: ExtractionFieldKey[];
  whyItMatters: string;
  whatItBlocks?: string;
  blockingStage: "none" | "roadmap" | "execution" | "both";
  urgency: RiskLevel;
  recommendedNextQuestionTarget: string;
  resolved: boolean;
}

export interface ExtractionCategoryConfidence {
  categoryKey: ExtractionCategoryKey;
  confidence: UnitIntervalConfidence;
  fieldKeys: ExtractionFieldKey[];
  missingFieldKeys: ExtractionFieldKey[];
  conflictingFieldKeys: ExtractionFieldKey[];
  blockingContradictionIds: string[];
  blockingUnknownIds: string[];
}

export interface ExtractionConfidenceRollups {
  fieldAverage: UnitIntervalConfidence;
  categories: Record<ExtractionCategoryKey, ExtractionCategoryConfidence>;
  overall: UnitIntervalConfidence;
  roadmapReadiness: UnitIntervalConfidence;
  executionReadiness: UnitIntervalConfidence;
}

export interface ExtractionReadinessEvaluation {
  state: ReadinessState;
  ready: boolean;
  confidence: UnitIntervalConfidence;
  satisfiedCategoryKeys: ExtractionCategoryKey[];
  missingFieldKeys: ExtractionFieldKey[];
  blockingContradictionIds: string[];
  blockingUnknownIds: string[];
  blockingAssumptionIds: string[];
  blockers: string[];
}

export interface ExtractionLastUpdateMetadata {
  updatedAt: string;
  updatedBy?: string;
  updateReason: string;
}

export interface ExtractionRequestSummary {
  requestId?: string;
  requestedChangeOrInitiative: string;
  whyItExists?: string;
  desiredOutcome?: string;
  currentContext?: string;
}

export interface ExtractionState extends GovernanceRecordMetadata {
  version: 1;
  requestSummary: ExtractionRequestSummary;
  branchClassification: ExtractionBranchClassificationReference;
  overlayActivations: Record<OverlayType, ExtractionOverlayActivationReference>;
  fields: Record<ExtractionFieldKey, ExtractionFieldState>;
  assumptions: ExtractionAssumptionRecord[];
  contradictions: ExtractionContradictionRecord[];
  unknowns: ExtractionUnknownRecord[];
  sources: Record<string, ExtractionSourceReference>;
  evidence: Record<string, ExtractionEvidenceReference>;
  confidenceRollups: ExtractionConfidenceRollups;
  roadmapReadiness: ExtractionReadinessEvaluation;
  executionReadiness: ExtractionReadinessEvaluation;
  lastUpdate: ExtractionLastUpdateMetadata;
}

export interface ExtractionFieldUpdateInput extends GovernanceRecordMetadata {
  fieldKey: ExtractionFieldKey;
  value: ExtractionFieldValue;
  confidenceScore: number;
  source?: Omit<ExtractionSourceReference, "sourceId"> & { sourceId?: string };
  evidenceSummary?: string;
  followUpReason?: string;
  dependencyBlockers?: string[];
  mergeListValues?: boolean;
  reason?: string;
}

export interface ExtractionFieldConflictInput extends GovernanceRecordMetadata {
  fieldKey: ExtractionFieldKey;
  conflictingValue: ExtractionFieldValue;
  confidenceScore?: number;
  source?: Omit<ExtractionSourceReference, "sourceId"> & { sourceId?: string };
  evidenceSummary?: string;
  reason: string;
  dependencyBlockers?: string[];
}

export interface ExtractionEvidenceMergeInput extends GovernanceRecordMetadata {
  fieldKey: ExtractionFieldKey;
  source: Omit<ExtractionSourceReference, "sourceId"> & { sourceId?: string };
  evidenceSummary: string;
  confidenceScore?: number;
  reason?: string;
}

export interface ExtractionAssumptionInput extends GovernanceRecordMetadata {
  statement: string;
  whyInferred: string;
  confidenceScore: number;
  categoryKey?: ExtractionCategoryKey;
  linkedFieldKeys?: ExtractionFieldKey[];
  linkedCategoryKeys?: ExtractionCategoryKey[];
  evidenceIds?: string[];
  sourceIds?: string[];
  invalidationTriggers?: string[];
  confirmationRequired?: boolean;
  affectedSystems?: GovernanceSystem[];
  affectedPhases?: ArchitecturalPhaseId[];
  status?: AssumptionStatus;
}

export interface ExtractionContradictionInput extends GovernanceRecordMetadata {
  title: string;
  contradictionClass: ContradictionClass;
  severity: ContradictionSeverity;
  conflictingStatements: string[];
  linkedFieldKeys?: ExtractionFieldKey[];
  linkedCategoryKeys?: ExtractionCategoryKey[];
  affectedSystems?: GovernanceSystem[];
  affectedPhases?: ArchitecturalPhaseId[];
  relatedAssumptionIds?: string[];
  sourceIds?: string[];
  evidenceIds?: string[];
  blocked?: boolean;
  status?: ContradictionStatus;
  recommendedResolutionPath: string;
}

export interface ExtractionUnknownInput extends GovernanceRecordMetadata {
  question: string;
  categoryKey: ExtractionCategoryKey;
  linkedFieldKeys?: ExtractionFieldKey[];
  whyItMatters: string;
  whatItBlocks?: string;
  blockingStage?: "none" | "roadmap" | "execution" | "both";
  urgency?: RiskLevel;
  recommendedNextQuestionTarget: string;
  resolved?: boolean;
}
