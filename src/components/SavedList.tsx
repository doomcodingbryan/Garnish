"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Columns3, LayoutGrid } from "lucide-react";
import { CreatorCard, type CreatorRow } from "@/components/CreatorCard";
import { RestaurantCard, type RestaurantRow } from "@/components/RestaurantCard";
import { CompareCreators, CompareRestaurants } from "@/components/Compare";
import { getSavedProfiles } from "@/app/actions/saved";
import { useSaved } from "@/lib/saved";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Data = { creators: CreatorRow[]; restaurants: RestaurantRow[] };

export function SavedList() {
  const { ids } = useSaved();
  const [data, setData] = useState<Data>({ creators: [], restaurants: [] });
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"grid" | "compare">("grid");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getSavedProfiles(ids).then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [ids]);

  const total = data.creators.length + data.restaurants.length;

  if (loading && total === 0) {
    return <p className="text-sm text-muted-foreground">Loading your shortlist…</p>;
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bookmark className="size-6" />
        </div>
        <p className="mt-4 font-medium text-foreground">Nothing saved yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Tap the bookmark on any profile to add it to your shortlist, then
          compare them side by side here.
        </p>
        <Link
          href="/discover"
          className={`${buttonVariants({ size: "lg" })} mt-5`}
        >
          Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{total}</span> saved
        </p>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          <ModeTab active={mode === "grid"} onClick={() => setMode("grid")}>
            <LayoutGrid className="size-4" />
            Grid
          </ModeTab>
          <ModeTab
            active={mode === "compare"}
            disabled={total < 2}
            onClick={() => setMode("compare")}
          >
            <Columns3 className="size-4" />
            Compare
          </ModeTab>
        </div>
      </div>

      {mode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
          {data.restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data.creators.length > 0 && <CompareCreators creators={data.creators} />}
          {data.restaurants.length > 0 && (
            <CompareRestaurants restaurants={data.restaurants} />
          )}
        </div>
      )}
    </div>
  );
}

function ModeTab({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-40 hover:text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}
