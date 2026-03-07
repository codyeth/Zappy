import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

const PLACEHOLDER = "https://placeholder.supabase.co";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  if (typeof window !== "undefined" && (url === PLACEHOLDER || !url)) {
    console.error(
      "[Zappy] NEXT_PUBLIC_SUPABASE_URL chưa được set. Thêm biến môi trường trong Vercel (hoặc .env.local khi chạy local)."
    );
  }
  return createBrowserClient<Database>(url, key);
}
