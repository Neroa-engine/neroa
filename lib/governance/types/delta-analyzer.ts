import type {
  ArchitecturalPhaseId,
  BranchFamily,
  ChangeType,
  ConfidenceDimension,
  ContradictionSeverity,
  ExecutionGateOutcome,
  GovernanceSystem,
  GovernanceWorkflowStep,
  ImpactCategory,
  RequestOrigin,
  RiskLevel
} from "../constants";
import type { ConfidenceState, GovernanceRecordMetadata } from "./core";
import type {
  AssumptionReference,
  ContradictionReference,
  ExtractionSnapshot
} from "./extraction";

export interface AffectedPhase {
  phaseId: ArchitecturalPhaseId;
  relation: "primary" | "secondary" | "future";
  notes?: string;
}

export interface AffectedSystem {
  system: GovernanceSystem;
  role: "owning" | "sensitive" | "dependent" | "affected";
  trustCritical?: boolean;
  notes?: string;
}

export interface DependencyTouch {
  fromSystem: GovernanceSystem;
  toSystem: GovernanceSystem;
  direction: "approved" | "prohibited" | "crossed";
  rationale?: string;
  concern?: string;
}

export interface RebuildRadius {
  level: ImpactCategory;
  displayLabel: "Local" | "Medium" | "High" | "Architectural";
  rationale?: string;
}

export interface ChangeClassification {
  impactCategory: ImpactCategory;
  rebuildRadius: RebuildRadius;
  riskLevel: RiskLevel;
  changeType: ChangeType;
  rationale?: string;
}

export interface ArchitectureConfidenceCheck {
  overallScore: ConfidenceState;
  threshold: number;
  passed: boolean;
  criticalDimensionFailures: Array<{
    dimension: ConfidenceDimension;
    score: number;
    minimum: number;
    notes?: string;
  }>;
}

export interface DeltaAnalyzerCheck {
  name:
    | "phase ownership check"
    | "system boundary check"
    | "branch stability check"
    | "dependency direction check"
    | "contradiction amplification check"
    | "assumption invalidation check"
    | "trust-layer impact check"
    | "rebuild radius check"
    | "regression exposure check"
    | "architecture confidence threshold check";
  passed: boolean;
  notes?: string;
  severityIfFailed?: ContradictionSeverity | RiskLevel;
}

export interface DeltaAnalyzerInput extends GovernanceRecordMetadata {
  linkedExtractionSnapshotId?: string;
  relatedRequestOrTicket?: string;
  requestedChange: string;
  requestOrigin: RequestOrigin;
  reasonForRequest?: string;
  currentApprovedPhase: ArchitecturalPhaseId | null;
  currentBranch?: BranchFamily;
  currentRoadmapAssumption?: string;
  currentOwningSystem?: GovernanceSystem;
  extractionSnapshot: ExtractionSnapshot;
}

export interface DeltaAnalyzerOutput extends GovernanceRecordMetadata {
  requestedChangeSummary: string;
  primaryPhase: AffectedPhase | null;
  secondaryPhasesTouched: AffectedPhase[];
  futurePhasesTouched: AffectedPhase[];
  affectedSystems: AffectedSystem[];
  dependenciesTouched: DependencyTouch[];
  assumptionsAffected: AssumptionReference[];
  contradictionsIntroducedOrWorsened: ContradictionReference[];
  rebuildRadius: RebuildRadius;
  regressionExposure?: string[];
  architectureConfidenceCheck: ArchitectureConfidenceCheck;
  confidenceThresholdMetForExecutionEligibility: boolean;
  checks: DeltaAnalyzerCheck[];
  changeClassification: ChangeClassification;
  roadmapRevisionRequired: boolean;
  preliminaryExecutionStatus:
    | "Allowed to proceed to Rebuild Impact Report and gate review"
    | "Blocked pending clarification or roadmap revision";
  recommendedGateOutcome: ExecutionGateOutcome;
  recommendedNextAction?: string;
  linkedRecordsToCreateOrUpdate?: GovernanceWorkflowStep[];
}
