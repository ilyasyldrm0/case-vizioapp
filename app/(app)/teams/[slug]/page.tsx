import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PostCard from "@/components/features/PostCard";
import FollowButton from "@/components/features/FollowButton";
import type { Team, PostWithTeam, TeamMember } from "@/types/database";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Takımı slug ile bul
  const { data: teamData } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!teamData) notFound();
  const team = teamData as Team;

  // Kullanıcının kendi takımı
  const { data: myTeamId } = await supabase.rpc("my_team_id");
  const isOwnTeam = myTeamId === team.id;

  // Takımın postları
  const { data: postsData } = await supabase
    .from("posts")
    .select("*, teams(name, slug)")
    .eq("team_id", team.id)
    .order("created_at", { ascending: false });
  const posts = (postsData ?? []) as PostWithTeam[];

  // Takipçi sayısı
  const { count: followerCount } = await supabase
    .from("team_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_team_id", team.id);

  // Takip edilen sayısı
  const { count: followingCount } = await supabase
    .from("team_follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_team_id", team.id);

  // Kendi takımım bu takımı takip ediyor mu?
  const { data: followRecord } = await supabase
    .from("team_follows")
    .select("follower_team_id")
    .eq("follower_team_id", myTeamId!)
    .eq("following_team_id", team.id)
    .maybeSingle();

  const isFollowing = !!followRecord;

  // Takım üyeleri (kullanıcı adları)
  const { data: membersData } = await supabase
    .from("profiles")
    .select("username")
    .eq("team_id", team.id)
    .not("username", "is", null)
    .order("username");
  const members = (membersData ?? []) as TeamMember[];

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6" }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10,
      }}>
        <a href="/feed" style={{
          fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em",
          textDecoration: "none", color: "#f0ede6",
        }}>
          ← <span style={{ color: "#e8ff47" }}>Feed</span>
        </a>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 16px" }}>

        {/* Team Header */}
        <div style={{
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
          padding: 28, marginBottom: 32,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
                {team.name}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(240,237,230,0.4)", fontFamily: "var(--font-mono)", margin: 0 }}>
                @{team.slug}
              </p>
            </div>

            {/* Follow butonu */}
            {!isOwnTeam && (
              <FollowButton
                targetTeamId={team.id}
                targetTeamSlug={team.slug}
                initiallyFollowing={isFollowing}
              />
            )}

            {isOwnTeam && (
              <span style={{
                fontSize: 11, fontWeight: 700, background: "rgba(232,255,71,0.15)",
                color: "#e8ff47", border: "1px solid rgba(232,255,71,0.3)",
                borderRadius: 999, padding: "6px 14px", fontFamily: "var(--font-mono)",
              }}>
                senin takımın
              </span>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginBottom: members.length > 0 ? 24 : 0 }}>
            {[
              { label: "post",    value: posts?.length ?? 0 },
              { label: "üye",     value: members.length },
              { label: "takipçi", value: followerCount ?? 0 },
              { label: "takip",   value: followingCount ?? 0 },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "rgba(240,237,230,0.4)", margin: 0, fontFamily: "var(--font-mono)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Üye listesi */}
          {members.length > 0 && (
            <div style={{
              paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: "rgba(240,237,230,0.4)",
                textTransform: "uppercase", letterSpacing: "0.06em",
                fontFamily: "var(--font-mono)", margin: "0 0 10px",
              }}>
                Üyeler
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {members.map((m) => (
                  <span
                    key={m.username}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: "4px 12px",
                      borderRadius: 999, fontFamily: "var(--font-mono)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(240,237,230,0.7)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    @{m.username}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 28, marginBottom: 12 }}>🤫</p>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
              Henüz paylaşım yok
            </p>
            <p style={{ fontSize: 13, color: "rgba(240,237,230,0.5)", fontFamily: "var(--font-mono)" }}>
              Bu takım henüz sessiz.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
