"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ponytail: shortlist lives in localStorage, no DB. Move to a saved_creators
// table when shortlists need to sync across devices / power a "Saved" page.
const KEY = "garnish:saved-creators";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function SaveButton({
  creatorId,
  className,
}: {
  creatorId: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(read().includes(creatorId));
  }, [creatorId]);

  function toggle() {
    const ids = new Set(read());
    if (ids.has(creatorId)) ids.delete(creatorId);
    else ids.add(creatorId);
    try {
      localStorage.setItem(KEY, JSON.stringify([...ids]));
    } catch {
      // storage unavailable (private mode) — keep the in-memory state only
    }
    setSaved(ids.has(creatorId));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium transition-colors hover:bg-accent",
        saved && "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10",
        className
      )}
    >
      {saved ? (
        <BookmarkCheck className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {saved ? "Saved to shortlist" : "Save to shortlist"}
    </button>
  );
}
