import {
  addDirectAnswerToField,
  createEarlyWeakInputExample,
  createEmptyExtractionState,
  createPartialEcommerceTruthExample,
  createStrongerSaasTruthExample
} from "@/lib/intelligence/extraction";
import { classifyBranchesFromExtractionState } from "./classify";
import { detectBranchShift } from "./shifts";

function withMessageSource(label: string, excerpt: string) {
  return {
    kind: "message" as const,
    label,
    excerpt
  };
}

export function createSimpleEcommerceClassificationExample() {
  return classifyBranchesFromExtractionState(createPartialEcommerceTruthExample(), {
    updatedBy: "Branch Engine Example",
    updateReason: "Classified simple ecommerce example."
  });
}

export function createSaasWorkspaceClassificationExample() {
  return classifyBranchesFromExtractionState(createStrongerSaasTruthExample(), {
    updatedBy: "Branch Engine Example",
    updateReason: "Classified SaaS workspace example."
  });
}

export function createMarketplaceVsBookingAmbiguityExample() {
  let state = createEmptyExtractionState({
    preparedBy: "Branch Engine Example",
    requestSummary: {
      requestedChangeOrInitiative:
        "Build a platform where customers can discover service providers and book appointments."
    }
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "request_summary",
    value: {
      kind: "text",
      summary:
        "Build a platform where customers can discover service providers and book appointments."
    },
    confidenceScore: 0.94,
    source: withMessageSource(
      "Marketplace booking request",
      "Build a platform where customers can discover service providers and book appointments."
    ),
    evidenceSummary: "The request mixes provider matching with booking."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "primary_users",
    value: {
      kind: "list",
      summary: "customers, service providers",
      items: ["customers", "service providers"]
    },
    confidenceScore: 0.88,
    source: withMessageSource(
      "Actors",
      "The main users are customers and service providers."
    ),
    evidenceSummary: "There are clear demand-side and supply-side roles."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "core_workflow",
    value: {
      kind: "text",
      summary:
        "Customers browse providers, compare listings, then book appointment slots."
    },
    confidenceScore: 0.9,
    source: withMessageSource(
      "Workflow",
      "Customers browse providers, compare listings, then book appointment slots."
    ),
    evidenceSummary: "Workflow mixes listing discovery with appointment scheduling."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "business_model",
    value: {
      kind: "text",
      summary: "Charge a take rate on completed bookings."
    },
    confidenceScore: 0.86,
    source: withMessageSource(
      "Business model",
      "We will charge a take rate on completed bookings."
    ),
    evidenceSummary: "Business model carries marketplace economics."
  });

  return classifyBranchesFromExtractionState(state, {
    updatedBy: "Branch Engine Example",
    updateReason: "Classified marketplace-vs-booking ambiguity example."
  });
}

export function createContentCommunityHybridExample() {
  let state = createEmptyExtractionState({
    preparedBy: "Branch Engine Example",
    requestSummary: {
      requestedChangeOrInitiative:
        "Launch a paid membership platform with courses, articles, and community discussion."
    }
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "request_summary",
    value: {
      kind: "text",
      summary:
        "Launch a paid membership platform with courses, articles, and community discussion."
    },
    confidenceScore: 0.94,
    source: withMessageSource(
      "Membership request",
      "Launch a paid membership platform with courses, articles, and community discussion."
    ),
    evidenceSummary: "The request clearly combines content, community, and membership."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "primary_users",
    value: {
      kind: "list",
      summary: "members, creators, moderators",
      items: ["members", "creators", "moderators"]
    },
    confidenceScore: 0.88,
    source: withMessageSource(
      "Actors",
      "Members, creators, and moderators will all use it."
    ),
    evidenceSummary: "Community roles are explicit."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "core_workflow",
    value: {
      kind: "text",
      summary:
        "Publish courses and articles, discuss them inside the member community, and moderate posts."
    },
    confidenceScore: 0.89,
    source: withMessageSource(
      "Workflow",
      "Publish courses and articles, discuss them inside the member community, and moderate posts."
    ),
    evidenceSummary: "Workflow combines publishing and discussion."
  });

  state = addDirectAnswerToField(state, {
    fieldKey: "business_model",
    value: {
      kind: "text",
      summary: "Recurring paid membership."
    },
    confidenceScore: 0.9,
    source: withMessageSource(
      "Business model",
      "The business model is recurring paid membership."
    ),
    evidenceSummary: "Membership business model is explicit."
  });

  return classifyBranchesFromExtractionState(state, {
    updatedBy: "Branch Engine Example",
    updateReason: "Classified content/community hybrid example."
  });
}

