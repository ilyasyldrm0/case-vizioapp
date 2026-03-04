import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let username: string | null = null;
  let teamSlug: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, team_id")
      .eq("id", user.id)
      .maybeSingle();

    username = profile?.username ?? null;

    if (profile?.team_id) {
      const { data: team } = await supabase
        .from("teams")
        .select("slug")
        .eq("id", profile.team_id)
        .maybeSingle();
      teamSlug = team?.slug ?? null;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10,
      }}>
        <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em" }}>
          V.<span style={{ color: "#e8ff47" }}>SOCIAL</span>
        </span>

        {user ? (
          /* Giriş yapılmış → kullanıcı adı + Çıkış */
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {username && (
              teamSlug ? (
                <Link
                  href={`/teams/${teamSlug}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(240,237,230,0.75)",
                    fontFamily: "var(--font-mono)",
                    textDecoration: "none",
                    padding: "4px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    letterSpacing: "0.01em",
                  }}
                >
                  @{username}
                </Link>
              ) : (
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(240,237,230,0.75)",
                  fontFamily: "var(--font-mono)",
                  padding: "4px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  letterSpacing: "0.01em",
                }}>
                  @{username}
                </span>
              )
            )}
            <form action={signOut}>
              <button
                type="submit"
                style={{
                  fontSize: 13,
                  color: "rgba(240,237,230,0.4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                Çıkış
              </button>
            </form>
          </div>
        ) : (
          /* Giriş yapılmamış → Giriş Yap / Kaydol butonları */
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/login"
              style={{
                fontSize: 13,
                color: "rgba(240,237,230,0.5)",
                textDecoration: "none",
                padding: "4px 8px",
                transition: "color 0.2s",
              }}
            >
              Giriş Yap
            </Link>
            <Link
              href="/signup"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0a0a0a",
                background: "#e8ff47",
                textDecoration: "none",
                padding: "6px 16px",
                borderRadius: 999,
                letterSpacing: "-0.01em",
              }}
            >
              Kaydol
            </Link>
          </div>
        )}
      </nav>

      {children}
    </div>
  );
}
