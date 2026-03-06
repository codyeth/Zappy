"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (!code) {
      setStatus("error");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setStatus("error");
          return;
        }
        const base = typeof window !== "undefined" ? window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : "";
        window.location.href = base + next;
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center">
          <p className="font-semibold text-red-700">Authentication failed</p>
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`} className="mt-2 inline-block text-red-600 underline">Back to Zappy</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Signing you in...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
