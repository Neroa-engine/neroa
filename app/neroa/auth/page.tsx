import type { Metadata } from "next";
import { NeroaAuthSurface } from "@/components/neroa-portal/neroa-auth-surface";

export const metadata: Metadata = {
  title: "Neroa | Sign In",
  description: "Sign in or create a Neroa account to start your project."
};

export default function NeroaAuthPage() {
  return <NeroaAuthSurface />;
}
