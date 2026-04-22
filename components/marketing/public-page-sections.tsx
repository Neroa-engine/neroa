import type { ReactNode } from "react";
import {
  MarketingInteractiveCardGrid,
  MarketingInteractiveFaqGrid,
  MarketingInteractiveStepGrid,
  type InteractiveFaqItem,
  type InteractiveGuideContext,
  type InteractiveMarketingInfoCard,
  type InteractiveMarketingStep
} from "@/components/marketing/interactive-card-system";
import { PublicActionLink } from "@/components/site/public-action-link";

export type MarketingPageAction = {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
};

export type MarketingInfoCard = InteractiveMarketingInfoCard;

export type MarketingStep = InteractiveMarketingStep;

export type MarketingMetric = {
  label: string;
  value: string;
};

function getActionClassName(tone: MarketingPageAction["tone"]) {
  return tone === "secondary" ? "button-secondary" : "button-primary";
}

export function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SectionHeader({
  eyebrow,
  title,
  summary,
  align = "left"
}: {
  eyebrow: string;
  title: string;
  summary: string;
  align?: "left" | "center";
}) {
  const className = align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-3xl";

  return (
    <div className={`fade-up-soft ${className}`}>
      <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-slate-600">{summary}</p>
    </div>
  );
}

export function PublicPageHero({
  eyebrow,
  title,
  summary,
  primaryAction,
  secondaryAction,
  highlights,
  panelTitle,
  panelSummary,
  panelItems,
  supportingNote,
  metrics,
  panelBadge = "AI-guided path",
  initialAuthenticated
}: {
  eyebrow: string;
  title: string;
  summary: string;
  primaryAction: MarketingPageAction;
  secondaryAction: MarketingPageAction;
  highlights: string[];
  panelTitle: string;
  panelSummary: string;
  panelItems: string[];
  supportingNote?: string;
  metrics?: MarketingMetric[];
  panelBadge?: string;
  initialAuthenticated?: boolean;
}) {
  return (
    <section className="hero-shell">
      <div className="fade-up-soft max-w-3xl">
        <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
          {eyebrow}
        </span>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">{summary}</p>

        <div className="hero-highlight-grid mt-8">
          {highlights.map((item) => (
            <div key={item} className="hero-highlight-card">
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <PublicActionLink
            href={primaryAction.href}
            label={primaryAction.label}
            className={getActionClassName(primaryAction.tone)}
            initialAuthenticated={initialAuthenticated}
          />
          <PublicActionLink
            href={secondaryAction.href}
            label={secondaryAction.label}
            className={getActionClassName(secondaryAction.tone)}
            initialAuthenticated={initialAuthenticated}
          />
        </div>

        {supportingNote ? (
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500">{supportingNote}</p>
        ) : null}
      </div>

      <div className="hero-signal-panel fade-up-soft-delay">
        <div className="signal-orbit" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="premium-pill border-slate-200/80 bg-white/80 text-slate-700">
              {panelTitle}
            </span>
            <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
              {panelBadge}
            </span>
          </div>
          <p className="mt-4 text-base leading-8 text-slate-600">{panelSummary}</p>

          <div className="signal-grid mt-6">
            {panelItems.map((item, index) => (
              <div
                key={item}
                className="signal-item"
              >
                <span className="signal-item-title">Signal 0{index + 1}</span>
                <span className="signal-item-body">{item}</span>
              </div>
            ))}
          </div>

          {metrics?.length ? (
            <div className="comparison-band mt-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="comparison-metric">
                  <span className="comparison-label">{metric.label}</span>
                  <span className="comparison-value">{metric.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function InfoCardGrid({
  items,
  columns = "three",
  guideContext,
  affordanceMode = "icon"
}: {
  items: MarketingInfoCard[];
  columns?: "one" | "two" | "three" | "four";
  guideContext?: InteractiveGuideContext;
  affordanceMode?: "label" | "icon";
}) {
  return (
    <MarketingInteractiveCardGrid
      items={items}
      columns={columns}
      guideContext={guideContext}
      affordanceMode={affordanceMode}
    />
  );
}

export function StepGrid({
  steps,
  guideContext,
  showDescriptionAtRest = true,
  affordanceMode = "icon"
}: {
  steps: MarketingStep[];
  guideContext?: InteractiveGuideContext;
  showDescriptionAtRest?: boolean;
  affordanceMode?: "label" | "icon";
}) {
  return (
    <MarketingInteractiveStepGrid
      steps={steps}
      guideContext={guideContext}
      showDescriptionAtRest={showDescriptionAtRest}
      affordanceMode={affordanceMode}
    />
  );
}

export function FaqSection({
  eyebrow,
  title,
  summary,
  items,
  guideContext
}: {
  eyebrow: string;
  title: string;
  summary: string;
  items: ReadonlyArray<InteractiveFaqItem>;
  guideContext?: InteractiveGuideContext;
}) {
  return (
    <section className="mt-16">
      <SectionHeader eyebrow={eyebrow} title={title} summary={summary} />
      <div className="mt-8">
        <MarketingInteractiveFaqGrid items={items} guideContext={guideContext} />
      </div>
    </section>
  );
}

export function ConversionStrip({
  eyebrow,
  title,
  summary,
  actions,
  aside,
  initialAuthenticated
}: {
  eyebrow: string;
  title: string;
  summary: string;
  actions: MarketingPageAction[];
  aside?: ReactNode;
  initialAuthenticated?: boolean;
}) {
  return (
    <section className="mt-16">
      <div className="section-stage px-6 py-8 sm:px-8 sm:py-10">
        <div className="floating-wash rounded-[38px]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              {eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{summary}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => (
              <PublicActionLink
                key={`${action.href}-${action.label}`}
                href={action.href}
                label={action.label}
                className={getActionClassName(action.tone)}
                initialAuthenticated={initialAuthenticated}
              />
            ))}
          </div>
        </div>

        {aside ? <div className="relative mt-6">{aside}</div> : null}
      </div>
    </section>
  );
}
