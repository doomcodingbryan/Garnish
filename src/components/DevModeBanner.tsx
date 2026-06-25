import Link from "next/link";
import { DEV_AUTH_BYPASS, getDevRole } from "@/lib/dev";

/**
 * Fixed banner shown only when DEV_AUTH_BYPASS is on. Surfaces that auth is
 * faked and lets you switch the active dev role (?devRole= sets a cookie via
 * the proxy). Renders nothing in normal mode.
 */
export async function DevModeBanner() {
  if (!DEV_AUTH_BYPASS) return null;
  const role = await getDevRole();

  const pill = (target: "restaurant" | "creator", label: string) => (
    <Link
      href={`/discover?devRole=${target}`}
      prefetch={false}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
        role === target
          ? "bg-primary text-primary-foreground"
          : "bg-background/70 text-foreground hover:bg-background"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex items-center justify-center gap-2 bg-warning px-4 py-1.5 text-warning-foreground">
      <span className="text-xs font-semibold uppercase tracking-wide">
        Dev mode
      </span>
      <span className="text-xs">login bypassed, viewing as</span>
      {pill("restaurant", "Restaurant")}
      {pill("creator", "Creator")}
    </div>
  );
}
