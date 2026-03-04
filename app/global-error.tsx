"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#f0ede6",
          fontFamily: "Syne, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
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
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#e8ff47",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Kritik Hata
          </span>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Üzgünüz, bir hata oluştu.
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "rgba(240,237,230,0.55)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Daha sonra tekrar deneyin. Sorun devam ederse lütfen bizimle iletişime geçin.
          </p>

          <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.1)" }} />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0a0a0a",
                background: "#e8ff47",
                border: "none",
                cursor: "pointer",
                padding: "10px 24px",
                borderRadius: 999,
                letterSpacing: "-0.01em",
              }}
            >
              Tekrar Dene
            </button>

            <a
              href="/"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(240,237,230,0.6)",
                background: "rgba(255,255,255,0.06)",
                textDecoration: "none",
                padding: "10px 24px",
                borderRadius: 999,
                letterSpacing: "-0.01em",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
