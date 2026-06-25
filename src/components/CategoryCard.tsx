"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export type Category = {
  name: string;
  blurb: string;
  /** Solid warm color block behind the card (no gradients). */
  color: string;
  image: string;
  href: string;
};

export function CategoryCard({ name, blurb, color, image, href }: Category) {
  return (
    <Link href={href} className="group block">
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative flex h-52 flex-col justify-end overflow-hidden rounded-2xl p-5 shadow-card transition-shadow duration-300 group-hover:shadow-card-lg"
        style={{ backgroundColor: color }}
      >
        {/* Decorative food thumbnail tucked into the corner */}
        <div className="absolute -right-6 -top-6 size-28 rotate-6 overflow-hidden rounded-2xl ring-4 ring-white/15 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="relative">
          <h3 className="font-display text-2xl font-semibold leading-tight text-white">
            {name}
          </h3>
          <p className="mt-1 pr-12 text-sm text-white/75">{blurb}</p>
        </div>

        <span className="absolute bottom-5 right-5 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/25">
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </motion.div>
    </Link>
  );
}
