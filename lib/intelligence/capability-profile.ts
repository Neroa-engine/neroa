import { z } from "zod";
import type { DomainPackId } from "./domain-contracts.ts";
import type { SystemArchetype } from "./archetypes.ts";

const trimmedStringSchema = z.string().trim().min(1);

export const capabilityTagSchema = z.enum([
  "auth",
  "role_based_access",
  "multi_tenancy",
  "dashboards_reporting",
  "workflow_approvals",
  "search_filter",
  "watchlists_saved_views",
  "connectors_integrations",
  "scoring_rules_engine",
  "marketplace_listings",
  "payments_or_billing",
  "scheduling_dispatch",
  "file_uploads",
  "notifications",
  "admin_console",
  "analytics_explainability",
  "exports",
  "api_access",
  "document_or_case_intake",
  "customer_portal"
]);

export type CapabilityTag = z.infer<typeof capabilityTagSchema>;

export const capabilityProfileSchema = z
  .object({
    primaryCapabilities: z.array(capabilityTagSchema),
    supportingCapabilities: z.array(capabilityTagSchema),
    allCapabilities: z.array(capabilityTagSchema),
    inferredFromSignals: z.array(trimmedStringSchema)
  })
  .strict();

export type CapabilityProfile = z.infer<typeof capabilityProfileSchema>;

type CapabilityDefinition = {
  id: CapabilityTag;
  triggerPhrases: string[];
  detectionHints: string[];
  defaultFeatures: string[];
  defaultSurfaces: string[];
  defaultIntegrations: string[];
  defaultDataSources: string[];
  defaultComplianceFlags: string[];
  defaultTrustRisks: string[];
};

