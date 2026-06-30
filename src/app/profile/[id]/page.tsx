import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, AtSign, Music2, PlaySquare } from "lucide-react";
import Nav from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GradientAvatar } from "@/components/GradientAvatar";
import { UgcScoreCard } from "@/components/UgcScoreCard";
import {
  ContentPortfolio,
  Reviews,
  AudienceCard,
  PackagesCard,
  PastCollabs,
  VerifiedBadge,
} from "@/components/CreatorProfileSections";
import { SaveButton } from "@/components/SaveButton";
import { StickyProposalBar } from "@/components/StickyProposalBar";
import { Reveal } from "@/components/motion";
import {
  RestaurantStats,
  RestaurantPhotos,
  WhatTheyOffer,
  IdealCreator,
  RestaurantReviews,
  PastCreators,
} from "@/components/RestaurantProfileSections";
import { openToFor } from "@/lib/creatorContent";
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
  aside,
}: {
  name: string;
  src?: string | null;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="h-28 sm:h-32" style={{ backgroundColor: HEADER_COVER }} />
      <div className="px-6 pb-6">
        {/* Avatar overlaps the cover; identity stacks below it, aside sits to the right */}
        <GradientAvatar
          name={name}
          src={src}
          className="-mt-12 size-24 text-3xl ring-4 ring-card"
        />
        <div className="mt-4 flex flex-col gap-x-8 gap-y-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">{children}</div>
          {aside && <div className="shrink-0 sm:max-w-[15rem]">{aside}</div>}
        </div>
      </div>
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
  // Verified when at least one platform's stats come from a real API connection.
  const verified = platforms.some((p) => p.source === "api");
  const openTo = openToFor(owner.display_name);

  return (
    <div className="space-y-6">
      <ProfileHeader
        name={owner.display_name}
        src={owner.avatar_url}
        aside={
          openTo.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground sm:text-right">
                Open to
              </p>
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                {openTo.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ) : undefined
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {owner.display_name}
          </h1>
          {verified && <VerifiedBadge />}
        </div>
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

        {cp.niche_tags.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Specializes in
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cp.niche_tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {canSendProposal && (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/proposals/new/${userId}`}
                className={`${buttonVariants({ size: "lg" })} h-11 px-6`}
              >
                Send proposal
              </Link>
              <SaveButton profileId={userId} className="w-auto px-5" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {cp.flat_rate_cents != null
                ? `From ${formatCents(cp.flat_rate_cents)} per collab · `
                : ""}
              Structured terms, counter once, both confirm.
            </p>
          </div>
        )}
      </ProfileHeader>

      {canSendProposal && (
        <StickyProposalBar
          name={owner.display_name}
          href={`/proposals/new/${userId}`}
          avatarSrc={owner.avatar_url}
          subtitle={
            cp.flat_rate_cents != null
              ? `From ${formatCents(cp.flat_rate_cents)} per collab`
              : undefined
          }
        />
      )}

      <div className={`space-y-6 ${canSendProposal ? "pb-24" : ""}`}>
        <Reveal>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Followers" value={formatFollowerCount(cp.follower_count)} />
            <Stat
              label="Engagement"
              value={cp.engagement_rate != null ? `${cp.engagement_rate}%` : "Not set"}
            />
            <Stat
              label="Rate"
              value={
                cp.flat_rate_cents != null ? formatCents(cp.flat_rate_cents) : "Not set"
              }
            />
          </div>
        </Reveal>

        <Reveal>
          <ContentPortfolio seed={owner.display_name} />
        </Reveal>

        <Reveal>
          <UgcScoreCard creator={cp} platforms={platforms} />
        </Reveal>

        <Reveal>
          <AudienceCard seed={owner.display_name} location={cp.location} />
        </Reveal>

        <Reveal>
          <PackagesCard creator={cp} />
        </Reveal>

        <Reveal>
          <Reviews seed={owner.display_name} />
        </Reveal>

        {cp.bio && (
          <Reveal>
            <Section title="About">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {cp.bio}
              </p>
            </Section>
          </Reveal>
        )}

        <Reveal>
          <PastCollabs seed={owner.display_name} />
        </Reveal>
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
      <ProfileHeader
        name={rp.name}
        src={owner.avatar_url}
        aside={
          rp.collab_types.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground sm:text-right">
                Looking for
              </p>
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                {rp.collab_types.map((type) => (
                  <Badge key={type} variant="outline">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          ) : undefined
        }
      >
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

        {canSendProposal && rp.is_accepting_collabs && (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/proposals/new/${userId}`}
                className={`${buttonVariants({ size: "lg" })} h-11 px-6`}
              >
                Send proposal
              </Link>
              <SaveButton profileId={userId} className="w-auto px-5" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Pitch a collab · structured terms, counter once, both confirm.
            </p>
          </div>
        )}
      </ProfileHeader>

      {canSendProposal && rp.is_accepting_collabs && (
        <StickyProposalBar
          name={rp.name}
          href={`/proposals/new/${userId}`}
          avatarSrc={owner.avatar_url}
          subtitle={`${rp.cuisine} · ${rp.location}`}
        />
      )}

      <div
        className={`space-y-6 ${
          canSendProposal && rp.is_accepting_collabs ? "pb-24" : ""
        }`}
      >
        <Reveal>
          <RestaurantStats seed={rp.name} />
        </Reveal>

        <Reveal>
          <RestaurantPhotos seed={rp.name} />
        </Reveal>

        <Reveal>
          <WhatTheyOffer seed={rp.name} />
        </Reveal>

        <Reveal>
          <IdealCreator seed={rp.name} />
        </Reveal>

        {rp.aesthetic_description && (
          <Reveal>
            <Section title="Aesthetic">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {rp.aesthetic_description}
              </p>
            </Section>
          </Reveal>
        )}

        {rp.description && (
          <Reveal>
            <Section title="About">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {rp.description}
              </p>
            </Section>
          </Reveal>
        )}

        <Reveal>
          <RestaurantReviews seed={rp.name} />
        </Reveal>

        <Reveal>
          <PastCreators seed={rp.name} />
        </Reveal>
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
