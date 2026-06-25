# Garnish Frontend Redesign — Session Summary

## Context
Garnish is a two-sided marketplace (Next.js 16, React 19, Tailwind v4, shadcn `base-nova`, Supabase) connecting restaurants with food UGC creators. This session covered a full visual redesign from a flat, generic theme into an Airbnb-style, photo-forward marketplace anchored on Claude's clay-orange accent color.

## Design system
- **Color**: Claude clay-orange primary (`oklch(0.63 0.13 40)`), warm "paper" off-white background, no gradients anywhere (removed `--gradient-hero` and converted `GradientAvatar` from CSS gradients to flat solid colors per explicit request).
- **Typography**: Inter (sans/body) + Fraunces (serif display headlines) + Geist Mono, loaded via `next/font/google` in `layout.tsx`.
- **Shape/depth**: `--radius: 0.625rem`, custom warm soft-shadow utilities (`shadow-card`, `shadow-card-lg`).
- **Copy rule**: no em dashes anywhere in user-facing text.
- **No emoji**: all emoji usage removed app-wide (the only instances, 🎥/🍽️ on the signup page, were swapped for lucide `Video`/`UtensilsCrossed` icons).

## Card redesigns (the recurring theme of this session)
The user repeatedly flagged cards as "looks AI generated" and pushed for iteration:
1. **Testimonials** — modeled on a "Tanj"-style reference (white cards, serif headline, avatar+name footer). Final version uses a **hover-triggered** orange wash overlay (`group/t` + `opacity-0 group-hover/t:opacity-100`) rather than a fixed "featured" card, per explicit correction.
2. **RestaurantCard** — rebuilt using a 21st.dev `PlaceCard` reference: real `framer-motion` spring hover (`whileHover={{ y: -6, scale: 1.01 }}`), an `AnimatePresence` image carousel with chevron nav + pagination dots, overlay badges (cuisine, collab type, star rating), "Top rated" badge, and a CTA button row.
3. **CreatorCard** — stat-led card with a cover photo, `GradientAvatar` overlapping the cover via negative margin, follower/engagement/location stats, niche tag chips, and a rate + CTA row.
4. **Landing page sections** ("How it works", "For both sides", CTA) — moved away from generic icon-tile/color-block grids:
   - "How it works" → editorial layout with large serif numerals (`01`–`04`) over thin top rules.
   - "For both sides" → alternating real-photo `FeatureRow` sections (restaurant interior / food spread) instead of flat color blocks.
   - CTA → asymmetric panel with two distinct role buttons instead of a centered single-CTA slab.

## Supporting infrastructure
- `src/lib/images.ts` — deterministic seeded helpers (`pickImages`, `ratingFor`, `isTopRated`, `foodImage`) that assign consistent Unsplash stock photos and placeholder ratings per entity name, avoiding randomness on re-render.
- `src/components/Nav.tsx` — sticky translucent header, pill nav links, native `<details>` avatar dropdown (no client JS needed).
- `src/components/FilterSidebar.tsx` — chip-style radio filters for niche/follower-tier/collab-type.
- `ProposalStatusBadge` / `MatchCard` — enum statuses mapped to color-coded badge variants (warning/brand/success/destructive/outline) with lucide icons.

## Verification approach
- `npm run build` fails in this sandbox (missing native SWC binary — environment limitation, not a code issue). `npx tsc --noEmit` is the standard correctness check instead.
- Visual verification via Claude Preview MCP tools (`preview_screenshot`, `preview_console_logs`, `preview_resize`) against the running dev server.
- A disposable `/carddemo` route + temporary `proxy.ts` allowlist entry was used to view auth-gated cards without a real session, always cleaned up afterward.

## Open item (in progress when this summary was requested)
The user shared a 21st.dev `ServiceCard` reference component (bold color-block variants — red/blue/gray — with a decorative image and arrow CTA, using `framer-motion` + `class-variance-authority`) and said "I like how the colors pop on this card." All required dependencies (`framer-motion`, `lucide-react`, `class-variance-authority`) are already installed, and the shadcn component path is confirmed at `src/components/ui/`.

**Still undecided**: where in Garnish this card style should be applied. Options proposed but not yet answered by the user:
- A new "Why Garnish" benefits section on the landing page.
- A "Browse by category" section linking into filtered Discover results.
- Redoing the "How it works" steps with this color-card treatment instead of the numeral layout.
- Just adding the component to the library now, to be placed later.

Note: the reference component's literal `red-500`/`blue-500` Tailwind colors would need to be re-mapped to Garnish's warm, no-gradient, clay-orange-anchored palette before use, consistent with the rest of this session's design decisions.

## Files touched this session (non-exhaustive, most relevant)
`src/app/globals.css`, `src/app/layout.tsx`, `src/components/Wordmark.tsx`, `src/components/GradientAvatar.tsx`, `src/lib/images.ts`, `src/components/RestaurantCard.tsx`, `src/components/CreatorCard.tsx`, `src/components/ProposalStatusBadge.tsx`, `src/components/MatchCard.tsx`, `src/components/Nav.tsx`, `src/components/NavLink.tsx`, `src/components/FilterSidebar.tsx`, `src/app/page.tsx`, `src/app/auth/signup/page.tsx`, plus earlier restyles across `discover`, `profile/[id]`, `proposals`, `proposals/[id]`, `proposals/new/[profileId]`, `matches`, `matches/[id]`, `auth/login`, `onboarding/creator`, `onboarding/restaurant`, `ProposalForm.tsx`.
