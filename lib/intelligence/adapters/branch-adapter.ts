import {
  classifyBranchesFromExtractionState,
  detectBranchShift,
  recalculateBranchClassification,
  type BranchClassificationResult
} from "@/lib/intelligence/branching";
import {
  recalculateExtractionState,
  type ExtractionState
} from "@/lib/intelligence/extraction";
import type { BranchAdapterResult } from "./types";

function dedupe<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function syncBranchReferencesToExtractionState(args: {
  extractionState: ExtractionState;
  branchState: BranchClassificationResult;
  shiftLevel: ReturnType<typeof detectBranchShift> | null;
  updatedBy?: string;
}) {
  const nextState: ExtractionState = {
    ...args.extractionState,
    branchClassification: {
      ...args.extractionState.branchClassification,
      status: args.branchState.primaryBranch
        ? args.branchState.branchResolutionRequired
          ? "partial"
          : "answered"
        : "unanswered",
      primaryBranch: args.branchState.primaryBranch?.branch ?? null,
      secondaryBranches: args.branchState.secondaryBranches.map((branch) => branch.branch),
      branchStability: args.branchState.branchStability,
      branchShiftSuspected:
        (args.shiftLevel?.changedPrimaryBranch ?? false) ||
        args.branchState.branchResolutionRequired,
      confidence:
        args.branchState.primaryBranch?.confidence ??
        args.extractionState.branchClassification.confidence,
      sourceFieldKeys: args.branchState.sourceFieldKeys,
      evidenceIds: args.branchState.evidenceIds
    },
    overlayActivations: {
      ...args.extractionState.overlayActivations
    }
  };

  for (const overlay of Object.values(args.branchState.overlays)) {
    for (const alias of overlay.governanceOverlayAliases) {
      nextState.overlayActivations[alias] = {
        overlayType: alias,
        determination:
          overlay.state === "inactive"
            ? "inactive"
            : overlay.state === "possible"
            ? "unknown"
            : "active",
        confidence: overlay.confidence,
        rationale: overlay.reason,
        sourceFieldKeys: overlay.sourceFieldKeys,
        evidenceIds: overlay.evidenceIds
      };
    }
  }

  return recalculateExtractionState(nextState, {
    updatedBy: args.updatedBy,
    updateReason: "Synced branch classification references into extraction state."
  });
}

export function recalculateBranchStateFromExtractionState(
  extractionState: ExtractionState,
  previous?: BranchClassificationResult | null,
  updatedBy?: string
) {
  const branchState = recalculateBranchClassification(extractionState, previous, {
    updatedBy,
    updateReason: "Recalculated branch state from updated extraction truth."
  });
  const branchShiftAnalysis = previous ? detectBranchShift(previous, branchState) : null;
  const syncedExtractionState = syncBranchReferencesToExtractionState({
    extractionState,
    branchState,
    shiftLevel: branchShiftAnalysis,
    updatedBy
  });
  const warnings: string[] = [];

  if (!branchState.primaryBranch) {
    warnings.push("Branch classification remains unresolved after extraction recompute.");
  }

  if (branchState.branchResolutionRequired) {
    warnings.push("Branch ambiguity still requires a targeted resolution question.");
  }

  return {
    branchState,
    branchShiftAnalysis,
    extractionState: syncedExtractionState,
    warnings: dedupe(warnings)
  } satisfies BranchAdapterResult;
}

export function deriveInitialBranchState(
  extractionState: ExtractionState,
  updatedBy?: string
) {
  return classifyBranchesFromExtractionState(extractionState, {
    updatedBy,
    updateReason: "Derived initial branch state from extraction truth."
  });
}
