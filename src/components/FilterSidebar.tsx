"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NICHE_TAGS, COLLAB_TYPES, FOLLOWER_TIERS } from "@/lib/utils";
import type { UserRole } from "@/types/database";

type ChipOption = string | { label: string; value: string };

function ChipRadioGroup({
  name,
  options,
  current,
  anyLabel,
}: {
  name: string;
  options: readonly ChipOption[];
  current: string;
  anyLabel: string;
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { label: o, value: o } : o
  );
  return (
    <div className="flex flex-wrap gap-1.5">
      {[{ label: anyLabel, value: "" }, ...normalized].map((opt, i) => {
        const checked = i === 0 ? current === "" : current === opt.value;
        return (
          <label key={opt.label} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              defaultChecked={checked}
              className="peer sr-only"
            />
            <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary">
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

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
    <aside className="w-60 shrink-0">
      <form
        ref={formRef}
        onSubmit={applyFilters}
        className="sticky top-24 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Filters</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-primary transition-colors hover:underline"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-xs">
            Location
          </Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. New York"
            defaultValue={searchParams.get("location") ?? ""}
            className="h-9 text-sm"
          />
        </div>

        {role === "restaurant" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Sort by</Label>
              <ChipRadioGroup
                name="sort"
                options={[{ label: "UGC Score", value: "ugc_score" }]}
                current={searchParams.get("sort") ?? ""}
                anyLabel="Followers"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="min_score" className="text-xs">
                Min UGC Score
              </Label>
              <Input
                id="min_score"
                name="min_score"
                type="number"
                min="0"
                max="100"
                placeholder="Any"
                defaultValue={searchParams.get("min_score") ?? ""}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Niche</Label>
              <ChipRadioGroup
                name="niche"
                options={NICHE_TAGS}
                current={searchParams.get("niche") ?? ""}
                anyLabel="Any"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Follower tier</Label>
              <ChipRadioGroup
                name="tier"
                options={FOLLOWER_TIERS.map((t) => t.label)}
                current={searchParams.get("tier") ?? ""}
                anyLabel="Any"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max_rate" className="text-xs">
                Max rate ($)
              </Label>
              <Input
                id="max_rate"
                name="max_rate"
                type="number"
                min="0"
                placeholder="No limit"
                defaultValue={searchParams.get("max_rate") ?? ""}
                className="h-9 text-sm"
              />
            </div>
          </>
        )}

        {role === "creator" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="cuisine" className="text-xs">
                Cuisine
              </Label>
              <Input
                id="cuisine"
                name="cuisine"
                placeholder="e.g. Italian"
                defaultValue={searchParams.get("cuisine") ?? ""}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Collab type</Label>
              <ChipRadioGroup
                name="collab_type"
                options={COLLAB_TYPES}
                current={searchParams.get("collab_type") ?? ""}
                anyLabel="Any"
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full">
          Apply filters
        </Button>
      </form>
    </aside>
  );
}
