"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createWorkspace(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    redirect("/dashboard?error=Workspace name is required.");
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      description,
      owner_id: user.id
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/dashboard?error=${encodeURIComponent(error?.message ?? "Unable to create workspace.")}`);
  }

  revalidatePath("/dashboard");
  redirect(`/workspace/${data.id}/project/${data.id}`);
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
