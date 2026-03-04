# V.SOCIAL — Team-Based Social Media MVP

A team-based social media platform built with **Next.js 15 (App Router)** and **Supabase**. Teams are the first-class identity — there are no individual user profiles. All posts, follows, and social actions are performed under a team identity.

Live on: https://case-vizioapp.vercel.app/

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone <repo-url>
cd vizioapp
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Setup

In your Supabase project, open the **SQL Editor** and run the full contents of `db-schema.sql`. This will create all tables, RLS policies, helper functions, and triggers.

> **Important:** If you are re-running the schema (e.g. after a reset), drop existing tables first to avoid conflicts.

### 4. Google OAuth (Optional)

In your Supabase dashboard:

- Go to **Authentication → Providers → Google**
- Enable Google OAuth and add your credentials
- Add `http://localhost:3000/auth/callback` as an allowed redirect URL

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User Flow

```
Sign up / Log in
      ↓
/onboarding  →  Set username + Create or Join a team
      ↓
/feed        →  View global feed, create posts, follow teams
      ↓
/teams/[slug] →  Team profile: stats, members, posts, follow button
```

---

## Supabase Schema

### Tables

| Table          | Purpose                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `teams`        | Core team entity — name, slug                                                                   |
| `profiles`     | Links `auth.users` to a team. Holds `username`. One user → one team (N users can share a team). |
| `posts`        | Team-owned text posts (1–500 chars)                                                             |
| `team_follows` | Directional follow relationship between teams                                                   |

![Screenshot, visual schema of DB](ss-db-schema.png)

### Key Design Decisions

**`profiles.team_id` is nullable until onboarding is complete.**
Users are created in `auth.users` on signup. A bare profile row (no username, no team) is inserted by a DB trigger. The user is then routed to `/onboarding` where they pick a username and either create or join a team. This allows the same flow to work for both email/password and Google OAuth signups.

**N:1 user-to-team relationship.**
Multiple users can belong to the same team. This is the core product model — the team is the identity, not the individual. All members share the same permissions (no roles in scope for this MVP).

**Posts have no `author_user_id`.**
This is intentional. Posts belong to the team, not to the individual who created them. This enforces the team identity concept at the data layer.

### RLS Summary

All tables have Row Level Security enabled.

| Table          | Read                                                 | Write                                                    |
| -------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `teams`        | Public                                               | Authenticated users (to create a team during onboarding) |
| `profiles`     | Public (username + team_id visible for member lists) | Own row only                                             |
| `posts`        | Public                                               | Insert/delete only if `team_id = my_team_id()`           |
| `team_follows` | Public                                               | Insert/delete only if `follower_team_id = my_team_id()`  |

**`my_team_id()` helper function:**
A `SECURITY DEFINER` SQL function that resolves the current user's `team_id` from their profile via `auth.uid()`. Used across RLS policies to avoid repeating the same subquery logic and to enable stable caching by PostgreSQL.

---

## Key Assumptions & Trade-offs

1.Onboarding page instead of inline signup flow

2.Middleware performs a DB query on every request, gives more speed but less optimization

3.Follow system is team-to-team, not user-to-team, cant collect more data

4.Search uses `ILIKE`, not full-text search

---

## What I Would Improve With More Time

1.JWT custom claims for onboarding state

2.pgTAP RLS tests

3.Optimistic UI updates

4.Rate limiting on post creation & DB query optimization

5.Logging,Monitoring & Algorithmic Feed

---
