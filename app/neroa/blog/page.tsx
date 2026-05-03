import type { Metadata } from "next";
import { NeroaBlogSurface } from "@/components/neroa-portal/neroa-blog-surface";
import { NEROA_BLOG_INDEX_PATH } from "@/lib/neroa/blog-posts";

export const metadata: Metadata = {
  title: "The Neroa Build Journal | Neroa",
  description:
    "Read the Neroa Build Journal for roadmap-first thinking about structured software building, Build Credits, approvals, and governed execution.",
  alternates: {
    canonical: NEROA_BLOG_INDEX_PATH
  },
  openGraph: {
    title: "The Neroa Build Journal",
    description:
      "Read the Neroa Build Journal for roadmap-first thinking about structured software building, Build Credits, approvals, and governed execution.",
    url: NEROA_BLOG_INDEX_PATH,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Neroa Build Journal",
    description:
      "Read the Neroa Build Journal for roadmap-first thinking about structured software building, Build Credits, approvals, and governed execution."
  }
};

export default function NeroaBlogPage() {
  return <NeroaBlogSurface />;
}
