import { cookies } from "next/headers";
import type {
  CreatorPlatform,
  CreatorProfile,
  RestaurantProfile,
  UserProfile,
} from "@/types/database";

/**
 * Local dev login bypass. When DEV_AUTH_BYPASS is set, the app skips Supabase
 * auth entirely: the proxy stops redirecting, and the server/service Supabase
 * clients are swapped for an in-memory mock that serves the fixtures below.
 * This lets the app run fully offline while the real backend is unavailable.
 *
 * Server-only flag (NOT NEXT_PUBLIC) so it can never be flipped from the client
 * and is never bundled into the browser.
 */
export const DEV_AUTH_BYPASS =
  process.env.NODE_ENV !== "production" &&
  process.env.DEV_AUTH_BYPASS === "true";

export type DevRole = "creator" | "restaurant";
export const DEV_ROLE_COOKIE = "dev_role";
export const DEFAULT_DEV_ROLE: DevRole = "restaurant";

/** Resolve the dev role from the `dev_role` cookie (set by the proxy from ?devRole=). */
export async function getDevRole(): Promise<DevRole> {
  try {
    const store = await cookies();
    const v = store.get(DEV_ROLE_COOKIE)?.value;
    return v === "creator" || v === "restaurant" ? v : DEFAULT_DEV_ROLE;
  } catch {
    return DEFAULT_DEV_ROLE;
  }
}

export interface DevAuthUser {
  id: string;
  email: string;
}

const DEV_IDS: Record<DevRole, string> = {
  restaurant: "dev-restaurant",
  creator: "dev-creator",
};

