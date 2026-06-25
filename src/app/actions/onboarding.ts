"use server";

import { createClient } from "@/lib/supabase/server";
import { CreatorProfileSchema } from "@/lib/validations/creator";
import { RestaurantProfileSchema } from "@/lib/validations/restaurant";
import { syncCreatorScore } from "@/app/actions/scoring";
import type { PlatformKind } from "@/types/database";
import { redirect } from "next/navigation";

export async function saveCreatorProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = {
    bio: formData.get("bio"),
    instagram_handle: formData.get("instagram_handle"),
    tiktok_handle: formData.get("tiktok_handle"),
    youtube_handle: formData.get("youtube_handle"),
    follower_count: formData.get("follower_count"),
    engagement_rate: formData.get("engagement_rate"),
    niche_tags: formData.getAll("niche_tags"),
    flat_rate_cents: formData.get("flat_rate_cents")
      ? Math.round(Number(formData.get("flat_rate_cents")) * 100)
      : undefined,
    location: formData.get("location"),
  };

  const parsed = CreatorProfileSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { data: creator, error: upsertError } = await supabase
    .from("creator_profiles")
    .upsert({ user_id: user.id, ...parsed.data }, { onConflict: "user_id" })
    .select("id")
    .single();
  if (upsertError) throw new Error(upsertError.message);

  // Sync the connected-platform rows (one per non-empty handle) that feed the
  // UGC Score. Omit source/metrics from the upsert so a prior API sync isn't
  // clobbered; absent handles get their platform row removed.
  const creatorId = (creator as { id: string }).id;
  const handles: { platform: PlatformKind; handle?: string }[] = [
    { platform: "instagram", handle: parsed.data.instagram_handle },
    { platform: "tiktok", handle: parsed.data.tiktok_handle },
    { platform: "youtube", handle: parsed.data.youtube_handle },
  ];
  for (const { platform, handle } of handles) {
    if (handle) {
      await supabase
        .from("creator_platforms")
        .upsert(
          { creator_id: creatorId, platform, handle },
          { onConflict: "creator_id,platform" }
        );
    } else {
      await supabase
        .from("creator_platforms")
        .delete()
        .eq("creator_id", creatorId)
        .eq("platform", platform);
    }
  }

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);
  if (profileError) throw new Error(profileError.message);

  // Compute an initial score so the creator shows up scored immediately.
  try {
    await syncCreatorScore(creatorId);
  } catch (e) {
    console.error("saveCreatorProfile: initial score sync failed", e);
  }

  redirect("/discover");
}

export async function saveRestaurantProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = {
    name: formData.get("name"),
    cuisine: formData.get("cuisine"),
    location: formData.get("location"),
    aesthetic_description: formData.get("aesthetic_description"),
    collab_types: formData.getAll("collab_types"),
    description: formData.get("description"),
    is_accepting_collabs: formData.get("is_accepting_collabs") === "true",
  };

  const parsed = RestaurantProfileSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { error: upsertError } = await supabase
    .from("restaurant_profiles")
    .upsert({ user_id: user.id, ...parsed.data });
  if (upsertError) throw new Error(upsertError.message);

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);
  if (profileError) throw new Error(profileError.message);

  redirect("/discover");
}
