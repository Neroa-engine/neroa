import type { Metadata } from "next";

export type MarketingFaqItem = {
  question: string;
  answer: string;
};

type PublicMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function buildPublicMetadata({
  title,
  description,
  path,
  keywords = []
}: PublicMetadataOptions): Metadata {
  const canonicalUrl = `https://neroa.io${path}`;

  return {
    metadataBase: new URL("https://neroa.io"),
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Neroa",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export function buildFaqSchema(items: MarketingFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  } as const;
}

export function buildWebPageSchema({
  name,
  description,
  path
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `https://neroa.io${path}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Neroa",
      url: "https://neroa.io"
    }
  } as const;
}
