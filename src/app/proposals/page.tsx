import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Inbox, ChevronRight } from "lucide-react";
import Nav from "@/components/Nav";
import { ProposalStatusBadge } from "@/components/ProposalStatusBadge";
import { GradientAvatar } from "@/components/GradientAvatar";
import { buttonVariants } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";
import type { ProposalWithParties } from "@/types/database";

export default async function ProposalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch proposals where user is initiator or recipient, with party display names
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("proposals")
    .select(
      "*, initiator:user_profiles!proposals_initiator_id_fkey(id, display_name, avatar_url), recipient:user_profiles!proposals_recipient_id_fkey(id, display_name, avatar_url)"
    )
    .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  const proposals = (data ?? []) as ProposalWithParties[];

  const received = proposals.filter((p) => p.recipient_id === user.id && p.status === "pending");
  const active = proposals.filter(
    (p) =>
      p.status === "countered" ||
      (p.initiator_id === user.id && p.status === "pending")
  );
  const closed = proposals.filter((p) =>
    ["accepted", "declined", "withdrawn"].includes(p.status)
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">
          Proposals
        </h1>

        {proposals.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Inbox className="size-6" />
            </div>
            <p className="mt-4 font-medium">No proposals yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Find someone to collaborate with to get started.
            </p>
            <Link
              href="/discover"
              className={`${buttonVariants({ size: "lg" })} mt-5`}
            >
              Browse Discover
            </Link>
          </div>
        )}

        {received.length > 0 && (
          <Section title="Action needed">
            {received.map((p) => (
              <ProposalRow key={p.id} proposal={p} userId={user.id} />
            ))}
          </Section>
        )}

        {active.length > 0 && (
          <Section title="In progress">
            {active.map((p) => (
              <ProposalRow key={p.id} proposal={p} userId={user.id} />
            ))}
          </Section>
        )}

        {closed.length > 0 && (
          <Section title="Closed">
            {closed.map((p) => (
              <ProposalRow key={p.id} proposal={p} userId={user.id} />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function ProposalRow({
  proposal,
  userId,
}: {
  proposal: ProposalWithParties;
  userId: string;
}) {
  const other =
    proposal.initiator_id === userId ? proposal.recipient : proposal.initiator;
  const isSender = proposal.initiator_id === userId;

  return (
    <Link
      href={`/proposals/${proposal.id}`}
      className="group flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
    >
      <div className="flex min-w-0 items-center gap-3">
        <GradientAvatar
          name={other.display_name}
          src={other.avatar_url}
          className="size-9 text-sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{other.display_name}</p>
          <p className="text-xs text-muted-foreground">
            {isSender ? "You sent" : "Sent you"} ·{" "}
            <span className="font-medium text-foreground">
              {formatCents(proposal.payment_cents)}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ProposalStatusBadge status={proposal.status} />
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
