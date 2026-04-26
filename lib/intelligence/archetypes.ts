import { z } from "zod";
import {
  domainOpenQuestionTemplateSchema,
  projectBriefSlotIdSchema,
  type DomainOpenQuestionTemplate,
  type ProjectBriefSlotId
} from "./domain-contracts.ts";
import { capabilityTagSchema, type CapabilityTag } from "./capability-profile.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema).default([]);

export const systemArchetypeSchema = z.enum([
  "analytics_platform",
  "marketplace",
  "workflow_ops",
  "portal",
  "backoffice_crm",
  "booking_scheduling",
  "ecommerce",
  "content_community",
  "internal_tool",
  "ai_copilot",
  "generic_saas_fallback"
]);

export type SystemArchetype = z.infer<typeof systemArchetypeSchema>;

const archetypeFeatureDefaultsSchema = z
  .object({
    mustHave: stringListSchema,
    niceToHave: stringListSchema,
    excluded: stringListSchema
  })
  .strict();

const archetypeDefinitionSchema = z
  .object({
    id: systemArchetypeSchema,
    label: trimmedStringSchema,
    productCategoryLabel: trimmedStringSchema,
    triggerPhrases: z.array(trimmedStringSchema).min(1),
    detectionHints: z.array(trimmedStringSchema).min(1),
    defaultCapabilities: z.array(capabilityTagSchema).min(1),
    defaultSurfaces: z.array(trimmedStringSchema).min(1),
    defaultFeatureDefaults: archetypeFeatureDefaultsSchema,
    defaultIntegrationDefaults: stringListSchema,
    defaultDataSourceDefaults: stringListSchema,
    complianceFlagDefaults: stringListSchema,
    trustRiskDefaults: stringListSchema,
    defaultOpenQuestions: z.array(domainOpenQuestionTemplateSchema).min(1),
    requiredSlotsBeforeArchitectureGeneration: z
      .array(projectBriefSlotIdSchema)
      .min(1),
    requiredSlotsBeforeRoadmapApproval: z.array(projectBriefSlotIdSchema).min(1)
  })
  .strict();

export type ArchetypeDefinition = z.infer<typeof archetypeDefinitionSchema>;

function buildAnalyticsOpenQuestions(): DomainOpenQuestionTemplate[] {
  return [
    {
      slotId: "problemStatement",
      label: "Reporting decision",
      question:
        "What decision should the analytics product help users make first?",
      stage: "focused_questions",
      whyItMatters:
        "Analytics scope depends on the first decision, metric, or score the product must support."
    },
    {
      slotId: "mustHaveFeatures",
      label: "Launch metrics or reports",
      question:
        "Which dashboards, reports, scores, or saved views are mandatory in the first release?",
      stage: "architecture",
      whyItMatters:
        "The first trusted metrics define the MVP data model and architecture."
    },
    {
      slotId: "integrations",
      label: "Source systems",
      question:
        "What systems, providers, or data feeds have to power the first analytics release?",
      stage: "roadmap",
      whyItMatters:
        "Analytics roadmap confidence depends on the first source systems being explicit."
    }
  ];
}

