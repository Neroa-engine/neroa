import {
  normalizationRuleSchema,
  type BlockerId,
  type NormalizationRule
} from "./types.ts";

type CanonicalProvider = {
  canonicalId: string;
  displayName: string;
  modelId?: string | null;
};

type CanonicalChain = {
  canonicalId: string;
  displayName: string;
};

type CanonicalRoleSplit = {
  buyerPersonas: string[];
  operatorPersonas: string[];
  endCustomerPersonas: string[];
  adminPersonas: string[];
};

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSearchText(value);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(cleanIntentText(value));
  }

  return items;
}

export function cleanIntentText(value?: string | null) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function normalizeSearchText(value: string) {
  return cleanIntentText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitLooseList(value?: string | null) {
  const cleaned = cleanIntentText(value);

  if (!cleaned) {
    return [];
  }

  return uniqueStrings(
    cleaned
      .split(/\s*(?:,|;|\/| and | & |\+)\s*/i)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

const NULL_STYLE_PATTERN =
  /^(?:no|none|nope|nothing|nothing yet|none yet|not right now|nothing right now|none right now|nothing major|no blocker|no blockers|no hard limit|no constraint|no constraints|no real constraint|no real constraints|no integration|no integrations|no connector|no connectors|no data source|no data sources)$/i;

const MAYBE_LATER_PATTERN =
  /^(?:maybe|maybe later|later|eventually|possibly|tbd|not sure yet|phase two|phase 2|post launch|post-launch)$/i;

const MVP_EXCLUSION_PATTERN =
  /\b(?:not in mvp|out of mvp|outside mvp|post mvp|post-mvp|after mvp|later phase|later release|phase two|phase 2|post launch|post-launch|eventually|launch without it|not right now|later)\b/i;

const ANALYTICS_ONLY_PATTERN =
  /\b(?:analytics only|reporting only|research only|not financial advice)\b/i;

const IN_MVP_PATTERN =
  /\b(?:in mvp|for mvp|at launch|launch feature|include it|include this|yes|yes please|needed|required|must have|must have on day one|day one|day 1|launch with it)\b/i;

const NOT_IN_SCOPE_PATTERN =
  /\b(?:not needed|do not need|don't need|exclude it|no thanks|not in scope)\b/i;

const CHAIN_ALIASES: Array<CanonicalChain & { patterns: RegExp[] }> = [
  {
    canonicalId: "ethereum",
    displayName: "Ethereum",
    patterns: [/\beth(?:ereum)?\b/i]
  },
  {
    canonicalId: "solana",
    displayName: "Solana",
    patterns: [/\bsol(?:ana)?\b/i]
  },
  {
    canonicalId: "base",
    displayName: "Base",
    patterns: [/\bbase\b/i]
  },
  {
    canonicalId: "arbitrum",
    displayName: "Arbitrum",
    patterns: [/\barbitrum\b/i]
  },
  {
    canonicalId: "optimism",
    displayName: "Optimism",
    patterns: [/\boptimism\b/i]
  },
  {
    canonicalId: "polygon",
    displayName: "Polygon",
    patterns: [/\bpolygon\b|\bmatic\b/i]
  },
  {
    canonicalId: "avalanche",
    displayName: "Avalanche",
    patterns: [/\bavax\b|\bavalanche\b/i]
  }
];

const PROVIDER_ALIASES: Array<CanonicalProvider & { patterns: RegExp[] }> = [
  {
    canonicalId: "coinmarketcap_api",
    displayName: "CoinMarketCap API",
    patterns: [/\bcoinmarketcap\b/i, /\bcmc\b/i]
  },
  {
    canonicalId: "openai_api",
    displayName: "OpenAI API",
    modelId: "gpt-5.4-thinking",
    patterns: [
      /\bopenai\b/i,
      /\bopenai api\b/i,
      /\bchatgpt\b/i,
      /\bchatgpt 5\.4\b/i,
      /\bgpt[- ]?5\.4\b/i,
      /\bgpt 5\.4\b/i,
      /\bgpt-5\.4\b/i
    ]
  },
  {
    canonicalId: "coingecko_api",
    displayName: "CoinGecko API",
    patterns: [/\bcoingecko\b/i]
  },
  {
    canonicalId: "dune",
    displayName: "Dune",
    patterns: [/\bdune\b/i]
  },
  {
    canonicalId: "anthropic_api",
    displayName: "Anthropic API",
    patterns: [/\banthropic\b/i, /\bclaude\b/i]
  },
  {
    canonicalId: "stripe",
    displayName: "Stripe",
    patterns: [/\bstripe\b/i]
  },
  {
    canonicalId: "quickbooks",
    displayName: "QuickBooks",
    patterns: [/\bquickbooks?\b/i]
  },
  {
    canonicalId: "shopify",
    displayName: "Shopify",
    patterns: [/\bshopify\b/i]
  },
  {
    canonicalId: "hubspot",
    displayName: "HubSpot",
    patterns: [/\bhubspot\b/i]
  },
  {
    canonicalId: "salesforce",
    displayName: "Salesforce",
    patterns: [/\bsalesforce\b/i]
  },
  {
    canonicalId: "amazon_s3",
    displayName: "Amazon S3",
    patterns: [/\bs3\b/i, /\bamazon s3\b/i]
  },
  {
    canonicalId: "toast_pos",
    displayName: "Toast",
    patterns: [/\btoast\b/i]
  },
  {
    canonicalId: "square_pos",
    displayName: "Square",
    patterns: [/\bsquare\b/i]
  },
  {
    canonicalId: "clover_pos",
    displayName: "Clover",
    patterns: [/\bclover\b/i]
  }
];

const REPORT_ALIASES: Array<{ displayName: string; patterns: RegExp[] }> = [
  {
    displayName: "sales dashboard",
    patterns: [/\bsales dashboard\b/i, /\bdashboard\b/i]
  },
  {
    displayName: "location reporting",
    patterns: [/\blocation report(?:ing)?\b/i]
  },
  {
    displayName: "menu-item reporting",
    patterns: [/\bmenu[- ]item report(?:ing)?\b/i, /\bmenu item\b/i]
  },
  {
    displayName: "exports",
    patterns: [/\bexports?\b/i]
  },
  {
    displayName: "CSV export",
    patterns: [/\bcsv export\b/i, /\bcsv\b/i]
  },
  {
    displayName: "PDF export",
    patterns: [/\bpdf export\b/i, /\bpdf\b/i]
  },
  {
    displayName: "saved views",
    patterns: [/\bsaved views?\b/i]
  },
  {
    displayName: "watchlist",
    patterns: [/\bwatchlists?\b/i]
  },
  {
    displayName: "connector sync health",
    patterns: [/\bsync status\b/i, /\bconnector health\b/i]
  }
];

const COMPLIANCE_ALIASES: Array<{ canonicalId: string; displayName: string; patterns: RegExp[] }> = [
  {
    canonicalId: "hipaa_review",
    displayName: "HIPAA review required",
    patterns: [/\bhipaa\b/i, /\bmedical\b/i, /\bpatient\b/i]
  },
  {
    canonicalId: "advice_sensitivity",
    displayName: "Financial-advice sensitivity",
    patterns: [/\bfinancial advice\b/i, /\badvice\b/i]
  },
  {
    canonicalId: "pii_handling",
    displayName: "PII handling review",
    patterns: [/\bpii\b/i, /\bpersonal data\b/i]
  },
  {
    canonicalId: "legal_privilege_review",
    displayName: "Legal privilege handling",
    patterns: [/\blegal\b/i, /\bprivilege\b/i]
  }
];

const ROLE_ALIASES: Array<{ role: string; target: keyof CanonicalRoleSplit; patterns: RegExp[] }> = [
  {
    role: "owners",
    target: "buyerPersonas",
    patterns: [/\bowners?\b/i]
  },
  {
    role: "managers",
    target: "operatorPersonas",
    patterns: [/\bmanagers?\b/i]
  },
  {
    role: "crypto investors",
    target: "buyerPersonas",
    patterns: [/\bcrypto investors?\b/i, /\binvestors?\b/i]
  },
  {
    role: "legal reviewers",
    target: "operatorPersonas",
    patterns: [/\blegal reviewers?\b/i, /\breviewers?\b/i]
  },
  {
    role: "admins",
    target: "adminPersonas",
    patterns: [/\badmins?\b/i]
  },
  {
    role: "team members",
    target: "operatorPersonas",
    patterns: [/\bteam members?\b/i]
  },
  {
    role: "staff",
    target: "operatorPersonas",
    patterns: [/\bstaff\b/i]
  },
  {
    role: "customers",
    target: "endCustomerPersonas",
    patterns: [/\bcustomer login\b/i, /\bcustomers?\b/i, /\bend users?\b/i]
  }
];

const FEATURE_SIGNAL_ALIASES: Array<{ feature: string; patterns: RegExp[] }> = [
  {
    feature: "payments and billing",
    patterns: [/\bpayments?\b/i, /\bbilling\b/i]
  },
  {
    feature: "marketplace listings",
    patterns: [/\blisting marketplace\b/i, /\bmarketplace\b/i, /\blistings?\b/i]
  },
  {
    feature: "scheduling and dispatch",
    patterns: [/\bdispatch board\b/i, /\bdispatch\b/i, /\bschedule calendar\b/i, /\bscheduling\b/i, /\bcalendar\b/i]
  },
  {
    feature: "customer portal",
    patterns: [/\bcustomer portal\b/i, /\bcustomer login\b/i, /\bportal\b/i]
  },
  {
    feature: "exports",
    patterns: [/\bexports?\b/i, /\bcsv export\b/i, /\bpdf export\b/i]
  },
  {
    feature: "role-based access",
    patterns: [/\brole[- ]based access\b/i, /\bpermissions?\b/i, /\badmin only\b/i, /\bteam members too\b/i]
  },
  {
    feature: "workflow approvals",
    patterns: [/\bapproval workflow\b/i, /\bworkflow approval\b/i, /\bapprovals?\b/i]
  },
  {
    feature: "document intake",
    patterns: [/\bintake form\b/i, /\bdocument intake\b/i, /\bcase intake\b/i, /\bapplication queue\b/i]
  },
  {
    feature: "API access",
    patterns: [/\bapi access\b/i, /\bdeveloper api\b/i, /\bpublic api\b/i]
  },
  {
    feature: "dashboard reporting",
    patterns: [/\bdashboard\b/i, /\breporting\b/i, /\banalytics\b/i]
  },
  {
    feature: "admin permissions",
    patterns: [/\badmin permissions?\b/i, /\badmin controls?\b/i]
  },
  {
    feature: "saved views",
    patterns: [/\bsaved views?\b/i, /\bwatchlists?\b/i, /\bsaved search(?:es)?\b/i]
  },
  {
    feature: "search and filter",
    patterns: [/\bsearch\b/i, /\bfilter\b/i]
  },
  {
    feature: "audit trail",
    patterns: [/\baudit trail\b/i, /\baudit log\b/i]
  },
  {
    feature: "file storage",
    patterns: [/\bfile storage\b/i, /\bstorage\b/i]
  },
  {
    feature: "human review queue",
    patterns: [/\bhuman review\b/i, /\bmanual review\b/i, /\bsupport review\b/i]
  },
  {
    feature: "mobile app",
    patterns: [/\bmobile\b/i, /\bios\b/i, /\bandroid\b/i]
  }
];

const NOTIFICATION_CHANNEL_ALIASES: Array<{ channel: string; patterns: RegExp[] }> = [
  {
    channel: "email",
    patterns: [/\bemail\b/i]
  },
  {
    channel: "sms",
    patterns: [/\bsms\b/i, /\btext messages?\b/i]
  },
  {
    channel: "push",
    patterns: [/\bpush\b/i, /\bpush notification\b/i]
  },
  {
    channel: "slack",
    patterns: [/\bslack\b/i]
  },
  {
    channel: "in-app",
    patterns: [/\bin app\b/i, /\bin-app\b/i]
  }
];

const PRICING_MODEL_ALIASES: Array<{ canonicalId: string; displayName: string; patterns: RegExp[] }> = [
  {
    canonicalId: "subscription",
    displayName: "Subscription",
    patterns: [/\bsubscription\b/i, /\bmonthly\b/i, /\bannual\b/i, /\bper seat\b/i]
  },
  {
    canonicalId: "usage_based",
    displayName: "Usage-based",
    patterns: [/\busage[- ]based\b/i, /\bpay as you go\b/i, /\bper use\b/i]
  },
  {
    canonicalId: "transactional",
    displayName: "Transactional",
    patterns: [/\btransaction fee\b/i, /\btake rate\b/i, /\bcommission\b/i]
  },
  {
    canonicalId: "quote_based",
    displayName: "Quote-based enterprise",
    patterns: [/\bquote\b/i, /\benterprise\b/i, /\bcustom pricing\b/i]
  },
  {
    canonicalId: "donation",
    displayName: "Donation-based",
    patterns: [/\bdonation\b/i, /\bgiving\b/i]
  },
  {
    canonicalId: "free",
    displayName: "Free",
    patterns: [/\bfree\b/i]
  }
];

const TENANCY_ALIASES: Array<{ canonicalId: string; displayName: string; patterns: RegExp[] }> = [
  {
    canonicalId: "single_workspace",
    displayName: "Single workspace",
    patterns: [/\bsingle workspace\b/i, /\bone workspace\b/i]
  },
  {
    canonicalId: "single_tenant_per_client",
    displayName: "One account per client",
    patterns: [/\bone account per client\b/i, /\bsingle tenant\b/i, /\bone account for each client\b/i]
  },
  {
    canonicalId: "multi_tenant_saas",
    displayName: "Multi-tenant SaaS",
    patterns: [/\bmulti tenant\b/i, /\bmulti-tenant\b/i]
  },
  {
    canonicalId: "multi_location_hierarchy",
    displayName: "Multi-location hierarchy",
    patterns: [/\bmulti location\b/i, /\bmulti-location\b/i]
  },
  {
    canonicalId: "internal_team_only",
    displayName: "Internal team only",
    patterns: [/\binternal team only\b/i, /\binternal only\b/i, /\bstaff only\b/i]
  }
];

const SURFACE_ALIASES: Array<{ canonicalId: string; displayName: string; patterns: RegExp[] }> = [
  {
    canonicalId: "internal_only",
    displayName: "Internal operations app",
    patterns: [/\binternal only\b/i, /\bstaff only\b/i, /\binternal team only\b/i]
  },
  {
    canonicalId: "customer_portal",
    displayName: "Customer portal",
    patterns: [/\bcustomer portal\b/i, /\bcustomer login\b/i]
  },
  {
    canonicalId: "public_app",
    displayName: "Public web app",
    patterns: [/\bpublic\b/i, /\bpublic site\b/i, /\bpublic web\b/i]
  },
  {
    canonicalId: "mobile_first",
    displayName: "Mobile app first",
    patterns: [/\bmobile first\b/i, /\bmobile priority\b/i]
  },
  {
    canonicalId: "mobile_later",
    displayName: "Mobile later",
    patterns: [/\bmobile matters later\b/i, /\bmobile later\b/i, /\bmobile eventually\b/i]
  },
  {
    canonicalId: "desktop_primary",
    displayName: "Desktop first",
    patterns: [/\bdesktop first\b/i, /\bweb first\b/i]
  }
];

export const NORMALIZATION_RULES = [
  {
    id: "null_style_none",
    label: "Null-style negatives",
    description: "Maps answers like 'none' or 'not right now' into safe blocker-specific negatives.",
    appliesTo: [
      "constraints",
      "integrations",
      "data_sources",
      "ai_integration_boundary"
    ],
    examples: ["no constraint", "none", "not right now"]
  },
  {
    id: "mvp_boundary",
    label: "MVP boundary",
    description: "Maps launch-scope phrasing into canonical MVP boundaries.",
    appliesTo: [
      "wallet_boundary",
      "payments_billing_requirement",
      "marketplace_listings_requirement",
      "scheduling_dispatch_requirement",
      "customer_portal_requirement",
      "exports_requirement",
      "role_based_access_requirement",
      "workflow_approval_requirement",
      "document_case_intake_requirement",
      "api_access_requirement",
      "reporting_depth_requirement",
      "admin_permissions_requirement",
      "notification_channels",
      "file_storage_requirement",
      "support_human_review_requirement",
      "mobile_priority_requirement",
      "search_saved_views_requirement",
      "audit_trail_requirement",
      "file_upload_requirement",
      "notifications_requirement",
      "admin_console_requirement",
      "search_filter_requirement",
      "dashboard_reporting_requirement"
    ],
    examples: ["not in MVP", "post MVP", "at launch"]
  },
  {
    id: "analytics_only",
    label: "Analytics-only posture",
    description: "Maps analytics-only phrasing into a safe advice posture boundary.",
    appliesTo: ["analytics_vs_advice_posture", "wallet_boundary"],
    examples: ["analytics only", "not financial advice"]
  },
  {
    id: "provider_aliases",
    label: "Provider aliases",
    description: "Maps provider shorthand into canonical provider IDs and labels.",
    appliesTo: [
      "integrations",
      "data_sources",
      "scoring_inputs",
      "ai_integration_boundary",
      "payments_billing_requirement",
      "file_storage_requirement"
    ],
    examples: ["CoinMarketCap", "CMC", "OpenAI API", "ChatGPT 5.4", "Stripe", "QuickBooks"]
  },
  {
    id: "pricing_aliases",
    label: "Pricing aliases",
    description: "Maps pricing shorthand into canonical pricing-model labels.",
    appliesTo: ["pricing_model"],
    examples: ["subscription", "usage based", "donation"]
  },
  {
    id: "tenancy_aliases",
    label: "Tenancy aliases",
    description: "Maps tenancy and account-model shorthand into canonical tenancy labels.",
    appliesTo: ["multi_tenancy_requirement"],
    examples: ["multi-tenant", "one account per client", "internal team only"]
  },
  {
    id: "surface_aliases",
    label: "Surface aliases",
    description: "Maps public, internal, portal, and mobile surface phrasing into canonical surfaces.",
    appliesTo: [
      "customer_portal_requirement",
      "mobile_priority_requirement",
      "public_vs_internal_surface"
    ],
    examples: ["customer portal", "internal only", "mobile matters later"]
  },
  {
    id: "notification_channel_aliases",
    label: "Notification channels",
    description: "Maps channel shorthand into explicit notification channels.",
    appliesTo: ["notification_channels"],
    examples: ["email and SMS", "push", "Slack"]
  },
  {
    id: "chain_aliases",
    label: "Chain aliases",
    description: "Maps supported-chain phrasing into canonical chain IDs.",
    appliesTo: ["chains_in_scope"],
    examples: ["Ethereum and Solana", "Base first"]
  },
  {
    id: "pos_connector_aliases",
    label: "POS connectors",
    description: "Maps POS shorthand into canonical connector IDs.",
    appliesTo: ["first_pos_connector"],
    examples: ["Toast", "Square"]
  },
  {
    id: "launch_location_aliases",
    label: "Launch location model",
    description: "Maps launch-location phrasing into canonical rollout models.",
    appliesTo: ["launch_location_model"],
    examples: ["single location", "multi-location later"]
  },
  {
    id: "role_aliases",
    label: "Core user roles",
    description: "Maps role shorthand into buyer/operator role splits.",
    appliesTo: ["core_user_roles"],
    examples: ["owners and managers", "investors"]
  },
  {
    id: "report_aliases",
    label: "Launch reports",
    description: "Maps reporting shorthand into canonical launch-report labels.",
    appliesTo: [
      "launch_reports",
      "exports_requirement",
      "reporting_depth_requirement",
      "search_saved_views_requirement",
      "dashboard_reporting_requirement"
    ],
    examples: ["dashboard", "menu item reporting"]
  },
  {
    id: "compliance_aliases",
    label: "Compliance sensitivity",
    description: "Maps compliance shorthand into canonical compliance flags.",
    appliesTo: ["compliance_sensitivity"],
    examples: ["HIPAA", "legal privilege", "PII"]
  },
  {
    id: "feature_requirement_aliases",
    label: "Feature requirement boundary",
    description: "Maps short yes/no/boundary answers into MVP feature decisions.",
    appliesTo: [
      "payments_billing_requirement",
      "marketplace_listings_requirement",
      "scheduling_dispatch_requirement",
      "customer_portal_requirement",
      "exports_requirement",
      "role_based_access_requirement",
      "workflow_approval_requirement",
      "document_case_intake_requirement",
      "api_access_requirement",
      "reporting_depth_requirement",
      "admin_permissions_requirement",
      "file_storage_requirement",
      "support_human_review_requirement",
      "mobile_priority_requirement",
      "public_vs_internal_surface",
      "search_saved_views_requirement",
      "audit_trail_requirement",
      "file_upload_requirement",
      "notifications_requirement",
      "admin_console_requirement",
      "search_filter_requirement",
      "dashboard_reporting_requirement"
    ],
    examples: ["yes", "not in MVP", "post MVP"]
  },
  {
    id: "feature_signal_aliases",
    label: "Feature signal aliases",
    description: "Maps direct feature mentions into canonical feature labels for blockers that can infer in-scope requirements.",
    appliesTo: [
      "payments_billing_requirement",
      "marketplace_listings_requirement",
      "scheduling_dispatch_requirement",
      "customer_portal_requirement",
      "exports_requirement",
      "role_based_access_requirement",
      "workflow_approval_requirement",
      "document_case_intake_requirement",
      "api_access_requirement",
      "reporting_depth_requirement",
      "admin_permissions_requirement",
      "file_storage_requirement",
      "support_human_review_requirement",
      "search_saved_views_requirement",
      "audit_trail_requirement",
      "dashboard_reporting_requirement"
    ],
    examples: ["approval workflow", "customer portal", "dashboard plus CSV export"]
  }
] satisfies readonly NormalizationRule[];

export function getNormalizationRulesForBlocker(blockerId: BlockerId) {
  return NORMALIZATION_RULES.filter((rule) =>
    (rule.appliesTo as readonly BlockerId[]).includes(blockerId)
  ).map((rule) => normalizationRuleSchema.parse(rule));
}

export function isNullStyleAnswer(value: string) {
  return NULL_STYLE_PATTERN.test(cleanIntentText(value));
}

export function isMaybeLaterAnswer(value: string) {
  return MAYBE_LATER_PATTERN.test(cleanIntentText(value));
}

export function normalizeFounderName(value: string) {
  const cleaned = cleanIntentText(value)
    .replace(/^(?:hi|hello|hey)[,\s-]*/i, "")
    .replace(/^(?:my name is|call me|i(?:'m| am))\s+/i, "")
    .replace(/[.!?]+$/g, "")
    .trim();

  if (!cleaned || cleaned.split(/\s+/).length > 3) {
    return null;
  }

  if (!/^[a-zA-Z][a-zA-Z .'-]*$/.test(cleaned)) {
    return null;
  }

  if (NULL_STYLE_PATTERN.test(cleaned)) {
    return null;
  }

  return cleaned
    .split(/\s+/)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

export function normalizeProjectDirection(value: string) {
  const cleaned = cleanIntentText(value).replace(/[.!?]+$/g, "");
  return cleaned.length >= 3 && !isNullStyleAnswer(cleaned) ? cleaned : null;
}

export function normalizeConstraintAnswer(value: string) {
  if (isNullStyleAnswer(value) || isMaybeLaterAnswer(value)) {
    return {
      mode: "none" as const,
      constraints: ["No material constraints identified right now"]
    };
  }

  const constraints = splitLooseList(value);
  return constraints.length > 0
    ? {
        mode: "stated" as const,
        constraints
      }
    : null;
}

export function extractCanonicalProviders(value: string) {
  const matches = PROVIDER_ALIASES.filter((provider) =>
    provider.patterns.some((pattern) => pattern.test(value))
  ).map((provider) => ({
    canonicalId: provider.canonicalId,
    displayName: provider.displayName,
    modelId: provider.modelId ?? null
  }));

  return uniqueStrings(matches.map((match) => match.canonicalId)).map((canonicalId) => {
    const match = matches.find((item) => item.canonicalId === canonicalId)!;
    return match;
  });
}

export function formatProviderDisplay(provider: CanonicalProvider, includeModel = false) {
  if (includeModel && provider.modelId) {
    return `${provider.displayName} (${provider.modelId})`;
  }

  return provider.displayName;
}

export function extractCanonicalChains(value: string) {
  const matches = CHAIN_ALIASES.filter((chain) =>
    chain.patterns.some((pattern) => pattern.test(value))
  ).map((chain) => ({
    canonicalId: chain.canonicalId,
    displayName: chain.displayName
  }));

  return uniqueStrings(matches.map((match) => match.canonicalId)).map((canonicalId) => {
    const match = matches.find((item) => item.canonicalId === canonicalId)!;
    return match;
  });
}

export function humanizeList(values: readonly string[]) {
  if (values.length <= 1) {
    return values[0] ?? "";
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

export function normalizeWalletBoundary(value: string) {
  const cleaned = cleanIntentText(value);

  if (!cleaned) {
    return null;
  }

  if (ANALYTICS_ONLY_PATTERN.test(cleaned) || MVP_EXCLUSION_PATTERN.test(cleaned)) {
    return {
      boundary: "excluded_from_mvp" as const,
      displayValue: cleaned
    };
  }

  if (IN_MVP_PATTERN.test(cleaned) && !NOT_IN_SCOPE_PATTERN.test(cleaned)) {
    return {
      boundary: "in_mvp" as const,
      displayValue: cleaned
    };
  }

  return null;
}

export function normalizeAnalyticsAdvicePosture(value: string) {
  const cleaned = cleanIntentText(value);

  if (!cleaned) {
    return null;
  }

  if (ANALYTICS_ONLY_PATTERN.test(cleaned)) {
    return {
      posture: "analytics_only" as const,
      displayValue: "Analytics only"
    };
  }

  if (/\badvice\b|\badvisory\b|\brecommendation\b|\brecommendations\b/i.test(cleaned)) {
    return {
      posture: "advice_adjacent" as const,
      displayValue: cleaned
    };
  }

  return null;
}

export function normalizeScoringInputs(value: string) {
  const providers = extractCanonicalProviders(value);
  const items =
    providers.length > 0
      ? providers.map((provider) => provider.displayName)
      : splitLooseList(value);

  return items.length > 0
    ? {
        items,
        providers
      }
    : null;
}

export function normalizeFirstPosConnector(value: string) {
  const provider = extractCanonicalProviders(value).find((item) =>
    ["toast_pos", "square_pos", "clover_pos"].includes(item.canonicalId)
  );

  return provider
    ? {
        connectorId: provider.canonicalId,
        displayValue: provider.displayName
      }
    : null;
}

export function normalizeLaunchLocationModel(value: string) {
  const cleaned = normalizeSearchText(value);

  if (!cleaned) {
    return null;
  }

  if (/\bsingle location\b|\bsingle location only\b|\bsingle-location\b/.test(cleaned)) {
    return {
      locationModel: "single_location" as const,
      displayValue: "Single-location only at launch"
    };
  }

  if (/\bmulti location later\b|\bmulti-location later\b/.test(cleaned)) {
    return {
      locationModel: "multi_location_later" as const,
      displayValue: "Multi-location later"
    };
  }

  if (/\bmulti location\b|\bmulti-location\b/.test(cleaned)) {
    return {
      locationModel: "multi_location_at_launch" as const,
      displayValue: "Multi-location at launch"
    };
  }

  return null;
}

export function normalizeLaunchReports(value: string) {
  const fromAliases = REPORT_ALIASES.filter((report) =>
    report.patterns.some((pattern) => pattern.test(value))
  ).map((report) => report.displayName);
  const reports = uniqueStrings([
    ...fromAliases,
    ...splitLooseList(value).map((item) => (/report/i.test(item) ? item : `${item} report`))
  ]);

  return reports.length > 0 ? reports : null;
}

export function normalizeCoreUserRoles(value: string): CanonicalRoleSplit | null {
  const split: CanonicalRoleSplit = {
    buyerPersonas: [],
    operatorPersonas: [],
    endCustomerPersonas: [],
    adminPersonas: []
  };

  for (const alias of ROLE_ALIASES) {
    if (alias.patterns.some((pattern) => pattern.test(value))) {
      split[alias.target].push(alias.role);
    }
  }

  split.buyerPersonas = uniqueStrings(split.buyerPersonas);
  split.operatorPersonas = uniqueStrings(split.operatorPersonas);
  split.endCustomerPersonas = uniqueStrings(split.endCustomerPersonas);
  split.adminPersonas = uniqueStrings(split.adminPersonas);

  if (
    split.buyerPersonas.length === 0 &&
    split.operatorPersonas.length === 0 &&
    split.endCustomerPersonas.length === 0 &&
    split.adminPersonas.length === 0
  ) {
    return null;
  }

  return split;
}

export function normalizeComplianceSensitivity(value: string) {
  if (isNullStyleAnswer(value) || isMaybeLaterAnswer(value)) {
    return ["No specific compliance sensitivity identified right now"];
  }

  const flags = COMPLIANCE_ALIASES.filter((item) =>
    item.patterns.some((pattern) => pattern.test(value))
  ).map((item) => item.displayName);

  return flags.length > 0 ? uniqueStrings(flags) : null;
}

export function extractRecognizedFeatureSignals(value: string) {
  const features = FEATURE_SIGNAL_ALIASES.filter((item) =>
    item.patterns.some((pattern) => pattern.test(value))
  ).map((item) => item.feature);

  return uniqueStrings(features);
}

export function normalizePricingModel(value: string) {
  const match = PRICING_MODEL_ALIASES.find((item) =>
    item.patterns.some((pattern) => pattern.test(value))
  );

  return match
    ? {
        pricingModel: match.canonicalId,
        displayValue: match.displayName
      }
    : null;
}

export function normalizeTenancyRequirement(value: string) {
  const match = TENANCY_ALIASES.find((item) =>
    item.patterns.some((pattern) => pattern.test(value))
  );

  return match
    ? {
        tenancyModel: match.canonicalId,
        displayValue: match.displayName
      }
    : null;
}

export function normalizeSurfaceBoundary(value: string) {
  const matches = SURFACE_ALIASES.filter((item) =>
    item.patterns.some((pattern) => pattern.test(value))
  );

  if (matches.length === 0) {
    return null;
  }

  const primary = matches[0];
  return {
    surfaceMode: primary.canonicalId,
    displayValue: primary.displayName,
    surfaces: uniqueStrings(
      matches
        .filter((item) =>
          ["customer_portal", "public_app", "internal_only", "mobile_first"].includes(
            item.canonicalId
          )
        )
        .map((item) => item.displayName)
    ),
    deferredMobile: matches.some((item) => item.canonicalId === "mobile_later")
  };
}

export function normalizeNotificationChannels(value: string) {
  const channels = NOTIFICATION_CHANNEL_ALIASES.filter((item) =>
    item.patterns.some((pattern) => pattern.test(value))
  ).map((item) => item.channel);
  const decision = normalizeFeatureRequirementDecision(value, {
    treatRecognizedSignalsAsInMvp: channels.length > 0
  });

  if (!decision && channels.length === 0) {
    return null;
  }

  return {
    decision: decision ?? "in_mvp",
    channels: uniqueStrings(channels)
  };
}

export function normalizeAiIntegrationBoundary(value: string) {
  const cleaned = cleanIntentText(value);

  if (!cleaned) {
    return null;
  }

  if (isNullStyleAnswer(cleaned) || MVP_EXCLUSION_PATTERN.test(cleaned)) {
    return {
      boundary: "not_in_scope" as const,
      provider: null
    };
  }

  const providers = extractCanonicalProviders(cleaned);

  if (providers.length > 0) {
    return {
      boundary: IN_MVP_PATTERN.test(cleaned) ? ("in_mvp" as const) : ("post_mvp" as const),
      provider: providers[0]
    };
  }

  return null;
}

export function normalizeFeatureRequirementDecision(
  value: string,
  options: {
    treatRecognizedSignalsAsInMvp?: boolean;
  } = {}
) {
  const cleaned = cleanIntentText(value);

  if (!cleaned) {
    return null;
  }

  if (/^(?:no|nope|none|none yet|not really)$/i.test(cleaned)) {
    return "not_in_scope" as const;
  }

  if (NOT_IN_SCOPE_PATTERN.test(cleaned)) {
    return "not_in_scope" as const;
  }

  if (MVP_EXCLUSION_PATTERN.test(cleaned)) {
    return "post_mvp" as const;
  }

  if (IN_MVP_PATTERN.test(cleaned)) {
    return "in_mvp" as const;
  }

  if (options.treatRecognizedSignalsAsInMvp) {
    return "in_mvp" as const;
  }

  return null;
}
