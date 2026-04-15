"use client";

import {
  FocusBubbleTrigger,
  type FocusBubbleData
} from "@/components/marketing/focus-bubble-system";
import {
  useAIOnboardingControl,
  type AIOnboardingStep
} from "@/components/onboarding/ai-onboarding-control-provider";

export type InteractiveGuideContext = {
  onboardingStep: AIOnboardingStep;
  intentPrefix?: string;
  assistPrefix?: string;
};

export type InteractiveMarketingInfoCard = {
  title: string;
  description: string;
  eyebrow?: string;
  footnote?: string;
  href?: string;
  ctaLabel?: string;
  expandedDescription?: string;
  details?: string[];
  badge?: string;
};

export type InteractiveMarketingStep = {
  title: string;
  description: string;
  eyebrow?: string;
  expandedDescription?: string;
  details?: string[];
  href?: string;
  ctaLabel?: string;
};

export type InteractiveFaqItem = {
  question: string;
  answer: string;
};

function getGridClassName(columns: "one" | "two" | "three" | "four") {
  return columns === "one"
    ? "grid gap-4"
    : columns === "two"
      ? "grid gap-4 lg:grid-cols-2"
      : columns === "four"
        ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";
}

function normalizeSentence(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function buildAssistMessage(args: {
  title: string;
  description: string;
  expandedDescription?: string;
  details?: string[];
  guideContext?: InteractiveGuideContext;
}) {
  const parts = [
    args.guideContext?.assistPrefix,
    args.expandedDescription ?? args.description,
    args.details?.length ? `Key points: ${args.details.join(", ")}.` : null
  ].filter((item): item is string => Boolean(item && item.trim()));

  return parts.join(" ");
}

function buildWhyItMatters(args: {
  title: string;
  description: string;
  expandedDescription?: string;
  details?: string[];
  footnote?: string;
}) {
  const normalizedFootnote = normalizeSentence(args.footnote);
  if (normalizedFootnote) {
    return normalizedFootnote;
  }

  const details = args.details ?? [];
  if (details.length >= 2) {
    return `${args.title} affects concrete product decisions, from ${details[0].toLowerCase()} to ${details[details.length - 1].toLowerCase()}.`;
  }

  if (details.length === 1) {
    return `${args.title} matters because it shapes ${details[0].toLowerCase()}.`;
  }

  if (args.expandedDescription && args.expandedDescription !== args.description) {
    return `${args.title} changes how the build is scoped, prioritized, and explained to the customer.`;
  }

  return `${args.title} matters because it changes how Neroa guides the next decision instead of leaving the topic as surface-level marketing copy.`;
}

function createBubbleId(prefix: string, title: string, index: number) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${prefix}:${slug || index}:${index}`;
}

function useGuidedCardSync() {
  const { guidedMode, syncCardInteraction } = useAIOnboardingControl();

  function syncIfGuided(args: {
    title: string;
    description: string;
    expandedDescription?: string;
    details?: string[];
    guideContext?: InteractiveGuideContext;
  }) {
    if (!guidedMode || !args.guideContext) {
      return;
    }

    const userIntent = args.guideContext.intentPrefix
      ? `${args.guideContext.intentPrefix}: ${args.title}`
      : `Explore ${args.title}`;

    syncCardInteraction({
      onboardingStep: args.guideContext.onboardingStep,
      userIntent,
      assistMessage: buildAssistMessage(args)
    });
  }

  return {
    syncIfGuided
  };
}

function getCardFrameClassName(isActive: boolean) {
  return `floating-plane micro-glow overflow-hidden rounded-[30px] p-0 transition duration-300 ${
    isActive
      ? "border-cyan-300/48 shadow-[0_30px_76px_-34px_rgba(14,165,233,0.46)]"
      : "hover:-translate-y-1 hover:border-cyan-300/28"
  }`;
}

function buildInfoBubble(args: {
  id: string;
  item: InteractiveMarketingInfoCard;
}): FocusBubbleData {
  const { item, id } = args;
  const expandedDescription = item.expandedDescription ?? item.description;

  return {
    id,
    eyebrow: item.eyebrow ?? "Focus topic",
    title: item.title,
    summary: expandedDescription,
    sections: [
      {
        label: "What this means",
        body: expandedDescription
      },
      {
        label: "How it affects you",
        body: buildWhyItMatters({
          title: item.title,
          description: item.description,
          expandedDescription: item.expandedDescription,
          details: item.details,
          footnote: item.footnote
        })
      }
    ],
    details: item.details,
    footnote: normalizeSentence(item.footnote) ?? undefined,
    actions: item.href
      ? [
          {
            href: item.href,
            label: item.ctaLabel ?? "Open",
            tone: "primary"
          }
        ]
      : undefined,
    returnLabel: "Return"
  };
}

function buildStepBubble(args: {
  id: string;
  step: InteractiveMarketingStep;
  index: number;
}): FocusBubbleData {
  const { step, id, index } = args;
  const expandedDescription = step.expandedDescription ?? step.description;

  return {
    id,
    eyebrow: step.eyebrow ?? `Step 0${index + 1}`,
    title: step.title,
    summary: step.description,
    sections: [
      {
        label: "What happens here",
        body: expandedDescription
      },
      {
        label: "Why this stage matters",
        body: buildWhyItMatters({
          title: step.title,
          description: step.description,
          expandedDescription: step.expandedDescription,
          details: step.details
        })
      }
    ],
    details: step.details,
    actions: step.href
      ? [
          {
            href: step.href,
            label: step.ctaLabel ?? "Open step",
            tone: "primary"
          }
        ]
      : undefined,
    returnLabel: "Return"
  };
}

function buildFaqBubble(args: {
  id: string;
  item: InteractiveFaqItem;
}): FocusBubbleData {
  return {
    id: args.id,
    eyebrow: "FAQ",
    title: args.item.question,
    summary: args.item.answer,
    sections: [
      {
        label: "Direct answer",
        body: args.item.answer
      },
      {
        label: "Why this comes up",
        body: "This question usually appears when someone is trying to understand pace, scope, support, or what happens next before they commit to a build path."
      }
    ],
    returnLabel: "Return"
  };
}

function InteractiveCard({
  item,
  index,
  guideContext
}: {
  item: InteractiveMarketingInfoCard;
  index: number;
  guideContext?: InteractiveGuideContext;
}) {
  const { syncIfGuided } = useGuidedCardSync();
  const details = item.details ?? [];
  const bubble = buildInfoBubble({
    id: createBubbleId("info-card", item.title, index),
    item
  });

  return (
    <FocusBubbleTrigger
      bubble={bubble}
      onOpen={() =>
        syncIfGuided({
          title: item.title,
          description: item.description,
          expandedDescription: item.expandedDescription,
          details,
          guideContext
        })
      }
    >
      {({ isActive, open }) => (
        <article className={getCardFrameClassName(isActive)}>
          <div className="floating-wash rounded-[30px]" />
          <div className="relative">
            <button
              type="button"
              onClick={open}
              aria-haspopup="dialog"
              className="w-full px-6 py-6 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-5 h-px w-16 bg-gradient-to-r from-cyan-500/45 to-violet-500/30" />
                  {item.eyebrow ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                      {item.eyebrow}
                    </p>
                  ) : null}
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {item.badge ? (
                    <span className="premium-pill border-slate-200/80 bg-white/80 text-slate-600">
                      {item.badge}
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex min-h-10 min-w-[5.5rem] items-center justify-center rounded-full border px-4 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                      isActive
                        ? "border-cyan-300/35 bg-cyan-50/90 text-cyan-700"
                        : "border-slate-200/75 bg-white/82 text-slate-500"
                    }`}
                  >
                    {isActive ? "Focused" : "Open"}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </article>
      )}
    </FocusBubbleTrigger>
  );
}

