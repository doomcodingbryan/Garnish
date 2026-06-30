import Link from "next/link";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GradientAvatar } from "@/components/GradientAvatar";
import { SaveButton } from "@/components/SaveButton";
import { UgcScoreBadge } from "@/components/UgcScoreBadge";
import { pickImages, ratingFor, isTopRated } from "@/lib/images";
import { formatFollowerCount, formatCents } from "@/lib/utils";
import type { CreatorProfile, UserProfile } from "@/types/database";

export type CreatorRow = CreatorProfile & {
  user: Pick<UserProfile, "id" | "display_name" | "avatar_url">;
};

export function CreatorCard({ creator }: { creator: CreatorRow }) {
  const handle = creator.instagram_handle ?? creator.tiktok_handle;
  const cover = pickImages(
    `${creator.user.display_name}${creator.niche_tags[0] ?? ""}`,
    1
  )[0];
  const rating = ratingFor(creator.user.display_name);
  const topRated = isTopRated(creator.user.display_name);

  return (
    <Link href={`/profile/${creator.user.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.01] group-hover:shadow-card-lg">
        {/* Content cover */}
        <div className="relative h-32 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-foreground/10" />
          {creator.niche_tags[0] && (
            <Badge className="absolute left-3 top-3 border-0 bg-background/80 text-foreground backdrop-blur-sm">
              {creator.niche_tags[0]}
            </Badge>
          )}
          <Badge className="absolute bottom-3 left-3 gap-1 border-0 bg-background/80 text-foreground backdrop-blur-sm">
            <Star className="size-3.5 fill-warning text-warning" />
            {rating.toFixed(1)}
          </Badge>
          <SaveButton
            profileId={creator.user.id}
            variant="icon"
            className="absolute right-3 top-3"
          />
          <UgcScoreBadge
            score={creator.ugc_score}
            tier={creator.ugc_tier}
            className="absolute bottom-3 right-3"
          />
        </div>

        <div className="px-5 pb-5">
          <GradientAvatar
            name={creator.user.display_name}
            src={creator.user.avatar_url}
            className="relative z-10 -mt-9 size-16 text-xl ring-4 ring-card"
          />
          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold leading-tight">
                {creator.user.display_name}
              </p>
              {handle && (
                <p className="truncate text-sm text-muted-foreground">
                  @{handle}
                </p>
              )}
            </div>
            {topRated && (
              <Badge variant="outline" className="shrink-0">
                Top rated
              </Badge>
            )}
          </div>

          <div className="mt-3 flex gap-5 text-sm">
            <div>
              <p className="font-semibold">
                {formatFollowerCount(creator.follower_count)}
              </p>
              <p className="text-xs text-muted-foreground">followers</p>
            </div>
            {creator.engagement_rate != null && (
              <div>
                <p className="font-semibold">{creator.engagement_rate}%</p>
                <p className="text-xs text-muted-foreground">engagement</p>
              </div>
            )}
            {creator.location && (
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate font-semibold">
                  <MapPin className="size-3.5 shrink-0" />
                  {creator.location}
                </p>
                <p className="text-xs text-muted-foreground">location</p>
              </div>
            )}
          </div>

          {creator.niche_tags.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {creator.niche_tags.slice(1, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {creator.bio && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {creator.bio}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
            <p className="text-sm">
              {creator.flat_rate_cents != null ? (
                <>
                  <span className="font-semibold">
                    {formatCents(creator.flat_rate_cents)}
                  </span>{" "}
                  <span className="text-muted-foreground">/ collab</span>
                </>
              ) : (
                <span className="text-muted-foreground">Rate on request</span>
              )}
            </p>
            <span className={buttonVariants({ size: "lg" })}>
              View profile
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
