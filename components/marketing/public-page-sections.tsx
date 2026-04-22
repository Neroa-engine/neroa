import type { ReactNode } from "react";
import { PublicActionLink } from "@/components/site/public-action-link";

export type MarketingPageAction = {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
};

export type MarketingInfoCard = {
  eyebrow?: string;
  title: string;
  description: string;
  expandedDescription?: string;
  details?: string[];
  footnote?: string;
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

export function InfoCardGrid({
  items,
  columns = "three"
}: {
  items: MarketingInfoCard[];
  columns?: "one" | "two" | "three" | "four";
  guideContext?: unknown;
  affordanceMode?: "label" | "icon";
}) {
  const gridClassName =
    columns === "one"
      ? "grid gap-4"
      : columns === "two"
        ? "grid gap-4 md:grid-cols-2"
        : columns === "four"
          ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={gridClassName}>
      {items.map((item) => (
        <article key={item.title} className="homepage-experience-card micro-glow p-6">
          {item.eyebrow ? (
            <p className="homepage-experience-eyebrow">{item.eyebrow}</p>
          ) : null}
          <h3 className="homepage-experience-title">{item.title}</h3>
          <p className="homepage-experience-copy">{item.description}</p>
          {item.expandedDescription ? (
            <p className="mt-4 text-sm leading-7 text-slate-500">{item.expandedDescription}</p>
          ) : null}
          {item.details?.length ? (
            <ul className="mt-4 grid gap-2 text-sm leading-7 text-slate-600">
              {item.details.map((detail) => (
                <li key={detail} className="rounded-[18px] bg-white/74 px-3 py-2">
                  {detail}
                </li>
              ))}
            </ul>
          ) : null}
          {item.footnote ? (
            <p className="mt-4 text-xs leading-6 text-slate-500">{item.footnote}</p>
          ) : null}
        </article>
      ))}
    </div>
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
    <section className="homepage-close-section">
      <div className="homepage-close-panel section-stage px-6 py-8 sm:px-8 sm:py-10">
        <div className="floating-wash rounded-[38px]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="homepage-close-copy max-w-3xl">
            <p className="homepage-section-eyebrow">{eyebrow}</p>
            <h2 className="homepage-section-title">{title}</h2>
            <p className="homepage-section-summary">{summary}</p>
          </div>

          <div className="homepage-action-row">
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
