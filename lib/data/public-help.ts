export type PublicInquiryType =
  | "saas-project"
  | "internal-software-project"
  | "external-app-project"
  | "mobile-app-project"
  | "agency-partner"
  | "managed-build-quote"
  | "support"
  | "other";

export type PublicQuickLink = {
  label: string;
  href: string;
};

export type PublicHelpContext = {
  id: string;
  title: string;
  intro: string;
  suggestions: string[];
  quickLinks: PublicQuickLink[];
};

export const publicInquiryTypeOptions: Array<{
  value: PublicInquiryType;
  label: string;
  description: string;
}> = [
  {
    value: "saas-project",
    label: "SaaS project",
    description: "Talk to Neroa about scoping, validating, budgeting, and building a SaaS product."
  },
  {
    value: "internal-software-project",
    label: "Internal software project",
    description: "Discuss internal tools, admin systems, CRMs, reporting portals, or workflow software."
  },
  {
    value: "external-app-project",
    label: "External app / customer-facing product",
    description: "Plan customer-facing apps, portals, booking tools, websites, or branded digital products."
  },
  {
    value: "mobile-app-project",
    label: "Mobile app project",
    description: "Discuss iPhone apps, Android apps, cross-platform MVPs, app-store planning, or mobile product execution."
  },
  {
    value: "agency-partner",
    label: "Agency / builder partnership",
    description: "Discuss builder partnerships, client delivery workflows, or agency use of Neroa."
  },
  {
    value: "managed-build-quote",
    label: "Managed build quote",
    description: "Request a scoped quote for Neroa or a partner team to help execute, QA, deploy, and manage the software."
  },
  {
    value: "support",
    label: "Support",
    description: "Get help with pricing, access, public pages, or where to start."
  },
  {
    value: "other",
    label: "Other",
    description: "Use this when the request does not fit the core product or partnership paths above."
  }
];

export const publicSupportLinks: PublicQuickLink[] = [
  { label: "Start your build", href: "/start" },
  { label: "Contact Us", href: "/contact" },
  { label: "Support", href: "/support" },
  { label: "Instructions", href: "/instructions" }
];

const pricingLinks: PublicQuickLink[] = [
  { label: "DIY Pricing", href: "/pricing/diy" },
  { label: "Managed Pricing", href: "/pricing/managed" },
  { label: "Start your build", href: "/start" },
  { label: "Request quote", href: "/contact?type=managed-build-quote" },
  { label: "Contact Us", href: "/contact?type=other" },
  { label: "Instructions", href: "/instructions" }
];

const gettingStartedLinks: PublicQuickLink[] = [
  { label: "Start your build", href: "/start" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Support", href: "/support" },
  { label: "Instructions", href: "/instructions" }
];

const aiSystemLinks: PublicQuickLink[] = [
  { label: "Naroa", href: "/system/naroa" },
  { label: "AI Systems", href: "/system/ai" },
  { label: "Support", href: "/support" }
];

const useCaseLinks: PublicQuickLink[] = [
  { label: "Use Cases", href: "/use-cases" },
  { label: "DIY Pricing", href: "/pricing/diy" },
  { label: "Contact Us", href: "/contact?type=other" }
];

const blogLinks: PublicQuickLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Instructions", href: "/instructions" },
  { label: "Start your build", href: "/start" }
];

const defaultContext: PublicHelpContext = {
  id: "default",
  title: "Neroa site guide",
  intro:
    "I can explain how Neroa helps build SaaS products, internal software, external apps, and mobile apps, then point you to the right page or contact path.",
  suggestions: [
    "Which build path fits me?",
    "How do I get started?",
    "Where can I get support?"
  ],
  quickLinks: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "Pricing", href: "/pricing" }
  ]
};

