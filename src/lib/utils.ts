import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CounterTerms, Proposal } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getActiveTerms(proposal: Proposal): {
  meal_description: string | null;
  deliverables: string;
  posting_window_days: number;
  payment_cents: number;
  message: string | null;
} {
  if (proposal.status === "countered" && proposal.counter_terms) {
    const ct: CounterTerms = proposal.counter_terms;
    return {
      meal_description: ct.meal_description,
      deliverables: ct.deliverables,
      posting_window_days: ct.posting_window_days,
      payment_cents: ct.payment_cents,
      message: ct.message,
    };
  }
  return {
    meal_description: proposal.meal_description,
    deliverables: proposal.deliverables,
    posting_window_days: proposal.posting_window_days,
    payment_cents: proposal.payment_cents,
    message: proposal.message,
  };
}

export const NICHE_TAGS = [
  "Fine Dining",
  "Casual",
  "Brunch",
  "Coffee & Cafes",
  "Cocktails & Bars",
  "Vegan & Plant-Based",
  "Asian Cuisine",
  "Italian",
  "Mexican",
  "Bakery & Desserts",
  "Farm-to-Table",
  "Street Food",
  "Seafood",
  "BBQ & Grill",
  "Healthy & Wellness",
] as const;

export const COLLAB_TYPES = [
  "Complimentary Meal",
  "Paid Post",
  "Takeover",
  "Event Coverage",
  "Grand Opening",
  "Seasonal Campaign",
  "Behind the Scenes",
] as const;

export const FOLLOWER_TIERS = [
  { label: "Nano (1K–10K)", min: 1_000, max: 10_000 },
  { label: "Micro (10K–100K)", min: 10_000, max: 100_000 },
  { label: "Mid (100K–500K)", min: 100_000, max: 500_000 },
  { label: "Macro (500K+)", min: 500_000, max: null },
] as const;

