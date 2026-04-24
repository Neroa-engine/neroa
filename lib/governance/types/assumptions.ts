import type {
  ArchitecturalPhaseId,
  AssumptionStatus,
  BranchFamily,
  ExtractionCategory,
  GovernanceSystem
} from "../constants";
import type { ConfidenceState, GovernanceRecordMetadata } from "./core";

export interface AssumptionEvidence {
  sourceType: "message" | "artifact" | "document" | "inference" | "other";
  reference?: string;
  excerpt?: string;
}

export interface InvalidationTrigger {
  description: string;
  triggerType:
    | "new_user_input"
    | "roadmap_change"
    | "contradiction_detected"
    | "system_change"
    | "explicit_confirmation"
    | "other";
}

export interface AssumptionLedgerEntry extends GovernanceRecordMetadata {
  assumptionId: string;
  statement: string;
  category?: ExtractionCategory;
  whyInferred: string;
  confidence: ConfidenceState;
  sourceEvidence: AssumptionEvidence[];
  affectedBranches: BranchFamily[];
  affectedSystems: GovernanceSystem[];
  affectedPhases: ArchitecturalPhaseId[];
  invalidationTriggers: InvalidationTrigger[];
  expiryTrigger?: string;
  confirmationRequired: boolean;
  status: AssumptionStatus;
  owner?: string;
  notes?: string;
}
