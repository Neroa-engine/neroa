import type { ArchitecturalPhaseId, GovernanceSystem } from "../constants";
import {
  DEFAULT_DEPENDENCY_MAP_EDGES,
  DEFAULT_PHASE_MAP_ENTRIES
} from "../types";
import type {
  GovernanceRunnerProvidedContext,
  GovernanceRunnerResolvedContext
} from "./types";

export const DEFAULT_ACTIVE_PHASE_IDS: readonly ArchitecturalPhaseId[] = [0, 1, 2, 3];
export const DEFAULT_SUPPORTING_PHASE_IDS: readonly ArchitecturalPhaseId[] = [4];
export const DEFAULT_FUTURE_PHASE_IDS: readonly ArchitecturalPhaseId[] = [5, 6];

export const TRUST_CRITICAL_SYSTEMS = [
  "Auth",
  "Billing / account",
  "Protected routing",
  "Backend governance"
] as const satisfies readonly GovernanceSystem[];

export const DEFAULT_SYSTEM_PHASE_MAP: Record<GovernanceSystem, ArchitecturalPhaseId> = {
  Governance: 0,
  "Planning intelligence": 1,
  "Delta-Analyzer / Rebuild Impact Report": 2,
  Auth: 4,
  "Billing / account": 4,
  Routing: 3,
  "Protected routing": 4,
  "Backend governance": 2,
  "Workspace / project surfaces": 3,
  "Browser / live-view": 5,
  "Future visual editor": 5,
  "Future orchestration layer": 6,
  Product: 3,
  Backend: 3,
  "Strategy Room": 1,
  "Extraction engine": 1,
  "Question engine": 1
};

export function createGovernanceRunnerContext(
  providedContext?: GovernanceRunnerProvidedContext
): GovernanceRunnerResolvedContext {
  return {
    currentApprovedPhase: providedContext?.currentApprovedPhase ?? null,
    currentRoadmapAssumption: providedContext?.currentRoadmapAssumption,
    currentOwningSystem: providedContext?.currentOwningSystem,
    activePhaseIds: [...(providedContext?.activePhaseIds ?? DEFAULT_ACTIVE_PHASE_IDS)],
    supportingPhaseIds: [
      ...(providedContext?.supportingPhaseIds ?? DEFAULT_SUPPORTING_PHASE_IDS)
    ],
    futurePhaseIds: [...(providedContext?.futurePhaseIds ?? DEFAULT_FUTURE_PHASE_IDS)],
    dependencyMap: providedContext?.dependencyMap ?? DEFAULT_DEPENDENCY_MAP_EDGES,
    phaseMap: providedContext?.phaseMap ?? DEFAULT_PHASE_MAP_ENTRIES,
    systemPhaseMap: {
      ...DEFAULT_SYSTEM_PHASE_MAP,
      ...(providedContext?.systemPhaseOverrides ?? {})
    }
  };
}
