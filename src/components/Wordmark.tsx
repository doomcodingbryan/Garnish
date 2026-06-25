import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "lg";
}) {
  const lg = size === "lg";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
          lg ? "size-9" : "size-7"
        )}
      >
        <Leaf className={lg ? "size-5" : "size-4"} strokeWidth={2.5} />
      </span>
      <span
        className={cn(
          "font-display font-semibold tracking-tight text-foreground",
          lg ? "text-2xl" : "text-xl"
        )}
      >
        Garnish
      </span>
    </span>
  );
}
