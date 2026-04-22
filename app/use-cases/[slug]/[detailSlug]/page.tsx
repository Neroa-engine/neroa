import { notFound } from "next/navigation";
import { UseCaseFocusTemplate } from "@/components/marketing/use-case-focus-template";
import { getUseCaseFocusPage, getUseCaseFocusStaticParams } from "@/lib/use-case-focus";
import { getUseCasePage } from "@/lib/use-cases";

type UseCaseFocusDetailPageProps = {
  params: {
    slug: string;
    detailSlug: string;
  };
};

export function generateStaticParams() {
  return getUseCaseFocusStaticParams();
}

export default function UseCaseFocusDetailPage({ params }: UseCaseFocusDetailPageProps) {
  const parentPage = getUseCasePage(params.slug);
  const page = getUseCaseFocusPage(params.slug, params.detailSlug);

  if (!parentPage || !page) {
    notFound();
  }

  return <UseCaseFocusTemplate parentPage={parentPage} page={page} />;
}
