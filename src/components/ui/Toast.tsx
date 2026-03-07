"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "info" | "warning" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
}

const VARIANT_BORDER: Record<ToastVariant, string> = {
  success: "border-l-green-500",
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
  error: "border-l-red-500",
};

function Toast({ message, variant = "info", onClose, duration = 2500 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div
        className={cn(
          "bg-white text-gray-900 text-sm font-medium px-5 py-3 rounded-lg shadow-lg border-l-4 whitespace-nowrap",
          VARIANT_BORDER[variant]
        )}
      >
        {message}
      </div>
    </div>
  );
}

// ─── Toast Manager hook ───────────────────────────────────────────────────────

type ToastEntry = { id: number; message: string; variant?: ToastVariant };

export function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, variant?: ToastVariant) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, variant: variant ?? "info" }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = () =>
    typeof window !== "undefined"
      ? createPortal(
          <>
            {toasts.map((t) => (
              <Toast
                key={t.id}
                message={t.message}
                variant={t.variant}
                onClose={() => removeToast(t.id)}
              />
            ))}
          </>,
          document.body
        )
      : null;

  return { showToast, ToastContainer };
}
