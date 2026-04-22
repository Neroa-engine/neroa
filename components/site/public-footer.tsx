import Link from "next/link";
import { PublicActionLink } from "@/components/site/public-action-link";

const footerSections = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Pricing", href: "/pricing" },
      { label: "DIY Build", href: "/diy-build" },
      { label: "Managed Build", href: "/managed-build" },
      { label: "Blog", href: "/blog" }
    ]
  },
  {
    title: "Help",
    links: [
      { label: "Start with NEROA", href: "/start" },
      { label: "Contact Us", href: "/contact" },
      { label: "Support", href: "/support" },
      { label: "Instructions", href: "/instructions" }
    ]
  }
];

export function PublicFooter() {
  return (
    <footer className="shell relative pb-16 pt-10">
      <div className="floating-plane rounded-[34px] p-6 sm:p-8">
        <div className="floating-wash rounded-[34px]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Build with NEROA
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              NEROA is ready to help frame and route your SaaS the right way.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Start in the guided builder, shape the product path clearly, and continue into the roadmap when you are ready to move from planning into execution.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {footerSections.map((section) => (
              <div key={section.title}>
                <p className="text-sm font-semibold text-slate-950">{section.title}</p>
                <div className="mt-4 grid gap-2">
                  {section.links.map((link) =>
                    link.href.startsWith("/start") ? (
                      <PublicActionLink
                        key={link.href}
                        href={link.href}
                        label={link.label}
                        className="text-sm leading-7 text-slate-600 transition hover:text-slate-950"
                      >
                        {link.label}
                      </PublicActionLink>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm leading-7 text-slate-600 transition hover:text-slate-950"
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
