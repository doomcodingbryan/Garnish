import { z } from "zod";
import { NICHE_TAGS } from "@/lib/utils";

const validNicheTags = NICHE_TAGS as readonly string[];

export const CreatorProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  instagram_handle: z.string().max(64).optional(),
  tiktok_handle: z.string().max(64).optional(),
  follower_count: z.coerce.number().int().min(0),
  engagement_rate: z.coerce.number().min(0).max(100).optional(),
  niche_tags: z
    .array(z.string())
    .refine((tags) => tags.every((t) => validNicheTags.includes(t)), {
      message: "Invalid niche tag",
    }),
  flat_rate_cents: z.coerce.number().int().min(0).optional(),
  location: z.string().max(120).optional(),
});

export type CreatorProfileInput = z.infer<typeof CreatorProfileSchema>;
