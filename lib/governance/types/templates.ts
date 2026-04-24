import type {
  ArchitecturalPhaseId,
  BranchFamily,
  ContradictionSeverity,
  ExecutionGateOutcome,
  ExecutionPrecondition,
  GovernanceSystem,
  GovernanceWorkflowStep
} from "../constants";
import type { GovernanceRecordMetadata } from "./core";
import type { AssumptionLedgerEntry } from "./assumptions";
import type { ContradictionEntry } from "./contradictions";
import type {
  AffectedPhase,
  AffectedSystem,
  ArchitectureConfidenceCheck,
  DependencyTouch,
  DeltaAnalyzerInput
} from "./delta-analyzer";
import type {
  AssumptionReference,
  ContradictionReference,
  ExtractionSnapshot,
  UnknownEntry
} from "./extraction";
import type { RebuildImpactReport } from "./rebuild-impact";
import type {
  PhaseMappingDecision,
  RoadmapRevisionRecord
} from "./roadmap";

export interface ExtractionSnapshotTemplateData extends ExtractionSnapshot {}

export interface DeltaAnalyzerWorksheetTemplateData extends DeltaAnalyzerInput {
  primaryPhaseTouched?: AffectedPhase | null;
  secondaryPhasesTouched?: AffectedPhase[];
  futurePhasesTouched?: AffectedPhase[];
  affectedSystems?: AffectedSystem[];
  dependenciesTouched?: DependencyTouch[];
  assumptionsAffected?: AssumptionReference[];
  existingAssumptionsInvalidated?: string[];
  contradictionRisk?: ContradictionSeverity;
  contradictionsIntroducedOrWorsened?: ContradictionReference[];
  rebuildRadiusLabel?: "Local" | "Medium" | "High" | "Architectural";
  regressionExposure?: string[];
  architectureConfidenceCheck?: ArchitectureConfidenceCheck;
  confidenceThresholdMetForExecutionEligibility?: boolean;
  impactCategory?: "local" | "medium" | "high" | "architectural";
  roadmapRevisionRequired?: boolean;
  preliminaryExecutionStatus?:
    | "Allowed to proceed to Rebuild Impact Report and gate review"
    | "Blocked pending clarification or roadmap revision";
  recommendedGateOutcome?: ExecutionGateOutcome;
  recommendedNextAction?: string;
  linkedRecordsToCreateOrUpdate?: GovernanceWorkflowStep[];
}

export interface RebuildImpactReportTemplateData extends RebuildImpactReport {}

export interface AssumptionLedgerEntryTemplateData extends AssumptionLedgerEntry {}

export interface ContradictionRegisterEntryTemplateData extends ContradictionEntry {}

export interface RoadmapRevisionRecordTemplateData extends RoadmapRevisionRecord {}

export interface PhaseMappingDecisionTemplateData extends PhaseMappingDecision {}

export interface ExecutionGateDecisionTemplateData extends GovernanceRecordMetadata {
  linkedDeltaAnalyzerWorksheetId?: string;
  linkedRebuildImpactReportId?: string;
  linkedPhaseMappingDecisionId?: string;
  architectureConfidenceCheck: ArchitectureConfidenceCheck;
  requiredPreconditionsSatisfied: ExecutionPrecondition[];
  blockedDependencies: string[];
  systemsStillRequiringClarification?: GovernanceSystem[];
  outcome: ExecutionGateOutcome;
  rationale: string;
  requiredNextAction?: string;
  owner?: string;
}

export interface OpenQuestionsEntryTemplateData extends GovernanceRecordMetadata, UnknownEntry {
  linkedRequestId?: string;
  linkedExtractionSnapshotId?: string;
  relatedBranch?: BranchFamily;
}
