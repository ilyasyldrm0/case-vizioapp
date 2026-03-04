"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const content  = (formData.get("content") as string)?.trim();

  if (!content || content.length > 500) {
    return { error: "İçerik 1-500 karakter arasında olmalı." };
  }

  const { data: teamId } = await supabase.rpc("my_team_id");
  if (!teamId) return { error: "Takımın bulunamadı." };

  const { error } = await supabase
    .from("posts")
    .insert({ team_id: teamId, content } as any);

  if (error) return { error: error.message };

  revalidatePath("/feed");
  return { success: true };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/feed");
  return { success: true };
}