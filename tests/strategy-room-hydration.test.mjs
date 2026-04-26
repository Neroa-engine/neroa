import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConversationSessionState } from "../lib/intelligence/conversation/index.ts";
import { buildWorkspaceProjectIntelligence } from "../lib/intelligence/project-brief-generator.ts";
import { runPlanningChat } from "../lib/start/planning-chat.ts";
import {
  buildInitialPlanningMessages,
  buildStrategyRoomInitialThreadState,
  choosePreferredPlanningThreadState,
  createPersistedPlanningThreadState
} from "../lib/start/planning-thread.ts";
import { buildProjectContextSnapshot } from "../lib/workspace/project-context-summary.ts";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  parseWorkspaceProjectDescription
} from "../lib/workspace/project-metadata.ts";

function buildUserMessage(id, content) {
  return {
    id,
    role: "user",
    content
  };
}

function buildConversationState(messages) {
  return buildConversationSessionState({
    messages: messages.map((message, index) => buildUserMessage(`u${index + 1}`, message))
  });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildProjectRecord(title, description) {
  return {
    id: `project-${slugify(title)}`,
    workspaceId: `workspace-${slugify(title)}`,
    title,
    description
  };
}

test("existing project reopen prefers the persisted planning thread instead of a blank shell", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const conversationBuild = buildConversationState(messages);
  const persistedThreadState = createPersistedPlanningThreadState({
    threadId: "project-thread-crypto",
    lane: "managed",
    messages: [
      {
        id: "user-real-crypto-1",
        role: "user",
        content: "We already agreed the launch audience is crypto investors."
      },
      {
        id: "assistant-real-crypto-1",
        role: "assistant",
        content:
          "Perfect. I'll keep the launch focused on crypto investors and tighten the remaining scope decisions from there."
      }
    ],
    metadata: {
      lane: "managed",
      projectTitle: "Tom Crypto Risk",
      perceivedProject: "Crypto risk analytics planning",
      scopeNotes: ["Crypto investors launch audience"],
      recommendedNextStep: "Confirm the supported chains for launch."
    },
    conversationState: conversationBuild.state,
    updatedAt: "2026-04-26T13:00:00.000Z"
  });
  const projectMetadata = buildStoredProjectMetadata({
    title: "Tom Crypto Risk",
    description: messages.join(" "),
    conversationState: conversationBuild.state,
    strategyState: {
      planningThreadState: persistedThreadState
    }
  });
  const parsed = parseWorkspaceProjectDescription(
    encodeWorkspaceProjectDescription(messages.join(" "), projectMetadata)
  );
  const resumedThreadState = buildStrategyRoomInitialThreadState({
    lane: "managed",
    planningThreadState: parsed.metadata?.strategyState?.planningThreadState ?? null,
    conversationState: parsed.metadata?.conversationState ?? null,
    hasSavedPlanningArtifacts: true,
    projectTitle: "Tom Crypto Risk",
    projectSummary: "Resume the crypto risk planning room.",
    currentFocus: "Clarifying the launch analytics scope",
    blockers: ["Supported chains are still unresolved"],
    nextStep: "Confirm the supported chains for launch.",
    fallbackThreadId: "project-strategy-fallback"
  });

  assert.equal(resumedThreadState?.threadId, "project-thread-crypto");
  assert.equal(resumedThreadState?.metadata.projectTitle, "Tom Crypto Risk");
  assert.equal(resumedThreadState?.messages.length, persistedThreadState.messages.length);
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      message.content.includes("launch audience is crypto investors")
    ),
    true
  );
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      /What should I call you\?|What are you thinking about building\?/i.test(message.content)
    ),
    false
  );
  assert.equal(
    choosePreferredPlanningThreadState({
      persistedThreadState: resumedThreadState,
      localThreadState: null
    })?.threadId,
    "project-thread-crypto"
  );
});

