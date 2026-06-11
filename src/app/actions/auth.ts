"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const display_name = formData.get("display_name") as string;
  const role = formData.get("role") as UserRole;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) throw new Error(error?.message ?? "Signup failed");

  // Use service client — the new user has no session yet so RLS would block the insert
  const service = createServiceClient();
  const { error: profileError } = await service.from("user_profiles").insert({
    id: data.user.id,
    role,
    display_name,
    onboarding_complete: false,
  });
  if (profileError) throw new Error(profileError.message);

  redirect(`/onboarding/${role}`);
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  redirect("/discover");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