/** The fake authenticated user for the current dev role. */
export function devUser(role: DevRole): DevAuthUser {
  return { id: DEV_IDS[role], email: `dev-${role}@garnish.test` };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

type CreatorRowFx = CreatorProfile & {
  user: Pick<UserProfile, "id" | "display_name" | "avatar_url" | "role">;
};
type RestaurantRowFx = RestaurantProfile & {
  user: Pick<UserProfile, "id" | "display_name" | "avatar_url" | "role">;
};

function user(
  id: string,
  display_name: string,
  role: DevRole,
  onboarding_complete = true
): UserProfile {
  return {
    id,
    role,
    display_name,
    avatar_url: null,
    onboarding_complete,
    created_at: now,
    updated_at: now,
  };
}

function creator(
  id: string,
  userId: string,
  name: string,
  opts: Partial<CreatorProfile>
): CreatorRowFx {
  return {
    id,
    user_id: userId,
    bio: "Food creator sharing the best bites in town.",
    instagram_handle: name.toLowerCase().replace(/\s+/g, ""),
    tiktok_handle: name.toLowerCase().replace(/\s+/g, ""),
    youtube_handle: null,
    follower_count: 50_000,
    engagement_rate: 4.5,
    niche_tags: ["Brunch", "Coffee & Cafes"],
    flat_rate_cents: 35_000,
    location: "Brooklyn, NY",
    ugc_score: null,
    ugc_tier: null,
    ugc_components: null,
    ugc_scored_at: null,
    created_at: now,
    updated_at: now,
    user: { id: userId, display_name: name, avatar_url: null, role: "creator" },
    ...opts,
  };
}

function restaurant(
  id: string,
  userId: string,
  name: string,
  opts: Partial<RestaurantProfile>
): RestaurantRowFx {
  return {
    id,
    user_id: userId,
    name,
    cuisine: "Italian",
    location: "Brooklyn, NY",
    aesthetic_description: "Warm, candle-lit, rustic plating.",
    collab_types: ["Paid Post", "Event Coverage"],
    description: "A neighborhood favorite open to creative collaborations.",
    is_accepting_collabs: true,
    created_at: now,
    updated_at: now,
    user: { id: userId, display_name: name, avatar_url: null, role: "restaurant" },
    ...opts,
  };
}

// Browseable creators (shown when viewing as a restaurant) + the dev creator.
const CREATORS: CreatorRowFx[] = [
  creator("cp-1", "creator-1", "Maya Chen", {
    follower_count: 184_200,
    engagement_rate: 6.1,
    youtube_handle: "mayaeats",
    niche_tags: ["Brunch", "Coffee & Cafes", "Fine Dining"],
    flat_rate_cents: 45_000,
    ugc_score: 88,
    ugc_tier: "Elite",
    ugc_components: { engagement: 84, reach: 90, consistency: 92, breadth: 75, confidence: 0.65 },
    ugc_scored_at: daysAgo(2),
  }),
  creator("cp-2", "creator-2", "Devon Park", {
    follower_count: 92_400,
    engagement_rate: 5.2,
    niche_tags: ["Street Food", "Asian Cuisine"],
    flat_rate_cents: 28_000,
    ugc_score: 74,
    ugc_tier: "Strong",
    ugc_components: { engagement: 73, reach: 68, consistency: 80, breadth: 40, confidence: 0.3 },
    ugc_scored_at: daysAgo(5),
  }),
  creator("cp-3", "creator-3", "Sofia Rossi", {
    follower_count: 31_800,
    engagement_rate: 3.4,
    niche_tags: ["Bakery & Desserts"],
    flat_rate_cents: 15_000,
    ugc_score: 52,
    ugc_tier: "Rising",
    ugc_components: { engagement: 48, reach: 0, consistency: 60, breadth: 40, confidence: 0.3 },
    ugc_scored_at: daysAgo(9),
  }),
  creator("cp-4", "creator-4", "Liam Walsh", {
    follower_count: 12_500,
    niche_tags: ["BBQ & Grill", "Casual"],
    flat_rate_cents: null,
    // intentionally unscored to exercise the "Not scored yet" state
  }),
  creator("cp-dev", "dev-creator", "Dev Creator", {
    follower_count: 64_000,
    engagement_rate: 5.0,
    youtube_handle: "devcreator",
    ugc_score: 71,
    ugc_tier: "Strong",
    ugc_components: { engagement: 70, reach: 72, consistency: 74, breadth: 75, confidence: 0.65 },
    ugc_scored_at: daysAgo(1),
  }),
];

// Browseable restaurants (shown when viewing as a creator) + the dev restaurant.
const RESTAURANTS: RestaurantRowFx[] = [
  restaurant("rp-1", "restaurant-1", "Bottega Rosso", { cuisine: "Italian" }),
  restaurant("rp-2", "restaurant-2", "Hana Izakaya", {
    cuisine: "Japanese",
    collab_types: ["Complimentary Meal", "Grand Opening"],
  }),
  restaurant("rp-3", "restaurant-3", "El Jardín", {
    cuisine: "Mexican",
    collab_types: ["Paid Post", "Seasonal Campaign"],
  }),
  restaurant("rp-4", "restaurant-4", "The Copper Pot", {
    cuisine: "Farm-to-Table",
    collab_types: ["Event Coverage", "Behind the Scenes"],
  }),
  restaurant("rp-dev", "dev-restaurant", "Dev Bistro", { cuisine: "American" }),
];

const PLATFORMS: CreatorPlatform[] = [
  {
    id: "plat-1",
    creator_id: "cp-1",
    platform: "youtube",
    handle: "mayaeats",
    profile_url: null,
    followers: 120_000,
    metrics: null,
    source: "api",
    last_synced_at: daysAgo(2),
    created_at: now,
    updated_at: now,
  },
  {
    id: "plat-2",
    creator_id: "cp-1",
    platform: "instagram",
    handle: "mayaeats",
    profile_url: null,
    followers: 184_200,
    metrics: null,
    source: "manual",
    last_synced_at: daysAgo(2),
    created_at: now,
    updated_at: now,
  },
  {
    id: "plat-dev",
    creator_id: "cp-dev",
    platform: "youtube",
    handle: "devcreator",
    profile_url: null,
    followers: 64_000,
    metrics: null,
    source: "api",
    last_synced_at: daysAgo(1),
    created_at: now,
    updated_at: now,
  },
];

const USERS: UserProfile[] = [
  user("dev-restaurant", "Dev Bistro", "restaurant"),
  user("dev-creator", "Dev Creator", "creator"),
  ...CREATORS.filter((c) => c.user_id !== "dev-creator").map((c) =>
    user(c.user_id, c.user.display_name, "creator")
  ),
  ...RESTAURANTS.filter((r) => r.user_id !== "dev-restaurant").map((r) =>
    user(r.user_id, r.user.display_name, "restaurant")
  ),
];

/** All fixture rows keyed by table name, for the mock client. */
export function devFixtures(): Record<string, Record<string, unknown>[]> {
  return {
    user_profiles: USERS as unknown as Record<string, unknown>[],
    creator_profiles: CREATORS as unknown as Record<string, unknown>[],
    restaurant_profiles: RESTAURANTS as unknown as Record<string, unknown>[],
    creator_platforms: PLATFORMS as unknown as Record<string, unknown>[],
    proposals: [],
    matches: [],
  };
}
