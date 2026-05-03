import type { Metadata } from "next";
import { NeroaResetPasswordSurface } from "@/components/neroa-portal/neroa-reset-password-surface";

type ResetPasswordSearchParams = Record<string, string | string[] | undefined>;

type NeroaResetPasswordPageProps = {
  searchParams?: Promise<ResetPasswordSearchParams> | ResetPasswordSearchParams;
};

function readSearchParam(searchParams: ResetPasswordSearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = {
  title: "Neroa | Reset Password",
  description: "Reset your Neroa password inside the clean auth flow."
};

export default async function NeroaResetPasswordPage({
  searchParams
}: NeroaResetPasswordPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const error = readSearchParam(resolvedSearchParams, "error") ?? null;
  const notice = readSearchParam(resolvedSearchParams, "notice") ?? null;

  return <NeroaResetPasswordSurface initialError={error} initialNotice={notice} />;
}
