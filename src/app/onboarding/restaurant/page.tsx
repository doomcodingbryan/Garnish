"use client";

import { saveRestaurantProfile } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wordmark } from "@/components/Wordmark";
import { COLLAB_TYPES } from "@/lib/utils";
import { useState } from "react";

export default function RestaurantOnboardingPage() {
  const [selectedCollabTypes, setSelectedCollabTypes] = useState<string[]>([]);
  const [isAccepting, setIsAccepting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleCollabType(type: string) {
    setSelectedCollabTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(formData: FormData) {
    selectedCollabTypes.forEach((type) => formData.append("collab_types", type));
    formData.set("is_accepting_collabs", String(isAccepting));
    setError(null);
    setLoading(true);
    try {
      await saveRestaurantProfile(formData);
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
            Set up your restaurant profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This is what creators will see when browsing opportunities.
          </p>

          <form action={handleSubmit} className="mt-6 space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Basic info
            </h2>
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant name</Label>
              <Input id="name" name="name" placeholder="e.g. Osteria Lupo" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine type</Label>
                <Input id="cuisine" name="cuisine" placeholder="e.g. Italian, Japanese…" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g. Brooklyn, NY" required />
              </div>
            </div>
          </div>

          {/* Collab types */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Open to <span className="text-xs normal-case font-normal">(pick all that apply)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {COLLAB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleCollabType(type)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedCollabTypes.includes(type)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Aesthetic & description */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              About your restaurant
            </h2>
            <div className="space-y-2">
              <Label htmlFor="aesthetic_description">Aesthetic / vibe</Label>
              <Input id="aesthetic_description" name="aesthetic_description" placeholder="e.g. Cozy trattoria, warm lighting, rustic Italian décor" maxLength={600} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea id="description" name="description" placeholder="Tell creators what makes your restaurant special and what kind of content you're looking for…" rows={3} maxLength={800} />
            </div>
          </div>

          {/* Accepting collabs toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-sm">Accepting collaborations</p>
              <p className="text-sm text-muted-foreground">Creators can find and reach out to you</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAccepting((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAccepting ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAccepting ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
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
