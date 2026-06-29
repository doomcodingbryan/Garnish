import { Banknote, Star, Users, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GradientAvatar } from "@/components/GradientAvatar";
import { pickImages, ratingFor } from "@/lib/images";
import {
  collabsBookedFor,
  compFor,
  idealCreatorFor,
  pastCreatorsFor,
  priceTierFor,
  responseDaysFor,
  restaurantReviewsFor,
  reviewCountFor,
  typicalAskFor,
} from "@/lib/restaurantContent";

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

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
      <div className="flex items-center justify-center gap-1 text-foreground">
        {icon}
        <span className="font-heading text-xl font-bold">{value}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function RestaurantStats({ seed }: { seed: string }) {
  const rating = ratingFor(seed);
  const booked = collabsBookedFor(seed);
  const responds = responseDaysFor(seed);
  const price = priceTierFor(seed);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile
        icon={<Star className="size-4 fill-warning text-warning" />}
        value={rating.toFixed(1)}
        label="Creator rating"
      />
      <StatTile icon={<Users className="size-4" />} value={`${booked}`} label="Collabs booked" />
      <StatTile
        icon={<Clock className="size-4" />}
        value={responds === 1 ? "1 day" : `~${responds} days`}
        label="Responds in"
      />
      <StatTile icon={<DollarSign className="size-4" />} value={price} label="Price" />
    </div>
  );
}

export function RestaurantPhotos({ seed }: { seed: string }) {
  const photos = pickImages(seed, 6);
  return (
    <Card title="Photos">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((src, i) => (
          <div
            key={i}
            className="group/p relative aspect-square overflow-hidden rounded-xl bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover/p:scale-105"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WhatTheyOffer({ seed }: { seed: string }) {
  const comp = compFor(seed);
  const money = (c: number) => `$${Math.round(c / 100).toLocaleString()}`;
  const range = `${money(comp.minCents)}–${money(comp.maxCents)}`;
  const label =
    comp.kind === "comp"
      ? "Comped meal"
      : comp.kind === "both"
        ? `Comp + ${range} per collab`
        : `Pays ${range} per collab`;
  return (
    <Card title="What they offer">
      <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
        <Banknote className="size-4 shrink-0 text-success" />
        <span className="font-medium">{label}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Typical ask: {typicalAskFor(seed)}
      </p>
    </Card>
  );
}

export function IdealCreator({ seed }: { seed: string }) {
  const ideal = idealCreatorFor(seed);
  return (
    <Card title="Ideal creator">
      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Niches</span>
          {ideal.niches.map((n) => (
            <Badge key={n} variant="secondary" className="text-xs">
              {n}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Audience</span>
          <span className="font-medium">{ideal.tier}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Platforms</span>
          {ideal.platforms.map((p) => (
            <Badge key={p} variant="outline" className="text-xs">
              {p}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function RestaurantReviews({ seed }: { seed: string }) {
  const average = ratingFor(seed);
  const count = reviewCountFor(seed);
  const reviews = restaurantReviewsFor(seed);
  return (
    <Card title="Creator reviews">
      <div className="flex items-center gap-3 border-b border-border/70 pb-4">
        <p className="font-display text-4xl font-semibold leading-none tabular-nums">
          {average.toFixed(1)}
        </p>
        <div>
          <Stars rating={average} />
          <p className="mt-0.5 text-xs text-muted-foreground">{count} creator reviews</p>
        </div>
      </div>
      <ul className="mt-4 space-y-4">
        {reviews.map((r) => (
          <li key={r.id}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{r.creator}</p>
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

export function PastCreators({ seed }: { seed: string }) {
  const creators = pastCreatorsFor(seed);
  return (
    <Card title="Creators they've worked with">
      <div className="flex flex-wrap gap-3">
        {creators.map((name) => (
          <div
            key={name}
            className="flex items-center gap-2 rounded-full border border-border/70 py-1 pl-1 pr-3"
          >
            <GradientAvatar name={name} className="size-7 text-xs" />
            <p className="text-xs font-medium">{name}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
