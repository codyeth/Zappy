"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
  onSuccess?: () => void;
}

export default function AuthModal({
  open,
  onClose,
  defaultMode = "login",
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const reset = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setDisplayName("");
    setError(null);
    setMode(defaultMode);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const authErrorMsg = (err: { message?: string; error_code?: string } | null) => {
    if (!err) return null;
    if (err.message?.includes("provider is not enabled") || err.error_code === "validation_failed") {
      return "Provider chưa bật. Vào Supabase Dashboard → Authentication → Providers → bật Email và/hoặc Google.";
    }
    return err.message ?? "Có lỗi xảy ra.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(authErrorMsg(err) ?? err.message);
      return;
    }
    handleClose();
    onSuccess?.();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          preferred_username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 25),
          full_name: displayName.trim().slice(0, 50) || username.trim(),
        },
      },
    });
    setLoading(false);
    if (err) {
      setError(authErrorMsg(err) ?? err.message);
      return;
    }
    handleClose();
    onSuccess?.();
  };

  const handleGoogle = async () => {
    setError(null);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${baseUrl}/auth/callback` },
    });
    if (err) setError(authErrorMsg(err) ?? err.message);
    else handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900">
          {mode === "login" ? "Log in" : "Sign up"}
        </h2>

        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-4 space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-lg bg-red-500 py-2.5 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              )}
            >
              Log in
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={INPUT_CLASS}
              required
              autoComplete="username"
              minLength={2}
              maxLength={30}
            />
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={INPUT_CLASS}
              autoComplete="name"
              maxLength={50}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-500 py-2.5 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              Sign up
            </button>
          </form>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Continue with Google
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          {mode === "login" ? (
            <>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-red-500 hover:underline"
              >
                Sign up
              </button>
              <span className="text-gray-400">·</span>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-red-500 hover:underline"
              >
                Log in
              </button>
              <span className="text-gray-400">·</span>
            </>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
