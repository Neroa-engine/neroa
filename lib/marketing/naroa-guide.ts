export type HomepageGuideSectionId =
  | "what-neroa-is"
  | "diy-vs-managed"
  | "budget-engine-credits"
  | "build-categories"
  | "guided-build-path"
  | "proof-trust"
  | "final-decision";

export type HomepageGuideStep = {
  id: HomepageGuideSectionId;
  eyebrow: string;
  title: string;
  summary: string;
  detail: string;
  sectionLabel: string;
};

export type GuideDockPlacement = "right" | "left" | "bottom" | "top" | "floating";

export type GuideDockPosition = {
  placement: GuideDockPlacement;
  bubbleTop: number;
  bubbleLeft: number;
  bubbleWidth: number;
  bubbleMaxHeight: number;
  avatarTop: number;
  avatarLeft: number;
};

export type GuideQuickAction = {
  label: string;
  href: string;
};

export type GuidePromptResolution = {
  message: string;
  actions: GuideQuickAction[];
};

export const homepageGuideSteps: HomepageGuideStep[] = [
  {
    id: "what-neroa-is",
    eyebrow: "Step 1",
    title: "What Neroa is",
    summary:
      "Neroa is an AI-powered product build system that guides software from idea to scope, MVP, budget, build, and launch.",
    detail:
      "This opening section explains the core promise, the kinds of products Neroa supports, and why the experience is more structured than generic AI prompting.",
    sectionLabel: "Hero"
  },
  {
    id: "diy-vs-managed",
    eyebrow: "Step 2",
    title: "DIY versus Managed Build",
    summary:
      "DIY is best when you want budget control and monthly pacing. Managed Build is best when you want Neroa to help carry execution through staged checkpoints.",
    detail:
      "This choice sets the operating model. One path is paced by monthly Engine Credits. The other adds more direct execution support, visibility, and launch coordination.",
    sectionLabel: "Path choice"
  },
  {
    id: "budget-engine-credits",
    eyebrow: "Step 3",
    title: "Budget and Engine Credits",
    summary:
      "Engine Credits define guided build capacity. You can move slowly inside plan limits or accelerate intentionally with more credits or a stronger path.",
    detail:
      "Neroa makes pace visible instead of pretending one subscription includes unlimited build labor. That keeps scope, timing, and budget easier to trust.",
    sectionLabel: "Budget logic"
  },
  {
    id: "build-categories",
    eyebrow: "Step 4",
    title: "What Neroa helps build",
    summary:
      "Neroa supports SaaS, internal software, external apps, and mobile apps through the same guided build system.",
    detail:
      "These categories help visitors quickly see whether the system matches the kind of software they want to launch.",
    sectionLabel: "Build categories"
  },
  {
    id: "guided-build-path",
    eyebrow: "Step 5",
    title: "How the guided path works",
    summary:
      "The flow moves through Strategy, Scope, MVP, Budget, Build, Launch, and Operate so decisions become more precise before execution gets expensive.",
    detail:
      "This is where Neroa feels different from a static page. The product is designed to guide the sequence, not just answer questions in isolation.",
    sectionLabel: "Guided flow"
  },
  {
    id: "proof-trust",
    eyebrow: "Step 6",
    title: "Why customers trust the process",
    summary:
      "Neroa emphasizes budget-aware planning, structured scope, staged visibility, and a clean path from DIY into managed support when the work gets heavier.",
    detail:
      "This section is about realism. The goal is not to oversell magic. It is to show a more understandable path to real software outcomes.",
    sectionLabel: "Trust"
  },
  {
    id: "final-decision",
    eyebrow: "Step 7",
    title: "Make the next decision",
    summary:
      "If you already know your path, jump into DIY or Managed Build. If not, Naroa can point you to the best next page to reduce uncertainty.",
    detail:
      "This is the transition from guided understanding into action. The goal is to leave the visitor with a clear next move instead of more ambiguity.",
    sectionLabel: "Final CTA"
  }
] as const;

export const homepageGuidePromptSuggestions = [
  "Which plan fits my budget?",
  "Should I start DIY or Managed Build?",
  "Show me an example first"
] as const;

export const homepageGuideStorageKeys = {
  preference: "neroa:naroa-guide:preference",
  voiceEnabled: "neroa:naroa-guide:voice"
} as const;

