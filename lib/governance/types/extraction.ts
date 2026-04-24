import type {
  ArchitecturalPhaseId,
  BranchFamily,
  BranchStabilityState,
  ExtractionCategory,
  FieldStatus,
  GovernanceSystem,
  GovernanceWorkflowStep,
  OverlayType,
  ReadinessState,
  RiskLevel,
  AssumptionStatus,
  ContradictionClass,
  ContradictionSeverity,
  ContradictionStatus
} from "../constants";
import type { ConfidenceState, GovernanceRecordMetadata } from "./core";

export interface ExtractionField {
  category: ExtractionCategory;
  status: FieldStatus;
  confidence: ConfidenceState;
  notes?: string;
  valueSummary?: string;
}

export interface OverlayActivation {
  overlayType: OverlayType;
  active: boolean;
  rationale?: string;
}

export interface BranchClassification {
  primaryBranch: BranchFamily;
  secondaryBranches: BranchFamily[];
  overlays: OverlayActivation[];
  branchConfidence: ConfidenceState;
  branchStability: BranchStabilityState;
  branchShiftSuspected: boolean;
}

export interface UnknownEntry {
  question: string;
  whyItMatters: string;
  whoMustAnswer?: string;
  whatItBlocks?: string;
  recommendedQuestionPath?: string;
  targetPhase?: ArchitecturalPhaseId;
  urgency?: RiskLevel;
}

export interface AssumptionReference {
  assumptionId?: string;
  statement: string;
  whyInferred?: string;
  confidence: ConfidenceState;
  confirmationRequired?: boolean;
  sourceEvidence?: string[];
  affectedBranches?: BranchFamily[];
  affectedSystems?: GovernanceSystem[];
  affectedPhases?: ArchitecturalPhaseId[];
  status?: AssumptionStatus;
}

export interface ContradictionReference {
  contradictionId?: string;
  title: string;
  contradictionClass: ContradictionClass;
  severity: ContradictionSeverity;
  status: ContradictionStatus;
  blocked?: boolean;
}

export interface RoadmapReadinessState {
  state: ReadinessState;
  criticalCategoriesSatisfied: ExtractionCategory[];
  unresolvedCriticalContradiction: boolean;
  architectureConfidence: ConfidenceState;
  readyToMoveToDeltaAndRoadmapWork: boolean;
  blockers: string[];
}

export interface ExecutionReadinessState {
  state: ReadinessState;
  executionMayBegin: boolean;
  downstreamStepsRequired: GovernanceWorkflowStep[];
  preliminaryBlockers: string[];
}

export interface ExtractionSnapshot extends GovernanceRecordMetadata {
  sourceRequestOrThread?: string;
  relatedRoadmapOrFeatureReference?: string;
  requestSummary: {
    requestedChangeOrInitiative: string;
    whyItExists?: string;
    desiredOutcome?: string;
    currentContext?: string;
  };
  branchClassification: BranchClassification;
  primaryActors: {
    primaryUsers: string[];
    primaryBuyers: string[];
    primaryAdminsOrOperators: string[];
    secondaryActors?: string[];
  };
  productTruth: {
    coreWorkflow: string;
    productType?: string;
    businessModel?: string;
    brandOrExperienceDirection?: string;
    coreSuccessCriteria?: string[];
  };
  mvpBoundary: {
    inScopeNow: string[];
    outOfScopeNow: string[];
    futurePhaseCapabilitiesMentioned?: string[];
    currentPhaseAssumption?: string;
  };
  systemsAndIntegrations: {
    systemsTouched: GovernanceSystem[];
    dataDependencies?: string[];
    integrations?: string[];
    trustLayerSystemsTouched?: GovernanceSystem[];
  };
  constraintsAndRisks: {
    budgetConstraints?: string[];
    timelineConstraints?: string[];
    staffingOrOwnershipConstraints?: string[];
    operationalOrComplianceConstraints?: string[];
    knownRisks?: string[];
  };
  assumptions: AssumptionReference[];
  contradictions: ContradictionReference[];
  unknowns: UnknownEntry[];
  fields: ExtractionField[];
  roadmapReadiness: RoadmapReadinessState;
  executionReadiness: ExecutionReadinessState;
}
