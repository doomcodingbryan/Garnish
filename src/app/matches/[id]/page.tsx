import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
import { confirmMatch } from "@/app/actions/matches";
import { formatCents } from "@/lib/utils";
import type { MatchStatus, MatchWithParties } from "@/types/database";

const STATUS_LABELS: Record<MatchStatus, string> = {
  pending_both: "Awaiting both confirmations",
  pending_creator: "Awaiting creator confirmation",
  pending_restaurant: "Awaiting restaurant confirmation",
  confirmed: "Confirmed",
};

const STATUS_VARIANTS: Record<MatchStatus, "default" | "secondary" | "outline"> = {
  pending_both: "secondary",
  pending_creator: "outline",
  pending_restaurant: "outline",
  confirmed: "default",
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
      <div className="mx-auto max-w-xl px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Match</h1>
              <Badge variant={STATUS_VARIANTS[match.status]}>
                {STATUS_LABELS[match.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              with <span className="font-medium text-foreground">{other.display_name}</span>
            </p>
          </div>
        </div>

        {/* Locked terms */}
        <div className="rounded-lg border divide-y">
          <TermRow label="Deliverables" value={match.deliverables} />
          <TermRow label="Payment" value={formatCents(match.payment_cents)} />
          <TermRow
            label="Posting deadline"
            value={new Date(match.posting_deadline).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        </div>

        {/* Confirmation status */}
        <div className="rounded-lg border divide-y text-sm">
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
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Confirm match
            </button>
          </form>
        )}

        {hasConfirmed && match.status !== "confirmed" && (
          <p className="text-sm text-center text-muted-foreground">
            You&apos;ve confirmed. Waiting for the other party.
          </p>
        )}

        {match.status === "confirmed" && (
          <p className="text-sm text-center text-muted-foreground">
            Both parties have confirmed. This collab is locked in.
          </p>
        )}
      </div>
    </div>
  );
}

function TermRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
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
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm">
        {label} {isYou && <span className="text-muted-foreground">(you)</span>}
      </span>
      <span className={confirmed ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
        {confirmed ? "Confirmed" : "Pending"}
      </span>
    </div>
  );
}
