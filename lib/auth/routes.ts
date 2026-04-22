import { APP_ROUTES } from "@/lib/routes";

export const protectedAppPathPrefixes = [
  APP_ROUTES.dashboard,
  APP_ROUTES.start,
  "/workspace",
  "/jobs"
] as const;

export const authEntryPathPrefixes = [APP_ROUTES.auth, APP_ROUTES.signup] as const;

const allowedContinuationPrefixes = [
  APP_ROUTES.home,
  APP_ROUTES.auth,
  APP_ROUTES.signup,
  APP_ROUTES.forgotPassword,
  APP_ROUTES.resetPassword,
  APP_ROUTES.dashboard,
  APP_ROUTES.start,
  "/workspace",
  "/jobs"
] as const;

function remapLegacyPath(pathname: string) {
  if (pathname === "/start?step=plan") {
    return APP_ROUTES.startDiy;
  }

  if (pathname === "/project-preview" || pathname.startsWith("/project-preview")) {
    return APP_ROUTES.startDiy;
  }

  if (pathname === "/projects/new") {
    return APP_ROUTES.startDiy;
  }

  if (pathname === "/pricing") {
    return APP_ROUTES.start;
  }

  if (pathname === "/pricing/diy") {
    return APP_ROUTES.startDiy;
  }

  if (pathname === "/pricing/managed") {
    return APP_ROUTES.startManaged;
  }

  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    return APP_ROUTES.dashboard;
  }

  if (pathname === "/roadmap" || pathname.startsWith("/roadmap/")) {
    return APP_ROUTES.dashboard;
  }

  if (
    pathname === "/billing" ||
    pathname.startsWith("/billing/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/usage" ||
    pathname.startsWith("/usage/")
  ) {
    return APP_ROUTES.dashboard;
  }

  return pathname;
}

function matchesPathPrefix(pathname: string, prefix: string) {
  return (
    pathname === prefix ||
    pathname.startsWith(`${prefix}/`) ||
    pathname.startsWith(`${prefix}?`)
  );
}

export function isSafeAppPath(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export function normalizeAppPath(
  value: string | null | undefined,
  fallback: string = APP_ROUTES.dashboard
): string {
  if (!isSafeAppPath(value)) {
    return fallback;
  }

  const normalizedPath = remapLegacyPath(value);

  if (
    allowedContinuationPrefixes.some(
      (prefix) => matchesPathPrefix(normalizedPath, prefix)
    )
  ) {
    return normalizedPath;
  }

  return fallback;
}

export function buildAuthRedirectPath(args?: {
  nextPath?: string | null;
  notice?: string | null;
}) {
  const params = new URLSearchParams();
  const nextPath = normalizeAppPath(args?.nextPath, APP_ROUTES.start);

  if (args?.notice?.trim()) {
    params.set("notice", args.notice.trim());
  }

  if (nextPath !== APP_ROUTES.auth) {
    params.set("next", nextPath);
  }

  const query = params.toString();
  return query ? `${APP_ROUTES.auth}?${query}` : APP_ROUTES.auth;
}

export function isProtectedAppPath(pathname: string) {
  return protectedAppPathPrefixes.some((prefix) => matchesPathPrefix(pathname, prefix));
}

export function isAuthEntryPath(pathname: string) {
  return authEntryPathPrefixes.some((prefix) => matchesPathPrefix(pathname, prefix));
}
