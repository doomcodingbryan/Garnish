import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact UGC Score pill for listing cards. Solid clay-orange (design-system
 * primary, no gradients). Renders a muted placeholder when the creator has not
 * been scored yet.
 */
export function UgcScoreBadge({
  score,
  tier,
  className,
}: {
  score: number | null;
  tier: string | null;
  className?: string;
}) {
  if (score == null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm",
          className
        )}
      >
        <Gauge className="size-3.5" />
        Not scored yet
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-card",
        className
      )}
    >
      <Gauge className="size-3.5" />
      <span className="tabular-nums">{score}</span>
      <span className="font-medium opacity-90">UGC{tier ? ` · ${tier}` : ""}</span>
    </span>
  );
}
