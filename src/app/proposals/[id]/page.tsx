import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Utensils, ClipboardList, CalendarClock, DollarSign, MessageSquare } from "lucide-react";
import Nav from "@/components/Nav";
import { ProposalStatusBadge } from "@/components/ProposalStatusBadge";
import { ProposalForm } from "@/components/ProposalForm";
import { GradientAvatar } from "@/components/GradientAvatar";
import { buttonVariants } from "@/components/ui/button";
import {
  acceptProposal,
  declineProposal,
  withdrawProposal,
  counterProposal,
} from "@/app/actions/proposals";
import { formatCents, getActiveTerms } from "@/lib/utils";
import type { ProposalWithParties } from "@/types/database";

export default async function ProposalDetailPage({
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
    .from("proposals")
    .select(
      "*, initiator:user_profiles!proposals_initiator_id_fkey(id, display_name, avatar_url), recipient:user_profiles!proposals_recipient_id_fkey(id, display_name, avatar_url)"
    )
    .eq("id", id)
    .single();

  if (!data) notFound();
  const proposal = data as ProposalWithParties;

  // RLS should prevent this, but guard at app level too
  if (proposal.initiator_id !== user.id && proposal.recipient_id !== user.id) {
    notFound();
  }

  const isRecipient = proposal.recipient_id === user.id;
  const isInitiator = proposal.initiator_id === user.id;
  const terms = getActiveTerms(proposal);
  const other = isInitiator ? proposal.recipient : proposal.initiator;

  const canAccept = isRecipient && ["pending", "countered"].includes(proposal.status);
  const canDecline = isRecipient && ["pending", "countered"].includes(proposal.status);
  const canCounter =
    isRecipient && proposal.status === "pending" && proposal.counter_count === 0;
  const canWithdraw = isInitiator && proposal.status === "pending";

  const acceptAction = acceptProposal.bind(null, id);
  const declineAction = declineProposal.bind(null, id);
  const withdrawAction = withdrawProposal.bind(null, id);
  const counterAction = counterProposal.bind(null, id);

  const counterInitialValues = {
    meal_description: terms.meal_description ?? undefined,
    deliverables: terms.deliverables,
    posting_window_days: terms.posting_window_days,
    payment_dollars: terms.payment_cents / 100,
    message: terms.message ?? undefined,
  };

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
                Proposal
              </h1>
              <ProposalStatusBadge status={proposal.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {isInitiator ? (
                <>
                  You →{" "}
                  <span className="font-medium text-foreground">
                    {other.display_name}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {other.display_name}
                  </span>{" "}
                  → You
                </>
              )}
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-semibold">
              {proposal.status === "countered" ? "Counter terms" : "Collab terms"}
            </p>
          </div>
          <div className="divide-y divide-border">
            {terms.meal_description && (
              <TermRow
                icon={Utensils}
                label="Meal / experience"
                value={terms.meal_description}
              />
            )}
            <TermRow
              icon={ClipboardList}
              label="Deliverables"
              value={terms.deliverables}
            />
            <TermRow
              icon={CalendarClock}
              label="Posting window"
              value={`${terms.posting_window_days} days`}
            />
            <TermRow
              icon={DollarSign}
              label="Payment"
              value={formatCents(terms.payment_cents)}
              highlight
            />
            {terms.message && (
              <TermRow
                icon={MessageSquare}
                label="Message"
                value={terms.message}
              />
            )}
          </div>
        </div>

        {/* Original terms note if countered */}
        {proposal.status === "countered" && (
          <p className="rounded-lg bg-accent px-4 py-3 text-xs text-accent-foreground">
            Terms above reflect the counter offer.{" "}
            {isInitiator
              ? "You can accept or decline. No further counters are allowed."
              : "You countered this proposal."}
          </p>
        )}

        {/* Actions */}
        {(canAccept || canDecline || canWithdraw) && (
          <div className="flex gap-3">
            {canAccept && (
              <form action={acceptAction} className="flex-1">
                <button
                  type="submit"
                  className={`${buttonVariants({ size: "lg" })} h-11 w-full`}
                >
                  Accept
                </button>
              </form>
            )}
            {canDecline && (
              <form action={declineAction} className="flex-1">
                <button
                  type="submit"
                  className={`${buttonVariants({ variant: "outline", size: "lg" })} h-11 w-full`}
                >
                  Decline
                </button>
              </form>
            )}
            {canWithdraw && (
              <form action={withdrawAction} className="flex-1">
                <button
                  type="submit"
                  className={`${buttonVariants({ variant: "outline", size: "lg" })} h-11 w-full`}
                >
                  Withdraw
                </button>
              </form>
            )}
          </div>
        )}

        {/* Counter form */}
        {canCounter && (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <hr className="flex-1 border-border" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Counter offer
              </span>
              <hr className="flex-1 border-border" />
            </div>
            <ProposalForm
              action={counterAction}
              initialValues={counterInitialValues}
              submitLabel="Send Counter"
            />
          </div>
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
          className={`whitespace-pre-wrap ${highlight ? "text-base font-semibold text-primary" : "text-sm"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
