"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { computeUgcScore } from "@/lib/scoring/score";
import {
  ConnectorNotConfiguredError,
  getConnector,
  manualConnector,
  type ConnectorResult,
} from "@/lib/scoring/connectors";
import type { PlatformScoreInput, UgcScore } from "@/lib/scoring/types";
import type { CreatorPlatform, PlatformKind } from "@/types/database";

type CreatorRow = {
  id: string;
  follower_count: number | null;
  engagement_rate: number | null;
};

/**
 * Refresh a single creator's platform metrics and recompute their UGC Score.
 * Uses the service-role client so the score write isn't blocked by RLS.
 * Safe to call after onboarding and from the cron route.
 */
export async function syncCreatorScore(creatorId: string): Promise<UgcScore | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;

  const { data: creator } = await supabase
    .from("creator_profiles")
    .select("id, follower_count, engagement_rate")
    .eq("id", creatorId)
    .single();
  if (!creator) return null;
  const cp = creator as CreatorRow;

  const { data: platformRows } = await supabase
    .from("creator_platforms")
    .select("*")
    .eq("creator_id", creatorId);
  const platforms = (platformRows ?? []) as CreatorPlatform[];

  const inputs: PlatformScoreInput[] = [];

  for (const row of platforms) {
    let result: ConnectorResult;
    try {
      result = await getConnector(row.platform).fetchMetrics({
        handle: row.handle,
        followers: row.followers ?? cp.follower_count,
        engagementRate: cp.engagement_rate,
      });
    } catch (e) {
      if (!(e instanceof ConnectorNotConfiguredError)) {
        // Network/API failure: keep the row's last-known data, skip this refresh.
        console.error(`syncCreatorScore: ${row.platform} fetch failed`, e);
        inputs.push({
          platform: row.platform,
          followers: row.followers,
          engagementRate: cp.engagement_rate,
          metrics: row.metrics,
          source: row.source,
        });
        continue;
      }
      result = await manualConnector.fetchMetrics({
        handle: row.handle,
        followers: row.followers ?? cp.follower_count,
        engagementRate: cp.engagement_rate,
      });
    }

    await supabase
      .from("creator_platforms")
      .update({
        followers: result.followers,
        metrics: result.metrics,
        source: result.source,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    inputs.push({
      platform: row.platform,
      followers: result.followers,
      engagementRate: result.engagementRate,
      metrics: result.metrics,
      source: result.source,
    });
  }

  // No connected platforms: fall back to the account-level self-report so a
  // baseline score still exists.
  if (inputs.length === 0) {
    inputs.push({
      platform: "other" as PlatformKind,
      followers: cp.follower_count,
      engagementRate: cp.engagement_rate,
      metrics: null,
      source: "manual",
    });
  }

  const score = computeUgcScore(inputs);

  await supabase
    .from("creator_profiles")
    .update({
      ugc_score: score.score,
      ugc_tier: score.tier,
      ugc_components: score.components,
      ugc_scored_at: new Date().toISOString(),
    })
    .eq("id", creatorId);

  return score;
}
