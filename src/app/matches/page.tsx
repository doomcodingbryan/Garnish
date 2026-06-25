import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Handshake } from "lucide-react";
import Nav from "@/components/Nav";
import { MatchCard } from "@/components/MatchCard";
import { buttonVariants } from "@/components/ui/button";
import type { MatchWithParties } from "@/types/database";

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("matches")
    .select(
      "*, creator:user_profiles!matches_creator_id_fkey(id, display_name, avatar_url), restaurant:user_profiles!matches_restaurant_id_fkey(id, display_name, avatar_url)"
    )
    .or(`creator_id.eq.${user.id},restaurant_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const matches = (data ?? []) as MatchWithParties[];

  const active = matches.filter((m) => m.status !== "confirmed");
  const confirmed = matches.filter((m) => m.status === "confirmed");

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">
          Matches
        </h1>

        {matches.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Handshake className="size-6" />
            </div>
            <p className="mt-4 font-medium">No matches yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Accept a proposal to create a match.
            </p>
            <Link
              href="/proposals"
              className={`${buttonVariants({ variant: "outline", size: "lg" })} mt-5`}
            >
              View proposals
            </Link>
          </div>
        )}

        {active.length > 0 && (
          <Section title="Needs confirmation">
            {active.map((m) => (
              <MatchCard key={m.id} match={m} userId={user.id} />
            ))}
          </Section>
        )}

        {confirmed.length > 0 && (
          <Section title="Confirmed">
            {confirmed.map((m) => (
              <MatchCard key={m.id} match={m} userId={user.id} />
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
      <div className="grid grid-cols-1 gap-3">{children}</div>
    </div>
  );
}
