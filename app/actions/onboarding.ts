"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Team } from "@/types/database";

// Kullanıcı adının müsait olup olmadığını kontrol eder
export async function checkUsername(
  username: string
): Promise<{ available: boolean; error?: string }> {
  if (!username || username.length < 3) {
    return { available: false, error: "En az 3 karakter olmalı." };
  }
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return { available: false, error: "Sadece küçük harf, rakam, _ ve - kullanılabilir." };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  return { available: !data };
}

// Yeni takım kur + onboarding'i tamamla
export async function createTeamAndComplete(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısın." };

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const teamName = (formData.get("teamName") as string)?.trim();
  const teamSlug = (formData.get("teamSlug") as string)?.trim().toLowerCase();

  // Validasyonlar
  if (!username || username.length < 3) return { error: "Kullanıcı adı en az 3 karakter olmalı." };
  if (!/^[a-z0-9_-]+$/.test(username))  return { error: "Kullanıcı adı sadece küçük harf, rakam, _ ve - içerebilir." };
  if (!teamName || teamName.length < 2)  return { error: "Takım adı en az 2 karakter olmalı." };
  if (!teamSlug || teamSlug.length < 2)  return { error: "Takım slug'ı en az 2 karakter olmalı." };
  if (!/^[a-z0-9-]+$/.test(teamSlug))   return { error: "Slug sadece küçük harf, rakam ve - içerebilir." };

  // Kullanıcı adı müsait mi?
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existingUser) return { error: "Bu kullanıcı adı alınmış." };

  // Takımı oluştur
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ name: teamName, slug: teamSlug })
    .select("id")
    .single();

  if (teamError) {
    if (teamError.code === "23505") return { error: "Bu takım adı veya slug zaten alınmış." };
    return { error: teamError.message };
  }

  // Profili güncelle
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ username, team_id: team.id })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/feed");
  redirect("/feed");
}

// Mevcut takıma katıl + onboarding'i tamamla
export async function joinTeamAndComplete(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısın." };

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const teamId   = formData.get("teamId") as string;

  // Validasyonlar
  if (!username || username.length < 3) return { error: "Kullanıcı adı en az 3 karakter olmalı." };
  if (!/^[a-z0-9_-]+$/.test(username))  return { error: "Kullanıcı adı sadece küçük harf, rakam, _ ve - içerebilir." };
  if (!teamId) return { error: "Bir takım seçmelisin." };

  // Kullanıcı adı müsait mi?
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existingUser) return { error: "Bu kullanıcı adı alınmış." };

  // Takım var mı?
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("id", teamId)
    .maybeSingle();
  if (!team) return { error: "Takım bulunamadı." };

  // Profili güncelle
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ username, team_id: teamId })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/feed");
  redirect("/feed");
}

// Takım arama (join akışı için)
export async function searchTeams(query: string): Promise<Team[]> {
  if (!query || query.trim().length < 1) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("teams")
    .select("*")
    .or(`slug.ilike.%${query}%,name.ilike.%${query}%`)
    .order("name")
    .limit(8);

  return (data ?? []) as Team[];
}
