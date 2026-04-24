import {
  EXECUTION_PRECONDITIONS,
  type ArchitecturalPhaseId
} from "../constants";
import type { DeltaAnalyzerOutput } from "../types";
import type { ExecutionGateDecisionTemplateData } from "../types/templates";
import type { GovernanceRunnerResolvedContext } from "./types";
import { createDeterministicRecordId, evaluateGateOutcome } from "./helpers";

export function createExecutionGateDecision(
  deltaAnalyzerResult: DeltaAnalyzerOutput,
  context: GovernanceRunnerResolvedContext
): ExecutionGateDecisionTemplateData {
  const approvedPhase = context.currentApprovedPhase;
  const blockedDependencies = deltaAnalyzerResult.dependenciesTouched
    .filter((dependency) => dependency.direction === "prohibited")
    .map((dependency) => `${dependency.fromSystem} -> ${dependency.toSystem}`);
  const systemsStillRequiringClarification = deltaAnalyzerResult.affectedSystems
    .filter((system) => {
      return (
        system.trustCritical === true &&
        approvedPhase !== 4 &&
        deltaAnalyzerResult.changeClassification.impactCategory !== "local"
      );
    })
    .map((system) => system.system);
  const futurePhaseTouched =
    deltaAnalyzerResult.futurePhasesTouched.length > 0 ||
    (deltaAnalyzerResult.primaryPhase !== null &&
      context.futurePhaseIds.includes(deltaAnalyzerResult.primaryPhase.phaseId));
  const affectedPhaseIds: ArchitecturalPhaseId[] = [
    ...(deltaAnalyzerResult.primaryPhase ? [deltaAnalyzerResult.primaryPhase.phaseId] : []),
    ...deltaAnalyzerResult.secondaryPhasesTouched.map((phase) => phase.phaseId),
    ...deltaAnalyzerResult.futurePhasesTouched.map((phase) => phase.phaseId)
  ];
  const outOfPhase =
    approvedPhase !== null && affectedPhaseIds.some((phaseId) => phaseId > approvedPhase);
  const outcome = evaluateGateOutcome({
    impactCategory: deltaAnalyzerResult.changeClassification.impactCategory,
    roadmapRevisionRequired: deltaAnalyzerResult.roadmapRevisionRequired,
    confidencePassed: deltaAnalyzerResult.confidenceThresholdMetForExecutionEligibility,
    futurePhaseTouched,
    outOfPhase,
    prohibitedDependencyDetected: blockedDependencies.length > 0,
    blockedContradictionDetected: deltaAnalyzerResult.contradictionsIntroducedOrWorsened.some(
      (contradiction) => contradiction.blocked === true || contradiction.severity === "critical"
    )
  });
  const requiredPreconditionsSatisfied = EXECUTION_PRECONDITIONS.filter((precondition) => {
    switch (precondition) {
      case "Extraction sufficiency":
        return true;
      case "Branch classification stable":
        return !deltaAnalyzerResult.checks.some(
          (check) => check.name === "branch stability check" && !check.passed
        );
      case "Delta-Analyzer complete":
        return true;
      case "Rebuild Impact Report complete":
        return false;
      case "Phase mapping complete":
        return false;
      case "Roadmap revision complete if required":
        return !deltaAnalyzerResult.roadmapRevisionRequired;
      default:
        return false;
    }
  });

  return {
    id: createDeterministicRecordId("gate", deltaAnalyzerResult.requestedChangeSummary),
    date: deltaAnalyzerResult.date,
    preparedBy: deltaAnalyzerResult.preparedBy,
    linkedDeltaAnalyzerWorksheetId: deltaAnalyzerResult.id,
    architectureConfidenceCheck: deltaAnalyzerResult.architectureConfidenceCheck,
    requiredPreconditionsSatisfied,
    blockedDependencies,
    systemsStillRequiringClarification,
    outcome,
    rationale:
      outcome === "Approved as-is"
        ? "The request stays inside the current approved phase, does not widen governance boundaries, and clears the confidence threshold."
        : outcome === "Approved but roadmap must be updated first"
          ? "The request is high-impact but still architecturally coherent if roadmap sequencing is revised first."
          : outcome === "Deferred to later phase"
            ? "The request belongs to a later or different phase than the one currently approved for execution."
            : "The request creates an architectural contradiction, a blocked conflict, or falls below the execution confidence threshold.",
    requiredNextAction:
      outcome === "Approved as-is"
        ? "Produce the Rebuild Impact Report and maintain the work inside the current approved phase."
        : outcome === "Approved but roadmap must be updated first"
          ? "Create a Roadmap Revision Record before any execution plan is drafted."
          : outcome === "Deferred to later phase"
            ? "Log a Phase Mapping Decision and defer the work to the owning phase."
            : "Resolve the blocked dependency or contradiction before retrying governance review."
  };
}
