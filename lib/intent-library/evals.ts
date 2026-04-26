import {
  blockerEvalCaseSchema,
  type BlockerEvalCase
} from "./types.ts";

export const SEED_BLOCKER_EVAL_CASES = [
  {
    id: "constraints-none",
    blockerId: "constraints",
    label: "Constraint blocker accepts no constraint",
    rawAnswer: "no constraint",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.constraints"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      constraintMode: "none"
    },
    expectedPatch: {
      projectBrief: {
        constraints: ["No material constraints identified right now"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "integrations-cmc",
    blockerId: "integrations",
    label: "Integration blocker normalizes CoinMarketCap",
    rawAnswer: "CoinMarketCap",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.integrations"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      providers: [
        {
          canonicalId: "coinmarketcap_api"
        }
      ]
    },
    expectedPatch: {
      projectBrief: {
        integrations: ["CoinMarketCap API"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "integrations-openai",
    blockerId: "integrations",
    label: "Integration blocker normalizes OpenAI API",
    rawAnswer: "OpenAI API",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.integrations"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      providers: [
        {
          canonicalId: "openai_api",
          modelId: "gpt-5.4-thinking"
        }
      ]
    },
    expectedPatch: {
      projectBrief: {
        integrations: ["OpenAI API"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "ai-chatgpt-54",
    blockerId: "ai_integration_boundary",
    label: "AI boundary normalizes ChatGPT 5.4 to OpenAI API and GPT-5.4 Thinking",
    rawAnswer: "ChatGPT 5.4",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.integrations", "projectBrief.constraints"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      provider: {
        canonicalId: "openai_api",
        modelId: "gpt-5.4-thinking"
      }
    },
    expectedPatch: {
      projectBrief: {
        integrations: ["OpenAI API"],
        constraints: ["AI model boundary: gpt-5.4-thinking"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "wallet-post-mvp",
    blockerId: "wallet_boundary",
    label: "Wallet boundary accepts not in MVP",
    rawAnswer: "not in MVP",
    expectedStatus: "parsed",
    expectedWriteTargets: ["answeredInputs.walletConnectionMvp"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      boundary: "excluded_from_mvp"
    },
    expectedPatch: {
      answeredInputs: [
        {
          inputId: "walletConnectionMvp",
          value: "not in MVP"
        }
      ]
    },
    expectedClarificationPattern: null
  },
  {
    id: "analytics-only",
    blockerId: "analytics_vs_advice_posture",
    label: "Advice posture accepts analytics only",
    rawAnswer: "analytics only",
    expectedStatus: "parsed",
    expectedWriteTargets: ["answeredInputs.adviceAdjacency"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      posture: "analytics_only"
    },
    expectedPatch: {
      answeredInputs: [
        {
          inputId: "adviceAdjacency",
          value: "Analytics only"
        }
      ]
    },
    expectedClarificationPattern: null
  },
  {
    id: "chains-eth-sol",
    blockerId: "chains_in_scope",
    label: "Chains blocker normalizes Ethereum and Solana",
    rawAnswer: "Ethereum and Solana",
    expectedStatus: "parsed",
    expectedWriteTargets: ["answeredInputs.chainsInScope"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      chains: [
        {
          canonicalId: "ethereum"
        },
        {
          canonicalId: "solana"
        }
      ]
    },
    expectedPatch: {
      answeredInputs: [
        {
          inputId: "chainsInScope",
          value: "Ethereum and Solana"
        }
      ]
    },
    expectedClarificationPattern: null
  },
  {
    id: "location-single",
    blockerId: "launch_location_model",
    label: "Launch location blocker normalizes single location",
    rawAnswer: "single location",
    expectedStatus: "parsed",
    expectedWriteTargets: ["answeredInputs.launchLocationModel"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      locationModel: "single_location"
    },
    expectedPatch: {
      answeredInputs: [
        {
          inputId: "launchLocationModel",
          value: "Single-location only at launch"
        }
      ]
    },
    expectedClarificationPattern: null
  },
  {
    id: "first-pos-toast",
    blockerId: "first_pos_connector",
    label: "POS blocker normalizes Toast",
    rawAnswer: "Toast",
    expectedStatus: "parsed",
    expectedWriteTargets: ["answeredInputs.firstPosConnector"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      connectorId: "toast_pos"
    },
    expectedPatch: {
      answeredInputs: [
        {
          inputId: "firstPosConnector",
          value: "Toast"
        }
      ]
    },
    expectedClarificationPattern: null
  },
  {
    id: "core-roles-owners-only",
    blockerId: "core_user_roles",
    label: "Role blocker can save buyer roles and ask for operator clarification",
    rawAnswer: "owners",
    expectedStatus: "partial",
    expectedWriteTargets: ["projectBrief.buyerPersonas"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      buyerPersonas: ["owners"]
    },
    expectedPatch: {
      projectBrief: {
        buyerPersonas: ["owners"]
      }
    },
    expectedClarificationPattern: "who operates"
  }
] satisfies readonly BlockerEvalCase[];

export function getSeedBlockerEvalCases() {
  return SEED_BLOCKER_EVAL_CASES.map((item) => blockerEvalCaseSchema.parse(item));
}
