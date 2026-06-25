import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { DEV_AUTH_BYPASS, getDevRole } from "@/lib/dev";
import { createMockClient } from "@/lib/supabase/mock";

export async function createClient() {
  if (DEV_AUTH_BYPASS) {
    return createMockClient(await getDevRole()) as unknown as SupabaseClient;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookie setting is a no-op here
          }
        },
      },
    }
  );
}
