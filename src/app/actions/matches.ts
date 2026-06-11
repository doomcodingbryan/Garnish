"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function confirmMatch(matchId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) throw new Error("Match not found");
  if (match.creator_id !== user.id && match.restaurant_id !== user.id) {
    throw new Error("Not a party to this match");
  }

  const isCreator = match.creator_id === user.id;
  const isRestaurant = match.restaurant_id === user.id;

  if (isCreator && match.creator_confirmed_at) throw new Error("Already confirmed");
  if (isRestaurant && match.restaurant_confirmed_at) throw new Error("Already confirmed");

  const now = new Date().toISOString();
  const updates: Record<string, string> = {};
  if (isCreator) updates.creator_confirmed_at = now;
  if (isRestaurant) updates.restaurant_confirmed_at = now;

  const newCreatorConfirmed = isCreator ? now : match.creator_confirmed_at;
  const newRestaurantConfirmed = isRestaurant ? now : match.restaurant_confirmed_at;

  let status: string;
  if (newCreatorConfirmed && newRestaurantConfirmed) {
    status = "confirmed";
  } else if (newCreatorConfirmed) {
    status = "pending_restaurant";
  } else {
    status = "pending_creator";
  }

  const { error } = await supabase
    .from("matches")
    .update({ ...updates, status })
    .eq("id", matchId);

  if (error) throw new Error(error.message);
  redirect(`/matches/${matchId}`);
}