export const SYSTEM_ARCHETYPES: Record<SystemArchetype, ArchetypeDefinition> = {
  analytics_platform: archetypeDefinitionSchema.parse({
    id: "analytics_platform",
    label: "Analytics Platform",
    productCategoryLabel: "analytics platform",
    triggerPhrases: [
      "analytics platform",
      "analytics dashboard",
      "reporting dashboard",
      "sales dashboard",
      "risk dashboard"
    ],
    detectionHints: [
      "dashboard",
      "analytics",
      "reporting",
      "metrics",
      "insights",
      "score"
    ],
    defaultCapabilities: [
      "dashboards_reporting",
      "search_filter",
      "admin_console",
      "exports"
    ],
    defaultSurfaces: ["analytics dashboard", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "dashboards and reporting",
        "search and filtering",
        "saved views or comparisons",
        "admin controls"
      ],
      niceToHave: ["exports", "notifications"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: ["trusted reporting data source"],
    complianceFlagDefaults: ["reporting accuracy sensitivity"],
    trustRiskDefaults: [
      "Unclear metric definitions can weaken trust in the product.",
      "Weak access controls can expose the wrong analytics data."
    ],
    defaultOpenQuestions: buildAnalyticsOpenQuestions(),
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  marketplace: archetypeDefinitionSchema.parse({
    id: "marketplace",
    label: "Marketplace",
    productCategoryLabel: "marketplace platform",
    triggerPhrases: [
      "marketplace",
      "buyer and seller",
      "used equipment marketplace",
      "listings marketplace"
    ],
    detectionHints: [
      "listings",
      "buyers",
      "sellers",
      "inventory marketplace",
      "catalog"
    ],
    defaultCapabilities: [
      "marketplace_listings",
      "search_filter",
      "role_based_access",
      "admin_console"
    ],
    defaultSurfaces: ["marketplace web app", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "listing catalog",
        "search and filtering",
        "buyer and seller account access",
        "admin moderation"
      ],
      niceToHave: ["saved searches", "payments or checkout"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: ["listing moderation sensitivity"],
    trustRiskDefaults: [
      "Weak listing moderation can damage marketplace trust.",
      "Unclear buyer and seller permissions can cause operational confusion."
    ],
    defaultOpenQuestions: [
      {
        slotId: "buyerPersonas",
        label: "Marketplace sides",
        question:
          "Who are the first two sides of the marketplace: buyers, sellers, or another pair of roles?",
        stage: "focused_questions",
        whyItMatters:
          "Marketplace structure depends on which sides need workflows first."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Launch transaction flow",
        question:
          "What has to work first: listings, discovery, inquiries, checkout, or approvals?",
        stage: "architecture",
        whyItMatters:
          "The first transaction path shapes the MVP boundary."
      },
      {
        slotId: "integrations",
        label: "Marketplace rails",
        question:
          "Does launch include payments, shipping, or verification integrations, or is it discovery-only first?",
        stage: "roadmap",
        whyItMatters:
          "Marketplace scope changes materially depending on whether money movement or logistics land in MVP."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  workflow_ops: archetypeDefinitionSchema.parse({
    id: "workflow_ops",
    label: "Workflow Ops",
    productCategoryLabel: "workflow operations platform",
    triggerPhrases: [
      "workflow platform",
      "workflow saas",
      "approval workflow",
      "operations workflow",
      "field-service dashboard"
    ],
    detectionHints: [
      "workflow",
      "approvals",
      "queue",
      "dispatch",
      "operations",
      "intake",
      "handoff"
    ],
    defaultCapabilities: [
      "workflow_approvals",
      "role_based_access",
      "admin_console",
      "notifications"
    ],
    defaultSurfaces: ["operations workspace", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "workflow intake",
        "approval routing",
        "status tracking",
        "role-based access"
      ],
      niceToHave: ["dashboards and reporting", "notifications"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: ["approval trail sensitivity"],
    trustRiskDefaults: [
      "Missing approval traceability can weaken trust in operational decisions."
    ],
    defaultOpenQuestions: [
      {
        slotId: "problemStatement",
        label: "Core workflow",
        question:
          "What internal workflow or approval path has to work first?",
        stage: "focused_questions",
        whyItMatters:
          "The first workflow defines the initial architecture and roadmap boundary."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Workflow boundary",
        question:
          "What is mandatory in version one: intake, approvals, routing, dashboards, or dispatch?",
        stage: "architecture",
        whyItMatters:
          "The exact workflow steps determine capability and data needs."
      },
      {
        slotId: "integrations",
        label: "Workflow inputs",
        question:
          "What existing system, spreadsheet, or API needs to feed the workflow at launch?",
        stage: "roadmap",
        whyItMatters:
          "Workflow scope depends on what must connect on day one."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  portal: archetypeDefinitionSchema.parse({
    id: "portal",
    label: "Portal",
    productCategoryLabel: "customer portal",
    triggerPhrases: ["portal", "member portal", "donor portal", "customer portal"],
    detectionHints: ["self-serve", "members", "donors", "account access"],
    defaultCapabilities: [
      "auth",
      "role_based_access",
      "customer_portal",
      "dashboards_reporting",
      "admin_console"
    ],
    defaultSurfaces: ["customer portal", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "secure account access",
        "self-serve portal experience",
        "role-based access",
        "admin controls"
      ],
      niceToHave: ["dashboard views", "notifications", "file uploads"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: ["account and access-control sensitivity"],
    trustRiskDefaults: [
      "Poor portal permissions can expose the wrong user data or actions."
    ],
    defaultOpenQuestions: [
      {
        slotId: "buyerPersonas",
        label: "Portal roles",
        question:
          "Who logs into the portal first, and who manages it behind the scenes?",
        stage: "focused_questions",
        whyItMatters:
          "Portal roles define access boundaries and the first user journey."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Self-serve actions",
        question:
          "What must people be able to do in the portal on day one?",
        stage: "architecture",
        whyItMatters:
          "The first self-serve actions define the MVP scope."
      },
      {
        slotId: "integrations",
        label: "Portal systems",
        question:
          "What existing system, payment rail, or data source must the portal connect to at launch?",
        stage: "roadmap",
        whyItMatters:
          "Portal readiness depends on the back-end systems it has to represent."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  backoffice_crm: archetypeDefinitionSchema.parse({
    id: "backoffice_crm",
    label: "Backoffice CRM",
    productCategoryLabel: "back-office CRM platform",
    triggerPhrases: ["crm", "backoffice crm", "customer records"],
    detectionHints: ["pipeline", "accounts", "contacts", "case notes"],
    defaultCapabilities: [
      "auth",
      "role_based_access",
      "search_filter",
      "admin_console"
    ],
    defaultSurfaces: ["operations dashboard", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "record management",
        "search and filtering",
        "role-based access",
        "admin controls"
      ],
      niceToHave: ["workflow approvals", "exports", "api access"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: ["customer-record privacy sensitivity"],
    trustRiskDefaults: [
      "Unclear record ownership can undermine operational trust."
    ],
    defaultOpenQuestions: [
      {
        slotId: "problemStatement",
        label: "Record workflow",
        question:
          "What relationship, account, or case workflow has to improve first?",
        stage: "focused_questions",
        whyItMatters:
          "CRM scope depends on the first record workflow the team needs."
      },
      {
        slotId: "mustHaveFeatures",
        label: "CRM MVP boundary",
        question:
          "What must be in the first release: record views, search, notes, approvals, or reporting?",
        stage: "architecture",
        whyItMatters:
          "CRM boundaries drift quickly without an explicit MVP core."
      },
      {
        slotId: "integrations",
        label: "CRM system of record",
        question:
          "What existing system, inbox, or data source has to connect to the CRM at launch?",
        stage: "roadmap",
        whyItMatters:
          "Back-office systems often depend on an existing source of truth."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  booking_scheduling: archetypeDefinitionSchema.parse({
    id: "booking_scheduling",
    label: "Booking and Scheduling",
    productCategoryLabel: "booking and scheduling platform",
    triggerPhrases: ["booking platform", "appointment scheduling", "dispatch scheduling"],
    detectionHints: ["calendar", "appointments", "availability", "schedule"],
    defaultCapabilities: [
      "auth",
      "role_based_access",
      "scheduling_dispatch",
      "notifications"
    ],
    defaultSurfaces: ["scheduling dashboard", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "availability management",
        "booking or dispatch workflow",
        "role-based access",
        "notifications"
      ],
      niceToHave: ["customer portal", "payments or billing"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: ["schedule integrity sensitivity"],
    trustRiskDefaults: [
      "Weak schedule controls can create real-world service failures."
    ],
    defaultOpenQuestions: [
      {
        slotId: "problemStatement",
        label: "Scheduling problem",
        question:
          "What has to work first: bookings, dispatch, availability, or rescheduling?",
        stage: "focused_questions",
        whyItMatters:
          "The first scheduling workflow changes the architecture and scope."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Scheduling boundary",
        question:
          "What must launch with the scheduler: calendar views, dispatch, reminders, or payments?",
        stage: "architecture",
        whyItMatters:
          "Scheduling products can expand quickly without a clear first boundary."
      },
      {
        slotId: "integrations",
        label: "Calendar and messaging systems",
        question:
          "What calendar, messaging, or routing systems need to connect at launch?",
        stage: "roadmap",
        whyItMatters:
          "Scheduling integrations often determine the true MVP."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  ecommerce: archetypeDefinitionSchema.parse({
    id: "ecommerce",
    label: "Ecommerce",
    productCategoryLabel: "ecommerce platform",
    triggerPhrases: ["ecommerce", "online store", "storefront"],
    detectionHints: ["catalog", "cart", "checkout", "orders"],
    defaultCapabilities: [
      "auth",
      "search_filter",
      "payments_or_billing",
      "admin_console"
    ],
    defaultSurfaces: ["storefront", "admin console"],
    defaultFeatureDefaults: {
      mustHave: ["product catalog", "search and filtering", "checkout", "order admin"],
      niceToHave: ["saved cart", "notifications"],
      excluded: []
    },
    defaultIntegrationDefaults: ["payment provider"],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: ["checkout and payment sensitivity"],
    trustRiskDefaults: ["Weak checkout or order accuracy can create direct trust damage."],
    defaultOpenQuestions: [
      {
        slotId: "problemStatement",
        label: "Storefront outcome",
        question:
          "What should customers be able to buy or manage first?",
        stage: "focused_questions",
        whyItMatters:
          "The first buying flow defines the ecommerce MVP."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Commerce boundary",
        question:
          "What must launch first: discovery, cart, checkout, subscriptions, or fulfillment visibility?",
        stage: "architecture",
        whyItMatters:
          "Commerce scope depends on how much of the buying flow lands in version one."
      },
      {
        slotId: "integrations",
        label: "Commerce rails",
        question:
          "What payment, shipping, or inventory system must integrate at launch?",
        stage: "roadmap",
        whyItMatters:
          "Ecommerce readiness depends heavily on the first transaction and fulfillment rails."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  content_community: archetypeDefinitionSchema.parse({
    id: "content_community",
    label: "Content and Community",
    productCategoryLabel: "content and community platform",
    triggerPhrases: ["community platform", "content platform", "forum"],
    detectionHints: ["posts", "members", "moderation", "publishing"],
    defaultCapabilities: [
      "auth",
      "role_based_access",
      "search_filter",
      "admin_console"
    ],
    defaultSurfaces: ["community web app", "admin moderation console"],
    defaultFeatureDefaults: {
      mustHave: ["member access", "content publishing", "search and filtering", "moderation"],
      niceToHave: ["notifications", "saved views"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: ["content moderation sensitivity"],
    trustRiskDefaults: ["Weak moderation or access rules can erode community trust."],
    defaultOpenQuestions: [
      {
        slotId: "problemStatement",
        label: "Community purpose",
        question:
          "What is the first job of the community: publishing, discussion, member updates, or moderation?",
        stage: "focused_questions",
        whyItMatters:
          "The first community job defines the initial product boundary."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Community MVP boundary",
        question:
          "What must launch first: posts, comments, search, profiles, or moderation?",
        stage: "architecture",
        whyItMatters:
          "Community products expand quickly without a clear first surface."
      },
      {
        slotId: "integrations",
        label: "Community channels",
        question:
          "What messaging, publishing, or identity systems need to connect at launch?",
        stage: "roadmap",
        whyItMatters:
          "Community tooling often depends on identity and communication channels."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  internal_tool: archetypeDefinitionSchema.parse({
    id: "internal_tool",
    label: "Internal Tool",
    productCategoryLabel: "internal operations tool",
    triggerPhrases: ["internal tool", "backoffice tool", "internal workflow"],
    detectionHints: ["internal", "ops team", "staff-only", "team workflow"],
    defaultCapabilities: [
      "auth",
      "role_based_access",
      "workflow_approvals",
      "admin_console"
    ],
    defaultSurfaces: ["internal workspace", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "internal workflow workspace",
        "role-based access",
        "search and filtering",
        "admin controls"
      ],
      niceToHave: ["dashboards and reporting", "notifications"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: ["internal access sensitivity"],
    trustRiskDefaults: ["Internal tools still need clear permissions and auditability."],
    defaultOpenQuestions: [
      {
        slotId: "problemStatement",
        label: "Internal job to be done",
        question:
          "What internal job or bottleneck should this tool solve first?",
        stage: "focused_questions",
        whyItMatters:
          "Internal tools need one clear first workflow to avoid scope sprawl."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Internal MVP boundary",
        question:
          "What must the tool do in version one: intake, approvals, dashboards, search, or admin controls?",
        stage: "architecture",
        whyItMatters:
          "Internal tools sprawl quickly without a hard launch boundary."
      },
      {
        slotId: "integrations",
        label: "Internal source systems",
        question:
          "What existing internal systems or spreadsheets need to connect first?",
        stage: "roadmap",
        whyItMatters:
          "Internal tools often depend on an existing operational source of truth."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  ai_copilot: archetypeDefinitionSchema.parse({
    id: "ai_copilot",
    label: "AI Copilot",
    productCategoryLabel: "AI copilot platform",
    triggerPhrases: ["ai copilot", "ai assistant", "copilot"],
    detectionHints: ["assistant", "prompt", "chat workspace", "ai guidance"],
    defaultCapabilities: [
      "auth",
      "search_filter",
      "admin_console",
      "file_uploads"
    ],
    defaultSurfaces: ["copilot workspace", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "AI guidance workspace",
        "knowledge or context retrieval",
        "role-based access",
        "admin controls"
      ],
      niceToHave: ["file uploads", "notifications", "api access"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: ["knowledge or context source"],
    complianceFlagDefaults: ["AI output trust sensitivity"],
    trustRiskDefaults: [
      "Weak grounding or permissions can make AI output untrustworthy."
    ],
    defaultOpenQuestions: [
      {
        slotId: "problemStatement",
        label: "Copilot job",
        question:
          "What specific job should the AI copilot help with first?",
        stage: "focused_questions",
        whyItMatters:
          "A copilot needs one clear primary task before it expands."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Copilot boundary",
        question:
          "What must land first: chat, retrieval, workflow actions, file handling, or approvals?",
        stage: "architecture",
        whyItMatters:
          "Copilot scope depends on whether it only advises or also acts."
      },
      {
        slotId: "integrations",
        label: "Copilot context sources",
        question:
          "What systems or documents should the copilot use as its source of truth at launch?",
        stage: "roadmap",
        whyItMatters:
          "Copilot quality depends on the initial context and integration boundary."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  }),
  generic_saas_fallback: archetypeDefinitionSchema.parse({
    id: "generic_saas_fallback",
    label: "Generic SaaS Fallback",
    productCategoryLabel: "SaaS platform",
    triggerPhrases: ["saas", "software platform", "web app", "dashboard"],
    detectionHints: ["tool", "system", "app", "portal", "software"],
    defaultCapabilities: [
      "auth",
      "role_based_access",
      "search_filter",
      "admin_console"
    ],
    defaultSurfaces: ["customer web app", "admin console"],
    defaultFeatureDefaults: {
      mustHave: [
        "core workflow dashboard",
        "search and filtering",
        "role-based access",
        "admin controls"
      ],
      niceToHave: ["notifications", "exports"],
      excluded: []
    },
    defaultIntegrationDefaults: [],
    defaultDataSourceDefaults: [],
    complianceFlagDefaults: [],
    trustRiskDefaults: [
      "Undefined permissions can make the MVP harder to trust.",
      "Undefined integrations can weaken planning confidence."
    ],
    defaultOpenQuestions: [
      {
        slotId: "productCategory",
        label: "Product shape",
        question:
          "What kind of software is this first: workflow, analytics, portal, marketplace, or something else?",
        stage: "focused_questions",
        whyItMatters:
          "The archetype needs a stable product shape before architecture expands."
      },
      {
        slotId: "problemStatement",
        label: "Core problem",
        question:
          "What concrete problem should the product solve first?",
        stage: "focused_questions",
        whyItMatters:
          "The first problem determines which capabilities matter."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Version-one capabilities",
        question:
          "What absolutely has to work in version one?",
        stage: "architecture",
        whyItMatters:
          "The first capability boundary defines the MVP."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ]
  })
};

export const SYSTEM_ARCHETYPE_REGISTRY = Object.values(SYSTEM_ARCHETYPES);

export function getSystemArchetypeDefinition(
  archetype: SystemArchetype
): ArchetypeDefinition {
  return SYSTEM_ARCHETYPES[archetype];
}

type ArchetypeSignalInput = {
  corpus: string;
  productCategory?: string | null;
  problemStatement?: string | null;
  outcomePromise?: string | null;
  mustHaveFeatures?: readonly string[];
  surfaces?: readonly string[];
  integrations?: readonly string[];
  constraints?: readonly string[];
};

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSpace(value).toLowerCase();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalizeSpace(value));
  }

  return items;
}

function buildSignalCorpus(args: ArchetypeSignalInput) {
  return uniqueStrings([
    cleanText(args.corpus),
    cleanText(args.productCategory),
    cleanText(args.problemStatement),
    cleanText(args.outcomePromise),
    ...(args.mustHaveFeatures ?? []),
    ...(args.surfaces ?? []),
    ...(args.integrations ?? []),
    ...(args.constraints ?? [])
  ])
    .join(" ")
    .toLowerCase();
}

function scoreArchetype(definition: ArchetypeDefinition, signalCorpus: string) {
  let score = 0;
  const matchedSignals: string[] = [];

  for (const phrase of definition.triggerPhrases) {
    if (!signalCorpus.includes(phrase.toLowerCase())) {
      continue;
    }

    matchedSignals.push(phrase);
    score += phrase.includes(" ") ? 4 : 2.5;
  }

  for (const hint of definition.detectionHints) {
    if (!signalCorpus.includes(hint.toLowerCase())) {
      continue;
    }

    matchedSignals.push(hint);
    score += 1.25;
  }

  return {
    archetype: definition.id,
    score,
    matchedSignals: uniqueStrings(matchedSignals)
  };
}

export function resolveSystemArchetype(args: ArchetypeSignalInput) {
  const signalCorpus = buildSignalCorpus(args);
  const candidates = SYSTEM_ARCHETYPE_REGISTRY.map((definition) =>
    scoreArchetype(definition, signalCorpus)
  ).sort((left, right) => right.score - left.score);
  const bestCandidate = candidates[0];
  const fallback =
    SYSTEM_ARCHETYPES.generic_saas_fallback;
  const selected =
    bestCandidate && bestCandidate.score >= 2.5
      ? bestCandidate
      : {
          archetype: fallback.id,
          score: 1,
          matchedSignals: ["generic saas fallback"]
        };

  return {
    systemArchetype: selected.archetype,
    archetypeConfidence:
      selected.archetype === "generic_saas_fallback"
        ? /(?:saas|platform|software|app|tool|portal|dashboard)/.test(signalCorpus)
          ? 0.58
          : 0.44
        : Math.max(0.55, Math.min(0.97, selected.score / 11)),
    candidates: candidates.map((candidate) => ({
      archetype: candidate.archetype,
      score: candidate.score,
      matchedSignals: candidate.matchedSignals
    })),
    matchedSignals: selected.matchedSignals
  };
}

export function mergeProjectBriefSlotSets(
  ...slotSets: ReadonlyArray<readonly ProjectBriefSlotId[]>
) {
  return uniqueStrings(slotSets.flat()) as ProjectBriefSlotId[];
}
