"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ProposalSchema, CounterSchema } from "@/lib/validations/proposal";
import { getActiveTerms } from "@/lib/utils";
import { redirect } from "next/navigation";
import type { UserRole, Proposal } from "@/types/database";

export async function createProposal(recipientId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = {
    meal_description: formData.get("meal_description"),
    deliverables: formData.get("deliverables"),
    posting_window_days: formData.get("posting_window_days"),
    payment_dollars: formData.get("payment_dollars"),
    message: formData.get("message"),
  };

  const parsed = ProposalSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { data: myProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!myProfile) throw new Error("Profile not found");

  const initiatorRole = myProfile.role as UserRole;
  const creator_id = initiatorRole === "creator" ? user.id : recipientId;
  const restaurant_id = initiatorRole === "restaurant" ? user.id : recipientId;

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      initiator_id: user.id,
      recipient_id: recipientId,
      initiator_role: initiatorRole,
      creator_id,
      restaurant_id,
      meal_description: parsed.data.meal_description ?? null,
      deliverables: parsed.data.deliverables,
      posting_window_days: parsed.data.posting_window_days,
      payment_cents: Math.round(parsed.data.payment_dollars * 100),
      message: parsed.data.message ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/proposals/${data.id}`);
}

export async function counterProposal(proposalId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", proposalId)
    .single();

  if (!proposal) throw new Error("Proposal not found");
  if (proposal.recipient_id !== user.id) throw new Error("Only the recipient can counter");
  if (proposal.status !== "pending") throw new Error("Can only counter a pending proposal");
  if (proposal.counter_count >= 1) throw new Error("Counter limit reached");

  const raw = {
    meal_description: formData.get("meal_description"),
    deliverables: formData.get("deliverables"),
    posting_window_days: formData.get("posting_window_days"),
    payment_dollars: formData.get("payment_dollars"),
    message: formData.get("message"),
  };

  const parsed = CounterSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { data: myProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const counter_terms = {
    meal_description: parsed.data.meal_description ?? null,
    deliverables: parsed.data.deliverables,
    posting_window_days: parsed.data.posting_window_days,
    payment_cents: Math.round(parsed.data.payment_dollars * 100),
    message: parsed.data.message ?? null,
    countered_by_role: myProfile!.role as UserRole,
  };

  const { error } = await supabase
    .from("proposals")
    .update({
      status: "countered",
      counter_count: 1,
      counter_terms,
      recipient_id: proposal.initiator_id,
    })
    .eq("id", proposalId);

  if (error) throw new Error(error.message);
  redirect(`/proposals/${proposalId}`);
}

export async function acceptProposal(proposalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", proposalId)
    .single();

  if (!proposal) throw new Error("Proposal not found");
  if (proposal.recipient_id !== user.id) throw new Error("Only the current recipient can accept");
  if (!["pending", "countered"].includes(proposal.status)) {
    throw new Error("Proposal cannot be accepted in its current state");
  }

  // Use service client for atomic accept + match creation
  const service = createServiceClient();
  const { error } = await service.rpc("accept_proposal_and_create_match", {
    p_proposal_id: proposalId,
  });
  if (error) throw new Error(error.message);

  redirect(`/matches`);
}

export async function declineProposal(proposalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: proposal } = await supabase
    .from("proposals")
    .select("recipient_id, status")
    .eq("id", proposalId)
    .single();

  if (!proposal) throw new Error("Proposal not found");
  if (proposal.recipient_id !== user.id) throw new Error("Only the recipient can decline");
  if (!["pending", "countered"].includes(proposal.status)) {
    throw new Error("Proposal cannot be declined in its current state");
  }

  const { error } = await supabase
    .from("proposals")
    .update({ status: "declined" })
    .eq("id", proposalId);

  if (error) throw new Error(error.message);
  redirect("/proposals");
}

export async function withdrawProposal(proposalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: proposal } = await supabase
    .from("proposals")
    .select("initiator_id, status")
    .eq("id", proposalId)
    .single();

  if (!proposal) throw new Error("Proposal not found");
  if (proposal.initiator_id !== user.id) throw new Error("Only the initiator can withdraw");
  if (proposal.status !== "pending") throw new Error("Can only withdraw a pending proposal");

  const { error } = await supabase
    .from("proposals")
    .update({ status: "withdrawn" })
    .eq("id", proposalId);

  if (error) throw new Error(error.message);
  redirect("/proposals");
}
