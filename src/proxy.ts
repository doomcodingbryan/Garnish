import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEV_AUTH_BYPASS, DEV_ROLE_COOKIE } from "@/lib/dev";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/signup"];

export async function proxy(request: NextRequest) {
  // Dev login bypass: never redirect, and let ?devRole= switch the active role.
  if (DEV_AUTH_BYPASS) {
    const response = NextResponse.next({ request });
    // Ignore prefetch requests — they'd otherwise clobber the cookie with a
    // link target the user never actually clicked.
    const isPrefetch =
      request.headers.get("next-router-prefetch") === "1" ||
      request.headers.get("purpose") === "prefetch";
    const devRole = request.nextUrl.searchParams.get("devRole");
    if (!isPrefetch && (devRole === "creator" || devRole === "restaurant")) {
      response.cookies.set(DEV_ROLE_COOKIE, devRole, { path: "/" });
    }
    return response;
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p);

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (user && !isPublic && !path.startsWith("/onboarding")) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, onboarding_complete")
      .eq("id", user.id)
      .single();

    if (profile && !profile.onboarding_complete) {
      return NextResponse.redirect(
        new URL(`/onboarding/${profile.role}`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
