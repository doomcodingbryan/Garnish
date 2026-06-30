"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaved } from "@/lib/saved";

export function SaveButton({
  profileId,
  variant = "full",
  className,
}: {
  profileId: string;
  variant?: "full" | "icon";
  className?: string;
}) {
  const { has, toggle } = useSaved();
  const saved = has(profileId);

  // Stop the click from triggering a parent <Link> (cards) or form.
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(profileId);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-card backdrop-blur-sm transition-colors hover:bg-background",
          saved && "bg-primary text-primary-foreground hover:bg-primary/90",
          className
        )}
      >
        {saved ? (
          <BookmarkCheck className="size-4" />
        ) : (
          <Bookmark className="size-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
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
