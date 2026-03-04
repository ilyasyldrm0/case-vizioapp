"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PostWithTeam } from "@/types/database";

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

const PAGE_SIZE = 8;

export async function fetchMorePosts({
  lastCreatedAt,
}: {
  lastCreatedAt: string | null;
}) {
  const supabase = await createClient();
  let q = supabase
    .from("posts")
    .select("*, teams(name, slug)")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);
  if (lastCreatedAt) q = q.lt("created_at", lastCreatedAt);

  const { data } = await q;
  const posts = (data ?? []) as PostWithTeam[];

  return {
    posts,
    lastCreatedAt: posts.length > 0 ? posts[posts.length - 1].created_at : lastCreatedAt,
    hasMore: posts.length === PAGE_SIZE,
  };
}