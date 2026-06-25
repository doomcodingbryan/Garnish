import type { MetricSource, PlatformKind, PlatformMetrics } from "../types";
import { manualConnector } from "./manual";
import { youtubeConnector } from "./youtube";

export interface ConnectorInput {
  handle: string;
  followers?: number | null;
  /** Account-level self-reported engagement rate (%), used by the manual fallback. */
  engagementRate?: number | null;
}

export interface ConnectorResult {
  followers: number | null;
  engagementRate: number | null;
  metrics: PlatformMetrics | null;
  source: MetricSource;
}

export interface PlatformConnector {
  fetchMetrics(input: ConnectorInput): Promise<ConnectorResult>;
}

/** Thrown when a real connector lacks its credentials; callers fall back to manual. */
export class ConnectorNotConfiguredError extends Error {
  constructor(platform: string) {
    super(`Connector for "${platform}" is not configured`);
    this.name = "ConnectorNotConfiguredError";
  }
}

/**
 * Registry mapping each platform to its connector. Instagram and TikTok have no
 * live data source yet, so they resolve to the manual self-report path. A future
 * scraper or OAuth provider drops in here with zero changes to the engine or UI.
 */
const REGISTRY: Record<PlatformKind, PlatformConnector> = {
  youtube: youtubeConnector,
  instagram: manualConnector,
  tiktok: manualConnector,
  other: manualConnector,
};

export function getConnector(platform: PlatformKind): PlatformConnector {
  return REGISTRY[platform] ?? manualConnector;
}

export { manualConnector, youtubeConnector };
