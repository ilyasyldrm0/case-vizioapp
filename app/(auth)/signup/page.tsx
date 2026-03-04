"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUpWithEmail, signInWithGoogle } from "@/app/actions/auth";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function SignupPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [isPending, start]    = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const result = await signUpWithEmail(formData);
      if (result?.error)   setError(result.error);
      if (result?.message) setMessage(result.message);
    });
  }

  return (
    <main className="min-h-screen flex">

      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0f0f0f] border-r border-white/5 p-12">
        <span className="text-xl font-black tracking-tight">
          V.<span className="text-[#e8ff47]">SOCIAL</span>
        </span>
        <div>
          <p className="text-4xl font-black leading-tight tracking-tighter mb-4">
            Yeni bir<br />takım,<br />yeni bir ses.
          </p>
          <p className="text-sm font-mono text-[#f0ede6b0]">
            Kayıt olduğunda otomatik olarak bir takım oluşturulur.
          </p>
        </div>
        <p className="text-xs font-mono text-[#f0ede640]">© 2026 Vizio Ventures</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hesap Oluştur</h2>
            <p className="text-sm mt-1 text-[#f0ede6b0]">
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="text-[#e8ff47] hover:underline">Giriş yap</Link>
            </p>
          </div>

          {message ? (
            <div className="bg-[#e8ff47]/10 border border-[#e8ff47]/30 rounded-xl p-4 text-sm">
              <p className="font-semibold text-[#e8ff47] mb-1">Neredeyse tamam!</p>
              <p className="text-[#f0ede6b0]">{message}</p>
            </div>
          ) : (
            <>
              <form action={signInWithGoogle}>
                <button type="submit" className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-xl py-3 text-sm font-medium hover:bg-white/5 transition-colors">
                  <GoogleIcon />
                  Google ile kaydol
                </button>
              </form>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-mono text-[#f0ede640]">ya da</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-[#f0ede6b0]">E-posta</label>
                  <input
                    name="email" type="email" required autoComplete="email"
                    placeholder="takim@ornek.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8ff47]/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-[#f0ede6b0]">Şifre</label>
                  <input
                    name="password" type="password" required autoComplete="new-password"
                    placeholder="En az 6 karakter" minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e8ff47]/50 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit" disabled={isPending}
                  className="w-full bg-[#e8ff47] text-[#0a0a0a] font-bold py-3 rounded-xl text-sm hover:bg-[#d4eb2e] transition-colors disabled:opacity-50"
                >
                  {isPending ? "Oluşturuluyor..." : "Takımı Oluştur"}
                </button>

                <p className="text-xs text-center font-mono text-[#f0ede640]">
                  Kaydolunca otomatik bir takım profili oluşturulur.
                </p>
              </form>
            </>
          )}

        </div>
      </div>
    </main>
  );
}