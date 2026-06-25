import type { PlatformMetrics } from "../types";
import {
  ConnectorNotConfiguredError,
  type ConnectorInput,
  type ConnectorResult,
  type PlatformConnector,
} from "./index";

const API = "https://www.googleapis.com/youtube/v3";
const RECENT_VIDEOS = 20;

type ChannelResponse = {
  items?: {
    statistics?: { subscriberCount?: string; videoCount?: string };
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }[];
};

type PlaylistResponse = {
  items?: { contentDetails?: { videoId?: string; videoPublishedAt?: string } }[];
};

type VideosResponse = {
  items?: {
    statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
    snippet?: { publishedAt?: string };
  }[];
};

const num = (v: string | undefined): number => (v ? Number(v) : 0);

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

function stripAt(handle: string): string {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

/**
 * Real connector backed by the YouTube Data API v3. Resolves a channel by its
 * handle, then averages the most recent uploads into per-post metrics. Requires
 * YOUTUBE_API_KEY; without it, throws ConnectorNotConfiguredError so the caller
 * falls back to the manual path.
 */
export const youtubeConnector: PlatformConnector = {
  async fetchMetrics(input: ConnectorInput): Promise<ConnectorResult> {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) throw new ConnectorNotConfiguredError("youtube");

    const handle = encodeURIComponent(stripAt(input.handle));
    const channel = await getJson<ChannelResponse>(
      `${API}/channels?part=statistics,contentDetails&forHandle=${handle}&key=${key}`
    );
    const item = channel.items?.[0];
    if (!item) {
      // Unknown handle: nothing to score, fall back to whatever was self-reported.
      return {
        followers: input.followers ?? null,
        engagementRate: input.engagementRate ?? null,
        metrics: null,
        source: "manual",
      };
    }

    const followers = num(item.statistics?.subscriberCount) || null;
    const uploads = item.contentDetails?.relatedPlaylists?.uploads;

    let metrics: PlatformMetrics | null = null;
    if (uploads) {
      const playlist = await getJson<PlaylistResponse>(
        `${API}/playlistItems?part=contentDetails&playlistId=${uploads}&maxResults=${RECENT_VIDEOS}&key=${key}`
      );
      const ids = (playlist.items ?? [])
        .map((i) => i.contentDetails?.videoId)
        .filter((v): v is string => !!v);

      if (ids.length > 0) {
        const videos = await getJson<VideosResponse>(
          `${API}/videos?part=statistics,snippet&id=${ids.join(",")}&key=${key}`
        );
        const items = videos.items ?? [];
        const n = items.length || 1;
        const totals = items.reduce(
          (acc, v) => {
            acc.views += num(v.statistics?.viewCount);
            acc.likes += num(v.statistics?.likeCount);
            acc.comments += num(v.statistics?.commentCount);
            return acc;
          },
          { views: 0, likes: 0, comments: 0 }
        );

        const dates = items
          .map((v) => v.snippet?.publishedAt)
          .filter((d): d is string => !!d)
          .map((d) => new Date(d).getTime())
          .sort((a, b) => b - a);
        const lastPostAt = dates.length ? new Date(dates[0]).toISOString() : null;
        let postsPerWeek: number | null = null;
        if (dates.length >= 2) {
          const spanWeeks = (dates[0] - dates[dates.length - 1]) / 604_800_000;
          postsPerWeek = spanWeeks > 0 ? dates.length / spanWeeks : null;
        }

        metrics = {
          avg_views: Math.round(totals.views / n),
          avg_likes: Math.round(totals.likes / n),
          avg_comments: Math.round(totals.comments / n),
          post_count: items.length,
          posts_per_week: postsPerWeek,
          last_post_at: lastPostAt,
        };
      }
    }

    return { followers, engagementRate: null, metrics, source: "api" };
  },
};
