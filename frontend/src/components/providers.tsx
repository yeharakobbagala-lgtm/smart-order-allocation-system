"use client";

import { AuthProvider } from "@/context/auth-context";
import { AppProvider } from "@/context/app-context";
import { ToastProvider } from "@/context/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
