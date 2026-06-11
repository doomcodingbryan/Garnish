export type UserRole = "creator" | "restaurant";
export type ProposalStatus =
  | "pending"
  | "countered"
  | "accepted"
  | "declined"
  | "withdrawn";
export type MatchStatus =
  | "pending_both"
  | "pending_creator"
  | "pending_restaurant"
  | "confirmed";

export interface UserProfile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  bio: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  follower_count: number;
  engagement_rate: number | null;
  niche_tags: string[];
  flat_rate_cents: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface RestaurantProfile {
  id: string;
  user_id: string;
  name: string;
  cuisine: string;
  location: string;
  aesthetic_description: string | null;
  collab_types: string[];
  description: string | null;
  is_accepting_collabs: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  initiator_id: string;
  recipient_id: string;
  initiator_role: UserRole;
  creator_id: string;
  restaurant_id: string;
  status: ProposalStatus;
  counter_count: 0 | 1;
  meal_description: string | null;
  deliverables: string;
  posting_window_days: number;
  payment_cents: number;
  message: string | null;
  counter_terms: CounterTerms | null;
  created_at: string;
  updated_at: string;
}

export interface CounterTerms {
  meal_description: string | null;
  deliverables: string;
  posting_window_days: number;
  payment_cents: number;
  message: string | null;
  countered_by_role: UserRole;
}

export interface Match {
  id: string;
  proposal_id: string;
  creator_id: string;
  restaurant_id: string;
  deliverables: string;
  posting_deadline: string;
  payment_cents: number;
  status: MatchStatus;
  creator_confirmed_at: string | null;
  restaurant_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProposalWithParties = Proposal & {
  initiator: Pick<UserProfile, "id" | "display_name" | "avatar_url">;
  recipient: Pick<UserProfile, "id" | "display_name" | "avatar_url">;
};

export type MatchWithParties = Match & {
  creator: Pick<UserProfile, "id" | "display_name" | "avatar_url">;
  restaurant: Pick<UserProfile, "id" | "display_name" | "avatar_url">;
};

export type CreatorWithProfile = CreatorProfile & {
  user: Pick<UserProfile, "id" | "display_name" | "avatar_url" | "role">;
};

export type RestaurantWithProfile = RestaurantProfile & {
  user: Pick<UserProfile, "id" | "display_name" | "avatar_url" | "role">;
};
