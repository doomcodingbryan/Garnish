import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { NavLink } from "@/components/NavLink";

export default async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link href={user ? "/discover" : "/"} className="font-bold text-lg tracking-tight">
          Garnish
        </Link>
        {user && (
          <div className="flex items-center gap-6">
            <NavLink href="/discover">Discover</NavLink>
            <NavLink href="/proposals">Proposals</NavLink>
            <NavLink href="/matches">Matches</NavLink>
            <form action={signOut}>
              <button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
