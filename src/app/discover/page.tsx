import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import { CreatorCard, type CreatorRow } from "@/components/CreatorCard";
import { RestaurantCard, type RestaurantRow } from "@/components/RestaurantCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { FOLLOWER_TIERS } from "@/lib/utils";

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  page?: string;
  location?: string;
  niche?: string;
  tier?: string;
  max_rate?: string;
  cuisine?: string;
  collab_type?: string;
}>;

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/auth/login");

  const role = profile.role as "creator" | "restaurant";
  const page = Math.max(1, Number(params.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  let content: React.ReactNode;

  if (role === "restaurant") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("creator_profiles")
      .select("*, user:user_profiles!creator_profiles_user_id_fkey(id, display_name, avatar_url)")
      .order("follower_count", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (params.location) query = query.ilike("location", `%${params.location}%`);
    if (params.niche) query = query.overlaps("niche_tags", [params.niche]);
    if (params.max_rate) query = query.lte("flat_rate_cents", Number(params.max_rate) * 100);
    if (params.tier) {
      const tier = FOLLOWER_TIERS.find((t) => t.label === params.tier);
      if (tier) {
        query = query.gte("follower_count", tier.min);
        if (tier.max) query = query.lte("follower_count", tier.max);
      }
    }

    const { data } = await query;
    const creators = (data ?? []) as CreatorRow[];

    content =
      creators.length === 0 ? (
        <EmptyState message="No creators match your filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      );
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("restaurant_profiles")
      .select("*, user:user_profiles!restaurant_profiles_user_id_fkey(id, display_name, avatar_url)")
      .eq("is_accepting_collabs", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (params.location) query = query.ilike("location", `%${params.location}%`);
    if (params.cuisine) query = query.ilike("cuisine", `%${params.cuisine}%`);
    if (params.collab_type) query = query.overlaps("collab_types", [params.collab_type]);

    const { data } = await query;
    const restaurants = (data ?? []) as RestaurantRow[];

    content =
      restaurants.length === 0 ? (
        <EmptyState message="No restaurants match your filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {role === "restaurant" ? "Find creators" : "Find restaurants"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {role === "restaurant"
              ? "Browse creators and send them a collab proposal."
              : "Browse restaurants open to creator collaborations."}
          </p>
        </div>
        <div className="flex gap-10">
          <Suspense fallback={<div className="w-52 shrink-0" />}>
            <FilterSidebar role={role} />
          </Suspense>
          <div className="flex-1 min-w-0">{content}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}
