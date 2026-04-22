import { APP_ROUTES } from "@/lib/routes";

export type PublicLaunchIntent = "diy" | "managed";

export const publicLaunchEntryPath = APP_ROUTES.start;
export const publicLaunchDiyPath = APP_ROUTES.startDiy;
export const publicLaunchManagedPath = APP_ROUTES.startManaged;

export const publicLaunchPrimaryCta = {
  href: publicLaunchDiyPath,
  label: "Open Strategy Room",
  intent: "diy"
} as const;

export const publicLaunchManagedCta = {
  href: publicLaunchManagedPath,
  label: "Open Managed Strategy Room",
  intent: "managed"
} as const;

export const managedBuildEntryPath = publicLaunchManagedPath;
export const managedBuildSignupPath =
  `${APP_ROUTES.signup}?next=${encodeURIComponent(managedBuildEntryPath)}`;
export const managedBuildAuthPath =
  `${APP_ROUTES.auth}?next=${encodeURIComponent(managedBuildEntryPath)}`;

export const launchReadyUseCaseSlugs = [
  "saas",
  "internal-software",
  "external-apps",
  "mobile-apps"
] as const;

function normalizeLaunchLabel(label: string) {
  return label.trim().toLowerCase();
}

export function resolvePublicLaunchIntent(
  label: string,
  href: string
): PublicLaunchIntent | null {
  const normalizedLabel = normalizeLaunchLabel(label);

  if (
    normalizedLabel === "let's get started" ||
    normalizedLabel === "start diy build" ||
    normalizedLabel === "open strategy room"
  ) {
    return "diy";
  }

  if (
    normalizedLabel === "explore managed build" ||
    normalizedLabel === "start managed build"
  ) {
    return "managed";
  }

  if (
    (href === publicLaunchEntryPath || href === publicLaunchManagedPath) &&
    normalizedLabel.includes("managed")
  ) {
    return "managed";
  }

  if (href === publicLaunchDiyPath) {
    return "diy";
  }

  return null;
}

function isPrivateAppHref(href: string) {
  return (
    href === APP_ROUTES.dashboard ||
    href === APP_ROUTES.projects ||
    href === "/projects/new" ||
    href === APP_ROUTES.roadmap ||
    href.startsWith("/workspace/")
  );
}

function isCanonicalLaunchTarget(href: string) {
  return (
    href === publicLaunchEntryPath ||
    href === publicLaunchDiyPath ||
    href === publicLaunchManagedPath
  );
}

export function buildPublicLaunchAuthHref(targetPath: string) {
  return `${APP_ROUTES.auth}?next=${encodeURIComponent(targetPath)}`;
}

export function resolveCanonicalStartRoute(label: string, href: string) {
  const launchIntent = resolvePublicLaunchIntent(label, href);

  if (launchIntent === "managed") {
    return {
      href: publicLaunchManagedPath,
      label: publicLaunchManagedCta.label
    };
  }

  if (launchIntent === "diy") {
    return {
      href: publicLaunchDiyPath,
      label: publicLaunchPrimaryCta.label
    };
  }

  if (isPrivateAppHref(href)) {
    return {
      href: publicLaunchDiyPath,
      label: publicLaunchPrimaryCta.label
    };
  }

  return { href, label };
}

export function resolvePublicLaunchAction(
  label: string,
  href: string,
  options?: {
    authenticated?: boolean;
  }
) {
  const resolvedAction = resolveCanonicalStartRoute(label, href);

  if (
    options?.authenticated === false &&
    (isCanonicalLaunchTarget(resolvedAction.href) || isPrivateAppHref(resolvedAction.href))
  ) {
    return {
      href: buildPublicLaunchAuthHref(resolvedAction.href),
      label: resolvedAction.label
    };
  }

  return resolvedAction;
}
