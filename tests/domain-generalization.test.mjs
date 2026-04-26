import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConversationSessionState } from "../lib/intelligence/conversation/index.ts";
import {
  buildWorkspaceProjectIntelligence,
  generateProjectBrief
} from "../lib/intelligence/project-brief-generator.ts";
import { buildStoredProjectMetadata } from "../lib/workspace/project-metadata.ts";
import { buildProjectContextSnapshot } from "../lib/workspace/project-context-summary.ts";

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

test("crypto overlay preservation keeps archetype, capabilities, and backward-compatible pack routing", () => {
  const messages = [
    "Hi, my name is Tom.",
    "I want to build a crypto analytics website with a risk engine for pre-sales.",
    "Crypto investors are my main customer."
  ];
  const conversationBuild = buildConversationState(messages);
  const projectBrief = generateProjectBrief({
    projectName: "Tom Crypto Risk",
    projectDescription: messages.join(" "),
    conversationState: conversationBuild.state
  });

  assert.equal(projectBrief.systemArchetype, "analytics_platform");
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("dashboards_reporting"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("scoring_rules_engine"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("watchlists_saved_views"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("admin_console"));
  assert.ok(projectBrief.matchedOverlays.includes("crypto_analytics"));
  assert.equal(projectBrief.primaryDomainPack, "crypto_analytics");
  assert.equal(projectBrief.domainPack, "crypto_analytics");
  assert.ok(projectBrief.overlayConfidence >= 0.6);
});

test("restaurant overlay preservation keeps restaurant defaults while exposing archetype and capability signals", () => {
  const messages = [
    "I want a restaurant sales platform.",
    "It's for owners and managers.",
    "Multi-location if possible."
  ];
  const conversationBuild = buildConversationState(messages);
  const projectBrief = generateProjectBrief({
    projectName: "Restaurant Reporting",
    projectDescription: messages.join(" "),
    conversationState: conversationBuild.state
  });

  assert.equal(projectBrief.systemArchetype, "analytics_platform");
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("dashboards_reporting"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("role_based_access"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("connectors_integrations"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("exports"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("admin_console"));
  assert.ok(projectBrief.matchedOverlays.includes("restaurant_sales"));
  assert.equal(projectBrief.primaryDomainPack, "restaurant_sales");
  assert.equal(projectBrief.domainPack, "restaurant_sales");
});

test("generic fallback preservation keeps generic_saas primary when no overlay matches strongly", () => {
  const projectBrief = generateProjectBrief({
    projectName: "Consultant Workflow",
    projectDescription: "A workflow SaaS for consultants to manage internal approvals and client handoffs."
  });

  assert.equal(projectBrief.domainPack, "generic_saas");
  assert.equal(projectBrief.primaryDomainPack, "generic_saas");
  assert.equal(projectBrief.matchedOverlays.length, 0);
  assert.ok(projectBrief.systemArchetype === "workflow_ops" || projectBrief.systemArchetype === "internal_tool");
  assert.ok(projectBrief.capabilityProfile.allCapabilities.length > 0);
});

test("donor portal archetype classification works without a bespoke overlay", () => {
  const projectBrief = generateProjectBrief({
    projectName: "Church Donor Portal",
    projectDescription: "I want a donor portal for churches."
  });

  assert.equal(projectBrief.systemArchetype, "portal");
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("auth"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("role_based_access"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("customer_portal"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("dashboards_reporting"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("payments_or_billing"));
  assert.equal(projectBrief.primaryDomainPack, "generic_saas");
  assert.equal(projectBrief.domainPack, "generic_saas");
});

test("medical equipment marketplace archetype classification works without a bespoke overlay", () => {
  const projectBrief = generateProjectBrief({
    projectName: "Used Medical Equipment Market",
    projectDescription: "I want a marketplace for used medical equipment."
  });

  assert.equal(projectBrief.systemArchetype, "marketplace");
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("marketplace_listings"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("search_filter"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("role_based_access"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("admin_console"));
  assert.equal(projectBrief.primaryDomainPack, "generic_saas");
});

test("legal intake workflow archetype classification works without a bespoke overlay", () => {
  const projectBrief = generateProjectBrief({
    projectName: "Legal Intake Workflow",
    projectDescription: "I want an internal approval workflow for legal intake."
  });

  assert.equal(projectBrief.systemArchetype, "workflow_ops");
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("workflow_approvals"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("document_or_case_intake"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("role_based_access"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("admin_console"));
  assert.equal(projectBrief.primaryDomainPack, "generic_saas");
});

test("HVAC field-service dashboard archetype classification works without a bespoke overlay", () => {
  const projectBrief = generateProjectBrief({
    projectName: "HVAC Dispatch Dashboard",
    projectDescription: "I want a field-service dashboard for HVAC teams."
  });

  assert.equal(projectBrief.systemArchetype, "workflow_ops");
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("dashboards_reporting"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("scheduling_dispatch"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("role_based_access"));
  assert.ok(projectBrief.capabilityProfile.allCapabilities.includes("notifications"));
  assert.equal(projectBrief.primaryDomainPack, "generic_saas");
});

test("backward compatibility holds for downstream IMT layers when the upgraded brief drives a non-overlay scenario", () => {
  const conversationBuild = buildConversationState([
    "I want a donor portal for churches."
  ]);
  const metadata = buildStoredProjectMetadata({
    title: "Church Donor Portal",
    description: "I want a donor portal for churches.",
    conversationState: conversationBuild.state
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: "workspace-donor",
    projectId: "workspace-donor",
    projectTitle: "Church Donor Portal",
    projectDescription: "I want a donor portal for churches.",
    projectMetadata: metadata
  });

  assert.equal(projectIntelligence.projectBrief.domainPack, "generic_saas");
  assert.equal(projectIntelligence.projectBrief.systemArchetype, "portal");
  assert.ok(projectIntelligence.projectBrief.capabilityProfile.allCapabilities.includes("customer_portal"));
  assert.equal(
    projectIntelligence.architectureBlueprint.domainPack,
    projectIntelligence.projectBrief.primaryDomainPack
  );
  assert.equal(
    projectIntelligence.roadmapPlan.domainPack,
    projectIntelligence.projectBrief.primaryDomainPack
  );
  assert.equal(
    projectIntelligence.governancePolicy.domainPack,
    projectIntelligence.projectBrief.primaryDomainPack
  );
});

test("Command Center and Strategy Room read the same upgraded ProjectBrief source without UI-local archetype logic", () => {
  const conversationBuild = buildConversationState([
    "I want a marketplace for used medical equipment."
  ]);
  const metadata = buildStoredProjectMetadata({
    title: "Medical Marketplace",
    description: "I want a marketplace for used medical equipment.",
    conversationState: conversationBuild.state
  });
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    projectTitle: "Medical Marketplace",
    projectDescription: "I want a marketplace for used medical equipment.",
    projectMetadata: metadata
  });
  const projectContext = buildProjectContextSnapshot({
    project: {
      title: "Medical Marketplace",
      description: "I want a marketplace for used medical equipment."
    },
    projectMetadata: metadata,
    projectBrief: projectIntelligence.projectBrief
  });
  const commandCenterPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/command-center/page.tsx", import.meta.url),
    "utf8"
  );
  const strategyRoomPageSource = readFileSync(
    new URL("../app/workspace/[workspaceId]/strategy-room/page.tsx", import.meta.url),
    "utf8"
  );

  assert.equal(
    projectContext.projectBrief.systemArchetype,
    projectIntelligence.projectBrief.systemArchetype
  );
  assert.deepEqual(
    projectContext.projectBrief.capabilityProfile.allCapabilities,
    projectIntelligence.projectBrief.capabilityProfile.allCapabilities
  );
  assert.match(commandCenterPageSource, /projectBrief:\s*projectIntelligence\.projectBrief/);
  assert.match(strategyRoomPageSource, /projectBrief=\{projectIntelligence\.projectBrief\}/);
  assert.doesNotMatch(commandCenterPageSource, /analytics_platform|marketplace|workflow_ops|crypto_analytics|restaurant_sales/);
  assert.doesNotMatch(strategyRoomPageSource, /analytics_platform|marketplace|workflow_ops|crypto_analytics|restaurant_sales/);
});
