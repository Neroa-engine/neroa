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
    label: "Engine Board",
    href: "/dashboard"
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
    label: "Use Cases",
    href: "/use-cases"
  },
  {
    label: "Pricing",
    href: "/pricing"
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
    label: "Contact",
    href: "/contact"
  }
];

export const siteNavItems: SiteNavItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Return to the public homepage and see how Neroa helps users move from idea into build."
  },
  {
    label: "Use Cases",
    href: "/use-cases",
    description: "Choose between SaaS, internal software, external apps, and mobile app build paths."
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Choose between DIY pricing with Engine Credits and managed-build pricing with scoped service ranges."
  },
  {
    label: "DIY Build",
    href: "/diy-build",
    description: "See how the DIY path uses monthly Engine Credits to build software over time."
  },
  {
    label: "Managed Build",
    href: "/managed-build",
    description: "See the managed build path with staged approvals, guided visibility, and quote-led execution."
  },
  {
    label: "How It Works",
    href: "/how-it-works",
    description: "See how Naroa frames the work and how Neroa turns that into a structured build flow."
  },
  {
    label: "Naroa",
    href: "/system/naroa",
    description: "See how the core orchestrator frames engines and activates the right specialist systems."
  },
  {
    label: "AI Systems",
    href: "/system/ai",
    description: "Explore the specialist AI stack that expands from Naroa when the work needs it."
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
    description: "Find help paths, guidance, and ways to contact the Neroa team without leaving the site."
  },
  {
    label: "Contact",
    href: "/contact",
    description: "Send support questions, build inquiries, or partnership notes."
  },
  {
    label: "Start your build",
    href: "/start",
    description: "Create your first engine and move into the live Neroa product flow."
  }
];
