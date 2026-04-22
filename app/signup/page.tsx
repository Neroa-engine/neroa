import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { SignupShell } from "@/components/front-door/signup-shell";
import { getOptionalUser } from "@/lib/auth";
import { normalizeAppPath } from "@/lib/auth/routes";
import { APP_ROUTES } from "@/lib/routes";

type SignupPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
    email?: string;
    next?: string;
  };
};

export const metadata: Metadata = {
  title: "Neroa | Create your account",
  description:
    "Create your Neroa account and continue into the exact signed-in destination you requested."
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getOptionalUser();
  const next = normalizeAppPath(searchParams?.next, APP_ROUTES.start);

  if (user) {
    redirect(next);
  }

  return (
    <MarketingInfoShell
      ctaHref={`/auth?next=${encodeURIComponent(next)}`}
      ctaLabel="Sign in"
      brandVariant="prominent"
      contentWidth="wide"
      showHelpChat={false}
    >
      <section className="mx-auto max-w-6xl pb-4">
        <SignupShell
          error={searchParams?.error}
          notice={searchParams?.notice}
          initialEmail={searchParams?.email}
          next={next}
        />
      </section>
    </MarketingInfoShell>
  );
}
