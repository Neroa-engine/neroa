import {
  blockerSchemaIdSchema,
  slotSchemaDefinitionSchema,
  type BlockerSchemaId,
  type SlotSchemaDefinition
} from "./types.ts";

const registryEntries = [
  {
    id: "founder_name",
    label: "Founder name",
    description: "Captures the founder or operator name for the planning thread.",
    answerMode: "single_select",
    fields: [
      {
        name: "founderName",
        label: "Founder name",
        type: "string",
        required: true
      }
    ],
    allowsNotes: false
  },
  {
    id: "product_direction",
    label: "Project direction",
    description: "Captures the product or system category being planned.",
    answerMode: "freeform_structured",
    fields: [
      {
        name: "productCategory",
        label: "Product category",
        type: "string",
        required: true
      }
    ],
    allowsNotes: true
  },
  {
    id: "constraints",
    label: "Constraints",
    description: "Captures launch constraints, compliance boundaries, or lack of constraints.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "constraintMode",
        label: "Constraint mode",
        type: "enum",
        required: true,
        enumValues: ["none", "stated"]
      },
      {
        name: "constraints",
        label: "Constraints",
        type: "string_list",
        required: true
      }
    ],
    allowsNotes: true
  },
  {
    id: "provider_list",
    label: "Providers",
    description: "Captures integrations or data providers with normalized IDs and labels.",
    answerMode: "multi_select",
    fields: [
      {
        name: "providers",
        label: "Providers",
        type: "provider_ref",
        required: true
      }
    ],
    allowsNotes: true
  },
  {
    id: "provider_requirement",
    label: "Provider-backed requirement",
    description: "Captures whether a provider-backed capability is in MVP plus any normalized providers.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "featureDecision",
        label: "Requirement decision",
        type: "enum",
        required: true,
        enumValues: ["in_mvp", "post_mvp", "not_in_scope"]
      },
      {
        name: "providers",
        label: "Providers",
        type: "provider_ref",
        required: false
      }
    ],
    allowsNotes: true
  },
  {
    id: "chain_list",
    label: "Chains",
    description: "Captures supported chains with canonical chain IDs.",
    answerMode: "multi_select",
    fields: [
      {
        name: "chains",
        label: "Chains",
        type: "chain_ref",
        required: true
      }
    ],
    allowsNotes: true
  },
  {
    id: "wallet_boundary",
    label: "Wallet boundary",
    description: "Captures whether wallet connection belongs in MVP, post-MVP, or is excluded.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "boundary",
        label: "Wallet boundary",
        type: "enum",
        required: true,
        enumValues: ["in_mvp", "post_mvp", "excluded_from_mvp"]
      }
    ],
    allowsNotes: true
  },
  {
    id: "posture_boundary",
    label: "Analytics or advice posture",
    description: "Captures whether the product is analytics-only or advice-adjacent.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "posture",
        label: "Posture",
        type: "enum",
        required: true,
        enumValues: ["analytics_only", "advice_adjacent", "needs_review"]
      }
    ],
    allowsNotes: true
  },
  {
    id: "connector_select",
    label: "POS connector",
    description: "Captures the first POS connector for launch.",
    answerMode: "single_select",
    fields: [
      {
        name: "connector",
        label: "Connector",
        type: "provider_ref",
        required: true
      }
    ],
    allowsNotes: true
  },
  {
    id: "location_model",
    label: "Launch location model",
    description: "Captures whether launch is single-location, multi-location, or phased.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "locationModel",
        label: "Location model",
        type: "enum",
        required: true,
        enumValues: ["single_location", "multi_location_at_launch", "multi_location_later"]
      }
    ],
    allowsNotes: true
  },
  {
    id: "reports_list",
    label: "Launch reports",
    description: "Captures the reports or dashboards needed at launch.",
    answerMode: "list",
    fields: [
      {
        name: "reports",
        label: "Reports",
        type: "string_list",
        required: true
      }
    ],
    allowsNotes: true
  },
  {
    id: "role_split",
    label: "Core user roles",
    description: "Captures buyer and operator roles separately when possible.",
    answerMode: "freeform_structured",
    fields: [
      {
        name: "buyerPersonas",
        label: "Buyer personas",
        type: "string_list",
        required: false
      },
      {
        name: "operatorPersonas",
        label: "Operator personas",
        type: "string_list",
        required: false
      },
      {
        name: "endCustomerPersonas",
        label: "End-customer personas",
        type: "string_list",
        required: false
      },
      {
        name: "adminPersonas",
        label: "Admin personas",
        type: "string_list",
        required: false
      }
    ],
    allowsNotes: true
  },
  {
    id: "compliance_sensitivity",
    label: "Compliance sensitivity",
    description: "Captures whether the project has specific compliance or trust sensitivity.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "complianceFlags",
        label: "Compliance flags",
        type: "string_list",
        required: true
      }
    ],
    allowsNotes: true
  },
  {
    id: "ai_integration_boundary",
    label: "AI integration boundary",
    description: "Captures whether AI is included, excluded, or deferred plus the provider/model boundary.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "provider",
        label: "AI provider",
        type: "provider_ref",
        required: false
      },
      {
        name: "boundary",
        label: "AI boundary",
        type: "enum",
        required: true,
        enumValues: ["in_mvp", "post_mvp", "not_in_scope"]
      }
    ],
    allowsNotes: true
  },
  {
    id: "feature_requirement",
    label: "Feature requirement",
    description: "Captures whether a specific feature belongs in MVP or later.",
    answerMode: "boolean",
    fields: [
      {
        name: "featureDecision",
        label: "Feature decision",
        type: "enum",
        required: true,
        enumValues: ["in_mvp", "post_mvp", "not_in_scope"]
      }
    ],
    allowsNotes: true
  },
  {
    id: "pricing_model",
    label: "Pricing model",
    description: "Captures the pricing model or explicit uncertainty about it.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "pricingModel",
        label: "Pricing model",
        type: "enum",
        required: true,
        enumValues: [
          "subscription",
          "usage_based",
          "transactional",
          "quote_based",
          "donation",
          "free",
          "unknown"
        ]
      }
    ],
    allowsNotes: true
  },
  {
    id: "tenancy_requirement",
    label: "Tenancy requirement",
    description: "Captures the account or tenant model the product needs to support.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "tenancyModel",
        label: "Tenancy model",
        type: "enum",
        required: true,
        enumValues: [
          "single_workspace",
          "single_tenant_per_client",
          "multi_tenant_saas",
          "multi_location_hierarchy",
          "internal_team_only"
        ]
      }
    ],
    allowsNotes: true
  },
  {
    id: "surface_boundary",
    label: "Surface boundary",
    description: "Captures whether the planned product is internal, public, portal-based, or mobile-prioritized.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "surfaceMode",
        label: "Surface mode",
        type: "enum",
        required: true,
        enumValues: [
          "internal_only",
          "customer_portal",
          "public_app",
          "hybrid",
          "mobile_first",
          "mobile_later",
          "desktop_primary"
        ]
      }
    ],
    allowsNotes: true
  },
  {
    id: "notification_channels",
    label: "Notification channels",
    description: "Captures whether notifications belong in scope plus any specific channels.",
    answerMode: "enum_plus_notes",
    fields: [
      {
        name: "featureDecision",
        label: "Requirement decision",
        type: "enum",
        required: true,
        enumValues: ["in_mvp", "post_mvp", "not_in_scope"]
      },
      {
        name: "channels",
        label: "Channels",
        type: "string_list",
        required: false
      }
    ],
    allowsNotes: true
  }
] satisfies readonly SlotSchemaDefinition[];

export const BLOCKER_SCHEMA_REGISTRY = new Map<BlockerSchemaId, SlotSchemaDefinition>(
  registryEntries.map((entry) => [
    blockerSchemaIdSchema.parse(entry.id),
    slotSchemaDefinitionSchema.parse(entry)
  ])
);

export function getBlockerSchemaDefinition(schemaId: BlockerSchemaId) {
  return BLOCKER_SCHEMA_REGISTRY.get(schemaId) ?? null;
}
