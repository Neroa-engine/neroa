import Link from "next/link";
import NeroaLogo from "@/components/brand/neroa-logo";
import { howItWorksPages } from "@/lib/marketing-pages";

export default function HowItWorksOverviewPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-[-18rem] h-[36rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_42%)]" />
        <div className="absolute right-[-10rem] top-[10rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_58%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,15,32,0.92),rgba(22,28,54,0.82),rgba(45,20,77,0.62))] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-4">
            <NeroaLogo className="h-16 w-auto" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white/90">How Neroa works</p>
              <p className="mt-1 text-sm text-white/55">Workspace execution flow</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
          >
            Back home
          </Link>
        </header>

        <section className="max-w-4xl py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
            How It Works
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl">
            Create a workspace, connect your stack, and build inside one command center
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
            Neroa is designed to help teams move from idea to execution by giving each NeuroEngine its
            own workspace, its own AI team, and a connected environment for planning, writing,
            coding, research, and operational work.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {howItWorksPages.map((item) => (
            <Link
              key={item.slug}
              href={`/how-it-works/${item.slug}`}
              className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,26,0.95),rgba(20,24,45,0.88))] p-6 transition hover:border-white/18 hover:bg-white/[0.05]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                {item.index}
              </p>
              <h2 className="mt-5 text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.summary}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