test("existing project refresh prefers the persisted project thread over a stale starter snapshot", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const conversationBuild = buildConversationState(messages);
  const persistedThreadState = createPersistedPlanningThreadState({
    threadId: "project-thread-refresh",
    lane: "managed",
    messages: [
      {
        id: "user-real-1",
        role: "user",
        content: "We already decided the launch should cover Ethereum and Solana."
      },
      {
        id: "assistant-real-1",
        role: "assistant",
        content: "Perfect. I'll keep the launch scope on Ethereum and Solana and leave wallet import out of MVP."
      }
    ],
    metadata: {
      lane: "managed",
      projectTitle: "Tom Crypto Risk",
      perceivedProject: "Crypto risk analytics planning",
      scopeNotes: ["Ethereum and Solana launch scope"],
      recommendedNextStep: "Tighten the remaining score-signal questions."
    },
    conversationState: conversationBuild.state,
    updatedAt: "2026-04-26T13:00:00.000Z"
  });
  const localStarterSnapshot = {
    threadId: "project-thread-starter",
    lane: "managed",
    messages: buildInitialPlanningMessages({
      lane: "managed",
      initialSummary: "Crypto risk analytics planning"
    }),
    metadata: {
      lane: "managed",
      projectTitle: "Tom Crypto Risk",
      perceivedProject: "Crypto risk analytics planning",
      scopeNotes: ["Crypto risk analytics planning"],
      recommendedNextStep: "Keep sharpening the user, workflow, and outcome before the workspace opens."
    },
    updatedAt: "2026-04-26T14:00:00.000Z"
  };

  const preferredThreadState = choosePreferredPlanningThreadState({
    persistedThreadState,
    localThreadState: localStarterSnapshot
  });

  assert.equal(preferredThreadState?.threadId, "project-thread-refresh");
  assert.equal(
    preferredThreadState?.messages.some((message) =>
      /What should I call you\?|What are you thinking about building\?/i.test(message.content)
    ),
    false
  );
});

test("existing project with meaningful intelligence but no real transcript builds a synthesized resume thread", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const projectTitle = "Tom Crypto Risk";
  const projectDescription = messages.join(" ");
  const project = buildProjectRecord(projectTitle, projectDescription);
  const conversationBuild = buildConversationState(messages);
  const projectMetadata = buildStoredProjectMetadata({
    title: projectTitle,
    description: projectDescription,
    conversationState: conversationBuild.state
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: project.workspaceId,
    projectId: project.id,
    projectTitle,
    projectDescription,
    projectMetadata
  });
  const projectContext = buildProjectContextSnapshot({
    project,
    projectMetadata,
    projectBrief: projectIntelligence.projectBrief,
    roadmapPlan: projectIntelligence.roadmapPlan,
    governancePolicy: projectIntelligence.governancePolicy
  });
  const resumedThreadState = buildStrategyRoomInitialThreadState({
    lane: "managed",
    planningThreadState: null,
    conversationState: null,
    projectBrief: projectIntelligence.projectBrief,
    hasSavedPlanningArtifacts: true,
    projectTitle,
    projectSummary: projectContext.buildingSummary,
    currentFocus: projectContext.currentFocus[0],
    blockers: projectIntelligence.governancePolicy.approvalReadiness.blockers,
    nextStep: projectContext.nextStepBody,
    fallbackThreadId: "project-strategy-meaningful"
  });

  assert.ok(resumedThreadState);
  assert.equal(
    resumedThreadState?.messages.some((message) => message.id === "assistant-intro"),
    false
  );
  assert.equal(resumedThreadState?.messages.some((message) => message.id === "project-resume-summary"), true);
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      message.content.includes(projectContext.currentFocus[0] ?? "")
    ),
    true
  );
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      /What should I call you\?|What are you thinking about building\?/i.test(message.content)
    ),
    false
  );
});

