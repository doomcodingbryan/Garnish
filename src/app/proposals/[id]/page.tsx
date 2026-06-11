import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { ProposalStatusBadge } from "@/components/ProposalStatusBadge";
import { ProposalForm } from "@/components/ProposalForm";
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
      <div className="mx-auto max-w-xl px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Proposal</h1>
              <ProposalStatusBadge status={proposal.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {isInitiator
                ? <>You → <span className="font-medium text-foreground">{other.display_name}</span></>
                : <><span className="font-medium text-foreground">{other.display_name}</span> → You</>}
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="rounded-lg border divide-y">
          {terms.meal_description && (
            <TermRow label="Meal / experience" value={terms.meal_description} />
          )}
          <TermRow label="Deliverables" value={terms.deliverables} />
          <TermRow
            label="Posting window"
            value={`${terms.posting_window_days} days`}
          />
          <TermRow label="Payment" value={formatCents(terms.payment_cents)} />
          {terms.message && (
            <TermRow label="Message" value={terms.message} />
          )}
        </div>

        {/* Original terms note if countered */}
        {proposal.status === "countered" && (
          <p className="text-xs text-muted-foreground">
            Terms above reflect the counter offer.{" "}
            {isInitiator
              ? "You can accept or decline — no further counters are allowed."
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
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Accept
                </button>
              </form>
            )}
            {canDecline && (
              <form action={declineAction} className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Decline
                </button>
              </form>
            )}
            {canWithdraw && (
              <form action={withdrawAction}>
                <button
                  type="submit"
                  className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Withdraw
                </button>
              </form>
            )}
          </div>
        )}

        {/* Counter form */}
        {canCounter && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <hr className="flex-1 border-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
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

function TermRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
}
