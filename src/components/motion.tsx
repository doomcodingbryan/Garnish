"use client";

import {
  motion,
  animate,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise into view once. Above-fold instances trigger on mount. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Parent that staggers its <StaggerItem> children as the group scrolls in. */
export function Stagger({
  children,
  className,
  gap = 0.09,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/** Gentle, continuous bob + sway. Keeps a fixed base rotation so it reads as "floating". */
export function FloatingCard({
  children,
  className,
  rotate = 0,
  distance = 12,
  duration = 6,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  distance?: number;
  duration?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} style={{ transform: `rotate(${rotate}deg)` }}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
        rotate: [rotate, rotate + 1.2, rotate],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up to `value` when scrolled into view. */
export function CountUp({
  value,
  suffix = "",
  className,
  duration = 1.8,
}: {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Infinite horizontal flow. Renders children twice so the loop is seamless. */
export function Marquee({
  children,
  reverse = false,
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`group/marquee flex overflow-hidden ${className ?? ""}`}>
      <div
        className={`flex w-max shrink-0 animate-marquee gap-4 pr-4 group-hover/marquee:[animation-play-state:paused] ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
