import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, AtSign, Music2, PlaySquare } from "lucide-react";
import Nav from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GradientAvatar } from "@/components/GradientAvatar";
import { UgcScoreCard } from "@/components/UgcScoreCard";
import { formatCents, formatFollowerCount } from "@/lib/utils";
import type {
  CreatorPlatform,
  CreatorProfile,
  RestaurantProfile,
} from "@/types/database";

const HEADER_COVER = "oklch(0.7 0.11 58)";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: vp } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const viewerRole = (vp?.role ?? null) as "creator" | "restaurant" | null;
  const viewerUserId = user.id;

  const { data: owner } = await supabase
    .from("user_profiles")
    .select("id, role, display_name, avatar_url")
    .eq("id", id)
    .single();

  if (!owner) notFound();

  const ownerRole = owner.role as "creator" | "restaurant";
  const isOwnProfile = viewerUserId === id;
  const canSendProposal =
    !isOwnProfile && viewerRole !== null && viewerRole !== ownerRole;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-5xl px-4 py-8">
        {ownerRole === "creator" ? (
          <CreatorProfileView
            userId={id}
            owner={owner}
            canSendProposal={canSendProposal}
          />
        ) : (
          <RestaurantProfileView
            userId={id}
            owner={owner}
            canSendProposal={canSendProposal}
          />
        )}
      </div>
    </div>
  );
}

function ProfileHeader({
  name,
  src,
  children,
}: {
  name: string;
  src?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="h-32 sm:h-40" style={{ backgroundColor: HEADER_COVER }} />
      <div className="px-6 pb-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
          <GradientAvatar
            name={name}
            src={src}
            className="size-24 text-3xl ring-4 ring-card"
          />
          <div className="flex-1 pb-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CtaCard({
  userId,
  label,
  sublabel,
  disabled,
}: {
  userId: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-card">
      {sublabel && (
        <p className="mb-3 text-sm text-muted-foreground">{sublabel}</p>
      )}
      {disabled ? (
        <button
          disabled
          className={`${buttonVariants({ size: "lg" })} h-11 w-full cursor-not-allowed opacity-60`}
        >
          {label}
        </button>
      ) : (
        <Link
          href={`/proposals/new/${userId}`}
          className={`${buttonVariants({ size: "lg" })} h-11 w-full`}
        >
          {label}
        </Link>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Structured terms · counter once · both confirm
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3">{children}</div>
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

  const { data: platformData } = await supabase
    .from("creator_platforms")
    .select("*")
    .eq("creator_id", cp.id);
  const platforms = (platformData ?? []) as CreatorPlatform[];

  return (
    <div className="space-y-6">
      <ProfileHeader name={owner.display_name} src={owner.avatar_url}>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {owner.display_name}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {cp.instagram_handle && (
            <span className="flex items-center gap-1">
              <AtSign className="size-3.5" />
              {cp.instagram_handle}
            </span>
          )}
          {cp.tiktok_handle && (
            <span className="flex items-center gap-1">
              <Music2 className="size-3.5" />@{cp.tiktok_handle}
            </span>
          )}
          {cp.youtube_handle && (
            <span className="flex items-center gap-1">
              <PlaySquare className="size-3.5" />@{cp.youtube_handle}
            </span>
          )}
          {cp.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {cp.location}
            </span>
          )}
        </div>
      </ProfileHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Followers" value={formatFollowerCount(cp.follower_count)} />
            <Stat
              label="Engagement"
              value={
                cp.engagement_rate != null ? `${cp.engagement_rate}%` : "Not set"
              }
            />
            <Stat
              label="Rate"
              value={
                cp.flat_rate_cents != null
                  ? formatCents(cp.flat_rate_cents)
                  : "Not set"
              }
            />
          </div>

          <UgcScoreCard creator={cp} platforms={platforms} />

          {cp.niche_tags.length > 0 && (
            <Section title="Niches">
              <div className="flex flex-wrap gap-1.5">
                {cp.niche_tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {cp.bio && (
            <Section title="About">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {cp.bio}
              </p>
            </Section>
          )}
        </div>

        {canSendProposal && (
          <div className="lg:col-span-1">
            <CtaCard
              userId={userId}
              label="Send proposal"
              sublabel={
                cp.flat_rate_cents != null
                  ? `From ${formatCents(cp.flat_rate_cents)} per collab`
                  : "Send a collab proposal"
              }
            />
          </div>
        )}
      </div>
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
      <ProfileHeader name={rp.name} src={owner.avatar_url}>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {rp.name}
          </h1>
          {rp.is_accepting_collabs ? (
            <Badge variant="success">Open to collabs</Badge>
          ) : (
            <Badge variant="outline">Not accepting collabs</Badge>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {rp.cuisine} · {rp.location}
        </p>
      </ProfileHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {rp.collab_types.length > 0 && (
            <Section title="Looking for">
              <div className="flex flex-wrap gap-1.5">
                {rp.collab_types.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {rp.aesthetic_description && (
            <Section title="Aesthetic">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {rp.aesthetic_description}
              </p>
            </Section>
          )}

          {rp.description && (
            <Section title="About">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {rp.description}
              </p>
            </Section>
          )}
        </div>

        {canSendProposal && rp.is_accepting_collabs && (
          <div className="lg:col-span-1">
            <CtaCard
              userId={userId}
              label="Send proposal"
              sublabel="Pitch a collab to this restaurant"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-card">
      <p className="font-heading text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
