import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import Nav from "@/components/Nav";
import { ProposalForm } from "@/components/ProposalForm";
import { GradientAvatar } from "@/components/GradientAvatar";
import { Badge } from "@/components/ui/badge";
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

        <ProposalTargetSummary
          profileId={profileId}
          role={targetUser.role as "creator" | "restaurant"}
          name={targetUser.display_name}
        />

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
  name,
}: {
  profileId: string;
  role: "creator" | "restaurant";
  name: string;
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
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
        <GradientAvatar name={name} className="size-12 text-base" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold leading-tight">{name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
            {cp.instagram_handle && <span>@{cp.instagram_handle}</span>}
            {cp.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {cp.location}
              </span>
            )}
          </div>
          {cp.niche_tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cp.niche_tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from("restaurant_profiles")
    .select("cuisine, location")
    .eq("user_id", profileId)
    .single();

  if (!data) return null;
  const rp = data as Pick<RestaurantProfile, "cuisine" | "location">;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
      <GradientAvatar name={name} className="size-12 text-base" />
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold leading-tight">{name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {rp.cuisine} · {rp.location}
        </p>
      </div>
    </div>
  );
}
