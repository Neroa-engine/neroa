export const protectedAppPathPrefixes = [
  "/admin",
  "/billing",
  "/dashboard",
  "/jobs",
  "/profile",
  "/projects",
  "/roadmap",
  "/settings",
  "/usage",
  "/workspace"
] as const;

export const protectedNeroaPathPrefixes = [
  "/neroa/account",
  "/neroa/admin",
  "/neroa/project"
] as const;

export const authEntryPathPrefixes = ["/auth", "/signup"] as const;

export function isSafeAppPath(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export function normalizeAppPath(
  value: string | null | undefined,
  fallback = "/projects"
): string {
  return isSafeAppPath(value) ? value : fallback;
}

export function buildAuthRedirectPath(args?: {
  nextPath?: string | null;
  notice?: string | null;
}) {
  const params = new URLSearchParams();
  const hasExplicitNextPath = isSafeAppPath(args?.nextPath);
  const nextPath = normalizeAppPath(args?.nextPath, "/projects");

  if (args?.notice?.trim()) {
    params.set("notice", args.notice.trim());
  }

  if (hasExplicitNextPath) {
    params.set("next", nextPath);
  }

  const query = params.toString();
  return query ? `/auth?${query}` : "/auth";
}

export function buildCleanNeroaAuthRedirectPath(args?: {
  nextPath?: string | null;
  notice?: string | null;
}) {
  const params = new URLSearchParams();
  const hasExplicitNextPath = isSafeAppPath(args?.nextPath);
  const nextPath = normalizeAppPath(args?.nextPath, "/neroa/account");

  if (args?.notice?.trim()) {
    params.set("notice", args.notice.trim());
  }

  if (hasExplicitNextPath) {
    params.set("next", nextPath);
  }

  const query = params.toString();
  return query ? `/neroa/auth?${query}` : "/neroa/auth";
}

export function isProtectedAppPath(pathname: string) {
  return protectedAppPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isProtectedNeroaPath(pathname: string) {
  return protectedNeroaPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthEntryPath(pathname: string) {
  return authEntryPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
