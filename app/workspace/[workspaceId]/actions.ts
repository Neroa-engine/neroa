"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function sendMessage(workspaceId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    redirect(`/workspace/${workspaceId}?error=Message cannot be empty.`);
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!workspace) {
    redirect("/dashboard?error=Engine not found.");
  }

  const { error } = await supabase.from("workspace_messages").insert({
    workspace_id: workspaceId,
    author_id: user.id,
    role: "user",
    content
  });

  if (error) {
    redirect(`/workspace/${workspaceId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/workspace/${workspaceId}`);
}

export async function saveJob(workspaceId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!workspace) {
    redirect("/dashboard?error=Engine not found.");
  }

  const finalTitle = title || `${workspace.name} job`;

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      owner_id: user.id,
      workspace_id: workspaceId,
      title: finalTitle,
      notes: notes || null
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/workspace/${workspaceId}?error=${encodeURIComponent(error?.message ?? "Unable to save job.")}`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/workspace/${workspaceId}`);
  redirect(`/jobs/${data.id}`);
}
