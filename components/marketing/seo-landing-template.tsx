import { MarketingInfoShell } from "@/components/layout/page-shells";
import {
  ConversionStrip,
  FaqSection,
  InfoCardGrid,
  JsonLdScript,
  PublicPageHero,
  SectionHeader
} from "@/components/marketing/public-page-sections";

type Action = {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
};

type Card = {
  title: string;
  description: string;
  eyebrow?: string;
  footnote?: string;
  href?: string;
  ctaLabel?: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type SeoLandingTemplateProps = {
  ctaHref?: string;
  ctaLabel?: string;
  schema: unknown;
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    primaryAction: Action;
    secondaryAction: Action;
    highlights: string[];
    panelTitle: string;
    panelSummary: string;
    panelItems: string[];
  };
  coreSection: {
    eyebrow: string;
    title: string;
    summary: string;
    cards: Card[];
  };
  fitSection: {
    eyebrow: string;
    title: string;
    summary: string;
    cards: Card[];
  };
  faqSection: {
    eyebrow: string;
    title: string;
    summary: string;
    items: FaqItem[];
  };
  finalCta: {
    eyebrow: string;
    title: string;
    summary: string;
    actions: Action[];
  };
};

export function SeoLandingTemplate({
  ctaHref = "/start",
  ctaLabel = "Start DIY Build",
  schema,
  hero,
  coreSection,
  fitSection,
  faqSection,
  finalCta
}: SeoLandingTemplateProps) {
  return (
    <MarketingInfoShell ctaHref={ctaHref} ctaLabel={ctaLabel} brandVariant="prominent">
      <JsonLdScript data={schema} />

      <section className="mx-auto max-w-6xl">
        <PublicPageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          summary={hero.summary}
          primaryAction={hero.primaryAction}
          secondaryAction={hero.secondaryAction}
          highlights={hero.highlights}
          panelTitle={hero.panelTitle}
          panelSummary={hero.panelSummary}
          panelItems={hero.panelItems}
        />
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow={coreSection.eyebrow}
          title={coreSection.title}
          summary={coreSection.summary}
        />
        <div className="mt-8">
          <InfoCardGrid
            items={coreSection.cards}
            guideContext={{ onboardingStep: "public-seo-landing", intentPrefix: "Explore core landing card" }}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow={fitSection.eyebrow}
          title={fitSection.title}
          summary={fitSection.summary}
        />
        <div className="mt-8">
          <InfoCardGrid
            items={fitSection.cards}
            guideContext={{ onboardingStep: "public-seo-landing", intentPrefix: "Review best-fit landing card" }}
          />
        </div>
      </section>

      <FaqSection
        eyebrow={faqSection.eyebrow}
        title={faqSection.title}
        summary={faqSection.summary}
        items={faqSection.items}
        guideContext={{ onboardingStep: "public-seo-landing", intentPrefix: "Review landing FAQ" }}
      />

      <ConversionStrip
        eyebrow={finalCta.eyebrow}
        title={finalCta.title}
        summary={finalCta.summary}
        actions={finalCta.actions}
      />
    </MarketingInfoShell>
  );
}
