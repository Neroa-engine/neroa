import type { Metadata } from "next";
import { NeroaAuthSurface } from "@/components/neroa-portal/neroa-auth-surface";

export const metadata: Metadata = {
  title: "Neroa Auth Surface",
  description: "Clean auth surface for future Neroa account and project entry routing."
};

export default function NeroaAuthPage() {
  return <NeroaAuthSurface />;
}
