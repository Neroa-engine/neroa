export const publicLaunchPrimaryCta = {
  href: "/start",
  label: "Start your build"
} as const;

export const launchReadyUseCaseSlugs = [
  "saas",
  "internal-software",
  "external-apps",
  "mobile-apps"
] as const;

function isPrivateAppHref(href: string) {
  return (
    href === "/auth" ||
    href === "/dashboard" ||
    href === "/start" ||
    href.startsWith("/workspace/")
  );
}

export function resolvePublicLaunchAction(label: string, href: string) {
  if (isPrivateAppHref(href)) {
    return {
      href: publicLaunchPrimaryCta.href,
      label: publicLaunchPrimaryCta.label
    };
  }

  return { href, label };
}