test("existing project with leaked starter prompts strips onboarding duplicates and keeps real planning messages", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const projectTitle = "Tom Crypto Risk";
  const projectDescription = messages.join(" ");
  const project = buildProjectRecord(projectTitle, projectDescription);
  const conversationBuild = buildConversationState(messages);
  const projectMetadata = buildStoredProjectMetadata({
    title: projectTitle,
    description: projectDescription,
    conversationState: conversationBuild.state
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: project.workspaceId,
    projectId: project.id,
    projectTitle,
    projectDescription,
    projectMetadata
  });
  const leakedThreadState = createPersistedPlanningThreadState({
    threadId: "project-thread-leaked-intro",
    lane: "managed",
    messages: [
      {
        id: "assistant-leak-1",
        role: "assistant",
        content: "Hi - I'm Neroa. What should I call you?"
      },
      {
        id: "user-leak-name",
        role: "user",
        content: "Tom"
      },
      {
        id: "assistant-leak-2",
        role: "assistant",
        content: "Good to meet you, Tom. What are you thinking about building?"
      },
      {
        id: "assistant-leak-3",
        role: "assistant",
        content: "Hi - I'm Neroa. What should I call you?"
      },
      {
        id: "user-real-1",
        role: "user",
        content: "We need investor watchlist filtering in the MVP."
      },
      {
        id: "assistant-real-1",
        role: "assistant",
        content:
          "Then the product web lane stays focused on watchlists and search filters for the first release."
      }
    ],
    metadata: {
      lane: "managed",
      projectTitle,
      perceivedProject: "Crypto risk analytics planning",
      scopeNotes: ["Investor watchlist filtering in MVP"],
      recommendedNextStep: "Confirm the launch score inputs."
    },
    conversationState: conversationBuild.state,
    updatedAt: "2026-04-26T15:00:00.000Z"
  });
  const resumedThreadState = buildStrategyRoomInitialThreadState({
    lane: "managed",
    planningThreadState: leakedThreadState,
    conversationState: conversationBuild.state,
    projectBrief: projectIntelligence.projectBrief,
    hasSavedPlanningArtifacts: true,
    projectTitle,
    projectSummary: "Resume the crypto risk planning room.",
    currentFocus: "Clarifying launch watchlist behavior",
    blockers: projectIntelligence.governancePolicy.approvalReadiness.blockers,
    nextStep: "Confirm the launch score inputs.",
    fallbackThreadId: "project-strategy-leaked"
  });

  assert.ok(resumedThreadState);
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      /What should I call you\?|What are you thinking about building\?/i.test(message.content)
    ),
    false
  );
  assert.equal(
    resumedThreadState?.messages.some((message) => message.content === "Tom"),
    false
  );
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      message.content.includes("watchlist filtering in the MVP")
    ),
    true
  );
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      message.content.includes("product web lane stays focused")
    ),
    true
  );
});

test("existing project with saved conversation state but no persisted thread builds a real resume context", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const projectTitle = "Restaurant Reporting";
  const projectDescription = messages.join(" ");
  const project = buildProjectRecord(projectTitle, projectDescription);
  const conversationBuild = buildConversationState(messages);
  const projectMetadata = buildStoredProjectMetadata({
    title: projectTitle,
    description: projectDescription,
    conversationState: conversationBuild.state
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: project.workspaceId,
    projectId: project.id,
    projectTitle,
    projectDescription,
    projectMetadata
  });
  const projectContext = buildProjectContextSnapshot({
    project,
    projectMetadata,
    projectBrief: projectIntelligence.projectBrief,
    roadmapPlan: projectIntelligence.roadmapPlan,
    governancePolicy: projectIntelligence.governancePolicy
  });
  const resumedThreadState = buildStrategyRoomInitialThreadState({
    lane: "managed",
    planningThreadState: null,
    conversationState: projectMetadata.conversationState,
    hasSavedPlanningArtifacts: true,
    projectTitle,
    projectSummary: projectContext.buildingSummary,
    currentFocus: projectContext.currentFocus[0],
    blockers: projectIntelligence.governancePolicy.approvalReadiness.blockers,
    nextStep: projectContext.nextStepBody,
    fallbackThreadId: "project-strategy-restaurant"
  });

  assert.ok(resumedThreadState);
  assert.equal(resumedThreadState?.metadata.projectTitle, projectTitle);
  assert.equal(resumedThreadState?.messages.some((message) => message.content === projectContext.buildingSummary), true);
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      message.content.includes(projectContext.currentFocus[0] ?? "")
    ),
    true
  );
  assert.equal(
    resumedThreadState?.messages.some((message) => message.content.includes("Open blockers:")),
    true
  );
});

