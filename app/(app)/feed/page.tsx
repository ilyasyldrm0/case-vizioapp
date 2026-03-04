import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/features/PostCard";
import PostForm from "@/components/features/PostForm";
import type { PostWithTeam } from "@/types/database";

export const revalidate = 0; // always fresh

export default async function FeedPage() {
  const supabase = await createClient();

  // Kullanıcının kendi takım ID'si
  const { data: myTeamId } = await supabase.rpc("my_team_id");

  // Takip edilen takım ID'leri
  let followedTeamIds: string[] = [];
  if (myTeamId) {
    const { data: follows } = await supabase
      .from("team_follows")
      .select("following_team_id")
      .eq("follower_team_id", myTeamId);
    followedTeamIds = (follows as { following_team_id: string }[] | null)?.map((f) => f.following_team_id) ?? [];
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, teams(name, slug)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) console.error("Feed error:", error.message);

  // Takip edilen takımların postları üstte, diğerleri altta
  const typedPosts = (posts ?? []) as PostWithTeam[];
  const followedPosts = typedPosts.filter((p) => followedTeamIds.includes(p.team_id));
  const otherPosts = typedPosts.filter((p) => !followedTeamIds.includes(p.team_id));
  const sortedPosts = [...followedPosts, ...otherPosts];

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
      <PostForm />

      {sortedPosts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>👋</p>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            Henüz paylaşım yok
          </p>
          <p style={{ fontSize: 14, color: "rgba(240,237,230,0.5)", fontFamily: "var(--font-mono)" }}>
            İlk paylaşımı yapan takım sen ol.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              myTeamId={myTeamId}
              followedTeamIds={followedTeamIds}
            />
          ))}
        </div>
      )}
    </main>
  );
}