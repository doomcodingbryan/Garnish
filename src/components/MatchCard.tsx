import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GradientAvatar } from "@/components/GradientAvatar";
import { formatCents } from "@/lib/utils";
import type { MatchStatus, MatchWithParties } from "@/types/database";
import type { ComponentProps } from "react";

type Variant = ComponentProps<typeof Badge>["variant"];

const STATUS_CONFIG: Record<MatchStatus, { label: string; variant: Variant }> = {
  pending_both: { label: "Awaiting both", variant: "warning" },
  pending_creator: { label: "Awaiting creator", variant: "warning" },
  pending_restaurant: { label: "Awaiting restaurant", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "success" },
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

  const youConfirmed = isCreator
    ? match.creator_confirmed_at != null
    : match.restaurant_confirmed_at != null;

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <GradientAvatar
            name={other.display_name}
            src={other.avatar_url}
            className="size-10 text-sm"
          />
          <p className="font-semibold">{other.display_name}</p>
        </div>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Payment</p>
          <p className="font-semibold">{formatCents(match.payment_cents)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Deadline</p>
          <p className="font-semibold">
            {new Date(match.posting_deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Your status</p>
          <p
            className={`flex items-center gap-1 font-semibold ${youConfirmed ? "text-success" : ""}`}
          >
            {youConfirmed && <Check className="size-3.5" />}
            {youConfirmed ? "Confirmed" : "Pending"}
          </p>
        </div>
      </div>

      <Link
        href={`/matches/${match.id}`}
        className={`${buttonVariants({ variant: "outline", size: "lg" })} w-full`}
      >
        View match
      </Link>
    </div>
  );
}
