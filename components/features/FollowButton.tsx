"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { followTeam, unfollowTeam } from "@/app/actions/follows";

interface Props {
  targetTeamId: string;
  targetTeamSlug: string;
  initiallyFollowing: boolean;
  isLoggedIn?: boolean;
}

export default function FollowButton({ targetTeamId, targetTeamSlug, initiallyFollowing, isLoggedIn = true }: Props) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [isPending, start]        = useTransition();
  const router = useRouter();

  useEffect(() => {
    setFollowing(initiallyFollowing);
  }, [initiallyFollowing]);

  function toggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    start(async () => {
      const action = following ? unfollowTeam : followTeam;
      const result = await action(targetTeamId, targetTeamSlug);
      if (!result?.error) {
        setFollowing(!following);
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      style={{
        padding: "8px 20px", borderRadius: 999, fontSize: 13,
        fontWeight: 700, border: "none", cursor: isPending ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        background: following ? "rgba(255,255,255,0.08)" : "#e8ff47",
        color: following ? "#f0ede6" : "#0a0a0a",
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isPending ? "..." : following ? "Takip Ediliyor" : "Takip Et"}
    </button>
  );
}