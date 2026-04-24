import { createEmptyExtractionState } from "./state";
import {
  addDirectAnswerToField,
  markFieldConflict,
  markFieldPartial,
  recordAssumption,
  recordContradiction,
  recordInferredAnswer,
  recordUnknown,
  setBranchClassificationReference,
  setOverlayActivationReference,
  upgradeFieldFromPartialToAnswered
} from "./updates";
import type { ExtractionState } from "./types";

function withMessageSource(label: string, excerpt: string) {
  return {
    kind: "message" as const,
    label,
    excerpt
  };
}

export function createEarlyWeakInputExample(): ExtractionState {
  let state = createEmptyExtractionState({
    preparedBy: "Extraction Engine Example",
    requestSummary: {
      requestedChangeOrInitiative: "Need help figuring out what to build."
    }
  });

  state = markFieldPartial(state, {
    fieldKey: "request_summary",
    value: {
      kind: "text",
      summary: "The user wants help figuring out what to build."
    },
    confidenceScore: 0.42,
    source: withMessageSource("Kickoff message", "Need help figuring out what to build."),
    evidenceSummary: "The request exists, but product truth is still weak."
  });

  state = recordUnknown(state, {
    question: "What kind of product or system is being discussed?",
    categoryKey: "request_core_concept",
    whyItMatters: "Neroa cannot classify branch or product type without this.",
    whatItBlocks: "Roadmap drafting and branch classification.",
    blockingStage: "roadmap",
    urgency: "high",
    recommendedNextQuestionTarget: "request_core_concept"
  });

  return state;
}

export function createPartialEcommerceTruthExample(): ExtractionState {
  let state = createEmptyExtractionState({
    preparedBy: "Extraction Engine Example",
    requestSummary: {
      requestedChangeOrInitiative: "Launch a premium apparel ecommerce brand.",
      desiredOutcome: "Get the first store and offer ready."
    }
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "request_summary",
    value: {
      kind: "text",
      summary: "Launch a premium apparel ecommerce brand."
    },
    confidenceScore: 0.9,
    source: withMessageSource(
      "Brand request",
      "Launch a premium apparel ecommerce brand."
    ),
    evidenceSummary: "Direct product direction was stated."
  });

  state = recordInferredAnswer(state, {
    fieldKey: "primary_branch",
    value: {
      kind: "text",
      summary: "Commerce / Ecommerce"
    },
    confidenceScore: 0.74,
    source: withMessageSource(
      "Brand request",
      "Launch a premium apparel ecommerce brand."
    ),
    evidenceSummary: "Apparel storefront language strongly indicates commerce."
  });

  state = setBranchClassificationReference({
    state,
    primaryBranch: "Commerce / Ecommerce",
    confidenceScore: 0.74,
    updateReason: "Set inferred commerce branch reference."
  });

  state = setOverlayActivationReference({
    state,
    overlayType: "commerce",
    determination: "active",
    confidenceScore: 0.82,
    rationale: "Storefront and commerce signals are explicit."
  });

  state = markFieldPartial(state, {
    fieldKey: "primary_users",
    value: {
      kind: "list",
      summary: "fashion-forward shoppers",
      items: ["fashion-forward shoppers"]
    },
    confidenceScore: 0.66,
    source: withMessageSource(
      "Audience hint",
      "It is for fashion-forward shoppers."
    ),
    evidenceSummary: "One audience signal exists, but buyer/admin truth is still thin."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "desired_outcome",
    value: {
      kind: "text",
      summary: "Get the first storefront and offer live."
    },
    confidenceScore: 0.86,
    source: withMessageSource(
      "Outcome hint",
      "Get the first storefront and offer live."
    ),
    evidenceSummary: "Direct desired outcome was stated."
  });

  state = markFieldPartial(state, {
    fieldKey: "mvp_in_scope",
    value: {
      kind: "list",
      summary: "storefront, first product set, checkout",
      items: ["storefront", "first product set", "checkout"]
    },
    confidenceScore: 0.68,
    source: withMessageSource(
      "Scope hint",
      "We need the storefront, first product set, and checkout."
    ),
    evidenceSummary: "Some MVP scope exists, but out-of-scope boundaries are still missing."
  });

  state = recordUnknown(state, {
    question: "What should stay out of scope for the first launch?",
    categoryKey: "mvp_boundary",
    linkedFieldKeys: ["mvp_out_of_scope"],
    whyItMatters: "MVP boundaries are still incomplete.",
    whatItBlocks: "A stable roadmap boundary.",
    blockingStage: "roadmap",
    urgency: "high",
    recommendedNextQuestionTarget: "mvp_boundary"
  });

  return state;
}

