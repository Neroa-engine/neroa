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
    id: "integrations-cmc-short",
    blockerId: "integrations",
    label: "Integration blocker normalizes CMC shorthand",
    rawAnswer: "CMC",
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
  },
  {
    id: "constraints-none-short",
    blockerId: "constraints",
    label: "Constraint blocker accepts none as a valid negative",
    rawAnswer: "none",
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
    id: "wallet-post-launch",
    blockerId: "wallet_boundary",
    label: "Wallet boundary normalizes post launch phrasing",
    rawAnswer: "post launch",
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
          value: "post launch"
        }
      ]
    },
    expectedClarificationPattern: null
  },
  {
    id: "chains-base-first",
    blockerId: "chains_in_scope",
    label: "Chains blocker normalizes Base first",
    rawAnswer: "Base first",
    expectedStatus: "parsed",
    expectedWriteTargets: ["answeredInputs.chainsInScope"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      chains: [
        {
          canonicalId: "base"
        }
      ]
    },
    expectedPatch: {
      answeredInputs: [
        {
          inputId: "chainsInScope",
          value: "Base first"
        }
      ]
    },
    expectedClarificationPattern: null
  },
  {
    id: "location-multi-later",
    blockerId: "launch_location_model",
    label: "Launch location blocker normalizes multi-location later",
    rawAnswer: "multi-location later",
    expectedStatus: "parsed",
    expectedWriteTargets: ["answeredInputs.launchLocationModel"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      locationModel: "multi_location_later"
    },
    expectedPatch: {
      answeredInputs: [
        {
          inputId: "launchLocationModel",
          value: "Multi-location later"
        }
      ]
    },
    expectedClarificationPattern: null
  },
  {
    id: "roles-owners-managers",
    blockerId: "core_user_roles",
    label: "Role blocker saves buyer and operator roles and asks about admin or customer roles",
    rawAnswer: "owners and managers",
    expectedStatus: "partial",
    expectedWriteTargets: ["projectBrief.buyerPersonas", "projectBrief.operatorPersonas"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      buyerPersonas: ["owners"],
      operatorPersonas: ["managers"]
    },
    expectedPatch: {
      projectBrief: {
        buyerPersonas: ["owners"],
        operatorPersonas: ["managers"]
      }
    },
    expectedClarificationPattern: "admin|customer"
  },
  {
    id: "payments-stripe-quickbooks",
    blockerId: "payments_billing_requirement",
    label: "Payments blocker accepts Stripe and QuickBooks together",
    rawAnswer: "Stripe and QuickBooks",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.integrations", "projectBrief.mustHaveFeatures"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "in_mvp",
      providers: [
        {
          canonicalId: "stripe"
        },
        {
          canonicalId: "quickbooks"
        }
      ]
    },
    expectedPatch: {
      projectBrief: {
        integrations: ["Stripe", "QuickBooks"],
        mustHaveFeatures: ["payments and billing"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "pricing-donation",
    blockerId: "pricing_model",
    label: "Pricing blocker captures donation-based pricing",
    rawAnswer: "donation",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.constraints"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      pricingModel: "donation"
    },
    expectedPatch: {
      projectBrief: {
        constraints: ["Pricing model: Donation-based"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "reporting-dashboard-csv",
    blockerId: "reporting_depth_requirement",
    label: "Reporting depth parses dashboards and emits an exports hint",
    rawAnswer: "dashboard plus CSV export",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.mustHaveFeatures"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "in_mvp"
    },
    expectedPatch: {
      projectBrief: {
        mustHaveFeatures: ["dashboard reporting"]
      }
    },
    expectedSecondaryHintBlockerIds: ["exports_requirement"],
    expectedClarificationPattern: null
  },
  {
    id: "exports-csv",
    blockerId: "exports_requirement",
    label: "Exports blocker treats CSV export as in-scope",
    rawAnswer: "CSV export",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.mustHaveFeatures"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "in_mvp"
    },
    expectedPatch: {
      projectBrief: {
        mustHaveFeatures: ["exports"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "notifications-email-sms",
    blockerId: "notification_channels",
    label: "Notification channels capture email and SMS",
    rawAnswer: "email and SMS",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.mustHaveFeatures", "projectBrief.constraints"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "in_mvp",
      channels: ["email", "sms"]
    },
    expectedPatch: {
      projectBrief: {
        mustHaveFeatures: ["notifications"],
        constraints: ["Notification channels: email and sms"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "tenancy-one-account-per-client",
    blockerId: "multi_tenancy_requirement",
    label: "Tenancy blocker captures one-account-per-client",
    rawAnswer: "one account per client",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.constraints"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      tenancyModel: "single_tenant_per_client"
    },
    expectedPatch: {
      projectBrief: {
        constraints: ["Tenancy model: One account per client"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "surface-internal-only",
    blockerId: "public_vs_internal_surface",
    label: "Surface blocker captures internal-only launches",
    rawAnswer: "internal only",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.surfaces"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      surfaceMode: "internal_only"
    },
    expectedPatch: {
      projectBrief: {
        surfaces: ["Internal operations app"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "workflow-approval",
    blockerId: "workflow_approval_requirement",
    label: "Workflow blocker accepts approval workflow phrasing",
    rawAnswer: "approval workflow",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.mustHaveFeatures"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "in_mvp"
    },
    expectedPatch: {
      projectBrief: {
        mustHaveFeatures: ["workflow approvals"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "document-intake",
    blockerId: "document_case_intake_requirement",
    label: "Document intake blocker accepts intake form phrasing",
    rawAnswer: "intake form",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.mustHaveFeatures"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "in_mvp"
    },
    expectedPatch: {
      projectBrief: {
        mustHaveFeatures: ["document intake"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "api-post-launch",
    blockerId: "api_access_requirement",
    label: "API blocker accepts post-launch boundary",
    rawAnswer: "post launch",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.excludedFeatures"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "post_mvp"
    },
    expectedPatch: {
      projectBrief: {
        excludedFeatures: ["API access"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "search-saved-views",
    blockerId: "search_saved_views_requirement",
    label: "Search and saved views blocker accepts watchlist phrasing",
    rawAnswer: "watchlist",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.mustHaveFeatures"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "in_mvp"
    },
    expectedPatch: {
      projectBrief: {
        mustHaveFeatures: ["saved views"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "customer-portal",
    blockerId: "customer_portal_requirement",
    label: "Customer portal blocker captures customer login intent",
    rawAnswer: "customer portal",
    expectedStatus: "parsed",
    expectedWriteTargets: ["projectBrief.surfaces", "projectBrief.mustHaveFeatures"],
    forbiddenWriteTargets: ["projectBrief.founderName"],
    expectedNormalizedSubset: {
      decision: "in_mvp"
    },
    expectedPatch: {
      projectBrief: {
        surfaces: ["Customer portal"],
        mustHaveFeatures: ["customer portal"]
      }
    },
    expectedClarificationPattern: null
  },
  {
    id: "multipart-chains-wallet-posture",
    blockerId: "chains_in_scope",
    label: "Chain blocker keeps writes scoped while exposing safe secondary hints",
    rawAnswer: "Ethereum and Solana, analytics only, no wallet for MVP",
    expectedStatus: "parsed",
    expectedWriteTargets: ["answeredInputs.chainsInScope"],
    forbiddenWriteTargets: ["answeredInputs.walletConnectionMvp", "answeredInputs.adviceAdjacency"],
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
    expectedSecondaryHintBlockerIds: ["analytics_vs_advice_posture", "wallet_boundary"],
    expectedClarificationPattern: null
  }
] satisfies readonly BlockerEvalCase[];

export function getSeedBlockerEvalCases() {
  return SEED_BLOCKER_EVAL_CASES.map((item) => blockerEvalCaseSchema.parse(item));
}