const CAPABILITY_DEFINITIONS: Record<CapabilityTag, CapabilityDefinition> = {
  auth: {
    id: "auth",
    triggerPhrases: ["login", "sign in", "authentication", "account access"],
    detectionHints: ["portal", "member access", "customer access", "user account"],
    defaultFeatures: ["secure account access"],
    defaultSurfaces: [],
    defaultIntegrations: ["identity provider"],
    defaultDataSources: [],
    defaultComplianceFlags: ["account access sensitivity"],
    defaultTrustRisks: ["Weak authentication boundaries can undermine trust."]
  },
  role_based_access: {
    id: "role_based_access",
    triggerPhrases: ["role-based access", "permissions", "access controls"],
    detectionHints: ["owners", "managers", "admins", "team roles"],
    defaultFeatures: ["role-based access"],
    defaultSurfaces: ["admin console"],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["role and permission sensitivity"],
    defaultTrustRisks: ["Unclear permissions can expose the wrong data or workflow."]
  },
  multi_tenancy: {
    id: "multi_tenancy",
    triggerPhrases: ["multi-tenant", "multi tenant", "multi-location"],
    detectionHints: ["organizations", "workspaces", "tenants", "locations"],
    defaultFeatures: ["organization or tenant hierarchy"],
    defaultSurfaces: [],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["cross-tenant access sensitivity"],
    defaultTrustRisks: ["Weak tenant isolation can create severe trust problems."]
  },
  dashboards_reporting: {
    id: "dashboards_reporting",
    triggerPhrases: ["dashboard", "reporting", "analytics", "reports"],
    detectionHints: ["metrics", "insights", "visibility", "sales dashboard"],
    defaultFeatures: ["dashboards and reporting"],
    defaultSurfaces: ["analytics dashboard"],
    defaultIntegrations: [],
    defaultDataSources: ["reporting data source"],
    defaultComplianceFlags: ["reporting accuracy sensitivity"],
    defaultTrustRisks: ["Ambiguous reporting metrics weaken product trust."]
  },
  workflow_approvals: {
    id: "workflow_approvals",
    triggerPhrases: ["approval workflow", "approvals", "review queue"],
    detectionHints: ["routing", "workflow", "approval", "review"],
    defaultFeatures: ["approval workflow"],
    defaultSurfaces: ["operations workspace"],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["approval traceability sensitivity"],
    defaultTrustRisks: ["Missing approval traceability can weaken operational trust."]
  },
  search_filter: {
    id: "search_filter",
    triggerPhrases: ["search and filter", "search", "filtering"],
    detectionHints: ["discovery", "browse", "catalog"],
    defaultFeatures: ["search and filtering"],
    defaultSurfaces: [],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: [],
    defaultTrustRisks: []
  },
  watchlists_saved_views: {
    id: "watchlists_saved_views",
    triggerPhrases: ["watchlist", "saved views", "favorites"],
    detectionHints: ["saved view", "follow list", "shortlist"],
    defaultFeatures: ["watchlists or saved views"],
    defaultSurfaces: [],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: [],
    defaultTrustRisks: []
  },
  connectors_integrations: {
    id: "connectors_integrations",
    triggerPhrases: ["connector", "integration", "sync"],
    detectionHints: ["api", "provider", "pos", "import"],
    defaultFeatures: ["connector or integration layer"],
    defaultSurfaces: [],
    defaultIntegrations: ["external system connector"],
    defaultDataSources: ["connected source system"],
    defaultComplianceFlags: ["integration credential handling"],
    defaultTrustRisks: ["Connector failures can undermine data trust."]
  },
  scoring_rules_engine: {
    id: "scoring_rules_engine",
    triggerPhrases: ["risk engine", "scoring engine", "rules engine", "score"],
    detectionHints: ["risk score", "methodology", "rules"],
    defaultFeatures: ["scoring or rules engine"],
    defaultSurfaces: [],
    defaultIntegrations: [],
    defaultDataSources: ["scoring signal source"],
    defaultComplianceFlags: ["score methodology sensitivity"],
    defaultTrustRisks: ["Opaque scoring logic can weaken user trust."]
  },
  marketplace_listings: {
    id: "marketplace_listings",
    triggerPhrases: ["marketplace", "listings"],
    detectionHints: ["sellers", "buyers", "catalog"],
    defaultFeatures: ["listing catalog"],
    defaultSurfaces: ["marketplace web app"],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["listing moderation sensitivity"],
    defaultTrustRisks: ["Poor listing quality controls damage marketplace trust."]
  },
  payments_or_billing: {
    id: "payments_or_billing",
    triggerPhrases: ["payments", "billing", "checkout", "donations", "donor portal"],
    detectionHints: ["payment", "donor", "subscription", "purchase", "fundraising"],
    defaultFeatures: ["payments or billing flow"],
    defaultSurfaces: [],
    defaultIntegrations: ["payment provider"],
    defaultDataSources: [],
    defaultComplianceFlags: ["payment sensitivity"],
    defaultTrustRisks: ["Money movement requires strong trust boundaries."]
  },
  scheduling_dispatch: {
    id: "scheduling_dispatch",
    triggerPhrases: ["scheduling", "dispatch", "appointments", "calendar"],
    detectionHints: ["schedule", "booking", "field service"],
    defaultFeatures: ["scheduling or dispatch workflow"],
    defaultSurfaces: ["dispatch console"],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["schedule accuracy sensitivity"],
    defaultTrustRisks: ["Scheduling errors can create real-world service failures."]
  },
  file_uploads: {
    id: "file_uploads",
    triggerPhrases: ["file upload", "uploads", "attachments"],
    detectionHints: ["documents", "files", "attachments"],
    defaultFeatures: ["file uploads and attachments"],
    defaultSurfaces: [],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["file handling sensitivity"],
    defaultTrustRisks: []
  },
  notifications: {
    id: "notifications",
    triggerPhrases: ["notifications", "alerts"],
    detectionHints: ["email", "sms", "reminders"],
    defaultFeatures: ["notifications"],
    defaultSurfaces: [],
    defaultIntegrations: ["notification provider"],
    defaultDataSources: [],
    defaultComplianceFlags: [],
    defaultTrustRisks: []
  },
  admin_console: {
    id: "admin_console",
    triggerPhrases: ["admin console", "admin panel", "rules console"],
    detectionHints: ["admin", "backoffice", "moderation", "controls"],
    defaultFeatures: ["admin console"],
    defaultSurfaces: ["admin console"],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["administrative access sensitivity"],
    defaultTrustRisks: ["Weak admin boundaries can create broad trust failures."]
  },
  analytics_explainability: {
    id: "analytics_explainability",
    triggerPhrases: ["explainability", "explanation", "reasoning"],
    detectionHints: ["methodology", "why this score", "audit trail"],
    defaultFeatures: ["score explanation or audit trail"],
    defaultSurfaces: [],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["explainability expectations"],
    defaultTrustRisks: ["Users may distrust outcomes without clear reasoning."]
  },
  exports: {
    id: "exports",
    triggerPhrases: ["exports", "csv export", "download report"],
    detectionHints: ["csv", "excel", "download"],
    defaultFeatures: ["exports"],
    defaultSurfaces: [],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: [],
    defaultTrustRisks: []
  },
  api_access: {
    id: "api_access",
    triggerPhrases: ["api access", "developer api"],
    detectionHints: ["api", "programmatic", "integration api"],
    defaultFeatures: ["API access"],
    defaultSurfaces: [],
    defaultIntegrations: ["public API"],
    defaultDataSources: [],
    defaultComplianceFlags: ["API access control sensitivity"],
    defaultTrustRisks: []
  },
  document_or_case_intake: {
    id: "document_or_case_intake",
    triggerPhrases: ["legal intake", "case intake", "document intake"],
    detectionHints: ["intake", "case", "documents", "submission"],
    defaultFeatures: ["document or case intake"],
    defaultSurfaces: ["intake workspace"],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["document handling sensitivity"],
    defaultTrustRisks: ["Poor intake structure can weaken compliance and workflow trust."]
  },
  customer_portal: {
    id: "customer_portal",
    triggerPhrases: ["customer portal", "member portal", "donor portal"],
    detectionHints: ["portal", "self-serve", "member access"],
    defaultFeatures: ["customer portal"],
    defaultSurfaces: ["customer portal"],
    defaultIntegrations: [],
    defaultDataSources: [],
    defaultComplianceFlags: ["customer data access sensitivity"],
    defaultTrustRisks: ["Portal users need clear access and self-serve boundaries."]
  }
};

