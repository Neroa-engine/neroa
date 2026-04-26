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
      .split(/\s*(?:,|\/| and | & |\+)\s*/i)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

const NULL_STYLE_PATTERN =
  /^(?:no|none|nope|nothing|nothing yet|none yet|not right now|nothing right now|none right now|no constraint|no constraints|no real constraint|no real constraints|no integration|no integrations|no connector|no connectors|no data source|no data sources)$/i;

const MAYBE_LATER_PATTERN =
  /^(?:maybe|maybe later|later|eventually|possibly|tbd|not sure yet)$/i;

const MVP_EXCLUSION_PATTERN =
  /\b(?:not in mvp|out of mvp|outside mvp|post mvp|post-mvp|after mvp|later phase|later release|phase two|phase 2|not right now)\b/i;

const ANALYTICS_ONLY_PATTERN =
  /\b(?:analytics only|reporting only|research only|not financial advice)\b/i;

const IN_MVP_PATTERN =
  /\b(?:in mvp|for mvp|at launch|launch feature|include it|include this|yes|yes please|needed|required|must have)\b/i;

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
    patterns: [/\bopenai\b/i, /\bopenai api\b/i, /\bchatgpt 5\.4\b/i, /\bgpt[- ]?5\.4\b/i]
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
    target: "operatorPersonas",
    patterns: [/\badmins?\b/i]
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
    appliesTo: ["integrations", "data_sources", "scoring_inputs", "ai_integration_boundary"],
    examples: ["CoinMarketCap", "CMC", "OpenAI API", "ChatGPT 5.4"]
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
    appliesTo: ["launch_reports", "dashboard_reporting_requirement"],
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
      "file_upload_requirement",
      "notifications_requirement",
      "admin_console_requirement",
      "search_filter_requirement",
      "dashboard_reporting_requirement"
    ],
    examples: ["yes", "not in MVP", "post MVP"]
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
    operatorPersonas: []
  };

  for (const alias of ROLE_ALIASES) {
    if (alias.patterns.some((pattern) => pattern.test(value))) {
      split[alias.target].push(alias.role);
    }
  }

  split.buyerPersonas = uniqueStrings(split.buyerPersonas);
  split.operatorPersonas = uniqueStrings(split.operatorPersonas);

  if (split.buyerPersonas.length === 0 && split.operatorPersonas.length === 0) {
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

export function normalizeFeatureRequirementDecision(value: string) {
  const cleaned = cleanIntentText(value);

  if (!cleaned) {
    return null;
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

  return null;
}
