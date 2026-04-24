import { launchReadyUseCaseSlugs } from "@/lib/data/public-launch";
import { useCaseDetailPages } from "@/lib/use-case-detail-pages";
import type { UseCasePageSummary } from "@/lib/use-case-types";

export * from "@/lib/use-case-types";
export { useCaseDetailPages } from "@/lib/use-case-detail-pages";

export const useCasePages: UseCasePageSummary[] = useCaseDetailPages.map((page) => ({
  slug: page.slug,
  title: page.title,
  eyebrow: page.eyebrow,
  summary: page.summary
}));

export const launchReadyUseCasePages: UseCasePageSummary[] = useCasePages.filter((page) =>
  launchReadyUseCaseSlugs.includes(page.slug as (typeof launchReadyUseCaseSlugs)[number])
);

export function getUseCasePage(slug: string) {
  return (
    useCaseDetailPages.find((page) => page.slug === slug) ??
    useCaseDetailPages.find((page) => page.aliases?.includes(slug))
  );
}

export function getUseCaseStaticParams() {
  return useCaseDetailPages.flatMap((page) => [
    { slug: page.slug },
    ...(page.aliases ?? []).map((alias) => ({ slug: alias }))
  ]);
}
