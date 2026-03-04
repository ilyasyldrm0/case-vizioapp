"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  createTeamAndComplete,
  joinTeamAndComplete,
  searchTeams,
  checkUsername,
} from "@/app/actions/onboarding";
import { slugify } from "@/lib/utils";
import type { Team } from "@/types/database";

type Mode = "create" | "join";

export default function OnboardingPage() {
  const [mode, setMode]               = useState<Mode>("create");
  const [username, setUsername]       = useState("");
  const [usernameMsg, setUsernameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [teamName, setTeamName]       = useState("");
  const [teamSlug, setTeamSlug]       = useState("");
  const [slugEdited, setSlugEdited]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam]   = useState<Team | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [isPending, start]            = useTransition();

  const usernameTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimeout   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kullanıcı adı debounce kontrolü
  useEffect(() => {
    setUsernameMsg(null);
    if (usernameTimeout.current) clearTimeout(usernameTimeout.current);
    if (!username) return;

    usernameTimeout.current = setTimeout(async () => {
      const result = await checkUsername(username);
      if (result.error) {
        setUsernameMsg({ ok: false, text: result.error });
      } else {
        setUsernameMsg({
          ok: result.available,
          text: result.available ? "Kullanıcı adı müsait ✓" : "Bu kullanıcı adı alınmış.",
        });
      }
    }, 500);

    return () => { if (usernameTimeout.current) clearTimeout(usernameTimeout.current); };
  }, [username]);

  // Takım adından slug otomatik üretimi
  useEffect(() => {
    if (!slugEdited) setTeamSlug(slugify(teamName));
  }, [teamName, slugEdited]);

  // Takım arama debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSelectedTeam(null);

    searchTimeout.current = setTimeout(async () => {
      const results = await searchTeams(searchQuery);
      setSearchResults(results);
    }, 400);

    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.append("username", username);

    if (mode === "create") {
      fd.append("teamName", teamName);
      fd.append("teamSlug", teamSlug);
      start(async () => {
        const result = await createTeamAndComplete(fd);
        if (result?.error) setError(result.error);
      });
    } else {
      if (!selectedTeam) { setError("Bir takım seçmelisin."); return; }
      fd.append("teamId", selectedTeam.id);
      start(async () => {
        const result = await joinTeamAndComplete(fd);
        if (result?.error) setError(result.error);
      });
    }
  }

  /* ── Styles ──────────────────────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#f0ede6", fontSize: 14, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: "rgba(240,237,230,0.5)",
    textTransform: "uppercase", letterSpacing: "0.06em",
    fontFamily: "var(--font-mono)", marginBottom: 6, display: "block",
  };

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "32px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Başlık */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
            Merhaba 👋
          </h1>
          <p style={{ fontSize: 14, color: "rgba(240,237,230,0.5)", margin: 0 }}>
            Devam etmek için bir kullanıcı adı seç ve takımına katıl.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Kullanıcı adı */}
          <div>
            <label style={labelStyle}>Kullanıcı Adı</label>
            <input
              style={inputStyle}
              placeholder="örn. johndoe"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
              required
              disabled={isPending}
            />
            {usernameMsg && (
              <p style={{
                fontSize: 12, marginTop: 6, fontFamily: "var(--font-mono)",
                color: usernameMsg.ok ? "#e8ff47" : "#ff6b6b",
              }}>
                {usernameMsg.text}
              </p>
            )}
          </div>

          {/* Mode toggle */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden",
          }}>
            {(["create", "join"] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                disabled={isPending}
                style={{
                  padding: "12px 0", fontSize: 13, fontWeight: 700,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: mode === m ? "#e8ff47" : "transparent",
                  color: mode === m ? "#0a0a0a" : "rgba(240,237,230,0.5)",
                }}
              >
                {m === "create" ? "Takım Kur" : "Takıma Katıl"}
              </button>
            ))}
          </div>

          {/* Create: takım adı + slug */}
          {mode === "create" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Takım Adı</label>
                <input
                  style={inputStyle}
                  placeholder="örn. Vizio Dev"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div>
                <label style={labelStyle}>Slug (URL)</label>
                <input
                  style={inputStyle}
                  placeholder="örn. vizio-dev"
                  value={teamSlug}
                  onChange={e => { setTeamSlug(e.target.value.toLowerCase()); setSlugEdited(true); }}
                  required
                  disabled={isPending}
                />
                <p style={{ fontSize: 11, marginTop: 5, color: "rgba(240,237,230,0.35)", fontFamily: "var(--font-mono)" }}>
                  case-vizioapp.vercel.app/teams/{teamSlug || "..."}
                </p>
              </div>
            </div>
          )}

          {/* Join: takım arama */}
          {mode === "join" && (
            <div>
              <label style={labelStyle}>Takım Ara</label>
              <input
                style={inputStyle}
                placeholder="Takım adı veya slug..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={isPending}
              />

              {/* Arama sonuçları */}
              {searchResults.length > 0 && (
                <div style={{
                  marginTop: 8, border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, overflow: "hidden",
                }}>
                  {searchResults.map(team => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => { setSelectedTeam(team); setSearchQuery(""); setSearchResults([]); }}
                      style={{
                        width: "100%", padding: "12px 16px", textAlign: "left",
                        background: "rgba(255,255,255,0.03)", border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer", color: "#f0ede6",
                        transition: "background 0.15s",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{team.name}</span>
                      <span style={{ fontSize: 12, color: "rgba(240,237,230,0.4)", marginLeft: 8, fontFamily: "var(--font-mono)" }}>
                        @{team.slug}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.trim() && searchResults.length === 0 && (
                <p style={{ fontSize: 12, marginTop: 8, color: "rgba(248, 113, 113, 0.4)", fontFamily: "var(--font-mono)" }}>
                  Takım bulunamadı.
                </p>
              )}

              {/* Seçilen takım */}
              {selectedTeam && (
                <div style={{
                  marginTop: 10, padding: "12px 16px", borderRadius: 10,
                  background: "rgba(232,255,71,0.08)", border: "1px solid rgba(232,255,71,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#e8ff47" }}>
                      {selectedTeam.name}
                    </p>
                    <p style={{ fontSize: 12, margin: 0, color: "rgba(240,237,230,0.5)", fontFamily: "var(--font-mono)" }}>
                      @{selectedTeam.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTeam(null)}
                    style={{ background: "none", border: "none", color: "rgba(240,237,230,0.4)", cursor: "pointer", fontSize: 16 }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hata */}
          {error && (
            <p style={{
              fontSize: 13, padding: "10px 14px", borderRadius: 8,
              background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)",
              color: "#ff6b6b", margin: 0,
            }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || (mode === "join" && !selectedTeam)}
            style={{
              padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 800,
              border: "none", cursor: isPending ? "not-allowed" : "pointer",
              background: "#e8ff47", color: "#0a0a0a",
              opacity: isPending ? 0.6 : 1,
              transition: "opacity 0.2s",
              letterSpacing: "-0.01em",
            }}
          >
            {isPending ? "Kaydediliyor..." : mode === "create" ? "Takımı Kur ve Devam Et →" : "Takıma Katıl ve Devam Et →"}
          </button>
        </form>
      </div>
    </main>
  );
}