test("founder name already known forces resume mode instead of asking what to call the user again", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want a donor portal for churches."
  ];
  const projectTitle = "Untitled project";
  const projectDescription = messages.join(" ");
  const project = buildProjectRecord(projectTitle, projectDescription);
  const conversationBuild = buildConversationState(messages);
  const projectMetadata = buildStoredProjectMetadata({
    title: projectTitle,
    description: projectDescription,
    conversationState: conversationBuild.state
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: project.workspaceId,
    projectId: project.id,
    projectTitle,
    projectDescription,
    projectMetadata
  });
  const projectContext = buildProjectContextSnapshot({
    project,
    projectMetadata,
    projectBrief: projectIntelligence.projectBrief,
    roadmapPlan: projectIntelligence.roadmapPlan,
    governancePolicy: projectIntelligence.governancePolicy
  });
  const resumedThreadState = buildStrategyRoomInitialThreadState({
    lane: "managed",
    planningThreadState: null,
    conversationState: null,
    projectBrief: projectIntelligence.projectBrief,
    hasSavedPlanningArtifacts: false,
    projectTitle,
    projectSummary: projectContext.buildingSummary,
    currentFocus: projectContext.currentFocus[0],
    blockers: projectIntelligence.governancePolicy.approvalReadiness.blockers,
    nextStep: projectContext.nextStepBody,
    fallbackThreadId: "project-strategy-founder-known"
  });

  assert.ok(resumedThreadState);
  assert.equal(resumedThreadState?.messages.some((message) => message.id === "project-resume-summary"), true);
  assert.equal(
    resumedThreadState?.messages.some((message) =>
      /What should I call you\?|What are you thinking about building\?/i.test(message.content)
    ),
    false
  );
});

test("existing project with known founder name never re-emits the name prompt on the next turn", async () => {
  const conversationBuild = buildConversationState(["Hi, my name is Tom."]);
  const result = await runPlanningChat({
    threadId: "planning-founder-known",
    lane: "managed",
    title: "Untitled project",
    summary: null,
    messages: [],
    message: "Hey",
    conversationState: conversationBuild.state,
    existingProjectContext: true
  });

  assert.doesNotMatch(result.assistantMessage.content, /What should I call you\?/i);
});

test("existing project with known product direction never re-emits the build starter prompt", async () => {
  const conversationBuild = buildConversationState([
    "I want a donor portal for churches."
  ]);
  const result = await runPlanningChat({
    threadId: "planning-product-known",
    lane: "managed",
    title: "Church donor portal",
    summary: "Donor portal for churches.",
    messages: [],
    message: "Okay",
    conversationState: conversationBuild.state,
    existingProjectContext: true
  });

  assert.doesNotMatch(result.assistantMessage.content, /What are you thinking about building\?/i);
});

test("fallback only appears when a project truly has no saved planning state", () => {
  const resumedThreadState = buildStrategyRoomInitialThreadState({
    lane: "diy",
    planningThreadState: null,
    conversationState: null,
    projectBrief: null,
    hasStrategyOverrides: false,
    hasRevisionHistory: false,
    hasSavedPlanningArtifacts: false,
    projectTitle: "Untitled project",
    projectSummary: null,
    currentFocus: null,
    blockers: [],
    nextStep: null,
    fallbackThreadId: "project-strategy-empty"
  });

  assert.equal(resumedThreadState, null);
  assert.equal(
    buildInitialPlanningMessages({
      lane: "diy"
    })[0]?.id,
    "assistant-intro"
  );
});

test("Strategy Room and Command Center still share the same project intelligence source during resume", () => {
  const strategyRoomPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/strategy-room/page.tsx", import.meta.url),
    "utf8"
  );
  const commandCenterPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/page.tsx", import.meta.url),
    "utf8"
  );
  const strategyRoomSource = readFileSync(
    new URL("../components/workspace/project-strategy-room-v1.tsx", import.meta.url),
    "utf8"
  );
  const canonicalEntrySource = readFileSync(
    new URL("../components/onboarding/canonical-entry-flow.tsx", import.meta.url),
    "utf8"
  );

  assert.match(strategyRoomPageSource, /projectBrief=\{projectIntelligence\.projectBrief\}/);
  assert.match(strategyRoomPageSource, /governancePolicy=\{projectIntelligence\.governancePolicy\}/);
  assert.match(commandCenterPageSource, /projectBrief:\s*projectIntelligence\.projectBrief/);
  assert.match(strategyRoomSource, /buildStrategyRoomInitialThreadState/);
  assert.match(strategyRoomSource, /initialThreadState=\{initialThreadState\}/);
  assert.match(strategyRoomSource, /allowStarterThread=\{starterThreadAllowed\}/);
  assert.match(strategyRoomSource, /persistedProjectContext=\{\{\s*workspaceId: project\.workspaceId,\s*projectId: project\.id\s*\}\}/);
  assert.match(canonicalEntrySource, /allowSyntheticFallback:\s*allowStarterThread/);
  assert.match(canonicalEntrySource, /workspaceId:\s*persistedProjectContext\?\.workspaceId/);
});
