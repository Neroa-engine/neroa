import { analyzeStrategyRoomSupportIntent } from "@/lib/workspace/strategy-room-support";
import type { NaruaEngineContext, NaruaWorkspaceContext } from "./planning-types";

export function createEngineWelcomeMessage(context: NaruaEngineContext) {
  return `Neroa is ready to generate the first ${context.engineTitle.toLowerCase()} output inside ${context.workspaceName}. ${context.engineDescription} will stay centered in this lane so the next deliverable is clear.`;
}

export function createEngineReply(context: NaruaEngineContext, message: string) {
  const recommendedStack = context.recommendedAIStack.slice(0, 3).join(", ");

  return [
    `Neroa is keeping the ${context.engineTitle} lane focused on ${context.engineDescription.toLowerCase()}.`,
    `Based on "${message.trim()}", the next move is to tighten the outcome, identify the immediate blocker, and sequence the next deliverable inside this lane thread only.`,
    recommendedStack
      ? `Recommended stack in this lane: ${recommendedStack}.`
      : "Recommended stack will sharpen as the lane context grows."
  ].join(" ");
}

function trimWorkspaceReplyTail(value: string) {
  return value.replace(/[.!?]+$/g, "").trim();
}

function truncateWorkspaceReplyText(value: string, maxLength = 180) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export function createWorkspaceWelcomeMessage(context: NaruaWorkspaceContext) {
  const supportingText =
    context.supportingLaneNames.length > 0
      ? ` Supporting lanes currently include ${context.supportingLaneNames.join(", ")}.`
      : "";

  return `Neroa has ${context.primaryLaneName} leading inside ${context.workspaceName}.${supportingText} Ask for strategy guidance, roadmap clarification, next-step help, or a human handoff in this same thread.`;
}

export function createWorkspaceReply(context: NaruaWorkspaceContext, message: string) {
  const supportIntent = analyzeStrategyRoomSupportIntent(message);
  const supportingText =
    context.supportingLaneNames.length > 0
      ? `If this needs adjacent context, I can pull from ${context.supportingLaneNames.join(", ")} without widening the whole workspace.`
      : "I will keep this workspace narrow until a second lane is truly needed.";

  if (supportIntent.wantsHumanSupport) {
    return [
      `Yes. If you want a person to step in for ${context.workspaceName}, use Contact support or the Support page.`,
      context.activeBlocker
        ? `The blocker worth handing off is ${truncateWorkspaceReplyText(
            trimWorkspaceReplyTail(context.activeBlocker),
            180
          )}.`
        : context.currentGoal
          ? `The current workspace focus is ${truncateWorkspaceReplyText(
              trimWorkspaceReplyTail(context.currentGoal),
              180
            )}.`
          : "I can also summarize the current workspace direction before you hand it off.",
      context.recommendedMove
        ? `If you stay here for now, the next move is ${truncateWorkspaceReplyText(
            trimWorkspaceReplyTail(context.recommendedMove),
            200
          )}.`
        : "If you stay here for now, tell me what feels unclear or blocked and I will tighten it with you."
    ].join(" ");
  }

  if (supportIntent.hasHelpIntent) {
    const opener =
      supportIntent.mentionsBlockage ||
      supportIntent.mentionsFrustration ||
      supportIntent.mentionsNotWorking
        ? "We can slow this down and get the workspace moving again."
        : supportIntent.mentionsConfusion || supportIntent.mentionsUncertainty
          ? "I can make the next move more concrete."
          : "I can help with that here.";
    const goalLine = context.currentGoal
      ? `Right now the workspace is centered on ${truncateWorkspaceReplyText(
          trimWorkspaceReplyTail(context.currentGoal),
          180
        )}.`
      : `Right now ${context.primaryLaneName} is the lead operating context in ${context.workspaceName}.`;
    const moveLine = context.recommendedMove
      ? `The best next move is ${truncateWorkspaceReplyText(
          trimWorkspaceReplyTail(context.recommendedMove),
          200
        )}.`
      : `Keep ${context.primaryLaneName} leading until the next concrete deliverable is clear.`;
    const blockerLine = context.activeBlocker
      ? `The blocker still in view is ${truncateWorkspaceReplyText(
          trimWorkspaceReplyTail(context.activeBlocker),
          180
        )}.`
      : supportingText;
    const close =
      supportIntent.mentionsRoadmap ||
      supportIntent.mentionsRecommendation ||
      supportIntent.mentionsBuild ||
      supportIntent.mentionsNextStep
        ? "Tell me whether the unclear part is the roadmap, build order, or plan recommendation and I will tighten just that part."
        : "Tell me what feels unclear, blocked, or not working and I will tighten that part only.";

    return [opener, goalLine, moveLine, blockerLine, close].join(" ");
  }

  return [
    `Neroa is treating ${context.primaryLaneName} as the lead operating context in ${context.workspaceName}.`,
    `Based on "${message.trim()}", the next move is to tighten the immediate outcome, choose the next concrete deliverable, and keep the work anchored to the active lane.`,
    supportingText,
    "If the roadmap feels unclear, something is not working, or you want a person to step in, say that directly here."
  ].join(" ");
}
