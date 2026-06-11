import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { ProposalStatusBadge } from "@/components/ProposalStatusBadge";
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
        <h1 className="text-2xl font-bold mb-8">Proposals</h1>

        {proposals.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">
            <p>No proposals yet.</p>
            <Link href="/discover" className="mt-2 text-sm underline underline-offset-2">
              Browse to find someone to collaborate with
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
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        {title}
      </h2>
      <div className="divide-y rounded-lg border overflow-hidden">{children}</div>
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
      className="flex items-center justify-between px-4 py-3 bg-background hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
          {other.display_name[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{other.display_name}</p>
          <p className="text-xs text-muted-foreground">
            {isSender ? "You sent" : "Sent you"} · {formatCents(proposal.payment_cents)}
          </p>
        </div>
      </div>
      <ProposalStatusBadge status={proposal.status} />
    </Link>
  );
}
