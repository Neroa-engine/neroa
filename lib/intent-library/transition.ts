import {
  resultHasSafePatch
} from "./orchestrator.ts";
import { buildNextQuestionPlan } from "./question-planner.ts";
import {
  blockerClarificationPlanSchema,
  blockerCompletionDecisionSchema,
  blockerProgressSnapshotSchema,
  blockerTransitionResultSchema,
  type BlockerCompletionDecision,
  type BlockerClarificationPlan,
  type BlockerQueueEntry,
  type BlockerRuntimeState,
  type BlockerTransitionResult
} from "./runtime-types.ts";
import type { StructuredAnswerExtractionResult } from "./types.ts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function hasLaunchTimingSignal(value: string) {
  return /\b(?:launch|day one|day-one|mvp|first release|required|must have|later|post mvp|post-mvp|post launch|phase two|phase 2|eventually|not right now|not in mvp)\b/i.test(
    value
  );
}

function extractProviderDisplayNames(result: StructuredAnswerExtractionResult) {
  const providerValues = Array.isArray(result.normalizedAnswer?.providers)
      ? result.normalizedAnswer.providers
        .map((provider: unknown) =>
          typeof provider === "object" && provider && "displayName" in provider
            ? String((provider as { displayName?: unknown }).displayName ?? "").trim()
            : ""
        )
        .filter(Boolean)
    : [];
  const explicitValues = Array.isArray(result.normalizedAnswer?.values)
    ? result.normalizedAnswer.values
        .map((value: unknown) => String(value).trim())
        .filter(Boolean)
    : [];

  return providerValues.length > 0 ? providerValues : explicitValues;
}

function buildSpecialPartialClarification(args: {
  entry: BlockerQueueEntry;
  extractionResult: StructuredAnswerExtractionResult;
}): BlockerClarificationPlan | null {
  if (
    (args.entry.blockerId === "integrations" || args.entry.blockerId === "data_sources") &&
    args.extractionResult.status === "parsed" &&
    resultHasSafePatch(args.extractionResult) &&
    !hasLaunchTimingSignal(args.extractionResult.rawAnswer)
  ) {
    const providerNames = extractProviderDisplayNames(args.extractionResult);
    const providerSummary = providerNames.length > 0 ? providerNames.join(" and ") : "that provider";

    return blockerClarificationPlanSchema.parse({
      blockerId: args.entry.blockerId,
      prompt: `I captured ${providerSummary}. Is that required on day one, later, or just a likely option?`,
      helperText:
        "Neroa safely saved the provider signal. Answer in chat with whether it is launch-critical, later, or optional.",
      reason: "Provider name captured, but launch timing is still unclear.",
      examples: ["Required on day one", "Later", "Just a likely option"],
      basedOnStatus: "partial"
    });
  }

  if (
    args.entry.blockerId === "core_user_roles" &&
    args.extractionResult.status === "parsed" &&
    resultHasSafePatch(args.extractionResult) &&
    Array.isArray(args.extractionResult.normalizedAnswer?.buyerPersonas) &&
    Array.isArray(args.extractionResult.normalizedAnswer?.operatorPersonas) &&
    !Array.isArray(args.extractionResult.normalizedAnswer?.adminPersonas)
  ) {
    return blockerClarificationPlanSchema.parse({
      blockerId: args.entry.blockerId,
      prompt: "I captured the buyer and operator roles. Is there also an admin or customer-facing role we should plan for?",
      helperText:
        "Neroa saved the roles it could confirm. Answer in chat if there is also an admin or customer-facing role at launch.",
      reason: "Buyer and operator roles are known, but admin or customer roles are still unclear.",
      examples: ["Yes, admins too", "No, just owners and managers", "Customers also log in"],
      basedOnStatus: "partial"
    });
  }

  return null;
}

function buildDefaultClarificationPlan(args: {
  entry: BlockerQueueEntry;
  extractionResult: StructuredAnswerExtractionResult;
}): BlockerClarificationPlan {
  return blockerClarificationPlanSchema.parse({
    blockerId: args.entry.blockerId,
    prompt:
      cleanText(args.extractionResult.clarificationPrompt) || args.entry.currentQuestionText,
    helperText:
      args.extractionResult.status === "invalid" || args.extractionResult.status === "failed"
        ? "That answer stayed visible, but Neroa could not apply it yet. Clarify it in one short sentence here."
        : "Answer in chat and Neroa will keep the safe part, then tighten the remaining blocker automatically.",
    reason:
      cleanText(args.extractionResult.notes[0]) ||
      args.entry.reason,
    examples:
      buildNextQuestionPlan({
        entry: args.entry
      }).examples,
    basedOnStatus: args.extractionResult.status
  });
}

