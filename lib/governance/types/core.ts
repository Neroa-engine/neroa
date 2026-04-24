export interface GovernanceRecordMetadata {
  id?: string;
  date?: string;
  preparedBy?: string;
}

export interface GovernanceLinkReference {
  id?: string;
  label?: string;
  path?: string;
}

export interface ConfidenceState {
  score: number;
  scale: "unit_interval" | "percentage";
  minimum?: number;
  passed?: boolean;
  notes?: string;
}
