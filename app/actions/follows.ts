"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function followTeam(targetTeamId: string, targetTeamSlug: string) {
  const supabase = await createClient();
  const { data: myTeamId } = await supabase.rpc("my_team_id");
  if (!myTeamId) return { error: "Takımın bulunamadı." };
  if (myTeamId === targetTeamId) return { error: "Kendin takip edemezsin." };

  const { error } = await supabase
    .from("team_follows")
    .insert({ follower_team_id: myTeamId, following_team_id: targetTeamId } as any);

  if (error) return { error: error.message };

  revalidatePath(`/teams/${targetTeamSlug}`);
  revalidatePath("/feed");
  return { success: true };
}

export async function unfollowTeam(targetTeamId: string, targetTeamSlug: string) {
  const supabase = await createClient();
  const { data: myTeamId } = await supabase.rpc("my_team_id");
  if (!myTeamId) return { error: "Takımın bulunamadı." };

  const { error } = await supabase
    .from("team_follows")
    .delete()
    .match({ follower_team_id: myTeamId, following_team_id: targetTeamId } as any);

  if (error) return { error: error.message };

  revalidatePath(`/teams/${targetTeamSlug}`);
  revalidatePath("/feed");
  return { success: true };
}