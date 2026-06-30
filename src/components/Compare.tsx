"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GradientAvatar } from "@/components/GradientAvatar";
import { ratingFor } from "@/lib/images";
import { compFor, matchScoreFor, priceTierFor } from "@/lib/restaurantContent";
import { formatCents, formatFollowerCount } from "@/lib/utils";
import type { CreatorRow } from "@/components/CreatorCard";
import type { RestaurantRow } from "@/components/RestaurantCard";

type Col<T> = {
  id: string;
  userId: string;
  name: string;
  avatarSrc: string | null;
  subtitle?: string;
  data: T;
};

type Metric<T> = { label: string; render: (d: T) => ReactNode };

/** Shared side-by-side table: profiles as columns, metrics as rows. */
function CompareTable<T>({
  cols,
  metrics,
}: {
  cols: Col<T>[];
  metrics: Metric<T>[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-32 p-4" />
            {cols.map((c) => (
              <th key={c.id} className="border-l border-border p-4 align-top">
                <div className="flex flex-col items-start gap-2 text-left">
                  <GradientAvatar
                    name={c.name}
                    src={c.avatarSrc}
                    className="size-11 text-base"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold leading-tight">
                      {c.name}
                    </p>
                    {c.subtitle && (
                      <p className="truncate text-xs font-normal text-muted-foreground">
                        {c.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.label} className="border-t border-border">
              <td className="p-4 align-top font-medium text-muted-foreground">
                {m.label}
              </td>
              {cols.map((c) => (
                <td key={c.id} className="border-l border-border p-4 align-top">
                  {m.render(c.data)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-border">
            <td className="p-4" />
            {cols.map((c) => (
              <td key={c.id} className="border-l border-border p-4 align-top">
                <Link
                  href={`/profile/${c.userId}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View profile
                  <ArrowRight className="size-3.5" />
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function NicheTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((t) => (
        <Badge key={t} variant="secondary" className="text-xs">
          {t}
        </Badge>
      ))}
    </div>
  );
}

export function CompareCreators({ creators }: { creators: CreatorRow[] }) {
  const cols: Col<CreatorRow>[] = creators.map((c) => ({
    id: c.id,
    userId: c.user.id,
    name: c.user.display_name,
    avatarSrc: c.user.avatar_url,
    subtitle: c.instagram_handle ? `@${c.instagram_handle}` : undefined,
    data: c,
  }));

  const metrics: Metric<CreatorRow>[] = [
    { label: "Followers", render: (c) => <span className="font-semibold">{formatFollowerCount(c.follower_count)}</span> },
    {
      label: "Engagement",
      render: (c) =>
        c.engagement_rate != null ? `${c.engagement_rate}%` : "—",
    },
    {
      label: "Rate",
      render: (c) =>
        c.flat_rate_cents != null ? formatCents(c.flat_rate_cents) : "On request",
    },
    {
      label: "Rating",
      render: (c) => (
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5 fill-warning text-warning" />
          {ratingFor(c.user.display_name).toFixed(1)}
        </span>
      ),
    },
    { label: "UGC score", render: (c) => (c.ugc_score != null ? `${c.ugc_score}` : "Not scored") },
    { label: "Niches", render: (c) => <NicheTags tags={c.niche_tags} /> },
    { label: "Location", render: (c) => c.location ?? "—" },
  ];

  return <CompareTable cols={cols} metrics={metrics} />;
}

export function CompareRestaurants({ restaurants }: { restaurants: RestaurantRow[] }) {
  const money = (cents: number) => `$${Math.round(cents / 100).toLocaleString()}`;
  const cols: Col<RestaurantRow>[] = restaurants.map((r) => ({
    id: r.id,
    userId: r.user.id,
    name: r.name,
    avatarSrc: r.user.avatar_url,
    subtitle: r.location,
    data: r,
  }));

  const metrics: Metric<RestaurantRow>[] = [
    { label: "Cuisine", render: (r) => r.cuisine ?? "—" },
    { label: "Price", render: (r) => <span className="font-semibold">{priceTierFor(r.name)}</span> },
    {
      label: "Compensation",
      render: (r) => {
        const c = compFor(r.name);
        const range = `${money(c.minCents)}–${money(c.maxCents)}`;
        return c.kind === "comp"
          ? "Comped meal"
          : c.kind === "both"
            ? `Comp + ${range}`
            : `Pays ${range}`;
      },
    },
    { label: "Match", render: (r) => <span className="font-semibold text-primary">{matchScoreFor(r.name)}%</span> },
    {
      label: "Rating",
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5 fill-warning text-warning" />
          {ratingFor(r.name).toFixed(1)}
        </span>
      ),
    },
    {
      label: "Looking for",
      render: (r) => <NicheTags tags={r.collab_types} />,
    },
  ];

  return <CompareTable cols={cols} metrics={metrics} />;
}
