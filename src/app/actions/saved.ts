"use server";

import { createClient } from "@/lib/supabase/server";
import type { CreatorRow } from "@/components/CreatorCard";
import type { RestaurantRow } from "@/components/RestaurantCard";

/**
 * Fetch the saved profiles by user id. The shortlist itself lives client-side
 * (localStorage), so the ids come from the browser; we hydrate them to full
 * rows here, split by role. ponytail: no auth filter — the shortlist is local
 * and public profiles are readable anyway.
 */
export async function getSavedProfiles(ids: string[]): Promise<{
  creators: CreatorRow[];
  restaurants: RestaurantRow[];
}> {
  if (ids.length === 0) return { creators: [], restaurants: [] };

  const supabase = await createClient();

  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, role")
    .in("id", ids);

  const rows = (users ?? []) as { id: string; role: string }[];
  const creatorIds = rows.filter((u) => u.role === "creator").map((u) => u.id);
  const restaurantIds = rows.filter((u) => u.role === "restaurant").map((u) => u.id);

  const [creators, restaurants] = await Promise.all([
    creatorIds.length
      ? supabase
          .from("creator_profiles")
          .select(
            "*, user:user_profiles!creator_profiles_user_id_fkey(id, display_name, avatar_url)"
          )
          .in("user_id", creatorIds)
      : Promise.resolve({ data: [] }),
    restaurantIds.length
      ? supabase
          .from("restaurant_profiles")
          .select(
            "*, user:user_profiles!restaurant_profiles_user_id_fkey(id, display_name, avatar_url)"
          )
          .in("user_id", restaurantIds)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    creators: (creators.data ?? []) as CreatorRow[],
    restaurants: (restaurants.data ?? []) as RestaurantRow[],
  };
}
