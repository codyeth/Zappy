"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteAccount(): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    return { error: error?.message ?? null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to delete account. Ensure SUPABASE_SERVICE_ROLE_KEY is set.";
    return { error: msg };
  }
}
