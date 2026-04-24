import type {
  ArchitecturalPhaseId,
  AssumptionStatus,
  BranchFamily,
  BranchStabilityState,
  ChangeType,
  ContradictionClass,
  ContradictionSeverity,
  ContradictionStatus,
  GovernanceSystem,
  OverlayType,
  RequestOrigin
} from "../constants";
import type { GovernanceRecordMetadata } from "../types/core";
import type { DeltaAnalyzerOutput } from "../types/delta-analyzer";
import type { ExtractionSnapshot, UnknownEntry } from "../types/extraction";
import type { RebuildImpactReport } from "../types/rebuild-impact";
import type { DependencyMapEdge, PhaseMapEntry } from "../types/roadmap";
import type { ExecutionGateDecisionTemplateData } from "../types/templates";

export interface GovernanceRunnerStructuredRequest extends GovernanceRecordMetadata {
  requestId?: string;
  requestedChange: string;
  summary?: string;
  why?: string;
  desiredOutcome?: string;
  currentContext?: string;
  requestOrigin?: RequestOrigin;
  changeType?: ChangeType;
  primaryBranch?: BranchFamily;
  secondaryBranches?: BranchFamily[];
  overlays?: OverlayType[];
  branchStability?: BranchStabilityState;
  primaryUsers?: string[];
  primaryBuyers?: string[];
  primaryAdminsOrOperators?: string[];
  secondaryActors?: string[];
  coreWorkflow?: string;
  productType?: string;
  businessModel?: string;
  brandOrExperienceDirection?: string;
  coreSuccessCriteria?: string[];
  inScopeNow?: string[];
  outOfScopeNow?: string[];
  futurePhaseCapabilitiesMentioned?: string[];
  systemsTouched?: GovernanceSystem[];
  dataDependencies?: string[];
  integrations?: string[];
  budgetConstraints?: string[];
  timelineConstraints?: string[];
  staffingOrOwnershipConstraints?: string[];
  operationalOrComplianceConstraints?: string[];
  knownRisks?: string[];
}

export interface GovernanceRunnerAssumptionInput {
  assumptionId?: string;
  statement: string;
  whyInferred: string;
  confidenceScore: number;
  confirmationRequired?: boolean;
  sourceEvidence?: string[];
  affectedBranches?: BranchFamily[];
  affectedSystems?: GovernanceSystem[];
  affectedPhases?: ArchitecturalPhaseId[];
  status?: AssumptionStatus;
}

export interface GovernanceRunnerContradictionInput {
  contradictionId?: string;
  title: string;
  contradictionClass: ContradictionClass;
  severity: ContradictionSeverity;
  conflictingStatements: string[];
  affectedSystems?: GovernanceSystem[];
  affectedPhases?: ArchitecturalPhaseId[];
  whyItMatters: string;
  blocked?: boolean;
  status?: ContradictionStatus;
}

export interface GovernanceRunnerUnknownInput
  extends Omit<UnknownEntry, "targetPhase"> {
  targetPhase?: ArchitecturalPhaseId;
}

export interface GovernanceRunnerProvidedContext {
  currentApprovedPhase?: ArchitecturalPhaseId | null;
  currentRoadmapAssumption?: string;
  currentOwningSystem?: GovernanceSystem;
  activePhaseIds?: ArchitecturalPhaseId[];
  supportingPhaseIds?: ArchitecturalPhaseId[];
  futurePhaseIds?: ArchitecturalPhaseId[];
  dependencyMap?: readonly DependencyMapEdge[];
  phaseMap?: readonly PhaseMapEntry[];
  systemPhaseOverrides?: Partial<Record<GovernanceSystem, ArchitecturalPhaseId>>;
}

export interface GovernanceRunnerResolvedContext {
  currentApprovedPhase: ArchitecturalPhaseId | null;
  currentRoadmapAssumption?: string;
  currentOwningSystem?: GovernanceSystem;
  activePhaseIds: ArchitecturalPhaseId[];
  supportingPhaseIds: ArchitecturalPhaseId[];
  futurePhaseIds: ArchitecturalPhaseId[];
  dependencyMap: readonly DependencyMapEdge[];
  phaseMap: readonly PhaseMapEntry[];
  systemPhaseMap: Record<GovernanceSystem, ArchitecturalPhaseId>;
}

export interface GovernanceRunnerInput extends GovernanceRecordMetadata {
  request: GovernanceRunnerStructuredRequest;
  assumptions?: GovernanceRunnerAssumptionInput[];
  contradictions?: GovernanceRunnerContradictionInput[];
  unknowns?: GovernanceRunnerUnknownInput[];
  providedContext?: GovernanceRunnerProvidedContext;
}

export interface GovernanceAnalysisBundle extends GovernanceRecordMetadata {
  request: GovernanceRunnerStructuredRequest;
  extractionSnapshot: ExtractionSnapshot;
  deltaAnalyzerResult: DeltaAnalyzerOutput;
  rebuildImpactReport: RebuildImpactReport;
  executionGateDecision: ExecutionGateDecisionTemplateData;
}
