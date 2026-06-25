import { Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatFollowerCount } from "@/lib/utils";
import type { CreatorPlatform, CreatorProfile } from "@/types/database";

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Other",
};

function relativeTime(iso: string | null): string {
  if (!iso) return "not yet";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

/** Full UGC Score breakdown shown on a creator's profile page. */
export function UgcScoreCard({
  creator,
  platforms,
}: {
  creator: CreatorProfile;
  platforms: CreatorPlatform[];
}) {
  if (creator.ugc_score == null || creator.ugc_components == null) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Gauge className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">UGC Score</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Not scored yet. Connect a platform to generate a content performance
          score.
        </p>
      </div>
    );
  }

  const c = creator.ugc_components;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            <p className="text-sm font-semibold">UGC Score</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            How this creator&apos;s content performs across platforms.
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-semibold leading-none text-primary tabular-nums">
            {creator.ugc_score}
          </p>
          {creator.ugc_tier && <Badge className="mt-1">{creator.ugc_tier}</Badge>}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <ScoreBar label="Engagement" value={c.engagement} />
        <ScoreBar label="Reach" value={c.reach} />
        <ScoreBar label="Consistency" value={c.consistency} />
        <ScoreBar label="Platform breadth" value={c.breadth} />
      </div>

      {platforms.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {platforms.map((p) => (
            <Badge key={p.id} variant="secondary" className="gap-1 text-xs">
              {PLATFORM_LABELS[p.platform] ?? p.platform}
              {p.followers != null && (
                <span className="text-muted-foreground">
                  {formatFollowerCount(p.followers)}
                </span>
              )}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
        <span>Confidence {Math.round(c.confidence * 100)}%</span>
        <span>Updated {relativeTime(creator.ugc_scored_at)}</span>
      </div>
    </div>
  );
}
