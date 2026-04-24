import type { PlanningThreadState } from "@/lib/start/planning-thread";
import type { StrategyLaneSnapshot } from "@/lib/workspace/strategy-lane";
import { createEmptyIntelligenceBundle, applyArtifactsToIntelligenceState, rebuildIntelligenceStateFromArtifacts } from "./orchestration";
import {
  createArtifactsFromPlanningThreadState,
  createArtifactsFromStrategyLaneSnapshot
} from "./sources";

function createPlanningThread(args: {
  threadId: string;
  lane: PlanningThreadState["lane"];
  messages: PlanningThreadState["messages"];
  updatedAt: string;
}) {
  return {
    threadId: args.threadId,
    lane: args.lane,
    messages: args.messages,
    updatedAt: args.updatedAt,
    metadata: {
      lane: args.lane,
      projectTitle: null,
      perceivedProject: null,
      scopeNotes: [],
      recommendedNextStep: "Continue extracting core product truth."
    }
  } satisfies PlanningThreadState;
}

function createWeakGreetingArtifacts() {
  return createArtifactsFromPlanningThreadState(
    createPlanningThread({
      threadId: "thread-weak-greeting",
      lane: "diy",
      updatedAt: "2026-04-17T10:00:00.000Z",
      messages: [
        {
          id: "assistant-1",
          role: "assistant",
          content: "What are you thinking about building?",
          createdAt: "2026-04-17T10:00:00.000Z"
        },
        {
          id: "user-1",
          role: "user",
          content: "hey",
          createdAt: "2026-04-17T10:00:15.000Z"
        }
      ]
    }),
    "Adapter Example"
  );
}

function createApparelEcommerceArtifacts() {
  return createArtifactsFromPlanningThreadState(
    createPlanningThread({
      threadId: "thread-apparel-commerce",
      lane: "managed",
      updatedAt: "2026-04-17T11:00:00.000Z",
      messages: [
        {
          id: "assistant-1",
          role: "assistant",
          content: "What do you want to build first?",
          createdAt: "2026-04-17T11:00:00.000Z"
        },
        {
          id: "user-1",
          role: "user",
          content: "I want to build an apparel ecommerce storefront for sneaker collectors.",
          createdAt: "2026-04-17T11:00:20.000Z"
        },
        {
          id: "user-2",
          role: "user",
          content: "The MVP needs catalog browse, checkout, and Stripe. Not custom marketplace sellers yet.",
          createdAt: "2026-04-17T11:01:10.000Z"
        }
      ]
    }),
    "Adapter Example"
  );
}

function createCryptoAnalyticsArtifacts() {
  return createArtifactsFromPlanningThreadState(
    createPlanningThread({
      threadId: "thread-crypto-analytics",
      lane: "managed",
      updatedAt: "2026-04-17T12:00:00.000Z",
      messages: [
        {
          id: "assistant-1",
          role: "assistant",
          content: "Who is this for and what should it help them do?",
          createdAt: "2026-04-17T12:00:00.000Z"
        },
        {
          id: "user-1",
          role: "user",
          content: "It is a crypto analytics platform for traders who want wallet intelligence and portfolio alerts.",
          createdAt: "2026-04-17T12:00:18.000Z"
        },
        {
          id: "user-2",
          role: "user",
          content: "We probably need dashboards, API data, and maybe an AI copilot later.",
          createdAt: "2026-04-17T12:01:02.000Z"
        }
      ]
    }),
    "Adapter Example"
  );
}

function createAmbiguousMarketplaceBookingArtifacts() {
  const snapshot = {
    version: 1,
    contextTitle: "Provider booking platform",
    activeQuestionField: "needs",
    updatedAt: "2026-04-17T13:00:00.000Z",
    draft: "",
    answers: {
      concept: "",
      target: "",
      offer: "",
      launch: "",
      budget: "",
      needs: ""
    },
    outputs: null,
    messages: [
      {
        id: "narua-1",
        role: "narua",
        content: "Who are the main people on both sides of this product?"
      },
      {
        id: "user-1",
        role: "user",
        content: "Customers discover providers and then book appointment slots."
      },
      {
        id: "user-2",
        role: "user",
        content: "Actually we may charge a take rate if providers close business through the platform."
      }
    ]
  } satisfies StrategyLaneSnapshot;

  return createArtifactsFromStrategyLaneSnapshot({
    threadId: "thread-marketplace-booking",
    snapshot,
    workspaceId: "workspace-1",
    projectId: "project-1",
    preparedBy: "Adapter Example"
  });
}

function runExample(artifacts: ReturnType<typeof createWeakGreetingArtifacts>) {
  return rebuildIntelligenceStateFromArtifacts(artifacts, {
    preparedBy: "Adapter Example",
    rebuiltFromScratch: true
  });
}

export function createReplayRebuildExample() {
  const artifacts = createApparelEcommerceArtifacts();
  const incremental = applyArtifactsToIntelligenceState(
    createEmptyIntelligenceBundle({
      preparedBy: "Adapter Example"
    }),
    artifacts,
    {
      preparedBy: "Adapter Example"
    }
  );
  const rebuilt = rebuildIntelligenceStateFromArtifacts(artifacts, {
    preparedBy: "Adapter Example",
    rebuiltFromScratch: true
  });

  return {
    incremental,
    rebuilt,
    samePrimaryBranch:
      incremental.branchState.primaryBranch?.branch === rebuilt.branchState.primaryBranch?.branch,
    sameQuestionTarget:
      incremental.questionSelection.selectedQuestionTarget?.targetId ===
      rebuilt.questionSelection.selectedQuestionTarget?.targetId
  };
}

export const CONVERSATION_ARTIFACT_ADAPTER_EXAMPLES = {
  weakGreetingThread: runExample(createWeakGreetingArtifacts()),
  apparelEcommerceThread: runExample(createApparelEcommerceArtifacts()),
  cryptoAnalyticsThread: runExample(createCryptoAnalyticsArtifacts()),
  ambiguousMarketplaceVsBookingThread: runExample(createAmbiguousMarketplaceBookingArtifacts()),
  replayRebuild: createReplayRebuildExample()
};