export function evaluateBlockerCompletion(args: {
  entry: BlockerQueueEntry;
  extractionResult: StructuredAnswerExtractionResult;
}): {
  decision: BlockerCompletionDecision;
  clarificationPlan: BlockerClarificationPlan | null;
} {
  const safePatchAccepted = resultHasSafePatch(args.extractionResult);
  const specialClarification = buildSpecialPartialClarification(args);

  if (specialClarification) {
    return {
      decision: blockerCompletionDecisionSchema.parse({
        blockerId: args.entry.blockerId,
        outcome: "blocker_partially_resolved",
        reason: specialClarification.reason,
        safePatchAccepted,
        shouldAdvance: false,
        shouldReask: true,
        shouldDefer: false,
        needsClarification: true
      }),
      clarificationPlan: specialClarification
    };
  }

  switch (args.extractionResult.status) {
    case "parsed":
      return {
        decision: blockerCompletionDecisionSchema.parse({
          blockerId: args.entry.blockerId,
          outcome: "blocker_resolved",
          reason: "The active blocker met its completion criteria with a safe structured patch.",
          safePatchAccepted,
          shouldAdvance: true,
          shouldReask: false,
          shouldDefer: false,
          needsClarification: false
        }),
        clarificationPlan: null
      };
    case "partial":
      return {
        decision: blockerCompletionDecisionSchema.parse({
          blockerId: args.entry.blockerId,
          outcome: "blocker_partially_resolved",
          reason: "Part of the blocker is safe to save, but a blocker-specific clarification is still needed.",
          safePatchAccepted,
          shouldAdvance: false,
          shouldReask: true,
          shouldDefer: false,
          needsClarification: true
        }),
        clarificationPlan: buildDefaultClarificationPlan(args)
      };
    case "needs_clarification":
      return {
        decision: blockerCompletionDecisionSchema.parse({
          blockerId: args.entry.blockerId,
          outcome: "blocker_needs_clarification",
          reason: "The answer stayed visible, but Neroa still needs a blocker-specific clarification before it can save safely.",
          safePatchAccepted,
          shouldAdvance: false,
          shouldReask: true,
          shouldDefer: false,
          needsClarification: true
        }),
        clarificationPlan: buildDefaultClarificationPlan(args)
      };
    case "invalid":
    case "failed":
    default:
      return {
        decision: blockerCompletionDecisionSchema.parse({
          blockerId: args.entry.blockerId,
          outcome: "blocker_invalid_retry",
          reason: "The answer could not be applied safely yet and needs an explicit retry or clarification.",
          safePatchAccepted: false,
          shouldAdvance: false,
          shouldReask: true,
          shouldDefer: false,
          needsClarification: true
        }),
        clarificationPlan: buildDefaultClarificationPlan(args)
      };
  }
}

export function createBlockerTransitionResult(args: {
  beforeRuntimeState: BlockerRuntimeState;
  activeEntry: BlockerQueueEntry;
  extractionResult: StructuredAnswerExtractionResult;
  afterRuntimeState: BlockerRuntimeState;
}): BlockerTransitionResult {
  const { decision, clarificationPlan } = evaluateBlockerCompletion({
    entry: args.activeEntry,
    extractionResult: args.extractionResult
  });
  const nextStatus =
    decision.outcome === "blocker_resolved"
      ? "resolved"
      : decision.outcome === "blocker_partially_resolved"
        ? "partially_resolved"
        : decision.outcome === "blocker_deferred"
          ? "deferred"
          : "active";
  const progressSnapshot = blockerProgressSnapshotSchema.parse({
    blockerId: args.activeEntry.blockerId,
    previousStatus: args.activeEntry.status,
    nextStatus,
    readinessImpact:
      decision.outcome === "blocker_resolved"
        ? "This blocker is now considered resolved and the queue can advance."
        : decision.outcome === "blocker_partially_resolved"
          ? "This blocker tightened safely, but Strategy Room still needs a clarification before it can move on."
          : decision.outcome === "blocker_deferred"
            ? "This blocker is deferred until its prerequisites are resolved."
            : "This blocker stays active until the clarification or retry succeeds.",
    blockerCountDelta:
      args.afterRuntimeState.unresolvedCount - args.beforeRuntimeState.unresolvedCount,
    approvalCriticalDelta:
      args.afterRuntimeState.approvalCriticalCount -
      args.beforeRuntimeState.approvalCriticalCount
  });
  const nextQuestionPlan =
    clarificationPlan != null
      ? buildNextQuestionPlan({
          entry: args.activeEntry,
          clarificationPlan
        })
      : args.afterRuntimeState.currentQuestionPlan;

  return blockerTransitionResultSchema.parse({
    blockerId: args.activeEntry.blockerId,
    completionDecision: decision,
    clarificationPlan,
    nextQuestionPlan: nextQuestionPlan ?? null,
    progressSnapshot,
    appliedPatch: resultHasSafePatch(args.extractionResult)
  });
}