export const guideAutoPromptDelayMs = 24000;
export const guideScrollTriggerRatio = 0.22;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calculateGuideDockPosition(args: {
  rect: DOMRect | null;
  viewportWidth: number;
  viewportHeight: number;
  bubbleWidth: number;
  bubbleHeight: number;
}): GuideDockPosition {
  const sideInset = args.viewportWidth < 768 ? 14 : 24;
  const topInset = args.viewportWidth < 768 ? 78 : 108;
  const bottomInset = args.viewportWidth < 768 ? 18 : 24;
  const avatarSize = args.viewportWidth < 768 ? 62 : 72;
  const gap = args.viewportWidth < 768 ? 12 : 16;
  const bubbleWidth = Math.min(args.bubbleWidth, Math.max(args.viewportWidth - sideInset * 2, 260));
  const bubbleHeight = Math.min(
    args.bubbleHeight,
    Math.max(args.viewportHeight - topInset - bottomInset, 280)
  );

  if (!args.rect) {
    const bubbleLeft = clamp(
      args.viewportWidth - bubbleWidth - sideInset,
      sideInset,
      args.viewportWidth - bubbleWidth - sideInset
    );
    const bubbleTop = clamp(
      args.viewportHeight - bubbleHeight - avatarSize - gap - bottomInset,
      topInset,
      args.viewportHeight - bubbleHeight - bottomInset
    );

    return {
      placement: "floating" as const,
      bubbleTop,
      bubbleLeft,
      bubbleWidth,
      bubbleMaxHeight: Math.max(args.viewportHeight - topInset - bottomInset, 220),
      avatarTop: clamp(
        bubbleTop + bubbleHeight - avatarSize * 0.58,
        topInset,
        args.viewportHeight - avatarSize - bottomInset
      ),
      avatarLeft: clamp(
        bubbleLeft + bubbleWidth - avatarSize * 0.64,
        sideInset,
        args.viewportWidth - avatarSize - sideInset
      )
    };
  }

  const rect = args.rect;
  const availableRight = args.viewportWidth - rect.right - sideInset;
  const availableLeft = rect.left - sideInset;
  const availableBelow = args.viewportHeight - rect.bottom - bottomInset;
  const availableAbove = rect.top - topInset;

  if (args.viewportWidth >= 1080 && availableRight >= bubbleWidth + avatarSize * 0.4 + gap) {
    const bubbleLeft = clamp(rect.right + gap, sideInset, args.viewportWidth - bubbleWidth - sideInset);
    const bubbleTop = clamp(
      rect.top + rect.height * 0.5 - bubbleHeight * 0.5,
      topInset,
      args.viewportHeight - bubbleHeight - bottomInset
    );

    return {
      placement: "right",
      bubbleTop,
      bubbleLeft,
      bubbleWidth,
      bubbleMaxHeight: Math.max(args.viewportHeight - topInset - bottomInset, 220),
      avatarTop: clamp(
        bubbleTop + Math.min(24, bubbleHeight * 0.14),
        topInset,
        args.viewportHeight - avatarSize - bottomInset
      ),
      avatarLeft: clamp(
        bubbleLeft - avatarSize * 0.38,
        sideInset,
        args.viewportWidth - avatarSize - sideInset
      )
    };
  }

  if (args.viewportWidth >= 1080 && availableLeft >= bubbleWidth + avatarSize * 0.4 + gap) {
    const bubbleLeft = clamp(rect.left - bubbleWidth - gap, sideInset, args.viewportWidth - bubbleWidth - sideInset);
    const bubbleTop = clamp(
      rect.top + rect.height * 0.5 - bubbleHeight * 0.5,
      topInset,
      args.viewportHeight - bubbleHeight - bottomInset
    );

    return {
      placement: "left",
      bubbleTop,
      bubbleLeft,
      bubbleWidth,
      bubbleMaxHeight: Math.max(args.viewportHeight - topInset - bottomInset, 220),
      avatarTop: clamp(
        bubbleTop + Math.min(24, bubbleHeight * 0.14),
        topInset,
        args.viewportHeight - avatarSize - bottomInset
      ),
      avatarLeft: clamp(
        bubbleLeft + bubbleWidth - avatarSize * 0.62,
        sideInset,
        args.viewportWidth - avatarSize - sideInset
      )
    };
  }

  if (availableBelow >= bubbleHeight + avatarSize * 0.45 + gap) {
    const bubbleTop = clamp(rect.bottom + gap, topInset, args.viewportHeight - bubbleHeight - bottomInset);
    const bubbleLeft = clamp(
      rect.left + rect.width * 0.5 - bubbleWidth * 0.5,
      sideInset,
      args.viewportWidth - bubbleWidth - sideInset
    );

    return {
      placement: "bottom",
      bubbleTop,
      bubbleLeft,
      bubbleWidth,
      bubbleMaxHeight: Math.max(args.viewportHeight - topInset - bottomInset, 220),
      avatarTop: clamp(
        bubbleTop - avatarSize * 0.36,
        topInset,
        args.viewportHeight - avatarSize - bottomInset
      ),
      avatarLeft: clamp(
        bubbleLeft + Math.min(58, bubbleWidth * 0.22),
        sideInset,
        args.viewportWidth - avatarSize - sideInset
      )
    };
  }

  if (availableAbove >= bubbleHeight + avatarSize * 0.45 + gap) {
    const bubbleTop = clamp(rect.top - bubbleHeight - gap, topInset, args.viewportHeight - bubbleHeight - bottomInset);
    const bubbleLeft = clamp(
      rect.left + rect.width * 0.5 - bubbleWidth * 0.5,
      sideInset,
      args.viewportWidth - bubbleWidth - sideInset
    );

    return {
      placement: "top",
      bubbleTop,
      bubbleLeft,
      bubbleWidth,
      bubbleMaxHeight: Math.max(args.viewportHeight - topInset - bottomInset, 220),
      avatarTop: clamp(
        bubbleTop + bubbleHeight - avatarSize * 0.66,
        topInset,
        args.viewportHeight - avatarSize - bottomInset
      ),
      avatarLeft: clamp(
        bubbleLeft + Math.min(58, bubbleWidth * 0.22),
        sideInset,
        args.viewportWidth - avatarSize - sideInset
      )
    };
  }

  const floatingBubbleLeft = clamp(
    args.viewportWidth - bubbleWidth - sideInset,
    sideInset,
    args.viewportWidth - bubbleWidth - sideInset
  );
  const floatingBubbleTop = clamp(
    args.viewportHeight - bubbleHeight - avatarSize - gap - bottomInset,
    topInset,
    args.viewportHeight - bubbleHeight - bottomInset
  );

  return {
    placement: "floating",
    bubbleTop: floatingBubbleTop,
    bubbleLeft: floatingBubbleLeft,
    bubbleWidth,
    bubbleMaxHeight: Math.max(args.viewportHeight - topInset - bottomInset, 220),
    avatarTop: clamp(
      floatingBubbleTop + bubbleHeight - avatarSize * 0.58,
      topInset,
      args.viewportHeight - avatarSize - bottomInset
    ),
    avatarLeft: clamp(
      floatingBubbleLeft + bubbleWidth - avatarSize * 0.64,
      sideInset,
      args.viewportWidth - avatarSize - sideInset
    )
  };
}

