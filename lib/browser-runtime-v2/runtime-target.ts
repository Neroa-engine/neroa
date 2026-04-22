export const browserRuntimeLocalOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002"
] as const;

export type BrowserRuntimeV2RuntimeEnvironment =
  | "local"
  | "preview"
  | "production"
  | "staging";

export type BrowserRuntimeV2RuntimeProvider = "local" | "netlify" | "custom";

export type BrowserRuntimeV2RuntimeTarget = {
  id: string;
  environment: BrowserRuntimeV2RuntimeEnvironment;
  provider: BrowserRuntimeV2RuntimeProvider;
  origin: string;
  host: string;
  label: string;
  siteOrigin: string | null;
  allowedOrigins: string[];
  isEphemeral: boolean;
};

type RuntimeTargetOriginConfig = {
  productionOrigins: string[];
  previewOrigins: string[];
  stagingOrigins: string[];
  siteOrigin: string | null;
};

function uniqueOrigins(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export function normalizeBrowserRuntimeOrigin(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function parseConfiguredOrigins(value: string | undefined) {
  return uniqueOrigins(
    (value ?? "")
      .split(",")
      .map((item) => normalizeBrowserRuntimeOrigin(item))
  );
}

function getRuntimeTargetOriginConfig(): RuntimeTargetOriginConfig {
  const siteOrigin = normalizeBrowserRuntimeOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? null);
  const productionOrigins = parseConfiguredOrigins(
    process.env.NEXT_PUBLIC_RUNTIME_PRODUCTION_ORIGINS
  );
  const previewOrigins = parseConfiguredOrigins(
    process.env.NEXT_PUBLIC_RUNTIME_PREVIEW_ORIGINS
  );
  const stagingOrigins = parseConfiguredOrigins(
    process.env.NEXT_PUBLIC_RUNTIME_STAGING_ORIGINS
  );

  return {
    productionOrigins,
    previewOrigins,
    stagingOrigins,
    siteOrigin
  };
}

function isLocalOrigin(origin: string) {
  if ((browserRuntimeLocalOrigins as readonly string[]).includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function resolveProvider(host: string): BrowserRuntimeV2RuntimeProvider {
  if (host === "localhost" || host === "127.0.0.1") {
    return "local";
  }

  if (/\.netlify\.(app|live)$/i.test(host)) {
    return "netlify";
  }

  return "custom";
}

function resolveEnvironment(args: {
  origin: string;
  host: string;
  siteOrigin: string | null;
  productionOrigins: string[];
  previewOrigins: string[];
  stagingOrigins: string[];
}) {
  if (isLocalOrigin(args.origin)) {
    return "local" as const;
  }

  if (
    args.stagingOrigins.includes(args.origin) ||
    /(^|\.)staging([.-]|$)/i.test(args.host)
  ) {
    return "staging" as const;
  }

  if (args.siteOrigin && args.origin === args.siteOrigin) {
    return "production" as const;
  }

  if (args.productionOrigins.includes(args.origin)) {
    return "production" as const;
  }

  if (
    args.previewOrigins.includes(args.origin) ||
    /\.netlify\.(app|live)$/i.test(args.host) ||
    /(^|\.)preview([.-]|$)/i.test(args.host) ||
    /--/i.test(args.host)
  ) {
    return "preview" as const;
  }

  return "production" as const;
}

function buildLabel(
  environment: BrowserRuntimeV2RuntimeEnvironment,
  provider: BrowserRuntimeV2RuntimeProvider
) {
  if (environment === "local") {
    return "Local runtime target";
  }

  if (environment === "preview" && provider === "netlify") {
    return "Netlify preview target";
  }

  if (environment === "preview") {
    return "Preview runtime target";
  }

  if (environment === "staging") {
    return "Staging runtime target";
  }

  if (provider === "netlify") {
    return "Netlify production target";
  }

  return "Production runtime target";
}

function buildAllowedOrigins(args: {
  origin: string;
  environment: BrowserRuntimeV2RuntimeEnvironment;
  siteOrigin: string | null;
  productionOrigins: string[];
  previewOrigins: string[];
  stagingOrigins: string[];
}) {
  if (args.environment === "local") {
    return uniqueOrigins([
      args.origin,
      ...browserRuntimeLocalOrigins
    ]);
  }

  if (args.environment === "preview") {
    return uniqueOrigins([
      args.origin,
      args.siteOrigin,
      ...args.previewOrigins
    ]);
  }

  if (args.environment === "staging") {
    return uniqueOrigins([
      args.origin,
      ...args.stagingOrigins
    ]);
  }

  return uniqueOrigins([
    args.origin,
    args.siteOrigin,
    ...args.productionOrigins
  ]);
}

export function resolveBrowserRuntimeV2RuntimeTarget(originInput: string) {
  const origin =
    normalizeBrowserRuntimeOrigin(originInput) ??
    browserRuntimeLocalOrigins[0];
  const url = new URL(origin);
  const config = getRuntimeTargetOriginConfig();
  const provider = resolveProvider(url.hostname);
  const environment = resolveEnvironment({
    origin,
    host: url.hostname,
    siteOrigin: config.siteOrigin,
    productionOrigins: config.productionOrigins,
    previewOrigins: config.previewOrigins,
    stagingOrigins: config.stagingOrigins
  });
  const allowedOrigins = buildAllowedOrigins({
    origin,
    environment,
    siteOrigin: config.siteOrigin,
    productionOrigins: config.productionOrigins,
    previewOrigins: config.previewOrigins,
    stagingOrigins: config.stagingOrigins
  });

  return {
    id: `${provider}:${environment}:${url.host}`,
    environment,
    provider,
    origin,
    host: url.host,
    label: buildLabel(environment, provider),
    siteOrigin: config.siteOrigin,
    allowedOrigins,
    isEphemeral: environment === "preview"
  } satisfies BrowserRuntimeV2RuntimeTarget;
}

export function resolveBrowserRuntimeRequestOrigin(headerStore: {
  get(name: string): string | null;
}) {
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host") ?? "localhost:3000";
  const normalizedHost = host.split(",")[0]?.trim() || "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (normalizedHost.includes("localhost") || normalizedHost.includes("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${normalizedHost}`;
}
