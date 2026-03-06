/**
 * Auth helpers — Google OAuth + email/password flows via Supabase Auth.
 * All functions use the browser client (called from client components).
 */

import { createClient } from "./client";

export async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
  return { error: error?.message ?? null };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
  return { error: error?.message ?? null };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