export function getPublicHelpContext(pathname: string): PublicHelpContext {
  if (pathname.startsWith("/pricing")) {
    return {
      id: "pricing",
      title: "Pricing help",
      intro:
        "I can explain DIY vs managed pricing, Engine Credits, planning engines, build-project limits, and when to move from subscription guidance into a managed quote.",
      suggestions: [
        "Which plan fits a SaaS build?",
        "What happens when credits run out?",
        "Should I use DIY or Managed Build?"
      ],
      quickLinks: pricingLinks
    };
  }

  if (pathname.startsWith("/early-access")) {
    return {
      id: "get-started",
      title: "Get started help",
      intro:
        "I can explain how to start your build, choose the right product category, and move into the live Neroa flow for SaaS, internal software, external apps, or mobile apps.",
      suggestions: [
        "How do I get started?",
        "Which build path fits me?",
        "What should I do next?"
      ],
      quickLinks: gettingStartedLinks
    };
  }

  if (pathname.startsWith("/system/naroa") || pathname.startsWith("/system/narua")) {
    return {
      id: "naroa",
      title: "Naroa guide",
      intro:
        "I can explain Naroa's role as the orchestration layer that helps move product ideas into MVP, budget, validation, build, and launch decisions.",
      suggestions: [
        "What does Naroa actually do?",
        "When do specialist AIs activate?",
        "How does Naroa help with a build?"
      ],
      quickLinks: aiSystemLinks
    };
  }

  if (pathname.startsWith("/system") || pathname.startsWith("/ai-system")) {
    return {
      id: "ai-system",
      title: "AI system help",
      intro:
        "I can explain how Naroa, Atlas, Forge, Nova, Pulse, Ops, and RepoLink coordinate around SaaS products, internal software, external apps, and mobile apps.",
      suggestions: [
        "How do the AI systems work together?",
        "Which AI helps with build planning?",
        "Where should I start?"
      ],
      quickLinks: aiSystemLinks
    };
  }

  if (pathname.startsWith("/use-cases")) {
    return {
      id: "use-cases",
      title: "Use-case help",
      intro:
        "I can explain which build path fits best, what outputs each use case creates, and which coordinated AI stack supports it.",
      suggestions: [
        "Should I start with SaaS, internal software, external apps, or mobile apps?",
        "What outputs does this workflow produce?",
        "Which plan fits this build path?"
      ],
      quickLinks: useCaseLinks
    };
  }

  if (pathname.startsWith("/blog")) {
    return {
      id: "blog",
      title: "Blog guide",
      intro:
        "I can summarize the article, connect it back to the product, and point you to the next page if you want pricing, use cases, or the live build flow.",
      suggestions: [
        "Summarize this article",
        "What page should I read next?",
        "How does this connect to the product?"
      ],
      quickLinks: blogLinks
    };
  }

  if (pathname.startsWith("/support")) {
    return {
      id: "support",
      title: "Support help",
      intro:
        "I can help you choose the right support path, point you to the contact form, or explain which build path and plan fit your project.",
      suggestions: [
        "How do I contact the team?",
        "Which inquiry type should I use?",
        "What should I do if I'm unsure where to start?"
      ],
      quickLinks: publicSupportLinks
    };
  }

  if (pathname.startsWith("/instructions")) {
    return {
      id: "instructions",
      title: "Instructions guide",
      intro:
        "I can help you move through the public site, understand the live product flow, and choose the right path for SaaS, internal software, external apps, or mobile apps.",
      suggestions: [
        "How should I move through the site?",
        "How do I get started?",
        "Which build path should I start with?"
      ],
      quickLinks: publicSupportLinks
    };
  }

  if (pathname.startsWith("/contact")) {
    return {
      id: "contact",
      title: "Contact help",
      intro:
        "I can help you choose the right inquiry type for a SaaS project, internal software, an external app, a mobile app, a managed build quote, support, or an agency partnership.",
      suggestions: [
        "Which inquiry type should I pick?",
        "Is this the right place for support?",
        "How do I ask about a build?"
      ],
      quickLinks: publicSupportLinks
    };
  }

  return defaultContext;
}

export function answerPublicHelpQuestion(question: string, pathname: string) {
  const normalized = question.toLowerCase();
  const context = getPublicHelpContext(pathname);

  if (
    normalized.includes("price") ||
    normalized.includes("plan") ||
    normalized.includes("credit") ||
    normalized.includes("upgrade")
  ) {
    return {
      message:
        "Neroa pricing is built around visible capacity: coordinated AI access, active engine limits, monthly Engine Credits, hard caps by default, and clear top-up or upgrade paths for SaaS, internal software, external app, and mobile app builds.",
      quickLinks: pricingLinks
    };
  }

  if (
    normalized.includes("early access") ||
    normalized.includes("waitlist") ||
    normalized.includes("request access") ||
    normalized.includes("request")
  ) {
    return {
      message:
        "Neroa is live. The right next step is to start your build directly, or use Contact if you want help choosing the best SaaS, internal software, or external app path before you begin.",
      quickLinks: gettingStartedLinks
    };
  }

  if (normalized.includes("naroa") || normalized.includes("narua")) {
    return {
      message:
        "Naroa is the core orchestration layer of Neroa. It frames the product direction first, then activates specialist systems only when the work needs deeper validation, build logic, launch support, or operating structure.",
      quickLinks: aiSystemLinks
    };
  }

  if (
    normalized.includes("ai") ||
    normalized.includes("forge") ||
    normalized.includes("atlas") ||
    normalized.includes("nova") ||
    normalized.includes("pulse") ||
    normalized.includes("ops") ||
    normalized.includes("repolink")
  ) {
    return {
      message:
        "The Neroa AI system is intentionally role-based. Naroa orchestrates, Atlas strengthens validation and research, Forge supports build structure, Nova shapes interface direction, Pulse helps launch motion, Ops keeps execution organized, and RepoLink connects system context.",
      quickLinks: aiSystemLinks
    };
  }

  if (
    normalized.includes("support") ||
    normalized.includes("help") ||
    normalized.includes("contact")
  ) {
    return {
      message:
        "For public-site help, the cleanest routes are Contact Us for direct inquiries, Support for guided help paths, and Instructions for the practical walkthrough of how the public site and live build flow work.",
      quickLinks: publicSupportLinks
    };
  }

  if (
    normalized.includes("use case") ||
    normalized.includes("workflow") ||
    normalized.includes("output")
  ) {
    return {
      message:
        "Use-case pages explain how Neroa supports SaaS products, internal software, external apps, and mobile apps, including the outputs, AI stack, and next steps behind each build path.",
      quickLinks: useCaseLinks
    };
  }

  if (normalized.includes("blog") || normalized.includes("article")) {
    return {
      message:
        "The blog explains why Neroa starts with Naroa, how the AI system is coordinated, and how public use-case pages connect back into workspace lanes.",
      quickLinks: blogLinks
    };
  }

  return {
    message: context.intro,
    quickLinks: context.quickLinks
  };
}
