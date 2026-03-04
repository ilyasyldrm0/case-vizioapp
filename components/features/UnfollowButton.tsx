"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { unfollowTeam } from "@/app/actions/follows";

export default function UnfollowButton({ targetTeamId, targetTeamSlug }: { targetTeamId: string; targetTeamSlug: string }) {
  const [isPending, start] = useTransition();
  const router = useRouter();

  function handleUnfollow() {
    start(async () => {
      await unfollowTeam(targetTeamId, targetTeamSlug);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleUnfollow}
      disabled={isPending}
      style={{
        fontSize: 12, fontWeight: 600, padding: "6px 14px",
        borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)",
        background: "transparent", color: "rgba(240,237,230,0.6)",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.5 : 1, transition: "all 0.2s",
        fontFamily: "var(--font-mono)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)";
        e.currentTarget.style.color = "#f87171";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = "rgba(240,237,230,0.6)";
      }}
    >
      {isPending ? "..." : "Bırak"}
    </button>
  );
}
