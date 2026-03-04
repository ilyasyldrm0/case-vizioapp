import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#f0ede6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        fontFamily: "var(--font-syne, Syne, sans-serif)",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Büyük 404 */}
        <span
          style={{
            fontSize: "clamp(80px, 20vw, 140px)",
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            color: "rgba(240,237,230,0.04)",
            userSelect: "none",
          }}
        >
          404
        </span>

        {/* Hata kodu */}
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 12,
            color: "#e8ff47",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginTop: -16,
          }}
        >
          Sayfa Bulunamadı
        </span>

        {/* Başlık */}
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Aradığın sayfa burada değil.
        </h1>

        {/* Açıklama */}
        <p
          style={{
            fontSize: 15,
            color: "rgba(240,237,230,0.55)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        </p>

        <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.1)" }} />

        <Link
          href="/"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0a0a0a",
            background: "#e8ff47",
            textDecoration: "none",
            padding: "10px 24px",
            borderRadius: 999,
            letterSpacing: "-0.01em",
          }}
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
