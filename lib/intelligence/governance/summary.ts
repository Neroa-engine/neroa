import type { GovernancePolicy } from "./types.ts";

function formatReadinessStatus(status: GovernancePolicy["approvalReadiness"]["status"]) {
  if (status === "approval_ready") {
    return "Approval ready";
  }

  if (status === "review_ready") {
    return "Review ready";
  }

  return "Not ready";
}

function formatApprovalState(status: GovernancePolicy["currentApprovalState"]["status"]) {
  if (status === "approval_ready") {
    return "Ready for approval";
  }

  if (status === "review_ready") {
    return "Review tightening";
  }

  if (status === "approved") {
    return "Approved";
  }

  if (status === "revision_required") {
    return "Revision required";
  }

  return "Draft governance";
}

export type GovernancePolicySummary = {
  headline: string;
  readinessLabel: string;
  approvalStateLabel: string;
  blockerLabels: string[];
  guardrailLabels: string[];
  revisionLabel: string;
};

export function buildGovernancePolicySummary(
  governancePolicy: GovernancePolicy
): GovernancePolicySummary {
  const activeRevision =
    [...governancePolicy.roadmapRevisionRecords]
      .reverse()
      .find((record) => record.status !== "resolved" && record.status !== "superseded") ??
    null;

  return {
    headline: `${formatApprovalState(governancePolicy.currentApprovalState.status)} / ${formatReadinessStatus(
      governancePolicy.approvalReadiness.status
    )}`,
    readinessLabel: `${formatReadinessStatus(
      governancePolicy.approvalReadiness.status
    )} / readiness ${governancePolicy.approvalReadiness.readinessScore}`,
    approvalStateLabel: formatApprovalState(governancePolicy.currentApprovalState.status),
    blockerLabels: governancePolicy.approvalReadiness.blockers.slice(0, 4),
    guardrailLabels: governancePolicy.hardGuards.notes.slice(0, 4),
    revisionLabel: activeRevision
      ? `${activeRevision.status.replace(/_/g, " ")} / ${activeRevision.reason}`
      : "No active roadmap revision is open right now."
  };
}
