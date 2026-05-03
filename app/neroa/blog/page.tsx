import type { Metadata } from "next";
import { NeroaBlogSurface } from "@/components/neroa-portal/neroa-blog-surface";

export const metadata: Metadata = {
  title: "Neroa | Blog",
  description:
    "Read the Neroa Build Journal for roadmap-first thinking about structured software building, Build Credits, approvals, and governed execution."
};

export default function NeroaBlogPage() {
  return <NeroaBlogSurface />;
}
