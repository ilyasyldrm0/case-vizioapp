import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  // Giriş yapılmış kullanıcı: onboarding tamamlanmamışsa /onboarding'e yönlendir
  if (user && !isAuthPage && !isOnboardingPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, team_id")
      .eq("id", user.id)
      .maybeSingle();

    const needsOnboarding = !profile?.username || !profile?.team_id;
    if (needsOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
