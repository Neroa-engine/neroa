"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { NeroaNorthStarAccent } from "@/components/neroa-portal/neroa-north-star-accent";
import { NeroaPublicNavigation } from "@/components/neroa-portal/neroa-public-navigation";

const supportCategoryOptions = [
  "Account Access",
  "Billing / Usage",
  "Project Setup",
  "Managed Build Questions",
  "Technical Issue",
  "General Support"
] as const;

const supportCategoryDetails = [
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
    title: "Technical Issue",
    copy: "Share bugs, access issues, or workflow problems so support can review the right details."
  },
  {
    title: "General Support",
    copy: "For anything else related to Neroa."
  }
] as const;

const initialFormState = {
  category: supportCategoryOptions[0],
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
} as const;

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
  const [formValues, setFormValues] = useState(initialFormState);
  const [submitNotice, setSubmitNotice] = useState("");
  const futureNoteId = "contact-future-note";
  const formGuidanceId = "contact-form-guidance";
  const submitNoticeId = "contact-submit-notice";

  function handleFieldChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitNotice(
      "Support intake is being prepared. For now, please email support@neroa.io with these details."
    );
  }

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
              Contact Neroa Support
            </h1>
            <p className="max-w-3xl text-[1.18rem] leading-8 text-white/70">
              Tell us what you need help with. Support intake will be connected to the Neroa
              support system later; for now, email support is the safe fallback.
            </p>
            <p id={futureNoteId} className="max-w-3xl text-[1rem] leading-8 text-white/62">
              Later, this form will create a support request inside Neroa so your issue can be
              tracked from your account.
            </p>
          </div>

          <aside className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,11,15,0.92),rgba(6,9,13,0.76))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">Support note</p>
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-7 text-white/70">
                For urgent help, email support@neroa.io.
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
                Share your category, contact details, subject, and message by email if you need a
                reply before form intake is connected.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 py-12 lg:grid-cols-[minmax(0,1.2fr),minmax(18rem,24rem)]">
          <form
            onSubmit={handleSubmit}
            aria-describedby={`${formGuidanceId} ${futureNoteId}`}
            className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(8,12,16,0.88),rgba(7,10,14,0.68))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur"
          >
            <div className="space-y-3 border-b border-white/10 pb-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                Support intake
              </p>
              <p id={formGuidanceId} className="max-w-3xl text-sm leading-7 text-slate-300">
                Use this form to organize the details Neroa support will need once intake is live.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="support-category" className="text-sm font-medium text-slate-100">
                  Support category
                </label>
                <select
                  id="support-category"
                  name="category"
                  value={formValues.category}
                  onChange={handleFieldChange}
                  className="w-full rounded-[1rem] border border-white/12 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/20"
                >
                  {supportCategoryOptions.map((option) => (
                    <option key={option} value={option} className="bg-slate-950 text-slate-100">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="support-name" className="text-sm font-medium text-slate-100">
                  Name
                </label>
                <input
                  id="support-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formValues.name}
                  onChange={handleFieldChange}
                  className="w-full rounded-[1rem] border border-white/12 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/20"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="support-email" className="text-sm font-medium text-slate-100">
                  Email
                </label>
                <input
                  id="support-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formValues.email}
                  onChange={handleFieldChange}
                  className="w-full rounded-[1rem] border border-white/12 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/20"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="support-phone" className="text-sm font-medium text-slate-100">
                  Phone number
                </label>
                <input
                  id="support-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formValues.phone}
                  onChange={handleFieldChange}
                  className="w-full rounded-[1rem] border border-white/12 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/20"
                  placeholder="Optional phone number"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="support-subject" className="text-sm font-medium text-slate-100">
                  Subject
                </label>
                <input
                  id="support-subject"
                  name="subject"
                  type="text"
                  value={formValues.subject}
                  onChange={handleFieldChange}
                  className="w-full rounded-[1rem] border border-white/12 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/20"
                  placeholder="Short summary"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="support-message" className="text-sm font-medium text-slate-100">
                  Message / What do you need help with?
                </label>
                <textarea
                  id="support-message"
                  name="message"
                  rows={7}
                  value={formValues.message}
                  onChange={handleFieldChange}
                  className="w-full rounded-[1rem] border border-white/12 bg-black/25 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/20"
                  placeholder="Share the details, timing, and anything support should review."
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5">
              {submitNotice ? (
                <div
                  id={submitNoticeId}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="rounded-[1rem] border border-teal-300/24 bg-teal-300/10 px-4 py-3 text-sm leading-7 text-teal-50"
                >
                  {submitNotice}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-teal-300/45 bg-teal-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_28px_rgba(45,212,191,0.12)] transition hover:border-teal-200/70 hover:bg-teal-300/16"
                >
                  Review Support Details
                </button>
                <p className="text-sm leading-7 text-slate-400">
                  Your entries stay visible here after submit so you can copy them into email.
                </p>
              </div>
            </div>
          </form>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {supportCategoryDetails.map((category) => (
              <article
                key={category.title}
                className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,16,0.82),rgba(7,10,14,0.62))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur"
              >
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-teal-200/78">
                  Support category
                </p>
                <h2 className="mt-3 text-[1.12rem] font-semibold text-slate-50">{category.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{category.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
