"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GradientAvatar } from "@/components/GradientAvatar";
import { buttonVariants } from "@/components/ui/button";

/**
 * Pins a "Send proposal" bar to the bottom once the header CTA scrolls out of
 * view. Drop it right after the profile header — its sentinel sits inline there
 * and the bar itself is fixed, so it appears exactly when the header leaves.
 */
export function StickyProposalBar({
  name,
  href,
  avatarSrc,
  subtitle,
}: {
  name: string;
  href: string;
  avatarSrc?: string | null;
  subtitle?: string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-0" />
      <AnimatePresence>
        {show && (
          <motion.div
            initial={reduce ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <GradientAvatar
                  name={name}
                  src={avatarSrc}
                  className="size-9 text-sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{name}</p>
                  {subtitle && (
                    <p className="truncate text-xs text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={href}
                className={`${buttonVariants({ size: "lg" })} h-11 shrink-0 px-6`}
              >
                Send proposal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