export function createStrongerSaasTruthExample(): ExtractionState {
  let state = createEmptyExtractionState({
    preparedBy: "Extraction Engine Example",
    requestSummary: {
      requestedChangeOrInitiative:
        "Build a SaaS workflow platform for agencies to manage onboarding and delivery."
    }
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "request_summary",
    value: {
      kind: "text",
      summary:
        "Build a SaaS workflow platform for agencies to manage onboarding and delivery."
    },
    confidenceScore: 0.95,
    source: withMessageSource(
      "SaaS request",
      "Build a SaaS workflow platform for agencies to manage onboarding and delivery."
    ),
    evidenceSummary: "The request explicitly names the product direction."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "primary_branch",
    value: {
      kind: "text",
      summary: "SaaS / Workflow Platform"
    },
    confidenceScore: 0.95,
    source: withMessageSource(
      "SaaS request",
      "Build a SaaS workflow platform for agencies to manage onboarding and delivery."
    ),
    evidenceSummary: "The branch is explicitly stated."
  });

  state = setBranchClassificationReference({
    state,
    primaryBranch: "SaaS / Workflow Platform",
    confidenceScore: 0.95
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "primary_users",
    value: {
      kind: "list",
      summary: "agency operators, client success leads",
      items: ["agency operators", "client success leads"]
    },
    confidenceScore: 0.9,
    source: withMessageSource(
      "Actors",
      "It is for agency operators and client success leads."
    ),
    evidenceSummary: "The primary users are directly named."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "problem_statement",
    value: {
      kind: "text",
      summary:
        "Agencies need one workflow to manage onboarding, delivery, and client handoff."
    },
    confidenceScore: 0.88,
    source: withMessageSource(
      "Problem",
      "Agencies need one workflow to manage onboarding, delivery, and client handoff."
    ),
    evidenceSummary: "Problem statement is explicit."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "desired_outcome",
    value: {
      kind: "text",
      summary: "Teams can move client work through onboarding and delivery without spreadsheets."
    },
    confidenceScore: 0.89,
    source: withMessageSource(
      "Outcome",
      "Teams should move client work without spreadsheets."
    ),
    evidenceSummary: "Desired outcome is explicit."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "core_workflow",
    value: {
      kind: "text",
      summary:
        "Create a client workspace, move them through onboarding steps, then track delivery status."
    },
    confidenceScore: 0.9,
    source: withMessageSource(
      "Workflow",
      "Create a client workspace, move them through onboarding, then track delivery."
    ),
    evidenceSummary: "Core workflow is explicit."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "mvp_in_scope",
    value: {
      kind: "list",
      summary: "client workspace, onboarding checklist, delivery tracking",
      items: ["client workspace", "onboarding checklist", "delivery tracking"]
    },
    confidenceScore: 0.87,
    source: withMessageSource(
      "MVP scope",
      "The MVP is client workspace, onboarding checklist, and delivery tracking."
    ),
    evidenceSummary: "In-scope MVP was listed."
  });

  state = upgradeFieldFromPartialToAnswered(state, {
    fieldKey: "mvp_out_of_scope",
    value: {
      kind: "list",
      summary: "billing automation, white-label portal",
      items: ["billing automation", "white-label portal"]
    },
    confidenceScore: 0.83,
    source: withMessageSource(
      "Out of scope",
      "Billing automation and a white-label portal can wait."
    ),
    evidenceSummary: "Out-of-scope boundaries were stated."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "systems_touched",
    value: {
      kind: "list",
      summary: "Workspace / project surfaces, Product, Backend",
      items: ["Workspace / project surfaces", "Product", "Backend"]
    },
    confidenceScore: 0.84,
    source: withMessageSource(
      "Systems",
      "This touches the workspace, product, and backend systems."
    ),
    evidenceSummary: "Touched systems were named."
  });

  state = markFieldPartial(state, {
    fieldKey: "integrations",
    value: {
      kind: "list",
      summary: "email, docs",
      items: ["email", "docs"]
    },
    confidenceScore: 0.62,
    source: withMessageSource("Integrations", "Probably email and docs first."),
    evidenceSummary: "Integrations are partially known."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "constraints",
    value: {
      kind: "list",
      summary: "lean first release, protect 8-week timeline",
      items: ["lean first release", "protect 8-week timeline"]
    },
    confidenceScore: 0.86,
    source: withMessageSource(
      "Constraints",
      "Keep the first release lean and protect the 8-week timeline."
    ),
    evidenceSummary: "Constraints were stated directly."
  });

  state = recordAssumption(state, {
    statement: "Agencies will accept a shared workspace before needing a white-label portal.",
    whyInferred: "White-label was deferred, but agency collaboration is still core.",
    confidenceScore: 0.68,
    linkedFieldKeys: ["mvp_out_of_scope", "primary_users"],
    confirmationRequired: true,
    affectedSystems: ["Workspace / project surfaces"]
  });

  return state;
}

export function createContradictionExample(): ExtractionState {
  let state = createStrongerSaasTruthExample();

  state = markFieldConflict(state, {
    fieldKey: "mvp_in_scope",
    conflictingValue: {
      kind: "list",
      summary: "client workspace, onboarding checklist, billing automation",
      items: ["client workspace", "onboarding checklist", "billing automation"]
    },
    confidenceScore: 0.3,
    source: withMessageSource(
      "Conflicting scope",
      "Actually billing automation might need to be in the first release."
    ),
    evidenceSummary: "The out-of-scope boundary was contradicted by a later message.",
    reason: "The MVP scope now conflicts with the earlier out-of-scope billing decision."
  });

  state = recordContradiction(state, {
    title: "Billing automation is both deferred and claimed as MVP scope",
    contradictionClass: "MVP contradiction",
    severity: "high",
    conflictingStatements: [
      "Billing automation can wait.",
      "Billing automation might need to be in the first release."
    ],
    linkedFieldKeys: ["mvp_in_scope", "mvp_out_of_scope"],
    affectedSystems: ["Billing / account", "Workspace / project surfaces"],
    recommendedResolutionPath:
      "Decide whether billing is genuinely launch-critical or defer it to the next phase."
  });

  return state;
}

export const EXTRACTION_ENGINE_EXAMPLES = {
  earlyWeakInput: createEarlyWeakInputExample(),
  partialEcommerceTruth: createPartialEcommerceTruthExample(),
  strongerSaasTruth: createStrongerSaasTruthExample(),
  contradictionCase: createContradictionExample()
};
