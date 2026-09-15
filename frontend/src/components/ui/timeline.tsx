import { cn, formatStatusLabel } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { Check } from "lucide-react";

const FLOW: OrderStatus[] = [
  "ALLOCATED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="space-y-4">
        <TimelineStep
          label="Allocated"
          done
          active={false}
        />
        <TimelineStep label="Cancelled" done active danger />
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <div className="space-y-0">
      {FLOW.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const isLast = index === FLOW.length - 1;
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                  done && "border-success bg-success text-white",
                  active && "border-primary bg-primary text-white",
                  !done && !active && "border-slate-200 bg-white text-slate-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "my-1 w-0.5 flex-1 min-h-8",
                    done ? "bg-success" : "bg-slate-200"
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-primary" : done ? "text-foreground" : "text-muted"
                )}
              >
                {formatStatusLabel(step)}
              </p>
              {active ? (
                <p className="mt-0.5 text-xs text-muted">Current status</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineStep({
  label,
  done,
  active,
  danger,
}: {
  label: string;
  done: boolean;
  active: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2",
          danger && "border-danger bg-danger text-white",
          done && !danger && "border-success bg-success text-white",
          active && !danger && "border-primary bg-primary text-white"
        )}
      >
        <Check className="h-4 w-4" />
      </div>
      <p
        className={cn(
          "text-sm font-semibold",
          danger ? "text-danger" : "text-foreground"
        )}
      >
        {label}
      </p>
    </div>
  );
}

export function StatusDot({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const colors = {
    neutral: "bg-slate-400",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  };
  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground">
      <span className={cn("h-2 w-2 rounded-full", colors[tone])} />
      {label}
    </span>
  );
}
