const METADATA_PREFIX = "<!--NEROA_PROJECT_META:";
const METADATA_SUFFIX = "-->";

export const engineTemplates = {
  "business-launch": {
    label: "External App Engine",
    lanes: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"]
  },
  "saas-build": {
    label: "SaaS Engine",
    lanes: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"]
  },
  "mobile-app-build": {
    label: "Mobile App Engine",
    lanes: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"]
  },
  "coding-project": {
    label: "Internal Software Engine",
    lanes: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"]
  },
  "ecommerce-brand": {
    label: "Commerce Engine",
    lanes: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"]
  }
};

export const mobileSupportSummary = {
  primaryBuildPath: "React Native + Expo",
  secondaryMvpPath: "PWA / mobile web",
  advisoryPath: "Flutter, native iOS, native Android"
};

export const engineCategoryOptions = [
  {
    id: "saas",
    title: "SaaS",
    description: "Subscription software, portals, AI tools, and dashboards.",
    templateId: "saas-build"
  },
  {
    id: "internal",
    title: "Internal Software",
    description: "CRMs, admin systems, internal workflows, and reporting tools.",
    templateId: "coding-project"
  },
  {
    id: "external",
    title: "External Apps",
    description: "Customer-facing portals, booking tools, and branded digital products.",
    templateId: "business-launch"
  },
  {
    id: "mobile",
    title: "Mobile Apps",
    description: "iPhone, Android, and cross-platform mobile products.",
    templateId: "mobile-app-build"
  }
];

function encodeMetadata(metadata) {
  return encodeURIComponent(JSON.stringify(metadata));
}

function decodeMetadata(value) {
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
}

export function encodeWorkspaceDescription(visibleDescription, metadata) {
  const cleanDescription = visibleDescription?.trim() || "";

  if (!metadata) {
    return cleanDescription || null;
  }

  const payload = `${METADATA_PREFIX}${encodeMetadata(metadata)}${METADATA_SUFFIX}`;
  return cleanDescription ? `${cleanDescription}\n\n${payload}` : payload;
}

export function parseWorkspaceDescription(value) {
  if (!value?.trim()) {
    return {
      visibleDescription: null,
      metadata: null
    };
  }

  const trimmed = value.trim();
  const markerIndex = trimmed.lastIndexOf(METADATA_PREFIX);

  if (markerIndex === -1 || !trimmed.endsWith(METADATA_SUFFIX)) {
    return {
      visibleDescription: trimmed,
      metadata: null
    };
  }

  const metadataValue = trimmed
    .slice(markerIndex + METADATA_PREFIX.length, trimmed.length - METADATA_SUFFIX.length)
    .trim();

  return {
    visibleDescription: trimmed.slice(0, markerIndex).trim() || null,
    metadata: decodeMetadata(metadataValue)
  };
}

export function buildNewEngineMetadata({ templateId }) {
  return {
    version: 1,
    templateId,
    customLanes: [],
    archived: false,
    assets: []
  };
}

export function getTemplateSummary(templateId) {
  return engineTemplates[templateId] ?? engineTemplates["business-launch"];
}
