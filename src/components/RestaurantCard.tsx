import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { RestaurantProfile, UserProfile } from "@/types/database";

export type RestaurantRow = RestaurantProfile & {
  user: Pick<UserProfile, "id" | "display_name" | "avatar_url">;
};

export function RestaurantCard({ restaurant }: { restaurant: RestaurantRow }) {
  return (
    <Card className="flex flex-col">
      <CardContent className="pt-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center font-semibold text-base shrink-0">
            {restaurant.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight truncate">{restaurant.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {restaurant.cuisine} · {restaurant.location}
            </p>
          </div>
        </div>

        {restaurant.collab_types.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {restaurant.collab_types.slice(0, 3).map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
            ))}
            {restaurant.collab_types.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{restaurant.collab_types.length - 3}</Badge>
            )}
          </div>
        )}

        {restaurant.aesthetic_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {restaurant.aesthetic_description}
          </p>
        )}

        {restaurant.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {restaurant.description}
          </p>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={`/profile/${restaurant.user.id}`}
            className={`${buttonVariants({ variant: "outline", size: "sm" })} w-full`}
          >
            View profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
