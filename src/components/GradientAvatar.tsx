import { cn } from "@/lib/utils";

// Flat, on-brand warm tones (clay / terracotta / amber family).
const COLORS = [
  "oklch(0.62 0.13 38)",
  "oklch(0.66 0.12 58)",
  "oklch(0.6 0.11 28)",
  "oklch(0.68 0.1 72)",
  "oklch(0.58 0.1 22)",
] as const;

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function GradientAvatar({
  name,
  src,
  className,
  textClassName,
}: {
  name: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
}) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-1 ring-foreground/10",
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white ring-1 ring-foreground/10",
        textClassName,
        className
      )}
      style={{ backgroundColor: colorFor(name || initial) }}
    >
      {initial}
    </div>
  );
}
