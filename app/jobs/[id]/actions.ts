"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function updateJob(jobId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) {
    redirect(`/jobs/${jobId}?error=Job title is required.`);
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!job) {
    redirect("/dashboard?error=Job not found.");
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      title,
      notes: notes || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", jobId)
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/jobs/${jobId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/jobs/${jobId}`);
  redirect(`/jobs/${jobId}?notice=Job saved.`);
}
