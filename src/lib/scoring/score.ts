import {
  COMPONENT_WEIGHTS,
  ENGAGEMENT_BENCHMARK,
  FREQUENCY_TARGET_PER_WEEK,
  REACH_BENCHMARK,
  TIERS,
  type PlatformScoreInput,
  type ScoreComponents,
  type UgcScore,
} from "./types";

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** A sub-signal that may be absent so its weight can renormalize away. */
type Signal = { value: number; weight: number } | null;

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return (Date.now() - then) / 86_400_000;
}

/** Engagement rate (%) for one platform: prefer per-post data, fall back to self-report. */
function engagementRate(p: PlatformScoreInput): number | null {
  const m = p.metrics;
  if (m && p.followers && p.followers > 0) {
    const likes = m.avg_likes ?? 0;
    const comments = m.avg_comments ?? 0;
    if (m.avg_likes != null || m.avg_comments != null) {
      return ((likes + comments) / p.followers) * 100;
    }
  }
  return p.engagementRate ?? null;
}

function engagementSignal(p: PlatformScoreInput): Signal {
  const er = engagementRate(p);
  if (er == null) return null;
  const benchmark = ENGAGEMENT_BENCHMARK[p.platform];
  return { value: clamp((er / benchmark) * 100), weight: p.followers ?? 1 };
}

function reachSignal(p: PlatformScoreInput): Signal {
  const views = p.metrics?.avg_views;
  if (views == null || !p.followers || p.followers <= 0) return null;
  const ratio = views / p.followers;
  const benchmark = REACH_BENCHMARK[p.platform];
  return { value: clamp((ratio / benchmark) * 100), weight: p.followers };
}

function consistencySignal(p: PlatformScoreInput): Signal {
  const m = p.metrics;
  if (!m) return null;
  const hasFreq = m.posts_per_week != null;
  const hasRecency = m.last_post_at != null;
  if (!hasFreq && !hasRecency) return null;

  const frequency = hasFreq
    ? clamp((m.posts_per_week! / FREQUENCY_TARGET_PER_WEEK) * 100)
    : null;

  let recency: number | null = null;
  const d = daysSince(m.last_post_at);
  if (d != null) {
    // Full marks within a week, linear decay to 0 by ~60 days.
    recency = d <= 7 ? 100 : clamp(100 - ((d - 7) / 53) * 100);
  }

  // Average whichever halves are present.
  const parts = [frequency, recency].filter((v): v is number => v != null);
  const value = parts.reduce((a, b) => a + b, 0) / parts.length;
  return { value, weight: p.followers ?? 1 };
}

/** Followers-weighted average across platforms; null if no platform had the signal. */
function aggregate(signals: Signal[]): number | null {
  const present = signals.filter((s): s is NonNullable<Signal> => s != null);
  if (present.length === 0) return null;
  const totalWeight = present.reduce((a, s) => a + Math.max(s.weight, 1), 0);
  const sum = present.reduce((a, s) => a + s.value * Math.max(s.weight, 1), 0);
  return sum / totalWeight;
}

/** Breadth rewards being active on more than one platform. */
function breadthScore(platforms: PlatformScoreInput[]): number {
  const active = platforms.filter(
    (p) => (p.followers ?? 0) > 0 || p.metrics != null || p.engagementRate != null
  ).length;
  if (active >= 3) return 100;
  if (active === 2) return 75;
  if (active === 1) return 40;
  return 0;
}

function confidenceScore(platforms: PlatformScoreInput[]): number {
  if (platforms.length === 0) return 0;
  const apiShare =
    platforms.filter((p) => p.source === "api").length / platforms.length;
  const withMetrics =
    platforms.filter((p) => p.metrics != null).length / platforms.length;
  return Math.max(0, Math.min(1, 0.3 + 0.5 * apiShare + 0.2 * withMetrics));
}

function tierFor(score: number): string {
  return (TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1]).label;
}

/**
 * Compute a creator's 0-100 UGC Score from their connected platforms.
 *
 * Pure and total: missing signals renormalize the remaining component weights
 * rather than throwing or scoring 0, and `confidence` reflects how much of the
 * input was real per-post API data vs. self-reported.
 */
export function computeUgcScore(platforms: PlatformScoreInput[]): UgcScore {
  const engagement = aggregate(platforms.map(engagementSignal));
  const reach = aggregate(platforms.map(reachSignal));
  const consistency = aggregate(platforms.map(consistencySignal));
  const breadth = breadthScore(platforms);
  const confidence = confidenceScore(platforms);

  // Weighted blend over components that have data (breadth always does).
  const parts: { value: number; weight: number }[] = [
    ...(engagement != null
      ? [{ value: engagement, weight: COMPONENT_WEIGHTS.engagement }]
      : []),
    ...(reach != null ? [{ value: reach, weight: COMPONENT_WEIGHTS.reach }] : []),
    ...(consistency != null
      ? [{ value: consistency, weight: COMPONENT_WEIGHTS.consistency }]
      : []),
    { value: breadth, weight: COMPONENT_WEIGHTS.breadth },
  ];
  const totalWeight = parts.reduce((a, p) => a + p.weight, 0);
  const blended = parts.reduce((a, p) => a + p.value * p.weight, 0) / totalWeight;

  const components: ScoreComponents = {
    engagement: Math.round(engagement ?? 0),
    reach: Math.round(reach ?? 0),
    consistency: Math.round(consistency ?? 0),
    breadth: Math.round(breadth),
    confidence: Math.round(confidence * 100) / 100,
  };

  const score = Math.round(clamp(blended));
  return { score, tier: tierFor(score), components };
}
