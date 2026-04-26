import { z } from "zod";
import {
  domainOpenQuestionTemplateSchema,
  domainPackIdSchema,
  projectBriefSlotIdSchema,
  type DomainPackId
} from "./domain-contracts.ts";

const trimmedStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(trimmedStringSchema).default([]);

const domainAudiencePatternSchema = z
  .object({
    buyerPersonas: stringListSchema,
    operatorPersonas: stringListSchema,
    endCustomerPersonas: stringListSchema,
    adminPersonas: stringListSchema,
    copyBuyerToOperatorWhenSelfServe: z.boolean().default(false)
  })
  .strict();

const domainFeatureDefaultsSchema = z
  .object({
    mustHave: stringListSchema,
    niceToHave: stringListSchema,
    excluded: stringListSchema
  })
  .strict();

export const domainPackSchema = z
  .object({
    id: domainPackIdSchema,
    label: trimmedStringSchema,
    productCategoryLabel: trimmedStringSchema,
    triggerPhrases: z.array(trimmedStringSchema).min(1),
    detectionHints: z.array(trimmedStringSchema).min(1),
    defaultAudiencePatterns: domainAudiencePatternSchema,
    defaultSurfaces: z.array(trimmedStringSchema).min(1),
    likelyFeatureDefaults: domainFeatureDefaultsSchema,
    likelyIntegrationDefaults: stringListSchema,
    likelyDataSourceDefaults: stringListSchema,
    complianceFlagDefaults: stringListSchema,
    likelyRiskCompliancePrompts: z.array(trimmedStringSchema).min(1),
    trustRiskDefaults: stringListSchema,
    defaultOpenQuestions: z.array(domainOpenQuestionTemplateSchema).min(1),
    requiredSlotsBeforeArchitectureGeneration: z
      .array(projectBriefSlotIdSchema)
      .min(1),
    requiredSlotsBeforeRoadmapApproval: z.array(projectBriefSlotIdSchema).min(1)
  })
  .strict();

export type DomainPack = z.infer<typeof domainPackSchema>;

