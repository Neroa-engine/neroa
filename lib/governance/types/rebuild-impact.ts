import type {
  ArchitecturalPhaseId,
  ChangeType,
  ContradictionSeverity,
  ExecutionGateOutcome,
  GovernanceSystem,
  ImpactCategory,
  RiskLevel
} from "../constants";
import type { GovernanceRecordMetadata } from "./core";
import type {
  AffectedPhase,
  AffectedSystem,
  DependencyTouch
} from "./delta-analyzer";
import type { AssumptionReference } from "./extraction";

export interface RebuildScope {
  requiredRebuildScope: string[];
  affectedSystems: GovernanceSystem[];
  affectedPhases: ArchitecturalPhaseId[];
  rationale: string;
}

export interface UntouchedScope {
  systems: GovernanceSystem[];
  rationale: string;
}

export interface RegressionRisk {
  level: RiskLevel;
  knownExposure: string;
  highestRiskDependency?: string;
  mitigationNote?: string;
}

export interface AssumptionRevalidationItem {
  assumptionId?: string;
  statement: string;
  reason: string;
  requiredBeforeExecution: boolean;
}

export interface ContradictionImpactItem {
  contradictionId?: string;
  title: string;
  severity: ContradictionSeverity;
  effect: string;
  worsened: boolean;
}

export interface ExecutionGateDecisionReference {
  gateDecisionId?: string;
  outcome: ExecutionGateOutcome;
  rationale?: string;
  linkedDecisionPath?: string;
}

export interface RebuildImpactReport extends GovernanceRecordMetadata {
  linkedDeltaAnalyzerWorksheetId?: string;
  linkedExtractionSnapshotId?: string;
  requestedChange: string;
  trigger?: string;
  whyNow?: string;
  primaryPhase: AffectedPhase | null;
  secondaryPhases: AffectedPhase[];
  futurePhasesTouched: AffectedPhase[];
  affectedSystems: AffectedSystem[];
  dependenciesTouched: DependencyTouch[];
  impactCategory: ImpactCategory;
  riskLevel: RiskLevel;
  changeType: ChangeType;
  roadmapRevisionRequired: boolean;
  executionStatus: ExecutionGateOutcome;
  rebuildScope: RebuildScope;
  untouchedScope: UntouchedScope;
  regressionRisk: RegressionRisk;
  assumptionsAffected: AssumptionReference[];
  assumptionsToRevalidate: AssumptionRevalidationItem[];
  contradictionsTriggered: ContradictionImpactItem[];
  linkedGateDecision?: ExecutionGateDecisionReference;
}