const ARCHETYPE_CAPABILITY_DEFAULTS: Record<SystemArchetype, CapabilityTag[]> = {
  analytics_platform: ["dashboards_reporting", "search_filter", "admin_console", "exports"],
  marketplace: ["marketplace_listings", "search_filter", "role_based_access", "admin_console"],
  workflow_ops: ["workflow_approvals", "role_based_access", "admin_console", "notifications"],
  portal: [
    "auth",
    "role_based_access",
    "customer_portal",
    "dashboards_reporting",
    "admin_console"
  ],
  backoffice_crm: ["auth", "role_based_access", "search_filter", "admin_console"],
  booking_scheduling: ["auth", "role_based_access", "scheduling_dispatch", "notifications"],
  ecommerce: ["auth", "search_filter", "payments_or_billing", "admin_console"],
  content_community: ["auth", "role_based_access", "search_filter", "admin_console"],
  internal_tool: ["auth", "role_based_access", "workflow_approvals", "admin_console"],
  ai_copilot: ["auth", "file_uploads", "search_filter", "admin_console"],
  generic_saas_fallback: ["auth", "role_based_access", "search_filter", "admin_console"]
};

const OVERLAY_CAPABILITY_DEFAULTS: Record<DomainPackId, CapabilityTag[]> = {
  generic_saas: ["auth", "role_based_access", "search_filter", "admin_console"],
  crypto_analytics: [
    "dashboards_reporting",
    "search_filter",
    "watchlists_saved_views",
    "scoring_rules_engine",
    "analytics_explainability",
    "admin_console",
    "connectors_integrations"
  ],
  restaurant_sales: [
    "dashboards_reporting",
    "role_based_access",
    "connectors_integrations",
    "exports",
    "admin_console",
    "multi_tenancy"
  ]
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

export type CapabilityResolutionInput = {
  corpus: string;
  systemArchetype: SystemArchetype;
  primaryDomainPack: DomainPackId;
  matchedOverlays: readonly DomainPackId[];
  mustHaveFeatures?: readonly string[];
  surfaces?: readonly string[];
  integrations?: readonly string[];
  constraints?: readonly string[];
};

function buildSignalCorpus(args: CapabilityResolutionInput) {
  return uniqueStrings([
    cleanText(args.corpus),
    ...(args.mustHaveFeatures ?? []),
    ...(args.surfaces ?? []),
    ...(args.integrations ?? []),
    ...(args.constraints ?? [])
  ])
    .join(" ")
    .toLowerCase();
}

export function resolveCapabilityProfile(args: CapabilityResolutionInput): CapabilityProfile {
  const signalCorpus = buildSignalCorpus(args);
  const overlayDefaults = uniqueStrings([
    ...OVERLAY_CAPABILITY_DEFAULTS[args.primaryDomainPack],
    ...args.matchedOverlays.flatMap((overlayId) => OVERLAY_CAPABILITY_DEFAULTS[overlayId] ?? [])
  ]) as CapabilityTag[];
  const defaultCapabilities = uniqueStrings([
    ...ARCHETYPE_CAPABILITY_DEFAULTS[args.systemArchetype],
    ...overlayDefaults
  ]) as CapabilityTag[];
  const scored = Object.values(CAPABILITY_DEFINITIONS).map((definition) => {
    let score = 0;
    const matchedSignals: string[] = [];

    for (const phrase of definition.triggerPhrases) {
      if (!signalCorpus.includes(phrase.toLowerCase())) {
        continue;
      }

      matchedSignals.push(phrase);
      score += phrase.includes(" ") ? 3 : 2;
    }

    for (const hint of definition.detectionHints) {
      if (!signalCorpus.includes(hint.toLowerCase())) {
        continue;
      }

      matchedSignals.push(hint);
      score += 1;
    }

    if (ARCHETYPE_CAPABILITY_DEFAULTS[args.systemArchetype].includes(definition.id)) {
      score += 1.25;
      matchedSignals.push(`archetype:${args.systemArchetype}`);
    }

    if (overlayDefaults.includes(definition.id)) {
      score += 1.5;
      matchedSignals.push(`overlay:${args.primaryDomainPack}`);
    }

    return {
      id: definition.id,
      score,
      matchedSignals: uniqueStrings(matchedSignals)
    };
  });

  const primaryCapabilities = scored
    .filter((candidate) => candidate.score >= 3)
    .map((candidate) => candidate.id);
  const supportingCapabilities = scored
    .filter((candidate) => candidate.score >= 1.5 && !primaryCapabilities.includes(candidate.id))
    .map((candidate) => candidate.id);
  const fallbackPrimary =
    primaryCapabilities.length > 0
      ? primaryCapabilities
      : defaultCapabilities.slice(0, 3);
  const mergedSupporting = uniqueStrings([
    ...supportingCapabilities,
    ...defaultCapabilities.filter((capability) => !fallbackPrimary.includes(capability))
  ]) as CapabilityTag[];
  const allCapabilities = uniqueStrings([
    ...fallbackPrimary,
    ...mergedSupporting
  ]) as CapabilityTag[];
  const inferredFromSignals = uniqueStrings(
    scored.flatMap((candidate) =>
      allCapabilities.includes(candidate.id) ? candidate.matchedSignals : []
    )
  );

  return capabilityProfileSchema.parse({
    primaryCapabilities: fallbackPrimary,
    supportingCapabilities: mergedSupporting,
    allCapabilities,
    inferredFromSignals
  });
}

export function getCapabilityDefinitions(capabilities: readonly CapabilityTag[]) {
  return capabilities.map((capability) => CAPABILITY_DEFINITIONS[capability]);
}
