"use client";

import { saveCreatorProfile } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wordmark } from "@/components/Wordmark";
import { NICHE_TAGS } from "@/lib/utils";
import { useState } from "react";

export default function CreatorOnboardingPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(formData: FormData) {
    selectedTags.forEach((tag) => formData.append("niche_tags", tag));
    setError(null);
    setLoading(true);
    try {
      await saveCreatorProfile(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex justify-center">
          <Wordmark size="lg" />
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card-lg sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Final step
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Set up your creator profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This is what restaurants will see when browsing creators.
          </p>

          <form action={handleSubmit} className="mt-6 space-y-6">
          {/* Social handles */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Social accounts
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram_handle">Instagram handle</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">@</span>
                  <Input id="instagram_handle" name="instagram_handle" placeholder="yourhandle" className="rounded-l-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok_handle">TikTok handle</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">@</span>
                  <Input id="tiktok_handle" name="tiktok_handle" placeholder="yourhandle" className="rounded-l-none" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_handle">YouTube handle</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">@</span>
                <Input id="youtube_handle" name="youtube_handle" placeholder="yourchannel" className="rounded-l-none" />
              </div>
              <p className="text-xs text-muted-foreground">
                We pull public stats from YouTube to power your UGC Score. Instagram and TikTok use your numbers below for now.
              </p>
            </div>
          </div>

          {/* Audience stats */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Audience stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="follower_count">Total followers</Label>
                <Input id="follower_count" name="follower_count" type="number" min="0" placeholder="e.g. 25000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engagement_rate">Engagement rate (%)</Label>
                <Input id="engagement_rate" name="engagement_rate" type="number" min="0" max="100" step="0.1" placeholder="e.g. 4.2" />
              </div>
            </div>
          </div>

          {/* Niche tags */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Your niche <span className="text-xs normal-case font-normal">(pick all that apply)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {NICHE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Rate & location */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Rate & location
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flat_rate">Rate per collab ($)</Label>
                <Input id="flat_rate" name="flat_rate_cents" type="number" min="0" placeholder="e.g. 250" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g. New York, NY" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea id="bio" name="bio" placeholder="Tell restaurants a bit about your content style and audience…" rows={3} maxLength={500} />
          </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full"
              disabled={loading}
            >
              {loading ? "Saving…" : "Complete profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
