"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
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
];

export function HowItWorks() {
  const reduce = useReducedMotion();
  const olRef = useRef<HTMLOListElement>(null);

  // Scroll progress through the list, mapped to a continuous "frontier" position
  // along the steps (0 .. n-1). It rises as you scroll down and falls as you
  // scroll up, so the highlight tracks scrolling in both directions.
  const { scrollYProgress } = useScroll({
    target: olRef,
    offset: ["start center", "end center"],
  });
  const [frontier, setFrontier] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const clamped = Math.min(Math.max(v, 0), 1);
    setFrontier(clamped * (STEPS.length - 1));
  });

  return (
    <section className="px-4 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Heading pins in place while the steps scroll alongside it */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            From first match to confirmed collab
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
            Four steps from signing up to a locked-in collab. No agencies, no
            back-and-forth DMs.
          </p>
        </div>

        <ol ref={olRef}>
          {STEPS.map((step, i) => (
            <Step
              key={step.title}
              index={i}
              step={step}
              // Dot lights once the frontier reaches roughly its midpoint.
              lit={!!reduce || frontier >= i - 0.5}
              // Connector below the dot fills as the frontier crosses to the next.
              lineFill={reduce ? 1 : Math.min(Math.max(frontier - i, 0), 1)}
              isLast={i === STEPS.length - 1}
              reduce={!!reduce}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Step({
  index,
  step,
  lit,
  lineFill,
  isLast,
  reduce,
}: {
  index: number;
  step: { title: string; body: string };
  lit: boolean;
  lineFill: number;
  isLast: boolean;
  reduce: boolean;
}) {
  return (
    <li className={cn("relative flex gap-6", !isLast && "pb-14")}>
      {/* Rail: connector line (behind) + dot */}
      <div className="relative flex w-12 shrink-0 justify-center">
        {!isLast && (
          // top-6 = this dot's center, -bottom-6 = the next dot's center, so the
          // line runs dot-to-dot and tucks under both (dots sit above at z-10).
          <span
            aria-hidden
            className="absolute -bottom-6 left-1/2 top-6 w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-border"
          >
            <span
              className="block h-full w-full origin-top bg-primary"
              style={{ transform: `scaleY(${lineFill})` }}
            />
          </span>
        )}
        <span
          className={cn(
            "relative z-10 flex size-12 items-center justify-center rounded-full border-2 bg-background transition-colors duration-300",
            lit ? "border-primary" : "border-border"
          )}
        >
          <span
            className={cn(
              "size-4 rounded-full bg-primary transition-transform duration-300 ease-out",
              lit ? "scale-100" : "scale-0"
            )}
          />
        </span>
      </div>

      {/* Content reveals once on scroll-in; color tracks the highlight */}
      <motion.div
        className="pb-2 pt-1.5"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
      >
        <span
          className={cn(
            "font-display text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
            lit ? "text-primary" : "text-muted-foreground"
          )}
        >
          Step {String(index + 1).padStart(2, "0")}
        </span>
        <h3
          className={cn(
            "mt-1 font-display text-2xl font-semibold tracking-tight transition-colors duration-300",
            lit ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {step.title}
        </h3>
        <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">
          {step.body}
        </p>
      </motion.div>
    </li>
  );
}
