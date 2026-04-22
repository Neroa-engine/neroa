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
  },
  {
    label: "Pricing",
    href: "/pricing"
  },
  {
    label: "SaaS",
    href: "/what-is-saas"
  },
  {
    label: "Budget Logic",
    href: "/budget-pricing-logic"
  },
  {
    label: "DIY Build",
    href: "/diy-build"
  },
  {
    label: "Managed Build",
    href: "/managed-build"
  },
  {
    label: "Use Cases",
    href: "/use-cases"
  },
  {
    label: "Blog",
    href: "/blog"
  },
  {
    label: "Contact",
    href: "/contact"
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
    description: "Compare DIY pacing, Managed execution support, and the pricing logic that connects them."
  },
  {
    label: "SaaS",
    href: "/what-is-saas",
    description: "Learn what kind of SaaS product NEROA helps founders define before they scope or build it."
  },
  {
    label: "Budget Logic",
    href: "/budget-pricing-logic",
    description: "See how budget changes scope, pace, support level, and when Managed becomes the better path."
  },
  {
    label: "DIY Build",
    href: "/diy-build",
    description: "Understand the guided DIY lane, monthly pacing, and when to accelerate or move into Managed."
  },
  {
    label: "Managed Build",
    href: "/managed-build",
    description: "Review the managed execution path, staged visibility, and scope-led delivery support."
  },
  {
    label: "Use Cases",
    href: "/use-cases",
    description: "See what NEROA helps build and when DIY or Managed is the better path."
  },
  {
    label: "Blog",
    href: "/blog",
    description: "Read product notes, system thinking, and build-focused updates."
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
    description: "Send support questions, project inquiries, or partnership notes."
  },
  {
    label: "Start a project",
    href: "/start",
    description: "Enter the guided builder, start at step one, and move into the structured product flow."
  }
];
