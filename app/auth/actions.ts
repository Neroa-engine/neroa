"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function safeNextPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function buildErrorRedirect(message: string, next: string) {
  const params = new URLSearchParams();
  params.set("error", message);

  if (next !== "/dashboard") {
    params.set("next", next);
  }

  return `/auth?${params.toString()}`;
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
    redirect(buildErrorRedirect(error.message, next));
  }

  redirect(next);
}
