import { cn } from "@/lib/utils";
import { Inbox, AlertCircle, WifiOff, PackageX } from "lucide-react";
import { Button } from "./button";

export function LoadingSpinner({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted",
        className
      )}
    >
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin-slow" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-white p-4">
          <div className="skeleton mb-4 aspect-square w-full" />
          <div className="skeleton mb-2 h-4 w-3/4" />
          <div className="skeleton mb-4 h-3 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = "inbox",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: "inbox" | "stock" | "error" | "network";
}) {
  const Icon =
    icon === "stock"
      ? PackageX
      : icon === "error"
        ? AlertCircle
        : icon === "network"
          ? WifiOff
          : Inbox;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-muted">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon="error"
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      }
    />
  );
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-white">
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-10 w-10 items-center justify-center text-lg text-muted transition hover:bg-slate-50 disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-10 text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-10 w-10 items-center justify-center text-lg text-muted transition hover:bg-slate-50 disabled:opacity-40"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
