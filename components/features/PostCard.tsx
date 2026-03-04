import type { PostWithTeam } from "@/types/database";
import FollowButton from "@/components/features/FollowButton";
import Link from "next/link";

interface Props {
  post: PostWithTeam;
  myTeamId?: string | null;
  followedTeamIds?: string[];
}

export default function PostCard({ post, myTeamId, followedTeamIds = [] }: Props) {
  const isOwnTeam = myTeamId === post.team_id;
  const isFollowing = followedTeamIds.includes(post.team_id);

  return (
    <article style={{
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: 20,
      transition: "border-color 0.2s",
    }}>
      {/* Header: team slug + follow button */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <Link href={`/teams/${post.teams.slug}`} style={{ textDecoration: "none" }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: "#e8ff47",
            margin: 0, fontFamily: "var(--font-mono)",
            cursor: "pointer",
          }}>
            @{post.teams.slug}
          </p>
        </Link>

        {/* Kendi takımı değilse follow/unfollow butonu göster */}
        {!isOwnTeam && (
          <FollowButton
            targetTeamId={post.team_id}
            targetTeamSlug={post.teams.slug}
            initiallyFollowing={isFollowing}
            isLoggedIn={!!myTeamId}
          />
        )}
      </div>

      <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" }}>
        {post.content}
      </p>
      <time style={{
        fontSize: 12, color: "rgba(240,237,230,0.4)",
        fontFamily: "var(--font-mono)",
      }}>
        {new Date(post.created_at).toLocaleString("tr-TR")}
      </time>
    </article>
  );
}