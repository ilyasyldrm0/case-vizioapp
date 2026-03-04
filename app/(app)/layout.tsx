import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
          /* Giriş yapılmış → Çıkış butonu */
          <form action={signOut}>
            <button
              type="submit"
              style={{
                fontSize: 13,
                color: "rgba(240,237,230,0.5)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Çıkış
            </button>
          </form>
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