function InteractiveStepCard({
  step,
  index,
  guideContext
}: {
  step: InteractiveMarketingStep;
  index: number;
  guideContext?: InteractiveGuideContext;
}) {
  const { syncIfGuided } = useGuidedCardSync();
  const details = step.details ?? [];
  const bubble = buildStepBubble({
    id: createBubbleId("step-card", step.title, index),
    step,
    index
  });

  return (
    <FocusBubbleTrigger
      bubble={bubble}
      onOpen={() =>
        syncIfGuided({
          title: step.title,
          description: step.description,
          expandedDescription: step.expandedDescription,
          details,
          guideContext
        })
      }
    >
      {({ isActive, open }) => (
        <article
          className={`floating-plane micro-glow overflow-hidden rounded-[28px] p-0 transition duration-300 ${
            isActive
              ? "border-cyan-300/48 shadow-[0_30px_76px_-34px_rgba(14,165,233,0.46)]"
              : "hover:-translate-y-1 hover:border-cyan-300/28"
          }`}
        >
          <div className="floating-wash rounded-[28px]" />
          <div className="relative">
            <button
              type="button"
              onClick={open}
              aria-haspopup="dialog"
              className="w-full px-5 py-5 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
                    {step.eyebrow ?? `Step 0${index + 1}`}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
                <span
                  className={`inline-flex min-h-10 min-w-[5.5rem] items-center justify-center rounded-full border px-4 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    isActive
                      ? "border-cyan-300/35 bg-cyan-50/90 text-cyan-700"
                      : "border-slate-200/75 bg-white/82 text-slate-500"
                  }`}
                >
                  {isActive ? "Focused" : "Open"}
                </span>
              </div>
            </button>
          </div>
        </article>
      )}
    </FocusBubbleTrigger>
  );
}

