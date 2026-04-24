import { startEntryWorkspace } from "@/app/start/actions";
import { FrontDoorHomeHero } from "@/components/front-door/front-door-home-hero";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { CanonicalEntryFlow } from "@/components/onboarding/canonical-entry-flow";
import { buildAuthRedirectPath } from "@/lib/auth/routes";
import { getOptionalUser } from "@/lib/auth";
import { publicLaunchEntryPath } from "@/lib/data/public-launch";
import { APP_ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

type StartPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
    entry?: string;
    title?: string;
    summary?: string;
  };
};

export default async function StartPage({ searchParams }: StartPageProps) {
  const user = await getOptionalUser();
  const entryPathId = searchParams?.entry === "managed" ? "managed" : "diy";
  const hasExplicitEntry =
    searchParams?.entry === "managed" || searchParams?.entry === "diy";

  if (!hasExplicitEntry) {
    return (
      <MarketingInfoShell
        userEmail={user?.email ?? undefined}
        ctaHref={publicLaunchEntryPath}
        ctaLabel="Open Strategy Room"
        brandVariant="prominent"
        brandScale="landing"
        contentWidth="wide"
        theme="front-door"
        minimalHeader
        showFooter={false}
        showHelpChat={false}
      >
        <FrontDoorHomeHero initialAuthenticated={Boolean(user)} />
      </MarketingInfoShell>
    );
  }

  const nextParams = new URLSearchParams();

  if (searchParams?.entry === "managed") {
    nextParams.set("entry", "managed");
  } else if (searchParams?.entry === "diy") {
    nextParams.set("entry", "diy");
  }

  if (searchParams?.title) {
    nextParams.set("title", searchParams.title);
  }

  if (searchParams?.summary) {
    nextParams.set("summary", searchParams.summary);
  }

  if (searchParams?.error) {
    nextParams.set("error", searchParams.error);
  }

  if (searchParams?.notice) {
    nextParams.set("notice", searchParams.notice);
  }

  const nextPath = nextParams.size > 0 ? `${APP_ROUTES.start}?${nextParams.toString()}` : APP_ROUTES.start;

  if (!user) {
    redirect(buildAuthRedirectPath({ nextPath }));
  }

  return (
    <MarketingInfoShell
      userEmail={user?.email ?? undefined}
      ctaHref={user ? APP_ROUTES.projects : APP_ROUTES.auth}
      ctaLabel={user ? "Projects" : "Sign in"}
      brandVariant="prominent"
      contentWidth="wide"
        showHelpChat={false}
    >
      <section className="relative mx-auto w-full max-w-[2000px] px-0 py-5 sm:px-2 lg:px-4 lg:py-8 xl:px-8">
        <CanonicalEntryFlow
          initialUserEmail={user?.email ?? undefined}
          initialEntryPathId={entryPathId}
          initialTitle={searchParams?.title}
          initialSummary={searchParams?.summary}
          initialError={searchParams?.error ?? null}
          initialNotice={searchParams?.notice ?? null}
          startEntryWorkspaceAction={startEntryWorkspace}
        />
      </section>
    </MarketingInfoShell>
  );
}
