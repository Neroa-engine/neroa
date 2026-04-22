"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/lib/routes";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function safeNextPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : APP_ROUTES.start;
}

function buildErrorRedirect(message: string, next: string) {
  const params = new URLSearchParams();
  params.set("error", message);

  if (next !== APP_ROUTES.start) {
    params.set("next", next);
  }

  return `/auth?${params.toString()}`;
}

function normalizeAuthErrorMessage(message: string) {
  if (message.toLowerCase() === "email not confirmed") {
    return "Email not confirmed. Confirm your email first, then sign in to continue.";
  }

  return message;
}

export async function authenticate(formData: FormData) {
  const email = safeString(formData.get("email"));
  const password = safeString(formData.get("password"));
  const next = safeNextPath(safeString(formData.get("next")));

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(buildErrorRedirect(normalizeAuthErrorMessage(error.message), next));
  }

  redirect(next);
}
