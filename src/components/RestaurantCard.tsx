"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Banknote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GradientAvatar } from "@/components/GradientAvatar";
import { SaveButton } from "@/components/SaveButton";
import { pickImages, ratingFor } from "@/lib/images";
import {
  compFor,
  matchScoreFor,
  priceTierFor,
  reviewCountFor,
} from "@/lib/restaurantContent";
import { cn } from "@/lib/utils";
import type { RestaurantProfile, UserProfile } from "@/types/database";

export type RestaurantRow = RestaurantProfile & {
  user: Pick<UserProfile, "id" | "display_name" | "avatar_url">;
};

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0 }),
};

export function RestaurantCard({ restaurant }: { restaurant: RestaurantRow }) {
  const images = pickImages(`${restaurant.name}${restaurant.cuisine}`, 3);
  const [[idx, dir], setState] = useState<[number, number]>([0, 0]);
  const rating = ratingFor(restaurant.name);
  const reviews = reviewCountFor(restaurant.name);
  const match = matchScoreFor(restaurant.name);
  const price = priceTierFor(restaurant.name);
  const comp = compFor(restaurant.name);
  const money = (c: number) => `$${Math.round(c / 100).toLocaleString()}`;
  const compRange = `${money(comp.minCents)}–${money(comp.maxCents)}`;
  const compLabel =
    comp.kind === "comp"
      ? "Comped meal"
      : comp.kind === "both"
        ? `Comp + ${compRange}`
        : `Pays ${compRange}`;

  const go = (e: React.MouseEvent, d: number) => {
    e.preventDefault();
    e.stopPropagation();
    setState(([i]) => [(i + d + images.length) % images.length, d]);
  };

  const desc = restaurant.aesthetic_description || restaurant.description;

  return (
    <Link href={`/profile/${restaurant.user.id}`} className="group block">
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-shadow duration-300 group-hover:shadow-card-lg"
      >
        {/* Image carousel */}
        <div className="relative h-56 overflow-hidden bg-muted">
          <AnimatePresence initial={false} custom={dir}>
            <motion.img
              key={idx}
              src={images[idx]}
              alt={restaurant.name}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => go(e, -1)}
              className="flex size-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
            >
              <ChevronLeft className="size-4" />
            </span>
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => go(e, 1)}
              className="flex size-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
            >
              <ChevronRight className="size-4" />
            </span>
          </div>

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {restaurant.cuisine && (
              <Badge className="border-0 bg-background/80 text-foreground backdrop-blur-sm">
                {restaurant.cuisine}
              </Badge>
            )}
            <Badge className="border-0 bg-background/80 font-medium text-foreground backdrop-blur-sm">
              {price}
            </Badge>
          </div>

          <Badge className="absolute bottom-3 left-3 gap-1 border-0 bg-background/80 text-foreground backdrop-blur-sm">
            <Star className="size-3.5 fill-warning text-warning" />
            {rating.toFixed(1)}
            <span className="text-muted-foreground">({reviews})</span>
          </Badge>
          <SaveButton
            profileId={restaurant.user.id}
            variant="icon"
            className="absolute right-3 top-3"
          />

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setState(([cur]) => [i, i > cur ? 1 : -1]);
                }}
                className={cn(
                  "h-1.5 rounded-full bg-white/60 transition-all",
                  i === idx ? "w-4 bg-white" : "w-1.5"
                )}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          <GradientAvatar
            name={restaurant.user.display_name || restaurant.name}
            src={restaurant.user.avatar_url}
            className="relative z-10 -mt-9 size-16 text-xl ring-4 ring-card"
          />

          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-xl font-semibold leading-tight">
                {restaurant.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {restaurant.cuisine} &bull; {restaurant.location}
              </p>
            </div>
            {/* Fit score for the viewing creator */}
            <div className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-center">
              <p className="font-display text-base font-semibold leading-none text-primary tabular-nums">
                {match}%
              </p>
              <p className="mt-0.5 text-[0.6rem] uppercase tracking-wide text-muted-foreground">
                match
              </p>
            </div>
          </div>

          {/* Compensation — the signal creators decide on */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
            <Banknote className="size-4 shrink-0 text-success" />
            <span className="text-sm font-medium">{compLabel}</span>
          </div>

          {restaurant.collab_types.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Looking for
              </p>
              <div className="flex flex-wrap gap-1.5">
                {restaurant.collab_types.slice(0, 4).map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {desc && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {desc}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
            <p className="text-sm">
              {restaurant.is_accepting_collabs ? (
                <span className="font-medium text-success">Accepting collabs</span>
              ) : (
                <span className="text-muted-foreground">Not accepting collabs</span>
              )}
            </p>
            <span className={buttonVariants({ size: "lg" })}>
              View profile
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
