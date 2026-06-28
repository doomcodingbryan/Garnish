import {
  AtSign,
  BadgeCheck,
  Check,
  MapPin,
  Music2,
  PlaySquare,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GradientAvatar } from "@/components/GradientAvatar";
import { formatCents, formatFollowerCount } from "@/lib/utils";
import {
  audienceFor,
  packagesFor,
  pastCollabsFor,
  portfolioFor,
  ratingSummaryFor,
  reviewsFor,
  type Bar as BarData,
  type PortfolioPlatform,
} from "@/lib/creatorContent";
import type { CreatorProfile } from "@/types/database";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

const PLATFORM_ICON: Record<PortfolioPlatform, React.ReactNode> = {
  instagram: <AtSign className="size-3.5" />,
  tiktok: <Music2 className="size-3.5" />,
  youtube: <PlaySquare className="size-3.5" />,
};

export function ContentPortfolio({ seed }: { seed: string }) {
  const items = portfolioFor(seed);
  return (
    <Card title="Recent content">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="group/p relative aspect-square overflow-hidden rounded-xl bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover/p:scale-105"
            />
            <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur-sm">
              {PLATFORM_ICON[it.platform]}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-foreground/45 px-2.5 py-1.5 text-xs font-medium text-white">
              <span>{formatFollowerCount(it.views)} views</span>
              <span>{formatFollowerCount(it.likes)} likes</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < Math.round(rating)
              ? "fill-warning text-warning"
              : "text-muted-foreground/40"
          }`}
        />
      ))}
    </span>
  );
}

function relativeDays(days: number): string {
  if (days < 1) return "today";
  if (days < 30) return `${days} days ago`;
  const m = Math.floor(days / 30);
  return m === 1 ? "1 month ago" : `${m} months ago`;
}

export function Reviews({ seed }: { seed: string }) {
  const { average, count } = ratingSummaryFor(seed);
  const reviews = reviewsFor(seed);
  return (
    <Card title="Reviews">
      <div className="flex items-center gap-3 border-b border-border/70 pb-4">
        <p className="font-display text-4xl font-semibold leading-none tabular-nums">
          {average.toFixed(1)}
        </p>
        <div>
          <Stars rating={average} />
          <p className="mt-0.5 text-xs text-muted-foreground">
            {count} restaurant reviews
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-4">
        {reviews.map((r) => (
          <li key={r.id}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{r.restaurant}</p>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {r.body}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {relativeDays(r.daysAgo)}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Bars({ data }: { data: BarData[] }) {
  return (
    <div className="space-y-2.5">
      {data.map((b) => (
        <div key={b.label}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{b.label}</span>
            <span className="font-medium tabular-nums">{b.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${b.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AudienceCard({
  seed,
  location,
}: {
  seed: string;
  location?: string | null;
}) {
  const a = audienceFor(seed, location);
  return (
    <Card title="Audience">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5" /> Top locations
          </p>
          <Bars data={a.topLocations} />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Age</p>
          <Bars data={a.ageRanges} />
        </div>
      </div>
      <p className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        Audience split {a.femalePct}% women · {100 - a.femalePct}% men
      </p>
    </Card>
  );
}

export function PackagesCard({ creator }: { creator: CreatorProfile }) {
  const packages = packagesFor(creator);
  return (
    <Card title="Packages">
      <div className="grid gap-3 sm:grid-cols-3">
        {packages.map((p) => (
          <div key={p.name} className="rounded-xl border border-border/70 p-4">
            <p className="text-sm font-semibold">{p.name}</p>
            <p className="mt-0.5 font-display text-xl font-semibold text-primary">
              {formatCents(p.priceCents)}
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              {p.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Indicative pricing. Final terms are set in your proposal.
      </p>
    </Card>
  );
}

export function PastCollabs({ seed }: { seed: string }) {
  const collabs = pastCollabsFor(seed);
  return (
    <Card title="Worked with">
      <div className="flex flex-wrap gap-3">
        {collabs.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-2 rounded-full border border-border/70 py-1 pl-1 pr-3"
          >
            <GradientAvatar name={c.name} className="size-7 text-xs" />
            <div className="leading-tight">
              <p className="text-xs font-medium">{c.name}</p>
              <p className="text-[0.65rem] text-muted-foreground">{c.cuisine}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Trust signal shown when a creator has at least one API-connected platform. */
export function VerifiedBadge() {
  return (
    <Badge variant="success" className="gap-1">
      <BadgeCheck className="size-3.5" />
      Verified data
    </Badge>
  );
}
