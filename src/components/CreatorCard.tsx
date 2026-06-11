import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatFollowerCount, formatCents } from "@/lib/utils";
import type { CreatorProfile, UserProfile } from "@/types/database";

export type CreatorRow = CreatorProfile & {
  user: Pick<UserProfile, "id" | "display_name" | "avatar_url">;
};

export function CreatorCard({ creator }: { creator: CreatorRow }) {
  const handle = creator.instagram_handle ?? creator.tiktok_handle;

  return (
    <Card className="flex flex-col">
      <CardContent className="pt-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center font-semibold text-base shrink-0">
            {creator.user.display_name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight truncate">{creator.user.display_name}</p>
            {handle && (
              <p className="text-sm text-muted-foreground truncate">@{handle}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div>
            <p className="font-semibold">{formatFollowerCount(creator.follower_count)}</p>
            <p className="text-muted-foreground text-xs">followers</p>
          </div>
          {creator.engagement_rate != null && (
            <div>
              <p className="font-semibold">{creator.engagement_rate}%</p>
              <p className="text-muted-foreground text-xs">engagement</p>
            </div>
          )}
          {creator.flat_rate_cents != null && (
            <div>
              <p className="font-semibold">{formatCents(creator.flat_rate_cents)}</p>
              <p className="text-muted-foreground text-xs">per collab</p>
            </div>
          )}
        </div>

        {creator.niche_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {creator.niche_tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {creator.niche_tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{creator.niche_tags.length - 3}</Badge>
            )}
          </div>
        )}

        {creator.location && (
          <p className="text-xs text-muted-foreground">{creator.location}</p>
        )}

        {creator.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{creator.bio}</p>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={`/profile/${creator.user.id}`}
            className={`${buttonVariants({ variant: "outline", size: "sm" })} w-full`}
          >
            View profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
