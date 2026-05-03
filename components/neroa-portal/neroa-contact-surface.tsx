import Link from "next/link";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";
import { NeroaPublicNavigation } from "@/components/neroa-portal/neroa-public-navigation";

const supportCategories = [
  {
    title: "Account Access",
    copy: "Help with sign-in, password reset, email access, or account settings."
  },
  {
    title: "Billing / Usage",
    copy: "Questions about plans, Build Credits, managed credits, top-offs, or usage visibility."
  },
  {
    title: "Project Setup",
    copy: "Help starting a project, choosing a plan, or understanding your project workspace."
  },
  {
    title: "Managed Build Questions",
    copy: "Questions about managed credits, execution support, and which build path is right for you."
  },
  {
    title: "General Support",
    copy: "For anything else related to Neroa."
  }
] as const;

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

export function NeroaContactSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#030508]" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.72]"
          style={{ backgroundImage: "url('/brand/background.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,10,0.18)_0%,rgba(4,7,10,0.4)_24%,rgba(3,6,8,0.82)_68%,rgba(3,6,8,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(190,255,240,0.14),transparent_10%),radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.05),transparent_18%)]" />
        <div className="absolute right-[4%] top-[3%] h-[42rem] w-[34rem] bg-[radial-gradient(circle_at_50%_10%,rgba(173,255,237,0.24),transparent_11%),radial-gradient(ellipse_at_50%_38%,rgba(51,191,164,0.14),transparent_52%)] blur-xl" />
        <NeroaNorthStarAccent className="right-[18rem] top-[7rem]" testId="contact-page-north-star" />
        <div className="absolute bottom-[10rem] left-[-8%] right-[-8%] h-[18rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10),transparent_60%)]" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-6 py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/neroa" className="flex items-center gap-3 text-white">
            <NorthStarIcon className="h-5 w-5 text-teal-200/86" />
            <span className="font-serif text-[2.15rem] tracking-tight">Neroa</span>
          </Link>

          <NeroaPublicNavigation currentPath="/neroa/contact" />
        </header>

        <section className="grid gap-8 border-b border-white/10 py-14 lg:grid-cols-[minmax(0,1.1fr),24rem] lg:gap-12 lg:py-16">
          <div className="max-w-4xl space-y-6">
            <p className="text-sm uppercase tracking-[0.34em] text-teal-200/78">Support and guidance</p>
            <h1 className="max-w-4xl font-serif text-[clamp(3.8rem,9vw,7rem)] leading-[0.95] tracking-[-0.05em] text-white">
              Contact Neroa
            </h1>
            <p className="max-w-3xl text-[1.18rem] leading-8 text-white/70">
              Get help with your account, plan, project setup, or build path.
            </p>
            <p className="max-w-3xl text-[1rem] leading-8 text-white/62">
              Use the support categories below to route your message clearly. Email is the safest
              support option right now while the rest of the support surface stays intentionally
              simple and reliable.
            </p>
          </div>

          <aside className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.92),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
              Safe contact path
            </p>
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-7 text-white/70">
                Start with email when you need help with account access, project setup, or plan
                questions.
              </p>
              <a
                href="mailto:support@neroa.io"
                aria-label="Email support at support@neroa.io"
                className="inline-flex items-center rounded-full border border-teal-300/45 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_28px_rgba(45,212,191,0.12)] transition hover:border-teal-200/70 hover:bg-teal-300/16"
              >
                Email Support
              </a>
              <p className="text-sm font-medium text-teal-100">support@neroa.io</p>
              <p className="text-sm leading-7 text-white/58">
                Support chat is planned for a later release. For now, email support is the safest
                way to reach Neroa.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 py-12 md:grid-cols-2 xl:grid-cols-3">
          {supportCategories.map((category) => (
            <article
              key={category.title}
              className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,16,0.82),rgba(7,10,14,0.62))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                Support category
              </p>
              <h2 className="mt-4 text-[1.35rem] font-semibold text-slate-50">{category.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{category.copy}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
