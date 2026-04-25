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
  { label: "Start planning", href: "/start" },
  { label: "Open projects", href: "/projects" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact support", href: "/contact?type=support" }
];

const pricingLinks: PublicQuickLink[] = [
  { label: "Compare pricing", href: "/pricing" },
  { label: "Start planning", href: "/start" },
  { label: "Open projects", href: "/projects" },
  { label: "Contact support", href: "/contact?type=support" }
];

const gettingStartedLinks: PublicQuickLink[] = [
  { label: "Start planning", href: "/start" },
  { label: "Compare pricing", href: "/pricing" },
  { label: "Open projects", href: "/projects" },
  { label: "Contact support", href: "/contact?type=support" }
];

const aiSystemLinks: PublicQuickLink[] = [
  { label: "Start planning", href: "/start" },
  { label: "Compare pricing", href: "/pricing" },
  { label: "Contact support", href: "/contact?type=support" }
];

const useCaseLinks: PublicQuickLink[] = [
  { label: "Start planning", href: "/start" },
  { label: "Compare pricing", href: "/pricing" },
  { label: "Contact support", href: "/contact?type=support" }
];

const blogLinks: PublicQuickLink[] = [
  { label: "Start planning", href: "/start" },
  { label: "Compare pricing", href: "/pricing" },
  { label: "Contact support", href: "/contact?type=support" }
];

const defaultContext: PublicHelpContext = {
  id: "default",
  title: "Neroa site guide",
  intro:
    "I can explain how NEROA helps shape a software product path, compare the current planning routes, and point you to the right live page or support handoff.",
  suggestions: [
    "Which build path fits me?",
    "How do I get started?",
    "Where can I get support?"
  ],
  quickLinks: [
    { label: "Start planning", href: "/start" },
    { label: "Pricing", href: "/pricing" },
    { label: "Open projects", href: "/projects" }
  ]
};

export function getPublicHelpContext(pathname: string): PublicHelpContext {
  if (pathname.startsWith("/pricing")) {
    return {
      id: "pricing",
      title: "Pricing help",
      intro:
        "I can explain the planning paths, monthly Engine Credits, realistic build pace, and when a project should move beyond self-serve execution.",
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
        "I can explain how to start planning, where the live product path begins, and which current page should come next before you move into the builder.",
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
        "I can explain what NEROA helps build, how the planning path changes with scope, and which current route should come next before you start.",
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
        "I can summarize the article, connect it back to the current product flow, and point you to the right live page for planning, pricing, or support.",
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
        "I can help you choose the cleanest support path, route you to the contact form, or point you to pricing and the live planning flow when you need a clear next step.",
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
        "I can help you move through the current public site, understand the live product flow, and choose the right planning, pricing, or support route next.",
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
        "NEROA is live. The right next step is to start planning directly, or use Contact if you want help choosing between DIY and Managed before you begin.",
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
        "For public-site help, the cleanest routes are Contact for direct questions, Pricing for plan clarity, and Start planning when you are ready to move.",
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
        "NEROA helps shape SaaS and software product paths before execution. The clearest next move is to start planning or review pricing if you still need to compare support levels.",
      quickLinks: useCaseLinks
    };
  }

  if (normalized.includes("blog") || normalized.includes("article")) {
    return {
      message:
        "The public experience now stays focused on planning, pricing, and the guided start, so the fastest next step is to enter the planning flow or compare the pricing paths.",
      quickLinks: blogLinks
    };
  }

  return {
    message: context.intro,
    quickLinks: context.quickLinks
  };
}
