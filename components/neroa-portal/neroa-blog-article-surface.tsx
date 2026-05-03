import Link from "next/link";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";
import { NeroaPublicNavigation } from "@/components/neroa-portal/neroa-public-navigation";
import { NEROA_BLOG_INDEX_PATH, type BlogPost } from "@/lib/neroa/blog-posts";

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

export function NeroaBlogArticleSurface({
  post
}: {
  post: BlogPost;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.72]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.18)_0%,rgba(4,7,10,0.42)_22%,rgba(3,6,8,0.84)_64%,rgba(3,6,8,0.98)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_15%,rgba(190,255,240,0.14),transparent_11%),radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.05),transparent_18%)]" />
        <div className="absolute right-[2%] top-[2%] h-[40rem] w-[32rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.22),transparent_12%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <NeroaNorthStarAccent
          className="right-[18rem] top-[7rem]"
          testId="blog-article-page-north-star"
        />
        <div className="absolute bottom-[9rem] left-[-8%] right-[-8%] h-[18rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10),transparent_60%)]" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/neroa" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
          </Link>

          <NeroaPublicNavigation currentPath="/neroa/blog" />
        </header>

        <section className="grid gap-8 border-b border-white/10 py-14 lg:grid-cols-[minmax(0,1fr),22rem] lg:gap-12 lg:py-16">
          <div className="max-w-4xl space-y-6">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/48"
            >
              <Link href={NEROA_BLOG_INDEX_PATH} className="transition hover:text-white">
                Build Journal
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-white/72">
                {post.title}
              </span>
            </nav>

            <Link
              href={NEROA_BLOG_INDEX_PATH}
              className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.22em] text-teal-200/82 transition hover:text-white"
            >
              <span aria-hidden="true">&lt;</span>
              <span>Back to Build Journal</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
              <span>{post.category}</span>
              <span className="h-1 w-1 rounded-full bg-teal-200/70" aria-hidden="true" />
              <span>{post.readTime}</span>
              <span className="h-1 w-1 rounded-full bg-teal-200/70" aria-hidden="true" />
              <span>Roadmap-first</span>
            </div>

            <h1 className="max-w-5xl font-serif text-[clamp(3.2rem,7vw,6rem)] leading-[0.98] tracking-[-0.05em] text-white">
              {post.title}
            </h1>

            <p className="max-w-3xl text-[1.1rem] leading-8 text-white/70">{post.summary}</p>

            <div className="flex flex-wrap gap-3">
              {[
                "scope before execution",
                "evidence and review",
                "governed execution",
                "SaaS done right"
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/68"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.92),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
              In this article
            </p>
            <div className="mt-5 space-y-4">
              {post.bodySections.map((section, index) => (
                <div
                  key={section.heading}
                  className="rounded-[1rem] border border-white/10 bg-white/[0.035] px-4 py-3"
                >
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/74">{section.heading}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr),18rem]">
          <article className="space-y-10">
            {post.bodySections.map((section) => (
              <section
                key={section.heading}
                className="rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(6,9,13,0.76))] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.26)] sm:p-8"
              >
                <h2 className="font-serif text-[2rem] leading-tight text-white">{section.heading}</h2>
                <div className="mt-5 space-y-5 text-[1rem] leading-8 text-white/72">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          <aside className="space-y-5">
            <div className="rounded-[1.5rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.92),rgba(6,9,13,0.8))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                Neroa lens
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  "guided plan before build pressure",
                  "project scope before execution widens",
                  "architecture and data model before drift",
                  "auth, payments, QA, and maintainability in view"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-7 text-white/72">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-200/80" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-white/12 bg-black/20 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.2)]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                Read time
              </p>
              <p className="mt-3 text-2xl font-serif text-white">{post.readTime}</p>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Detailed public guidance for roadmap-first, structured software building.
              </p>
            </div>
          </aside>
        </section>

        <section className="border-t border-white/10 py-14">
          <div className="flex flex-col gap-6 rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.9),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/78">Next step</p>
              <h2 className="font-serif text-[2.1rem] text-white">Turn the article into an approved build path.</h2>
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