export const DOMAIN_PACKS: Record<DomainPackId, DomainPack> = {
  generic_saas: domainPackSchema.parse({
    id: "generic_saas",
    label: "Generic SaaS",
    productCategoryLabel: "SaaS platform",
    triggerPhrases: ["saas", "workflow tool", "software platform", "dashboard"],
    detectionHints: [
      "customer-facing software",
      "internal workflow system",
      "web app",
      "portal",
      "admin dashboard"
    ],
    defaultAudiencePatterns: {
      buyerPersonas: [],
      operatorPersonas: [],
      endCustomerPersonas: [],
      adminPersonas: [],
      copyBuyerToOperatorWhenSelfServe: true
    },
    defaultSurfaces: ["customer web app", "admin console"],
    likelyFeatureDefaults: {
      mustHave: [
        "core workflow dashboard",
        "search and filtering",
        "role-based access",
        "admin controls"
      ],
      niceToHave: ["notifications", "exports"],
      excluded: []
    },
    likelyIntegrationDefaults: [],
    likelyDataSourceDefaults: [],
    complianceFlagDefaults: [],
    likelyRiskCompliancePrompts: [
      "What data is sensitive or access-controlled on day one?",
      "What system, API, or spreadsheet has to connect first?",
      "Are there compliance, privacy, or launch constraints that change the MVP?"
    ],
    trustRiskDefaults: [
      "Unclear permissions can create trust and access-control risk.",
      "Undefined data ownership can weaken roadmap confidence."
    ],
    defaultOpenQuestions: [
      {
        slotId: "productCategory",
        label: "Product shape",
        question:
          "What kind of SaaS product is this first: workflow software, analytics, a customer portal, or something else?",
        stage: "focused_questions",
        whyItMatters: "Architecture and roadmap both depend on the product shape."
      },
      {
        slotId: "buyerPersonas",
        label: "Buyer and operator",
        question:
          "Who is this mainly for first, and is that the same person who uses it day to day?",
        stage: "focused_questions",
        whyItMatters: "The first audience determines workflow and scope."
      },
      {
        slotId: "problemStatement",
        label: "Core problem",
        question: "What is the first concrete problem this SaaS needs to solve?",
        stage: "focused_questions",
        whyItMatters: "The brief needs a stable problem statement before architecture expands."
      },
      {
        slotId: "mustHaveFeatures",
        label: "Version-one features",
        question: "What absolutely has to work in version one?",
        stage: "architecture",
        whyItMatters: "Must-have features define the first build boundary."
      },
      {
        slotId: "surfaces",
        label: "Launch surfaces",
        question: "What surfaces launch first: a web app, admin console, customer portal, or something else?",
        stage: "architecture",
        whyItMatters: "Surface decisions shape the technical plan."
      },
      {
        slotId: "integrations",
        label: "First integrations",
        question: "What integration or data source has to exist at launch?",
        stage: "roadmap",
        whyItMatters: "Roadmap approval depends on systems scope."
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
  crypto_analytics: domainPackSchema.parse({
    id: "crypto_analytics",
    label: "Crypto Analytics",
    productCategoryLabel: "crypto analytics platform",
    triggerPhrases: [
      "crypto analytics",
      "risk engine",
      "pre-sales",
      "presale",
      "token analytics",
      "on-chain analytics"
    ],
    detectionHints: [
      "wallet",
      "chain",
      "token",
      "crypto investors",
      "traders",
      "liquidity",
      "holder concentration"
    ],
    defaultAudiencePatterns: {
      buyerPersonas: ["crypto investors"],
      operatorPersonas: [],
      endCustomerPersonas: [],
      adminPersonas: ["analyst admins"],
      copyBuyerToOperatorWhenSelfServe: true
    },
    defaultSurfaces: ["customer web app", "admin rules console"],
    likelyFeatureDefaults: {
      mustHave: [
        "project profiles",
        "risk score",
        "score explanation / reasoning",
        "search and filter",
        "watchlist",
        "admin/rules controls"
      ],
      niceToHave: ["alerts", "wallet-linked watchlist", "portfolio context"],
      excluded: []
    },
    likelyIntegrationDefaults: ["on-chain data provider", "market data provider"],
    likelyDataSourceDefaults: [
      "on-chain transaction data",
      "token and project metadata",
      "liquidity and holder-distribution signals"
    ],
    complianceFlagDefaults: [
      "financial-advice boundary",
      "score transparency expectations",
      "market-data provenance sensitivity"
    ],
    likelyRiskCompliancePrompts: [
      "Is the product analytics-only, or does it drift toward investment advice?",
      "What signals or data sources feed the risk score?",
      "How will the score explanation stay transparent and trustworthy?"
    ],
    trustRiskDefaults: [
      "Advice-adjacent scoring can create regulatory and trust risk.",
      "Opaque risk logic can weaken investor confidence.",
      "Weak market-data provenance can distort risk conclusions."
    ],
    defaultOpenQuestions: [
      {
        slotId: "buyerPersonas",
        label: "Primary investor segment",
        question:
          "Who is this mainly for first: pre-sale investors, active traders, researchers, or another crypto audience?",
        stage: "focused_questions",
        whyItMatters: "The first crypto audience changes the workflow and score expectations."
      },
      {
        slotId: "problemStatement",
        label: "Risk decision problem",
        question:
          "What decision should this help with first: spotting risky pre-sales, comparing opportunities, or avoiding obvious red flags?",
        stage: "focused_questions",
        whyItMatters: "The score design depends on the decision the user is trying to make."
      },
      {
        slotId: "chainsInScope",
        label: "Chains in scope",
        question: "Which chains or ecosystems are in scope for the first release?",
        stage: "architecture",
        whyItMatters: "Chain scope drives data models, connectors, and coverage."
      },
      {
        slotId: "walletConnectionMvp",
        label: "Wallet connection",
        question: "Is wallet connection part of the MVP, or is the first release analytics-only?",
        stage: "architecture",
        whyItMatters: "Wallet support changes auth, UX, and trust boundaries."
      },
      {
        slotId: "adviceAdjacency",
        label: "Advice boundary",
        question:
          "Will this stay analytics-only, or does any part of the product recommend actions or investments?",
        stage: "architecture",
        whyItMatters: "Advice adjacency changes compliance posture and trust language."
      },
      {
        slotId: "riskSignalSources",
        label: "Score inputs",
        question:
          "What data sources or signals should feed the score: liquidity, holder concentration, audits, social signals, tokenomics, or something else?",
        stage: "roadmap",
        whyItMatters: "The roadmap needs a clear signal set before scoring work can be trusted."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "chainsInScope",
      "adviceAdjacency",
      "riskSignalSources"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "chainsInScope",
      "walletConnectionMvp",
      "adviceAdjacency",
      "riskSignalSources",
      "integrations",
      "dataSources",
      "constraints"
    ]
  }),
  restaurant_sales: domainPackSchema.parse({
    id: "restaurant_sales",
    label: "Restaurant Sales",
    productCategoryLabel: "restaurant sales analytics platform",
    triggerPhrases: [
      "restaurant sales platform",
      "restaurant analytics",
      "location reporting",
      "menu-item reporting",
      "pos connector"
    ],
    detectionHints: [
      "restaurant",
      "restaurants",
      "point of sale",
      "pos",
      "multi-location",
      "owners",
      "managers"
    ],
    defaultAudiencePatterns: {
      buyerPersonas: ["restaurant owners"],
      operatorPersonas: ["restaurant managers"],
      endCustomerPersonas: [],
      adminPersonas: ["operations admins"],
      copyBuyerToOperatorWhenSelfServe: false
    },
    defaultSurfaces: [
      "operator analytics dashboard",
      "location reporting console",
      "admin access controls"
    ],
    likelyFeatureDefaults: {
      mustHave: [
        "sales dashboards",
        "location reporting",
        "menu-item reporting",
        "exports",
        "role-based access"
      ],
      niceToHave: ["scheduled digests", "benchmark comparisons", "labor-to-sales overlays"],
      excluded: []
    },
    likelyIntegrationDefaults: ["POS connector"],
    likelyDataSourceDefaults: [
      "POS sales data",
      "location-level sales totals",
      "menu-item sales data"
    ],
    complianceFlagDefaults: [
      "location-level role access",
      "connector credential handling",
      "sales-data accuracy sensitivity"
    ],
    likelyRiskCompliancePrompts: [
      "Is launch single-location or multi-location?",
      "Which POS connector has to land first?",
      "Is this analytics-only, or does the MVP include staff workflows too?"
    ],
    trustRiskDefaults: [
      "Connector sync failures can undermine reporting trust.",
      "Weak location-level permissions can expose the wrong sales data.",
      "Menu mapping inconsistencies can make reports misleading."
    ],
    defaultOpenQuestions: [
      {
        slotId: "buyerPersonas",
        label: "Restaurant buyer",
        question:
          "Who is this mainly for first: owners, managers, or the same person doing both jobs?",
        stage: "focused_questions",
        whyItMatters: "The first buyer and operator shape the reporting workflow."
      },
      {
        slotId: "problemStatement",
        label: "Reporting problem",
        question:
          "What has to get better first: daily sales visibility, location-level reporting, or menu performance insight?",
        stage: "focused_questions",
        whyItMatters: "The problem statement defines the first dashboard and reporting scope."
      },
      {
        slotId: "launchLocationModel",
        label: "Launch location model",
        question: "Does launch start single-location, multi-location, or one location with multi-location coming next?",
        stage: "architecture",
        whyItMatters: "Location model changes data modeling and permissions."
      },
      {
        slotId: "firstPosConnector",
        label: "First POS connector",
        question: "Which POS connector lands first: Toast, Square, Clover, or something else?",
        stage: "architecture",
        whyItMatters: "Connector sequencing shapes the MVP and data contract."
      },
      {
        slotId: "analyticsVsStaffWorkflows",
        label: "Analytics vs workflows",
        question:
          "Is the MVP analytics-only, or does it also need staff workflows like scheduling, approvals, or operations tasks?",
        stage: "architecture",
        whyItMatters: "Analytics-only and workflow software have very different boundaries."
      },
      {
        slotId: "launchReports",
        label: "Launch reports",
        question:
          "Which reports are mandatory at launch: daily sales, location rollups, menu-item performance, exports, or something else?",
        stage: "roadmap",
        whyItMatters: "The roadmap needs the first trusted report set before scope is approved."
      }
    ],
    requiredSlotsBeforeArchitectureGeneration: [
      "productCategory",
      "buyerPersonas",
      "operatorPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "launchLocationModel",
      "firstPosConnector",
      "analyticsVsStaffWorkflows",
      "launchReports"
    ],
    requiredSlotsBeforeRoadmapApproval: [
      "productCategory",
      "buyerPersonas",
      "operatorPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "launchLocationModel",
      "firstPosConnector",
      "analyticsVsStaffWorkflows",
      "launchReports",
      "integrations",
      "dataSources",
      "constraints"
    ]
  })
};

export const DOMAIN_PACK_REGISTRY = Object.values(DOMAIN_PACKS);
export const VERTICAL_OVERLAYS = DOMAIN_PACKS;
export const VERTICAL_OVERLAY_REGISTRY = DOMAIN_PACK_REGISTRY;

export function getDomainPack(domainPackId: DomainPackId) {
  return DOMAIN_PACKS[domainPackId];
}

export function listDomainPacks() {
  return [...DOMAIN_PACK_REGISTRY];
}

export function getVerticalOverlay(domainPackId: DomainPackId) {
  return getDomainPack(domainPackId);
}

export function listVerticalOverlays() {
  return listDomainPacks();
}
