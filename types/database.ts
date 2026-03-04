export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      teams: {
        Row:           { id: string; name: string; slug: string; created_at: string };
        Insert:        { id?: string; name: string; slug: string; created_at?: string };
        Update:        { name?: string; slug?: string };
        Relationships: [];
      };
      profiles: {
        // username ve team_id onboarding tamamlanana kadar null olabilir
        Row:           { id: string; username: string | null; team_id: string | null; created_at: string };
        Insert:        { id: string; username?: string | null; team_id?: string | null; created_at?: string };
        Update:        { username?: string | null; team_id?: string | null };
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row:           { id: string; team_id: string; content: string; created_at: string };
        Insert:        { id?: string; team_id: string; content: string; created_at?: string };
        Update:        { content?: string };
        Relationships: [
          {
            foreignKeyName: "posts_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      team_follows: {
        Row:           { follower_team_id: string; following_team_id: string; created_at: string };
        Insert:        { follower_team_id: string; following_team_id: string; created_at?: string };
        Update:        never;
        Relationships: [
          {
            foreignKeyName: "team_follows_follower_team_id_fkey";
            columns: ["follower_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_follows_following_team_id_fkey";
            columns: ["following_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views:         { [_ in never]: never };
    Functions: {
      my_team_id: { Args: Record<never, never>; Returns: string | null };
    };
    Enums:         { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
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
