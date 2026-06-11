import { z } from "zod";
import { COLLAB_TYPES } from "@/lib/utils";

const validCollabTypes = COLLAB_TYPES as readonly string[];

export const RestaurantProfileSchema = z.object({
  name: z.string().min(1).max(120),
  cuisine: z.string().min(1).max(80),
  location: z.string().min(1).max(200),
  aesthetic_description: z.string().max(600).optional(),
  collab_types: z
    .array(z.string())
    .refine((types) => types.every((t) => validCollabTypes.includes(t)), {
      message: "Invalid collab type",
    }),
  description: z.string().max(800).optional(),
  is_accepting_collabs: z.boolean().default(true),
});

export type RestaurantProfileInput = z.infer<typeof RestaurantProfileSchema>;
