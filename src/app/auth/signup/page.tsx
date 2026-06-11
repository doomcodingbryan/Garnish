"use client";

import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Join Garnish</h1>
          <p className="mt-2 text-muted-foreground">Create your account to get started</p>
        </div>

        {/* Role selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("creator")}
            className={`rounded-xl border-2 p-5 text-left transition-colors ${
              role === "creator"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-2xl mb-2">🎥</div>
            <div className="font-semibold">Creator</div>
            <div className="text-sm text-muted-foreground mt-1">
              I create content and want to partner with restaurants
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRole("restaurant")}
            className={`rounded-xl border-2 p-5 text-left transition-colors ${
              role === "restaurant"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-2xl mb-2">🍽️</div>
            <div className="font-semibold">Restaurant</div>
            <div className="text-sm text-muted-foreground mt-1">
              I own a restaurant and want to work with creators
            </div>
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="role" value={role ?? ""} />

          <div className="space-y-2">
            <Label htmlFor="display_name">Full name</Label>
            <Input id="display_name" name="display_name" placeholder="Your name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Min 6 characters" required minLength={6} />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={!role || loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
