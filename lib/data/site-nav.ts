export type SiteNavItem = {
  label: string;
  href: string;
  description: string;
};

export type HeaderLinkItem = {
  label: string;
  href: string;
};

export const publicUtilityNavItems: HeaderLinkItem[] = [
  {
    label: "Pricing",
    href: "/pricing"
  },
  {
    label: "Contact",
    href: "/contact"
  }
];

export const authenticatedUtilityNavItems: HeaderLinkItem[] = [
  {
    label: "Projects",
    href: "/projects"
  },
  {
    label: "Roadmap",
    href: "/roadmap"
  },
  {
    label: "Billing",
    href: "/billing"
  },
  {
    label: "Contact",
    href: "/contact"
  },
  {
    label: "Account",
    href: "/profile"
  }
];

export const mainNavItems: HeaderLinkItem[] = [
  {
    label: "Home",
    href: "/"
  }
];

export const siteNavItems: SiteNavItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Return to the public homepage and continue into the real guided builder."
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Compare the guided paths, understand the commercial model, and choose the right entry point."
  },
  {
    label: "Projects",
    href: "/projects",
    description: "Open the live project workspace, review in-flight work, and continue execution from the real product surface."
  },
  {
    label: "Contact",
    href: "/contact",
    description: "Reach the NEROA team directly for support questions, planning help, or a cleaner next-step handoff."
  },
  {
    label: "Start planning",
    href: "/start",
    description: "Enter the approved front-door planning flow and move into the structured product path from the current live experience."
  }
];
