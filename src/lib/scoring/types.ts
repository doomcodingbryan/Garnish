import type {
  PlatformKind,
  MetricSource,
  PlatformMetrics,
  ScoreComponents,
} from "@/types/database";

export type { PlatformKind, MetricSource, PlatformMetrics, ScoreComponents };

/** One platform's inputs as fed to the scoring engine. */
export interface PlatformScoreInput {
  platform: PlatformKind;
  followers: number | null;
  /** Percent (0-100), if known directly (self-report or computed elsewhere). */
  engagementRate?: number | null;
  metrics?: PlatformMetrics | null;
  source: MetricSource;
}

export interface UgcScore {
  score: number; // 0-100
  tier: string; // Emerging | Rising | Strong | Elite
  components: ScoreComponents;
}

/**
 * Engagement rate (%) that maps to a full 100 on the engagement sub-score, per
 * platform. Platforms differ a lot: TikTok rewards much higher rates than IG,
 * YouTube engagement-per-subscriber sits lower. Tunable.
 */
export const ENGAGEMENT_BENCHMARK: Record<PlatformKind, number> = {
  instagram: 8,
  tiktok: 15,
  youtube: 6,
  other: 8,
};

/**
 * avg_views / followers ratio that maps to a full 100 on the reach sub-score.
 * Video platforms routinely exceed their follower count in views.
 */
export const REACH_BENCHMARK: Record<PlatformKind, number> = {
  instagram: 0.6,
  tiktok: 1.5,
  youtube: 1.0,
  other: 0.8,
};

/** Posts per week that maps to a full 100 on the frequency half of consistency. */
export const FREQUENCY_TARGET_PER_WEEK = 4;

/** Tier thresholds (lower bound inclusive), highest first. Tunable. */
export const TIERS: { min: number; label: string }[] = [
  { min: 85, label: "Elite" },
  { min: 70, label: "Strong" },
  { min: 50, label: "Rising" },
  { min: 0, label: "Emerging" },
];

export const COMPONENT_WEIGHTS = {
  engagement: 0.4,
  reach: 0.25,
  consistency: 0.2,
  breadth: 0.15,
} as const;
