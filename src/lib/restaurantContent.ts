import { hash } from "@/lib/images";
import { FOLLOWER_TIERS, NICHE_TAGS } from "@/lib/utils";

// Deterministic placeholder signals for restaurant cards, seeded by name — same
// philosophy as images.ts / creatorContent.ts: realistic stand-ins until real
// data exists.
// ponytail: stubs — replace with real budget / preferences / reviews columns later.

export type CompKind = "paid" | "comp" | "both";
export interface Compensation {
  kind: CompKind;
  minCents: number;
  maxCents: number;
}

export function compFor(seed: string): Compensation {
  const h = hash(`${seed}#comp`);
  const roll = h % 10;
  const kind: CompKind = roll < 6 ? "paid" : roll < 8 ? "both" : "comp";
  const min = 150 + (h % 8) * 50; // $150–$500
  const max = min + 150 + (hash(`${seed}#comp2`) % 6) * 100; // +$150–$650
  return { kind, minCents: min * 100, maxCents: max * 100 };
}

/** Fit score for the viewing creator. ponytail: not yet personalized — seeded by
 * restaurant only. Replace with real niche/audience overlap once both sides set
 * preferences. */
export function matchScoreFor(seed: string): number {
  return 70 + (hash(`${seed}#match`) % 28); // 70–97
}

export function reviewCountFor(seed: string): number {
  return 5 + (hash(`${seed}#rc`) % 40); // 5–44
}

const PRICE_TIERS = ["$", "$$", "$$$", "$$$$"] as const;
export function priceTierFor(seed: string): string {
  const roll = hash(`${seed}#price`) % 10;
  const idx = roll < 2 ? 0 : roll < 6 ? 1 : roll < 9 ? 2 : 3; // skew to $$/$$$
  return PRICE_TIERS[idx];
}

export function collabsBookedFor(seed: string): number {
  return 4 + (hash(`${seed}#booked`) % 36); // 4–39
}

export function responseDaysFor(seed: string): number {
  return 1 + (hash(`${seed}#resp`) % 4); // 1–4 days
}

const ASKS = [
  "1 Reel + 3 stories, tag & location",
  "1 TikTok + 2 stories, tag & location",
  "1 in-feed post + 2 stories",
  "2 stories + 1 carousel post",
];
export function typicalAskFor(seed: string): string {
  return ASKS[hash(`${seed}#ask`) % ASKS.length];
}

export interface IdealCreator {
  niches: string[];
  tier: string;
  platforms: string[];
}
const PLATFORMS = ["Instagram", "TikTok", "YouTube"];
export function idealCreatorFor(seed: string): IdealCreator {
  const s = hash(`${seed}#ideal`);
  const niches = [
    NICHE_TAGS[s % NICHE_TAGS.length],
    NICHE_TAGS[(s + 4) % NICHE_TAGS.length],
  ];
  const tier = FOLLOWER_TIERS[hash(`${seed}#tier`) % FOLLOWER_TIERS.length].label;
  const platforms = [PLATFORMS[s % 3], PLATFORMS[(s + 1) % 3]];
  return { niches, tier, platforms };
}

const CREATOR_POOL = [
  "Maya Chen",
  "Devon Park",
  "Sofia Rossi",
  "Liam Walsh",
  "Ava Nguyen",
  "Marcus Lee",
  "Priya Nair",
  "Hana Sato",
];
export function pastCreatorsFor(seed: string, count = 5): string[] {
  const start = hash(`${seed}#past`);
  return Array.from({ length: Math.min(count, CREATOR_POOL.length) }, (_, i) =>
    CREATOR_POOL[(start + i) % CREATOR_POOL.length]
  );
}

export interface RestaurantReview {
  id: string;
  creator: string;
  rating: number;
  body: string;
  daysAgo: number;
}
const RESTO_REVIEW_BLURBS = [
  "Smooth shoot and great hospitality. They used my content everywhere afterward.",
  "Clear brief, paid on time, and the space photographs beautifully.",
  "Generous comp plus a fair rate. The team made filming effortless.",
  "They knew what they wanted but still gave me real creative freedom.",
  "Lovely staff and a gorgeous room. Already planning the next collab.",
  "Quick to respond and very organized. The dishes shot incredibly well.",
];
export function restaurantReviewsFor(seed: string, count = 3): RestaurantReview[] {
  const base = hash(`${seed}#rev`);
  return Array.from({ length: count }, (_, i) => {
    const h = hash(`${seed}#rev${i}`);
    return {
      id: `${seed}-rev-${i}`,
      creator: CREATOR_POOL[(base + i) % CREATOR_POOL.length],
      rating: Math.round((4 + (h % 10) / 10) * 10) / 10,
      body: RESTO_REVIEW_BLURBS[h % RESTO_REVIEW_BLURBS.length],
      daysAgo: 5 + (h % 120),
    };
  });
}
