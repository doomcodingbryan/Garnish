import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { ProposalForm } from "@/components/ProposalForm";
import { createProposal } from "@/app/actions/proposals";
import type { CreatorProfile, RestaurantProfile } from "@/types/database";

export default async function NewProposalPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: myProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!myProfile) redirect("/auth/login");

  // Prevent sending a proposal to yourself
  if (user.id === profileId) redirect("/discover");

  const { data: targetUser } = await supabase
    .from("user_profiles")
    .select("id, role, display_name")
    .eq("id", profileId)
    .single();

  if (!targetUser) notFound();

  // Must be opposite roles
  if (targetUser.role === myProfile.role) redirect("/discover");

  const action = createProposal.bind(null, profileId);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Send a proposal
          </h1>
          <p className="mt-1 text-muted-foreground">
            to{" "}
            <span className="font-medium text-foreground">
              {targetUser.display_name}
            </span>
          </p>
        </div>

        <ProposalTargetSummary profileId={profileId} role={targetUser.role as "creator" | "restaurant"} />

        <div className="mt-8">
          <ProposalForm action={action} />
        </div>
      </div>
    </div>
  );
}

async function ProposalTargetSummary({
  profileId,
  role,
}: {
  profileId: string;
  role: "creator" | "restaurant";
}) {
  const supabase = await createClient();

  if (role === "creator") {
    const { data } = await supabase
      .from("creator_profiles")
      .select("instagram_handle, tiktok_handle, niche_tags, location")
      .eq("user_id", profileId)
      .single();

    if (!data) return null;
    const cp = data as Pick<CreatorProfile, "instagram_handle" | "tiktok_handle" | "niche_tags" | "location">;

    return (
      <div className="space-y-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card">
        <div className="flex gap-3 text-muted-foreground">
          {cp.instagram_handle && <span>@{cp.instagram_handle}</span>}
          {cp.tiktok_handle && <span>@{cp.tiktok_handle} (TikTok)</span>}
        </div>
        {cp.location && <p className="text-muted-foreground">{cp.location}</p>}
        {cp.niche_tags.length > 0 && (
          <p className="text-muted-foreground">{cp.niche_tags.slice(0, 4).join(" · ")}</p>
        )}
      </div>
    );
  }

  const { data } = await supabase
    .from("restaurant_profiles")
    .select("name, cuisine, location")
    .eq("user_id", profileId)
    .single();

  if (!data) return null;
  const rp = data as Pick<RestaurantProfile, "name" | "cuisine" | "location">;

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-card">
      {rp.cuisine} · {rp.location}
    </div>
  );
}
