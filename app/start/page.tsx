import { startWorkspace } from "@/app/start/actions";
import NaruaWorkspace from "@/components/narua/NaruaWorkspace";
import { SiteHeader } from "@/components/site-header";
import { getOptionalUser } from "@/lib/auth";

type StartPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function StartPage({ searchParams }: StartPageProps) {
  const user = await getOptionalUser();

  return (
    <main className="min-h-screen bg-[#060816] pb-16 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_56%)]" />

      <SiteHeader
        userEmail={user?.email ?? undefined}
        ctaHref={user ? "/dashboard" : "/auth"}
        ctaLabel={user ? "Dashboard" : "Enter Neroa"}
      />

      <section className="relative mx-auto w-full max-w-[1760px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
            Strategy Room
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Explain the idea and let Neroa shape the first build plan.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            Start naturally. Neroa will turn the idea into a guided roadmap, a tighter first release,
            and a clear next move into preview, inspection, and approvals without making you carry
            the system behind it.
          </p>
        </div>

        {searchParams?.error ? (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {searchParams.error}
          </div>
        ) : null}

        <div className="mt-8">
          <NaruaWorkspace userEmail={user?.email ?? undefined} startWorkspaceAction={startWorkspace} />
        </div>
      </section>
    </main>
  );
}
