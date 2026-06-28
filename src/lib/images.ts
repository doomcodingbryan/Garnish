// Stable, widely-used Unsplash food / restaurant photos used as stock imagery
// for cards until real uploads exist. Picked deterministically per entity so a
// given restaurant or creator always shows the same photos.
export const FOOD_IMAGES = [
  "photo-1504674900247-0877df9cc836", // food spread on table
  "photo-1414235077428-338989a2e8c0", // fine dining plate
  "photo-1517248135467-4c7edcad34c4", // restaurant interior
  "photo-1546069901-ba9599a7e63c", // salad bowl
  "photo-1565299624946-b28f40a0ae38", // burger
  "photo-1555396273-367ea4eb4db5", // restaurant dish
  "photo-1559339352-11d035aa65de", // plated table setting
  "photo-1466978913421-dad2ebd01d17", // latte
  "photo-1551782450-a2132b4ba21d", // grill / bbq
  "photo-1540189549336-e6e99c3679fe", // healthy bowl
] as const;

export function foodImage(id: string, w = 800): string {
  return `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;
}

export function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickImages(seed: string, count = 3): string[] {
  const start = hash(seed) % FOOD_IMAGES.length;
  return Array.from({ length: count }, (_, i) =>
    foodImage(FOOD_IMAGES[(start + i) % FOOD_IMAGES.length])
  );
}

// Stable display rating (4.3 - 4.9) derived from a seed. Placeholder until
// real review data exists.
export function ratingFor(seed: string): number {
  return Math.round((4.3 + (hash(seed) % 7) / 10) * 10) / 10;
}

export function isTopRated(seed: string): boolean {
  return ratingFor(seed) >= 4.8;
}
