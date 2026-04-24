import { createGovernanceRunnerContext } from "./context";
import { runDeltaAnalyzer } from "./delta-analyzer";
import { createExecutionGateDecision } from "./execution-gate";
import { buildExtractionSnapshot } from "./extraction-builder";
import { createRebuildImpactReport } from "./rebuild-impact-report";
import type { GovernanceAnalysisBundle, GovernanceRunnerInput } from "./types";

export function runGovernanceAnalysis(input: GovernanceRunnerInput): GovernanceAnalysisBundle {
  const context = createGovernanceRunnerContext(input.providedContext);
  const extractionSnapshot = buildExtractionSnapshot(input, context);
  const deltaAnalyzerResult = runDeltaAnalyzer(input, extractionSnapshot, context);
  const executionGateDecision = createExecutionGateDecision(deltaAnalyzerResult, context);
  const rebuildImpactReport = createRebuildImpactReport(
    input,
    extractionSnapshot.id,
    deltaAnalyzerResult,
    executionGateDecision,
    context
  );

  return {
    id: input.id,
    date: input.date ?? "read-only",
    preparedBy: input.preparedBy ?? "Governance Runner v1",
    request: input.request,
    extractionSnapshot,
    deltaAnalyzerResult,
    rebuildImpactReport,
    executionGateDecision
  };
}
