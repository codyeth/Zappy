"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/lib/supabase/helpers";
import type { Profile } from "@/lib/types";
import AuthModal from "@/components/auth/AuthModal";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  openAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const supabase = createClient();

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState((s) => ({ ...s, profile: null }));
      return;
    }
    const profile = await getProfile(supabase, user.id);
    setState((s) => ({ ...s, profile }));
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ user: null, profile: null, loading: false });
        return;
      }
      const profile = await getProfile(supabase, user.id);
      setState({ user, profile, loading: false });
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        if (!user) {
          setState({ user: null, profile: null, loading: false });
          return;
        }
        const profile = await getProfile(supabase, user.id);
        setState({ user, profile, loading: false });
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, profile: null, loading: false });
  }, [supabase]);

  const value: AuthContextValue = {
    ...state,
    signOut,
    refreshProfile,
    authModalOpen,
    setAuthModalOpen,
    openAuthModal: () => setAuthModalOpen(true),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
