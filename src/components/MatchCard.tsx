import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";
import type { MatchStatus, MatchWithParties } from "@/types/database";

const STATUS_CONFIG: Record<MatchStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending_both: { label: "Awaiting both", variant: "secondary" },
  pending_creator: { label: "Awaiting creator", variant: "outline" },
  pending_restaurant: { label: "Awaiting restaurant", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
};

export function MatchCard({
  match,
  userId,
}: {
  match: MatchWithParties;
  userId: string;
}) {
  const isCreator = match.creator_id === userId;
  const other = isCreator ? match.restaurant : match.creator;
  const { label, variant } = STATUS_CONFIG[match.status];

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
            {other.display_name[0].toUpperCase()}
          </div>
          <p className="font-medium">{other.display_name}</p>
        </div>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Payment</p>
          <p className="font-medium">{formatCents(match.payment_cents)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Deadline</p>
          <p className="font-medium">
            {new Date(match.posting_deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Your status</p>
          <p className="font-medium">
            {isCreator
              ? match.creator_confirmed_at ? "Confirmed" : "Pending"
              : match.restaurant_confirmed_at ? "Confirmed" : "Pending"}
          </p>
        </div>
      </div>

      <Link
        href={`/matches/${match.id}`}
        className={`${buttonVariants({ variant: "outline", size: "sm" })} w-full`}
      >
        View match
      </Link>
    </div>
  );
}
