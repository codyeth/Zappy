import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Server-only Supabase client with service role.
 * Use only in server actions / API routes. Never expose to the client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
