import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import {
  Check,
  Clock,
  ClipboardList,
  DollarSign,
  CalendarClock,
} from "lucide-react";
import Nav from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GradientAvatar } from "@/components/GradientAvatar";
import { confirmMatch } from "@/app/actions/matches";
import { formatCents } from "@/lib/utils";
import type { MatchStatus, MatchWithParties } from "@/types/database";
import type { ComponentProps } from "react";

type Variant = ComponentProps<typeof Badge>["variant"];

const STATUS_LABELS: Record<MatchStatus, string> = {
  pending_both: "Awaiting both confirmations",
  pending_creator: "Awaiting creator confirmation",
  pending_restaurant: "Awaiting restaurant confirmation",
  confirmed: "Confirmed",
};

const STATUS_VARIANTS: Record<MatchStatus, Variant> = {
  pending_both: "warning",
  pending_creator: "warning",
  pending_restaurant: "warning",
  confirmed: "success",
};

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("matches")
    .select(
      "*, creator:user_profiles!matches_creator_id_fkey(id, display_name, avatar_url), restaurant:user_profiles!matches_restaurant_id_fkey(id, display_name, avatar_url)"
    )
    .eq("id", id)
    .single();

  if (!data) notFound();
  const match = data as MatchWithParties;

  if (match.creator_id !== user.id && match.restaurant_id !== user.id) notFound();

  const isCreator = match.creator_id === user.id;
  const other = isCreator ? match.restaurant : match.creator;
  const hasConfirmed = isCreator ? !!match.creator_confirmed_at : !!match.restaurant_confirmed_at;
  const canConfirm = !hasConfirmed && match.status !== "confirmed";

  const confirmAction = confirmMatch.bind(null, id);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-xl space-y-6 px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <GradientAvatar
            name={other.display_name}
            src={other.avatar_url}
            className="size-12 text-base"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Match
              </h1>
              <Badge variant={STATUS_VARIANTS[match.status]}>
                {STATUS_LABELS[match.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              with{" "}
              <span className="font-medium text-foreground">
                {other.display_name}
              </span>
            </p>
          </div>
        </div>

        {/* Locked terms */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-semibold">Locked terms</p>
          </div>
          <div className="divide-y divide-border">
            <TermRow
              icon={ClipboardList}
              label="Deliverables"
              value={match.deliverables}
            />
            <TermRow
              icon={DollarSign}
              label="Payment"
              value={formatCents(match.payment_cents)}
              highlight
            />
            <TermRow
              icon={CalendarClock}
              label="Posting deadline"
              value={new Date(match.posting_deadline).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
        </div>

        {/* Confirmation status */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card divide-y divide-border">
          <ConfirmRow
            label={match.creator.display_name}
            confirmed={!!match.creator_confirmed_at}
            isYou={isCreator}
          />
          <ConfirmRow
            label={match.restaurant.display_name}
            confirmed={!!match.restaurant_confirmed_at}
            isYou={!isCreator}
          />
        </div>

        {/* Confirm button */}
        {canConfirm && (
          <form action={confirmAction}>
            <button
              type="submit"
              className={`${buttonVariants({ size: "lg" })} h-11 w-full`}
            >
              Confirm match
            </button>
          </form>
        )}

        {hasConfirmed && match.status !== "confirmed" && (
          <p className="rounded-xl bg-warning/15 px-4 py-3 text-center text-sm text-warning-foreground">
            You&apos;ve confirmed. Waiting for the other party.
          </p>
        )}

        {match.status === "confirmed" && (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-success/12 px-4 py-3 text-center text-sm font-medium text-success">
            <Check className="size-4" />
            Both parties confirmed. This collab is locked in.
          </p>
        )}
      </div>
    </div>
  );
}

function TermRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-3 px-5 py-3.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
        <p
          className={
            highlight ? "text-base font-semibold text-primary" : "text-sm"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ConfirmRow({
  label,
  confirmed,
  isYou,
}: {
  label: string;
  confirmed: boolean;
  isYou: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm">
        {label} {isYou && <span className="text-muted-foreground">(you)</span>}
      </span>
      {confirmed ? (
        <span className="flex items-center gap-1 text-sm font-medium text-success">
          <Check className="size-4" />
          Confirmed
        </span>
      ) : (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          Pending
        </span>
      )}
    </div>
  );
}