function InteractiveFaqCard({
  item,
  index,
  guideContext
}: {
  item: InteractiveFaqItem;
  index: number;
  guideContext?: InteractiveGuideContext;
}) {
  const { syncIfGuided } = useGuidedCardSync();
  const bubble = buildFaqBubble({
    id: createBubbleId("faq-card", item.question, index),
    item
  });

  return (
    <FocusBubbleTrigger
      bubble={bubble}
      onOpen={() =>
        syncIfGuided({
          title: item.question,
          description: item.answer,
          guideContext
        })
      }
    >
      {({ isActive, open }) => (
        <article
          className={`floating-plane micro-glow overflow-hidden rounded-[28px] p-0 transition duration-300 ${
            isActive
              ? "border-cyan-300/48 shadow-[0_30px_76px_-34px_rgba(14,165,233,0.46)]"
              : "hover:-translate-y-1 hover:border-cyan-300/28"
          }`}
        >
          <div className="floating-wash rounded-[28px]" />
          <div className="relative">
            <button
              type="button"
              onClick={open}
              aria-haspopup="dialog"
              className="flex w-full items-start justify-between gap-4 px-6 py-6 text-left"
            >
              <h3 className="text-xl font-semibold tracking-tight text-slate-950">{item.question}</h3>
              <span
                className={`inline-flex min-h-10 min-w-[5.5rem] flex-shrink-0 items-center justify-center rounded-full border px-4 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                  isActive
                    ? "border-cyan-300/35 bg-cyan-50/90 text-cyan-700"
                    : "border-slate-200/75 bg-white/82 text-slate-500"
                }`}
              >
                {isActive ? "Focused" : "Open"}
              </span>
            </button>
          </div>
        </article>
      )}
    </FocusBubbleTrigger>
  );
}

export function MarketingInteractiveCardGrid({
  items,
  columns = "three",
  guideContext
}: {
  items: InteractiveMarketingInfoCard[];
  columns?: "one" | "two" | "three" | "four";
  guideContext?: InteractiveGuideContext;
}) {
  return (
    <div className={getGridClassName(columns)}>
      {items.map((item, index) => (
        <InteractiveCard
          key={`${item.title}:${index}`}
          item={item}
          index={index}
          guideContext={guideContext}
        />
      ))}
    </div>
  );
}

export function MarketingInteractiveStepGrid({
  steps,
  guideContext
}: {
  steps: InteractiveMarketingStep[];
  guideContext?: InteractiveGuideContext;
}) {
  const className =
    steps.length >= 6
      ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      : steps.length === 5
        ? "grid gap-4 md:grid-cols-2 xl:grid-cols-5"
        : steps.length === 4
          ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={className}>
      {steps.map((step, index) => (
        <InteractiveStepCard
          key={`${step.title}:${index}`}
          step={step}
          index={index}
          guideContext={guideContext}
        />
      ))}
    </div>
  );
}

export function MarketingInteractiveFaqGrid({
  items,
  guideContext
}: {
  items: ReadonlyArray<InteractiveFaqItem>;
  guideContext?: InteractiveGuideContext;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item, index) => (
        <InteractiveFaqCard
          key={`${item.question}:${index}`}
          item={item}
          index={index}
          guideContext={guideContext}
        />
      ))}
    </div>
  );
}
