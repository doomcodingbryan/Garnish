import type { ConnectorInput, ConnectorResult, PlatformConnector } from "./index";

/**
 * Manual / self-report connector. Echoes back the numbers the creator entered
 * (followers, engagement rate) without any per-post metrics. This is the
 * fallback for platforms with no live data connector yet (Instagram, TikTok).
 */
export const manualConnector: PlatformConnector = {
  async fetchMetrics(input: ConnectorInput): Promise<ConnectorResult> {
    return {
      followers: input.followers ?? null,
      engagementRate: input.engagementRate ?? null,
      metrics: null,
      source: "manual",
    };
  },
};
