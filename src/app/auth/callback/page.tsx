"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const EXCHANGE_TIMEOUT_MS = 15_000;

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error" | "timeout">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (!code) {
      done.current = true;
      setStatus("error");
      setErrorMsg("Thiếu mã xác thực. Thử đăng nhập lại.");
      return;
    }

    const supabase = createClient();
    const timeoutId = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      setStatus("timeout");
    }, EXCHANGE_TIMEOUT_MS);

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (done.current) return;
        clearTimeout(timeoutId);
        if (error) {
          done.current = true;
          setErrorMsg(error.message);
          setStatus("error");
          return;
        }
        done.current = true;
        const base = typeof window !== "undefined" ? window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : "";
        window.location.replace(base + next);
      })
      .catch((err) => {
        if (done.current) return;
        clearTimeout(timeoutId);
        done.current = true;
        setErrorMsg(err?.message ?? "Lỗi kết nối. Thử lại.");
        setStatus("error");
      });

    return () => clearTimeout(timeoutId);
  }, [searchParams]);

  if (status === "error" || status === "timeout") {
    const base = typeof window !== "undefined" ? window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : "";
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center max-w-md">
          <p className="font-semibold text-red-700">
            {status === "timeout" ? "Đăng nhập quá lâu" : "Đăng nhập thất bại"}
          </p>
          {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
          {status === "timeout" && (
            <p className="mt-2 text-sm text-gray-600">Kiểm tra kết nối mạng hoặc thử đăng nhập lại.</p>
          )}
          <a href={base || "/"} className="mt-4 inline-block rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <p className="text-gray-500">Signing you in...</p>
      <p className="text-xs text-gray-400">Nếu treo quá 15 giây, trang sẽ tự báo lỗi.</p>
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
