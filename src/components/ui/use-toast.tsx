"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "default" | "destructive";

export type ToastData = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastInput = Omit<ToastData, "id"> & { duration?: number };

type ToastContextValue = {
  toasts: ToastData[];
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timeoutRef = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    if (timeoutRef.current[id]) {
      window.clearTimeout(timeoutRef.current[id]);
      delete timeoutRef.current[id];
    }
  }, []);

  const toast = useCallback(
    ({ duration = 2200, ...input }: ToastInput) => {
      const id = createToastId();
      const nextToast: ToastData = { id, ...input };

      setToasts((prev) => [...prev.slice(-2), nextToast]);

      timeoutRef.current[id] = window.setTimeout(() => {
        dismiss(id);
      }, duration);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ toasts, toast, dismiss }),
    [dismiss, toast, toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
