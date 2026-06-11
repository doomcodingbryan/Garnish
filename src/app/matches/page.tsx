import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { MatchCard } from "@/components/MatchCard";
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
        <h1 className="text-2xl font-bold mb-8">Matches</h1>

        {matches.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">
            <p>No matches yet.</p>
            <p className="mt-1 text-sm">Accept a proposal to create a match.</p>
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
