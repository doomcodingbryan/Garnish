import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/signup"];

export async function proxy(request: NextRequest) {
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
