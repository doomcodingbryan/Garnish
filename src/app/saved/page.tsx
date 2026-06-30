import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import { SavedList } from "@/components/SavedList";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Shortlist
          </h1>
          <p className="mt-1 text-muted-foreground">
            Profiles you&apos;ve saved. Switch to compare to weigh them side by
            side.
          </p>
        </div>
        <SavedList />
      </div>
    </div>
  );
}
