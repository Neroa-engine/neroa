export type PublicLaunchIntent = "diy" | "managed";

import { APP_ROUTES } from "@/lib/routes";

export const publicLaunchEntryPath = APP_ROUTES.roadmap;
export const publicLaunchDiyPath = "/start?entry=diy" as const;
export const publicLaunchManagedPath = "/start?entry=managed" as const;

export const publicLaunchPrimaryCta = {
  href: publicLaunchDiyPath,
  label: "Start a conversation",
  intent: "diy"
} as const;

export const publicLaunchManagedCta = {
  href: publicLaunchManagedPath,
  label: "Start Managed Build",
  intent: "managed"
} as const;

export const managedBuildEntryPath = publicLaunchManagedPath;
export const managedBuildSignupPath =
  `/signup?next=${encodeURIComponent(managedBuildEntryPath)}` as const;
export const managedBuildAuthPath =
  `/auth?next=${encodeURIComponent(managedBuildEntryPath)}` as const;

export const launchReadyUseCaseSlugs = [
  "saas",
  "internal-software",
  "external-apps",
  "mobile-apps"
] as const;

function normalizeLaunchLabel(label: string) {
  return label.trim().toLowerCase();
}

function isStrategyRoomLaunchTarget(label: string, href: string) {
  const normalizedLabel = normalizeLaunchLabel(label);
  return normalizedLabel === "open strategy room" || href === APP_ROUTES.roadmap;
}

export function resolvePublicLaunchIntent(
  label: string,
  href: string
): PublicLaunchIntent | null {
  const normalizedLabel = normalizeLaunchLabel(label);

  if (
    normalizedLabel === "let's get started" ||
    normalizedLabel === "start diy build" ||
    normalizedLabel === "start your diy build" ||
    normalizedLabel === "explore diy build" ||
    normalizedLabel === "start a conversation"
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
    href === "/auth" ||
    href === "/signup" ||
    href === "/dashboard" ||
    href === "/projects" ||
    href === "/projects/new" ||
    href === "/roadmap" ||
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
  if (isStrategyRoomLaunchTarget(label, href)) {
    return {
      href: APP_ROUTES.roadmap,
      label
    };
  }

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

  if (resolvedAction.href === APP_ROUTES.roadmap) {
    if (options?.authenticated === false) {
      return {
        href: buildPublicLaunchAuthHref(APP_ROUTES.roadmap),
        label: resolvedAction.label
      };
    }

    return resolvedAction;
  }

  if (options?.authenticated === true && isCanonicalLaunchTarget(resolvedAction.href)) {
    return {
      href: APP_ROUTES.projectsNew,
      label: resolvedAction.label
    };
  }

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
