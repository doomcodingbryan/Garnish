import { foodImage, FOOD_IMAGES, hash, ratingFor } from "@/lib/images";
import type { CreatorProfile } from "@/types/database";

// Deterministic placeholder content for a creator, seeded by a stable string
// (display name). Same philosophy as images.ts: realistic stand-in data until
// real uploads / connected-platform data exist. Swap these for real queries later.
// ponytail: deterministic stubs, not stored data — replace with tables when real content lands.

export type PortfolioPlatform = "instagram" | "tiktok" | "youtube";

export interface PortfolioItem {
  id: string;
  image: string;
  platform: PortfolioPlatform;
  views: number;
  likes: number;
}

const PLATS: PortfolioPlatform[] = ["instagram", "tiktok", "youtube"];

export function portfolioFor(seed: string, count = 6): PortfolioItem[] {
  const start = hash(seed);
  return Array.from({ length: count }, (_, i) => {
    const h = hash(`${seed}#post${i}`);
    return {
      id: `${seed}-post-${i}`,
      image: foodImage(FOOD_IMAGES[(start + i) % FOOD_IMAGES.length], 500),
      platform: PLATS[h % PLATS.length],
      views: 8_000 + (h % 242) * 1_000,
      likes: 350 + (h % 92) * 100,
    };
  });
}

export interface CreatorReview {
  id: string;
  restaurant: string;
  rating: number;
  body: string;
  daysAgo: number;
}

const REVIEW_RESTAURANTS = [
  "Bottega Rosso",
  "Hana Izakaya",
  "El Jardín",
  "The Copper Pot",
  "Lupo Trattoria",
  "Saffron",
  "Casa Verde",
  "Blue Door Cafe",
];
const REVIEW_BLURBS = [
  "Delivered on time and the footage looked incredible. We booked a follow-up the same week.",
  "Professional from the first message to the final post, and our reservations noticeably jumped.",
  "Captured the vibe of our dining room perfectly. Easy to work with and great communication.",
  "The reel outperformed anything our in-house team has made. Worth every dollar.",
  "Showed up prepared, shot fast, and turned everything around quickly. Highly recommend.",
  "A real eye for plating and light. The content felt authentic, not like a paid ad.",
];

export function reviewsFor(seed: string, count = 3): CreatorReview[] {
  const base = hash(seed);
  return Array.from({ length: count }, (_, i) => {
    const h = hash(`${seed}#rev${i}`);
    return {
      id: `${seed}-rev-${i}`,
      restaurant: REVIEW_RESTAURANTS[(base + i) % REVIEW_RESTAURANTS.length],
      rating: Math.round((4 + (h % 10) / 10) * 10) / 10,
      body: REVIEW_BLURBS[h % REVIEW_BLURBS.length],
      daysAgo: 5 + (h % 120),
    };
  });
}

export function ratingSummaryFor(seed: string): { average: number; count: number } {
  return { average: ratingFor(seed), count: 6 + (hash(`${seed}#rc`) % 38) };
}

export interface Bar {
  label: string;
  pct: number;
}
export interface AudienceData {
  topLocations: Bar[];
  ageRanges: Bar[];
  femalePct: number;
}

const CITY_POOL = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Austin, TX",
  "Miami, FL",
  "San Francisco, CA",
  "Seattle, WA",
  "Portland, OR",
];

export function audienceFor(seed: string, location?: string | null): AudienceData {
  const h = hash(seed);
  // Lead with the creator's own city so a restaurant can judge local reach.
  const home = location?.trim() || CITY_POOL[h % CITY_POOL.length];
  const others = CITY_POOL.filter((c) => c !== home);
  const top = others[h % others.length];
  const top2 = others[(h + 3) % others.length];
  const homePct = 34 + (h % 12); // 34–45
  const topPct = 16 + (h % 8); // 16–23
  const top2Pct = 9 + (h % 6); // 9–14
  const topLocations: Bar[] = [
    { label: home, pct: homePct },
    { label: top, pct: topPct },
    { label: top2, pct: top2Pct },
    { label: "Other", pct: Math.max(0, 100 - homePct - topPct - top2Pct) },
  ];
  const a = 22 + (h % 16); // 18-24
  const b = 34 + (h % 12); // 25-34
  const c = 18 + (h % 8); // 35-44
  const ageRanges: Bar[] = [
    { label: "18-24", pct: a },
    { label: "25-34", pct: b },
    { label: "35-44", pct: c },
    { label: "45+", pct: Math.max(0, 100 - a - b - c) },
  ];
  return { topLocations, ageRanges, femalePct: 45 + (h % 25) };
}

export interface CollabPackage {
  name: string;
  priceCents: number;
  deliverables: string[];
}

export function packagesFor(creator: CreatorProfile): CollabPackage[] {
  const base = creator.flat_rate_cents ?? 30_000;
  const round = (n: number) => Math.round(n / 500) * 500;
  return [
    {
      name: "Single post",
      priceCents: round(base * 0.6),
      deliverables: ["1 in-feed post", "1 story mention", "30-day usage rights"],
    },
    {
      name: "Story set",
      priceCents: round(base),
      deliverables: ["1 reel or TikTok", "3 story frames", "60-day usage rights"],
    },
    {
      name: "Full collab",
      priceCents: round(base * 1.8),
      deliverables: [
        "2 reels or TikToks",
        "1 in-feed post",
        "5 story frames",
        "90-day usage rights",
      ],
    },
  ];
}

export interface PastCollab {
  name: string;
  cuisine: string;
}
const COLLAB_POOL: PastCollab[] = [
  { name: "Bottega Rosso", cuisine: "Italian" },
  { name: "Hana Izakaya", cuisine: "Japanese" },
  { name: "El Jardín", cuisine: "Mexican" },
  { name: "The Copper Pot", cuisine: "Farm-to-Table" },
  { name: "Blue Door Cafe", cuisine: "Brunch" },
  { name: "Saffron", cuisine: "Indian" },
  { name: "Marrow & Vine", cuisine: "Wine Bar" },
];
export function pastCollabsFor(seed: string, count = 5): PastCollab[] {
  const start = hash(seed);
  return Array.from({ length: Math.min(count, COLLAB_POOL.length) }, (_, i) =>
    COLLAB_POOL[(start + i) % COLLAB_POOL.length]
  );
}
