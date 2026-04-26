import {
  qaValidationSummarySchema,
  type QAValidationResult
} from "./types.ts";

function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildQAValidationSummary(result: QAValidationResult) {
  const satisfiedArtifacts = result.artifactRequirements.filter((requirement) =>
    result.artifacts.some((artifact) => artifact.kind === requirement.kind)
  ).length;
  const satisfiedCriteria = result.criterionResults.filter(
    (criterion) => criterion.status === "satisfied"
  ).length;
  const headline =
    result.releaseDecision.canMarkReleaseReady
      ? "Accepted and release-ready"
      : result.completionReadiness.status === "awaiting_run_completion"
        ? "Run finished state is still pending"
        : result.completionReadiness.status === "awaiting_artifacts"
          ? "Awaiting QA artifacts"
          : result.completionReadiness.status === "awaiting_review"
            ? "Awaiting QA review"
            : result.completionReadiness.status === "failed"
              ? "Run failed QA readiness"
              : "Remediation is still required";

  return qaValidationSummarySchema.parse({
    validationId: result.qaValidationId,
    status: result.status,
    headline,
    completionLabel: formatStatusLabel(result.completionReadiness.status),
    releaseLabel: formatStatusLabel(result.releaseDecision.status),
    blockerLabels: result.blockers,
    warningLabels: result.warnings,
    needsHumanReview: result.needsHumanReview,
    canPresentAsComplete: result.releaseDecision.canPresentAsComplete,
    artifactProgressLabel: `${satisfiedArtifacts}/${result.artifactRequirements.length} artifact requirements satisfied`,
    criterionProgressLabel: `${satisfiedCriteria}/${result.criterionResults.length} acceptance criteria satisfied`
  });
}
