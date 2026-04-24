import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { mirrorStartPlanningThreadShadowIfEnabled } from "@/lib/intelligence/runtime-bridge";
import { recordPlatformEvent } from "@/lib/platform/foundation";
import { runPlanningChat } from "@/lib/start/planning-chat";

const messageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["assistant", "user"]),
  content: z.string().min(1).max(4000),
  createdAt: z.string().optional()
});

const bodySchema = z.object({
  threadId: z.string().min(1).max(120).optional(),
  lane: z.enum(["diy", "managed"]),
  title: z.string().max(120).optional(),
  summary: z.string().max(4000).optional(),
  message: z.string().min(1).max(4000),
  messages: z.array(messageSchema).max(20).default([])
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser({
      message: "Sign in before using the planning center chat."
    });

    if (!auth.ok) {
      return auth.response;
    }

    const body = bodySchema.parse(await request.json());
    const threadId = body.threadId?.trim() || crypto.randomUUID();
    const result = await runPlanningChat({
      threadId,
      lane: body.lane,
      title: body.title,
      summary: body.summary,
      message: body.message,
      messages: body.messages
    });

    if (result.visibleStrategist.enabled) {
      console.info("[start-visible-intelligence]", {
        threadId,
        lane: body.lane,
        visibleConversationState: result.visibleStrategist.visibleConversationState,
        greetingModeActive: result.visibleStrategist.greetingModeActive,
        greetingQuestionOnly: result.visibleStrategist.greetingQuestionOnly,
        hiddenTargetSelected: result.visibleStrategist.hiddenTargetSelected,
        renderedTargetSelected: result.visibleStrategist.renderedTargetSelected,
        hiddenQuestionType: result.visibleStrategist.hiddenQuestionType,
        renderedQuestionType: result.visibleStrategist.renderedQuestionType,
        questionStyleType: result.visibleStrategist.questionStyleType,
        questionConfidenceLevel: result.visibleStrategist.questionConfidenceLevel,
        questionConfidenceScore: result.visibleStrategist.questionConfidenceScore,
        forcedEarlyNarrowing: result.visibleStrategist.forcedEarlyNarrowing,
        contradictionSurfaced: result.visibleStrategist.contradictionSurfaced,
        branchAmbiguitySurfaced: result.visibleStrategist.branchAmbiguitySurfaced,
        lowConfidenceRecoveryMode: result.visibleStrategist.lowConfidenceRecoveryMode,
        renderedTopicCategory: result.visibleStrategist.renderedTopicCategory,
        repeatedPhrasePrevented: result.visibleStrategist.repeatedPhrasePrevented,
        echoSuppressed: result.visibleStrategist.echoSuppressed,
        echoReplayPrevented: result.visibleStrategist.echoReplayPrevented,
        architectureDiscoveryAsked: result.visibleStrategist.architectureDiscoveryAsked,
        adminSurfaceDiscoveryAsked: result.visibleStrategist.adminSurfaceDiscoveryAsked,
        customerPortalDiscoveryAsked: result.visibleStrategist.customerPortalDiscoveryAsked,
        apiIntegrationDiscoveryAsked: result.visibleStrategist.apiIntegrationDiscoveryAsked,
        experientialDiscoveryAsked: result.visibleStrategist.experientialDiscoveryAsked,
        suggestionOffered: result.visibleStrategist.suggestionOffered,
        intakeGroundingBlockedShaping: result.visibleStrategist.intakeGroundingBlockedShaping,
        recentCategorySuppressed: result.visibleStrategist.recentCategorySuppressed,
        repeatedCategoryPrevented: result.visibleStrategist.repeatedCategoryPrevented,
        shapeLanguageBlocked: result.visibleStrategist.shapeLanguageBlocked,
        fallbackUsed: result.visibleStrategist.fallbackUsed,
        fallbackPhrasingUsed: result.visibleStrategist.fallbackPhrasingUsed,
        fallbackReason: result.visibleStrategist.fallbackReason,
        preservedGreetingFlow: result.visibleStrategist.preservedGreetingFlow,
        branchAmbiguityState: result.visibleStrategist.branchAmbiguityState,
        contradictionBlockerPresent: result.visibleStrategist.contradictionBlockerPresent,
        unknownBlockerPresent: result.visibleStrategist.unknownBlockerPresent,
        roadmapReadinessState: result.visibleStrategist.roadmapReadinessState,
        executionReadinessState: result.visibleStrategist.executionReadinessState
      });
    }

    await recordPlatformEvent({
      supabase: auth.supabase,
      userId: auth.user.id,
      eventType: "start_planning_chat_message",
      details: {
        threadId,
        lane: body.lane,
        provider: result.provider,
        usedFallback: result.usedFallback,
        messageCount: result.threadState.messages.length,
        visibleIntelligenceEnabled: result.visibleStrategist.enabled,
        visibleIntelligenceUsedHidden: result.visibleStrategist.usedHidden,
        visibleConversationState: result.visibleStrategist.visibleConversationState,
        greetingModeActive: result.visibleStrategist.greetingModeActive,
        greetingQuestionOnly: result.visibleStrategist.greetingQuestionOnly,
        hiddenTargetSelected: result.visibleStrategist.hiddenTargetSelected,
        renderedTargetSelected: result.visibleStrategist.renderedTargetSelected,
        hiddenQuestionType: result.visibleStrategist.hiddenQuestionType,
        renderedQuestionType: result.visibleStrategist.renderedQuestionType,
        questionStyleType: result.visibleStrategist.questionStyleType,
        questionConfidenceLevel: result.visibleStrategist.questionConfidenceLevel,
        questionConfidenceScore: result.visibleStrategist.questionConfidenceScore,
        forcedEarlyNarrowing: result.visibleStrategist.forcedEarlyNarrowing,
        contradictionSurfaced: result.visibleStrategist.contradictionSurfaced,
        branchAmbiguitySurfaced: result.visibleStrategist.branchAmbiguitySurfaced,
        lowConfidenceRecoveryMode: result.visibleStrategist.lowConfidenceRecoveryMode,
        renderedTopicCategory: result.visibleStrategist.renderedTopicCategory,
        repeatedPhrasePrevented: result.visibleStrategist.repeatedPhrasePrevented,
        echoSuppressed: result.visibleStrategist.echoSuppressed,
        echoReplayPrevented: result.visibleStrategist.echoReplayPrevented,
        architectureDiscoveryAsked: result.visibleStrategist.architectureDiscoveryAsked,
        adminSurfaceDiscoveryAsked: result.visibleStrategist.adminSurfaceDiscoveryAsked,
        customerPortalDiscoveryAsked: result.visibleStrategist.customerPortalDiscoveryAsked,
        apiIntegrationDiscoveryAsked: result.visibleStrategist.apiIntegrationDiscoveryAsked,
        experientialDiscoveryAsked: result.visibleStrategist.experientialDiscoveryAsked,
        suggestionOffered: result.visibleStrategist.suggestionOffered,
        intakeGroundingBlockedShaping: result.visibleStrategist.intakeGroundingBlockedShaping,
        recentCategorySuppressed: result.visibleStrategist.recentCategorySuppressed,
        repeatedCategoryPrevented: result.visibleStrategist.repeatedCategoryPrevented,
        shapeLanguageBlocked: result.visibleStrategist.shapeLanguageBlocked,
        visibleFallbackUsed: result.visibleStrategist.fallbackUsed,
        visibleFallbackPhrasingUsed: result.visibleStrategist.fallbackPhrasingUsed,
        visibleFallbackReason: result.visibleStrategist.fallbackReason,
        preservedGreetingFlow: result.visibleStrategist.preservedGreetingFlow,
        branchAmbiguityState: result.visibleStrategist.branchAmbiguityState,
        contradictionBlockerPresent: result.visibleStrategist.contradictionBlockerPresent,
        unknownBlockerPresent: result.visibleStrategist.unknownBlockerPresent,
        roadmapReadinessState: result.visibleStrategist.roadmapReadinessState,
        executionReadinessState: result.visibleStrategist.executionReadinessState
      }
    }).catch(() => {
      // Planning chat can continue even if telemetry is unavailable.
    });

    try {
      mirrorStartPlanningThreadShadowIfEnabled({
        threadState: result.threadState,
        assistantMessage: result.assistantMessage,
        visibleStrategist: result.visibleStrategist,
        title: body.title,
        summary: body.summary,
        preparedBy: "Read-Only Strategy Room Intelligence Shadow Integration v1"
      });
    } catch {
      // Shadow intelligence is read-only and must never affect the visible planning chat path.
    }

    return NextResponse.json({
      ok: true,
      threadId,
      provider: result.provider,
      usedFallback: result.usedFallback,
      assistantMessage: result.assistantMessage,
      threadState: result.threadState
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to continue the planning thread."
      },
      {
        status: 500
      }
    );
  }
}
