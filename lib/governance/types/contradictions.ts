import type {
  ArchitecturalPhaseId,
  ContradictionClass,
  ContradictionSeverity,
  ContradictionStatus,
  GovernanceSystem
} from "../constants";
import type { GovernanceRecordMetadata } from "./core";

export interface ContradictionResolutionOption {
  title: string;
  description: string;
  recommended?: boolean;
  impactOnRoadmap?: string;
  impactOnPhases?: ArchitecturalPhaseId[];
}

export interface ContradictionEntry extends GovernanceRecordMetadata {
  contradictionId: string;
  title: string;
  contradictionClass: ContradictionClass;
  severity: ContradictionSeverity;
  conflictingStatements: string[];
  additionalEvidence?: string[];
  affectedSystems: GovernanceSystem[];
  affectedPhases: ArchitecturalPhaseId[];
  affectedAssumptions?: string[];
  whyItMatters: string;
  resolutionOptions: ContradictionResolutionOption[];
  blocked: boolean;
  owner?: string;
  nextAction?: string;
  status: ContradictionStatus;
  reviewTiming?: string;
}
