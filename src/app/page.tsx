"use client";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wordmark } from "@/components/Wordmark";
import { GradientAvatar } from "@/components/GradientAvatar";
import { CategoryCard, type Category } from "@/components/CategoryCard";
import {
  Reveal,
  Stagger,
  StaggerItem,
  FloatingCard,
  CountUp,
  Marquee,
} from "@/components/motion";
import { foodImage, FOOD_IMAGES } from "@/lib/images";
import Link from "next/link";
import { Star, MapPin, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Sign in
            </Link>
            <Link href="/auth/signup" className={buttonVariants({ size: "lg" })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <Stagger delay={0.05}>
            <StaggerItem>
              <Badge variant="brand" className="mb-5 h-7 px-3 text-sm">
                The marketplace for food collabs
              </Badge>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                Find the right creator for your restaurant
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">
                Garnish connects restaurants with food creators for authentic
                marketing collabs. No agencies, no guesswork, no DM haggling.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/auth/signup"
                  className={`${buttonVariants({ size: "lg" })} h-12 px-6 text-base`}
                >
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className={`${buttonVariants({ variant: "outline", size: "lg" })} h-12 px-6 text-base`}
                >
                  Sign in
                </Link>
              </div>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-5 text-sm text-muted-foreground">
                Join as a{" "}
                <span className="font-medium text-foreground">restaurant</span>{" "}
                or{" "}
                <span className="font-medium text-foreground">creator</span>.
                Free to start.
              </p>
            </StaggerItem>
          </Stagger>

          {/* Floating preview cards */}
          <div className="relative hidden h-[420px] lg:block">
            <FloatingCard
              className="absolute right-4 top-2 w-72"
              rotate={2}
              duration={6}
            >
              <PreviewCreatorCard />
            </FloatingCard>
            <FloatingCard
              className="absolute bottom-2 left-0 w-72"
              rotate={-2}
              duration={7}
              delay={0.8}
              distance={14}
            >
              <PreviewRestaurantCard />
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* Flowing feed of food content */}
      <section className="overflow-hidden border-b border-border bg-background py-12">
        <p className="mb-7 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Fresh content from creators, every day
        </p>
        <div className="flex flex-col gap-4">
          <Marquee>
            {FOOD_IMAGES.map((id, i) => (
              <FoodTile key={`a-${id}-${i}`} id={id} />
            ))}
          </Marquee>
          <Marquee reverse>
            {[...FOOD_IMAGES].reverse().map((id, i) => (
              <FoodTile key={`b-${id}-${i}`} id={id} />
            ))}
          </Marquee>
        </div>
      </section>

      {/* Trust band */}
      <section className="border-b border-border bg-card">
        <Reveal className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-border px-4 py-10 text-center">
          {[
            { value: 2400, suffix: "+", label: "Food creators" },
            { value: 850, suffix: "+", label: "Restaurants" },
            { value: 5100, suffix: "+", label: "Collabs booked" },
          ].map(({ value, suffix, label }) => (
            <div key={label}>
              <CountUp
                value={value}
                suffix={suffix}
                className="font-display text-4xl font-semibold text-primary sm:text-5xl"
              />
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* How it works */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              How it works
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              From first match to confirmed collab
            </h2>
          </Reveal>
          <Stagger className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Set up your profile",
                body: "Restaurants list their vibe and what they're looking for. Creators share their niche, rates, and stats.",
              },
              {
                title: "Discover and browse",
                body: "Browse the other side filtered by niche, location, follower tier, and rate.",
              },
              {
                title: "Send a proposal",
                body: "Send a structured collab proposal with deliverables, posting window, and payment.",
              },
              {
                title: "Negotiate and confirm",
                body: "Counter once, then both parties confirm the locked terms to kick off the collab.",
              },
            ].map(({ title, body }, i) => (
              <StaggerItem
                key={title}
                className="border-t-2 border-foreground/10 pt-5"
              >
                <span className="font-display text-5xl font-semibold text-primary/90">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-base font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Browse by category */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Browse by category
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
                Find creators in your niche
              </h2>
            </div>
            <Link
              href="/discover"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              See all
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Stagger className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <StaggerItem key={c.name}>
                <CategoryCard {...c} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Testimonials — a flowing feed of voices */}
      <section className="overflow-hidden pb-24">
        <div className="mx-auto mb-12 max-w-6xl px-4">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              What people <span className="italic">create</span> with Garnish
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground sm:text-right">
              From restaurants filling tables to creators landing paid collabs,
              Garnish turns intent into real bookings. Here is how they describe
              it.
            </p>
          </Reveal>
        </div>

        <Marquee>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="w-[340px] shrink-0">
              <TestimonialCard {...t} />
            </div>
          ))}
        </Marquee>
      </section>

      {/* For both sides */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl space-y-20">
          <Reveal>
            <FeatureRow
              tag="For restaurants"
              title="Stop hoping someone stumbles across your food"
              body="Find creators who already love the food you make. Set your collab type, budget, and aesthetic, then get discovered by the right people."
              cta="List your restaurant"
              image={foodImage("photo-1517248135467-4c7edcad34c4", 900)}
            />
          </Reveal>
          <Reveal>
            <FeatureRow
              reverse
              tag="For creators"
              title="Turn your content into paid collabs"
              body="List your rates, niches, and handles. Restaurants come to you with structured proposals, so there is no DM negotiation required."
              cta="Join as a creator"
              image={foodImage("photo-1504674900247-0877df9cc836", 900)}
            />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <Reveal className="mx-auto max-w-5xl rounded-3xl bg-primary px-8 py-14 text-primary-foreground shadow-card-lg sm:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
                Get started
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Your next collab is one match away
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Set up your profile in a few minutes and start sending or
                receiving structured proposals today.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-card px-6 text-base font-medium text-foreground transition-colors hover:bg-card/90"
              >
                Join as a restaurant
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-primary-foreground/35 px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Join as a creator
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <Wordmark />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Garnish. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FoodTile({ id }: { id: string }) {
  return (
    <div className="h-28 w-44 shrink-0 overflow-hidden rounded-2xl shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foodImage(id, 400)}
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}

// Featured niches, each linking into filtered Discover results. Colors are
// solid warm blocks (no gradients) drawn from the clay-orange family.
const CATEGORIES: Category[] = [
  {
    name: "Brunch",
    blurb: "Mimosas, stacks & late mornings",
    color: "oklch(0.62 0.13 62)",
    image: foodImage("photo-1540189549336-e6e99c3679fe", 300),
    href: "/discover?niche=Brunch",
  },
  {
    name: "Coffee & Cafes",
    blurb: "Latte art & cozy corners",
    color: "oklch(0.42 0.055 55)",
    image: foodImage("photo-1466978913421-dad2ebd01d17", 300),
    href: "/discover?niche=Coffee+%26+Cafes",
  },
  {
    name: "Fine Dining",
    blurb: "Plated, refined, unforgettable",
    color: "oklch(0.55 0.14 36)",
    image: foodImage("photo-1414235077428-338989a2e8c0", 300),
    href: "/discover?niche=Fine+Dining",
  },
  {
    name: "Street Food",
    blurb: "Bold bites, big flavor",
    color: "oklch(0.6 0.15 48)",
    image: foodImage("photo-1565299624946-b28f40a0ae38", 300),
    href: "/discover?niche=Street+Food",
  },
];

type Testimonial = {
  quote: string;
  body: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Garnish booked our slow Tuesdays solid.",
    body: "We turned a dead mid-week into a fully booked tasting night with three local creators.",
    name: "Sofia Kim",
    role: "Owner at Lupo Trattoria",
  },
  {
    quote: "I stopped haggling in DMs.",
    body: "Every collab arrives as a clear offer with deliverables and pay. I just say yes.",
    name: "Marcus Lee",
    role: "Food creator, 120K",
  },
  {
    quote: "The best ROI of any channel we run.",
    body: "We turned vague marketing ideas into booked, on-brand collabs in record time.",
    name: "Priya Nair",
    role: "Marketing Lead at Saffron",
  },
  {
    quote: "Found creators who love our food.",
    body: "No agencies, no guesswork. The match quality is genuinely impressive.",
    name: "Diego Alvarez",
    role: "Chef at Casa Verde",
  },
  {
    quote: "My calendar fills itself now.",
    body: "Restaurants reach out with real budgets. It changed how I work.",
    name: "Hana Sato",
    role: "Food creator, 85K",
  },
];

function TestimonialCard({ quote, body, name, role }: Testimonial) {
  return (
    <div className="group/t relative flex min-h-[260px] cursor-default flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-card-lg">
      {/* Warm wash fades in on hover of this card */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/t:opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(168deg, oklch(0.96 0.025 82) 0%, oklch(0.86 0.09 62) 52%, oklch(0.71 0.17 47) 100%)",
        }}
      />
      <div className="relative flex flex-1 flex-col">
        <p className="font-display text-lg font-medium leading-snug">{quote}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover/t:text-foreground/80">
          {body}
        </p>
        <div className="mt-auto flex items-center gap-2.5 pt-8">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.65rem] font-semibold text-foreground ring-1 ring-border transition-colors duration-300 group-hover/t:bg-white/25 group-hover/t:text-white group-hover/t:ring-white/40">
            {name[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight transition-colors duration-300 group-hover/t:text-white">
              {name}
            </p>
            <p className="truncate text-xs text-muted-foreground transition-colors duration-300 group-hover/t:text-white/85">
              {role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  tag,
  title,
  body,
  cta,
  image,
  reverse,
}: {
  tag: string;
  title: string;
  body: string;
  cta: string;
  image: string;
  reverse?: boolean;
}) {
  return (
    <div className="group grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <div
        className={`overflow-hidden rounded-3xl shadow-card ${reverse ? "md:order-2" : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="h-72 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className={reverse ? "md:order-1" : ""}>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {tag}
        </p>
        <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">
          {title}
        </h3>
        <p className="mt-4 leading-relaxed text-muted-foreground">{body}</p>
        <Link
          href="/auth/signup"
          className={`${buttonVariants({ size: "lg" })} mt-6`}
        >
          {cta}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function PreviewCreatorCard({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-card-lg ${className ?? ""}`}
    >
      <div className="flex items-center gap-3">
        <GradientAvatar name="Maya Chen" className="size-11 text-base" />
        <div>
          <p className="font-semibold leading-tight">Maya Chen</p>
          <p className="text-sm text-muted-foreground">@mayaeats</p>
        </div>
      </div>
      <div className="mt-3 flex gap-4 rounded-lg bg-muted/60 px-3 py-2 text-sm">
        <div>
          <p className="font-semibold">84.2K</p>
          <p className="text-xs text-muted-foreground">followers</p>
        </div>
        <div>
          <p className="font-semibold">6.1%</p>
          <p className="text-xs text-muted-foreground">engagement</p>
        </div>
        <div>
          <p className="font-semibold">$450</p>
          <p className="text-xs text-muted-foreground">per collab</p>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        <Badge variant="secondary" className="text-xs">
          Brunch
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Coffee & Cafes
        </Badge>
      </div>
    </div>
  );
}

function PreviewRestaurantCard({ className }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-card shadow-card-lg ${className ?? ""}`}
    >
      <div className="relative h-28 overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foodImage("photo-1414235077428-338989a2e8c0", 600)}
          alt="Bottega Rosso"
          className="h-full w-full object-cover"
        />
        <Badge className="absolute left-3 top-3 border-0 bg-background/85 text-foreground backdrop-blur-sm">
          Italian
        </Badge>
        <Badge className="absolute right-3 top-3 gap-1 border-0 bg-background/85 text-foreground backdrop-blur-sm">
          Open to collabs
        </Badge>
      </div>
      <div className="p-4">
        <p className="font-semibold leading-tight">Bottega Rosso</p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          Brooklyn, NY
        </p>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="size-3.5 fill-warning text-warning" />
          Paid Post · Event Coverage
        </div>
      </div>
    </div>
  );
}
