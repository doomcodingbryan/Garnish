import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">Garnish</span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Sign in
            </Link>
            <Link href="/auth/signup" className={buttonVariants({ size: "sm" })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-2xl leading-tight">
          Find the right creator for your restaurant
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-lg">
          Garnish connects restaurants with food creators for authentic marketing collabs — no agencies, no guesswork.
        </p>
        <div className="mt-10 flex gap-3">
          <Link href="/auth/signup" className={buttonVariants({ size: "lg" })}>
            Get started free
          </Link>
          <Link href="/auth/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Sign in
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Set up your profile", body: "Restaurants list their vibe and what they're looking for. Creators share their niche, rates, and stats." },
              { step: "2", title: "Discover & browse", body: "Restaurants browse creators filtered by niche, location, follower tier, and rate." },
              { step: "3", title: "Send a proposal", body: "Send a structured collab proposal with deliverables, posting window, and payment." },
              { step: "4", title: "Negotiate & confirm", body: "Counter once, then both parties confirm the locked terms to kick off the collab." },
            ].map(({ step, title, body }) => (
              <div key={step} className="space-y-2">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {step}
                </div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For both sides */}
      <section className="border-t px-4 py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl grid sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">For restaurants</p>
            <h3 className="text-xl font-bold">Stop hoping someone stumbles across your food</h3>
            <p className="text-muted-foreground text-sm">
              Find creators who already love the food you make. Set your collab type, budget, and aesthetic — and get discovered by the right people.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">For creators</p>
            <h3 className="text-xl font-bold">Turn your content into paid collabs</h3>
            <p className="text-muted-foreground text-sm">
              List your rates, niches, and handles. Restaurants come to you with structured proposals — no DM negotiation required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="mt-3 text-muted-foreground">Join as a restaurant or creator — it only takes a few minutes.</p>
        <Link href="/auth/signup" className={`${buttonVariants({ size: "lg" })} mt-8 inline-flex`}>
          Create your profile
        </Link>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Garnish
      </footer>
    </div>
  );
}
