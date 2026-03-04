import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/features/PostForm";
import InfiniteFeed from "@/components/features/InfiniteFeed";
import type { PostWithTeam } from "@/types/database";

export const revalidate = 0;

const PAGE_SIZE = 8;

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: myTeamId } = await supabase.rpc("my_team_id");

  let followedTeamIds: string[] = [];
  if (myTeamId) {
    const { data: follows } = await supabase
      .from("team_follows")
      .select("following_team_id")
      .eq("follower_team_id", myTeamId);
    followedTeamIds = (follows as { following_team_id: string }[] | null)
      ?.map((f) => f.following_team_id) ?? [];
  }

  const { data } = await supabase
    .from("posts")
    .select("*, teams(name, slug)")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  const initialPosts = (data ?? []) as PostWithTeam[];
  const initialLastCreatedAt = initialPosts.length > 0
    ? initialPosts[initialPosts.length - 1].created_at
    : null;
  const initialHasMore = initialPosts.length === PAGE_SIZE;

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
      <PostForm />
      <InfiniteFeed
        key={initialPosts[0]?.id ?? "empty"}
        initialPosts={initialPosts}
        myTeamId={myTeamId}
        followedTeamIds={followedTeamIds}
        initialLastCreatedAt={initialLastCreatedAt}
        initialHasMore={initialHasMore}
      />
    </main>
  );
}
