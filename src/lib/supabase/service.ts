import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEV_AUTH_BYPASS, DEFAULT_DEV_ROLE } from "@/lib/dev";
import { createMockClient } from "@/lib/supabase/mock";

// Service role client — SERVER ONLY. Never import in client components.
export function createServiceClient() {
  if (DEV_AUTH_BYPASS) {
    // Service client has no auth-user concept; role only affects auth.getUser.
    return createMockClient(DEFAULT_DEV_ROLE) as unknown as SupabaseClient;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
