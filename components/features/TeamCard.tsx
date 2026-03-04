import Link from "next/link";
import type { Team } from "@/types/database";

interface Props {
  team: Team;
  postCount?: number;
  followerCount?: number;
  isOwn?: boolean;
}

export default function TeamCard({ team, postCount, followerCount, isOwn }: Props) {
  return (
    <Link href={`/teams/${team.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article style={{
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(232,255,71,0.3)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      >
        <div>
          {/* Team name + own badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
              {team.name}
            </p>
            {isOwn && (
              <span style={{
                fontSize: 10, fontWeight: 700, background: "rgba(232,255,71,0.15)",
                color: "#e8ff47", border: "1px solid rgba(232,255,71,0.3)",
                borderRadius: 999, padding: "2px 8px", fontFamily: "var(--font-mono)",
              }}>
                senin takımın
              </span>
            )}
          </div>

          {/* Slug */}
          <p style={{
            fontSize: 12, color: "rgba(240,237,230,0.4)",
            fontFamily: "var(--font-mono)", margin: 0,
          }}>
            @{team.slug}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
          {postCount !== undefined && (
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{postCount}</p>
              <p style={{ fontSize: 11, color: "rgba(240,237,230,0.4)", margin: 0, fontFamily: "var(--font-mono)" }}>
                post
              </p>
            </div>
          )}
          {followerCount !== undefined && (
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{followerCount}</p>
              <p style={{ fontSize: 11, color: "rgba(240,237,230,0.4)", margin: 0, fontFamily: "var(--font-mono)" }}>
                takipçi
              </p>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}