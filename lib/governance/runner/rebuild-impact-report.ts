import type { ArchitecturalPhaseId, GovernanceSystem } from "../constants";
import type { DeltaAnalyzerOutput, RebuildImpactReport } from "../types";
import type { ExecutionGateDecisionTemplateData } from "../types/templates";
import type { GovernanceRunnerInput, GovernanceRunnerResolvedContext } from "./types";
import { createDeterministicRecordId, dedupeNumbers, dedupeStrings } from "./helpers";

export function createRebuildImpactReport(
  input: GovernanceRunnerInput,
  extractionSnapshotId: string | undefined,
  deltaAnalyzerResult: DeltaAnalyzerOutput,
  executionGateDecision: ExecutionGateDecisionTemplateData,
  context: GovernanceRunnerResolvedContext
): RebuildImpactReport {
  const affectedPhaseIds = dedupeNumbers<ArchitecturalPhaseId>([
    ...(deltaAnalyzerResult.primaryPhase ? [deltaAnalyzerResult.primaryPhase.phaseId] : []),
    ...deltaAnalyzerResult.secondaryPhasesTouched.map((phase) => phase.phaseId),
    ...deltaAnalyzerResult.futurePhasesTouched.map((phase) => phase.phaseId)
  ]);
  const affectedSystemNames = deltaAnalyzerResult.affectedSystems.map((system) => system.system);
  const untouchedSystems = (
    Object.keys(context.systemPhaseMap) as GovernanceSystem[]
  ).filter((system) => !affectedSystemNames.includes(system));

  return {
    id: createDeterministicRecordId("rebuild-impact", input.request.requestedChange),
    date: input.date ?? "read-only",
    preparedBy: input.preparedBy ?? "Governance Runner v1",
    linkedDeltaAnalyzerWorksheetId: deltaAnalyzerResult.id,
    linkedExtractionSnapshotId: extractionSnapshotId,
    requestedChange: input.request.requestedChange,
    trigger: input.request.summary,
    whyNow: input.request.why,
    primaryPhase: deltaAnalyzerResult.primaryPhase,
    secondaryPhases: deltaAnalyzerResult.secondaryPhasesTouched,
    futurePhasesTouched: deltaAnalyzerResult.futurePhasesTouched,
    affectedSystems: deltaAnalyzerResult.affectedSystems,
    dependenciesTouched: deltaAnalyzerResult.dependenciesTouched,
    impactCategory: deltaAnalyzerResult.changeClassification.impactCategory,
    riskLevel: deltaAnalyzerResult.changeClassification.riskLevel,
    changeType: deltaAnalyzerResult.changeClassification.changeType,
    roadmapRevisionRequired: deltaAnalyzerResult.roadmapRevisionRequired,
    executionStatus: executionGateDecision.outcome,
    rebuildScope: {
      requiredRebuildScope: dedupeStrings([
        ...affectedSystemNames.map((system) => `${system} analysis`),
        ...(deltaAnalyzerResult.roadmapRevisionRequired ? ["Roadmap revision artifacts"] : []),
        "Execution gate decision record"
      ]),
      affectedSystems: affectedSystemNames,
      affectedPhases: affectedPhaseIds,
      rationale:
        deltaAnalyzerResult.changeClassification.rationale ??
        "Rebuild scope follows the affected systems and phases identified by the Delta-Analyzer."
    },
    untouchedScope: {
      systems: untouchedSystems,
      rationale:
        untouchedSystems.length === 0
          ? "Every governed system is implicated by this request."
          : "Untouched systems remain outside the current rebuild radius and should stay unchanged."
    },
    regressionRisk: {
      level: deltaAnalyzerResult.changeClassification.riskLevel,
      knownExposure:
        deltaAnalyzerResult.regressionExposure?.join(" ") ??
        "No special regression exposure was identified.",
      highestRiskDependency: deltaAnalyzerResult.dependenciesTouched.find((dependency) => {
        return dependency.direction !== "approved";
      })?.fromSystem,
      mitigationNote:
        executionGateDecision.outcome === "Approved as-is"
          ? "Keep the change isolated to the approved systems and phase boundary."
          : "Resolve the listed dependencies, contradictions, or roadmap gaps before execution."
    },
    assumptionsAffected: deltaAnalyzerResult.assumptionsAffected,
    assumptionsToRevalidate: deltaAnalyzerResult.assumptionsAffected.map((assumption) => ({
      assumptionId: assumption.assumptionId,
      statement: assumption.statement,
      reason: "This assumption overlaps with an affected branch, system, or phase.",
      requiredBeforeExecution: assumption.confirmationRequired ?? false
    })),
    contradictionsTriggered: deltaAnalyzerResult.contradictionsIntroducedOrWorsened.map(
      (contradiction) => ({
        contradictionId: contradiction.contradictionId,
        title: contradiction.title,
        severity: contradiction.severity,
        effect:
          contradiction.blocked === true
            ? "Blocks execution until the contradiction is resolved."
            : "Raises review and sequencing risk for the request.",
        worsened: true
      })
    ),
    linkedGateDecision: {
      gateDecisionId: executionGateDecision.id,
      outcome: executionGateDecision.outcome,
      rationale: executionGateDecision.rationale,
      linkedDecisionPath: "Delta-Analyzer -> Rebuild Impact Report -> Execution Gate Decision"
    }
  };
}
