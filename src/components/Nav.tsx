import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { GradientAvatar } from "@/components/GradientAvatar";
import { Wordmark } from "@/components/Wordmark";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { display_name: string; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("user_profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href={user ? "/discover" : "/"}>
          <Wordmark />
        </Link>
        {user && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden items-center gap-1 sm:flex">
              <NavLink href="/discover">Discover</NavLink>
              <NavLink href="/proposals">Proposals</NavLink>
              <NavLink href="/matches">Matches</NavLink>
            </div>

            {/* Native disclosure dropdown, no client JS required */}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full p-1 pr-2 transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
                <GradientAvatar
                  name={profile?.display_name ?? "?"}
                  src={profile?.avatar_url}
                  className="size-8 text-sm"
                />
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-card-lg">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">
                    {profile?.display_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="my-1 h-px bg-border" />
                <div className="flex flex-col gap-0.5 sm:hidden">
                  <DropdownLink href="/discover">Discover</DropdownLink>
                  <DropdownLink href="/proposals">Proposals</DropdownLink>
                  <DropdownLink href="/matches">Matches</DropdownLink>
                  <div className="my-1 h-px bg-border" />
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </details>
          </div>
        )}
      </div>
    </nav>
  );
}

function DropdownLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  );
}