export function createArchitecturalBranchShiftExample() {
  const before = classifyBranchesFromExtractionState(createPartialEcommerceTruthExample(), {
    updatedBy: "Branch Engine Example",
    updateReason: "Classified pre-shift ecommerce state."
  });
  let afterState = createEmptyExtractionState({
    preparedBy: "Branch Engine Example",
    requestSummary: {
      requestedChangeOrInitiative:
        "Turn the store into a marketplace where third-party sellers list products and buyers check out through the platform."
    }
  });

  afterState = addDirectAnswerToField(afterState, {
    fieldKey: "request_summary",
    value: {
      kind: "text",
      summary:
        "Turn the store into a marketplace where third-party sellers list products and buyers check out through the platform."
    },
    confidenceScore: 0.95,
    source: withMessageSource(
      "Shift request",
      "Turn the store into a marketplace where third-party sellers list products and buyers check out through the platform."
    ),
    evidenceSummary: "The request explicitly changes the branch economics."
  });

  afterState = addDirectAnswerToField(afterState, {
    fieldKey: "primary_users",
    value: {
      kind: "list",
      summary: "buyers, sellers",
      items: ["buyers", "sellers"]
    },
    confidenceScore: 0.9,
    source: withMessageSource("Actors", "The main users are buyers and sellers."),
    evidenceSummary: "Supply and demand sides are explicit."
  });

  afterState = addDirectAnswerToField(afterState, {
    fieldKey: "core_workflow",
    value: {
      kind: "text",
      summary:
        "Sellers create listings and buyers discover, compare, and check out through the platform."
    },
    confidenceScore: 0.9,
    source: withMessageSource(
      "Workflow",
      "Sellers create listings and buyers discover, compare, and check out through the platform."
    ),
    evidenceSummary: "Listing and two-sided transaction flow is explicit."
  });

  afterState = addDirectAnswerToField(afterState, {
    fieldKey: "business_model",
    value: {
      kind: "text",
      summary: "Charge commissions on marketplace transactions."
    },
    confidenceScore: 0.88,
    source: withMessageSource(
      "Business model",
      "Charge commissions on marketplace transactions."
    ),
    evidenceSummary: "Marketplace commission model is explicit."
  });

  const after = classifyBranchesFromExtractionState(afterState, {
    previous: before,
    updatedBy: "Branch Engine Example",
    updateReason: "Classified post-shift marketplace state."
  });

  return {
    before,
    after,
    shift: detectBranchShift(before, after)
  };
}

export const BRANCH_ENGINE_EXAMPLES = {
  weakInput: classifyBranchesFromExtractionState(createEarlyWeakInputExample(), {
    updatedBy: "Branch Engine Example",
    updateReason: "Classified weak-input example."
  }),
  simpleEcommerce: createSimpleEcommerceClassificationExample(),
  saasWithWorkspaceOverlay: createSaasWorkspaceClassificationExample(),
  marketplaceVsBookingAmbiguity: createMarketplaceVsBookingAmbiguityExample(),
  contentCommunityHybrid: createContentCommunityHybridExample(),
  architecturalBranchShift: createArchitecturalBranchShiftExample()
};
