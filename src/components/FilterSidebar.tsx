"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NICHE_TAGS, COLLAB_TYPES, FOLLOWER_TIERS } from "@/lib/utils";
import type { UserRole } from "@/types/database";

const selectClass =
  "flex h-8 w-full items-center rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground";

export function FilterSidebar({ role }: { role: UserRole }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  function applyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      if (value) params.set(key, String(value));
    }
    router.push(`/discover?${params.toString()}`);
  }

  function clearFilters() {
    formRef.current?.reset();
    router.push("/discover");
  }

  return (
    <aside className="w-52 shrink-0">
      <form ref={formRef} onSubmit={applyFilters} className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">Filters</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-xs">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. New York"
            defaultValue={searchParams.get("location") ?? ""}
            className="h-8 text-sm"
          />
        </div>

        {role === "restaurant" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="niche" className="text-xs">Niche</Label>
              <select
                id="niche"
                name="niche"
                defaultValue={searchParams.get("niche") ?? ""}
                className={selectClass}
              >
                <option value="">Any niche</option>
                {NICHE_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tier" className="text-xs">Follower tier</Label>
              <select
                id="tier"
                name="tier"
                defaultValue={searchParams.get("tier") ?? ""}
                className={selectClass}
              >
                <option value="">Any size</option>
                {FOLLOWER_TIERS.map((t) => (
                  <option key={t.label} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max_rate" className="text-xs">Max rate ($)</Label>
              <Input
                id="max_rate"
                name="max_rate"
                type="number"
                min="0"
                placeholder="No limit"
                defaultValue={searchParams.get("max_rate") ?? ""}
                className="h-8 text-sm"
              />
            </div>
          </>
        )}

        {role === "creator" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="cuisine" className="text-xs">Cuisine</Label>
              <Input
                id="cuisine"
                name="cuisine"
                placeholder="e.g. Italian"
                defaultValue={searchParams.get("cuisine") ?? ""}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="collab_type" className="text-xs">Collab type</Label>
              <select
                id="collab_type"
                name="collab_type"
                defaultValue={searchParams.get("collab_type") ?? ""}
                className={selectClass}
              >
                <option value="">Any type</option>
                {COLLAB_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <Button type="submit" size="sm" className="w-full">
          Apply
        </Button>
      </form>
    </aside>
  );
}
