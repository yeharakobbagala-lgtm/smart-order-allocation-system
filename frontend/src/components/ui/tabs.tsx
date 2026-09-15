"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { label: string; value: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto rounded-xl border border-border bg-slate-50 p-1",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition",
              active
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-xs",
                  active ? "bg-primary-soft text-primary" : "bg-slate-200"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
