"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import PostCard from "./PostCard";
import { fetchMorePosts } from "@/app/actions/posts";
import type { PostWithTeam } from "@/types/database";

interface Props {
  initialPosts: PostWithTeam[];
  myTeamId: string | null;
  followedTeamIds: string[];
  initialLastCreatedAt: string | null;
  initialHasMore: boolean;
}

export default function InfiniteFeed({
  initialPosts,
  myTeamId,
  followedTeamIds,
  initialLastCreatedAt,
  initialHasMore,
}: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [lastCreatedAt, setLastCreatedAt] = useState(initialLastCreatedAt);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(lastCreatedAt);
  cursorRef.current = lastCreatedAt;

  const loadMore = useCallback(() => {
    if (!hasMore || isPending) return;
    startTransition(async () => {
      const result = await fetchMorePosts({ lastCreatedAt: cursorRef.current });
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...result.posts.filter((p) => !seen.has(p.id))];
      });
      setLastCreatedAt(result.lastCreatedAt);
      setHasMore(result.hasMore);
    });
  }, [hasMore, isPending]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>👋</p>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
          Henüz paylaşım yok
        </p>
        <p style={{ fontSize: 14, color: "rgba(240,237,230,0.5)", fontFamily: "var(--font-mono)" }}>
          İlk paylaşımı yapan takım sen ol.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          myTeamId={myTeamId}
          followedTeamIds={followedTeamIds}
        />
      ))}

      {hasMore ? (
        <div
          ref={sentinelRef}
          style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {isPending && (
            <span style={{
              fontSize: 12,
              color: "rgba(240,237,230,0.35)",
              fontFamily: "var(--font-mono)",
            }}>
              yükleniyor...
            </span>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "24px 0 8px",
          fontSize: 12,
          color: "rgba(240,237,230,0.2)",
          fontFamily: "var(--font-mono)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}>
          — sona ulaştınız —
        </div>
      )}
    </div>
  );
}
