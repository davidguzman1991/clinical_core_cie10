"use client";

import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} className="pointer-events-auto w-full max-w-sm">
          <ToastTitle>{toast.title}</ToastTitle>
          {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
        </Toast>
      ))}
    </div>
  );
}
