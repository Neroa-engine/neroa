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
    label: "Resources",
    href: "/instructions"
  },
  {
    label: "Support",
    href: "/support"
  }
];

export const authenticatedUtilityNavItems: HeaderLinkItem[] = [
  {
    label: "Command Center",
    href: "/dashboard"
  },
  {
    label: "Projects",
    href: "/projects"
  },
  {
    label: "Resources",
    href: "/instructions"
  },
  {
    label: "Support",
    href: "/support"
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
    label: "Projects",
    href: "/projects",
    description: "Jump into the active project workspace, review in-flight work, and keep execution moving."
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Compare the guided paths, understand the commercial model, and choose the right entry point."
  },
  {
    label: "SaaS",
    href: "/what-is-saas",
    description: "Read the SaaS explainer and see how NEROA frames product planning and delivery."
  },
  {
    label: "Budget Logic",
    href: "/budget-pricing-logic",
    description: "Review the budget logic behind the build paths, delivery scope, and commercial tradeoffs."
  },
  {
    label: "DIY Build",
    href: "/diy-build",
    description: "Explore the self-directed path for shaping, reviewing, and guiding a build inside NEROA."
  },
  {
    label: "Managed Build",
    href: "/managed-build",
    description: "See the managed path for teams that want guided delivery with the same premium product flow."
  },
  {
    label: "Use Cases",
    href: "/use-cases",
    description: "Browse the practical use cases that show how NEROA handles planning, review, and approvals."
  },
  {
    label: "Blog",
    href: "/blog",
    description: "Read product-led articles, explainers, and thought pieces about guided software delivery."
  },
  {
    label: "Instructions",
    href: "/instructions",
    description: "Follow the practical walkthrough for using the public site, pricing, support, and build flow."
  },
  {
    label: "Support",
    href: "/support",
    description: "Find help paths, guidance, and ways to contact the NEROA team without leaving the site."
  },
  {
    label: "Contact",
    href: "/contact",
    description: "Reach the NEROA team directly for questions, support, or next-step guidance."
  },
  {
    label: "Start a project",
    href: "/start",
    description: "Enter the guided builder, start at step one, and move into the structured product flow."
  }
];
