"use client";

import { useRef, useState, useTransition } from "react";
import { createPost } from "@/app/actions/posts";

export default function PostForm() {
  const formRef            = useRef<HTMLFormElement>(null);
  const [error, setError]  = useState<string | null>(null);
  const [isPending, start] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(formRef.current!);
    start(async () => {
      const result = await createPost(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
      padding: 20, marginBottom: 32,
    }}>
      <textarea
        name="content"
        rows={3}
        maxLength={500}
        required
        placeholder="Takımın adına bir şeyler yaz..."
        style={{
          width: "100%", background: "transparent", border: "none",
          color: "#f0ede6", fontSize: 15, resize: "none", outline: "none",
          fontFamily: "var(--font-syne)",
        }}
      />
      {error && (
        <p style={{
          fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.1)",
          border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8,
          padding: "8px 12px", marginTop: 8,
        }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            background: isPending ? "rgba(232,255,71,0.5)" : "#e8ff47",
            color: "#0a0a0a", fontWeight: 700, padding: "8px 20px",
            borderRadius: 999, border: "none", fontSize: 13, cursor: isPending ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {isPending ? "Gönderiliyor..." : "Paylaş"}
        </button>
      </div>
    </form>
  );
}