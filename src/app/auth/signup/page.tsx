"use client";

import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/Wordmark";
import { Video, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [role, setRole] = useState<"creator" | "restaurant" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (!role) return;
    setError(null);
    setLoading(true);
    try {
      await signUp(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Wordmark size="lg" />
          </Link>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card-lg">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Join Garnish
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Create your account to get started
            </p>
          </div>

          {/* Role selection */}
          <div className="mt-6">
            <Label className="text-xs">I am a…</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("creator")}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  role === "creator"
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Video className="size-5" />
                </div>
                <div className="font-semibold">Creator</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  I create content and want to partner with restaurants
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("restaurant")}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  role === "restaurant"
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UtensilsCrossed className="size-5" />
                </div>
                <div className="font-semibold">Restaurant</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  I own a restaurant and want to work with creators
                </div>
              </button>
            </div>
          </div>

          <form action={handleSubmit} className="mt-5 space-y-4">
            <input type="hidden" name="role" value={role ?? ""} />

            <div className="space-y-2">
              <Label htmlFor="display_name">Full name</Label>
              <Input
                id="display_name"
                name="display_name"
                placeholder="Your name"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="h-10"
              />
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
              disabled={!role || loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
