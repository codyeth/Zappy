"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

function Toast({ message, onClose, duration = 2500 }: ToastProps) {
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
      <div className="bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl whitespace-nowrap">
        {message}
      </div>
    </div>
  );
}

// ─── Toast Manager hook ───────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = () =>
    typeof window !== "undefined"
      ? createPortal(
          <>
            {toasts.map((t) => (
              <Toast key={t.id} message={t.message} onClose={() => removeToast(t.id)} />
            ))}
          </>,
          document.body
        )
      : null;

  return { showToast, ToastContainer };
}
