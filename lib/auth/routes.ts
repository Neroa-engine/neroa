export const protectedAppPathPrefixes = [
  "/admin",
  "/billing",
  "/dashboard",
  "/jobs",
  "/profile",
  "/projects",
  "/roadmap",
  "/settings",
  "/start",
  "/usage",
  "/workspace"
] as const;

export const authEntryPathPrefixes = ["/auth", "/signup"] as const;

export function isSafeAppPath(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export function normalizeAppPath(
  value: string | null | undefined,
  fallback = "/start"
): string {
  return isSafeAppPath(value) ? value : fallback;
}

export function buildAuthRedirectPath(args?: {
  nextPath?: string | null;
  notice?: string | null;
}) {
  const params = new URLSearchParams();
  const hasExplicitNextPath = isSafeAppPath(args?.nextPath);
  const nextPath = normalizeAppPath(args?.nextPath, "/start");

  if (args?.notice?.trim()) {
    params.set("notice", args.notice.trim());
  }

  if (hasExplicitNextPath) {
    params.set("next", nextPath);
  }

  const query = params.toString();
  return query ? `/auth?${query}` : "/auth";
}

export function isProtectedAppPath(pathname: string) {
  return protectedAppPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthEntryPath(pathname: string) {
  return authEntryPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
