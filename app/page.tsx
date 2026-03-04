import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/feed");

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0a", color: "#f0ede6", overflow: "hidden", position: "relative" }}>

      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
        backgroundImage: "linear-gradient(#f0ede6 1px, transparent 1px), linear-gradient(90deg, #f0ede6 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Accent blob */}
      <div style={{
        position: "absolute", top: "-20%", right: "-10%",
        width: 600, height: 600, borderRadius: "50%", opacity: 0.12,
        filter: "blur(120px)", pointerEvents: "none",
        background: "radial-gradient(circle, #e8ff47 0%, transparent 70%)",
      }} />

      {/* Nav */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>
          V.<span style={{ color: "#e8ff47" }}>SOCIAL</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/login" style={{ fontSize: 14, color: "rgba(240,237,230,0.6)", textDecoration: "none" }}>
            Giriş Yap
          </Link>
          <Link href="/signup" style={{
            fontSize: 14, fontWeight: 700, padding: "8px 20px",
            background: "#e8ff47", color: "#0a0a0a", borderRadius: 999,
            textDecoration: "none",
          }}>
            Başla
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative", zIndex: 10, flex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", gap: 32,
        padding: "96px 24px",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999,
          padding: "6px 16px", fontSize: 12, color: "rgba(240,237,230,0.6)",
          fontFamily: "var(--font-mono)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8ff47", display: "inline-block" }} />
          Vizio Ventures · MVP v0.1
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(56px, 10vw, 96px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em", margin: 0 }}>
          Takımın
          <br />
          <span style={{ WebkitTextStroke: "2px #f0ede6", color: "transparent", display: "inline-block" }}>
            adına
          </span>
          <br />
          konuş.
        </h1>

        {/* Sub */}
        <p style={{ fontSize: 16, maxWidth: 400, lineHeight: 1.7, color: "rgba(240,237,230,0.6)", fontFamily: "var(--font-mono)", margin: 0 }}>
          Bireysel profil yok. Takımın konuşur,
          takımın takip eder, takımın büyür.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#e8ff47", color: "#0a0a0a", fontWeight: 700,
            padding: "16px 32px", borderRadius: 999, fontSize: 15, textDecoration: "none",
          }}>
            Takımını Oluştur →
          </Link>
          <Link href="/feed" style={{
            display: "inline-flex", alignItems: "center",
            padding: "16px 32px", borderRadius: 999, fontSize: 14,
            border: "1px solid rgba(255,255,255,0.12)", color: "rgba(240,237,230,0.6)",
            textDecoration: "none",
          }}>
            Feed&apos;e Göz At
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "32px",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
        }}>
          {[
            { num: "01", title: "Takım Kimliği", desc: "Her paylaşım takımın adına yapılır." },
            { num: "02", title: "Takip Sistemi", desc: "Takımlar birbirini takip eder." },
            { num: "03", title: "Global Feed",   desc: "Tüm takımların paylaşımları tek akışta." },
          ].map((f) => (
            <div key={f.num} style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 11, color: "#e8ff47", fontFamily: "var(--font-mono)", marginTop: 2, flexShrink: 0 }}>
                {f.num}
              </span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>{f.title}</p>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(240,237,230,0.6)", margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}