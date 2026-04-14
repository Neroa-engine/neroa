import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { howItWorksPages } from "@/lib/marketing-pages";

export default function HowItWorksOverviewPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
          How It Works
        </p>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5rem]">
          Create a workspace, connect the right AI stack, and keep the work in one command center.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">
          Neroa is designed to carry discovery, planning, build work, and execution through one operating system instead of dropping users into disconnected tools.
        </p>
      </section>

      <section className="mt-16 grid gap-4 lg:grid-cols-3">
        {howItWorksPages.map((item) => (
          <Link
            key={item.slug}
            href={`/how-it-works/${item.slug}`}
            className="micro-glow floating-plane rounded-[30px] p-6"
          >
            <div className="floating-wash rounded-[30px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                {item.index}
              </p>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>
            </div>
          </Link>
        ))}
      </section>
    </MarketingInfoShell>
  );
}
