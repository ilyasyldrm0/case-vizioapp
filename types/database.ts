export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      teams: {
        Row:    { id: string; name: string; slug: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: { name?: string; slug?: string };
      };
      profiles: {
        // username ve team_id onboarding tamamlanana kadar null olabilir
        Row:    { id: string; username: string | null; team_id: string | null; created_at: string };
        Insert: { id: string; username?: string | null; team_id?: string | null; created_at?: string };
        Update: { username?: string | null; team_id?: string | null };
      };
      posts: {
        Row:    { id: string; team_id: string; content: string; created_at: string };
        Insert: { id?: string; team_id: string; content: string; created_at?: string };
        Update: { content?: string };
      };
      team_follows: {
        Row:    { follower_team_id: string; following_team_id: string; created_at: string };
        Insert: { follower_team_id: string; following_team_id: string; created_at?: string };
        Update: never;
      };
    };
    Functions: {
      my_team_id: { Args: Record<never, never>; Returns: string | null };
    };
  };
}

export type Team       = Database["public"]["Tables"]["teams"]["Row"];
export type Profile    = Database["public"]["Tables"]["profiles"]["Row"];
export type Post       = Database["public"]["Tables"]["posts"]["Row"];
export type TeamFollow = Database["public"]["Tables"]["team_follows"]["Row"];

// Takım üyesi (profil sayfasında üye listesi için)
export type TeamMember = Pick<Profile, "username">;

// Join type kullanılan yerlerde
export type PostWithTeam = Post & { teams: Pick<Team, "name" | "slug"> };
