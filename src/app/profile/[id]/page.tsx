import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCents, formatFollowerCount } from "@/lib/utils";
import type { CreatorProfile, RestaurantProfile } from "@/types/database";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: vp } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const viewerRole = (vp?.role ?? null) as "creator" | "restaurant" | null;
  const viewerUserId = user.id;

  // Fetch the profile owner
  const { data: owner } = await supabase
    .from("user_profiles")
    .select("id, role, display_name, avatar_url")
    .eq("id", id)
    .single();

  if (!owner) notFound();

  const ownerRole = owner.role as "creator" | "restaurant";
  const isOwnProfile = viewerUserId === id;
  const canSendProposal = !isOwnProfile && viewerRole !== null && viewerRole !== ownerRole;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-4 py-10">
        {ownerRole === "creator" ? (
          <CreatorProfileView userId={id} owner={owner} canSendProposal={canSendProposal} />
        ) : (
          <RestaurantProfileView userId={id} owner={owner} canSendProposal={canSendProposal} />
        )}
      </div>
    </div>
  );
}

async function CreatorProfileView({
  userId,
  owner,
  canSendProposal,
}: {
  userId: string;
  owner: { id: string; display_name: string; avatar_url: string | null };
  canSendProposal: boolean;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!profile) notFound();
  const cp = profile as CreatorProfile;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold shrink-0">
            {owner.display_name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{owner.display_name}</h1>
            <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
              {cp.instagram_handle && <span>@{cp.instagram_handle}</span>}
              {cp.tiktok_handle && <span>@{cp.tiktok_handle} (TikTok)</span>}
            </div>
            {cp.location && (
              <p className="text-sm text-muted-foreground mt-0.5">{cp.location}</p>
            )}
          </div>
        </div>

        {canSendProposal && (
          <Link
            href={`/proposals/new/${userId}`}
            className={buttonVariants({ size: "sm" })}
          >
            Send Proposal
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-lg border p-4 text-center">
        <div>
          <p className="text-lg font-semibold">{formatFollowerCount(cp.follower_count)}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div>
          <p className="text-lg font-semibold">
            {cp.engagement_rate != null ? `${cp.engagement_rate}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Engagement</p>
        </div>
        <div>
          <p className="text-lg font-semibold">
            {cp.flat_rate_cents != null ? formatCents(cp.flat_rate_cents) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Rate</p>
        </div>
      </div>

      {cp.niche_tags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Niches</p>
          <div className="flex flex-wrap gap-1.5">
            {cp.niche_tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {cp.bio && (
        <div className="space-y-1">
          <p className="text-sm font-medium">About</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{cp.bio}</p>
        </div>
      )}
    </div>
  );
}

async function RestaurantProfileView({
  userId,
  owner,
  canSendProposal,
}: {
  userId: string;
  owner: { id: string; display_name: string; avatar_url: string | null };
  canSendProposal: boolean;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("restaurant_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!profile) notFound();
  const rp = profile as RestaurantProfile;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold shrink-0">
            {rp.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{rp.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {rp.cuisine} · {rp.location}
            </p>
            {!rp.is_accepting_collabs && (
              <Badge variant="outline" className="mt-1 text-xs">Not accepting collabs</Badge>
            )}
          </div>
        </div>

        {canSendProposal && rp.is_accepting_collabs && (
          <Link
            href={`/proposals/new/${userId}`}
            className={buttonVariants({ size: "sm" })}
          >
            Send Proposal
          </Link>
        )}
      </div>

      {rp.collab_types.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Looking for</p>
          <div className="flex flex-wrap gap-1.5">
            {rp.collab_types.map((type) => (
              <Badge key={type} variant="secondary">{type}</Badge>
            ))}
          </div>
        </div>
      )}

      {rp.aesthetic_description && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Aesthetic</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rp.aesthetic_description}</p>
        </div>
      )}

      {rp.description && (
        <div className="space-y-1">
          <p className="text-sm font-medium">About</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rp.description}</p>
        </div>
      )}
    </div>
  );
}
