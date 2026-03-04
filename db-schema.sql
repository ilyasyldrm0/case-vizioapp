-- ---------------------------------------------------------------
-- 1. TEAMS
-- ---------------------------------------------------------------
CREATE TABLE teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 2. PROFILES
--    Her kullanıcı için bir profil.
--    username ve team_id onboarding tamamlanana kadar NULL kalabilir.
--    Birden fazla kullanıcı aynı takıma ait olabilir (N:1).
-- ---------------------------------------------------------------
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text UNIQUE,                                    -- onboarding'de set edilir
  team_id    uuid REFERENCES teams(id) ON DELETE SET NULL,  -- onboarding'de set edilir
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- 3. POSTS  (team-owned, not user-owned)
-- ---------------------------------------------------------------
CREATE TABLE posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX posts_created_at_idx ON posts (created_at DESC);

-- ---------------------------------------------------------------
-- 4. TEAM_FOLLOWS
-- ---------------------------------------------------------------
CREATE TABLE team_follows (
  follower_team_id  uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  following_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_team_id, following_team_id),
  CONSTRAINT no_self_follow CHECK (follower_team_id <> following_team_id)
);

-- =============================================================
-- RLS (Row Level Security)
-- =============================================================
ALTER TABLE teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_follows ENABLE ROW LEVEL SECURITY;

-- Helper: kullanıcının takım ID'sini döndürür
CREATE OR REPLACE FUNCTION my_team_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT team_id FROM profiles WHERE id = auth.uid();
$$;

-- ---------------------------------------------------------------
-- Teams
-- ---------------------------------------------------------------
-- Herkese okuma
CREATE POLICY "teams: public read"
  ON teams FOR SELECT USING (true);

-- Giriş yapmış kullanıcılar takım kurabilir (onboarding)
CREATE POLICY "teams: authenticated insert"
  ON teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------
-- Üye listesi için herkese okuma (username + team_id görünür)
CREATE POLICY "profiles: public read"
  ON profiles FOR SELECT USING (true);

-- Sadece kendi profilini insert edebilir (trigger)
CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Sadece kendi profilini güncelleyebilir (onboarding: username + team_id set)
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- ---------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------
CREATE POLICY "posts: public read"
  ON posts FOR SELECT USING (true);

CREATE POLICY "posts: team insert"
  ON posts FOR INSERT WITH CHECK (team_id = my_team_id());

CREATE POLICY "posts: team delete"
  ON posts FOR DELETE USING (team_id = my_team_id());

-- ---------------------------------------------------------------
-- Follows
-- ---------------------------------------------------------------
CREATE POLICY "follows: public read"
  ON team_follows FOR SELECT USING (true);

CREATE POLICY "follows: insert as own team"
  ON team_follows FOR INSERT WITH CHECK (follower_team_id = my_team_id());

CREATE POLICY "follows: delete as own team"
  ON team_follows FOR DELETE USING (follower_team_id = my_team_id());

-- =============================================================
-- SIGNUP TRIGGER
-- Yeni kullanıcı kaydolduğunda sadece bare profil oluşturulur.
-- username ve team_id onboarding akışında kullanıcı tarafından set edilir.
-- =============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
