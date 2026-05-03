import Link from "next/link";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";
import { NeroaPublicNavigation } from "@/components/neroa-portal/neroa-public-navigation";
import {
  blogPosts,
  getBlogPostRoute,
  NEROA_BLOG_INDEX_PATH
} from "@/lib/neroa/blog-posts";

function NorthStarIcon({
  className = ""
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.8 11.8 8.2 18.2 10l-6.4 1.8L10 18.2l-1.8-6.4L1.8 10l6.4-1.8L10 1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function NeroaBlogSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.72]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.16)_0%,rgba(4,7,10,0.38)_24%,rgba(3,6,8,0.82)_68%,rgba(3,6,8,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(190,255,240,0.14),transparent_10%),radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.05),transparent_18%)]" />
        <div className="absolute right-[3%] top-[3%] h-[42rem] w-[34rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.24),transparent_11%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="blog-page-north-star" />
        <div className="absolute bottom-[10rem] left-[-8%] right-[-8%] h-[18rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10),transparent_60%)]" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/neroa" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
          </Link>

          <NeroaPublicNavigation currentPath="/neroa/blog" />
        </header>

        <section className="grid gap-8 border-b border-white/10 py-14 lg:grid-cols-[1.15fr,0.85fr] lg:gap-12 lg:py-16">
          <div className="max-w-4xl space-y-6">
            <p className="text-sm uppercase tracking-[0.34em] text-teal-200/78">The Neroa Build Journal</p>
            <h1 className="max-w-4xl font-serif text-[clamp(3.8rem,9vw,7rem)] leading-[0.95] tracking-[-0.05em] text-white">
              The Neroa Build Journal
            </h1>
            <p className="max-w-3xl text-[1.18rem] leading-8 text-white/70">
              Roadmap-first thinking for founders, businesses, and builders who want software built with structure instead of chaos.
            </p>
            <p className="max-w-3xl text-[1rem] leading-8 text-white/62">
              Most software projects do not fail because the idea is bad. They fail because the build starts without enough scope, sequence, decisions, review, or technical direction. Neroa is designed to slow the chaos down before execution begins.
            </p>
          </div>

          <aside className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.92),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
              Journal focus
            </p>
            <div className="mt-5 space-y-4">
              {[
                "roadmap-first software building",
                "scope before execution",
                "Build Credits and managed credits",
                "evidence and review",
                "SaaS done right"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-7 text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="space-y-6 py-14">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Foundational articles</p>
              <h2 className="font-serif text-[2.35rem] text-white">Foundational Articles</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/56">
              These articles explain how structured software building, approvals, evidence and review, and governed execution keep teams out of expensive rebuild loops.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={getBlogPostRoute(post.slug)}
                className="group block rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] transition duration-200 hover:border-teal-300/45 hover:bg-[linear-gradient(180deg,rgba(10,15,19,0.94),rgba(7,11,15,0.82))]"
              >
                <div className="space-y-5">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                      <span>{post.category}</span>
                      <span className="h-1 w-1 rounded-full bg-teal-200/70" aria-hidden="true" />
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-serif text-[2rem] leading-tight text-white transition group-hover:text-teal-100">
                      {post.title}
                    </h3>
                    <p className="text-sm leading-7 text-white/66">{post.summary}</p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-5">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                      What you'll read
                    </p>
                    <ul className="mt-4 space-y-3">
                      {post.bodySections.slice(0, 3).map((section) => (
                        <li key={section.heading} className="flex items-start gap-3 text-sm leading-7 text-white/72">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-200/80" aria-hidden="true" />
                          <span>{section.heading}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-teal-100 transition group-hover:text-white">
                    <span>Read article</span>
                    <span aria-hidden="true">/</span>
                    <span>{post.slug}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 py-14">
          <div className="flex flex-col gap-6 rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Next step</p>
              <h2 className="font-serif text-[2.1rem] text-white">Move from reading into governed execution.</h2>
              <p className="max-w-2xl text-sm leading-7 text-white/60">
                Explore Neroa pricing to compare Build Credits, managed credits, and the path that fits your project.
              </p>
            </div>

            <Link
              href="/neroa/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-teal-300/45 bg-teal-300/12 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-teal-200/70 hover:bg-teal-300/22"
            >
              Start Your Project
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