export function resolveGuidePrompt(input: string): GuidePromptResolution {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return {
      message:
        "If you want a fast recommendation, the best starting points are pricing for budget questions, Managed Build for execution help, and Example Build if you want to see the system in motion first.",
      actions: [
        { label: "Understand Pricing", href: "/pricing" },
        { label: "See an Example Build", href: "/example-build" },
        { label: "Start DIY Build", href: "/start?resume=guided" }
      ]
    };
  }

  if (
    normalized.includes("price") ||
    normalized.includes("budget") ||
    normalized.includes("credit") ||
    normalized.includes("plan")
  ) {
    return {
      message:
        "Budget questions usually mean you should compare DIY pricing first. That will show monthly Engine Credits, build pace, and when a managed path starts to make more sense.",
      actions: [
        { label: "Understand Pricing", href: "/pricing" },
        { label: "Open DIY Pricing", href: "/pricing/diy" },
        { label: "See an Example Build", href: "/example-build" }
      ]
    };
  }

  if (
    normalized.includes("managed") ||
    normalized.includes("team") ||
    normalized.includes("quote") ||
    normalized.includes("done for you") ||
    normalized.includes("help build")
  ) {
    return {
      message:
        "If you want stronger execution help, the managed path is the right next step. That page explains staged approvals, visibility, and how Neroa keeps the build from becoming a black box.",
      actions: [
        { label: "Explore Managed Build", href: "/managed-build" },
        { label: "View Managed Pricing", href: "/pricing/managed" },
        { label: "Request a Quote", href: "/contact?type=managed-build-quote" }
      ]
    };
  }

  if (
    normalized.includes("example") ||
    normalized.includes("demo") ||
    normalized.includes("show me")
  ) {
    return {
      message:
        "The interactive Example Build is the fastest way to see how Neroa frames a product before you commit to a path.",
      actions: [
        { label: "See an Example Build", href: "/example-build" },
        { label: "Start DIY Build", href: "/start?resume=guided" },
        { label: "Explore Managed Build", href: "/managed-build" }
      ]
    };
  }

  if (
    normalized.includes("saas") ||
    normalized.includes("internal") ||
    normalized.includes("mobile") ||
    normalized.includes("app") ||
    normalized.includes("portal")
  ) {
    return {
      message:
        "If you are still deciding what kind of product fits, the build-category and use-case pages will narrow the path quickly before you enter the guided builder.",
      actions: [
        { label: "Explore Use Cases", href: "/use-cases" },
        { label: "Start DIY Build", href: "/start?resume=guided" },
        { label: "See an Example Build", href: "/example-build" }
      ]
    };
  }

  return {
    message:
      "The clearest next move is to enter the guided builder if you already know you want to build, or open pricing if you still need to compare the pace and support models.",
    actions: [
      { label: "Start DIY Build", href: "/start?resume=guided" },
      { label: "Understand Pricing", href: "/pricing" },
      { label: "Explore Managed Build", href: "/managed-build" }
    ]
  };
}
