"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (input: {
    title: string;
    description?: string;
    tone?: ToastTone;
  }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const tones = {
  success: "border-green-200 bg-white",
  error: "border-red-200 bg-white",
  info: "border-blue-200 bg-white",
  warning: "border-amber-200 bg-white",
};

const iconTones = {
  success: "text-success",
  error: "text-danger",
  info: "text-info",
  warning: "text-warning",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback(
    (input: { title: string; description?: string; tone?: ToastTone }) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [
        ...prev,
        {
          id,
          title: input.title,
          description: input.description,
          tone: input.tone || "info",
        },
      ]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(100%-2rem,360px)] flex-col gap-2">
        {items.map((item) => {
          const Icon = icons[item.tone];
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto animate-fade-in rounded-xl border p-3 shadow-[var(--shadow)]",
                tones[item.tone]
              )}
            >
              <div className="flex gap-3">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconTones[item.tone])} />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs text-muted">{item.description}</p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
