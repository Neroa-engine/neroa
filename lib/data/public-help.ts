export type PublicInquiryType =
  | "saas-project"
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
    description:
      "Talk to NEROA about scoping, validating, budgeting, and building a serious SaaS product."
  },
  {
    value: "agency-partner",
    label: "Agency / builder partnership",
    description:
      "Discuss builder partnerships, client-delivery workflows, or agency use of NEROA."
  },
  {
    value: "managed-build-quote",
    label: "Managed build quote",
    description:
      "Request a scoped quote for NEROA or a partner team to help execute, QA, deploy, and manage the software."
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
  { label: "Contact support", href: "/contact?type=support" },
  { label: "Pricing", href: "/pricing" },
  { label: "Instructions", href: "/instructions" }
];

const pricingLinks: PublicQuickLink[] = [
  { label: "DIY Pricing", href: "/pricing/diy" },
  { label: "Managed Pricing", href: "/pricing/managed" },
  { label: "Compare build paths", href: "/pricing" },
  { label: "Start Managed Build", href: "/start" }
];

const gettingStartedLinks: PublicQuickLink[] = [
  { label: "Start your build", href: "/start" },
  { label: "What is SaaS?", href: "/what-is-saas" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Pricing", href: "/pricing" }
];

const aiSystemLinks: PublicQuickLink[] = [
  { label: "Neroa", href: "/system/narua" },
  { label: "AI Systems", href: "/system/ai" },
  { label: "Support", href: "/support" }
];

const useCaseLinks: PublicQuickLink[] = [
  { label: "Use Cases", href: "/use-cases" },
  { label: "What is SaaS?", href: "/what-is-saas" },
  { label: "Compare build paths", href: "/pricing" }
];

const blogLinks: PublicQuickLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "What is SaaS?", href: "/what-is-saas" },
  { label: "Start your build", href: "/start" }
];

const defaultContext: PublicHelpContext = {
  id: "default",
  title: "Neroa site guide",
  intro:
    "I can explain how NEROA helps shape SaaS products, compare DIY versus Managed, and point you to the right public page or support path.",
  suggestions: [
    "Which build path fits me?",
    "How do I get started?",
    "Where can I get support?"
  ],
  quickLinks: [
    { label: "What is SaaS?", href: "/what-is-saas" },
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
        "I can explain DIY versus Managed, monthly Engine Credits, realistic build pace, and when a project should move out of self-serve execution.",
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
        "I can explain how to start your build, where the SaaS path begins, and which page to use before you move into the guided builder.",
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
      id: "neroa",
      title: "Neroa guide",
      intro:
        "I can explain Neroa's role as the orchestration layer that helps turn a SaaS idea into the next useful planning or build decision.",
      suggestions: [
        "What does Neroa actually do?",
        "When do specialist AIs activate?",
        "How does Neroa help with a build?"
      ],
      quickLinks: aiSystemLinks
    };
  }

  if (pathname.startsWith("/system") || pathname.startsWith("/ai-system")) {
    return {
      id: "ai-system",
      title: "AI system help",
      intro:
        "I can explain how Neroa leads the product flow and how the supporting systems widen the work only when the build needs more depth.",
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
        "I can explain what NEROA helps build, how the path differs between DIY and Managed, and which page should come next before you start.",
      suggestions: [
        "What does NEROA help build?",
        "Should I use DIY or Managed?",
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
        "I can summarize the article, connect it back to the product, and point you to the next page if you want SaaS education, pricing clarity, or the live build flow.",
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
        "I can help you open the site guide, route you to the right support path, or point you to pricing and contact when you need a real answer.",
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
        "I can help you move through the public site, understand the live product flow, and choose the right SaaS, pricing, or support page next.",
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
        "I can help you choose the right inquiry type for a SaaS project, a managed build quote, a partnership conversation, or a support request.",
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
        "NEROA pricing is built around visible capacity. DIY shows monthly Engine Credits and realistic pacing. Managed is the better path when scope, urgency, or support needs outgrow self-serve execution.",
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
        "NEROA is live. The right next step is to start your build directly, or use Contact if you want help choosing between DIY and Managed before you begin.",
      quickLinks: gettingStartedLinks
    };
  }

  if (normalized.includes("neroa") || normalized.includes("naroa") || normalized.includes("narua")) {
    return {
      message:
        "Neroa is the core orchestration layer of NEROA. It helps frame the SaaS, tighten the next decision, and keep the product path structured before the build widens.",
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
        "The NEROA system is intentionally guided instead of chat-only. Neroa leads the path, and the supporting systems widen the work only when build planning, research, launch support, or operations need more depth.",
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
        "For public-site help, the cleanest routes are Support for guided help, Contact for direct questions, and Instructions when you want the practical walkthrough before you start.",
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
        "Use Cases explains what NEROA helps build, how the path differs, and when DIY or Managed is the better fit before you enter the guided builder.",
      quickLinks: useCaseLinks
    };
  }

  if (normalized.includes("blog") || normalized.includes("article")) {
    return {
      message:
        "The blog explains SaaS planning, why Neroa leads the product flow, and how build-path clarity affects scope, budget, and execution decisions.",
      quickLinks: blogLinks
    };
  }

  return {
    message: context.intro,
    quickLinks: context.quickLinks
  };
}
