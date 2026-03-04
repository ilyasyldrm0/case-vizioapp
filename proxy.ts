import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage      = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isOnboardingPage = pathname === "/onboarding";
  const isTeamsPage     = pathname.startsWith("/teams");

  // Giriş yapılmamış → /teams korumalı
  if (isTeamsPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Giriş yapılmış → auth sayfalarından uzaklaştır
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Giriş yapılmış kullanıcı: onboarding durumunu kontrol et
  if (user && !isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, team_id")
      .eq("id", user.id)
      .maybeSingle();

    const needsOnboarding = !profile?.username || !profile?.team_id;

    // Onboarding tamamlanmamış → /onboarding'e yönlendir
    if (needsOnboarding && !isOnboardingPage) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Onboarding zaten tamamlanmış → /onboarding'e erişimi engelle
    if (!needsOnboarding && isOnboardingPage) {
      return NextResponse.redirect(new URL("/feed", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
